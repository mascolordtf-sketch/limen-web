import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import type { InvitationData, InvitationImage } from '../types'
import './origin01.css'

type CountdownValue = {
  days: number
  hours: number
  minutes: number
  seconds: number
  completed: boolean
}

const calendarDate = (isoDate: string) => new Date(isoDate).toISOString().replace(/[-:]/g, '').replace('.000', '')

const getCountdown = (targetTime: number): CountdownValue => {
  const distance = targetTime - Date.now()

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
  const getSnapshot = useCallback(() => Math.min(Math.floor(Date.now() / 1_000), Math.floor(targetTime / 1_000)), [targetTime])
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
  const currentSecond = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const countdown = useMemo(() => getCountdown(targetTime), [currentSecond, targetTime])

  if (countdown.completed) {
    return <p className="origin01-countdown-complete">Este momento ya empezó. Gracias por haber sido parte.</p>
  }

  const items = [
    ['Días', countdown.days],
    ['Horas', countdown.hours],
    ['Minutos', countdown.minutes],
    ['Segundos', countdown.seconds],
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

function GalleryImage({ image, index }: { image: InvitationImage; index: number }) {
  if (image.src) {
    return <img src={image.src} alt={image.alt} loading="lazy" />
  }

  return (
    <div className={`origin01-gallery__placeholder origin01-gallery__placeholder--${index + 1}`} role="img" aria-label={image.alt} />
  )
}

export function Origin01Invitation({ invitation }: { invitation: InvitationData }) {
  const [hasEntered, setHasEntered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const experienceRef = useRef<HTMLDivElement | null>(null)
  const mapsUrl = buildMapsUrl(invitation)
  const calendarUrl = buildCalendarUrl(invitation)
  const whatsappUrl = buildWhatsAppUrl(invitation)
  const hasMusic = Boolean(invitation.music?.src)

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
      <section className="origin01-threshold" aria-labelledby="origin01-threshold-title" hidden={hasEntered}>
        <p className="origin01-demo-label">{invitation.demoLabel}</p>
        <div className="origin01-threshold__card">
          <p className="origin01-kicker">Origin 01</p>
          <h1 id="origin01-threshold-title">{invitation.thresholdPhrase}</h1>
          <button type="button" onClick={enterInvitation} className="origin01-button origin01-button--dark">
            Entrar
          </button>
        </div>
      </section>

      <div ref={experienceRef} className="origin01-experience" aria-hidden={!hasEntered} tabIndex={-1}>
        <p className="origin01-demo-label origin01-demo-label--fixed">{invitation.demoLabel}</p>

        {hasMusic && invitation.music?.src ? (
          <>
            <audio ref={audioRef} src={invitation.music.src} loop preload="none" />
            <button type="button" className="origin01-music" onClick={toggleMusic} aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}>
              {isPlaying ? 'Pausar' : 'Música'}
            </button>
          </>
        ) : null}

        <section className="origin01-section origin01-welcome" aria-labelledby="origin01-welcome-title">
          <p className="origin01-kicker">Bienvenida</p>
          <h2 id="origin01-welcome-title">{invitation.welcome.title}</h2>
          <p>{invitation.welcome.body}</p>
        </section>

        <section className="origin01-hero" aria-labelledby="origin01-hero-title">
          <div className="origin01-hero__image" role="img" aria-label="Composición editorial abstracta en tonos cálidos para la invitación" />
          <div className="origin01-hero__content">
            <p className="origin01-kicker">{invitation.event.celebration}</p>
            <h1 id="origin01-hero-title">{invitation.event.name}</h1>
            <p className="origin01-date">{invitation.event.dateLabel}</p>
            <p className="origin01-phrase">{invitation.mainPhrase}</p>
          </div>
        </section>

        <section className="origin01-section" aria-labelledby="origin01-countdown-title">
          <p className="origin01-kicker">Falta</p>
          <h2 id="origin01-countdown-title">Para empezar la noche</h2>
          <Countdown key={invitation.event.startsAt} startsAt={invitation.event.startsAt} />
        </section>

        <section className="origin01-section origin01-message" aria-labelledby="origin01-message-title">
          <p className="origin01-kicker">Un mensaje</p>
          <h2 id="origin01-message-title">{invitation.personalMessage}</h2>
        </section>

        <section className="origin01-section origin01-info" aria-labelledby="origin01-info-title">
          <p className="origin01-kicker">Celebración</p>
          <h2 id="origin01-info-title">Información del evento</h2>
          <dl>
            <div><dt>Fecha</dt><dd>{invitation.event.dateLabel}</dd></div>
            <div><dt>Hora</dt><dd>{invitation.event.timeLabel}</dd></div>
            <div><dt>Lugar</dt><dd>{invitation.event.venue}</dd></div>
            <div><dt>Dirección</dt><dd>{invitation.event.address}</dd></div>
          </dl>
          <div className="origin01-actions">
            <a className="origin01-button origin01-button--dark" href={mapsUrl} target="_blank" rel="noreferrer">Cómo llegar</a>
            <a className="origin01-button" href={calendarUrl} target="_blank" rel="noreferrer">Agregar al calendario</a>
          </div>
        </section>

        <section className="origin01-section origin01-dress" aria-labelledby="origin01-dress-title">
          <p className="origin01-kicker">Código de vestimenta</p>
          <h2 id="origin01-dress-title">{invitation.event.dressCode}</h2>
          <p>Una noche para vestir con calma, presencia y celebración.</p>
        </section>

        <section className="origin01-section origin01-gallery" aria-labelledby="origin01-gallery-title">
          <p className="origin01-kicker">Historia</p>
          <h2 id="origin01-gallery-title">Pequeños instantes antes del comienzo</h2>
          <div className="origin01-gallery__grid">
            {invitation.gallery.map((image, index) => (
              <figure key={`${image.alt}-${index}`}>
                <GalleryImage image={image} index={index} />
                {image.title ? <figcaption>{image.title}</figcaption> : null}
              </figure>
            ))}
          </div>
        </section>

        <section className="origin01-section origin01-rsvp" aria-labelledby="origin01-rsvp-title">
          <p className="origin01-kicker">Asistencia</p>
          <h2 id="origin01-rsvp-title">¿Nos acompañás?</h2>
          <a className="origin01-button origin01-button--dark" href={whatsappUrl} target="_blank" rel="noreferrer">Confirmar asistencia</a>
          {invitation.rsvp.demoNote ? <p className="origin01-rsvp__note">{invitation.rsvp.demoNote}</p> : null}
        </section>

        {invitation.gift ? (
          <section className="origin01-section origin01-gift" aria-labelledby="origin01-gift-title">
            <p className="origin01-kicker">Detalle opcional</p>
            <h2 id="origin01-gift-title">{invitation.gift.title}</h2>
            <p>{invitation.gift.description}</p>
            <div><span>{invitation.gift.accountLabel}</span><strong>{invitation.gift.accountValue}</strong></div>
            <small>{invitation.gift.demoNote}</small>
          </section>
        ) : null}

        <section className="origin01-closing" aria-labelledby="origin01-closing-title">
          <h2 id="origin01-closing-title">{invitation.closing}</h2>
          <p>LIMEN</p>
        </section>
      </div>
    </main>
  )
}
