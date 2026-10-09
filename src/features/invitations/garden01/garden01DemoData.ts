import { findInvitationTemplate } from '../engine/templateRegistry'
import { validateInvitationConfiguration } from '../engine/invitationValidation'
import type { Garden01InvitationData } from './garden01ContentTypes'

const sessionSrc = '/images/garden-01/emilia-session.webp'

export const garden01DemoData = {
  id: 'garden01-demo-lmn-gdn-001',
  code: 'LMN-GDN-001',
  internalName: 'Demo pública Garden 01 — Emilia',
  templateId: 'garden01',
  lifecycleStatus: 'published',
  audience: 'guest',
  eventType: 'quince',
  themeVariant: 'garden01-sunlit',
  event: {
    name: 'Emilia',
    celebrationLabel: 'Mis 15',
    startsAt: '2027-10-17T21:30:00-03:00',
    endsAt: '2027-10-18T04:00:00-03:00',
    timeZone: 'America/Argentina/Buenos_Aires',
    venue: 'Salón del Jardín',
    address: 'Av. del Parque 1280, Buenos Aires',
  },
  identities: [{ displayName: 'Emilia', role: 'protagonist' }],
  presentation: { showTemplateBranding: true },
  modules: [
    { moduleId: 'prelude', enabled: true },
    { moduleId: 'hero', enabled: true },
    { moduleId: 'story', enabled: true },
    { moduleId: 'gallery', enabled: true },
    { moduleId: 'countdown', enabled: true },
    { moduleId: 'eventDetails', enabled: true },
    { moduleId: 'schedule', enabled: true },
    { moduleId: 'weather', enabled: true },
    { moduleId: 'dressCode', enabled: true },
    { moduleId: 'instagram', enabled: true },
    { moduleId: 'trivia', enabled: true },
    { moduleId: 'gifts', enabled: true },
    { moduleId: 'rsvp', enabled: true },
    { moduleId: 'closing', enabled: true },
  ],
  media: [
    { id: 'garden-emilia-1', kind: 'image', src: sessionSrc, alt: 'Emilia junto a una pérgola iluminada por el sol' },
    { id: 'garden-emilia-2', kind: 'image', src: sessionSrc, alt: 'Emilia entre ramas y flores blancas' },
    { id: 'garden-emilia-3', kind: 'image', src: sessionSrc, alt: 'Emilia sentada en las escalinatas del jardín' },
    { id: 'garden-emilia-4', kind: 'image', src: sessionSrc, alt: 'Retrato de Emilia con pequeñas flores blancas' },
  ],
  content: {
    prelude: {
      eyebrow: 'Antes era un sueño',
      body: 'Hay momentos que se imaginan durante años y un día empiezan a sentirse reales.',
      reveal: 'Ahora empieza un nuevo capítulo.',
    },
    hero: {
      eyebrow: 'Mis 15', name: 'Emilia', dateLabel: '17 · 10 · 2027',
      scrollHint: 'Deslizá para entrar', imageMediaId: 'garden-emilia-1',
    },
    story: {
      eyebrow: 'Pequeñas historias de una gran aventura',
      heading: 'Momentos que florecen',
      introduction: 'Cada recuerdo fue abriendo un camino. Quiero compartir con vos el día en que una nueva historia comienza.',
    },
    gallery: {
      images: [
        { mediaId: 'garden-emilia-1', caption: 'La espera' },
        { mediaId: 'garden-emilia-2', caption: 'La alegría' },
        { mediaId: 'garden-emilia-3', caption: 'El camino' },
        { mediaId: 'garden-emilia-4', caption: 'Este momento' },
      ],
    },
    countdown: { eyebrow: 'Faltan', completedMessage: 'El jardín ya está listo para recibirte.' },
    eventDetails: {
      eyebrow: 'La celebración', heading: 'Nos encontramos en el jardín.',
      dateLabel: '17 de octubre', timeLabel: '21:30', venueLabel: 'Salón del Jardín',
      mapActionLabel: 'Ver ubicación',
    },
    schedule: {
      eyebrow: 'El recorrido de la noche',
      moments: [
        { id: 'garden-reception', time: '21:30', title: 'Recepción' },
        { id: 'garden-dinner', time: '22:30', title: 'Cena' },
        { id: 'garden-party', time: '00:00', title: 'A celebrar' },
        { id: 'garden-closing', time: '04:00', title: 'Cierre' },
      ],
    },
    weather: {
      eyebrow: 'Para disfrutar el jardín',
      introduction: 'Cuando se acerque la fecha vas a encontrar acá el pronóstico real para la celebración.',
      location: {
        name: 'Buenos Aires', country: 'Argentina', latitude: -34.6037, longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      },
    },
    dressCode: {
      eyebrow: 'Dress code', title: 'Elegante y natural',
      description: 'Tonos claros, colores tierra y la libertad de sentirte vos.',
      note: 'Elegí tu mejor versión.',
    },
    community: {
      eyebrow: 'Mis recuerdos', heading: 'La historia vista por todos.',
      introduction: 'Ayudame a reunir los momentos de esta noche compartiendo tus fotos en el álbum.',
      albumUrl: '', albumActionLabel: 'Ir al álbum',
    },
    trivia: {
      protagonistName: 'Emilia', accessibleTitle: 'Trivia sobre Emilia', introEyebrow: 'Trivia',
      title: '¿Cuánto me conocés?', description: 'Jugá y descubrí algunas curiosidades sobre mí.',
      primaryActionLabel: 'Jugar ahora', questionMetaLabel: 'Pregunta', nextLabel: 'Siguiente',
      resultLabel: 'Ver resultado', replayLabel: 'Volver a jugar', scoreTotalLabel: 'respuestas correctas',
      questions: [
        { id: 'garden-trivia-1', prompt: '¿Qué plan disfruto más?', options: [
          { id: 'a', label: 'Una tarde al aire libre' }, { id: 'b', label: 'Una maratón de películas' },
          { id: 'c', label: 'Salir de compras' },
        ], correctOptionId: 'a', correctFeedback: '¡Exacto! Siempre elijo un poco de aire libre.', incorrectFeedback: 'Casi. Mi lugar favorito siempre tiene algo de verde.' },
        { id: 'garden-trivia-2', prompt: '¿Qué no puede faltar en mi fiesta?', options: [
          { id: 'a', label: 'Una pista llena' }, { id: 'b', label: 'Un momento para las fotos' },
          { id: 'c', label: 'Las dos cosas' },
        ], correctOptionId: 'c', correctFeedback: '¡Las dos! Quiero bailar y guardar cada recuerdo.', incorrectFeedback: 'Me conocés: quiero disfrutar las dos cosas.' },
      ],
      resultTiers: [
        { minScore: 0, title: 'Seguimos conociéndonos', message: 'Lo importante es que vamos a compartir esta noche.' },
        { minScore: 2, title: 'Me conocés muy bien', message: 'Ya estás listo para celebrar conmigo.' },
      ],
      revealTitle: 'Gracias por jugar', revealMessage: 'Ahora solo falta vivirlo juntos.', revealSignature: 'Emilia',
    },
    gifts: {
      eyebrow: 'Un detalle', title: 'Tu regalo',
      description: 'Tu presencia es el mejor regalo. Si querés acompañarme también con un obsequio, podés hacerlo acá.',
      actionLabel: 'Ver datos de cuenta', accountHolder: 'Emilia Demostración', bankName: 'Billetera de ejemplo',
      accountLabel: 'Alias', accountValue: 'EMILIA.GARDEN.DEMO',
      demoNote: 'Datos de demostración. No corresponden a una cuenta real.',
    },
    rsvp: {
      eyebrow: 'Tu presencia hace florecer esta historia', title: '¿Nos acompañás?',
      description: 'Confirmá tu asistencia antes del 4 de octubre.', actionLabel: 'Confirmar asistencia',
      recipientPhone: '', message: 'Hola, confirmo mi asistencia a los 15 de Emilia.',
    },
    closing: { message: 'Gracias por ser parte de todo lo que está por florecer.', signature: 'Emilia' },
  },
  createdAt: '2026-10-08T23:45:00.000Z',
  updatedAt: '2026-10-08T23:45:00.000Z',
  publishedAt: '2026-10-08T23:45:00.000Z',
} satisfies Garden01InvitationData

const configuration = validateInvitationConfiguration(garden01DemoData, findInvitationTemplate)
if (!configuration.valid) throw new Error(configuration.errors.map(({ message }) => message).join('\n'))
