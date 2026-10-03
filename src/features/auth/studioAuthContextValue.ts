import { createContext, useContext } from 'react'

import type { StudioRole } from '../platform/dataModel'

export type StudioAuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'unauthorized'
  | 'configuration_error'

export type StudioAuthContextValue = {
  email?: string
  userId?: string
  role?: StudioRole
  status: StudioAuthStatus
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

export const StudioAuthContext = createContext<StudioAuthContextValue | null>(null)

export function useStudioAuth(): StudioAuthContextValue {
  const context = useContext(StudioAuthContext)
  if (!context) throw new Error('useStudioAuth debe usarse dentro de StudioAuthProvider')
  return context
}
