import type { StudioNavigationSelection, StudioPreviewIntent } from './studioNavigation'

export type StudioPreviewSurfaceState = {
  readonly desktop: 'visible' | 'collapsed' | 'expanded'
  readonly mobile: 'closed' | 'full-screen'
  readonly origin?: StudioNavigationSelection
  readonly target?: StudioPreviewIntent
  readonly returnContext?: StudioNavigationSelection
}

export type StudioPreviewSurfaceAction =
  | { type: 'open'; viewport: 'desktop' | 'mobile'; origin: StudioNavigationSelection; target?: StudioPreviewIntent }
  | { type: 'collapse' } | { type: 'show' } | { type: 'expand' } | { type: 'close' }

export const createStudioPreviewSurfaceState = (): StudioPreviewSurfaceState => ({
  desktop: 'visible', mobile: 'closed',
})

export function transitionStudioPreviewSurface(state: StudioPreviewSurfaceState, action: StudioPreviewSurfaceAction) {
  if (action.type === 'open') return { ...state, origin: action.origin, returnContext: action.origin,
    target: action.target, [action.viewport]: action.viewport === 'desktop' ? 'expanded' : 'full-screen' } as StudioPreviewSurfaceState
  if (action.type === 'collapse') return { ...state, desktop: 'collapsed' as const }
  if (action.type === 'show') return { ...state, desktop: 'visible' as const }
  if (action.type === 'expand') return { ...state, desktop: 'expanded' as const }
  if (action.type === 'close') return { ...state, desktop: state.desktop === 'expanded' ? 'visible' : state.desktop,
    mobile: 'closed' as const }
  return state
}
