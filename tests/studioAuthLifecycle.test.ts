import type { AuthChangeEvent } from '@supabase/supabase-js'

import { resolveStudioAuthEventAction } from '../src/features/auth/studioAuthLifecycle'
import type { StudioAuthEventAction } from '../src/features/auth/studioAuthLifecycle'

const cases: Array<{
  currentStatus: 'authenticated' | 'loading' | 'unauthenticated'
  currentUserId?: string
  event: AuthChangeEvent
  expected: StudioAuthEventAction
  sessionUserId?: string
}> = [
  { currentStatus: 'authenticated', currentUserId: 'user-1', event: 'TOKEN_REFRESHED', expected: 'ignore', sessionUserId: 'user-1' },
  { currentStatus: 'authenticated', currentUserId: 'user-1', event: 'SIGNED_IN', expected: 'ignore', sessionUserId: 'user-1' },
  { currentStatus: 'authenticated', currentUserId: 'user-1', event: 'SIGNED_IN', expected: 'refresh-silently', sessionUserId: 'user-2' },
  { currentStatus: 'loading', event: 'INITIAL_SESSION', expected: 'ignore', sessionUserId: 'user-1' },
  { currentStatus: 'authenticated', currentUserId: 'user-1', event: 'USER_UPDATED', expected: 'refresh-silently', sessionUserId: 'user-1' },
  { currentStatus: 'authenticated', currentUserId: 'user-1', event: 'SIGNED_OUT', expected: 'signed-out' },
]

for (const testCase of cases) {
  const actual = resolveStudioAuthEventAction(testCase)
  if (actual !== testCase.expected) {
    throw new Error(`Expected ${testCase.event} to resolve as ${testCase.expected}, received ${actual}.`)
  }
}

console.log(`Studio auth lifecycle: ${cases.length} assertions passed.`)
