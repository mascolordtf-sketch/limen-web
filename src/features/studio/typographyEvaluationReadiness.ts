export type TypographyReadiness = 'loading' | 'ready' | 'error'

type EvaluationFontSet = {
  readonly ready?: PromiseLike<unknown>
  load?(font: string): PromiseLike<readonly unknown[]>
}

export async function waitForTypographyEvaluationFonts(
  families: readonly string[], fonts: EvaluationFontSet | undefined,
) {
  if (!fonts?.load) return

  const loadedFaces = await Promise.all(families.map((family) =>
    fonts.load?.(`1em "${family.replaceAll('"', '\\"')}"`) ?? Promise.resolve([])))
  if (loadedFaces.some((faces) => faces.length === 0)) {
    throw new Error('Una o más familias no quedaron disponibles')
  }

  // Some partial Font Loading API implementations reject `ready` even after
  // every requested face loaded. The verified loads are the safe fallback.
  if (fonts.ready) await Promise.resolve(fonts.ready).catch(() => undefined)
}

export function canReuseEvaluationStylesheets(
  stylesheets: readonly Pick<HTMLLinkElement, 'dataset'>[], expectedCount: number,
) {
  return stylesheets.length === expectedCount
    && stylesheets.every((stylesheet) => stylesheet.dataset.limenFontState === 'verified')
}

export function isTypographyEvaluationBusy(readiness: TypographyReadiness) {
  return readiness === 'loading'
}
