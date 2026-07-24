import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import type { InvitationData, InvitationImage } from '../types'
import './origin01.css'

const defaultMusicSrc = '/audio/origin-01-demo.mp3'

type CountdownValue = {
  days: number
  hours: number
  minutes: number
  seconds: number
  completed: boolean
}

const calendarDate = (isoDate: string) => new Date(isoDate).toISOString().replace(/[-:]/g, '').replace('.000', '')

const getCountdown = (targetTime: number, currentTime = Date.now()): CountdownValue => {
  const distance = targetTime - currentTime

  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true }
  }

  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
    completed: false,
  }
}

function buildMapsUrl(invitation: InvitationData) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${invitation.event.venue}, ${invitation.event.address}`,
  )}`
}

function buildCalendarUrl(invitation: InvitationData) {
  const start = calendarDate(invitation.event.startsAt)
  const end = calendarDate(invitation.event.endsAt)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${invitation.event.celebration} de ${invitation.event.name}`,
    dates: `${start}/${end}`,
    details: `${invitation.mainPhrase}\n\n${invitation.demoLabel}`,
    location: `${invitation.event.venue}, ${invitation.event.address}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function buildWhatsAppUrl(invitation: InvitationData) {
  const recipient = invitation.rsvp.recipientPhone ?? ''
  return `https://wa.me/${recipient}?text=${encodeURIComponent(invitation.rsvp.message)}`
}

function Countdown({ startsAt }: { startsAt: string }) {
  const targetTime = useMemo(() => new Date(startsAt).getTime(), [startsAt])
  const getSnapshot = useCallback(() => Math.min(Math.floor(Date.now() / 1_000) * 1_000, targetTime), [targetTime])
  const subscribe = useCallback(
    (notify: () => void) => {
      if (targetTime <= Date.now()) {
        return () => undefined
      }

      const intervalId = window.setInterval(() => {
        notify()

        if (targetTime <= Date.now()) {
          window.clearInterval(intervalId)
        }
      }, 1_000)

      return () => window.clearInterval(intervalId)
    },
    [targetTime],
  )
  const currentTime = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const countdown = useMemo(() => getCountdown(targetTime, currentTime), [currentTime, targetTime])

  if (countdown.completed) {
    return <p className="origin01-countdown-complete">Este momento ya empezó. Gracias por haber sido parte.</p>
  }

  const items = [
    ['Días', countdown.days],
    ['Horas', countdown.hours],
    ['Min', countdown.minutes],
    ['Seg', countdown.seconds],
  ] as const

  return (
    <div className="origin01-countdown" aria-label="Cuenta regresiva para la celebración">
      {items.map(([label, value]) => (
        <div className="origin01-countdown__item" key={label}>
          <strong>{String(value).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

function InvitationImageAsset({
  image,
  className,
  eager = false,
  decorative = false,
}: {
  image?: InvitationImage
  className: string
  eager?: boolean
  decorative?: boolean
}) {
  if (image?.src) {
    return (
      <img
        className={className}
        src={image.src}
        alt={decorative ? '' : image.alt}
        aria-hidden={decorative || undefined}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
      />
    )
  }

  return <div className={`${className} origin01-image-placeholder`} role="img" aria-label={image?.alt ?? 'Imagen editorial'} />
}

export function Origin01Invitation({ invitation }: { invitation: InvitationData }) {
  const [hasEntered, setHasEntered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const experienceRef = useRef<HTMLDivElement | null>(null)
  const mapsUrl = buildMapsUrl(invitation)
  const calendarUrl = buildCalendarUrl(invitation)
  const whatsappUrl = buildWhatsAppUrl(invitation)
  const musicSrc = invitation.music ? invitation.music.src ?? defaultMusicSrc : undefined
  const hasMusic = Boolean(musicSrc)
  const coverImage = invitation.gallery[0]
  const closingImage = invitation.gallery[2] ?? coverImage

  const enterInvitation = () => {
    setHasEntered(true)
    window.requestAnimationFrame(() => experienceRef.current?.focus())

    if (audioRef.current) {
      void audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      return
    }

    audio.pause()
    setIsPlaying(false)
  }

  return (
    <main className={`origin01 ${hasEntered ? 'origin01--entered' : ''}`}>
      {hasMusic && musicSrc ? <audio ref={audioRef} src={musicSrc} loop preload="auto" /> : null}

      {!hasEntered ? (
        <section className="origin01-threshold" aria-labelledby="origin01-threshold-title">
          <div className="origin01-threshold__glow" aria-hidden="true" />
          <div className="origin01-threshold__topline" aria-hidden="true">
            <span>LIMEN</span>
            <span>Origin 01</span>
          </div>
          <div className="origin01-threshold__content">
            <p className="origin01-kicker">El primer instante</p>
            <h1 id="origin01-threshold-title">{invitation.thresholdPhrase}</h1>
            <p className="origin01-threshold__intro">Esta historia está a punto de abrirse.</p>
            <button type="button" onClick={enterInvitation} className="origin01-enter">
              <span>Entrar</span>
              <span aria-hidden="true">↓</span>
            </button>
          </div>
        </section>
      ) : null}

      {hasEntered ? (
        <div ref={experienceRef} className="origin01-experience" aria-labelledby="origin01-welcome-title" tabIndex={-1}>
          <p className="origin01-demo-label origin01-demo-label--fixed">{invitation.demoLabel}</p>

          {hasMusic ? (
            <button
              type="button"
              className={`origin01-music ${isPlaying ? 'origin01-music--playing' : ''}`}
              onClick={toggleMusic}
              aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
              aria-pressed={isPlaying}
            >
              <span className="origin01-music__bars" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>{isPlaying ? 'Pausar' : 'Música'}</span>
            </button>
          ) : null}

          <section className="origin01-section origin01-welcome" aria-labelledby="origin01-welcome-title">
            <div className="origin01-welcome__line" aria-hidden="true" />
            <p className="origin01-kicker">Origin 01 · El primer instante</p>
            <h2 id="origin01-welcome-title">{invitation.welcome.title}</h2>
            <p className="origin01-welcome__body">{invitation.welcome.body}</p>
            <p className="origin01-welcome__whisper">Esto empieza con vos.</p>
          </section>

          <section className="origin01-hero" aria-labelledby="origin01-hero-title">
            <InvitationImageAsset image={coverImage} className="origin01-hero__image" eager />
            <div className="origin01-hero__veil" aria-hidden="true" />
            <div className="origin01-hero__content">
              <p className="origin01-kicker">{invitation.event.celebration}</p>
              <h1 id="origin01-hero-title">{invitation.event.name}</h1>
              <p className="origin01-hero__date">{invitation.event.dateLabel}</p>
              <p className="origin01-hero__phrase">{invitation.mainPhrase}</p>
            </div>
            <span className="origin01-hero__scroll" aria-hidden="true">Descubrí la historia ↓</span>
          </section>

          <section className="origin01-section origin01-countdown-panel" aria-labelledby="origin01-countdown-title">
            <p className="origin01-kicker">El tiempo se acerca</p>
            <h2 id="origin01-countdown-title">Falta menos para una noche inolvidable.</h2>
            <Countdown key={invitation.event.startsAt} startsAt={invitation.event.startsAt} />
          </section>

          <section className="origin01-section origin01-message" aria-labelledby="origin01-message-title">
            <p className="origin01-kicker">Una invitación</p>
            <span className="origin01-message__quote" aria-hidden="true">“</span>
            <h2 id="origin01-message-title">{invitation.personalMessage}</h2>
            <span className="origin01-message__signature">{invitation.event.name}</span>
          </section>

          <section className="origin01-section origin01-info" aria-labelledby="origin01-info-title">
            <div className="origin01-section-heading">
              <p className="origin01-kicker">Cuándo y dónde</p>
              <h2 id="origin01-info-title">Guardá este momento.</h2>
            </div>
            <div className="origin01-info__grid">
              <article className="origin01-info__card">
                <span className="origin01-info__index">01</span>
                <p>Fecha</p>
                <strong>{invitation.event.dateLabel}</strong>
                <span>{invitation.event.timeLabel} hs</span>
              </article>
              <article className="origin01-info__card">
                <span className="origin01-info__index">02</span>
                <p>Lugar</p>
                <strong>{invitation.event.venue}</strong>
                <span>{invitation.event.address}</span>
              </article>
            </div>
            <div className="origin01-actions">
              <a className="origin01-button origin01-button--dark" href={mapsUrl} target="_blank" rel="noreferrer">
                Ver ubicación
              </a>
              <a className="origin01-button" href={calendarUrl} target="_blank" rel="noreferrer">
                Agendar fecha
              </a>
            </div>
          </section>

          <section className="origin01-dress" aria-labelledby="origin01-dress-title">
            <div className="origin01-dress__media">
              <InvitationImageAsset image={invitation.gallery[1]} className="origin01-dress__image" />
            </div>
            <div className="origin01-dress__content">
              <p className="origin01-kicker">Dress code</p>
              <h2 id="origin01-dress-title">{invitation.event.dressCode}</h2>
              <p>Una noche especial merece que vengas como más te gusta: con presencia, alegría y ganas de celebrar.</p>
              <span>La elegancia también es sentirse uno mismo.</span>
            </div>
          </section>

          <section className="origin01-section origin01-gallery" aria-labelledby="origin01-gallery-title">
            <div className="origin01-section-heading">
              <p className="origin01-kicker">Antes del comienzo</p>
              <h2 id="origin01-gallery-title">Instantes que ya son parte de la historia.</h2>
            </div>
            <div className="origin01-gallery__grid">
              {invitation.gallery.map((image, index) => (
                <figure className={`origin01-gallery__item origin01-gallery__item--${index + 1}`} key={`${image.alt}-${index}`}>
                  <InvitationImageAsset image={image} className="origin01-gallery__image" />
                  {image.title ? (
                    <figcaption>
                      <span>0{index + 1}</span>
                      {image.title}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </section>

          {invitation.gift ? (
            <section className="origin01-gift" aria-labelledby="origin01-gift-title">
              <div className="origin01-gift__media">
                <InvitationImageAsset image={invitation.gift.image} className="origin01-gift__image" />
              </div>
              <div className="origin01-gift__content">
                <p className="origin01-kicker">Un detalle</p>
                <h2 id="origin01-gift-title">{invitation.gift.title}</h2>
                <p>{invitation.gift.description}</p>
                <div className="origin01-gift__account">
                  <span>{invitation.gift.accountLabel}</span>
                  <strong>{invitation.gift.accountValue}</strong>
                </div>
                <small>{invitation.gift.demoNote}</small>
              </div>
            </section>
          ) : null}

          <section className="origin01-section origin01-rsvp" aria-labelledby="origin01-rsvp-title">
            <div className="origin01-rsvp__sparkles" aria-hidden="true" />
            <p className="origin01-kicker">Nos encantaría que estés</p>
            <h2 id="origin01-rsvp-title">¿Compartimos esta noche?</h2>
            <p>Confirmá tu asistencia para que podamos esperarte.</p>
            <a className="origin01-button origin01-button--light" href={whatsappUrl} target="_blank" rel="noreferrer">
              Confirmar por WhatsApp
            </a>
            {invitation.rsvp.demoNote ? <p className="origin01-rsvp__note">{invitation.rsvp.demoNote}</p> : null}
          </section>

          <section className="origin01-closing" aria-labelledby="origin01-closing-title">
            <InvitationImageAsset image={closingImage} className="origin01-closing__image" decorative />
            <div className="origin01-closing__veil" aria-hidden="true" />
            <div className="origin01-closing__content">
              <p className="origin01-kicker">El comienzo</p>
              <h2 id="origin01-closing-title">{invitation.closing}</h2>
              <span className="origin01-closing__name">{invitation.event.name}</span>
              <p className="origin01-closing__brand">Origin 01 · LIMEN</p>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}
