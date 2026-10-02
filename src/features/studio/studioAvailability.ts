export type StudioAvailabilityEnvironment = {
  readonly dev: boolean
  readonly explicitFlag?: string
}

export function resolveStudioAvailability({
  dev,
  explicitFlag,
}: StudioAvailabilityEnvironment): boolean {
  return dev || explicitFlag === 'true'
}

export const studioRoutesEnabled = resolveStudioAvailability({
  dev: import.meta.env.DEV,
  explicitFlag: import.meta.env.VITE_ENABLE_STUDIO,
})
