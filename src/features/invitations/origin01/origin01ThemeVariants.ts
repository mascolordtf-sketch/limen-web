import type { ThemeVariantId } from '../engine/templateTypes'

export const origin01ThemeVariantIds = [
  'origin01-wine',
  'origin01-midnight',
  'origin01-garden',
] as const satisfies readonly ThemeVariantId[]

export type Origin01ThemeVariantId = (typeof origin01ThemeVariantIds)[number]

export type Origin01ThemeVariantDefinition = {
  readonly id: Origin01ThemeVariantId
  readonly name: string
  readonly description: string
  readonly character: string
  readonly palette: readonly {
    readonly name: string
    readonly role: string
    readonly value: string
  }[]
}

export const origin01ThemeVariants: readonly Origin01ThemeVariantDefinition[] = [
  {
    id: 'origin01-wine',
    name: 'Vino nocturno',
    description: 'Borgoña profundo, rosa antiguo y oro suave para una atmósfera íntima y ceremonial.',
    character: 'Íntimo · Cinematográfico · Editorial',
    palette: [
      { name: 'Vino', role: 'Fondo', value: '#3b1d2d' },
      { name: 'Marfil', role: 'Texto', value: '#f5efe7' },
      { name: 'Oro', role: 'Acento', value: '#c49b62' },
      { name: 'Rosa', role: 'Detalle', value: '#d8b8bc' },
    ],
  },
  {
    id: 'origin01-midnight',
    name: 'Noche plateada',
    description: 'Azul profundo, plata y luz fría para una celebración elegante de carácter nocturno.',
    character: 'Sereno · Luminoso · Refinado',
    palette: [
      { name: 'Medianoche', role: 'Fondo', value: '#101c2d' },
      { name: 'Niebla', role: 'Texto', value: '#eef1f5' },
      { name: 'Plata', role: 'Acento', value: '#aebbc8' },
      { name: 'Azul', role: 'Detalle', value: '#8298b1' },
    ],
  },
  {
    id: 'origin01-garden',
    name: 'Jardín antiguo',
    description: 'Verde bosque, lino y bronce para una atmósfera orgánica, cálida y serena.',
    character: 'Orgánico · Cálido · Atemporal',
    palette: [
      { name: 'Bosque', role: 'Fondo', value: '#1d3028' },
      { name: 'Lino', role: 'Texto', value: '#f2eee4' },
      { name: 'Bronce', role: 'Acento', value: '#b28a5f' },
      { name: 'Salvia', role: 'Detalle', value: '#aab7a5' },
    ],
  },
]

export function findOrigin01ThemeVariant(id: Origin01ThemeVariantId) {
  return origin01ThemeVariants.find((variant) => variant.id === id)
}
