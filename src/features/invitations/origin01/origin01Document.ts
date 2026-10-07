import type { Origin01InvitationData } from './origin01ContentTypes'
import { findOrigin01TypographyCombination } from './origin01Typography'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export function isOrigin01InvitationDocument(value: unknown): value is Origin01InvitationData {
  if (!isRecord(value) || value.templateId !== 'origin01' || value.eventType !== 'quince') return false
  if (typeof value.id !== 'string' || typeof value.code !== 'string' || typeof value.internalName !== 'string') return false
  if (value.typographyId !== undefined
    && (typeof value.typographyId !== 'string' || !findOrigin01TypographyCombination(value.typographyId))) return false
  return isRecord(value.event) && isRecord(value.content) && Array.isArray(value.identities)
    && Array.isArray(value.modules) && Array.isArray(value.media)
}
