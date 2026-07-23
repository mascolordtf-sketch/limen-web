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
}

export type InvitationEvent = {
  name: string
  celebration: string
  startsAt: string
  timeZone: string
  dateLabel: string
  timeLabel: string
  venue: string
  address: string
  dressCode: string
}

export type InvitationData = {
  code: string
  demoLabel: string
  thresholdPhrase: string
  mainPhrase: string
  welcome: string
  personalMessage: string
  closing: string
  event: InvitationEvent
  gallery: InvitationImage[]
  music?: InvitationMusic
  gift?: InvitationGift
}
