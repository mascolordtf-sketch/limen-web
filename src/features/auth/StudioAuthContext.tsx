import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'

import type { StudioRole } from '../platform/dataModel'
import { StudioAuthContext } from './studioAuthContextValue'
import type { StudioAuthContextValue } from './studioAuthContextValue'
import { isSupabaseConfigured, supabase } from './supabaseClient'

async function resolveStudioAccess(): Promise<Pick<StudioAuthContextValue, 'email' | 'role' | 'status' | 'userId'>> {
  if (!supabase) return { status: 'configuration_error' }

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return { status: 'unauthenticated' }

  const { data: membership, error: membershipError } = await supabase
    .from('platform_members')
    .select('role, active')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (membershipError || !membership?.active) {
    return { email: userData.user.email, status: 'unauthorized' }
  }

  return {
    email: userData.user.email,
    userId: userData.user.id,
    role: membership.role as StudioRole,
    status: 'authenticated',
  }
}

export function StudioAuthProvider() {
  const [authState, setAuthState] = useState<Pick<StudioAuthContextValue, 'email' | 'role' | 'status' | 'userId'>>({
    status: isSupabaseConfigured ? 'loading' : 'configuration_error',
  })

  const refreshAccess = useCallback(async () => {
    setAuthState((current) => ({ ...current, status: 'loading' }))
    setAuthState(await resolveStudioAccess())
  }, [])

  useEffect(() => {
    const initialCheck = window.setTimeout(() => void refreshAccess(), 0)
    if (!supabase) return () => window.clearTimeout(initialCheck)

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void refreshAccess(), 0)
    })

    return () => {
      window.clearTimeout(initialCheck)
      listener.subscription.unsubscribe()
    }
  }, [refreshAccess])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Supabase todavía no está configurado.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return 'No pudimos iniciar sesión. Revisá el correo y la contraseña.'
    await refreshAccess()
    return null
  }, [refreshAccess])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setAuthState({ status: 'unauthenticated' })
  }, [])

  const value = useMemo<StudioAuthContextValue>(() => ({
    ...authState,
    signIn,
    signOut,
  }), [authState, signIn, signOut])

  return (
    <StudioAuthContext.Provider value={value}>
      <Outlet />
    </StudioAuthContext.Provider>
  )
}
