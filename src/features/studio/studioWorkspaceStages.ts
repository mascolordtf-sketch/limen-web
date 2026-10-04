export const studioWorkspaceStages = [
  { id: 'design', label: 'Diseño' },
  { id: 'sections', label: 'Secciones' },
  { id: 'content', label: 'Contenido' },
  { id: 'media', label: 'Fotos y música' },
  { id: 'review', label: 'Revisar y publicar' },
] as const

export type StudioWorkspaceStage = (typeof studioWorkspaceStages)[number]['id']

export function createStudioReturnToReview<T>(errorsItem: T) {
  return { activeStage: 'review' as const, navigation: { type: 'open-item' as const, domainId: 'review' as const, item: errorsItem } }
}
