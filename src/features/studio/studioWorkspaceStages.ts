export const studioWorkspaceStages = [
  { id: 'template', label: 'Plantilla' },
  { id: 'aesthetic', label: 'Estética' },
  { id: 'sections', label: 'Secciones' },
  { id: 'content', label: 'Contenido' },
  { id: 'review', label: 'Revisión' },
] as const

export type StudioWorkspaceStage = (typeof studioWorkspaceStages)[number]['id']
