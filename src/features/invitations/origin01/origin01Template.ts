import type { InvitationTemplateDefinition } from '../engine/templateTypes'

export const origin01Template = {
  id: 'origin01',
  internalName: 'Origin 01',
  description: 'La experiencia narrativa original de LIMEN para una celebración personal.',
  schemaVersion: 1,
  modules: [
    { moduleId: 'prelude', internalLabel: 'Preludio' },
    { moduleId: 'hero', internalLabel: 'Presentación' },
    { moduleId: 'countdown', internalLabel: 'Cuenta regresiva' },
    { moduleId: 'story', internalLabel: 'Historia personal' },
    { moduleId: 'eventDetails', internalLabel: 'Detalles del evento' },
    { moduleId: 'dressCode', internalLabel: 'Código de vestimenta' },
    { moduleId: 'gallery', internalLabel: 'Galería' },
    { moduleId: 'trivia', internalLabel: 'Trivia' },
    { moduleId: 'gifts', internalLabel: 'Regalos' },
    { moduleId: 'rsvp', internalLabel: 'Confirmación de asistencia' },
    { moduleId: 'closing', internalLabel: 'Cierre' },
  ],
  supportedModules: ['prelude', 'hero', 'countdown', 'story', 'eventDetails', 'dressCode', 'gallery', 'trivia', 'gifts', 'rsvp', 'closing'],
  requiredModules: ['prelude', 'hero', 'eventDetails', 'closing'],
  optionalModules: ['countdown', 'story', 'gallery', 'trivia', 'dressCode', 'gifts', 'rsvp'],
  canonicalOrder: ['prelude', 'hero', 'countdown', 'story', 'eventDetails', 'dressCode', 'gallery', 'trivia', 'gifts', 'rsvp', 'closing'],
  defaultThemeVariant: 'origin01-wine',
  supportedThemeVariants: ['origin01-wine'],
} satisfies InvitationTemplateDefinition
