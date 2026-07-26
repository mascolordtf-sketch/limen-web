import type { InvitationModuleDefinition, InvitationModuleId } from './moduleTypes'

export const invitationTemplateIds = ['origin01'] as const
export type InvitationTemplateId = (typeof invitationTemplateIds)[number]

export const themeVariantIds = ['origin01-wine'] as const
export type ThemeVariantId = (typeof themeVariantIds)[number]

export type InvitationTemplateDefinition = {
  readonly id: InvitationTemplateId
  readonly internalName: string
  readonly description: string
  readonly schemaVersion: number
  readonly modules: readonly InvitationModuleDefinition[]
  readonly supportedModules: readonly InvitationModuleId[]
  readonly requiredModules: readonly InvitationModuleId[]
  readonly optionalModules: readonly InvitationModuleId[]
  readonly canonicalOrder: readonly InvitationModuleId[]
  readonly defaultThemeVariant: ThemeVariantId
  readonly supportedThemeVariants: readonly ThemeVariantId[]
}
