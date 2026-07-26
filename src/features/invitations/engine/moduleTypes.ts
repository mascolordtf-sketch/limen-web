export const invitationModuleIds = [
  'prelude',
  'hero',
  'eventDetails',
  'countdown',
  'location',
  'story',
  'gallery',
  'trivia',
  'dressCode',
  'gifts',
  'instagram',
  'rsvp',
  'closing',
] as const

export type InvitationModuleId = (typeof invitationModuleIds)[number]

export type InvitationModuleConfig = {
  readonly moduleId: InvitationModuleId
  readonly enabled: boolean
}

export type InvitationModuleDefinition = {
  readonly moduleId: InvitationModuleId
  readonly internalLabel: string
}

const invitationModuleIdSet: ReadonlySet<string> = new Set(invitationModuleIds)

export function isInvitationModuleId(value: string): value is InvitationModuleId {
  return invitationModuleIdSet.has(value)
}
