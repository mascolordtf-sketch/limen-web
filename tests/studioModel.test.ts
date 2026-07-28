import { AppRoutes } from '../src/app/routes'
import { Origin01Invitation } from '../src/features/invitations/origin01/Origin01Invitation'
import { origin01DemoData } from '../src/features/invitations/origin01/origin01DemoData'
import { origin01Template } from '../src/features/invitations/origin01/origin01Template'
import { StudioInvitationRoute } from '../src/features/studio/StudioInvitationRoute'
import { StudioPreview } from '../src/features/studio/StudioPreview'
import { deriveOrigin01PreviewInvitation } from '../src/features/studio/origin01StudioDerivations'
import {
  createOrigin01StudioDraft,
  resetOrigin01StudioConfiguration,
  resetOrigin01StudioField,
  resetOrigin01StudioGroup,
  resetOrigin01StudioScene,
  updateOrigin01StudioDraftField,
  updateOrigin01StudioDraftGroup,
  updateOrigin01StudioModule,
} from '../src/features/studio/origin01StudioDraft'
import { createOrigin01StudioDomains, origin01TriviaFlow } from '../src/features/studio/origin01StudioConfiguration'
import { selectValidStudioPreview, validateOrigin01StudioDraft } from '../src/features/studio/origin01StudioValidation'
import {
  createStudioPreviewAudienceState,
  getStudioPreviewKey,
  transitionStudioPreviewAudience,
} from '../src/features/studio/studioPreviewAudience'

let passed = 0
const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message)
  passed += 1
}

const initial = createOrigin01StudioDraft(origin01DemoData)
assert(initial.event.venue === 'Palacio del Lago', 'inicializa el lugar desde el fixture')
assert(initial !== createOrigin01StudioDraft(origin01DemoData), 'crea borradores independientes')

const renamed = updateOrigin01StudioDraftField(initial, 'protagonistName', 'Amparo')
const renamedPreview = deriveOrigin01PreviewInvitation(origin01DemoData, renamed)
assert(renamedPreview.identities[0]?.displayName === 'Amparo', 'actualiza la fuente canónica de identidad')
assert(renamedPreview.content.prelude.title === 'Hola, Amparo.', 'deriva el saludo')
assert(renamedPreview.content.envelope.monogram === 'A', 'deriva el monograma')
assert(renamedPreview.content.story.signature === 'Amparo', 'deriva la firma')
assert(renamedPreview.content.trivia.protagonistName === 'Amparo', 'deriva la identidad de Trivia')

const editedStory = updateOrigin01StudioDraftGroup(initial, 'story', (story) => ({
  ...story,
  message: 'Un texto editorial actualizado.',
}))
assert(editedStory.story.message === 'Un texto editorial actualizado.', 'actualiza un texto editorial')

const storyDisabled = updateOrigin01StudioModule(origin01DemoData, editedStory, 'story', false)
assert(storyDisabled.story.message === editedStory.story.message, 'conserva contenido al desactivar una escena')
assert(!storyDisabled.modules.find(({ moduleId }) => moduleId === 'story')?.enabled, 'desactiva una escena opcional')
const requiredAttempt = updateOrigin01StudioModule(origin01DemoData, initial, 'prelude', false)
assert(requiredAttempt === initial, 'impide desactivar una escena obligatoria desde el modelo')

const changedEvent = updateOrigin01StudioDraftGroup(initial, 'event', (event) => ({
  ...event, start: '2028-04-10T20:30', end: '2028-04-11T02:30', venue: 'Salón del Río', address: 'Costanera 100',
}))
const resetField = resetOrigin01StudioField(changedEvent, initial, 'event', 'venue')
assert(resetField.event.venue === initial.event.venue, 'restablece un campo desde el borrador inicial')
assert(resetField.event.start === changedEvent.event.start, 'el reset de campo conserva campos hermanos')
const resetGroup = resetOrigin01StudioGroup(changedEvent, initial, 'event')
assert(resetGroup.event.start === initial.event.start && resetGroup.event.venue === initial.event.venue, 'restablece un grupo completo')
assert(resetGroup.story === changedEvent.story, 'el reset de grupo conserva los demás grupos')
const resetScene = resetOrigin01StudioScene(storyDisabled, initial, 'story')
assert(resetScene.story.message === initial.story.message, 'restablece el contenido editorial de una escena')
assert(!resetScene.modules.find(({ moduleId }) => moduleId === 'story')?.enabled, 'el reset de escena conserva su activación')
const resetConfiguration = resetOrigin01StudioConfiguration(storyDisabled, initial)
assert(resetConfiguration.modules.find(({ moduleId }) => moduleId === 'story')?.enabled, 'restablece la configuración de escenas')
assert(resetConfiguration.story.message === editedStory.story.message, 'el reset de configuración conserva el contenido editorial')
const editedOpening = updateOrigin01StudioDraftGroup(initial, 'opening', (opening) => ({
  ...opening, preludeBody: 'Otro preludio', heroPhrase: 'Otra portada',
}))
const resetPrelude = resetOrigin01StudioScene(editedOpening, initial, 'prelude')
assert(resetPrelude.opening.preludeBody === initial.opening.preludeBody, 'restablece solamente Preludio')
assert(resetPrelude.opening.heroPhrase === 'Otra portada', 'restablecer Preludio conserva Portada')

const rescheduledPreview = deriveOrigin01PreviewInvitation(origin01DemoData, changedEvent)
assert(rescheduledPreview.event.startsAt.startsWith('2028-04-10'), 'deriva el inicio ISO desde la fuente local')
assert(rescheduledPreview.content.eventDetails.timeLabel === '20:30 a 02:30', 'deriva el rango horario editorial')
assert(rescheduledPreview.event.venue === 'Salón del Río', 'proyecta el lugar canónico')
assert(rescheduledPreview.event.address === 'Costanera 100', 'proyecta el destino de mapa desde la dirección')
assert(!('dateLabel' in changedEvent.event), 'no duplica proyecciones dentro de la fuente canónica')

const validBase = updateOrigin01StudioDraftGroup(initial, 'rsvp', (rsvp) => ({
  ...rsvp,
  recipientPhone: '+54 11 5555 5555',
}))
const validResult = validateOrigin01StudioDraft(origin01DemoData, validBase)
const validPreview = deriveOrigin01PreviewInvitation(origin01DemoData, validBase)
assert(validResult.invitationValid, 'distingue una invitación técnicamente válida')
assert(selectValidStudioPreview(validResult, validPreview) === validPreview, 'entrega a preview solamente una invitación válida')
assert(!validResult.editoriallyReviewed && !validResult.readyToPublish, 'mantiene revisión y publicación separadas de la validez')
assert(validResult.domainStatuses.every(({ complete }) => complete), 'marca completos los dominios técnicamente válidos')
assert(validResult.domainStatuses.every(({ hasContentPendingReview }) => hasContentPendingReview), 'agrega revisión pendiente en todos los dominios')

const emptyName = updateOrigin01StudioDraftField(validBase, 'protagonistName', '')
assert(validateOrigin01StudioDraft(origin01DemoData, emptyName).fieldErrors.protagonistName !== null, 'reporta un campo obligatorio vacío')

const invalidStory = updateOrigin01StudioDraftGroup(validBase, 'story', (story) => ({ ...story, message: '' }))
const activeStoryResult = validateOrigin01StudioDraft(origin01DemoData, invalidStory)
assert(activeStoryResult.sceneStatuses.find(({ sceneId }) => sceneId === 'story')?.relevantErrorCount === 1, 'cuenta errores de una escena activa')
assert(!activeStoryResult.domainStatuses.find(({ domainId }) => domainId === 'narrative')?.complete, 'marca incompleto el dominio afectado')
assert(!activeStoryResult.invitationValid, 'un error editorial activo invalida el borrador actual')
assert(selectValidStudioPreview(activeStoryResult, validPreview) === null, 'un error activo impide entregar el borrador a la preview visible')
const inactiveInvalidStory = updateOrigin01StudioModule(origin01DemoData, invalidStory, 'story', false)
const inactiveStoryResult = validateOrigin01StudioDraft(origin01DemoData, inactiveInvalidStory)
const storyStatus = inactiveStoryResult.sceneStatuses.find(({ sceneId }) => sceneId === 'story')
assert(storyStatus?.active === false, 'expone el estado inactivo de una escena')
assert(storyStatus?.relevantErrorCount === 0, 'los errores de contenido inactivo no son relevantes')
assert(inactiveStoryResult.invitationValid, 'el contenido inválido inactivo no bloquea la invitación')
assert(selectValidStudioPreview(inactiveStoryResult, validPreview) === validPreview, 'el contenido inválido inactivo no bloquea la entrega a preview')

const invalidDate = updateOrigin01StudioDraftGroup(validBase, 'event', (event) => ({ ...event, start: 'fecha inválida' }))
const invalidDateResult = validateOrigin01StudioDraft(origin01DemoData, invalidDate)
assert(invalidDateResult.previewBlocked && !invalidDateResult.structurallyValid, 'un error canónico estructural bloquea la derivación actual')
assert(invalidDateResult.domainStatuses.find(({ domainId }) => domainId === 'event')?.blocksPreview, 'el dominio agrega el bloqueo estructural')

const malformedRequired = { ...validBase, modules: validBase.modules.map((module) => module.moduleId === 'prelude'
  ? { ...module, enabled: false } : module) }
const malformedResult = validateOrigin01StudioDraft(origin01DemoData, malformedRequired)
const malformedPrelude = malformedResult.sceneStatuses.find(({ sceneId }) => sceneId === 'prelude')
assert(malformedPrelude?.complete === false && malformedPrelude.blocksPreview, 'una escena estructuralmente inválida no figura completa')
assert(!malformedResult.domainStatuses.find(({ domainId }) => domainId === 'narrative')?.complete, 'el dominio agrega el error estructural de su escena')

const longCaption = updateOrigin01StudioDraftGroup(validBase, 'gallery', (gallery) => ({
  ...gallery,
  captions: ['x'.repeat(161), ...gallery.captions.slice(1)],
}))
const warningResult = validateOrigin01StudioDraft(origin01DemoData, longCaption)
assert(warningResult.issues.some(({ severity }) => severity === 'warning'), 'clasifica advertencias no bloqueantes')
assert(!warningResult.previewBlocked && warningResult.invitationValid, 'una advertencia no vuelve inválida la invitación')
assert(selectValidStudioPreview(warningResult, validPreview) === validPreview, 'una advertencia permite entregar la preview')

const domains = createOrigin01StudioDomains(origin01Template)
assert(domains.map(({ id }) => id).join(',') === 'identity,event,narrative,experiences,review', 'define los cinco dominios en orden')
const experienceScenes = domains.find(({ id }) => id === 'experiences')?.items.map(({ sceneId }) => sceneId)
const expectedExperiences = origin01Template.canonicalOrder.filter((sceneId) =>
  ['countdown', 'dressCode', 'gallery', 'trivia', 'gifts', 'rsvp'].includes(sceneId))
assert(experienceScenes?.join() === expectedExperiences.join(), 'deriva el orden de experiencias desde la plantilla canónica')
const storyNavigation = domains.flatMap(({ items }) => items).find(({ sceneId }) => sceneId === 'story')
assert(storyNavigation?.required === origin01Template.requiredModules.includes('story')
  && storyNavigation.canToggle === origin01Template.optionalModules.includes('story'), 'deriva obligatoriedad y activación desde la plantilla')
assert(origin01TriviaFlow[1].id === 'questions' && origin01TriviaFlow[1].preservesCanonicalOrder, 'prepara el flujo canónico de Trivia')

const initialAudience = createStudioPreviewAudienceState()
assert(initialAudience.audience === 'protagonist' && initialAudience.run === 0, 'inicializa la audiencia productiva')
const guestAudience = transitionStudioPreviewAudience(initialAudience, { type: 'change-audience', audience: 'guest' })
assert(guestAudience.audience === 'guest' && guestAudience.run === 1, 'la transición productiva cambia audiencia y reinicia')
const restartedAudience = transitionStudioPreviewAudience(guestAudience, { type: 'restart' })
assert(restartedAudience.audience === 'guest' && restartedAudience.run === 2, 'el reinicio manual conserva audiencia e incrementa run')
assert(getStudioPreviewKey(restartedAudience) === 'guest-2', 'la key productiva refleja audiencia y run')
assert(initial.protagonistName === 'Valentina', 'audiencia y borrador permanecen independientes')

assert(typeof AppRoutes === 'function' && typeof StudioInvitationRoute === 'function', 'la ruta actual de Studio continúa disponible')
assert(typeof StudioPreview === 'function' && typeof Origin01Invitation === 'function', 'StudioPreview continúa conectado al renderer público real')
assert(origin01DemoData.event.venue === 'Palacio del Lago', 'el fixture canónico no se muta')
assert(origin01DemoData.content.hero.phrase === 'Antes era un sueño. Ahora empieza.', 'la narrativa pública no cambia')

console.log(`Studio model: ${passed} assertions passed.`)
