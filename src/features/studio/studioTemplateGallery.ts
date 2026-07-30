import type { InvitationTemplateDefinition } from '../invitations/engine/templateTypes'

export type StudioTemplateAvailability = 'available' | 'coming-soon'

export type StudioTemplateOption = {
  readonly id: string
  readonly name: string
  readonly collection: string
  readonly description: string
  readonly availability: StudioTemplateAvailability
  readonly preview: { readonly src: string; readonly alt: string }
  readonly demoPath?: string
  readonly highlights: readonly string[]
  readonly selectable: boolean
  readonly exploration: boolean
}

export type StudioTemplateGalleryState = {
  readonly view: 'main' | 'gallery'
  readonly selectedId: string
}

export type StudioTemplateGalleryAction =
  | { readonly type: 'open-gallery' }
  | { readonly type: 'close-gallery' }
  | { readonly type: 'select'; readonly templateId: string }

const futureExplorations: readonly StudioTemplateOption[] = [
  ['example-editorial', 'Editorial', 'Una exploración de composición serena y directa.', '/images/origin-01/dress-detail.webp'],
  ['example-minimal', 'Esencial', 'Una exploración de estructura simple y espaciosa.', '/images/origin-01/gift-still-life.webp'],
  ['example-celebration', 'Celebración', 'Una exploración pensada para un recorrido festivo.', '/images/origin-01/closing-valentina.webp'],
].map(([id, name, description, src]) => ({
  id, name, collection: 'Exploración futura', description, availability: 'coming-soon' as const,
  preview: { src, alt: `Referencia visual de la exploración ${name}` }, highlights: [],
  selectable: false, exploration: true,
}))

export function createStudioTemplateOptions(
  template: InvitationTemplateDefinition,
  demoPath = '/demo/LMN-015-001',
): readonly StudioTemplateOption[] {
  return [{
    id: template.id,
    name: template.internalName,
    collection: 'Origen',
    description: 'Una experiencia nocturna, elegante y narrativa, construida como un recorrido de escenas.',
    availability: 'available',
    preview: {
      src: '/images/origin-01/hero-valentina.webp',
      alt: 'Vista de Origin 01 con el retrato de Valentina en una escena nocturna',
    },
    demoPath,
    highlights: ['Apertura narrativa', 'Historia y galería', 'Detalles del evento', 'Trivia, regalos y confirmación'],
    selectable: true,
    exploration: false,
  }, ...futureExplorations]
}

export function createStudioTemplateGalleryState(selectedId: string): StudioTemplateGalleryState {
  return { view: 'main', selectedId: selectedId === 'origin01' ? selectedId : 'origin01' }
}

export function transitionStudioTemplateGallery(
  state: StudioTemplateGalleryState,
  action: StudioTemplateGalleryAction,
): StudioTemplateGalleryState {
  if (action.type === 'open-gallery') return { ...state, view: 'gallery' }
  if (action.type === 'close-gallery') return { ...state, view: 'main' }
  return action.templateId === 'origin01' ? { ...state, selectedId: action.templateId } : state
}
