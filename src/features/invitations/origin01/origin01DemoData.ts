import { findInvitationTemplate } from '../engine/templateRegistry'
import { validateInvitationConfiguration } from '../engine/invitationValidation'
import type { Origin01InvitationData } from './origin01ContentTypes'

export const origin01DemoData = {
  id: 'origin01-demo-lmn-015-001',
  code: 'LMN-015-001',
  internalName: 'Demo pública Origin 01 — Valentina',
  templateId: 'origin01',
  lifecycleStatus: 'published',
  audience: 'protagonist',
  eventType: 'quince',
  themeVariant: 'origin01-wine',
  event: {
    name: 'Valentina',
    celebrationLabel: 'Mis 15',
    startsAt: '2027-03-20T21:00:00-03:00',
    endsAt: '2027-03-21T02:00:00-03:00',
    timeZone: 'America/Argentina/Buenos_Aires',
    venue: 'Palacio del Lago',
    address: 'Av. del Encuentro 1540, Buenos Aires',
  },
  identities: [{ displayName: 'Valentina', role: 'protagonist' }],
  modules: [
    { moduleId: 'prelude', enabled: true },
    { moduleId: 'hero', enabled: true },
    { moduleId: 'countdown', enabled: true },
    { moduleId: 'story', enabled: true },
    { moduleId: 'eventDetails', enabled: true },
    { moduleId: 'schedule', enabled: true },
    { moduleId: 'weather', enabled: true },
    { moduleId: 'dressCode', enabled: true },
    { moduleId: 'gallery', enabled: true },
    { moduleId: 'trivia', enabled: true },
    { moduleId: 'gifts', enabled: true },
    { moduleId: 'rsvp', enabled: true },
    { moduleId: 'closing', enabled: true },
  ],
  media: [
    { id: 'hero', kind: 'image', src: '/images/origin-01/hero-valentina.webp', alt: 'Retrato editorial de Valentina con vestido rosa dorado y luz cálida', title: 'El sueño' },
    { id: 'dress', kind: 'image', src: '/images/origin-01/dress-detail.webp', alt: 'Detalle del vestido rosa dorado iluminado suavemente', title: 'La espera' },
    { id: 'closing', kind: 'image', src: '/images/origin-01/closing-valentina.webp', alt: 'Valentina sonriendo bajo una luz cálida al final de la invitación', title: 'El comienzo' },
    { id: 'gift', kind: 'image', src: '/images/origin-01/gift-still-life.webp', alt: 'Caja de regalo rosa champagne con cinta satinada y luces cálidas' },
    { id: 'music', kind: 'audio', src: '/audio/origin-01-demo.mp3', title: 'Música de fondo' },
  ],
  content: {
    prelude: {
      eyebrow: 'Un mensaje solo para vos', title: 'Hola, Valentina.',
      body: 'Durante mucho tiempo imaginaste este momento. Hoy empieza a hacerse real.',
      reveal: 'Este es tu LIMEN.', question: '¿Estás lista para cruzarlo?', actionLabel: 'Estoy lista',
      soundHint: 'La música comienza al continuar',
    },
    envelope: {
      eyebrow: 'Una invitación para vos', heading: 'Hay momentos que comienzan mucho antes de llegar.',
      monogram: 'V', instruction: 'Tocá el sello para abrir',
    },
    hero: {
      dateLabel: '20 de marzo de 2027',
      phrase: 'Antes era un sueño. Ahora empieza.', scrollHint: 'Deslizá para descubrir ↓', imageMediaId: 'hero',
    },
    countdown: { eyebrow: 'El tiempo se acerca', heading: 'Falta menos para una noche inolvidable.', completedMessage: 'Este momento ya empezó. Gracias por haber sido parte.' },
    story: {
      eyebrow: 'Una invitación',
      message: 'Hay sueños que se construyen durante años. Quiero compartir con vos la noche en que uno de los míos comienza a hacerse realidad.',
      signature: 'Valentina',
    },
    eventDetails: {
      eyebrow: 'Cuándo y dónde', heading: 'Guardá este momento.', dateLabel: '20 de marzo de 2027', timeLabel: '21:00',
      venueLabel: 'Lugar', mapActionLabel: 'Ver ubicación', calendarActionLabel: 'Agendar fecha',
      calendarDescription: 'Antes era un sueño. Ahora empieza.\n\nDemostración LIMEN',
    },
    schedule: {
      eyebrow: 'El recorrido de la noche',
      heading: 'Cada momento tiene su hora.',
      introduction: 'Una guía breve para que sepas cómo vamos a vivir esta celebración.',
      moments: [
        { id: 'reception', time: '21:00', title: 'Recepción', description: 'Nos encontramos para dar comienzo a la noche.' },
        { id: 'entrance', time: '22:00', title: 'La entrada', description: 'El instante en que todo empieza a sentirse real.' },
        { id: 'celebration', time: '23:30', title: 'A celebrar', description: 'Música, baile y recuerdos para compartir.' },
      ],
    },
    weather: {
      eyebrow: 'El clima de ese día',
      heading: 'Para que llegues preparado.',
      introduction: 'Cuando se acerque la fecha, acá vas a encontrar el pronóstico real para la celebración.',
      location: {
        name: 'Buenos Aires',
        country: 'Argentina',
        latitude: -34.61315,
        longitude: -58.37723,
        timezone: 'America/Argentina/Buenos_Aires',
      },
    },
    dressCode: {
      eyebrow: 'Dress code', title: 'Elegante',
      description: 'Una noche especial merece que vengas como más te gusta: con presencia, alegría y ganas de celebrar.',
      note: 'La elegancia también es sentirse uno mismo.', imageMediaId: 'dress',
    },
    gallery: {
      eyebrow: 'Antes del comienzo', heading: 'Instantes que ya son parte de la historia.',
      images: [{ mediaId: 'hero', caption: 'El sueño' }, { mediaId: 'dress', caption: 'La espera' }, { mediaId: 'closing', caption: 'El comienzo' }],
    },
    trivia: {
      protagonistName: 'Valentina', accessibleTitle: 'Trivia sobre Valentina', introEyebrow: 'Entre nosotros…',
      title: '¿Cuánto conocés de verdad a Valentina?', description: 'Cinco preguntas. Menos de un minuto.',
      primaryActionLabel: 'Aceptar el desafío', questionMetaLabel: 'Pregunta', nextLabel: 'Siguiente', resultLabel: 'Ver resultado',
      replayLabel: 'Volver a jugar', scoreTotalLabel: '/ 4 respuestas',
      questions: [
        { id: 'q1', prompt: '¿Cuál sería el plan perfecto de Valentina para un sábado?', correctOptionId: 'b', options: [{ id: 'a', label: 'Salir a bailar' }, { id: 'b', label: 'Una tarde con amigas' }, { id: 'c', label: 'Maratón de películas' }, { id: 'd', label: 'Dormir hasta el domingo' }], correctFeedback: '¡La conocés bien! Con amigas cerca, cualquier tarde puede convertirse en un gran plan.', incorrectFeedback: 'Casi… puede disfrutar muchos planes, pero una tarde con amigas suele ganar.' },
        { id: 'q2', prompt: '¿Qué comida elegiría sin pensarlo?', correctOptionId: 'a', options: [{ id: 'a', label: 'Pizza' }, { id: 'b', label: 'Sushi' }, { id: 'c', label: 'Pastas' }, { id: 'd', label: 'Hamburguesas' }], correctFeedback: 'Punto para vos. Si hay pizza, Valentina difícilmente diga que no.', incorrectFeedback: 'Buena elección, aunque la pizza sigue ocupando un lugar difícil de superar.' },
        { id: 'q3', prompt: 'Cuando algo no sale como esperaba, ¿qué hace primero?', correctOptionId: 'b', options: [{ id: 'a', label: 'Se ríe' }, { id: 'b', label: 'Se enoja un ratito' }, { id: 'c', label: 'Llama a una amiga' }, { id: 'd', label: 'Finge que no pasó nada' }], correctFeedback: 'La conocés: primero necesita su momento… después vuelve todo a la normalidad.', incorrectFeedback: 'Buena teoría, pero primero necesita unos minutos para procesarlo.' },
        { id: 'q4', prompt: '¿Cuál es una frase muy de Valentina?', correctOptionId: 'c', options: [{ id: 'a', label: 'Tengo sueño' }, { id: 'b', label: 'Ya fue' }, { id: 'c', label: 'No sé qué ponerme' }, { id: 'd', label: 'Después veo' }], correctFeedback: 'Definitivamente sos parte del círculo cercano: esa frase aparece antes de cada plan.', incorrectFeedback: 'Podría decir cualquiera… pero “no sé qué ponerme” tiene ventaja.' },
        { id: 'q5', prompt: '¿Qué pensás que va a emocionarla más esa noche?', isPrediction: true, options: [{ id: 'a', label: 'Su entrada' }, { id: 'b', label: 'El video de su familia' }, { id: 'c', label: 'Las palabras de sus amigas' }, { id: 'd', label: 'La sorpresa final' }], correctFeedback: 'Tu intuición puede tener razón. Acá no hay respuestas equivocadas: esa noche lo vamos a descubrir juntos.' },
      ],
      resultTiers: [
        { minScore: 4, title: 'Cómplice oficial', message: 'Valentina probablemente ya sabe que no puede ocultarte demasiado.' },
        { minScore: 2, title: 'La conocés bastante', message: 'Estás cerca de su mundo y todavía puede sorprenderte.' },
        { minScore: 1, title: 'Hay mucho por descubrir', message: 'Esta noche puede ser una hermosa oportunidad para conocerla un poco más.' },
        { minScore: 0, title: 'Viniste por la fiesta, confesalo', message: 'No pasa nada: lo importante es estar para compartir lo que viene.' },
      ],
      revealTitle: 'Gracias por jugar',
      revealMessage: 'Ahora que ya sabés un poco más de mí, espero que estés ahí para compartir una de las noches más importantes de mi vida.',
      revealSignature: 'Valentina',
    },
    gifts: {
      eyebrow: 'Un detalle', title: 'Regalo',
      description: 'Si querés acompañar este momento con un detalle, dejamos una referencia ficticia para esta demo.',
      accountLabel: 'Alias de demostración', accountValue: 'VALENTINA.DEMO.LIMEN',
      demoNote: 'Datos de ejemplo. No corresponden a una cuenta real.', imageMediaId: 'gift',
    },
    rsvp: {
      eyebrow: 'Nos encantaría que estés', title: '¿Compartimos esta noche?',
      description: 'Confirmá tu asistencia para que podamos esperarte.', actionLabel: 'Confirmar por WhatsApp',
      message: 'Hola, confirmo mi asistencia a Mis 15 de Valentina.',
      demoNote: 'Demo pública: se abrirá WhatsApp con un mensaje prellenado, sin destinatario real.',
    },
    closing: {
      eyebrow: 'El comienzo', title: 'Gracias por ser parte de la historia que empieza acá.', signature: 'Valentina', imageMediaId: 'closing',
      sharePrompt: 'Ahora podés compartir este momento con quienes querés cerca.', shareActionLabel: 'Compartir invitación',
      shareTitle: 'Mis 15 de Valentina', shareText: 'Antes era un sueño. Ahora empieza. Te invito a compartir este momento conmigo.',
    },
    music: { mediaId: 'music' },
  },
  createdAt: '2026-07-26T14:40:54.000Z',
  updatedAt: '2026-07-26T14:40:54.000Z',
  publishedAt: '2026-07-26T14:40:54.000Z',
} satisfies Origin01InvitationData

function assertOrigin01DemoData(invitation: Origin01InvitationData): void {
  const configuration = validateInvitationConfiguration(invitation, findInvitationTemplate)
  if (!configuration.valid) throw new Error(configuration.errors.map(({ message }) => message).join('\n'))

  const requiredContent: readonly [scene: string, value: string | readonly unknown[]][] = [
    ['prelude.title', invitation.content.prelude.title], ['envelope.heading', invitation.content.envelope.heading],
    ['hero.imageMediaId', invitation.content.hero.imageMediaId], ['countdown.heading', invitation.content.countdown.heading],
    ['story.message', invitation.content.story.message], ['eventDetails.dateLabel', invitation.content.eventDetails.dateLabel],
    ['schedule.heading', invitation.content.schedule.heading], ['schedule.moments', invitation.content.schedule.moments],
    ['weather.heading', invitation.content.weather.heading], ['weather.location.name', invitation.content.weather.location.name],
    ['dressCode.title', invitation.content.dressCode.title], ['gallery.images', invitation.content.gallery.images],
    ['trivia.questions', invitation.content.trivia.questions], ['gifts.accountValue', invitation.content.gifts.accountValue],
    ['rsvp.message', invitation.content.rsvp.message], ['closing.title', invitation.content.closing.title],
    ['music.mediaId', invitation.content.music.mediaId],
  ]
  for (const [scene, value] of requiredContent) {
    if ((typeof value === 'string' && value.length === 0) || (Array.isArray(value) && value.length === 0)) {
      throw new Error(`Invitation ${invitation.code}, scene/module "${scene}": missing field.`)
    }
  }
  const assertMediaKind = (field: string, mediaId: string, expectedKind: 'image' | 'audio') => {
    const media = invitation.media.find(({ id }) => id === mediaId)
    if (media?.kind !== expectedKind) {
      throw new Error(`Invitation ${invitation.code}, scene/content field "${field}": media "${mediaId}" expected kind "${expectedKind}", actual kind "${media?.kind ?? 'missing-media'}".`)
    }
  }

  assertMediaKind('hero.imageMediaId', invitation.content.hero.imageMediaId, 'image')
  assertMediaKind('dressCode.imageMediaId', invitation.content.dressCode.imageMediaId, 'image')
  assertMediaKind('gifts.imageMediaId', invitation.content.gifts.imageMediaId, 'image')
  assertMediaKind('closing.imageMediaId', invitation.content.closing.imageMediaId, 'image')
  invitation.content.gallery.images.forEach(({ mediaId }, index) => assertMediaKind(`gallery.images.${index}.mediaId`, mediaId, 'image'))
  assertMediaKind('music.mediaId', invitation.content.music.mediaId, 'audio')
}

assertOrigin01DemoData(origin01DemoData)
