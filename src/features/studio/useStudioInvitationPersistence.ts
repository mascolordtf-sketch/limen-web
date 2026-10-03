import { useCallback, useEffect, useRef, useState } from 'react'

import { useStudioAuth } from '../auth/studioAuthContextValue'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { ensureStudioProject, loadStudioDraft, saveStudioDraft, StudioPersistenceError } from './studioPersistence'
import type { PersistedStudioDraft, StudioDraftLocation } from './studioPersistence'
import type { StudioSaveState } from './studioAutosave'
import { serializeStudioDocument, uploadStudioMedia } from './studioMediaStorage'
import type { StudioMediaUploadInput } from './studioMediaStorage'
import { loadLatestStudioPublication, publishStudioDraft, StudioPublicationError } from './studioPublication'
import type { StudioPublicationSnapshot, StudioPublicationState } from './studioPublication'

type LoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | {
      readonly status: 'ready'
      readonly document: Origin01InvitationData
      readonly location?: StudioDraftLocation
      readonly persisted?: PersistedStudioDraft
      readonly publication?: StudioPublicationSnapshot
    }

export function useStudioInvitationPersistence(baseInvitation: Origin01InvitationData) {
  const { userId } = useStudioAuth()
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [saveState, setSaveState] = useState<StudioSaveState>({ status: 'idle' })
  const [publicationState, setPublicationState] = useState<StudioPublicationState>({ status: 'idle' })
  const locationRef = useRef<StudioDraftLocation | undefined>(undefined)
  const projectRequestRef = useRef<Promise<string> | undefined>(undefined)
  const saveRequestRef = useRef<Promise<boolean> | undefined>(undefined)
  const publicationRequestRef = useRef<Promise<boolean> | undefined>(undefined)

  useEffect(() => {
    let active = true
    void loadStudioDraft(baseInvitation.code)
      .then(async ({ location, persisted }) => {
        const publication = location?.projectId
          ? await loadLatestStudioPublication(location.projectId)
          : undefined
        if (!active) return
        locationRef.current = location
        setLoadState({
          status: 'ready',
          document: persisted?.document ?? baseInvitation,
          location,
          persisted,
          publication,
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

  const save = useCallback((document: Origin01InvitationData) => {
    if (loadState.status !== 'ready' || !userId || saveRequestRef.current) return Promise.resolve(false)

    const request = (async () => {
      setSaveState({ status: 'saving' })
      try {
        const persisted = await saveStudioDraft({
          baseInvitation,
          document,
          location: locationRef.current,
          userId,
        })
        locationRef.current = persisted
        setLoadState((current) => ({
          status: 'ready',
          document,
          location: persisted,
          persisted,
          publication: current.status === 'ready' ? current.publication : undefined,
        }))
        setSaveState({ status: 'saved' })
        return true
      } catch (error) {
        const persistenceError = error instanceof StudioPersistenceError ? error : undefined
        setSaveState({
          status: persistenceError?.code === 'conflict' ? 'conflict' : 'error',
          message: persistenceError?.message ?? 'No pudimos guardar los cambios.',
        })
        return false
      }
    })()

    saveRequestRef.current = request
    void request.finally(() => {
      if (saveRequestRef.current === request) saveRequestRef.current = undefined
    })
    return request
  }, [baseInvitation, loadState.status, userId])

  const publish = useCallback((expectedDraftRevision: number) => {
    const location = locationRef.current
    if (loadState.status !== 'ready' || !location?.projectId || !location.draftId
      || location.revision !== expectedDraftRevision || publicationRequestRef.current) {
      return Promise.resolve(false)
    }

    const request = (async () => {
      setPublicationState({ status: 'publishing' })
      try {
        const summary = await publishStudioDraft(location.projectId, expectedDraftRevision)
        const publication: StudioPublicationSnapshot = {
          ...summary,
          projectId: location.projectId,
          document: serializeStudioDocument(loadState.document),
        }
        setLoadState((current) => current.status === 'ready' ? { ...current, publication } : current)
        setPublicationState({ status: 'success', message: 'La publicación se creó correctamente.' })
        return true
      } catch (error) {
        setPublicationState({
          status: 'error',
          message: error instanceof StudioPublicationError
            ? error.message
            : 'No pudimos crear la publicación.',
        })
        return false
      }
    })()

    publicationRequestRef.current = request
    void request.finally(() => {
      if (publicationRequestRef.current === request) publicationRequestRef.current = undefined
    })
    return request
  }, [loadState])

  const clearSaveFeedback = useCallback(() => {
    setSaveState((current) => current.status === 'saving' || current.status === 'conflict'
      ? current
      : { status: 'idle' })
    setPublicationState((current) => current.status === 'publishing' ? current : { status: 'idle' })
  }, [])

  return { loadState, saveState, publicationState, save, publish, uploadMedia, clearSaveFeedback }
}
