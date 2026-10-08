import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { origin01DemoData } from '../invitations/origin01/origin01DemoData'

const studioTimeZone = 'America/Argentina/Buenos_Aires'
const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: studioTimeZone,
})
const dateLabelFormatter = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: studioTimeZone,
})

function createStudioInvitationCode(now: Date): string {
  const date = dateKeyFormatter.format(now).replaceAll('-', '').slice(2)
  const suffix = globalThis.crypto.randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase()
  return `LMN-${date}-${suffix}`
}

export function createNewStudioInvitation(internalName: string, now = new Date()): Origin01InvitationData {
  const code = createStudioInvitationCode(now)
  const eventDay = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const endingDay = new Date(eventDay.getTime() + 24 * 60 * 60 * 1000)
  const eventDate = dateKeyFormatter.format(eventDay)
  const endingDate = dateKeyFormatter.format(endingDay)
  const dateLabel = dateLabelFormatter.format(eventDay)
  const timestamp = now.toISOString()

  return {
    ...origin01DemoData,
    id: `origin01-${code.toLocaleLowerCase('es-AR')}`,
    code,
    internalName: internalName.trim(),
    lifecycleStatus: 'draft',
    event: {
      ...origin01DemoData.event,
      name: 'Nombre',
      celebrationLabel: 'Mis 15',
      startsAt: `${eventDate}T21:00:00-03:00`,
      endsAt: `${endingDate}T04:00:00-03:00`,
      timeZone: studioTimeZone,
      venue: 'Lugar del evento',
      address: 'Dirección del evento',
    },
    identities: [{ displayName: 'Nombre', role: 'protagonist' }],
    content: {
      ...origin01DemoData.content,
      prelude: { ...origin01DemoData.content.prelude, title: 'Hola, Nombre.' },
      envelope: { ...origin01DemoData.content.envelope, monogram: 'N' },
      hero: { ...origin01DemoData.content.hero, dateLabel },
      story: { ...origin01DemoData.content.story, signature: 'Nombre' },
      eventDetails: {
        ...origin01DemoData.content.eventDetails,
        dateLabel,
        timeLabel: '21:00',
        calendarDescription: 'Invitación creada con LIMEN',
      },
      community: {
        ...origin01DemoData.content.community,
        instagram: { ...origin01DemoData.content.community.instagram, enabled: false, handle: '' },
        hashtag: { ...origin01DemoData.content.community.hashtag, enabled: false, value: '' },
        album: { ...origin01DemoData.content.community.album, enabled: false, url: '' },
      },
      trivia: {
        ...origin01DemoData.content.trivia,
        protagonistName: 'Nombre',
        accessibleTitle: 'Trivia sobre la protagonista',
        revealSignature: 'Nombre',
      },
      gifts: {
        ...origin01DemoData.content.gifts,
        accountHolder: '',
        bankName: '',
        accountValue: '',
        demoNote: '',
      },
      rsvp: {
        ...origin01DemoData.content.rsvp,
        recipientPhone: undefined,
        demoNote: undefined,
      },
      closing: { ...origin01DemoData.content.closing, signature: 'Nombre' },
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    publishedAt: undefined,
  }
}
