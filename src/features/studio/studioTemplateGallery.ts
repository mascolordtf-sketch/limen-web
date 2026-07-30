import type { InvitationTemplateDefinition } from '../invitations/engine/templateTypes'

export type StudioTemplateAvailability = 'available' | 'coming-soon'

export type StudioTemplateOption = {
  readonly id: string
  readonly name: string
  readonly collection: string
  readonly description: string
  readonly availability: StudioTemplateAvailability
  readonly preview:
    | { readonly kind: 'image'; readonly src: string; readonly alt: string }
    | { readonly kind: 'concept'; readonly motif: 'editorial' | 'essential' | 'celebration'; readonly label: string }
  readonly demoPath?: string
  readonly highlights: readonly string[]
  readonly selectable: boolean
  readonly exploration: boolean
}

export type StudioTemplateGalleryState = {
  readonly selectedId: string
}

export type StudioTemplateGalleryAction = {
  readonly type: 'select'
  readonly templateId: string
  readonly selectable: boolean
}

const futureExplorations = [
  ['example-editorial', 'Editorial', 'Una exploración de composición serena y directa.', 'editorial'],
  ['example-minimal', 'Esencial', 'Una exploración de estructura simple y espaciosa.', 'essential'],
  ['example-celebration', 'Celebración', 'Una exploración pensada para un recorrido festivo.', 'celebration'],
] as const

const futureTemplateOptions = futureExplorations.map(([id, name, description, motif]) => ({
  id, name, collection: 'Exploración futura', description, availability: 'coming-soon' as const,
  preview: { kind: 'concept' as const, motif, label: `Composición conceptual ${name}` }, highlights: [],
  selectable: false, exploration: true,
}))

export function createStudioTemplateOptions(
  template: InvitationTemplateDefinition,
  demoPath?: string,
): readonly StudioTemplateOption[] {
  return [{
    id: template.id,
    name: template.internalName,
    collection: 'Origen',
    description: 'Experiencia narrativa, nocturna y elegante.',
    availability: 'available',
    preview: {
      kind: 'image', src: '/images/origin-01/hero-valentina.webp',
      alt: 'Vista de Origin 01 con el retrato de Valentina en una escena nocturna',
    },
    demoPath,
    highlights: ['Portada', 'Historia', 'Galería', 'Trivia'],
    selectable: true,
    exploration: false,
  }, ...futureTemplateOptions]
}

export function createStudioTemplateGalleryState(selectedId: string, availableId = selectedId): StudioTemplateGalleryState {
  return { selectedId: selectedId === availableId ? selectedId : availableId }
}

export function transitionStudioTemplateGallery(
  state: StudioTemplateGalleryState,
  action: StudioTemplateGalleryAction,
): StudioTemplateGalleryState {
  return action.selectable ? { selectedId: action.templateId } : state
}
