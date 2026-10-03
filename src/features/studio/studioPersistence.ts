import type { PostgrestError } from '@supabase/supabase-js'

import { currentProjectSchemaVersion } from '../platform/dataModel'
import type { Json } from '../platform/database.types'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { supabase } from '../auth/supabaseClient'
import type { Origin01StudioDraft } from './origin01StudioDraft'

export type StudioDraftLocation = {
  readonly projectId: string
  readonly draftId?: string
  readonly revision?: number
}

export type PersistedStudioDraft = Required<StudioDraftLocation> & {
  readonly document: Origin01InvitationData
  readonly updatedAt: string
}

export type LoadedStudioDraft = {
  readonly location?: StudioDraftLocation
  readonly persisted?: PersistedStudioDraft
}

export class StudioPersistenceError extends Error {
  constructor(
    readonly code: 'configuration' | 'load' | 'save' | 'conflict' | 'invalid_document',
    message: string,
  ) {
    super(message)
    this.name = 'StudioPersistenceError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export function isOrigin01InvitationDocument(value: Json): value is Json & Origin01InvitationData {
  if (!isRecord(value) || value.templateId !== 'origin01' || value.eventType !== 'quince') return false
  if (typeof value.id !== 'string' || typeof value.code !== 'string' || typeof value.internalName !== 'string') return false
  return isRecord(value.event) && isRecord(value.content) && Array.isArray(value.identities)
    && Array.isArray(value.modules) && Array.isArray(value.media)
}

export function hasUnpersistedStudioMedia(draft: Pick<Origin01StudioDraft, 'media'>): boolean {
  return draft.media.items.some(({ origin }) => origin === 'studio')
}

const toJson = (document: Origin01InvitationData) => document as unknown as Json

const loadError = (error: PostgrestError) => new StudioPersistenceError(
  'load',
  error.code === '42501'
    ? 'Tu cuenta no tiene permiso para abrir este proyecto.'
    : 'No pudimos recuperar el borrador guardado. Intentá nuevamente.',
)

export async function loadStudioDraft(publicCode: string): Promise<LoadedStudioDraft> {
  if (!supabase) throw new StudioPersistenceError('configuration', 'Supabase no está configurado.')

  const { data: project, error: projectError } = await supabase
    .from('invitation_projects')
    .select('id')
    .eq('public_code', publicCode)
    .maybeSingle()

  if (projectError) throw loadError(projectError)
  if (!project) return {}

  const { data: draft, error: draftError } = await supabase
    .from('invitation_drafts')
    .select('id, project_id, schema_version, revision, document, updated_at')
    .eq('project_id', project.id)
    .maybeSingle()

  if (draftError) throw loadError(draftError)
  if (!draft) return { location: { projectId: project.id } }
  if (draft.schema_version !== currentProjectSchemaVersion || !isOrigin01InvitationDocument(draft.document)) {
    throw new StudioPersistenceError(
      'invalid_document',
      'El borrador guardado usa una versión que este Studio todavía no puede editar.',
    )
  }

  const persisted = {
    projectId: draft.project_id,
    draftId: draft.id,
    revision: draft.revision,
    document: draft.document,
    updatedAt: draft.updated_at,
  }
  return { location: persisted, persisted }
}

type SaveStudioDraftInput = {
  readonly baseInvitation: Origin01InvitationData
  readonly document: Origin01InvitationData
  readonly location?: StudioDraftLocation
  readonly userId: string
}

async function createProject(baseInvitation: Origin01InvitationData, userId: string): Promise<string> {
  if (!supabase) throw new StudioPersistenceError('configuration', 'Supabase no está configurado.')
  const { data, error } = await supabase
    .from('invitation_projects')
    .insert({
      public_code: baseInvitation.code,
      internal_name: baseInvitation.internalName,
      event_type: baseInvitation.eventType,
      plan_code: 'essential',
      plan_version: 1,
      status: 'draft',
      created_by: userId,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new StudioPersistenceError(
      'save',
      error?.code === '42501'
        ? 'Tu cuenta no tiene permiso para crear proyectos.'
        : 'No pudimos crear el proyecto para esta invitación.',
    )
  }
  return data.id
}

export async function saveStudioDraft({ baseInvitation, document, location, userId }: SaveStudioDraftInput): Promise<PersistedStudioDraft> {
  if (!supabase) throw new StudioPersistenceError('configuration', 'Supabase no está configurado.')
  const projectId = location?.projectId ?? await createProject(baseInvitation, userId)
  const updatedAt = new Date().toISOString()

  if (!location?.draftId || location.revision === undefined) {
    const { data, error } = await supabase
      .from('invitation_drafts')
      .insert({
        project_id: projectId,
        schema_version: currentProjectSchemaVersion,
        revision: 1,
        document: toJson(document),
        updated_by: userId,
        updated_at: updatedAt,
      })
      .select('id, project_id, revision, document, updated_at')
      .single()
    if (error || !data) throw new StudioPersistenceError('save', 'No pudimos guardar el primer borrador.')
    return {
      projectId: data.project_id,
      draftId: data.id,
      revision: data.revision,
      document,
      updatedAt: data.updated_at,
    }
  }

  const nextRevision = location.revision + 1
  const { data, error } = await supabase
    .from('invitation_drafts')
    .update({
      schema_version: currentProjectSchemaVersion,
      revision: nextRevision,
      document: toJson(document),
      updated_by: userId,
      updated_at: updatedAt,
    })
    .eq('id', location.draftId)
    .eq('revision', location.revision)
    .select('id, project_id, revision, document, updated_at')
    .maybeSingle()

  if (error) throw new StudioPersistenceError('save', 'No pudimos guardar los cambios.')
  if (!data) {
    throw new StudioPersistenceError(
      'conflict',
      'Este borrador cambió en otra sesión. Recargá Studio antes de volver a guardar.',
    )
  }

  await supabase
    .from('invitation_projects')
    .update({ updated_at: updatedAt })
    .eq('id', projectId)

  return {
    projectId: data.project_id,
    draftId: data.id,
    revision: data.revision,
    document,
    updatedAt: data.updated_at,
  }
}
