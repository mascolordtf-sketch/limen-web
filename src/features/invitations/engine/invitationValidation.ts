import { isInvitationModuleId, type InvitationModuleId } from './moduleTypes'
import type { InvitationTemplateDefinition } from './templateTypes'

export type InvitationValidationErrorCode =
  | 'unknown_template'
  | 'unknown_module'
  | 'unsupported_module'
  | 'unsupported_module_enabled'
  | 'duplicate_module_configuration'
  | 'required_module_missing'
  | 'required_module_disabled'
  | 'invalid_theme_variant'
  | 'duplicate_supported_module'
  | 'duplicate_required_module'
  | 'duplicate_optional_module'
  | 'duplicate_supported_theme_variant'
  | 'duplicate_canonical_module'
  | 'module_classification_overlap'
  | 'supported_module_unclassified'
  | 'classified_module_unsupported'
  | 'module_metadata_mismatch'
  | 'required_module_out_of_order'
  | 'supported_module_out_of_order'
  | 'unsupported_module_in_order'
  | 'default_theme_unsupported'

export type InvitationValidationError = {
  readonly code: InvitationValidationErrorCode
  readonly message: string
  readonly templateId?: string
  readonly moduleId?: string
  readonly themeId?: string
  readonly fieldPath?: string
}

export type InvitationValidationResult = {
  readonly valid: boolean
  readonly errors: readonly InvitationValidationError[]
}

export type InvitationConfigurationInput = {
  readonly code: string
  readonly templateId: string
  readonly themeVariant: string
  readonly modules: readonly { readonly moduleId: string; readonly enabled: boolean }[]
}

type TemplateLookup = (templateId: string) => InvitationTemplateDefinition | undefined

const duplicates = (values: readonly string[]) =>
  [...new Set(values.filter((value, index) => values.indexOf(value) !== index))]

export function validateTemplateDefinition(template: InvitationTemplateDefinition): InvitationValidationResult {
  const errors: InvitationValidationError[] = []
  const supported = new Set<InvitationModuleId>(template.supportedModules)
  const required = new Set<InvitationModuleId>(template.requiredModules)
  const optional = new Set<InvitationModuleId>(template.optionalModules)
  const metadataIds = template.modules.map(({ moduleId }) => moduleId)

  for (const moduleId of duplicates(template.supportedModules)) {
    errors.push({ code: 'duplicate_supported_module', message: `Template "${template.id}" repeats supported module "${moduleId}". Remove the duplicate entry.`, templateId: template.id, moduleId, fieldPath: 'supportedModules' })
  }

  for (const moduleId of duplicates(template.requiredModules)) {
    errors.push({ code: 'duplicate_required_module', message: `Template "${template.id}" repeats required module "${moduleId}". Remove the duplicate entry.`, templateId: template.id, moduleId, fieldPath: 'requiredModules' })
  }

  for (const moduleId of duplicates(template.optionalModules)) {
    errors.push({ code: 'duplicate_optional_module', message: `Template "${template.id}" repeats optional module "${moduleId}". Remove the duplicate entry.`, templateId: template.id, moduleId, fieldPath: 'optionalModules' })
  }

  for (const themeId of duplicates(template.supportedThemeVariants)) {
    errors.push({ code: 'duplicate_supported_theme_variant', message: `Template "${template.id}" repeats supported theme variant "${themeId}". Remove the duplicate entry.`, templateId: template.id, themeId, fieldPath: 'supportedThemeVariants' })
  }

  for (const moduleId of duplicates(template.canonicalOrder)) {
    errors.push({ code: 'duplicate_canonical_module', message: `Template "${template.id}" repeats module "${moduleId}" in canonical order.`, templateId: template.id, moduleId, fieldPath: 'canonicalOrder' })
  }

  for (const moduleId of template.requiredModules.filter((id) => optional.has(id))) {
    errors.push({ code: 'module_classification_overlap', message: `Template "${template.id}" marks module "${moduleId}" as both required and optional.`, templateId: template.id, moduleId })
  }

  for (const moduleId of template.supportedModules.filter((id) => !required.has(id) && !optional.has(id))) {
    errors.push({ code: 'supported_module_unclassified', message: `Template "${template.id}" must classify supported module "${moduleId}" as required or optional.`, templateId: template.id, moduleId })
  }

  for (const moduleId of [...template.requiredModules, ...template.optionalModules].filter((id) => !supported.has(id))) {
    errors.push({ code: 'classified_module_unsupported', message: `Template "${template.id}" classifies module "${moduleId}" but does not support it.`, templateId: template.id, moduleId })
  }

  for (const moduleId of [...duplicates(metadataIds), ...template.supportedModules.filter((id) => !metadataIds.includes(id)), ...metadataIds.filter((id) => !supported.has(id))]) {
    errors.push({ code: 'module_metadata_mismatch', message: `Template "${template.id}" has inconsistent metadata for module "${moduleId}".`, templateId: template.id, moduleId, fieldPath: 'modules' })
  }

  for (const moduleId of template.requiredModules.filter((id) => !template.canonicalOrder.includes(id))) {
    errors.push({ code: 'required_module_out_of_order', message: `Template "${template.id}" omits required module "${moduleId}" from canonical order.`, templateId: template.id, moduleId, fieldPath: 'canonicalOrder' })
  }

  for (const moduleId of template.supportedModules.filter((id) => !template.canonicalOrder.includes(id))) {
    if (required.has(moduleId)) continue
    errors.push({ code: 'supported_module_out_of_order', message: `Template "${template.id}" omits supported module "${moduleId}" from canonical order.`, templateId: template.id, moduleId, fieldPath: 'canonicalOrder' })
  }

  for (const moduleId of template.canonicalOrder.filter((id) => !supported.has(id))) {
    errors.push({ code: 'unsupported_module_in_order', message: `Template "${template.id}" includes unsupported module "${moduleId}" in canonical order.`, templateId: template.id, moduleId, fieldPath: 'canonicalOrder' })
  }

  if (!template.supportedThemeVariants.includes(template.defaultThemeVariant)) {
    errors.push({ code: 'default_theme_unsupported', message: `Template "${template.id}" default theme "${template.defaultThemeVariant}" is not supported.`, templateId: template.id, fieldPath: 'defaultThemeVariant' })
  }

  return { valid: errors.length === 0, errors }
}

export function validateInvitationConfiguration(input: InvitationConfigurationInput, findTemplate: TemplateLookup): InvitationValidationResult {
  const template = findTemplate(input.templateId)
  if (!template) {
    return { valid: false, errors: [{ code: 'unknown_template', message: `Invitation ${input.code} references unknown template "${input.templateId}".`, templateId: input.templateId, fieldPath: 'templateId' }] }
  }

  const errors: InvitationValidationError[] = []
  const supported = new Set<InvitationModuleId>(template.supportedModules)
  const configuredIds = input.modules.map(({ moduleId }) => moduleId)

  for (const moduleId of duplicates(configuredIds)) {
    errors.push({ code: 'duplicate_module_configuration', message: `Invitation ${input.code} configures module "${moduleId}" more than once.`, templateId: template.id, moduleId, fieldPath: 'modules' })
  }

  input.modules.forEach(({ moduleId, enabled }, index) => {
    if (!isInvitationModuleId(moduleId)) {
      errors.push({ code: 'unknown_module', message: `Invitation ${input.code} references unknown module "${moduleId}".`, templateId: template.id, moduleId, fieldPath: `modules.${index}.moduleId` })
    } else if (!supported.has(moduleId)) {
      errors.push({ code: enabled ? 'unsupported_module_enabled' : 'unsupported_module', message: `Invitation ${input.code} cannot ${enabled ? 'enable' : 'configure'} unsupported module "${moduleId}" for template "${template.id}".`, templateId: template.id, moduleId, fieldPath: `modules.${index}` })
    }
  })

  for (const moduleId of template.requiredModules) {
    const configured = input.modules.find((module) => module.moduleId === moduleId)
    if (!configured) {
      errors.push({ code: 'required_module_missing', message: `Invitation ${input.code} must include required module "${moduleId}" for template "${template.id}".`, templateId: template.id, moduleId, fieldPath: 'modules' })
    } else if (!configured.enabled) {
      errors.push({ code: 'required_module_disabled', message: `Invitation ${input.code} cannot disable required module "${moduleId}" for template "${template.id}".`, templateId: template.id, moduleId, fieldPath: `modules.${input.modules.indexOf(configured)}.enabled` })
    }
  }

  if (!template.supportedThemeVariants.some((variant) => variant === input.themeVariant)) {
    errors.push({ code: 'invalid_theme_variant', message: `Invitation ${input.code} uses theme "${input.themeVariant}", which template "${template.id}" does not support.`, templateId: template.id, fieldPath: 'themeVariant' })
  }

  return { valid: errors.length === 0, errors }
}

export function assertValidTemplateDefinition(template: InvitationTemplateDefinition): void {
  const result = validateTemplateDefinition(template)
  if (!result.valid) throw new Error(result.errors.map(({ message }) => message).join('\n'))
}
