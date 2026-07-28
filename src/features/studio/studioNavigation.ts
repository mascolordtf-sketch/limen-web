import type { InvitationAudience } from '../invitations/engine/invitationTypes'
import type { InvitationModuleId } from '../invitations/engine/moduleTypes'

export const studioDomainIds = ['identity', 'event', 'narrative', 'experiences', 'review'] as const
export type StudioDomainId = (typeof studioDomainIds)[number]

export type StudioDomainKind = 'canonical-data' | 'editorial' | 'operational-review'
export type StudioCompletionState = 'complete' | 'incomplete' | 'pending-review'
export type StudioValidationState = 'valid' | 'invalid' | 'warning' | 'inactive'
export type StudioShareMode = 'default' | 'custom'

export type StudioNavigationItem = {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly editorId: string
  readonly groupId?: string
  readonly sceneId?: InvitationModuleId
  readonly required?: boolean
  readonly canToggle?: boolean
  readonly previewTarget?: StudioPreviewIntent
}

export type StudioDomainDefinition = {
  readonly id: StudioDomainId
  readonly label: string
  readonly description: string
  readonly order: number
  readonly kind: StudioDomainKind
  readonly items: readonly StudioNavigationItem[]
}

export type StudioNavigationSelection = {
  readonly domainId: StudioDomainId
  readonly itemId?: string
  readonly editorId?: string
}

export type StudioMobileLevel = 'general-index' | 'domain-index' | 'editor'

export type StudioNavigationState = StudioNavigationSelection & {
  readonly mobileLevel: StudioMobileLevel
  readonly returnLevel?: Exclude<StudioMobileLevel, 'editor'>
}

export type StudioNavigationAction =
  | { readonly type: 'open-domain'; readonly domainId: StudioDomainId }
  | { readonly type: 'open-item'; readonly domainId: StudioDomainId; readonly item: StudioNavigationItem }
  | { readonly type: 'show-general-index' }
  | { readonly type: 'show-domain-index' }

export function createInitialStudioNavigation(
  domains: readonly StudioDomainDefinition[],
): StudioNavigationState {
  const domain = domains[0]
  const firstItem = domain?.items[0]
  if (!domain || !firstItem) throw new Error('Studio requiere al menos un editor navegable.')
  return { domainId: domain.id, itemId: firstItem.id, editorId: firstItem.editorId,
    mobileLevel: 'general-index' }
}

export function isStudioNavigationAvailable(
  navigation: StudioNavigationState,
  domains: readonly StudioDomainDefinition[],
) {
  const domain = domains.find(({ id }) => id === navigation.domainId)
  if (!domain) return false
  if (!navigation.itemId && !navigation.editorId) return true
  const item = domain.items.find(({ id }) => id === navigation.itemId)
  return item?.editorId === navigation.editorId
}

export function resolveStudioNavigationForDomains(
  navigation: StudioNavigationState,
  domains: readonly StudioDomainDefinition[],
  previous?: StudioNavigationState,
): StudioNavigationState {
  if (isStudioNavigationAvailable(navigation, domains)) return navigation
  if (previous && isStudioNavigationAvailable(previous, domains)) return previous
  return createInitialStudioNavigation(domains)
}

export function transitionStudioNavigation(
  state: StudioNavigationState,
  action: StudioNavigationAction,
): StudioNavigationState {
  if (action.type === 'show-general-index') return { ...state, mobileLevel: 'general-index' }
  if (action.type === 'show-domain-index') return { ...state, mobileLevel: 'domain-index' }
  if (action.type === 'open-domain') return { domainId: action.domainId, mobileLevel: 'domain-index',
    returnLevel: 'general-index' }
  return { domainId: action.domainId, itemId: action.item.id, editorId: action.item.editorId,
    mobileLevel: 'editor', returnLevel: 'domain-index' }
}

export type StudioPreviewIntent = {
  readonly domainId: StudioDomainId
  readonly sceneId?: InvitationModuleId
  readonly groupId?: string
  readonly audience?: InvitationAudience
  readonly purpose: 'contextual-review' | 'audience-review' | 'final-review'
}

export type StudioDirtyStateBoundary<TDraft> = {
  readonly initialDraft: TDraft
  readonly currentDraft: TDraft
  readonly lastSavedDraft?: TDraft
}
