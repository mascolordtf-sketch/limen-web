export type Origin01TypographyRole = {
  readonly family: string
  readonly stylesheet: string
}

export type Origin01TypographyCombination = {
  readonly id: string
  readonly name: string
  readonly coverName: Origin01TypographyRole
  readonly editorial: Origin01TypographyRole
  readonly functional: Origin01TypographyRole
}

const font = (family: string, tier: 'principal' | 'tematica', slug: string): Origin01TypographyRole => ({
  family,
  stylesheet: `/fonts/limen/${tier}/${slug}/font-face.css`,
})

export const origin01TypographyCombinations: readonly Origin01TypographyCombination[] = [
  { id: 'noche-plateada', name: 'Noche plateada', coverName: font('Cormorant Garamond', 'principal', 'cormorantgaramond'), editorial: font('Prata', 'principal', 'prata'), functional: font('Instrument Sans', 'principal', 'instrumentsans') },
  { id: 'gala-moderna', name: 'Gala moderna', coverName: font('Bodoni Moda', 'principal', 'bodonimoda'), editorial: font('Raleway', 'principal', 'raleway'), functional: font('Montserrat', 'principal', 'montserrat') },
  { id: 'romantica-clasica', name: 'Romántica clásica', coverName: font('Pinyon Script', 'principal', 'pinyonscript'), editorial: font('Playfair Display', 'principal', 'playfairdisplay'), functional: font('Jost', 'principal', 'jost') },
  { id: 'garden-antigua', name: 'Garden antigua', coverName: font('WindSong', 'principal', 'windsong'), editorial: font('Fraunces', 'principal', 'fraunces'), functional: font('Quicksand', 'principal', 'quicksand') },
  { id: 'editorial-silenciosa', name: 'Editorial silenciosa', coverName: font('Mea Culpa', 'principal', 'meaculpa'), editorial: font('Ovo', 'principal', 'ovo'), functional: font('Questrial', 'principal', 'questrial') },
  { id: 'boda-clasica', name: 'Boda clásica', coverName: font('Alex Brush', 'principal', 'alexbrush'), editorial: font('Bona Nova', 'principal', 'bonanova'), functional: font('Montserrat', 'principal', 'montserrat') },
  { id: 'quince-moderno', name: 'Quince moderno', coverName: font('Euphoria Script', 'principal', 'euphoriascript'), editorial: font('DM Serif Display', 'principal', 'dmserifdisplay'), functional: font('Poppins', 'principal', 'poppins') },
  { id: 'retro-sofisticada', name: 'Retro sofisticada', coverName: font('Sacramento', 'principal', 'sacramento'), editorial: font('Calistoga', 'principal', 'calistoga'), functional: font('Jost', 'principal', 'jost') },
  { id: 'fiesta-nocturna', name: 'Fiesta nocturna', coverName: font('Bebas Neue', 'principal', 'bebasneue'), editorial: font('Francois One', 'tematica', 'francoisone'), functional: font('Inter', 'principal', 'inter') },
  { id: 'urbana', name: 'Urbana', coverName: font('Permanent Marker', 'tematica', 'permanentmarker'), editorial: font('Londrina Solid', 'tematica', 'londrinasolid'), functional: font('Instrument Sans', 'principal', 'instrumentsans') },
  { id: 'fantasia-ceremonial', name: 'Fantasía ceremonial', coverName: font('Cinzel Decorative', 'tematica', 'cinzeldecorative'), editorial: font('Cormorant Garamond', 'principal', 'cormorantgaramond'), functional: font('Raleway', 'principal', 'raleway') },
  { id: 'cercana-artesanal', name: 'Cercana artesanal', coverName: font('Beth Ellen', 'principal', 'bethellen'), editorial: font('Lora', 'principal', 'lora'), functional: font('Nunito', 'principal', 'nunito') },
] as const

export const defaultOrigin01TypographyCombination = origin01TypographyCombinations[0]

export function findOrigin01TypographyCombination(id: string | null | undefined) {
  return origin01TypographyCombinations.find((combination) => combination.id === id)
}

export function getOrigin01TypographyStylesheets(combination: Origin01TypographyCombination) {
  return [...new Set([
    combination.coverName.stylesheet,
    combination.editorial.stylesheet,
    combination.functional.stylesheet,
  ])]
}
