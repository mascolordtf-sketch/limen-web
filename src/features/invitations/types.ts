export type InvitationImage = {
  src?: string
  alt: string
  title?: string
}

export type InvitationMusic = {
  src?: string
  title?: string
}

export type InvitationGift = {
  title: string
  description: string
  accountLabel: string
  accountValue: string
  demoNote: string
  image?: InvitationImage
}

export type InvitationRsvp = {
  recipientPhone?: string
  message: string
  demoNote?: string
}

export type InvitationEvent = {
  name: string
  celebration: string
  startsAt: string
  endsAt: string
  timeZone: string
  dateLabel: string
  timeLabel: string
  venue: string
  address: string
  dressCode: string
}

export type InvitationWelcome = {
  title: string
  body: string
}

export type TriviaQuestion = {
  prompt: string
  options: string[]
  answerIndex: number
}

export type TriviaResultTier = {
  minScore: number
  title: string
  message: string
}

export type InvitationTrivia = {
  title: string
  subtitle: string
  questions: TriviaQuestion[]
  resultTiers: TriviaResultTier[]
}

export type InvitationData = {
  code: string
  demoLabel: string
  thresholdPhrase: string
  mainPhrase: string
  welcome: InvitationWelcome
  personalMessage: string
  closing: string
  event: InvitationEvent
  gallery: InvitationImage[]
  rsvp: InvitationRsvp
  music?: InvitationMusic
  gift?: InvitationGift
  trivia?: InvitationTrivia
}
