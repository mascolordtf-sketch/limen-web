import { origin01Template } from '../origin01/origin01Template'
import { assertValidTemplateDefinition } from './invitationValidation'
import type { InvitationTemplateDefinition, InvitationTemplateId } from './templateTypes'

const templateRegistry = {
  origin01: origin01Template,
} satisfies Record<InvitationTemplateId, InvitationTemplateDefinition>

Object.values(templateRegistry).forEach(assertValidTemplateDefinition)

function isRegisteredTemplateId(templateId: string): templateId is keyof typeof templateRegistry {
  return Object.prototype.hasOwnProperty.call(templateRegistry, templateId)
}

export function findInvitationTemplate(templateId: string): InvitationTemplateDefinition | undefined {
  return isRegisteredTemplateId(templateId) ? templateRegistry[templateId] : undefined
}

export function getInvitationTemplate(templateId: InvitationTemplateId): InvitationTemplateDefinition {
  return templateRegistry[templateId]
}

export const invitationTemplates: readonly InvitationTemplateDefinition[] = Object.values(templateRegistry)
