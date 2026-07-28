import { useMemo, useState } from 'react'

import { updateInvitationModuleConfiguration } from '../invitations/engine/moduleConfiguration'
import type { InvitationModuleConfig, InvitationModuleId } from '../invitations/engine/moduleTypes'
import { findInvitationTemplate } from '../invitations/engine/templateRegistry'
import { validateInvitationConfiguration } from '../invitations/engine/invitationValidation'
import type { Origin01InvitationData, Origin01TriviaContent } from '../invitations/origin01/origin01ContentTypes'
import { fromDateTimeLocalValue, toDateTimeLocalValue } from './studioDateTime'
import { deriveMonogram } from './studioIdentity'
import type { StudioDirtyStateBoundary, StudioDomainId, StudioShareMode } from './studioNavigation'
import { isTriviaContentValid } from './studioTriviaValidation'

export type Origin01StudioDraft = {
  readonly protagonistName: string
  readonly event: {
    readonly start: string
    readonly end: string
    readonly venue: string
    readonly address: string
  }
  readonly share: {
    readonly mode: StudioShareMode
    readonly customMessage: string
    readonly customMessageInitialized: boolean
  }
  readonly opening: {
    readonly preludeEyebrow: string
    readonly preludeBody: string
    readonly preludeReveal: string
    readonly preludeQuestion: string
    readonly preludeActionLabel: string
    readonly preludeSoundHint: string
    readonly heroPhrase: string
    readonly heroScrollHint: string
  }
  readonly story: { readonly eyebrow: string; readonly message: string }
  readonly closing: {
    readonly eyebrow: string
    readonly title: string
    readonly sharePrompt: string
    readonly shareActionLabel: string
  }
  readonly countdown: Origin01InvitationData['content']['countdown']
  readonly eventDetails: Pick<Origin01InvitationData['content']['eventDetails'],
    'eyebrow' | 'heading' | 'venueLabel' | 'mapActionLabel' | 'calendarActionLabel' | 'calendarDescription'>
  readonly dressCode: Pick<Origin01InvitationData['content']['dressCode'], 'title' | 'description' | 'note'>
  readonly gallery: {
    readonly copy: Pick<Origin01InvitationData['content']['gallery'], 'eyebrow' | 'heading'>
    readonly captions: readonly string[]
  }
  readonly trivia: Origin01TriviaContent
  readonly gifts: Pick<Origin01InvitationData['content']['gifts'], 'title' | 'description' | 'demoNote' | 'accountValue'>
  readonly rsvp: {
    readonly title: string
    readonly description: string
    readonly actionLabel: string
    readonly recipientPhone: string
  }
  readonly modules: readonly InvitationModuleConfig[]
}

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

const cloneTrivia = (trivia: Origin01TriviaContent): Origin01TriviaContent => ({
  ...trivia,
  questions: trivia.questions.map((question) => ({
    ...question,
    options: question.options.map((option) => ({ ...option })),
  })),
  resultTiers: trivia.resultTiers.map((tier) => ({ ...tier })),
})

export function createOrigin01StudioDraft(invitation: Origin01InvitationData): Origin01StudioDraft {
  const protagonistName = invitation.identities.find(({ role }) => role === 'protagonist')?.displayName ?? ''
  const suggestedShareMessage = `${protagonistName} está por vivir una noche muy especial y quiere compartirla con vos.\nAntes era un sueño. Ahora empieza.`
  return {
    protagonistName,
    event: {
      start: toDateTimeLocalValue(invitation.event.startsAt, invitation.event.timeZone),
      end: toDateTimeLocalValue(invitation.event.endsAt, invitation.event.timeZone),
      venue: invitation.event.venue,
      address: invitation.event.address,
    },
    share: { mode: 'default', customMessage: suggestedShareMessage, customMessageInitialized: false },
    opening: {
      preludeEyebrow: invitation.content.prelude.eyebrow,
      preludeBody: invitation.content.prelude.body,
      preludeReveal: invitation.content.prelude.reveal,
      preludeQuestion: invitation.content.prelude.question,
      preludeActionLabel: invitation.content.prelude.actionLabel,
      preludeSoundHint: invitation.content.prelude.soundHint,
      heroPhrase: invitation.content.hero.phrase,
      heroScrollHint: invitation.content.hero.scrollHint,
    },
    story: { eyebrow: invitation.content.story.eyebrow, message: invitation.content.story.message },
    closing: {
      eyebrow: invitation.content.closing.eyebrow,
      title: invitation.content.closing.title,
      sharePrompt: invitation.content.closing.sharePrompt,
      shareActionLabel: invitation.content.closing.shareActionLabel,
    },
    countdown: { ...invitation.content.countdown },
    eventDetails: {
      eyebrow: invitation.content.eventDetails.eyebrow,
      heading: invitation.content.eventDetails.heading,
      venueLabel: invitation.content.eventDetails.venueLabel,
      mapActionLabel: invitation.content.eventDetails.mapActionLabel,
      calendarActionLabel: invitation.content.eventDetails.calendarActionLabel,
      calendarDescription: invitation.content.eventDetails.calendarDescription,
    },
    dressCode: {
      title: invitation.content.dressCode.title,
      description: invitation.content.dressCode.description,
      note: invitation.content.dressCode.note,
    },
    gallery: {
      copy: { eyebrow: invitation.content.gallery.eyebrow, heading: invitation.content.gallery.heading },
      captions: invitation.content.gallery.images.map(({ caption }) => caption ?? ''),
    },
    trivia: cloneTrivia(invitation.content.trivia),
    gifts: {
      title: invitation.content.gifts.title,
      description: invitation.content.gifts.description,
      demoNote: invitation.content.gifts.demoNote,
      accountValue: invitation.content.gifts.accountValue,
    },
    rsvp: {
      title: invitation.content.rsvp.title,
      description: invitation.content.rsvp.description,
      actionLabel: invitation.content.rsvp.actionLabel,
      recipientPhone: invitation.content.rsvp.recipientPhone ?? '',
    },
    modules: invitation.modules.map((module) => ({ ...module })),
  }
}

export function updateOrigin01StudioDraftField<K extends keyof Origin01StudioDraft>(
  draft: Origin01StudioDraft,
  key: K,
  value: Origin01StudioDraft[K],
): Origin01StudioDraft {
  return { ...draft, [key]: value }
}

export function updateOrigin01StudioDraftGroup<K extends keyof Origin01StudioDraft>(
  draft: Origin01StudioDraft,
  key: K,
  updater: (current: Origin01StudioDraft[K]) => Origin01StudioDraft[K],
): Origin01StudioDraft {
  return { ...draft, [key]: updater(draft[key]) }
}

export function resetOrigin01StudioDraftScope<K extends keyof Origin01StudioDraft>(
  draft: Origin01StudioDraft,
  initialDraft: Origin01StudioDraft,
  key: K,
): Origin01StudioDraft {
  return updateOrigin01StudioDraftField(draft, key, initialDraft[key])
}

const required = (value: string, message: string) => value.trim().length === 0 ? message : null

const sceneIsActive = (draft: Origin01StudioDraft, sceneId: InvitationModuleId) =>
  draft.modules.some((module) => module.moduleId === sceneId && module.enabled)

type IssueSeed = Omit<StudioIssue, 'id' | 'severity' | 'blocksPreview' | 'relevant'> & {
  readonly error: string | null
  readonly warning?: boolean
}

export function validateOrigin01StudioDraft(
  invitation: Origin01InvitationData,
  draft: Origin01StudioDraft,
): Origin01StudioValidation {
  const start = fromDateTimeLocalValue(draft.event.start, invitation.event.timeZone)
  const end = fromDateTimeLocalValue(draft.event.end, invitation.event.timeZone)
  const moduleValidation = validateInvitationConfiguration({ ...invitation, modules: draft.modules }, findInvitationTemplate)
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
    giftsAccount: required(draft.gifts.accountValue, 'Ingresá el dato para regalar.'),
    storyEyebrow: required(draft.story.eyebrow, 'Ingresá el texto introductorio.'),
    storyMessage: required(draft.story.message, 'Ingresá el texto de la historia.'),
    preludeEyebrow: required(draft.opening.preludeEyebrow, 'Ingresá el texto introductorio del preludio.'),
    preludeBody: required(draft.opening.preludeBody, 'Ingresá el mensaje de apertura.'),
    preludeReveal: required(draft.opening.preludeReveal, 'Ingresá el texto de revelación.'),
    preludeQuestion: required(draft.opening.preludeQuestion, 'Ingresá la pregunta de entrada.'),
    preludeActionLabel: required(draft.opening.preludeActionLabel, 'Ingresá el texto de la acción.'),
    preludeSoundHint: required(draft.opening.preludeSoundHint, 'Ingresá la indicación de sonido.'),
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
  }

  const seeds: readonly IssueSeed[] = [
    { fieldId: 'protagonistName', error: fieldErrors.protagonistName, message: fieldErrors.protagonistName ?? '', editorId: 'identity', domainId: 'identity' },
    { fieldId: 'shareMessage', error: fieldErrors.shareMessage, message: fieldErrors.shareMessage ?? '', editorId: 'share', domainId: 'review' },
    ...(['eventStart', 'eventEnd', 'venue', 'address'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'event-canonical', domainId: 'event' as const })),
    ...(['preludeEyebrow', 'preludeBody', 'preludeReveal', 'preludeQuestion', 'preludeActionLabel', 'preludeSoundHint', 'heroPhrase', 'heroScrollHint'] as const)
      .map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'opening', domainId: 'narrative' as const, sceneId: fieldId.startsWith('hero') ? 'hero' as const : 'prelude' as const })),
    ...(['storyEyebrow', 'storyMessage'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'story', domainId: 'narrative' as const, sceneId: 'story' as const })),
    ...(['closingEyebrow', 'closingTitle', 'closingSharePrompt', 'closingShareActionLabel'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'closing', domainId: 'narrative' as const, sceneId: 'closing' as const })),
    ...(['countdownEyebrow', 'countdownHeading', 'countdownCompletedMessage'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'countdown', domainId: 'experiences' as const, sceneId: 'countdown' as const })),
    ...(['eventDetailsEyebrow', 'eventDetailsHeading', 'eventDetailsVenueLabel', 'eventDetailsMapActionLabel', 'eventDetailsCalendarActionLabel', 'eventDetailsCalendarDescription'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'event-copy', domainId: 'event' as const, sceneId: 'eventDetails' as const })),
    ...(['dressCodeTitle', 'dressCodeDescription', 'dressCodeNote'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'dress-code', domainId: 'experiences' as const, sceneId: 'dressCode' as const })),
    ...(['galleryEyebrow', 'galleryHeading'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'gallery', domainId: 'experiences' as const, sceneId: 'gallery' as const })),
    { fieldId: 'trivia', error: fieldErrors.trivia, message: fieldErrors.trivia ?? '', editorId: 'trivia', domainId: 'experiences', sceneId: 'trivia' },
    ...(['giftsTitle', 'giftsDescription', 'giftsNote', 'giftsAccount'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'gifts', domainId: fieldId === 'giftsAccount' ? 'event' as const : 'experiences' as const, sceneId: 'gifts' as const })),
    ...(['rsvpTitle', 'rsvpDescription', 'rsvpActionLabel', 'rsvpRecipientPhone'] as const).map((fieldId) => ({ fieldId, error: fieldErrors[fieldId], message: fieldErrors[fieldId] ?? '', editorId: 'rsvp', domainId: fieldId === 'rsvpRecipientPhone' ? 'event' as const : 'experiences' as const, sceneId: 'rsvp' as const })),
    ...draft.gallery.captions.map((caption, index) => ({
      fieldId: `galleryCaption${index}`,
      error: caption.length > 160 ? 'El epígrafe es extenso; revisalo en la invitación.' : null,
      message: 'El epígrafe es extenso; revisalo en la invitación.',
      editorId: 'gallery',
      domainId: 'experiences' as const,
      sceneId: 'gallery' as const,
      warning: true,
    })),
  ]

  const structuralIssues: StudioIssue[] = moduleValidation.errors.map((error, index) => ({
    id: `configuration-${error.code}-${index}`,
    message: error.message,
    fieldId: error.fieldPath,
    editorId: 'scene-configuration',
    domainId: 'experiences',
    sceneId: error.moduleId as InvitationModuleId | undefined,
    severity: 'structural',
    blocksPreview: true,
    relevant: true,
  }))
  const fieldIssues = seeds.filter((seed) => seed.error).map((seed, index): StudioIssue => {
    const active = seed.sceneId ? sceneIsActive(draft, seed.sceneId) : true
    return {
      id: `${seed.fieldId ?? seed.editorId}-${index}`,
      message: seed.message,
      fieldId: seed.fieldId,
      editorId: seed.editorId,
      domainId: seed.domainId,
      sceneId: seed.sceneId,
      severity: active ? seed.warning ? 'warning' : 'active-error' : 'inactive-content',
      blocksPreview: false,
      relevant: active,
    }
  })
  const issues = [...structuralIssues, ...fieldIssues]
  const template = findInvitationTemplate(invitation.templateId)
  const sceneStatuses = (template?.canonicalOrder ?? []).map((sceneId): StudioSceneStatus => {
    const requiredScene = template?.requiredModules.includes(sceneId) ?? false
    const active = requiredScene || sceneIsActive(draft, sceneId)
    const sceneIssues = issues.filter((issue) => issue.sceneId === sceneId)
    return {
      sceneId,
      required: requiredScene,
      active,
      complete: !sceneIssues.some((issue) => issue.relevant && issue.severity === 'active-error'),
      relevantErrorCount: sceneIssues.filter((issue) => issue.relevant && issue.severity === 'active-error').length,
      warningCount: sceneIssues.filter((issue) => issue.relevant && issue.severity === 'warning').length,
      blocksPreview: sceneIssues.some((issue) => issue.blocksPreview),
      hasContentPendingReview: active,
    }
  })
  const domainStatuses = (['identity', 'event', 'narrative', 'experiences', 'review'] as const)
    .map((domainId): StudioDomainStatus => {
      const domainIssues = issues.filter((issue) => issue.domainId === domainId)
      return {
        domainId,
        complete: !domainIssues.some((issue) => issue.relevant && (issue.severity === 'active-error' || issue.severity === 'structural')),
        relevantErrorCount: domainIssues.filter((issue) => issue.relevant && (issue.severity === 'active-error' || issue.severity === 'structural')).length,
        warningCount: domainIssues.filter((issue) => issue.relevant && issue.severity === 'warning').length,
        blocksPreview: domainIssues.some((issue) => issue.blocksPreview),
        hasContentPendingReview: domainId === 'review' || domainIssues.some((issue) => issue.severity === 'editorial-review'),
      }
    })
  const structurallyValid = structuralIssues.length === 0 && Boolean(start && end)
  const technicallyComplete = !issues.some((issue) => issue.relevant && issue.severity === 'active-error')
  return {
    fieldErrors,
    issues,
    sceneStatuses,
    domainStatuses,
    structurallyValid,
    technicallyComplete,
    editoriallyReviewed: false,
    invitationValid: structurallyValid && technicallyComplete,
    readyToPublish: false,
    previewBlocked: !structurallyValid,
  }
}

export function deriveOrigin01PreviewInvitation(
  invitation: Origin01InvitationData,
  draft: Origin01StudioDraft,
): Origin01InvitationData {
  const name = draft.protagonistName.trim()
  const startsAt = fromDateTimeLocalValue(draft.event.start, invitation.event.timeZone)
  const endsAt = fromDateTimeLocalValue(draft.event.end, invitation.event.timeZone)
  const dateLabel = startsAt ? new Intl.DateTimeFormat('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: invitation.event.timeZone,
  }).format(new Date(startsAt)) : ''
  const timeFormatter = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: invitation.event.timeZone,
  })
  const timeLabel = startsAt && endsAt
    ? `${timeFormatter.format(new Date(startsAt))} a ${timeFormatter.format(new Date(endsAt))}` : ''
  const suggestedShareMessage = `${name} está por vivir una noche muy especial y quiere compartirla con vos.\nAntes era un sueño. Ahora empieza.`
  const recipientDigits = draft.rsvp.recipientPhone.replace(/\D/g, '')
  return {
    ...invitation,
    modules: draft.modules,
    identities: invitation.identities.map((identity) => identity.role === 'protagonist'
      ? { ...identity, displayName: name } : identity),
    event: {
      ...invitation.event,
      name,
      startsAt: startsAt ?? invitation.event.startsAt,
      endsAt: endsAt ?? invitation.event.endsAt,
      venue: draft.event.venue,
      address: draft.event.address,
    },
    content: {
      ...invitation.content,
      prelude: { ...invitation.content.prelude, eyebrow: draft.opening.preludeEyebrow,
        title: `Hola, ${name}.`, body: draft.opening.preludeBody, reveal: draft.opening.preludeReveal,
        question: draft.opening.preludeQuestion, actionLabel: draft.opening.preludeActionLabel,
        soundHint: draft.opening.preludeSoundHint },
      hero: { ...invitation.content.hero, dateLabel, phrase: draft.opening.heroPhrase,
        scrollHint: draft.opening.heroScrollHint },
      countdown: { ...draft.countdown },
      eventDetails: { ...invitation.content.eventDetails, ...draft.eventDetails, dateLabel, timeLabel },
      envelope: { ...invitation.content.envelope, monogram: deriveMonogram(name) },
      story: { ...invitation.content.story, eyebrow: draft.story.eyebrow, message: draft.story.message, signature: name },
      dressCode: { ...invitation.content.dressCode, ...draft.dressCode },
      gallery: { ...invitation.content.gallery, ...draft.gallery.copy,
        images: invitation.content.gallery.images.map((image, index) => ({ ...image,
          caption: draft.gallery.captions[index]?.trim() ? draft.gallery.captions[index] : undefined })) },
      trivia: { ...draft.trivia, protagonistName: name, accessibleTitle: `Trivia sobre ${name}`,
        title: `¿Cuánto conocés de verdad a ${name}?`, revealSignature: name },
      gifts: { ...invitation.content.gifts, ...draft.gifts },
      rsvp: { ...invitation.content.rsvp, ...draft.rsvp, recipientPhone: recipientDigits,
        message: `Hola, confirmo mi asistencia a ${invitation.event.celebrationLabel} de ${name}.` },
      closing: { ...invitation.content.closing, ...draft.closing, signature: name,
        shareTitle: `${invitation.event.celebrationLabel} de ${name}`,
        shareText: draft.share.mode === 'default' ? suggestedShareMessage : draft.share.customMessage },
    },
  }
}

export function updateOrigin01StudioModule(
  invitation: Origin01InvitationData,
  draft: Origin01StudioDraft,
  moduleId: InvitationModuleId,
  enabled: boolean,
): Origin01StudioDraft {
  const template = findInvitationTemplate(invitation.templateId)
  if (!template || template.requiredModules.includes(moduleId)) return draft
  return { ...draft, modules: updateInvitationModuleConfiguration(draft.modules, { [moduleId]: enabled }) }
}

export function useOrigin01StudioModel(invitation: Origin01InvitationData) {
  const initialDraft = useMemo(() => createOrigin01StudioDraft(invitation), [invitation])
  const [draft, setDraft] = useState<Origin01StudioDraft>(() => createOrigin01StudioDraft(invitation))
  const validation = useMemo(() => validateOrigin01StudioDraft(invitation, draft), [draft, invitation])
  const previewInvitation = useMemo(() => deriveOrigin01PreviewInvitation(invitation, draft), [draft, invitation])
  const configurationValidation = useMemo(
    () => validateInvitationConfiguration({ ...invitation, modules: draft.modules }, findInvitationTemplate),
    [draft.modules, invitation],
  )

  const update = <K extends keyof Origin01StudioDraft>(key: K, value: Origin01StudioDraft[K]) =>
    setDraft((current) => updateOrigin01StudioDraftField(current, key, value))
  const updateGroup = <K extends keyof Origin01StudioDraft>(
    key: K,
    updater: (current: Origin01StudioDraft[K]) => Origin01StudioDraft[K],
  ) => setDraft((current) => updateOrigin01StudioDraftGroup(current, key, updater))
  const resetField = <K extends keyof Origin01StudioDraft>(key: K) => update(key, initialDraft[key])
  const resetGroup = <K extends keyof Origin01StudioDraft>(key: K) => resetField(key)
  const resetConfiguration = () => update('modules', initialDraft.modules.map((module) => ({ ...module })))
  const setModuleEnabled = (moduleId: InvitationModuleId, enabled: boolean) =>
    setDraft((current) => updateOrigin01StudioModule(invitation, current, moduleId, enabled))

  const dirtyState: StudioDirtyStateBoundary<Origin01StudioDraft> = {
    initialDraft,
    currentDraft: draft,
  }

  return {
    draft,
    initialDraft,
    validation,
    configurationValidation,
    previewInvitation,
    dirtyState,
    update,
    updateGroup,
    resetField,
    resetGroup,
    resetConfiguration,
    setModuleEnabled,
  }
}
