import { origin01Template } from '../origin01/origin01Template'
import { assertValidTemplateDefinition } from './invitationValidation'
import type { InvitationTemplateDefinition, InvitationTemplateId } from './templateTypes'

const templateRegistry = {
  origin01: origin01Template,
} satisfies Record<InvitationTemplateId, InvitationTemplateDefinition>

Object.values(templateRegistry).forEach(assertValidTemplateDefinition)

export function findInvitationTemplate(templateId: string): InvitationTemplateDefinition | undefined {
  return templateId === 'origin01' ? templateRegistry.origin01 : undefined
}

export function getInvitationTemplate(templateId: InvitationTemplateId): InvitationTemplateDefinition {
  return templateRegistry[templateId]
}

export const invitationTemplates: readonly InvitationTemplateDefinition[] = Object.values(templateRegistry)
