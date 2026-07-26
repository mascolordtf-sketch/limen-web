import type { InvitationModuleConfig, InvitationModuleId } from './moduleTypes'

export type InvitationModuleEnabledOverrides = Readonly<
  Partial<Record<InvitationModuleId, boolean>>
>

export function updateInvitationModuleConfiguration(
  modules: readonly InvitationModuleConfig[],
  overrides: InvitationModuleEnabledOverrides,
): readonly InvitationModuleConfig[] {
  return Object.freeze(
    modules.map((module) => Object.freeze({
      ...module,
      enabled: overrides[module.moduleId] ?? module.enabled,
    })),
  )
}
