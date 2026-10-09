import { useCallback, useMemo, useSyncExternalStore } from 'react'

import type { InvitationMediaReference } from '../engine/invitationTypes'
import { getEnabledInvitationModuleIds } from '../engine/moduleRuntime'
import type { Garden01InvitationData } from './garden01ContentTypes'
import './garden01.css'

type CountdownValue = {
  readonly days: number
  readonly hours: number
  readonly minutes: number
  readonly seconds: number
  readonly completed: boolean
}

const countdownValue = (targetTime: number, currentTime: number): CountdownValue => {
  const distance = targetTime - currentTime
  if (distance <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true }
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
    completed: false,
  }
}

function GardenLeaf({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 54 72" fill="none" aria-hidden="true">
    <path d="M27 68C26 45 29 24 42 7M28 48C20 37 13 31 5 29M31 36C39 29 45 27 51 27M34 24C29 16 27 11 28 4"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M6 29c8-2 14 1 18 8-8 1-14-2-18-8ZM42 7c5 7 4 14-3 20-4-7-3-14 3-20ZM51 27c-1 7-6 12-15 14 1-8 6-13 15-14ZM28 4c-7 5-9 11-6 19 7-5 9-11 6-19Z"
      stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
}

function GardenBranch({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 240 170" fill="none" aria-hidden="true">
    <path d="M4 157C54 145 79 116 103 84c25-34 56-58 128-73" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M69 127C47 125 33 115 26 98c22-2 38 7 43 29Zm25-32C75 88 65 74 65 57c21 5 32 18 29 38Zm28-30c-10-18-9-34 2-47 16 14 18 30-2 47Zm35-25c-2-19 5-32 20-41 9 19 4 33-20 41Zm29-14c8-16 20-25 38-25-1 20-13 29-38 25ZM86 108c18 0 32 8 42 25-21 7-36-1-42-25Zm33-39c20-2 35 5 46 21-21 9-37 2-46-21Zm47-28c18-4 33 0 46 14-18 12-34 7-46-14Z" fill="currentColor" opacity=".86" />
  </svg>
}

function GardenPhoto({ media, crop, className = '' }: {
  media?: InvitationMediaReference
  crop: number
  className?: string
}) {
  return <div className={`garden01-photo garden01-photo--crop-${crop} ${className}`}>
    {media?.src
      ? <img src={media.src} alt={media.alt || 'Fotografía editorial'} />
      : <span aria-hidden="true" />}
  </div>
}

function GardenCountdown({ startsAt, completedMessage }: { startsAt: string; completedMessage: string }) {
  const targetTime = useMemo(() => new Date(startsAt).getTime(), [startsAt])
  const getSnapshot = useCallback(() => Math.min(Math.floor(Date.now() / 1_000) * 1_000, targetTime), [targetTime])
  const subscribe = useCallback((notify: () => void) => {
    if (targetTime <= Date.now()) return () => undefined
    const interval = window.setInterval(notify, 1_000)
    return () => window.clearInterval(interval)
  }, [targetTime])
  const now = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const value = countdownValue(targetTime, now)

  if (value.completed) return <p className="garden01-countdown-complete">{completedMessage}</p>
  const entries = [['Días', value.days], ['Horas', value.hours], ['Minutos', value.minutes], ['Segundos', value.seconds]] as const
  return <div className="garden01-countdown" aria-label="Cuenta regresiva para la celebración">
    {entries.map(([label, amount]) => <div key={label}><strong>{String(amount).padStart(2, '0')}</strong><span>{label}</span></div>)}
  </div>
}

export function Garden01Invitation({ invitation }: { invitation: Garden01InvitationData }) {
  const enabled = getEnabledInvitationModuleIds(invitation.modules)
  const media = (id: string) => invitation.media.find((item) => item.id === id && item.kind === 'image')
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${invitation.event.venue}, ${invitation.event.address}`,
  )}`
  const whatsappUrl = invitation.content.rsvp.recipientPhone
    ? `https://wa.me/${invitation.content.rsvp.recipientPhone}?text=${encodeURIComponent(invitation.content.rsvp.message)}`
    : undefined
  const gallery = invitation.content.gallery.images.slice(0, 4)
  const heroMedia = media(invitation.content.hero.imageMediaId)

  return <main className="garden01">
    <link rel="stylesheet" href="/fonts/limen/fonts.css" precedence="limen-garden-fonts" />
    {heroMedia?.src ? <link rel="preload" as="image" href={heroMedia.src} /> : null}
    <div className="garden01-frame">
      <section className="garden01-hero" aria-labelledby="garden01-title">
        <div className="garden01-hero__photo">
          <GardenPhoto media={heroMedia} crop={1} />
        </div>
        <div className="garden01-hero__wash" />
        <GardenBranch className="garden01-hero__branch garden01-hero__branch--left" />
        <GardenBranch className="garden01-hero__branch garden01-hero__branch--right" />
        <div className="garden01-hero__top"><span>LIMEN · GARDEN 01</span><span>UNA HISTORIA QUE FLORECE</span></div>
        <div className="garden01-hero__copy">
          <p>{invitation.content.hero.eyebrow}</p>
          <h1 id="garden01-title">{invitation.content.hero.name}</h1>
          <time dateTime={invitation.event.startsAt}>{invitation.content.hero.dateLabel}</time>
        </div>
        <a className="garden01-scroll" href="#garden01-memories"><GardenLeaf />
          <span>{invitation.content.hero.scrollHint}</span><i aria-hidden="true">⌄</i></a>
      </section>

      {(enabled.has('story') || enabled.has('gallery')) && <section className="garden01-memories"
        id="garden01-memories" aria-labelledby="garden01-memories-title">
        <div className="garden01-memories__backdrop" aria-hidden="true">
          <GardenPhoto media={media(invitation.content.gallery.images[1]?.mediaId || '')} crop={2} />
        </div>
        <GardenBranch className="garden01-memories__branch garden01-memories__branch--left" />
        <GardenBranch className="garden01-memories__branch garden01-memories__branch--right" />
        <header className="garden01-memories__heading">
          <p className="garden01-kicker">{invitation.content.story.eyebrow}</p>
          <h2 id="garden01-memories-title">{invitation.content.story.heading}</h2>
          <p className="garden01-introduction">{invitation.content.story.introduction}</p>
        </header>
        {enabled.has('gallery') && <div className="garden01-hanging-gallery">
          {gallery.map((item, index) => <figure key={item.mediaId} className={`garden01-hanging-photo garden01-hanging-photo--${index + 1}`}>
            <span className="garden01-clip" aria-hidden="true" />
            <GardenPhoto media={media(item.mediaId)} crop={index + 1} />
            <figcaption>{item.caption}</figcaption>
          </figure>)}
        </div>}
      </section>}

      {enabled.has('countdown') && <section className="garden01-countdown-section" aria-labelledby="garden01-countdown-title">
        <GardenBranch className="garden01-paper-branch garden01-paper-branch--countdown" />
        <div className="garden01-paper garden01-paper--countdown">
          <GardenLeaf />
          <p className="garden01-kicker" id="garden01-countdown-title">{invitation.content.countdown.eyebrow}</p>
          <GardenCountdown startsAt={invitation.event.startsAt}
            completedMessage={invitation.content.countdown.completedMessage} />
          <p>Y cada día también es parte de esta historia.</p>
        </div>
      </section>}

      {enabled.has('eventDetails') && <section className="garden01-event" aria-labelledby="garden01-event-title">
        <GardenBranch className="garden01-paper-branch garden01-paper-branch--event" />
        <div className="garden01-paper garden01-paper--event">
          <p className="garden01-kicker">{invitation.content.eventDetails.eyebrow}</p>
          <GardenLeaf />
          <h2 id="garden01-event-title">{invitation.content.eventDetails.heading}</h2>
          <p className="garden01-event__date">{invitation.content.eventDetails.dateLabel} <span>·</span> {invitation.content.eventDetails.timeLabel}</p>
          <div className="garden01-event__venue"><span aria-hidden="true">⌖</span><div>
            <strong>{invitation.content.eventDetails.venueLabel}</strong><small>{invitation.event.address}</small>
          </div></div>
          <a href={mapsUrl} target="_blank" rel="noreferrer">{invitation.content.eventDetails.mapActionLabel}<span aria-hidden="true">↗</span></a>
        </div>
      </section>}

      {enabled.has('dressCode') && <section className="garden01-dress" aria-labelledby="garden01-dress-title">
        <GardenLeaf /><p className="garden01-kicker">{invitation.content.dressCode.eyebrow}</p>
        <h2 id="garden01-dress-title">{invitation.content.dressCode.title}</h2>
        <p>{invitation.content.dressCode.description}</p>
      </section>}

      {enabled.has('rsvp') && <section className="garden01-rsvp" aria-labelledby="garden01-rsvp-title">
        <GardenBranch className="garden01-rsvp__branch garden01-rsvp__branch--left" />
        <GardenBranch className="garden01-rsvp__branch garden01-rsvp__branch--right" />
        <div className="garden01-rsvp__arch" aria-hidden="true" />
        <GardenLeaf />
        <p className="garden01-kicker">{invitation.content.rsvp.eyebrow}</p>
        <h2 id="garden01-rsvp-title">{invitation.content.rsvp.title}</h2>
        <p>{invitation.content.rsvp.description}</p>
        {whatsappUrl
          ? <a href={whatsappUrl} target="_blank" rel="noreferrer">{invitation.content.rsvp.actionLabel}<span aria-hidden="true">›</span></a>
          : <span className="garden01-rsvp__disabled-action" aria-disabled="true">{invitation.content.rsvp.actionLabel}<span aria-hidden="true">›</span></span>}
      </section>}

      {enabled.has('closing') && <footer className="garden01-closing">
        <GardenLeaf /><p>{invitation.content.closing.message}</p><strong>{invitation.content.closing.signature}</strong>
        {invitation.presentation?.showTemplateBranding && <small>LIMEN · GARDEN 01</small>}
      </footer>}
    </div>
  </main>
}
