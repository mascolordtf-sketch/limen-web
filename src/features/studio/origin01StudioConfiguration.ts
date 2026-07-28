import type { InvitationModuleId } from '../invitations/engine/moduleTypes'
import type { StudioDomainDefinition, StudioNavigationItem } from './studioNavigation'

const item = (
  id: string,
  label: string,
  description: string,
  editorId: string,
  options: Partial<StudioNavigationItem> = {},
): StudioNavigationItem => ({ id, label, description, editorId, ...options })

const scene = (
  sceneId: InvitationModuleId,
  label: string,
  description: string,
  editorId: string,
  required: boolean,
): StudioNavigationItem => item(sceneId, label, description, editorId, {
  sceneId,
  required,
  canToggle: !required,
  previewTarget: { domainId: 'experiences', sceneId, purpose: 'contextual-review' },
})

/** Origin 01 owns this editorial composition; it is not a universal Studio scene list. */
export const origin01StudioDomains: readonly StudioDomainDefinition[] = [
  {
    id: 'identity', label: 'Identidad', order: 1, kind: 'canonical-data',
    description: 'Personas y proyecciones automáticas.',
    items: [
      item('people', 'Personas', 'Fuentes canónicas de identidad.', 'identity'),
      item('identity-projections', 'Proyecciones', 'Valores derivados de las identidades.', 'identity-projections'),
    ],
  },
  {
    id: 'event', label: 'Evento', order: 2, kind: 'canonical-data',
    description: 'Datos canónicos, operación y textos informativos.',
    items: [
      item('canonical-event', 'Datos canónicos', 'Fecha, horario, lugar y dirección.', 'event-canonical'),
      item('event-operations', 'Información operativa', 'Destinos de RSVP y regalos.', 'event-operations'),
      item('event-copy', 'Textos editoriales', 'Cuenta regresiva y datos del evento.', 'event-copy'),
    ],
  },
  {
    id: 'narrative', label: 'Narrativa', order: 3, kind: 'editorial',
    description: 'Recorrido emocional canónico de Origin 01.',
    items: [
      item('opening', 'Apertura', 'Preludio y Portada.', 'opening', { groupId: 'opening', required: true,
        previewTarget: { domainId: 'narrative', groupId: 'opening', purpose: 'contextual-review' } }),
      item('story', 'Historia', 'Historia personal.', 'story', { sceneId: 'story', required: false, canToggle: true,
        previewTarget: { domainId: 'narrative', sceneId: 'story', purpose: 'contextual-review' } }),
      item('closing', 'Cierre', 'Cierre narrativo.', 'closing', { sceneId: 'closing', required: true,
        previewTarget: { domainId: 'narrative', sceneId: 'closing', purpose: 'contextual-review' } }),
    ],
  },
  {
    id: 'experiences', label: 'Experiencias', order: 4, kind: 'editorial',
    description: 'Escenas complementarias de Origin 01.',
    items: [
      scene('countdown', 'Cuenta regresiva', 'Textos de anticipación.', 'countdown', false),
      scene('dressCode', 'Dress Code', 'Indicaciones de vestimenta.', 'dress-code', false),
      scene('gallery', 'Galería', 'Textos y epígrafes de medios canónicos.', 'gallery', false),
      scene('trivia', 'Trivia', 'Presentación, preguntas canónicas y resultados.', 'trivia', false),
      scene('gifts', 'Regalos', 'Textos y dato operativo.', 'gifts', false),
      scene('rsvp', 'RSVP', 'Textos y destino de confirmación.', 'rsvp', false),
    ],
  },
  {
    id: 'review', label: 'Revisión', order: 5, kind: 'operational-review',
    description: 'Validez, escenas, audiencias y preparación editorial.',
    items: [
      item('general-status', 'Estado general', 'Validez técnica y completitud.', 'review-status'),
      item('errors', 'Errores', 'Problemas agrupados por origen.', 'review-errors'),
      item('scenes', 'Escenas', 'Estado de escenas activas e inactivas.', 'review-scenes'),
      item('checklist', 'Checklist', 'Revisión editorial futura.', 'review-checklist'),
      item('audiences', 'Audiencias', 'Revisión como protagonista e invitado.', 'review-audiences'),
      item('share-message', 'Mensaje para compartir', 'Preparación del mensaje.', 'share'),
    ],
  },
]

export const origin01TriviaFlow = [
  { id: 'presentation', label: 'Presentación' },
  { id: 'questions', label: 'Preguntas', preservesCanonicalOrder: true },
  { id: 'results', label: 'Resultados' },
  { id: 'summary', label: 'Resumen de completitud' },
] as const
