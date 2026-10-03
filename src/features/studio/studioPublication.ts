import type { PublicationStatus } from '../platform/dataModel'
import { publicationStatuses } from '../platform/dataModel'
import { supabase } from '../auth/supabaseClient'
import type { StudioSaveStatus } from './studioAutosave'

export type StudioPublicationSummary = {
  readonly id: string
  readonly revision: number
  readonly draftRevision: number
  readonly status: PublicationStatus
  readonly publishedAt: string
}

export type StudioPublicationState = {
  readonly status: 'idle' | 'publishing' | 'success' | 'error'
  readonly message?: string
}

type StudioPublicationReadiness = {
  readonly persisted: boolean
  readonly draftRevision?: number
  readonly dirty: boolean
  readonly hasTemporaryMedia: boolean
  readonly invitationValid: boolean
  readonly editoriallyConfirmed: boolean
  readonly saveStatus: StudioSaveStatus
  readonly latestPublication?: StudioPublicationSummary
}

export class StudioPublicationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StudioPublicationError'
  }
}

const publicationErrorMessages = new Set([
  'Tu sesión no está disponible.',
  'Tu cuenta no puede publicar invitaciones.',
  'No encontramos el proyecto que querés publicar.',
  'Guardá el borrador antes de publicarlo.',
  'El borrador cambió. Esperá a que termine de guardarse y volvé a intentar.',
  'Esta revisión del borrador ya tiene una publicación.',
  'La invitación no supera la validación estructural para publicar.',
  'Hay archivos privados que no están listos para publicar.',
])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const toPublicationSummary = (value: unknown): StudioPublicationSummary => {
  if (!isRecord(value)
    || typeof value.id !== 'string'
    || typeof value.revision !== 'number'
    || typeof value.draftRevision !== 'number'
    || typeof value.status !== 'string'
    || !publicationStatuses.includes(value.status as PublicationStatus)
    || typeof value.publishedAt !== 'string') {
    throw new StudioPublicationError('La publicación se creó, pero recibimos una respuesta inesperada. Recargá Studio.')
  }
  return {
    id: value.id,
    revision: value.revision,
    draftRevision: value.draftRevision,
    status: value.status as PublicationStatus,
    publishedAt: value.publishedAt,
  }
}

export function getStudioPublicationBlockReason({
  persisted,
  draftRevision,
  dirty,
  hasTemporaryMedia,
  invitationValid,
  editoriallyConfirmed,
  saveStatus,
  latestPublication,
}: StudioPublicationReadiness): string | undefined {
  if (!persisted || draftRevision === undefined) return 'Guardá el borrador antes de crear una publicación.'
  if (saveStatus === 'saving') return 'Esperá a que termine el guardado actual.'
  if (saveStatus === 'conflict') return 'Resolvé el conflicto de edición antes de publicar.'
  if (saveStatus === 'error') return 'Volvé a guardar el borrador antes de publicar.'
  if (dirty) return 'Esperá al autoguardado o usá Guardar antes de publicar.'
  if (hasTemporaryMedia) return 'Esperá a que terminen de guardarse los archivos.'
  if (!invitationValid) return 'Corregí los errores activos antes de publicar.'
  if (latestPublication?.draftRevision === draftRevision) return 'Esta revisión ya tiene una publicación.'
  if (!editoriallyConfirmed) return 'Confirmá la revisión editorial de esta versión.'
  return undefined
}

export async function loadLatestStudioPublication(projectId: string): Promise<StudioPublicationSummary | undefined> {
  if (!supabase) throw new StudioPublicationError('Supabase no está configurado.')
  const { data, error } = await supabase
    .from('invitation_publications')
    .select('id, revision, draft_revision, status, published_at')
    .eq('project_id', projectId)
    .order('revision', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new StudioPublicationError('No pudimos recuperar el estado de publicación.')
  if (!data) return undefined
  if (!publicationStatuses.includes(data.status as PublicationStatus)) {
    throw new StudioPublicationError('La publicación guardada tiene un estado desconocido.')
  }
  return {
    id: data.id,
    revision: data.revision,
    draftRevision: data.draft_revision,
    status: data.status as PublicationStatus,
    publishedAt: data.published_at,
  }
}

export async function publishStudioDraft(
  projectId: string,
  expectedDraftRevision: number,
): Promise<StudioPublicationSummary> {
  if (!supabase) throw new StudioPublicationError('Supabase no está configurado.')
  const { data, error } = await supabase.rpc('publish_invitation_draft', {
    p_project_id: projectId,
    p_expected_draft_revision: expectedDraftRevision,
  })
  if (error || !data) {
    const safeMessage = error?.message && publicationErrorMessages.has(error.message)
      ? error.message
      : 'No pudimos crear la publicación.'
    throw new StudioPublicationError(safeMessage)
  }
  return toPublicationSummary(data)
}
