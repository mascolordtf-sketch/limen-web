const coverNameHorizontalSafety = 24

export type CoverNameFitMeasurement = {
  readonly availableWidth: number
  readonly renderedWidth: number
  readonly fontSize: number
}

export function calculateCoverNameFittedSize({
  availableWidth,
  renderedWidth,
  fontSize,
}: CoverNameFitMeasurement) {
  if (availableWidth <= 0 || renderedWidth <= 0 || fontSize <= 0) return undefined

  const safeWidth = Math.max(0, availableWidth - coverNameHorizontalSafety)
  if (renderedWidth <= safeWidth) return undefined

  return fontSize * (safeWidth / renderedWidth)
}
