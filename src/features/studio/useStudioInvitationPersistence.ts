import { useCallback, useEffect, useState } from 'react'

import { useStudioAuth } from '../auth/studioAuthContextValue'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { loadStudioDraft, saveStudioDraft, StudioPersistenceError } from './studioPersistence'
import type { PersistedStudioDraft, StudioDraftLocation } from './studioPersistence'

type LoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | {
      readonly status: 'ready'
      readonly document: Origin01InvitationData
      readonly location?: StudioDraftLocation
      readonly persisted?: PersistedStudioDraft
    }

export function useStudioInvitationPersistence(baseInvitation: Origin01InvitationData) {
  const { userId } = useStudioAuth()
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [saveState, setSaveState] = useState<{ readonly status: 'idle' | 'saving' | 'saved' | 'error'; readonly message?: string }>({
    status: 'idle',
  })

  useEffect(() => {
    let active = true
    void loadStudioDraft(baseInvitation.code)
      .then(({ location, persisted }) => {
        if (!active) return
        setLoadState({
          status: 'ready',
          document: persisted?.document ?? baseInvitation,
          location,
          persisted,
        })
      })
      .catch((error: unknown) => {
        if (!active) return
        setLoadState({
          status: 'error',
          message: error instanceof StudioPersistenceError
            ? error.message
            : 'No pudimos abrir esta invitación en Studio.',
        })
      })
    return () => { active = false }
  }, [baseInvitation])

  const save = useCallback(async (document: Origin01InvitationData) => {
    if (loadState.status !== 'ready' || !userId || saveState.status === 'saving') return false
    setSaveState({ status: 'saving' })
    try {
      const persisted = await saveStudioDraft({
        baseInvitation,
        document,
        location: loadState.location,
        userId,
      })
      setLoadState({ status: 'ready', document, location: persisted, persisted })
      setSaveState({ status: 'saved' })
      return true
    } catch (error) {
      setSaveState({
        status: 'error',
        message: error instanceof StudioPersistenceError ? error.message : 'No pudimos guardar los cambios.',
      })
      return false
    }
  }, [baseInvitation, loadState, saveState.status, userId])

  const clearSaveFeedback = useCallback(() => {
    setSaveState((current) => current.status === 'saving' ? current : { status: 'idle' })
  }, [])

  return { loadState, saveState, save, clearSaveFeedback }
}
