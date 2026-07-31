import type { InvitationModuleId } from '../invitations/engine/moduleTypes'
import type { Origin01StudioDraft } from './origin01StudioDraft'

export type StudioSceneId = 'general' | 'cover' | 'countdown' | 'story' | 'event-details' | 'dress-code'
  | 'schedule' | 'weather' | 'gallery' | 'trivia' | 'gifts' | 'rsvp' | 'closing'

export type StudioPublicScene = {
  id: Exclude<StudioSceneId, 'general'>
  label: string
  description: string
  moduleIds: readonly InvitationModuleId[]
  editorIds: readonly string[]
  required: boolean
}

export const studioGeneralScene = {
  id: 'general', label: 'Datos generales', description: 'Identidad, fecha, lugar y datos de contacto reutilizables.',
  editorIds: ['identity', 'event-canonical', 'event-operations', 'share'],
} as const

/** Public Studio vocabulary. Engine module IDs remain private implementation details. */
export const studioPublicScenes: readonly StudioPublicScene[] = [
  { id: 'cover', label: 'Portada', description: 'Inicio de la experiencia', moduleIds: ['prelude', 'hero'], editorIds: ['opening'], required: true },
  { id: 'countdown', label: 'Cuenta regresiva', description: 'Espera hasta el comienzo', moduleIds: ['countdown'], editorIds: ['countdown'], required: false },
  { id: 'story', label: 'Historia', description: 'Relato y fotografías personales', moduleIds: ['story'], editorIds: ['story'], required: false },
  { id: 'event-details', label: 'Información del evento', description: 'Fecha, lugar, mapa y calendario', moduleIds: ['eventDetails'], editorIds: ['event-copy'], required: true },
  { id: 'schedule', label: 'Cronograma', description: 'Horarios y momentos de la celebración', moduleIds: ['schedule'], editorIds: ['schedule'], required: false },
  { id: 'weather', label: 'Clima', description: 'Pronóstico real para la fecha y la localidad', moduleIds: ['weather'], editorIds: ['weather'], required: false },
  { id: 'dress-code', label: 'Dress code', description: 'Estilo sugerido para la celebración', moduleIds: ['dressCode'], editorIds: ['dress-code'], required: false },
  { id: 'gallery', label: 'Galería', description: 'Colección de recuerdos', moduleIds: ['gallery'], editorIds: ['gallery'], required: false },
  { id: 'trivia', label: 'Trivia', description: 'Juego para invitados', moduleIds: ['trivia'], editorIds: ['trivia'], required: false },
  { id: 'gifts', label: 'Regalos', description: 'Datos para obsequios', moduleIds: ['gifts'], editorIds: ['gifts'], required: false },
  { id: 'rsvp', label: 'Confirmación', description: 'Respuesta y contacto de los invitados', moduleIds: ['rsvp'], editorIds: ['rsvp'], required: true },
  { id: 'closing', label: 'Cierre', description: 'Última escena de la experiencia', moduleIds: ['closing'], editorIds: ['closing'], required: true },
]

export function isStudioSceneIncluded(draft: Pick<Origin01StudioDraft, 'modules'>, scene: StudioPublicScene) {
  return scene.moduleIds.every((moduleId) => draft.modules.find((module) => module.moduleId === moduleId)?.enabled)
}

export function getVisibleStudioScenes(draft: Pick<Origin01StudioDraft, 'modules'>) {
  return [studioGeneralScene, ...studioPublicScenes.filter((scene) => scene.required || isStudioSceneIncluded(draft, scene))]
}

export const studioScenes = [studioGeneralScene, ...studioPublicScenes] as const

export function findStudioSceneByEditorId(editorId: string) {
  return studioScenes.find((scene) => (scene.editorIds as readonly string[]).includes(editorId)) ?? null
}

export function selectSceneAfterExclusion(sceneId: StudioSceneId, draft: Pick<Origin01StudioDraft, 'modules'>): StudioSceneId {
  const visible = getVisibleStudioScenes(draft)
  if (visible.some(({ id }) => id === sceneId)) return sceneId
  const excludedIndex = studioPublicScenes.findIndex(({ id }) => id === sceneId)
  const visibleIds = new Set(visible.map(({ id }) => id))
  const next = studioPublicScenes.slice(excludedIndex + 1).find((scene) => visibleIds.has(scene.id))
  if (next) return next.id
  const previous = studioPublicScenes.slice(0, excludedIndex).reverse().find((scene) => visibleIds.has(scene.id))
  return previous?.id ?? 'general'
}
