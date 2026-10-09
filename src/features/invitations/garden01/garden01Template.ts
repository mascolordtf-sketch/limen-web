import type { InvitationTemplateDefinition } from '../engine/templateTypes'

export const garden01Template = {
  id: 'garden01',
  internalName: 'Garden 01',
  description: 'Un recorrido luminoso y natural donde los recuerdos florecen entre fotografías.',
  schemaVersion: 1,
  modules: [
    { moduleId: 'hero', internalLabel: 'Umbral del jardín' },
    { moduleId: 'story', internalLabel: 'Relato' },
    { moduleId: 'gallery', internalLabel: 'Recuerdos colgantes' },
    { moduleId: 'countdown', internalLabel: 'Cuenta regresiva' },
    { moduleId: 'eventDetails', internalLabel: 'La celebración' },
    { moduleId: 'dressCode', internalLabel: 'Código de vestimenta' },
    { moduleId: 'rsvp', internalLabel: 'Confirmación' },
    { moduleId: 'closing', internalLabel: 'Cierre' },
  ],
  supportedModules: ['hero', 'story', 'gallery', 'countdown', 'eventDetails', 'dressCode', 'rsvp', 'closing'],
  requiredModules: ['hero', 'eventDetails', 'closing'],
  optionalModules: ['story', 'gallery', 'countdown', 'dressCode', 'rsvp'],
  canonicalOrder: ['hero', 'story', 'gallery', 'countdown', 'eventDetails', 'dressCode', 'rsvp', 'closing'],
  defaultThemeVariant: 'garden01-sunlit',
  supportedThemeVariants: ['garden01-sunlit'],
} satisfies InvitationTemplateDefinition
