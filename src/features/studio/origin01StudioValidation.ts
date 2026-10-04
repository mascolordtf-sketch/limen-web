import type { InvitationModuleId } from '../invitations/engine/moduleTypes'
import { findInvitationTemplate } from '../invitations/engine/templateRegistry'
import { validateInvitationConfiguration } from '../invitations/engine/invitationValidation'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { fromDateTimeLocalValue } from './studioDateTime'
import type { Origin01StudioDraft } from './origin01StudioDraft'
import type { StudioDomainId } from './studioNavigation'
import { isTriviaContentValid } from './studioTriviaValidation'
import { validateOrigin01Schedule } from './origin01StudioSchedule'
import { validateOrigin01Community } from './studioCommunityValidation'
import { getOrigin01StudioMusic, validateOrigin01StudioMedia } from './origin01StudioMedia'

export type StudioIssueSeverity =
  | 'structural'
  | 'active-error'
  | 'warning'
  | 'inactive-content'
  | 'editorial-review'

export type StudioIssue = {
  readonly id: string
  readonly message: string
  readonly fieldId?: string
  readonly fieldTargetId?: string
  readonly editorId: string
  readonly domainId: StudioDomainId
  readonly sceneId?: InvitationModuleId
  readonly severity: StudioIssueSeverity
  readonly blocksPreview: boolean
  readonly relevant: boolean
}

export type StudioSceneStatus = {
  readonly sceneId: InvitationModuleId
  readonly required: boolean
  readonly active: boolean
  readonly complete: boolean
  readonly relevantErrorCount: number
  readonly warningCount: number
  readonly blocksPreview: boolean
  readonly hasContentPendingReview: boolean
}

export type StudioDomainStatus = {
  readonly domainId: StudioDomainId
  readonly complete: boolean
  readonly relevantErrorCount: number
  readonly warningCount: number
  readonly blocksPreview: boolean
  readonly hasContentPendingReview: boolean
}

export type Origin01StudioValidation = {
  readonly fieldErrors: Readonly<Record<string, string | null>>
  readonly issues: readonly StudioIssue[]
  readonly sceneStatuses: readonly StudioSceneStatus[]
  readonly domainStatuses: readonly StudioDomainStatus[]
  readonly structurallyValid: boolean
  readonly technicallyComplete: boolean
  readonly editoriallyReviewed: boolean
  readonly invitationValid: boolean
  readonly readyToPublish: false
  readonly previewBlocked: boolean
}

const sceneDomain = (sceneId: InvitationModuleId): StudioDomainId => {
  if (sceneId === 'prelude' || sceneId === 'hero' || sceneId === 'story' || sceneId === 'closing') {
    return 'narrative'
  }
  if (sceneId === 'eventDetails') return 'event'
  return 'experiences'
}

const required = (value: string, message: string) => value.trim().length === 0 ? message : null

const sceneIsActive = (draft: Origin01StudioDraft, sceneId: InvitationModuleId) =>
  draft.modules.some((module) => module.moduleId === sceneId && module.enabled)

type IssueSeed = Omit<StudioIssue, 'id' | 'severity' | 'blocksPreview' | 'relevant'> & {
  readonly error: string | null
  readonly warning?: boolean
  readonly structural?: boolean
}

const studioFieldTargetIds: Readonly<Record<string, string>> = {
  protagonistName: 'studio-protagonist-name', shareMessage: 'studio-custom-share-message',
  eventStart: 'studio-event-start', eventEnd: 'studio-event-end', venue: 'studio-event-venue', address: 'studio-event-address',
  dressCodeTitle: 'studio-dress-code-title', dressCodeDescription: 'studio-dress-code-description', dressCodeNote: 'studio-dress-code-note',
  rsvpTitle: 'studio-rsvp-title', rsvpDescription: 'studio-rsvp-description', rsvpActionLabel: 'studio-rsvp-action-label', rsvpRecipientPhone: 'studio-rsvp-recipient-phone',
  giftsTitle: 'studio-gifts-title', giftsDescription: 'studio-gifts-description', giftsNote: 'studio-gifts-note',
  giftsAccountHolder: 'studio-gifts-account-holder', giftsBankName: 'studio-gifts-bank-name', giftsAccount: 'studio-gifts-account',
  storyEyebrow: 'studio-story-eyebrow', storyMessage: 'studio-story-message',
  preludeEyebrow: 'studio-opening-prelude-eyebrow', preludeBody: 'studio-opening-prelude-body', preludeReveal: 'studio-opening-prelude-reveal',
  preludeQuestion: 'studio-opening-prelude-question', preludeActionLabel: 'studio-opening-prelude-action', preludeSoundHint: 'studio-opening-prelude-sound',
  heroPhrase: 'studio-opening-hero-phrase', heroScrollHint: 'studio-opening-hero-scroll',
  closingEyebrow: 'studio-closing-eyebrow', closingTitle: 'studio-closing-title', closingSharePrompt: 'studio-closing-share-prompt', closingShareActionLabel: 'studio-closing-share-action',
  countdownEyebrow: 'studio-countdown-eyebrow', countdownHeading: 'studio-countdown-heading', countdownCompletedMessage: 'studio-countdown-completed-message',
  eventDetailsEyebrow: 'studio-event-details-eyebrow', eventDetailsHeading: 'studio-event-details-heading', eventDetailsVenueLabel: 'studio-event-details-venue-label',
  eventDetailsMapActionLabel: 'studio-event-details-map-action', eventDetailsCalendarActionLabel: 'studio-event-details-calendar-action',
  eventDetailsCalendarDescription: 'studio-event-details-calendar-description', galleryEyebrow: 'studio-gallery-eyebrow', galleryHeading: 'studio-gallery-title',
  scheduleEyebrow: 'studio-schedule-eyebrow', scheduleHeading: 'studio-schedule-heading-field',
  scheduleIntroduction: 'studio-schedule-introduction',
  weatherEyebrow: 'studio-weather-eyebrow', weatherHeading: 'studio-weather-heading',
  weatherIntroduction: 'studio-weather-introduction', weatherLocation: 'studio-weather-location-title',
  communityEyebrow: 'studio-community-eyebrow', communityHeading: 'studio-community-heading',
  communityIntroduction: 'studio-community-introduction', communityFeatures: 'studio-community-features',
  communityInstagramHandle: 'studio-community-instagram-handle', communityInstagramActionLabel: 'studio-community-instagram-action',
  communityHashtag: 'studio-community-hashtag', communityHashtagActionLabel: 'studio-community-hashtag-action',
  communityHashtagCopiedLabel: 'studio-community-hashtag-copied', communityAlbumUrl: 'studio-community-album-url',
  communityAlbumInvitation: 'studio-community-album-invitation', communityAlbumActionLabel: 'studio-community-album-action',
}

export function validateOrigin01StudioDraft(
  invitation: Origin01InvitationData,
  draft: Origin01StudioDraft,
): Origin01StudioValidation {
  const hasMusic = Boolean(getOrigin01StudioMusic(draft.media))
  const start = fromDateTimeLocalValue(draft.event.start, invitation.event.timeZone)
  const end = fromDateTimeLocalValue(draft.event.end, invitation.event.timeZone)
  const moduleValidation = validateInvitationConfiguration({
    ...invitation,
    themeVariant: draft.themeVariant,
    modules: draft.modules,
  }, findInvitationTemplate)
  const mediaValidation = validateOrigin01StudioMedia(draft.media)
  const triviaValid = isTriviaContentValid(draft.trivia)
  const fieldErrors: Record<string, string | null> = {
    protagonistName: required(draft.protagonistName, 'Ingresá el nombre de la protagonista.'),
    shareMessage: draft.share.mode === 'custom'
      ? required(draft.share.customMessage, 'Ingresá un mensaje para compartir.') : null,
    eventStart: start ? null : 'Ingresá una fecha y hora válidas.',
    eventEnd: !end ? 'Ingresá una fecha y hora de finalización válidas.'
      : start && new Date(end).getTime() <= new Date(start).getTime()
        ? 'La finalización debe ser posterior al inicio.' : null,
    venue: required(draft.event.venue, 'Ingresá el nombre del lugar.'),
    address: required(draft.event.address, 'Ingresá la dirección del evento.'),
    dressCodeTitle: required(draft.dressCode.title, 'Ingresá el tipo de vestimenta.'),
    dressCodeDescription: required(draft.dressCode.description, 'Ingresá una descripción del Dress Code.'),
    dressCodeNote: required(draft.dressCode.note, 'Ingresá una nota destacada.'),
    rsvpTitle: required(draft.rsvp.title, 'Ingresá un título para la confirmación.'),
    rsvpDescription: required(draft.rsvp.description, 'Ingresá una descripción para la confirmación.'),
    rsvpActionLabel: required(draft.rsvp.actionLabel, 'Ingresá el texto del botón.'),
    rsvpRecipientPhone: !/^\+?[\d ()-]+$/.test(draft.rsvp.recipientPhone.trim())
      || draft.rsvp.recipientPhone.replace(/\D/g, '').length < 7
      || draft.rsvp.recipientPhone.replace(/\D/g, '').length > 15
      ? 'Ingresá un número de WhatsApp válido.' : null,
    giftsTitle: required(draft.gifts.title, 'Ingresá un título para la sección de regalos.'),
    giftsDescription: required(draft.gifts.description, 'Ingresá una descripción para la sección de regalos.'),
    giftsNote: required(draft.gifts.demoNote, 'Ingresá una nota destacada.'),
    giftsAccountHolder: required(draft.gifts.accountHolder, 'Ingresá el nombre del titular.'),
    giftsBankName: required(draft.gifts.bankName, 'Ingresá el nombre del banco o billetera.'),
    giftsAccount: required(draft.gifts.accountValue, 'Ingresá el dato para regalar.'),
    storyEyebrow: required(draft.story.eyebrow, 'Ingresá el texto introductorio.'),
    storyMessage: required(draft.story.message, 'Ingresá el texto de la historia.'),
    preludeEyebrow: required(draft.opening.preludeEyebrow, 'Ingresá el texto introductorio del preludio.'),
    preludeBody: required(draft.opening.preludeBody, 'Ingresá el mensaje de apertura.'),
    preludeReveal: required(draft.opening.preludeReveal, 'Ingresá el texto de revelación.'),
    preludeQuestion: required(draft.opening.preludeQuestion, 'Ingresá la pregunta de entrada.'),
    preludeActionLabel: required(draft.opening.preludeActionLabel, 'Ingresá el texto de la acción.'),
    preludeSoundHint: hasMusic
      ? required(draft.opening.preludeSoundHint, 'Ingresá la indicación de sonido.')
      : null,
    heroPhrase: required(draft.opening.heroPhrase, 'Ingresá el título principal.'),
    heroScrollHint: required(draft.opening.heroScrollHint, 'Ingresá el texto de desplazamiento.'),
    closingEyebrow: required(draft.closing.eyebrow, 'Ingresá el texto introductorio del cierre.'),
    closingTitle: required(draft.closing.title, 'Ingresá un título para el cierre.'),
    closingSharePrompt: required(draft.closing.sharePrompt, 'Ingresá la invitación a compartir.'),
    closingShareActionLabel: required(draft.closing.shareActionLabel, 'Ingresá el texto de la acción para compartir.'),
    countdownEyebrow: required(draft.countdown.eyebrow, 'Este texto es obligatorio.'),
    countdownHeading: required(draft.countdown.heading, 'Este texto es obligatorio.'),
    countdownCompletedMessage: required(draft.countdown.completedMessage, 'Este texto es obligatorio.'),
    eventDetailsEyebrow: required(draft.eventDetails.eyebrow, 'Este texto es obligatorio.'),
    eventDetailsHeading: required(draft.eventDetails.heading, 'Este texto es obligatorio.'),
    eventDetailsVenueLabel: required(draft.eventDetails.venueLabel, 'Este texto es obligatorio.'),
    eventDetailsMapActionLabel: required(draft.eventDetails.mapActionLabel, 'Este texto es obligatorio.'),
    eventDetailsCalendarActionLabel: required(draft.eventDetails.calendarActionLabel, 'Este texto es obligatorio.'),
    eventDetailsCalendarDescription: required(draft.eventDetails.calendarDescription, 'Este texto es obligatorio.'),
    galleryEyebrow: required(draft.gallery.copy.eyebrow, 'Este texto es obligatorio.'),
    galleryHeading: required(draft.gallery.copy.heading, 'Este texto es obligatorio.'),
    trivia: triviaValid ? null : 'La Trivia tiene contenido obligatorio incompleto.',
    ...validateOrigin01Schedule(draft.schedule),
    weatherEyebrow: required(draft.weather.eyebrow, 'Este texto es obligatorio.'),
    weatherHeading: required(draft.weather.heading, 'Este texto es obligatorio.'),
    weatherIntroduction: required(draft.weather.introduction, 'Este texto es obligatorio.'),
    weatherLocation: draft.weather.location.name.trim().length > 0
      && draft.weather.location.country.trim().length > 0
      && draft.weather.location.timezone.trim().length > 0
      && Number.isFinite(draft.weather.location.latitude)
      && draft.weather.location.latitude >= -90 && draft.weather.location.latitude <= 90
      && Number.isFinite(draft.weather.location.longitude)
      && draft.weather.location.longitude >= -180 && draft.weather.location.longitude <= 180
      ? null : 'Confirmá una localidad meteorológica válida.',
    ...validateOrigin01Community(draft.community),
  }

  const seeds: readonly IssueSeed[] = [
    { fieldId: 'protagonistName', error: fieldErrors.protagonistName, message: fieldErrors.protagonistName ?? '', editorId: 'identity', domainId: 'identity' },
    { fieldId: 'shareMessage', error: fieldErrors.shareMessage, message: fieldErrors.shareMessage ?? '', editorId: 'share', domainId: 'review' },
    ...(['eventStart', 'eventEnd', 'venue', 'address'] as const).map((fieldId) => ({
      fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '',
      editorId: 'event-canonical', domainId: 'event' as const,
      structural: fieldId === 'eventStart' || fieldId === 'eventEnd',
    })),
    ...(['preludeEyebrow', 'preludeBody', 'preludeReveal', 'preludeQuestion', 'preludeActionLabel', 'preludeSoundHint', 'heroPhrase', 'heroScrollHint'] as const)
      .map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'opening', domainId: 'narrative' as const, sceneId: fieldId.startsWith('hero') ? 'hero' as const : 'prelude' as const })),
    ...(['storyEyebrow', 'storyMessage'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'story', domainId: 'narrative' as const, sceneId: 'story' as const })),
    ...(['closingEyebrow', 'closingTitle', 'closingSharePrompt', 'closingShareActionLabel'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'closing', domainId: 'narrative' as const, sceneId: 'closing' as const })),
    ...(['countdownEyebrow', 'countdownHeading', 'countdownCompletedMessage'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'countdown', domainId: 'experiences' as const, sceneId: 'countdown' as const })),
    ...(['eventDetailsEyebrow', 'eventDetailsHeading', 'eventDetailsVenueLabel', 'eventDetailsMapActionLabel', 'eventDetailsCalendarActionLabel', 'eventDetailsCalendarDescription'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'event-copy', domainId: 'event' as const, sceneId: 'eventDetails' as const })),
    ...(['scheduleEyebrow', 'scheduleHeading', 'scheduleIntroduction', 'scheduleMoments', 'scheduleMomentIds'] as const)
      .map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '',
        editorId: 'schedule', domainId: 'experiences' as const, sceneId: 'schedule' as const })),
    ...draft.schedule.moments.flatMap((moment) => (['time', 'title'] as const).map((field) => {
      const fieldId = `scheduleMoment-${moment.id}-${field}`
      return {
        fieldId,
        fieldTargetId: `studio-schedule-${moment.id}-${field}`,
        error: fieldErrors[fieldId],
        message: fieldErrors[fieldId] ?? '',
        editorId: 'schedule',
        domainId: 'experiences' as const,
        sceneId: 'schedule' as const,
      }
    })),
    ...(['weatherEyebrow', 'weatherHeading', 'weatherIntroduction', 'weatherLocation'] as const)
      .map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '',
        editorId: 'weather', domainId: 'experiences' as const, sceneId: 'weather' as const })),
    ...(['dressCodeTitle', 'dressCodeDescription', 'dressCodeNote'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'dress-code', domainId: 'experiences' as const, sceneId: 'dressCode' as const })),
    ...(['galleryEyebrow', 'galleryHeading'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'gallery', domainId: 'experiences' as const, sceneId: 'gallery' as const })),
    ...(['communityEyebrow', 'communityHeading', 'communityIntroduction', 'community