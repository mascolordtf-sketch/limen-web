import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { origin01DemoData } from '../invitations/origin01/origin01DemoData'

const studioInvitations = {
  [origin01DemoData.code]: origin01DemoData,
} as const satisfies Readonly<Record<string, Origin01InvitationData>>

export const defaultStudioInvitationCode = origin01DemoData.code

export function findStudioInvitation(code: string): Origin01InvitationData | undefined {
  return studioInvitations[code as keyof typeof studioInvitations]
}
