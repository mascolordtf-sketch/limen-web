import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { findInvitationTemplate } from '../src/features/invitations/engine/templateRegistry'
import { validateInvitationConfiguration } from '../src/features/invitations/engine/invitationValidation'
import { Garden01Invitation } from '../src/features/invitations/garden01/Garden01Invitation'
import { garden01DemoData } from '../src/features/invitations/garden01/garden01DemoData'
import { garden01Template } from '../src/features/invitations/garden01/garden01Template'

const validation = validateInvitationConfiguration(garden01DemoData, findInvitationTemplate)
const markup = renderToStaticMarkup(createElement(Garden01Invitation, { invitation: garden01DemoData }))
const hangingPhotoCount = markup.match(/garden01-hanging-photo garden01-hanging-photo--/g)?.length ?? 0
const enabledModuleIds = garden01DemoData.modules
  .filter(({ enabled }) => enabled)
  .map(({ moduleId }) => moduleId)

const assertions = [
  findInvitationTemplate('garden01') === garden01Template,
  validation.valid && validation.errors.length === 0,
  garden01Template.requiredModules.every((moduleId) =>
    garden01DemoData.modules.some((module) => module.moduleId === moduleId && module.enabled)),
  garden01DemoData.media.length === 4
    && garden01DemoData.media.every(({ src }) => src === '/images/garden-01/emilia-session.webp'),
  hangingPhotoCount === 4,
  garden01Template.supportedModules.length === 14 && enabledModuleIds.length === 14,
  ['prelude', 'schedule', 'weather', 'instagram', 'trivia', 'gifts'].every((moduleId) =>
    enabledModuleIds.includes(moduleId as (typeof enabledModuleIds)[number])),
  markup.includes('Momentos para guardar') && markup.includes('¿Nos acompañás?'),
  markup.includes('El recorrido de la noche') && markup.includes('Un detalle')
    && markup.includes('La historia vista por todos.') && markup.includes('¿Cuánto me conocés?'),
  markup.includes('https://www.google.com/maps/search/') && markup.includes('aria-disabled="true"')
    && !markup.includes('https://wa.me/'),
  ['paper-fibre', 'jasmine-sprig-a', 'jasmine-sprig-b', 'botanical-seal', 'sage-envelope']
    .every((asset) => asset === 'paper-fibre' || markup.includes(`/materials/${asset}.webp`)),
  !markup.includes('origin01') && !markup.includes('Maia') && !markup.includes('Valentina'),
]

assertions.forEach((condition, index) => {
  if (!condition) throw new Error(`Garden 01 assertion ${index + 1} failed.`)
})

console.log(`Garden 01: ${assertions.length} assertions passed.`)
process.exit(0)
