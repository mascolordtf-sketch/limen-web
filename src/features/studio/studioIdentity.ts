const graphemeSegmenter = new Intl.Segmenter('es', { granularity: 'grapheme' })

export function deriveMonogram(displayName: string): string {
  const normalizedName = displayName.trim().normalize('NFC')
  const firstSegment = graphemeSegmenter.segment(normalizedName)[Symbol.iterator]().next()

  return firstSegment.done ? '' : firstSegment.value.segment.toLocaleUpperCase('es')
}
