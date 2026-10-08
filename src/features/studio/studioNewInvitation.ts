import type { InvitationModuleId } from '../invitations/engine/moduleTypes'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { origin01Template } from '../invitations/origin01/origin01Template'

const studioTimeZone = 'America/Argentina/Buenos_Aires'
const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: studioTimeZone,
})
const dateLabelFormatter = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: studioTimeZone,
})

const initiallyEnabledModules = new Set<InvitationModuleId>([
  ...origin01Template.requiredModules,
  'countdown',
  'story',
  'dressCode',
  'gallery',
  'gifts',
  'rsvp',
])

function createStudioInvitationCode(now: Date): string {
  const date = dateKeyFormatter.format(now).replaceAll('-', '').slice(2)
  const suffix = globalThis.crypto.randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase()
  return `LMN-${date}-${suffix}`
}

export function createNewStudioInvitation(internalName: string, now = new Date()): Origin01InvitationData {
  const code = createStudioInvitationCode(now)
  const eventDay = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const endingDay = new Date(eventDay.getTime() + 24 * 60 * 60 * 1000)
  const eventDate = dateKeyFormatter.format(eventDay)
  const endingDate = dateKeyFormatter.format(endingDay)
  const dateLabel = dateLabelFormatter.format(eventDay)
  const timestamp = now.toISOString()

  return {
    id: `origin01-${code.toLocaleLowerCase('es-AR')}`,
    code,
    internalName: internalName.trim(),
    templateId: 'origin01',
    lifecycleStatus: 'draft',
    audience: 'protagonist',
    eventType: 'quince',
    themeVariant: origin01Template.defaultThemeVariant,
    typographyId: 'noche-plateada',
    event: {
      name: 'Nombre',
      celebrationLabel: 'Mis 15',
      startsAt: `${eventDate}T21:00:00-03:00`,
      endsAt: `${endingDate}T04:00:00-03:00`,
      timeZone: studioTimeZone,
      venue: 'Lugar del evento',
      address: 'Dirección del evento',
    },
    identities: [{ displayName: 'Nombre', role: 'protagonist' }],
    presentation: { showTemplateBranding: true },
    modules: origin01Template.canonicalOrder.map((moduleId) => ({
      moduleId,
      enabled: initiallyEnabledModules.has(moduleId),
    })),
    media: [],
    content: {
      prelude: {
        eyebrow: 'Un mensaje para vos',
        title: 'Hola, Nombre.',
        body: 'Hay momentos que merecen ser compartidos con las personas que más queremos.',
        reveal: 'Esta invitación es para vos.',
        question: '¿Querés descubrirla?',
        actionLabel: 'Abrir invitación',
        soundHint: '',
      },
      envelope: {
        eyebrow: 'Una invitación especial',
        heading: 'Hay momentos que comienzan mucho antes de llegar.',
        monogram: 'N',
        instruction: 'Tocá el sello para abrir',
      },
      hero: {
        dateLabel,
        phrase: 'Una noche para recordar.',
        scrollHint: 'Deslizá para descubrir ↓',
        imageMediaId: '',
      },
      countdown: {
        eyebrow: 'El tiempo se acerca',
        heading: 'Falta menos para compartir este momento.',
        completedMessage: 'El gran día llegó.',
      },
      story: {
        eyebrow: 'Una invitación',
        message: 'Quiero compartir con vos una noche muy especial.',
        signature: 'Nombre',
      },
      eventDetails: {
        eyebrow: 'Cuándo y dónde',
        heading: 'Guardá este momento.',
        dateLabel,
        timeLabel: '21:00',
        venueLabel: 'Lugar',
        mapActionLabel: 'Ver ubicación',
        calendarActionLabel: 'Agendar fecha',
        calendarDescription: 'Invitación creada con LIMEN',
      },
      schedule: {
        eyebrow: 'El recorrido de la noche',
        heading: 'Cada momento tiene su hora.',
        introduction: 'Una guía para disfrutar juntos la celebración.',
        moments: [
          { id: 'reception', time: '21:00', title: 'Recepción' },
          { id: 'celebration', time: '22:00', title: 'Celebración' },
        ],
      },
      weather: {
        eyebrow: 'El clima de ese día',
        heading: 'Para que llegues preparado.',
        introduction: 'Cuando se acerque la fecha, vas a encontrar acá el pronóstico.',
        location: {
          name: 'Buenos Aires',
          country: 'Argentina',
          latitude: -34.61315,
          longitude: -58.37723,
          timezone: studioTimeZone,
        },
      },
      dressCode: {
        eyebrow: 'Dress code',
        title: 'Elegante',
        description: 'Elegí un look que te haga sentir bien para disfrutar esta noche.',
        note: 'La elegancia también es sentirse uno mismo.',
        imageMediaId: '',
      },
      gallery: {
        eyebrow: 'Nuestra historia',
        heading: 'Momentos para recordar.',
        images: [],
      },
      community: {
        eyebrow: 'Compartamos cada instante',
        heading: 'La noche también la hacemos entre todos.',
        introduction: 'Sumá tus recuerdos de la celebración.',
        instagram: { enabled: false, handle: '', actionLabel: 'Ver en Instagram' },
        hashtag: { enabled: false, value: '', actionLabel: 'Copiar hashtag', copiedLabel: 'Hashtag copiado' },
        album: { enabled: false, url: '', invitation: 'Compartí tus fotos y videos.', actionLabel: 'Abrir álbum' },
      },
      trivia: {
        protagonistName: 'Nombre',
        accessibleTitle: 'Trivia sobre la protagonista',
        introEyebrow: 'Entre nosotros…',
        title: '¿Cuánto conocés a Nombre?',
        description: 'Un pequeño desafío antes de la fiesta.',
        primaryActionLabel: 'Comenzar',
        questionMetaLabel: 'Pregunta',
        nextLabel: 'Siguiente',
        resultLabel: 'Ver resultado',
        replayLabel: 'Volver a jugar',
        scoreTotalLabel: '/ 1 respuesta correcta',
        questions: [{
          id: 'q1',
          prompt: '¿Cuál es su plan favorito?',
          options: [{ id: 'a', label: 'Opción A' }, { id: 'b', label: 'Opción B' }],
          correctOptionId: 'a',
          correctFeedback: '¡La conocés muy bien!',
          incorrectFeedback: 'Casi. Esta vez era la otra opción.',
        }],
        resultTiers: [
          { minScore: 1, title: '¡Excelente!', message: 'La conocés muy bien.' },
          { minScore: 0, title: 'Hay mucho por descubrir', message: 'La fiesta será una gran oportunidad.' },
        ],
        revealTitle: 'Gracias por jugar',
        revealMessage: 'Espero que estés ahí para compartir esta noche conmigo.',
        revealSignature: 'Nombre',
      },
      gifts: {
        eyebrow: 'Un detalle',
        title: 'Regalos',
        description: 'Si querés acompañar este momento con un regalo, podés hacerlo el día del evento o usar estos datos.',
        accountHolder: '',
        bankName: '',
        accountLabel: 'Alias o CVU',
        accountValue: '',
        demoNote: '',
        imageMediaId: '',
      },
      rsvp: {
        eyebrow: 'Nos encantaría que estés',
        title: '¿Compartimos esta noche?',
        description: 'Confirmá tu asistencia para que podamos esperarte.',
        actionLabel: 'Confirmar por WhatsApp',
        recipientPhone: undefined,
        message: 'Hola, confirmo mi asistencia al evento.',
        demoNote: undefined,
      },
      closing: {
        eyebrow: 'Nos vemos pronto',
        title: 'Gracias por ser parte de este momento.',
        signature: 'Nombre',
        imageMediaId: '',
        sharePrompt: 'Compartí la invitación con quienes querés cerca.',
        shareActionLabel: 'Compartir invitación',
        shareTitle: 'Una invitación especial',
        shareText: 'Quiero compartir con vos una noche muy especial.',
      },
      music: { mediaId: '' },
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    publishedAt: undefined,
  }
}
