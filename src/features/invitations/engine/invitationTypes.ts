import type { InvitationModuleConfig, InvitationModuleId } from './moduleTypes'
import type { InvitationTemplateId, ThemeVariantId } from './templateTypes'

export const invitationLifecycleStatuses = [
  'draft',
  'awaiting_content',
  'in_preparation',
  'review',
  'published',
  'completed',
  'archived',
] as const

export type InvitationLifecycleStatus = (typeof invitationLifecycleStatuses)[number]

export const invitationAudiences = ['protagonist', 'guest'] as const
export type InvitationAudience = (typeof invitationAudiences)[number]

export const eventTypes = ['quince', 'wedding', 'birthday', 'other'] as const
export type EventType = (typeof eventTypes)[number]

export type InvitationEventMetadata = {
  readonly name: string
  readonly celebrationLabel: string
  readonly startsAt: string
  readonly endsAt?: string
  readonly timeZone: string
  readonly venue?: string
  readonly address?: string
}

export type InvitationIdentity = {
  readonly displayName: string
  readonly role?: string
}

export type InvitationMediaReference = {
  readonly id: string
  readonly kind: 'image' | 'audio' | 'video'
  readonly src: string
  readonly alt?: string
  readonly title?: string
  readonly focalPoint?: {
    readonly x: number
    readonly y: number
  }
}

export type InvitationSceneContent = {
  readonly eyebrow?: string
  readonly heading?: string
  readonly body?: string
}

export type LimenInvitationContent = {
  readonly openingMessage?: string
  readonly personalMessage?: string
  readonly closingMessage?: string
  readonly scenes?: Partial<Readonly<Record<InvitationModuleId, InvitationSceneContent>>>
}

export type LimenInvitation<TContent extends LimenInvitationContent = LimenInvitationContent> = {
  readonly id: string
  readonly code: string
  readonly internalName: string
  readonly templateId: InvitationTemplateId
  readonly lifecycleStatus: InvitationLifecycleStatus
  readonly audience: InvitationAudience
  readonly eventType: EventType
  readonly themeVariant: ThemeVariantId
  readonly event: InvitationEventMetadata
  readonly identities: readonly InvitationIdentity[]
  readonly modules: readonly InvitationModuleConfig[]
  readonly content: TContent
  readonly media: readonly InvitationMediaReference[]
  readonly createdAt: string
  readonly updatedAt: string
  readonly publishedAt?: string
}
