import { useReducer } from 'react'

import type { StudioDomainDefinition } from './studioNavigation'
import { createInitialStudioNavigation, transitionStudioNavigation } from './studioNavigation'

export function useStudioNavigation(domains: readonly StudioDomainDefinition[]) {
  return useReducer(transitionStudioNavigation, domains, createInitialStudioNavigation)
}
