export type StudioRenderablePreview<T> = {
  readonly sessionId?: string
  readonly invitation: T | null
  readonly showing: 'current' | 'last-renderable' | 'unavailable'
}

export const createStudioRenderablePreview = <T>(): StudioRenderablePreview<T> => ({ invitation: null, showing: 'unavailable' })

export function retainStudioRenderablePreview<T>(state: StudioRenderablePreview<T>, sessionId: string,
  current: T, structurallyValid: boolean): StudioRenderablePreview<T> {
  const sessionState = state.sessionId === sessionId ? state : createStudioRenderablePreview<T>()
  if (structurallyValid) return { sessionId, invitation: current, showing: 'current' }
  return sessionState.invitation
    ? { ...sessionState, sessionId, showing: 'last-renderable' }
    : { sessionId, invitation: null, showing: 'unavailable' }
}

/** A preview-lifecycle boundary. It retains only derived renderable output, never editable draft state. */
