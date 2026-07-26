import type { LimenInvitation, LimenInvitationContent } from '../engine/invitationTypes'

export type Origin01ImageContent = {
  readonly mediaId: string
  readonly caption?: string
}

export type Origin01TriviaOption = {
  readonly id: string
  readonly label: string
}

export type Origin01TriviaQuestion = {
  readonly id: string
  readonly prompt: string
  readonly options: readonly Origin01TriviaOption[]
  readonly correctOptionId?: string
  readonly correctFeedback: string
  readonly incorrectFeedback?: string
  readonly isPrediction?: boolean
}

export type Origin01TriviaContent = {
  readonly protagonistName: string
  readonly accessibleTitle: string
  readonly introEyebrow: string
  readonly title: string
  readonly description: string
  readonly primaryActionLabel: string
  readonly questionMetaLabel: string
  readonly nextLabel: string
  readonly resultLabel: string
  readonly replayLabel: string
  readonly scoreTotalLabel: string
  readonly questions: readonly Origin01TriviaQuestion[]
  readonly resultTiers: readonly { readonly minScore: number; readonly title: string; readonly message: string }[]
  readonly revealTitle: string
  readonly revealMessage: string
  readonly revealSignature: string
}

export type Origin01Content = LimenInvitationContent & {
  readonly prelude: {
    readonly eyebrow: string
    readonly title: string
    readonly body: string
    readonly reveal: string
    readonly question: string
    readonly actionLabel: string
    readonly soundHint: string
  }
  readonly envelope: {
    readonly eyebrow: string
    readonly heading: string
    readonly monogram: string
    readonly instruction: string
  }
  readonly hero: {
    readonly celebrationLabel: string
    readonly dateLabel: string
    readonly phrase: string
    readonly scrollHint: string
    readonly imageMediaId: string
  }
  readonly countdown: { readonly eyebrow: string; readonly heading: string; readonly completedMessage: string }
  readonly story: { readonly eyebrow: string; readonly message: string; readonly signature: string }
  readonly eventDetails: {
    readonly eyebrow: string
    readonly heading: string
    readonly dateLabel: string
    readonly timeLabel: string
    readonly venueLabel: string
    readonly mapActionLabel: string
    readonly calendarActionLabel: string
    readonly calendarDescription: string
  }
  readonly dressCode: {
    readonly eyebrow: string
    readonly title: string
    readonly description: string
    readonly note: string
    readonly imageMediaId: string
  }
  readonly gallery: { readonly eyebrow: string; readonly heading: string; readonly images: readonly Origin01ImageContent[] }
  readonly trivia: Origin01TriviaContent
  readonly gifts: {
    readonly eyebrow: string
    readonly title: string
    readonly description: string
    readonly accountLabel: string
    readonly accountValue: string
    readonly demoNote: string
    readonly imageMediaId: string
  }
  readonly rsvp: {
    readonly eyebrow: string
    readonly title: string
    readonly description: string
    readonly actionLabel: string
    readonly recipientPhone?: string
    readonly message: string
    readonly demoNote?: string
  }
  readonly closing: {
    readonly eyebrow: string
    readonly title: string
    readonly signature: string
    readonly imageMediaId: string
    readonly sharePrompt: string
    readonly shareActionLabel: string
    readonly shareTitle: string
    readonly shareText: string
  }
  readonly music: { readonly mediaId: string; readonly label: string }
  readonly demoLabel: string
}

export type Origin01InvitationData = LimenInvitation<Origin01Content> & {
  readonly templateId: 'origin01'
  readonly themeVariant: 'origin01-wine'
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
