import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'

import type { StudioRole } from '../platform/dataModel'
import { StudioAuthContext } from './studioAuthContextValue'
import type { StudioAuthContextValue } from './studioAuthContextValue'
import { resolveStudioAuthEventAction } from './studioAuthLifecycle'
import { isSupabaseConfigured, supabase } from './supabaseClient'

type StudioAccessState = Pick<StudioAuthContextValue, 'email' | 'role' | 'status' | 'userId'>

async function resolveStudioAccess(): Promise<StudioAccessState> {
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
  const initialAuthState: StudioAccessState = {
    status: isSupabaseConfigured ? 'loading' : 'configuration_error',
  }
  const [authState, setAuthState] = useState<StudioAccessState>(initialAuthState)
  const authStateRef = useRef(initialAuthState)
  const accessRequestRef = useRef(0)

  const commitAuthState = useCallback((nextState: StudioAccessState) => {
    authStateRef.current = nextState
    setAuthState(nextState)
  }, [])

  const refreshAccess = useCallback(async ({ showLoading = false }: { showLoading?: boolean } = {}) => {
    const requestId = ++accessRequestRef.current

    if (showLoading) {
      commitAuthState({ ...authStateRef.current, status: 'loading' })
    }

    const nextState = await resolveStudioAccess()
    if (requestId === accessRequestRef.current) commitAuthState(nextState)
  }, [commitAuthState])

  useEffect(() => {
    const initialCheck = window.setTimeout(() => void refreshAccess({ showLoading: true }), 0)
    if (!supabase) return () => window.clearTimeout(initialCheck)

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const action = resolveStudioAuthEventAction({
        currentStatus: authStateRef.current.status,
        currentUserId: authStateRef.current.userId,
        event,
        sessionUserId: session?.user.id,
      })

      if (action === 'signed-out') {
        accessRequestRef.current += 1
        commitAuthState({ status: 'unauthenticated' })
      } else if (action === 'refresh-silently') {
        window.setTimeout(() => void refreshAccess(), 0)
      }
    })

    return () => {
      accessRequestRef.current += 1
      window.clearTimeout(initialCheck)
      listener.subscription.unsubscribe()
    }
  }, [commitAuthState, refreshAccess])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Supabase todavía no está configurado.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return 'No pudimos iniciar sesión. Revisá el correo y la contraseña.'
    await refreshAccess()
    return null
  }, [refreshAccess])

  const signOut = useCallback(async () => {
    accessRequestRef.current += 1
    if (supabase) await supabase.auth.signOut()
    commitAuthState({ status: 'unauthenticated' })
  }, [commitAuthState])

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
