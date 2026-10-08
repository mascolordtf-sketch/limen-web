import { supabase } from '../auth/supabaseClient'
import type { StudioInvitationSummary } from './studioInvitationIndex'

export type StudioInvitationLifecycleAction = 'pause' | 'reactivate' | 'archive' | 'restore'

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

export async function updateStudioInvitationLifecycle(
  projectId: string,
  action: StudioInvitationLifecycleAction,
): Promise<void> {
  if (!supabase) throw new StudioInvitationLifecycleError('Supabase no está configurado.')
  const { error } = await supabase.rpc('set_invitation_lifecycle', {
    p_project_id: projectId,
    p_action: action,
  })
  if (error) throw new StudioInvitationLifecycleError(error.message)
}
