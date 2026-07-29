import type { InvitationTemplateDefinition } from '../invitations/engine/templateTypes'

export type StudioTemplateCelebration = 'all' | 'cumpleanos' | 'casamiento' | 'general'
export type StudioTemplateStyle = 'all' | 'narrativa' | 'editorial' | 'minimalista'

export type StudioTemplateOption = {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly celebration: Exclude<StudioTemplateCelebration, 'all'>
  readonly style: Exclude<StudioTemplateStyle, 'all'>
  readonly featured: boolean
  readonly source: 'production' | 'isolated-example'
}

export type StudioTemplateGalleryState = {
  readonly view: 'main' | 'gallery'
  readonly selectedId: string
  readonly celebration: StudioTemplateCelebration
  readonly style: StudioTemplateStyle
}

export type StudioTemplateGalleryAction =
  | { readonly type: 'open-gallery' }
  | { readonly type: 'close-gallery' }
  | { readonly type: 'select'; readonly templateId: string }
  | { readonly type: 'filter-celebration'; readonly celebration: StudioTemplateCelebration }
  | { readonly type: 'filter-style'; readonly style: StudioTemplateStyle }

const isolatedExamples: readonly StudioTemplateOption[] = [
  { id: 'example-editorial', name: 'Editorial', description: 'Una muestra de composición serena y directa.',
    celebration: 'casamiento', style: 'editorial', featured: true, source: 'isolated-example' },
  { id: 'example-minimal', name: 'Esencial', description: 'Una muestra de estructura simple y espaciosa.',
    celebration: 'general', style: 'minimalista', featured: true, source: 'isolated-example' },
  { id: 'example-celebration', name: 'Celebración', description: 'Una muestra pensada para un recorrido festivo.',
    celebration: 'cumpleanos', style: 'narrativa', featured: false, source: 'isolated-example' },
]

export function createStudioTemplateOptions(template: InvitationTemplateDefinition): readonly StudioTemplateOption[] {
  return [{ id: template.id, name: template.internalName, description: template.description,
    celebration: 'cumpleanos', style: 'narrativa', featured: true, source: 'production' }, ...isolatedExamples]
}

export function createStudioTemplateGalleryState(selectedId: string): StudioTemplateGalleryState {
  return { view: 'main', selectedId, celebration: 'all', style: 'all' }
}

export function transitionStudioTemplateGallery(
  state: StudioTemplateGalleryState,
  action: StudioTemplateGalleryAction,
): StudioTemplateGalleryState {
  if (action.type === 'open-gallery') return { ...state, view: 'gallery' }
  if (action.type === 'close-gallery') return { ...state, view: 'main' }
  if (action.type === 'select') return { ...state, selectedId: action.templateId }
  if (action.type === 'filter-celebration') return { ...state, celebration: action.celebration }
  return { ...state, style: action.style }
}

export function filterStudioTemplateOptions(
  templates: readonly StudioTemplateOption[],
  state: Pick<StudioTemplateGalleryState, 'celebration' | 'style'>,
) {
  return templates.filter((template) => (state.celebration === 'all' || template.celebration === state.celebration)
    && (state.style === 'all' || template.style === state.style))
}
