import { useLayoutEffect, useMemo, useSyncExternalStore } from 'react'

import type { StudioRenderablePreview } from './studioRenderablePreview'
import { createStudioRenderablePreview, retainStudioRenderablePreview } from './studioRenderablePreview'

export type StudioRenderablePreviewStore<T> = {
  readonly sessionId: string
  getSnapshot: () => StudioRenderablePreview<T>
  subscribe: (listener: () => void) => () => void
  commit: (invitation: T) => void
}

export function createStudioRenderablePreviewStore<T>(sessionId: string): StudioRenderablePreviewStore<T> {
  let snapshot = createStudioRenderablePreview<T>()
  const listeners = new Set<() => void>()
  return {
    sessionId,
    getSnapshot: () => snapshot,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener) },
    commit: (invitation) => {
      snapshot = retainStudioRenderablePreview(snapshot, sessionId, invitation, true)
      listeners.forEach((listener) => listener())
    },
  }
}

/** Selects current output purely during render and commits retention only after React commits. */
export function useStudioRenderablePreview<T>(sessionId: string, current: T,
  structurallyValid: boolean): StudioRenderablePreview<T> {
  const store = useMemo(() => createStudioRenderablePreviewStore<T>(sessionId), [sessionId])
  const committed = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  useLayoutEffect(() => {
    if (structurallyValid) store.commit(current)
  }, [current, store, structurallyValid])
  if (structurallyValid) return { sessionId, invitation: current, showing: 'current' }
  return committed.invitation
    ? { ...committed, showing: 'last-renderable' }
    : { sessionId, invitation: null, showing: 'unavailable' }
}
