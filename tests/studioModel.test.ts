import { origin01DemoData } from '../src/features/invitations/origin01/origin01DemoData'
import { origin01StudioDomains, origin01TriviaFlow } from '../src/features/studio/origin01StudioConfiguration'
import {
  createOrigin01StudioDraft,
  deriveOrigin01PreviewInvitation,
  resetOrigin01StudioDraftScope,
  updateOrigin01StudioDraftField,
  updateOrigin01StudioDraftGroup,
  updateOrigin01StudioModule,
  validateOrigin01StudioDraft,
} from '../src/features/studio/useOrigin01StudioModel'
import { changeStudioPreviewAudience } from '../src/features/studio/useStudioPreviewAudience'

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

const resetStory = resetOrigin01StudioDraftScope(editedStory, initial, 'story')
assert(resetStory.story.message === initial.story.message, 'restablece solamente el grupo solicitado')
assert(resetStory.event === editedStory.event, 'el restablecimiento no modifica otros alcances')

const rescheduled = updateOrigin01StudioDraftGroup(initial, 'event', (event) => ({
  ...event,
  start: '2028-04-10T20:30',
  end: '2028-04-11T02:30',
  venue: 'Salón del Río',
  address: 'Costanera 100',
}))
const rescheduledPreview = deriveOrigin01PreviewInvitation(origin01DemoData, rescheduled)
assert(rescheduledPreview.event.startsAt.startsWith('2028-04-10'), 'deriva el inicio ISO desde la fuente local')
assert(rescheduledPreview.content.eventDetails.timeLabel === '20:30 a 02:30', 'deriva el rango horario editorial')
assert(rescheduledPreview.event.venue === 'Salón del Río', 'proyecta el lugar canónico')
assert(rescheduledPreview.event.address === 'Costanera 100', 'proyecta el destino de mapa desde la dirección')
assert(!('dateLabel' in rescheduled.event), 'no duplica proyecciones dentro de la fuente canónica')

const validBase = updateOrigin01StudioDraftGroup(initial, 'rsvp', (rsvp) => ({
  ...rsvp,
  recipientPhone: '+54 11 5555 5555',
}))
const validResult = validateOrigin01StudioDraft(origin01DemoData, validBase)
assert(validResult.invitationValid, 'distingue una invitación técnicamente válida')
assert(!validResult.editoriallyReviewed && !validResult.readyToPublish, 'mantiene revisión y publicación separadas de la validez')

const emptyName = updateOrigin01StudioDraftField(validBase, 'protagonistName', '')
assert(validateOrigin01StudioDraft(origin01DemoData, emptyName).fieldErrors.protagonistName !== null, 'reporta un campo obligatorio vacío')

const invalidStory = updateOrigin01StudioDraftGroup(validBase, 'story', (story) => ({ ...story, message: '' }))
const activeStoryResult = validateOrigin01StudioDraft(origin01DemoData, invalidStory)
assert(activeStoryResult.sceneStatuses.find(({ sceneId }) => sceneId === 'story')?.relevantErrorCount === 1, 'cuenta errores de una escena activa')
assert(!activeStoryResult.domainStatuses.find(({ domainId }) => domainId === 'narrative')?.complete, 'marca incompleto el dominio afectado')
const inactiveInvalidStory = updateOrigin01StudioModule(origin01DemoData, invalidStory, 'story', false)
const inactiveStoryResult = validateOrigin01StudioDraft(origin01DemoData, inactiveInvalidStory)
const storyStatus = inactiveStoryResult.sceneStatuses.find(({ sceneId }) => sceneId === 'story')
assert(storyStatus?.active === false, 'expone el estado inactivo de una escena')
assert(storyStatus?.relevantErrorCount === 0, 'los errores de contenido inactivo no son relevantes')
assert(inactiveStoryResult.invitationValid, 'el contenido inválido inactivo no bloquea la invitación')

const invalidDate = updateOrigin01StudioDraftGroup(validBase, 'event', (event) => ({ ...event, start: 'fecha inválida' }))
const invalidDateResult = validateOrigin01StudioDraft(origin01DemoData, invalidDate)
assert(invalidDateResult.previewBlocked && !invalidDateResult.structurallyValid, 'un error canónico estructural bloquea la derivación actual')

const longCaption = updateOrigin01StudioDraftGroup(validBase, 'gallery', (gallery) => ({
  ...gallery,
  captions: ['x'.repeat(161), ...gallery.captions.slice(1)],
}))
const warningResult = validateOrigin01StudioDraft(origin01DemoData, longCaption)
assert(warningResult.issues.some(({ severity }) => severity === 'warning'), 'clasifica advertencias no bloqueantes')
assert(!warningResult.previewBlocked && warningResult.invitationValid, 'una advertencia no bloquea la preview')

assert(origin01StudioDomains.map(({ id }) => id).join(',') === 'identity,event,narrative,experiences,review', 'define los cinco dominios en orden')
assert(origin01StudioDomains.find(({ id }) => id === 'experiences')?.items.some(({ sceneId }) => sceneId === 'trivia'), 'mantiene escenas en la configuración específica de Origin 01')
assert(origin01TriviaFlow[1].id === 'questions' && origin01TriviaFlow[1].preservesCanonicalOrder, 'prepara el flujo canónico de Trivia')

const audienceState = changeStudioPreviewAudience({ audience: 'protagonist', run: 0 }, 'guest')
assert(audienceState.audience === 'guest' && audienceState.run === 1, 'cambiar audiencia incrementa el reinicio')
assert(initial.protagonistName === 'Valentina', 'audiencia y borrador permanecen independientes')
assert(origin01DemoData.event.venue === 'Palacio del Lago', 'el fixture canónico no se muta')

console.log(`Studio model: ${passed} assertions passed.`)
