export type TypographyReadiness = 'loading' | 'ready' | 'error'

export function canReuseEvaluationStylesheets(
  stylesheets: readonly Pick<HTMLLinkElement, 'dataset'>[], expectedCount: number,
) {
  return stylesheets.length === expectedCount
    && stylesheets.every((stylesheet) => stylesheet.dataset.limenFontState === 'verified')
}

export function isTypographyEvaluationBusy(readiness: TypographyReadiness) {
  return readiness === 'loading'
}
