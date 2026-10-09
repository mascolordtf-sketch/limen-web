import type { LimenInvitation, LimenInvitationContent } from '../engine/invitationTypes'

export type Garden01Content = LimenInvitationContent & {
  readonly hero: {
    readonly eyebrow: string
    readonly name: string
    readonly dateLabel: string
    readonly scrollHint: string
    readonly imageMediaId: string
  }
  readonly story: {
    readonly eyebrow: string
    readonly heading: string
    readonly introduction: string
  }
  readonly gallery: {
    readonly images: readonly { readonly mediaId: string; readonly caption: string }[]
  }
  readonly countdown: {
    readonly eyebrow: string
    readonly completedMessage: string
  }
  readonly eventDetails: {
    readonly eyebrow: string
    readonly heading: string
    readonly dateLabel: string
    readonly timeLabel: string
    readonly venueLabel: string
    readonly mapActionLabel: string
  }
  readonly dressCode: {
    readonly eyebrow: string
    readonly title: string
    readonly description: string
  }
  readonly rsvp: {
    readonly eyebrow: string
    readonly title: string
    readonly description: string
    readonly actionLabel: string
    readonly recipientPhone: string
    readonly message: string
  }
  readonly closing: {
    readonly message: string
    readonly signature: string
  }
}

export type Garden01InvitationData = LimenInvitation<Garden01Content> & {
  readonly templateId: 'garden01'
  readonly themeVariant: 'garden01-sunlit'
  readonly eventType: 'quince'
  readonly event: {
    readonly name: string
    readonly celebrationLabel: string
    readonly startsAt: string
    readonly endsAt: string
    readonly timeZone: string
    readonly venue: string
    readonly address: string
  }
}
