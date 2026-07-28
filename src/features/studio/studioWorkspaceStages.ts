export const studioWorkspaceStages = [
  { id: 'design', label: 'Diseño' },
  { id: 'sections', label: 'Secciones' },
  { id: 'content', label: 'Contenido' },
  { id: 'review', label: 'Revisión' },
] as const

export type StudioWorkspaceStage = (typeof studioWorkspaceStages)[number]['id']
