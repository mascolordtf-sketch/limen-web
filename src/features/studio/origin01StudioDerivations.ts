import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { fromDateTimeLocalValue } from './studioDateTime'
import { deriveMonogram } from './studioIdentity'
import type { Origin01StudioDraft } from './origin01StudioDraft'
import { deriveOrigin01MediaInvitation } from './origin01StudioMedia'

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
  const derivedInvitation: Origin01InvitationData = {
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
  return deriveOrigin01MediaInvitation(derivedInvitation, draft.media)
}
