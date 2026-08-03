export type Origin01TypographyRole = {
  readonly family: string
  readonly stylesheet: string
}

export type Origin01TypographyCombination = {
  readonly id: string
  readonly name: string
  readonly protagonist: Origin01TypographyRole
  readonly coverName: Origin01TypographyRole
  readonly editorial: Origin01TypographyRole
  readonly functional: Origin01TypographyRole
}

const font = (family: string, tier: 'principal' | 'tematica', slug: string): Origin01TypographyRole => ({
  family,
  stylesheet: `/fonts/limen/${tier}/${slug}/font-face.css`,
})

const combination = (
  id: string,
  name: string,
  protagonist: Origin01TypographyRole,
  editorial: Origin01TypographyRole,
  functional: Origin01TypographyRole,
): Origin01TypographyCombination => ({
  id,
  name,
  protagonist,
  coverName: { ...protagonist },
  editorial,
  functional,
})

export const origin01TypographyCombinations: readonly Origin01TypographyCombination[] = [
  combination('noche-plateada', 'Noche plateada', font('Cormorant Garamond', 'principal', 'cormorantgaramond'), font('Prata', 'principal', 'prata'), font('Instrument Sans', 'principal', 'instrumentsans')),
  combination('gala-moderna', 'Gala moderna', font('Bodoni Moda', 'principal', 'bodonimoda'), font('Raleway', 'principal', 'raleway'), font('Montserrat', 'principal', 'montserrat')),
  combination('romantica-clasica', 'Romántica clásica', font('Pinyon Script', 'principal', 'pinyonscript'), font('Playfair Display', 'principal', 'playfairdisplay'), font('Jost', 'principal', 'jost')),
  combination('garden-antigua', 'Garden antigua', font('WindSong', 'principal', 'windsong'), font('Fraunces', 'principal', 'fraunces'), font('Quicksand', 'principal', 'quicksand')),
  combination('editorial-silenciosa', 'Editorial silenciosa', font('Mea Culpa', 'principal', 'meaculpa'), font('Ovo', 'principal', 'ovo'), font('Questrial', 'principal', 'questrial')),
  combination('boda-clasica', 'Boda clásica', font('Alex Brush', 'principal', 'alexbrush'), font('Bona Nova', 'principal', 'bonanova'), font('Montserrat', 'principal', 'montserrat')),
  combination('quince-moderno', 'Quince moderno', font('Euphoria Script', 'principal', 'euphoriascript'), font('DM Serif Display', 'principal', 'dmserifdisplay'), font('Poppins', 'principal', 'poppins')),
  combination('retro-sofisticada', 'Retro sofisticada', font('Sacramento', 'principal', 'sacramento'), font('Calistoga', 'principal', 'calistoga'), font('Jost', 'principal', 'jost')),
  combination('fiesta-nocturna', 'Fiesta nocturna', font('Bebas Neue', 'principal', 'bebasneue'), font('Francois One', 'tematica', 'francoisone'), font('Inter', 'principal', 'inter')),
  combination('urbana', 'Urbana', font('Permanent Marker', 'tematica', 'permanentmarker'), font('Londrina Solid', 'tematica', 'londrinasolid'), font('Instrument Sans', 'principal', 'instrumentsans')),
  combination('fantasia-ceremonial', 'Fantasía ceremonial', font('Cinzel Decorative', 'tematica', 'cinzeldecorative'), font('Cormorant Garamond', 'principal', 'cormorantgaramond'), font('Raleway', 'principal', 'raleway')),
  combination('cercana-artesanal', 'Cercana artesanal', font('Beth Ellen', 'principal', 'bethellen'), font('Lora', 'principal', 'lora'), font('Nunito', 'principal', 'nunito')),
] as const

export const defaultOrigin01TypographyCombination = origin01TypographyCombinations[0]

export function findOrigin01TypographyCombination(id: string | null | undefined) {
  return origin01TypographyCombinations.find((combination) => combination.id === id)
}

export function isOrigin01TypographyCombination(value: unknown): value is Origin01TypographyCombination {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<Origin01TypographyCombination>
  const roles = [candidate.protagonist, candidate.coverName, candidate.editorial, candidate.functional]
  return typeof candidate.id === 'string' && typeof candidate.name === 'string'
    && roles.every((role) => typeof role?.family === 'string' && typeof role.stylesheet === 'string')
}

export function getOrigin01TypographyStylesheets(combination: Origin01TypographyCombination) {
  return [...new Set([
    combination.protagonist.stylesheet,
    combination.coverName.stylesheet,
    combination.editorial.stylesheet,
    combination.functional.stylesheet,
  ])]
}
