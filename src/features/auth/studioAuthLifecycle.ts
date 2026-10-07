import type { AuthChangeEvent } from '@supabase/supabase-js'

import type { StudioAuthStatus } from './studioAuthContextValue'

export type StudioAuthEventAction = 'ignore' | 'refresh-silently' | 'signed-out'

type ResolveStudioAuthEventActionOptions = {
  currentStatus: StudioAuthStatus
  currentUserId?: string
  event: AuthChangeEvent
  sessionUserId?: string
}

export function resolveStudioAuthEventAction({
  currentStatus,
  currentUserId,
  event,
  sessionUserId,
}: ResolveStudioAuthEventActionOptions): StudioAuthEventAction {
  if (event === 'SIGNED_OUT') return 'signed-out'

  if (event === 'SIGNED_IN') {
    const sameAuthenticatedUser = currentStatus === 'authenticated'
      && Boolean(currentUserId)
      && currentUserId === sessionUserId

    return sameAuthenticatedUser ? 'ignore' : 'refresh-silently'
  }

  if (event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY' || event === 'MFA_CHALLENGE_VERIFIED') {
    return 'refresh-silently'
  }

  return 'ignore'
}
