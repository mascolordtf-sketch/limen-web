import { useCallback, useEffect, useRef, useState } from 'react'

import { useStudioAuth } from '../auth/studioAuthContextValue'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { ensureStudioProject, loadStudioDraft, saveStudioDraft, StudioPersistenceError } from './studioPersistence'
import type { PersistedStudioDraft, StudioDraftLocation } from './studioPersistence'
import { uploadStudioMedia } from './studioMediaStorage'
import type { StudioMediaUploadInput } from './studioMediaStorage'

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
  const locationRef = useRef<StudioDraftLocation | undefined>(undefined)
  const projectRequestRef = useRef<Promise<string> | undefined>(undefined)

  useEffect(() => {
    let active = true
    void loadStudioDraft(baseInvitation.code)
      .then(({ location, persisted }) => {
        if (!active) return
        locationRef.current = location
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

  const ensureProject = useCallback(async () => {
    if (locationRef.current?.projectId) return locationRef.current.projectId
    if (!userId) throw new StudioPersistenceError('save', 'Tu sesión no está disponible.')
    projectRequestRef.current ??= ensureStudioProject(baseInvitation, userId)
    try {
      const projectId = await projectRequestRef.current
      locationRef.current = { projectId }
      setLoadState((current) => current.status === 'ready'
        ? { ...current, location: { projectId } }
        : current)
      return projectId
    } finally {
      projectRequestRef.current = undefined
    }
  }, [baseInvitation, userId])

  const uploadMedia = useCallback(async (input: StudioMediaUploadInput) => {
    if (!userId) throw new StudioPersistenceError('save', 'Tu sesión no está disponible.')
    const projectId = await ensureProject()
    return uploadStudioMedia(projectId, userId, input)
  }, [ensureProject, userId])

  const save = useCallback(async (document: Origin01InvitationData) => {
    if (loadState.status !== 'ready' || !userId || saveState.status === 'saving') return false
    setSaveState({ status: 'saving' })
    try {
      const persisted = await saveStudioDraft({
        baseInvitation,
        document,
        location: locationRef.current,
        userId,
      })
      locationRef.current = persisted
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

  return { loadState, saveState, save, uploadMedia, clearSaveFeedback }
}
