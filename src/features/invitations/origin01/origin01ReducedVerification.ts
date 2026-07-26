import { updateInvitationModuleConfiguration } from '../engine/moduleConfiguration'
import { getEnabledInvitationModuleIds } from '../engine/moduleRuntime'
import { findInvitationTemplate } from '../engine/templateRegistry'
import { validateInvitationConfiguration } from '../engine/invitationValidation'
import type { InvitationModuleId } from '../engine/moduleTypes'
import { origin01DemoData } from './origin01DemoData'

export const origin01ReducedInvitation = Object.freeze({
  ...origin01DemoData,
  modules: updateInvitationModuleConfiguration(origin01DemoData.modules, {
    countdown: false,
    story: false,
    dressCode: false,
    trivia: false,
    gifts: false,
    rsvp: false,
  }),
})

export const origin01ReducedValidation = validateInvitationConfiguration(
  origin01ReducedInvitation,
  findInvitationTemplate,
)

export const origin01ReducedEnabledModuleIds = [
  'prelude',
  'hero',
  'eventDetails',
  'gallery',
  'closing',
] as const satisfies readonly InvitationModuleId[]

export const origin01ReducedDisabledModuleIds = [
  'countdown',
  'story',
  'dressCode',
  'trivia',
  'gifts',
  'rsvp',
] as const satisfies readonly InvitationModuleId[]

function assertReducedOrigin01Configuration(): void {
  const enabledModules = getEnabledInvitationModuleIds(origin01ReducedInvitation.modules)
  const template = findInvitationTemplate(origin01ReducedInvitation.templateId)
  const originalOrder = origin01DemoData.modules.map(({ moduleId }) => moduleId)
  const reducedOrder = origin01ReducedInvitation.modules.map(({ moduleId }) => moduleId)

  if (origin01ReducedInvitation === origin01DemoData) {
    throw new Error('Reduced Origin 01 verification must create a new invitation object.')
  }
  if (origin01ReducedInvitation.modules === origin01DemoData.modules) {
    throw new Error('Reduced Origin 01 verification must create a new module configuration.')
  }
  if (
    origin01ReducedInvitation.content !== origin01DemoData.content
    || origin01ReducedInvitation.media !== origin01DemoData.media
    || origin01ReducedInvitation.event !== origin01DemoData.event
    || origin01ReducedInvitation.identities !== origin01DemoData.identities
  ) {
    throw new Error('Reduced Origin 01 verification must reuse the canonical fixture data.')
  }
  if (originalOrder.some((moduleId, index) => reducedOrder[index] !== moduleId)) {
    throw new Error('Reduced Origin 01 verification must preserve canonical module order.')
  }
  if (origin01DemoData.modules.some(({ enabled }) => !enabled)) {
    throw new Error('Reduced Origin 01 verification must not mutate the canonical demo.')
  }
  if (
    origin01ReducedEnabledModuleIds.some((moduleId) => !enabledModules.has(moduleId))
    || origin01ReducedDisabledModuleIds.some((moduleId) => enabledModules.has(moduleId))
  ) {
    throw new Error('Reduced Origin 01 verification has an unexpected enabled module set.')
  }
  if (!template?.requiredModules.every((moduleId) => enabledModules.has(moduleId))) {
    throw new Error('Reduced Origin 01 verification must keep every required module enabled.')
  }
  if (!Object.isFrozen(origin01ReducedInvitation.modules)) {
    throw new Error('Reduced Origin 01 module configuration must be immutable in practice.')
  }
  if (!origin01ReducedValidation.valid) {
    throw new Error(origin01ReducedValidation.errors.map(({ message }) => message).join('\n'))
  }
}

assertReducedOrigin01Configuration()
