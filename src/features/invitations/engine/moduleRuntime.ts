import type { InvitationModuleConfig, InvitationModuleId } from './moduleTypes'

export function getEnabledInvitationModuleIds(
  modules: readonly InvitationModuleConfig[],
): ReadonlySet<InvitationModuleId> {
  return new Set(
    modules
      .filter(({ enabled }) => enabled)
      .map(({ moduleId }) => moduleId),
  )
}
