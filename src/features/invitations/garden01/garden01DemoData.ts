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
    { moduleId: 'hero', enabled: true },
    { moduleId: 'story', enabled: true },
    { moduleId: 'gallery', enabled: true },
    { moduleId: 'countdown', enabled: true },
    { moduleId: 'eventDetails', enabled: true },
    { moduleId: 'dressCode', enabled: true },
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
    dressCode: {
      eyebrow: 'Dress code', title: 'Elegante y natural',
      description: 'Tonos claros, colores tierra y la libertad de sentirte vos.',
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
