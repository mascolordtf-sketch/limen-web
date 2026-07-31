import type { ReactNode } from 'react'

export const studioEditorIds = [
  'identity', 'identity-projections', 'event-canonical', 'event-operations', 'event-copy',
  'opening', 'story', 'closing', 'countdown', 'schedule', 'dress-code', 'gallery', 'trivia', 'gifts', 'rsvp',
  'review-status', 'review-errors', 'review-scenes', 'review-checklist', 'review-audiences', 'share',
] as const

export type StudioEditorId = (typeof studioEditorIds)[number]
export type StudioEditorSlots = Readonly<Record<StudioEditorId, ReactNode>>

export function isStudioEditorId(editorId: string | undefined): editorId is StudioEditorId {
  return editorId !== undefined && (studioEditorIds as readonly string[]).includes(editorId)
}

export function getStudioEditorResolution(editorId: string | undefined) {
  return editorId === undefined ? 'unselected' as const
    : isStudioEditorId(editorId) ? 'resolved' as const : 'unresolved' as const
}

export function resolveStudioActiveEditor(editorId: string | undefined, slots: StudioEditorSlots): ReactNode | null {
  return isStudioEditorId(editorId) ? slots[editorId] : null
}
