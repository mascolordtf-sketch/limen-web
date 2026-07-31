import { updateInvitationModuleConfiguration } from '../invitations/engine/moduleConfiguration'
import type { InvitationModuleConfig, InvitationModuleId } from '../invitations/engine/moduleTypes'
import { findInvitationTemplate } from '../invitations/engine/templateRegistry'
import type { Origin01InvitationData, Origin01TriviaContent } from '../invitations/origin01/origin01ContentTypes'
import type { Origin01ThemeVariantId } from '../invitations/origin01/origin01ThemeVariants'
import { createOrigin01StudioMediaState } from './origin01StudioMedia'
import type { Origin01StudioMediaState } from './origin01StudioMedia'
import { toDateTimeLocalValue } from './studioDateTime'
import type { StudioShareMode } from './studioNavigation'

export type Origin01TriviaEditorialDraft = Omit<
  Origin01TriviaContent,
  'protagonistName' | 'accessibleTitle' | 'title' | 'revealSignature'
>

export type Origin01StudioDraft = {
  readonly themeVariant: Origin01ThemeVariantId
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
  readonly schedule: Origin01InvitationData['content']['schedule']
  readonly dressCode: Pick<Origin01InvitationData['content']['dressCode'], 'title' | 'description' | 'note'>
  readonly gallery: {
    readonly copy: Pick<Origin01InvitationData['content']['gallery'], 'eyebrow' | 'heading'>
    readonly captions: readonly string[]
  }
  readonly trivia: Origin01TriviaEditorialDraft
  readonly gifts: Pick<Origin01InvitationData['content']['gifts'], 'title' | 'description' | 'demoNote' | 'accountValue'>
  readonly rsvp: {
    readonly title: string
    readonly description: string
    readonly actionLabel: string
    readonly recipientPhone: string
  }
  readonly media: Origin01StudioMediaState
  readonly modules: readonly InvitationModuleConfig[]
}

export const getOrigin01StudioDraftSessionId = (invitation: Origin01InvitationData) => invitation.id

const createTriviaEditorialDraft = (trivia: Origin01TriviaContent): Origin01TriviaEditorialDraft => {
  const { protagonistName, accessibleTitle, title, revealSignature, ...editorial } = trivia
  void protagonistName
  void accessibleTitle
  void title
  void revealSignature

  return {
    ...editorial,
    questions: editorial.questions.map((question) => ({
      ...question,
      options: question.options.map((option) => ({ ...option })),
    })),
    resultTiers: editorial.resultTiers.map((tier) => ({ ...tier })),
  }
}

export function createOrigin01StudioDraft(invitation: Origin01InvitationData): Origin01StudioDraft {
  const protagonistName = invitation.identities.find(({ role }) => role === 'protagonist')?.displayName ?? ''
  const suggestedShareMessage = `${protagonistName} está por vivir una noche muy especial y quiere compartirla con vos.\nAntes era un sueño. Ahora empieza.`
  return {
    themeVariant: invitation.themeVariant,
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
    schedule: {
      ...invitation.content.schedule,
      moments: invitation.content.schedule.moments.map((moment) => ({ ...moment })),
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
    trivia: createTriviaEditorialDraft(invitation.content.trivia),
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
    media: createOrigin01StudioMediaState(invitation),
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

type Origin01StudioGroupKey = Exclude<keyof Origin01StudioDraft, 'themeVariant' | 'protagonistName' | 'modules'>
export type Origin01EditableSceneId =
  | 'prelude' | 'hero' | 'countdown' | 'story' | 'eventDetails' | 'dressCode'
  | 'schedule' | 'gallery' | 'trivia' | 'gifts' | 'rsvp' | 'closing'

export function resetOrigin01StudioValue<K extends keyof Origin01StudioDraft>(
  draft: Origin01StudioDraft,
  initialDraft: Origin01StudioDraft,
  key: K,
): Origin01StudioDraft {
  return updateOrigin01StudioDraftField(draft, key, initialDraft[key])
}

export function resetOrigin01StudioField<
  G extends Origin01StudioGroupKey,
  F extends keyof Origin01StudioDraft[G],
>(
  draft: Origin01StudioDraft,
  initialDraft: Origin01StudioDraft,
  group: G,
  field: F,
): Origin01StudioDraft {
  return updateOrigin01StudioDraftGroup(draft, group, (current) => ({
    ...current,
    [field]: initialDraft[group][field],
  }))
}

export function resetOrigin01StudioGroup<G extends Origin01StudioGroupKey>(
  draft: Origin01StudioDraft,
  initialDraft: Origin01StudioDraft,
  group: G,
): Origin01StudioDraft {
  return updateOrigin01StudioDraftField(draft, group, initialDraft[group])
}

export function resetOrigin01StudioScene(
  draft: Origin01StudioDraft,
  initialDraft: Origin01StudioDraft,
  sceneId: Origin01EditableSceneId,
): Origin01StudioDraft {
  if (sceneId === 'prelude') {
    const { heroPhrase, heroScrollHint } = draft.opening
    return { ...draft, opening: { ...initialDraft.opening, heroPhrase, heroScrollHint } }
  }
  if (sceneId === 'hero') {
    return { ...draft, opening: {
      ...draft.opening,
      heroPhrase: initialDraft.opening.heroPhrase,
      heroScrollHint: initialDraft.opening.heroScrollHint,
    } }
  }
  const group = sceneId as Exclude<Origin01EditableSceneId, 'prelude' | 'hero'>
  return { ...draft, [group]: initialDraft[group] }
}

export function resetOrigin01StudioConfiguration(
  draft: Origin01StudioDraft,
  initialDraft: Origin01StudioDraft,
): Origin01StudioDraft {
  return { ...draft, modules: initialDraft.modules.map((module) => ({ ...module })) }
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
