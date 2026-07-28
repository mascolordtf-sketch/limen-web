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
