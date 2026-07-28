import { AppRoutes } from '../src/app/routes'
import { Origin01Invitation } from '../src/features/invitations/origin01/Origin01Invitation'
import { origin01DemoData } from '../src/features/invitations/origin01/origin01DemoData'
import { origin01Template } from '../src/features/invitations/origin01/origin01Template'
import { StudioInvitationRoute } from '../src/features/studio/StudioInvitationRoute'
import { StudioPreview } from '../src/features/studio/StudioPreview'
import { getStudioEditorResolution, isStudioEditorId, studioEditorSurfaceFields } from '../src/features/studio/StudioActiveEditor'
import { deriveOrigin01PreviewInvitation } from '../src/features/studio/origin01StudioDerivations'
import {
  createOrigin01StudioDraft,
  getOrigin01StudioDraftSessionId,
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
import { selectStudioIssueSummary, selectStudioItemStatus } from '../src/features/studio/studioItemStatus'
import {
  createStudioPreviewAudienceState,
  getStudioPreviewKey,
  transitionStudioPreviewAudience,
} from '../src/features/studio/studioPreviewAudience'
import { createInitialStudioNavigation, transitionStudioNavigation } from '../src/features/studio/studioNavigation'

let passed = 0
const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message)
  passed += 1
}

const initial = createOrigin01StudioDraft(origin01DemoData)
assert(initial.event.venue === 'Palacio del Lago', 'inicializa el lugar desde el fixture')
assert(initial !== createOrigin01StudioDraft(origin01DemoData), 'crea borradores independientes')

const triviaProjectionKeys = ['protagonistName', 'accessibleTitle', 'title', 'revealSignature'] as const
assert(triviaProjectionKeys.every((key) => !(key in initial.trivia)), 'el borrador de Trivia excluye todas las proyecciones identitarias')

const renamed = updateOrigin01StudioDraftField(initial, 'protagonistName', 'Amparo')
const renamedPreview = deriveOrigin01PreviewInvitation(origin01DemoData, renamed)
assert(renamedPreview.identities[0]?.displayName === 'Amparo', 'actualiza la fuente canónica de identidad')
assert(renamedPreview.content.prelude.title === 'Hola, Amparo.', 'deriva el saludo')
assert(renamedPreview.content.envelope.monogram === 'A', 'deriva el monograma')
assert(renamedPreview.content.story.signature === 'Amparo', 'deriva la firma')
assert(renamedPreview.content.trivia.protagonistName === 'Amparo', 'deriva la identidad de Trivia')

assert(renamed.trivia === initial.trivia, 'cambiar el nombre no muta ni reemplaza el borrador editorial de Trivia')
assert(renamedPreview.content.trivia.accessibleTitle === 'Trivia sobre Amparo', 'deriva el título accesible de Trivia')
assert(renamedPreview.content.trivia.title === '¿Cuánto conocés de verdad a Amparo?', 'deriva el título visible de Trivia')
assert(renamedPreview.content.trivia.revealSignature === 'Amparo', 'deriva la firma final de Trivia')
assert(renamedPreview.content.trivia.description === initial.trivia.description
  && renamedPreview.content.trivia.questions === initial.trivia.questions
  && renamedPreview.content.trivia.resultTiers === initial.trivia.resultTiers,
  'el contenido editorial de Trivia se conserva durante la derivación')

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

const invalidGiftAccount = updateOrigin01StudioDraftGroup(validBase, 'gifts', (gifts) => ({
  ...gifts, accountValue: '',
}))
const invalidGiftResult = validateOrigin01StudioDraft(origin01DemoData, invalidGiftAccount)
const giftEventDomain = invalidGiftResult.domainStatuses.find(({ domainId }) => domainId === 'event')
const giftExperiencesDomain = invalidGiftResult.domainStatuses.find(({ domainId }) => domainId === 'experiences')
const giftScene = invalidGiftResult.sceneStatuses.find(({ sceneId }) => sceneId === 'gifts')
const giftIssue = invalidGiftResult.issues.find(({ fieldId }) => fieldId === 'giftsAccount')
assert(giftIssue?.domainId === 'event' && giftIssue.editorId === 'event-operations', 'ubica el dato operativo de Regalos inequívocamente en Evento')
assert(giftEventDomain?.complete === false && giftEventDomain.relevantErrorCount === 1, 'Evento contabiliza el error operativo de Regalos')
assert(giftExperiencesDomain?.complete === true && giftExperiencesDomain.relevantErrorCount === 0, 'Experiencias no hereda silenciosamente el error operativo de Regalos')
assert(giftScene?.complete === false && giftScene.relevantErrorCount === 1, 'la escena Regalos contempla globalmente su campo operativo')

const invalidRsvpPhone = updateOrigin01StudioDraftGroup(validBase, 'rsvp', (rsvp) => ({
  ...rsvp, recipientPhone: '',
}))
const invalidRsvpResult = validateOrigin01StudioDraft(origin01DemoData, invalidRsvpPhone)
const rsvpEventDomain = invalidRsvpResult.domainStatuses.find(({ domainId }) => domainId === 'event')
const rsvpExperiencesDomain = invalidRsvpResult.domainStatuses.find(({ domainId }) => domainId === 'experiences')
const rsvpScene = invalidRsvpResult.sceneStatuses.find(({ sceneId }) => sceneId === 'rsvp')
const rsvpIssue = invalidRsvpResult.issues.find(({ fieldId }) => fieldId === 'rsvpRecipientPhone')
assert(rsvpIssue?.domainId === 'event' && rsvpIssue.editorId === 'event-operations', 'ubica el teléfono de RSVP inequívocamente en Evento')
assert(rsvpEventDomain?.complete === false && rsvpEventDomain.relevantErrorCount === 1, 'Evento contabiliza el error operativo de RSVP')
assert(rsvpExperiencesDomain?.complete === true && rsvpExperiencesDomain.relevantErrorCount === 0, 'Experiencias no hereda silenciosamente el error operativo de RSVP')
assert(rsvpScene?.complete === false && rsvpScene.relevantErrorCount === 1, 'la escena RSVP contempla globalmente su campo operativo')
for (const domain of [...invalidGiftResult.domainStatuses, ...invalidRsvpResult.domainStatuses]) {
  assert(domain.complete === (domain.relevantErrorCount === 0), `coherencia de completitud y conteo en ${domain.domainId}`)
  assert(!domain.blocksPreview || (!domain.complete && domain.relevantErrorCount > 0), `coherencia de bloqueo en ${domain.domainId}`)
}

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
const narrativeScenes = domains.find(({ id }) => id === 'narrative')?.items.flatMap(({ id, sceneId }) =>
  id === 'opening' ? ['prelude', 'hero'] : sceneId ? [sceneId] : [])
const expectedNarrative = origin01Template.canonicalOrder.filter((sceneId) =>
  ['prelude', 'hero', 'story', 'closing'].includes(sceneId))
assert(narrativeScenes?.join() === expectedNarrative.join(), 'Narrativa mantiene el orden canónico de la plantilla')
const storyNavigation = domains.flatMap(({ items }) => items).find(({ sceneId }) => sceneId === 'story')
assert(storyNavigation?.required === origin01Template.requiredModules.includes('story')
  && storyNavigation.canToggle === origin01Template.optionalModules.includes('story'), 'deriva obligatoriedad y activación desde la plantilla')
assert(origin01TriviaFlow[1].id === 'questions' && origin01TriviaFlow[1].preservesCanonicalOrder, 'prepara el flujo canónico de Trivia')
const navigation = createInitialStudioNavigation(domains)
assert(navigation.domainId === 'identity' && navigation.editorId === 'identity', 'la selección inicial es determinista y resoluble')
const experiencesDomain = domains.find(({ id }) => id === 'experiences')!
const triviaItem = experiencesDomain.items.find(({ editorId }) => editorId === 'trivia')!
const triviaNavigation = transitionStudioNavigation(navigation, { type: 'open-item', domainId: 'experiences', item: triviaItem })
const returnedNavigation = transitionStudioNavigation(triviaNavigation, { type: 'show-domain-index' })
assert(triviaNavigation.mobileLevel === 'editor' && triviaNavigation.returnLevel === 'domain-index'
  && returnedNavigation.mobileLevel === 'domain-index', 'el modelo móvil representa editor y retorno contextual')
const draftBeforeNavigation = JSON.stringify(initial)
transitionStudioNavigation(triviaNavigation, { type: 'show-general-index' })
assert(JSON.stringify(initial) === draftBeforeNavigation, 'navegar no modifica borrador, módulos ni Trivia')
assert(domains.every((domain) => domain.items.length > 0), 'la navegación secundaria proviene de los metadatos de cada dominio')
assert(domains.flatMap(({ items }) => items).every(({ editorId }) => isStudioEditorId(editorId)),
  'todos los editorId configurados se resuelven con el contrato productivo')
assert(getStudioEditorResolution(undefined) === 'unselected'
  && getStudioEditorResolution('editor-inexistente') === 'unresolved',
  'distingue una selección ausente de un editor no resoluble')
const openedEvent = transitionStudioNavigation(navigation, { type: 'open-domain', domainId: 'event' })
assert(openedEvent.domainId === 'event' && openedEvent.itemId === undefined && openedEvent.editorId === undefined,
  'open-domain representa un dominio sin item activo')
assert(triviaNavigation.editorId === 'trivia'
  && initial.trivia.questions.map(({ id }) => id).join() === validBase.trivia.questions.map(({ id }) => id).join()
  && initial.modules.find(({ moduleId }) => moduleId === 'trivia')?.enabled,
  'entrar y salir de Trivia conserva contenido, activación y orden')
assert(studioEditorSurfaceFields['event-operations'].join() === 'giftsAccount,rsvpRecipientPhone'
  && !studioEditorSurfaceFields.gifts.includes('giftsAccount' as never)
  && !studioEditorSurfaceFields.rsvp.includes('rsvpRecipientPhone' as never),
  'los datos operativos poseen una única superficie propietaria')
assert(!studioEditorSurfaceFields.countdown.some((field) => field.startsWith('eventDetails')),
  'Cuenta regresiva no expone Datos del evento')
const eventOperations = domains.find(({ id }) => id === 'event')!.items.find(({ editorId }) => editorId === 'event-operations')!
assert(selectStudioItemStatus(invalidGiftResult, eventOperations, 'event').relevantErrorCount === 1
  && selectStudioItemStatus(invalidRsvpResult, eventOperations, 'event').relevantErrorCount === 1,
  'event-operations refleja los errores relevantes de sus campos propietarios')
assert(storyStatus?.active === false && invalidStory.story.message === inactiveInvalidStory.story.message,
  'una experiencia opcional inactiva conserva contenido y comunica estado inactivo')
assert(selectStudioIssueSummary(activeStoryResult).errorCount >= 1
  && activeStoryResult.issues.find(({ fieldId }) => fieldId === 'storyMessage')?.severity === 'active-error',
  'review-errors cuenta errores editoriales relevantes además de bloqueos estructurales')

const initialAudience = createStudioPreviewAudienceState()
assert(initialAudience.audience === 'protagonist' && initialAudience.run === 0, 'inicializa la audiencia productiva')
transitionStudioNavigation(navigation, { type: 'open-domain', domainId: 'review' })
assert(initialAudience.audience === 'protagonist' && getStudioPreviewKey(initialAudience) === 'protagonist-0',
  'navegar no modifica audiencia ni previewKey')
const guestAudience = transitionStudioPreviewAudience(initialAudience, { type: 'change-audience', audience: 'guest' })
assert(guestAudience.audience === 'guest' && guestAudience.run === 1, 'la transición productiva cambia audiencia y reinicia')
const restartedAudience = transitionStudioPreviewAudience(guestAudience, { type: 'restart' })
assert(restartedAudience.audience === 'guest' && restartedAudience.run === 2, 'el reinicio manual conserva audiencia e incrementa run')
assert(getStudioPreviewKey(restartedAudience) === 'guest-2', 'la key productiva refleja audiencia y run')
assert(initial.protagonistName === 'Valentina', 'audiencia y borrador permanecen independientes')

const secondInvitation = {
  ...origin01DemoData,
  id: 'origin01-demo-second-session',
  code: 'LMN-SECOND',
  identities: [{ displayName: 'Renata', role: 'protagonist' }],
  event: { ...origin01DemoData.event, name: 'Renata' },
}
const editedFirstSession = updateOrigin01StudioDraftField(initial, 'protagonistName', 'Borrador anterior')
const secondSessionDraft = createOrigin01StudioDraft(secondInvitation)
assert(getOrigin01StudioDraftSessionId(origin01DemoData) !== getOrigin01StudioDraftSessionId(secondInvitation), 'cada invitación posee una identidad de sesión estable y distinta')
assert(editedFirstSession.protagonistName === 'Borrador anterior' && secondSessionDraft.protagonistName === 'Renata', 'una invitación nueva inicializa un borrador independiente')
assert(secondSessionDraft.event.venue === secondInvitation.event.venue, 'resets y derivaciones de la nueva sesión parten de su propia invitación')

assert(typeof AppRoutes === 'function' && typeof StudioInvitationRoute === 'function', 'la ruta actual de Studio continúa disponible')
assert(typeof StudioPreview === 'function' && typeof Origin01Invitation === 'function', 'StudioPreview continúa conectado al renderer público real')
assert(origin01DemoData.event.venue === 'Palacio del Lago', 'el fixture canónico no se muta')
assert(origin01DemoData.content.hero.phrase === 'Antes era un sueño. Ahora empieza.', 'la narrativa pública no cambia')

console.log(`Studio model: ${passed} assertions passed.`)
