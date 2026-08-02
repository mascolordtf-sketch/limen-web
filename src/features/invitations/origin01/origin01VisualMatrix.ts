import type { InvitationAudience } from '../engine/invitationTypes'
import type { InvitationModuleId } from '../engine/moduleTypes'
import type { Origin01InvitationData } from './origin01ContentTypes'
import { origin01Template } from './origin01Template'
import { origin01ThemeVariantIds, type Origin01ThemeVariantId } from './origin01ThemeVariants'

export const origin01VisualMatrixViewports = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 1000 },
} as const

export type Origin01VisualMatrixViewportId = keyof typeof origin01VisualMatrixViewports
export type Origin01VisualMatrixBoundaryProfile = 'short' | 'long'

export type Origin01VisualMatrixCase = {
  readonly id: string
  readonly scene: InvitationModuleId
  readonly audience: InvitationAudience
  readonly variant: Origin01ThemeVariantId
  readonly viewportId: Origin01VisualMatrixViewportId
  readonly viewport: (typeof origin01VisualMatrixViewports)[Origin01VisualMatrixViewportId]
  readonly contentProfile: 'canonical' | Origin01VisualMatrixBoundaryProfile
  readonly invitation: Origin01InvitationData
  readonly startAtInvitation: boolean
  readonly startAtPrelude: boolean
  readonly targetId: string
}

const sceneTargetIds = {
  prelude: 'origin01-prelude-title',
  hero: 'origin01-hero-title',
  countdown: 'origin01-countdown-title',
  story: 'origin01-message-title',
  eventDetails: 'origin01-info-title',
  schedule: 'origin01-schedule-title',
  weather: 'origin01-weather-title',
  dressCode: 'origin01-dress-title',
  gallery: 'origin01-gallery-title',
  instagram: 'origin01-community-title',
  trivia: 'origin01-trivia-title',
  gifts: 'origin01-gift-title',
  rsvp: 'origin01-rsvp-title',
  closing: 'origin01-closing-title',
} as const satisfies Readonly<Record<(typeof origin01Template.canonicalOrder)[number], string>>

const shortCopy = {
  eyebrow: 'Hoy',
  heading: 'Nos vemos.',
  body: 'Llegó el día.',
  action: 'Abrir',
} as const

const longCopy = {
  eyebrow: 'Una celebración que reúne cada recuerdo, cada abrazo y cada persona importante de esta historia',
  heading: 'Guardemos juntos este momento irrepetible que durante tanto tiempo imaginamos y que finalmente está por comenzar.',
  body: 'Quiero compartir con vos una noche llena de emoción, encuentros, música y pequeños instantes que vamos a recordar durante muchos años.',
  action: 'Abrir todos los detalles de esta celebración',
} as const

function withProfile(
  invitation: Origin01InvitationData,
  scene: InvitationModuleId,
  profile: Origin01VisualMatrixBoundaryProfile,
): Origin01InvitationData {
  const isShort = profile === 'short'
  const eyebrow = isShort ? shortCopy.eyebrow : longCopy.eyebrow
  const heading = isShort ? shortCopy.heading : longCopy.heading
  const body = isShort ? shortCopy.body : longCopy.body
  const action = isShort ? shortCopy.action : longCopy.action

  switch (scene) {
    case 'prelude':
      return { ...invitation, content: { ...invitation.content, prelude: {
        ...invitation.content.prelude,
        eyebrow,
        title: isShort ? 'Hola.' : 'Hola, María Valentina de los Ángeles.',
        body,
        reveal: isShort ? 'Es LIMEN.' : 'Este es el umbral donde todos los recuerdos empiezan a transformarse en celebración.',
        question: isShort ? '¿Entrás?' : '¿Estás lista para cruzarlo y descubrir cada instante que preparamos para esta noche?',
        actionLabel: action,
      } } }
    case 'hero': {
      const name = isShort ? 'Ana' : 'María Valentina de los Ángeles'
      return {
        ...invitation,
        event: { ...invitation.event, name, celebrationLabel: isShort ? '15' : 'La celebración de mis quince años' },
        identities: invitation.identities.map((identity, index) => index === 0 ? { ...identity, displayName: name } : identity),
        content: { ...invitation.content, hero: {
          ...invitation.content.hero,
          dateLabel: isShort ? '20·03·27' : 'Sábado 20 de marzo de 2027, a partir de las veintiuna horas',
          phrase: isShort ? 'Empezamos.' : heading,
        } },
      }
    }
    case 'countdown':
      return { ...invitation, content: { ...invitation.content, countdown: {
        eyebrow,
        heading,
        completedMessage: isShort ? 'Ya empezó.' : `${longCopy.body} Gracias por haber formado parte de este comienzo.`,
      } } }
    case 'story':
      return { ...invitation, content: { ...invitation.content, story: {
        eyebrow,
        message: body,
        signature: isShort ? 'Ana' : 'María Valentina de los Ángeles',
      } } }
    case 'eventDetails':
      return {
        ...invitation,
        event: {
          ...invitation.event,
          venue: isShort ? 'Lago' : 'Palacio de los Jardines del Lago y Centro de Celebraciones',
          address: isShort ? 'Encuentro 1' : 'Avenida del Encuentro de las Familias 1540, acceso principal por el paseo costero, Buenos Aires',
        },
        content: { ...invitation.content, eventDetails: {
          ...invitation.content.eventDetails,
          eyebrow,
          heading,
          venueLabel: isShort ? 'Lugar' : 'Lugar de encuentro y acceso principal',
          mapActionLabel: action,
          calendarActionLabel: isShort ? 'Agendar' : 'Guardar todos los datos en mi calendario',
          calendarDescription: body,
        } },
      }
    case 'schedule':
      return { ...invitation, content: { ...invitation.content, schedule: {
        eyebrow,
        heading,
        introduction: body,
        moments: isShort
          ? [{ id: 'start', time: '21:00', title: 'Inicio' }]
          : Array.from({ length: 8 }, (_, index) => ({
              id: `long-${index + 1}`,
              time: `${String(16 + index).padStart(2, '0')}:00`,
              title: `Momento ${index + 1}: ${heading}`,
              description: body,
            })),
      } } }
    case 'weather':
      return { ...invitation, content: { ...invitation.content, weather: {
        ...invitation.content.weather,
        eyebrow,
        heading,
        introduction: body,
        location: {
          ...invitation.content.weather.location,
          name: isShort ? 'Haedo' : 'Ciudad Autónoma de Buenos Aires y área metropolitana occidental',
          admin1: isShort ? 'Buenos Aires' : 'Provincia de Buenos Aires, República Argentina',
        },
      } } }
    case 'dressCode':
      return { ...invitation, content: { ...invitation.content, dressCode: {
        ...invitation.content.dressCode,
        eyebrow,
        title: isShort ? 'Gala' : 'Elegante de noche con libertad para expresar tu propio estilo',
        description: body,
        note: isShort ? 'Sé vos.' : 'La elegancia también está en sentirse cómodo, auténtico y preparado para disfrutar cada momento.',
      } } }
    case 'gallery':
      return { ...invitation, content: { ...invitation.content, gallery: {
        ...invitation.content.gallery,
        eyebrow,
        heading,
        images: invitation.content.gallery.images.map((image, index) => ({
          ...image,
          caption: isShort ? `${index + 1}` : `Instante ${index + 1}: ${longCopy.body}`,
        })),
      } } }
    case 'instagram':
      return { ...invitation, content: { ...invitation.content, community: {
        ...invitation.content.community,
        eyebrow,
        heading,
        introduction: body,
        instagram: { ...invitation.content.community.instagram,
          handle: isShort ? 'ana15' : 'mvalentina.celebra.sus15', actionLabel: action },
        hashtag: { ...invitation.content.community.hashtag,
          value: isShort ? '#Ana15' : '#MariaValentinaCelebraUnaNocheParaRecordar',
          actionLabel: isShort ? 'Copiar' : 'Copiar el hashtag oficial de la celebración',
          copiedLabel: isShort ? 'Copiado' : 'Hashtag oficial copiado correctamente' },
        album: { ...invitation.content.community.album,
          invitation: body, actionLabel: isShort ? 'Álbum' : 'Abrir el álbum compartido de toda la celebración' },
      } } }
    case 'trivia':
      return { ...invitation, content: { ...invitation.content, trivia: {
        ...invitation.content.trivia,
        protagonistName: isShort ? 'Ana' : 'María Valentina de los Ángeles',
        accessibleTitle: heading,
        introEyebrow: eyebrow,
        title: heading,
        description: body,
        primaryActionLabel: action,
        questions: invitation.content.trivia.questions.map((question, questionIndex) => ({
          ...question,
          prompt: isShort ? `Pregunta ${questionIndex + 1}` : `Pregunta ${questionIndex + 1}: ${heading}`,
          options: question.options.map((option, optionIndex) => ({
            ...option,
            label: isShort ? `${optionIndex + 1}` : `Opción ${optionIndex + 1}: ${longCopy.body}`,
          })),
          correctFeedback: isShort ? 'Bien.' : longCopy.body,
          incorrectFeedback: question.incorrectFeedback === undefined
            ? undefined : isShort ? 'Otra.' : `${longCopy.body} Probemos una opción diferente.`,
        })),
        resultTiers: invitation.content.trivia.resultTiers.map((tier) => ({
          ...tier,
          title: isShort ? 'Resultado' : heading,
          message: body,
        })),
        revealTitle: isShort ? 'Gracias' : heading,
        revealMessage: body,
        revealSignature: isShort ? 'Ana' : 'María Valentina de los Ángeles',
      } } }
    case 'gifts':
      return { ...invitation, content: { ...invitation.content, gifts: {
        ...invitation.content.gifts,
        eyebrow,
        title: isShort ? 'Regalo' : heading,
        description: body,
        accountHolder: isShort ? 'Ana' : 'María Valentina de los Ángeles González',
        bankName: isShort ? 'Banco' : 'Banco Cooperativo de la Celebración Argentina',
        accountLabel: isShort ? 'Alias' : 'Alias para acompañar este momento con un regalo',
        accountValue: isShort ? 'ANA15' : 'MARIA.VALENTINA.CELEBRACION.LIMEN',
        demoNote: isShort ? 'Demo.' : `${longCopy.body} Estos datos pertenecen únicamente a una demostración.`,
      } } }
    case 'rsvp':
      return { ...invitation, content: { ...invitation.content, rsvp: {
        ...invitation.content.rsvp,
        eyebrow,
        title: heading,
        description: body,
        actionLabel: action,
        message: isShort ? 'Confirmo.' : `${longCopy.body} Confirmo mi asistencia junto con las personas informadas.`,
        demoNote: isShort ? 'Demo.' : 'Esta acción abre WhatsApp con un mensaje de demostración y no envía información automáticamente.',
      } } }
    case 'closing':
      return { ...invitation, content: { ...invitation.content, closing: {
        ...invitation.content.closing,
        eyebrow,
        title: heading,
        signature: isShort ? 'Ana' : 'María Valentina de los Ángeles',
        sharePrompt: body,
        shareActionLabel: action,
        shareTitle: isShort ? 'Mis 15' : heading,
        shareText: body,
      } } }
    default:
      return invitation
  }
}

function findViewport(value: string): Origin01VisualMatrixViewportId | undefined {
  return Object.hasOwn(origin01VisualMatrixViewports, value)
    ? value as Origin01VisualMatrixViewportId
    : undefined
}

export function resolveOrigin01VisualMatrixCase(
  caseId: string | null | undefined,
  canonicalInvitation: Origin01InvitationData,
): Origin01VisualMatrixCase | undefined {
  if (!caseId) return undefined

  for (const scene of origin01Template.canonicalOrder) {
    for (const audience of ['protagonist', 'guest'] as const) {
      for (const variant of origin01ThemeVariantIds) {
        for (const viewportId of Object.keys(origin01VisualMatrixViewports) as Origin01VisualMatrixViewportId[]) {
          if (caseId !== `BASE-${scene}-${audience}-${variant}-${viewportId}`) continue
          return {
            id: caseId, scene, audience, variant, viewportId,
            viewport: origin01VisualMatrixViewports[viewportId], contentProfile: 'canonical',
            invitation: { ...canonicalInvitation, themeVariant: variant },
            startAtInvitation: scene !== 'prelude', startAtPrelude: scene === 'prelude',
            targetId: sceneTargetIds[scene],
          }
        }
      }
    }
    for (const contentProfile of ['short', 'long'] as const) {
      for (const viewportValue of Object.keys(origin01VisualMatrixViewports)) {
        const viewportId = findViewport(viewportValue)
        if (!viewportId || caseId !== `BOUNDARY-${scene}-${contentProfile}-${viewportId}`) continue
        return {
          id: caseId, scene, audience: 'protagonist', variant: 'origin01-wine', viewportId,
          viewport: origin01VisualMatrixViewports[viewportId], contentProfile,
          invitation: withProfile(canonicalInvitation, scene, contentProfile),
          startAtInvitation: scene !== 'prelude', startAtPrelude: scene === 'prelude',
          targetId: sceneTargetIds[scene],
        }
      }
    }
  }

  return undefined
}
