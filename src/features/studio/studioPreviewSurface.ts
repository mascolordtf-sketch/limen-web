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
  | { type: 'collapse' } | { type: 'show' } | { type: 'close' }

export const createStudioPreviewSurfaceState = (): StudioPreviewSurfaceState => ({
  desktop: 'visible', mobile: 'closed',
})

export const shouldMountStudioPreviewRenderer = (state: StudioPreviewSurfaceState) => Boolean(state)

export function transitionStudioPreviewSurface(state: StudioPreviewSurfaceState, action: StudioPreviewSurfaceAction) {
  if (action.type === 'open') return { ...state, origin: action.origin, returnContext: action.origin,
    target: action.target, [action.viewport]: action.viewport === 'desktop' ? 'expanded' : 'full-screen' } as StudioPreviewSurfaceState
  if (action.type === 'collapse') return { ...state, desktop: 'collapsed' as const }
  if (action.type === 'show') return { ...state, desktop: 'visible' as const }
  if (action.type === 'close') return { ...state, desktop: state.desktop === 'expanded' ? 'visible' : state.desktop,
    mobile: 'closed' as const }
  return state
}

export function resolveStudioPreviewContextLabel(state: StudioPreviewSurfaceState,
  domains: readonly { id: string; items: readonly { id: string; label: string }[] }[]) {
  if (!state.origin?.itemId || !state.target) return undefined
  const item = domains.find(({ id }) => id === state.origin?.domainId)?.items.find(({ id }) => id === state.origin?.itemId)
  return item ? `Revisando: ${item.label}` : undefined
}
