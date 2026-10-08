import { supabase } from '../auth/supabaseClient'
import type { StudioInvitationSummary } from './studioInvitationIndex'

export type StudioInvitationLifecycleAction = 'pause' | 'reactivate' | 'archive' | 'restore'
export type StudioInvitationLifecycleStatus = 'draft' | 'published' | 'paused' | 'archived'

export type StudioInvitationLifecycleResult = {
  readonly projectId: string
  readonly status: StudioInvitationLifecycleStatus
  readonly updatedAt: string
}

export type StudioInvitationLifecycleOption = {
  readonly action: StudioInvitationLifecycleAction
  readonly label: string
  readonly confirmation: string
  readonly destructive?: boolean
}

const actionOptions: Readonly<Record<StudioInvitationLifecycleAction, StudioInvitationLifecycleOption>> = {
  pause: {
    action: 'pause',
    label: 'Pausar invitación',
    confirmation: 'El enlace dejará de estar disponible hasta que reactives la invitación.',
  },
  reactivate: {
    action: 'reactivate',
    label: 'Reactivar invitación',
    confirmation: 'El enlace volverá a estar disponible con la versión publicada actual.',
  },
  archive: {
    action: 'archive',
    label: 'Archivar invitación',
    confirmation: 'El enlace dejará de estar disponible y la invitación pasará a Archivadas. Podrás restaurarla.',
    destructive: true,
  },
  restore: {
    action: 'restore',
    label: 'Restaurar invitación',
    confirmation: 'La invitación volverá al panel sin publicarse automáticamente.',
  },
}

export function getStudioInvitationLifecycleOptions(
  invitation: Pick<StudioInvitationSummary, 'availability'>,
): readonly StudioInvitationLifecycleOption[] {
  if (invitation.availability === 'online') return [actionOptions.pause, actionOptions.archive]
  if (invitation.availability === 'paused') return [actionOptions.reactivate, actionOptions.archive]
  if (invitation.availability === 'archived') return [actionOptions.restore]
  return [actionOptions.archive]
}

export class StudioInvitationLifecycleError extends Error {
  constructor(message = 'No pudimos actualizar la invitación. Intentá nuevamente.') {
    super(message)
    this.name = 'StudioInvitationLifecycleError'
  }
}

const lifecycleStatusPresentation: Readonly<Record<StudioInvitationLifecycleStatus, Pick<StudioInvitationSummary,
  'availability' | 'projectStatusLabel'>>> = {
  draft: { availability: 'offline', projectStatusLabel: 'Borrador' },
  published: { availability: 'online', projectStatusLabel: 'Publicada' },
  paused: { availability: 'paused', projectStatusLabel: 'Pausada' },
  archived: { availability: 'archived', projectStatusLabel: 'Archivada' },
}

function isLifecycleResult(value: unknown): value is StudioInvitationLifecycleResult {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.projectId === 'string'
    && typeof candidate.updatedAt === 'string'
    && Number.isFinite(Date.parse(candidate.updatedAt))
    && typeof candidate.status === 'string'
    && candidate.status in lifecycleStatusPresentation
}

export function applyStudioInvitationLifecycleResult(
  invitation: StudioInvitationSummary,
  result: StudioInvitationLifecycleResult,
): StudioInvitationSummary {
  if (invitation.projectId !== result.projectId) return invitation
  const presentation = lifecycleStatusPresentation[result.status]
  return {
    ...invitation,
    availability: presentation.availability,
    projectStatus: result.status,
    projectStatusLabel: presentation.projectStatusLabel,
    updatedAt: result.updatedAt,
  }
}

export async function updateStudioInvitationLifecycle(
  projectId: string,
  action: StudioInvitationLifecycleAction,
): Promise<StudioInvitationLifecycleResult> {
  if (!supabase) throw new StudioInvitationLifecycleError('Supabase no está configurado.')
  const { data, error } = await supabase.rpc('set_invitation_lifecycle', {
    p_project_id: projectId,
    p_action: action,
  })
  if (error) throw new StudioInvitationLifecycleError(error.message)
  if (!isLifecycleResult(data) || data.projectId !== projectId) throw new StudioInvitationLifecycleError()
  return data
}
