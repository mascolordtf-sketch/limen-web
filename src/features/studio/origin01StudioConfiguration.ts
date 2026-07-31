import type { InvitationModuleId } from '../invitations/engine/moduleTypes'
import type { InvitationTemplateDefinition } from '../invitations/engine/templateTypes'
import { origin01Template } from '../invitations/origin01/origin01Template'
import type { StudioDomainDefinition, StudioDomainId, StudioNavigationItem } from './studioNavigation'

const item = (
  id: string,
  label: string,
  description: string,
  editorId: string,
  options: Partial<StudioNavigationItem> = {},
): StudioNavigationItem => ({ id, label, description, editorId, ...options })

const sceneLabels: Readonly<Partial<Record<InvitationModuleId, readonly [string, string, string]>>> = {
  countdown: ['Cuenta regresiva', 'Textos de anticipación.', 'countdown'],
  schedule: ['Cronograma', 'Horarios y momentos de la celebración.', 'schedule'],
  weather: ['Clima', 'Pronóstico real y localidad confirmada.', 'weather'],
  dressCode: ['Dress Code', 'Indicaciones de vestimenta.', 'dress-code'],
  gallery: ['Galería', 'Textos y epígrafes de medios canónicos.', 'gallery'],
  instagram: ['Comunidad', 'Instagram, hashtag y álbum compartido.', 'community'],
  trivia: ['Trivia', 'Presentación, preguntas canónicas y resultados.', 'trivia'],
  gifts: ['Regalos', 'Textos y dato operativo.', 'gifts'],
  rsvp: ['RSVP', 'Textos y destino de confirmación.', 'rsvp'],
}

function scene(
  template: InvitationTemplateDefinition,
  sceneId: InvitationModuleId,
  domainId: StudioDomainId,
  editorialLabels?: readonly [string, string, string],
): StudioNavigationItem {
  const labels = editorialLabels ?? sceneLabels[sceneId]
  if (!labels || !template.supportedModules.includes(sceneId)) {
    throw new Error(`Origin 01 Studio references unsupported scene "${sceneId}".`)
  }
  const required = template.requiredModules.includes(sceneId)
  return item(sceneId, labels[0], labels[1], labels[2], {
    sceneId,
    required,
    canToggle: !required,
    previewTarget: { domainId, sceneId, purpose: 'contextual-review' },
  })
}

/** Origin 01 owns this editorial composition; canonical order and activation come from its template. */
export function createOrigin01StudioDomains(
  template: InvitationTemplateDefinition = origin01Template,
): readonly StudioDomainDefinition[] {
  const required = (sceneId: InvitationModuleId) => template.requiredModules.includes(sceneId)
  const experiences = template.canonicalOrder
    .filter((sceneId) => sceneLabels[sceneId] !== undefined)
    .map((sceneId) => scene(template, sceneId, 'experiences'))

  const domains: readonly StudioDomainDefinition[] = [
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
        item('event-copy', 'Textos editoriales', 'Cuenta regresiva y datos del evento.', 'event-copy', {
          sceneId: 'eventDetails', required: required('eventDetails'), canToggle: !required('eventDetails'),
          previewTarget: { domainId: 'event', sceneId: 'eventDetails', purpose: 'contextual-review' },
        }),
      ],
    },
    {
      id: 'narrative', label: 'Narrativa', order: 3, kind: 'editorial',
      description: 'Recorrido emocional canónico de Origin 01.',
      items: [
        item('opening', 'Apertura', 'Preludio y Portada.', 'opening', {
          groupId: 'opening', required: required('prelude') && required('hero'), canToggle: false,
          previewTarget: { domainId: 'narrative', groupId: 'opening', purpose: 'contextual-review' },
        }),
        scene(template, 'story', 'narrative', ['Historia', 'Historia personal.', 'story']),
        item('closing', 'Cierre', 'Cierre narrativo.', 'closing', {
          sceneId: 'closing', required: required('closing'), canToggle: !required('closing'),
          previewTarget: { domainId: 'narrative', sceneId: 'closing', purpose: 'contextual-review' },
        }),
      ],
    },
    {
      id: 'experiences', label: 'Experiencias', order: 4, kind: 'editorial',
      description: 'Escenas complementarias de Origin 01.', items: experiences,
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

  const configuredScenes = domains.flatMap(({ items }) => items.flatMap(({ sceneId }) => sceneId ? [sceneId] : []))
  const expectedScenes = template.canonicalOrder.filter((sceneId) => sceneId !== 'prelude' && sceneId !== 'hero')
  if (configuredScenes.length !== expectedScenes.length
    || expectedScenes.some((sceneId) => !configuredScenes.includes(sceneId))) {
    throw new Error('Origin 01 Studio scene metadata does not match the canonical template scenes.')
  }
  return domains
}

export const origin01StudioDomains = createOrigin01StudioDomains()

export const origin01TriviaFlow = [
  { id: 'presentation', label: 'Presentación' },
  { id: 'questions', label: 'Preguntas', preservesCanonicalOrder: true },
  { id: 'results', label: 'Resultados' },
  { id: 'summary', label: 'Resumen de completitud' },
] as const
