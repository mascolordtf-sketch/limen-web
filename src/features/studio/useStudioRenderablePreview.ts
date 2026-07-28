import { useLayoutEffect, useState } from 'react'

import type { StudioRenderablePreview } from './studioRenderablePreview'

export type StudioCommittedPreviewCell<T> = {
  sessionId?: string
  invitation: T | null
  commitCount: number
}

export const createStudioCommittedPreviewCell = <T>(): StudioCommittedPreviewCell<T> => ({
  invitation: null, commitCount: 0,
})

export function selectStudioRenderablePreview<T>(cell: StudioCommittedPreviewCell<T>, sessionId: string,
  current: T, structurallyValid: boolean): StudioRenderablePreview<T> {
  if (structurallyValid) return { sessionId, invitation: current, showing: 'current' }
  if (cell.sessionId === sessionId && cell.invitation) {
    return { sessionId, invitation: cell.invitation, showing: 'last-renderable' }
  }
  return { sessionId, invitation: null, showing: 'unavailable' }
}

export function commitStudioRenderablePreview<T>(cell: StudioCommittedPreviewCell<T>, sessionId: string,
  invitation: T) {
  cell.sessionId = sessionId
  cell.invitation = invitation
  cell.commitCount += 1
}

/** Render selection is pure; the derived output is retained only after a valid React commit. */
export function useStudioRenderablePreview<T>(sessionId: string, current: T,
  structurallyValid: boolean): StudioRenderablePreview<T> {
  const [committed] = useState(createStudioCommittedPreviewCell<T>)
  const selection = selectStudioRenderablePreview(committed, sessionId, current, structurallyValid)
  useLayoutEffect(() => {
    if (structurallyValid) commitStudioRenderablePreview(committed, sessionId, current)
  }, [committed, current, sessionId, structurallyValid])
  return selection
}
