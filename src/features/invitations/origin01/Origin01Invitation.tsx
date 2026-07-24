import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

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

type EntryPhase = 'prelude' | 'envelope' | 'opening' | 'invitation'
type InvitationAudience = 'protagonist' | 'guest'
type IconName = 'calendar' | 'calendarPlus' | 'clock' | 'gift' | 'hanger' | 'message' | 'pin' | 'route' | 'share'

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

function buildEnvelopeDate(invitation: InvitationData) {
  const dateParts = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    timeZone: invitation.event.timeZone,
  }).formatToParts(new Date(invitation.event.startsAt))
  const getPart = (type: Intl.DateTimeFormatPartTypes) => dateParts.find((part) => part.type === type)?.value ?? ''

  return [getPart('day'), getPart('month'), getPart('year')].filter(Boolean).join(' · ')
}

function OriginIcon({ name }: { name: IconName }) {
  const commonProps = {
    'aria-hidden': true,
    className: 'origin01-icon',
    fill: 'none',
    viewBox: '0 0 24 24',
  } as const

  if (name === 'calendar' || name === 'calendarPlus') {
    return (
      <svg {...commonProps}>
        <path d="M6.75 3.75v3m10.5-3v3M4.5 9h15M5.75 5.25h12.5A1.75 1.75 0 0 1 20 7v11.25A1.75 1.75 0 0 1 18.25 20H5.75A1.75 1.75 0 0 1 4 18.25V7a1.75 1.75 0 0 1 1.75-1.75Z" />
        {name === 'calendarPlus' ? <path d="M12 12v5m-2.5-2.5h5" /> : <path d="M8 12.25h2m2 0h2m2 0h.01M8 16h2m2 0h2" />}
      </svg>
    )
  }

  if (name === 'clock') {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="8.25" />
        <path d="M12 7.75V12l3 1.75" />
      </svg>
    )
  }

  if (name === 'gift') {
    return (
      <svg {...commonProps}>
        <path d="M4 10.25h16v9H4zM3.25 6.75h17.5v3.5H3.25zM12 6.75V19.25M12 6.75H8.6a2.1 2.1 0 1 1 0-4.2c2.3 0 3.4 4.2 3.4 4.2Zm0 0h3.4a2.1 2.1 0 1 0 0-4.2c-2.3 0-3.4 4.2-3.4 4.2Z" />
      </svg>
    )
  }

  if (name === 'hanger') {
    return (
      <svg {...commonProps}>
        <path d="M9.8 6.2a2.2 2.2 0 1 1 3.62 1.68c-.86.73-1.42 1.16-1.42 2.12M12 10l8.1 6.15a1.05 1.05 0 0 1-.64 1.85H4.54a1.05 1.05 0 0 1-.64-1.85L12 10Z" />
      </svg>
    )
  }

  if (name === 'message') {
    return (
      <svg {...commonProps}>
        <path d="M20 11.5a7.5 7.5 0 0 1-11.3 6.47L4 19.25l1.3-4.38A7.5 7.5 0 1 1 20 11.5Z" />
        <path d="m9.1 11.7 1.8 1.8 4-4" />
      </svg>
    )
  }

  if (name === 'pin') {
    return (
      <svg {...commonProps}>
        <path d="M19 10c0 5.25-7 10-7 10s-7-4.75-7-10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.25" />
      </svg>
    )
  }

  if (name === 'route') {
    return (
      <svg {...commonProps}>
        <circle cx="6" cy="18" r="2.25" />
        <circle cx="18" cy="6" r="2.25" />
        <path d="M8.25 18h2.25a2.5 2.5 0 0 0 0-5h3a2.5 2.5 0 0 0 0-5h2.25" />
      </svg>
    )
  }

  if (name === 'share') {
    return (
      <svg {...commonProps}>
        <path d="M12 15.5V3.75m0 0L8.25 7.5M12 3.75l3.75 3.75M6 11.5H4.75A1.75 1.75 0 0 0 3 13.25v6A1.75 1.75 0 0 0 4.75 21h14.5A1.75 1.75 0 0 0 21 19.25v-6a1.75 1.75 0 0 0-1.75-1.75H18" />
      </svg>
    )
  }

  return null
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

export function Origin01Invitation({
  invitation,
  audience = 'protagonist',
}: {
  invitation: InvitationData
  audience?: InvitationAudience
}) {
  const [phase, setPhase] = useState<EntryPhase>(audience === 'guest' ? 'envelope' : 'prelude')
  const [isPlaying, setIsPlaying] = useState(false)
  const [shareStatus, setShareStatus] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const envelopeRef = useRef<HTMLButtonElement | null>(null)
  const experienceRef = useRef<HTMLDivElement | null>(null)
  const mapsUrl = buildMapsUrl(invitation)
  const calendarUrl = buildCalendarUrl(invitation)
  const whatsappUrl = buildWhatsAppUrl(invitation)
  const envelopeDate = buildEnvelopeDate(invitation)
  const musicSrc = invitation.music ? invitation.music.src ?? defaultMusicSrc : undefined
  const hasMusic = Boolean(musicSrc)
  const coverImage = invitation.gallery[0]
  const closingImage = invitation.gallery[2] ?? coverImage
  const invitationIsVisible = phase === 'invitation'

  useEffect(() => {
    if (phase !== 'opening') return

    const openingDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 50 : 1_450
    const timeoutId = window.setTimeout(() => {
      setPhase('invitation')
      window.scrollTo({ top: 0 })
      window.requestAnimationFrame(() => experienceRef.current?.focus())
    }, openingDuration)

    return () => window.clearTimeout(timeoutId)
  }, [phase])

  const playMusic = () => {
    if (!audioRef.current) return

    void audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
  }

  const revealEnvelope = () => {
    playMusic()
    setPhase('envelope')
    window.requestAnimationFrame(() => envelopeRef.current?.focus())
  }

  const openEnvelope = () => {
    if (phase !== 'envelope') return

    playMusic()
    setPhase('opening')
  }

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      playMusic()
      return
    }

    audio.pause()
    setIsPlaying(false)
  }

  const shareInvitation = async () => {
    const guestUrl = new URL(window.location.href)
    guestUrl.searchParams.set('vista', 'invitado')
    const shareData = {
      title: `${invitation.event.celebration} de ${invitation.event.name}`,
      text: `${invitation.mainPhrase} Te invito a compartir este momento conmigo.`,
      url: guestUrl.toString(),
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setShareStatus('Invitación compartida')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(shareData.url)
      setShareStatus('Enlace para invitados copiado')
    } catch {
      setShareStatus('Abrí el menú del navegador para compartir')
    }
  }

  return (
    <main className={`origin01 origin01--${phase}`}>
      {hasMusic && musicSrc ? <audio ref={audioRef} src={musicSrc} loop preload="auto" /> : null}

      {phase === 'prelude' ? (
        <section className="origin01-prelude" aria-labelledby="origin01-prelude-title">
          <div className="origin01-prelude__light" aria-hidden="true" />
          <div className="origin01-entry-topline">
            <span>LIMEN</span>
            <span>Origin 01</span>
          </div>
          <div className="origin01-prelude__content">
            <p className="origin01-prelude__eyebrow">Un mensaje solo para vos</p>
            <h1 id="origin01-prelude-title">{invitation.welcome.title}</h1>
            <p className="origin01-prelude__body">{invitation.welcome.body}</p>
            <p className="origin01-prelude__reveal">Este es tu LIMEN.</p>
            <p className="origin01-prelude__question">¿Estás lista para cruzarlo?</p>
            <button type="button" onClick={revealEnvelope} className="origin01-primary-action">
              <span>Estoy lista</span>
              <span className="origin01-primary-action__arrow" aria-hidden="true">→</span>
            </button>
          </div>
          <p className="origin01-prelude__sound">La música comienza al continuar</p>
        </section>
      ) : null}

      {phase === 'envelope' || phase === 'opening' ? (
        <section
          className={`origin01-envelope-stage ${phase === 'opening' ? 'origin01-envelope-stage--opening' : ''}`}
          aria-labelledby="origin01-envelope-title"
        >
          <div className="origin01-entry-topline">
            <span>LIMEN</span>
            <span>Origin 01 · El primer instante</span>
          </div>
          <div className="origin01-envelope-stage__content">
            <p className="origin01-envelope-stage__eyebrow">Una invitación para vos</p>
            <h1 id="origin01-envelope-title">{invitation.thresholdPhrase}</h1>
            <button
              ref={envelopeRef}
              type="button"
              className="origin01-envelope-button"
              onClick={openEnvelope}
              disabled={phase === 'opening'}
              aria-label={`Abrir la invitación de ${invitation.event.name}`}
            >
              <span className="origin01-envelope" aria-hidden="true">
                <span className="origin01-envelope__back" />
                <span className="origin01-envelope__letter">
                  <span className="origin01-envelope__monogram">V</span>
                  <span className="origin01-envelope__name">{invitation.event.name}</span>
                  <span className="origin01-envelope__date">{envelopeDate}</span>
                </span>
                <span className="origin01-envelope__front" />
                <span className="origin01-envelope__flap" />
                <span className="origin01-envelope__seal">L</span>
              </span>
            </button>
            <p className="origin01-envelope-stage__instruction">
              <span aria-hidden="true">✦</span>
              Tocá el sello para abrir
            </p>
          </div>
        </section>
      ) : null}

      {invitationIsVisible ? (
        <div ref={experienceRef} className="origin01-experience" aria-labelledby="origin01-hero-title" tabIndex={-1}>
          <p className="origin01-demo-label origin01-demo-label--fixed">
            <span aria-hidden="true" />
            Demo LIMEN
          </p>

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
            </button>
          ) : null}

          <section className="origin01-hero" aria-labelledby="origin01-hero-title">
            <InvitationImageAsset image={coverImage} className="origin01-hero__image" eager />
            <div className="origin01-hero__veil" aria-hidden="true" />
            <div className="origin01-hero__brand" aria-hidden="true">
              <span>Origin 01</span>
              <span>El primer instante</span>
            </div>
            <div className="origin01-hero__content">
              <p className="origin01-kicker">{invitation.event.celebration}</p>
              <h1 id="origin01-hero-title">{invitation.event.name}</h1>
              <p className="origin01-hero__date">{invitation.event.dateLabel}</p>
              <p className="origin01-hero__phrase">{invitation.mainPhrase}</p>
            </div>
            <span className="origin01-hero__scroll" aria-hidden="true">Deslizá para descubrir ↓</span>
          </section>

          <section className="origin01-section origin01-countdown-panel" aria-labelledby="origin01-countdown-title">
            <div className="origin01-countdown-panel__surface">
              <p className="origin01-kicker">El tiempo se acerca</p>
              <h2 id="origin01-countdown-title">Falta menos para una noche inolvidable.</h2>
              <Countdown key={invitation.event.startsAt} startsAt={invitation.event.startsAt} />
            </div>
          </section>

          <section className="origin01-section origin01-message" aria-labelledby="origin01-message-title">
            <div className="origin01-message__card">
              <p className="origin01-kicker">Una invitación</p>
              <span className="origin01-message__quote" aria-hidden="true">“</span>
              <h2 id="origin01-message-title">{invitation.personalMessage}</h2>
              <span className="origin01-message__signature">{invitation.event.name}</span>
            </div>
          </section>

          <section className="origin01-section origin01-info" aria-labelledby="origin01-info-title">
            <div className="origin01-section-heading">
              <p className="origin01-kicker">Cuándo y dónde</p>
              <h2 id="origin01-info-title">Guardá este momento.</h2>
            </div>
            <div className="origin01-info__surface">
              <article className="origin01-info__row">
                <span className="origin01-icon-wrap"><OriginIcon name="calendar" /></span>
                <div>
                  <p>Fecha</p>
                  <strong>{invitation.event.dateLabel}</strong>
                  <span className="origin01-info__meta"><OriginIcon name="clock" /> {invitation.event.timeLabel} hs</span>
                </div>
              </article>
              <article className="origin01-info__row">
                <span className="origin01-icon-wrap"><OriginIcon name="pin" /></span>
                <div>
                  <p>Lugar</p>
                  <strong>{invitation.event.venue}</strong>
                  <span>{invitation.event.address}</span>
                </div>
              </article>
            </div>
            <div className="origin01-actions">
              <a className="origin01-button origin01-button--dark" href={mapsUrl} target="_blank" rel="noreferrer">
                <OriginIcon name="route" />
                Ver ubicación
              </a>
              <a className="origin01-button" href={calendarUrl} target="_blank" rel="noreferrer">
                <OriginIcon name="calendarPlus" />
                Agendar fecha
              </a>
            </div>
          </section>

          <section className="origin01-dress" aria-labelledby="origin01-dress-title">
            <div className="origin01-dress__media">
              <InvitationImageAsset image={invitation.gallery[1]} className="origin01-dress__image" />
            </div>
            <div className="origin01-dress__content">
              <span className="origin01-feature-icon"><OriginIcon name="hanger" /></span>
              <p className="origin01-kicker">Dress code</p>
              <h2 id="origin01-dress-title">{invitation.event.dressCode}</h2>
              <p>Una noche especial merece que vengas como más te gusta: con presencia, alegría y ganas de celebrar.</p>
              <span className="origin01-dress__note">La elegancia también es sentirse uno mismo.</span>
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
            <section className="origin01-section origin01-gift" aria-labelledby="origin01-gift-title">
              <div className="origin01-gift__card">
                <div className="origin01-gift__media">
                  <InvitationImageAsset image={invitation.gift.image} className="origin01-gift__image" />
                </div>
                <div className="origin01-gift__content">
                  <span className="origin01-feature-icon origin01-feature-icon--light"><OriginIcon name="gift" /></span>
                  <p className="origin01-kicker">Un detalle</p>
                  <h2 id="origin01-gift-title">{invitation.gift.title}</h2>
                  <p>{invitation.gift.description}</p>
                  <div className="origin01-gift__account">
                    <span>{invitation.gift.accountLabel}</span>
                    <strong>{invitation.gift.accountValue}</strong>
                  </div>
                  <small>{invitation.gift.demoNote}</small>
                </div>
              </div>
            </section>
          ) : null}

          <section className="origin01-section origin01-rsvp" aria-labelledby="origin01-rsvp-title">
            <div className="origin01-rsvp__sparkles" aria-hidden="true" />
            <span className="origin01-feature-icon origin01-feature-icon--rsvp"><OriginIcon name="message" /></span>
            <p className="origin01-kicker">Nos encantaría que estés</p>
            <h2 id="origin01-rsvp-title">¿Compartimos esta noche?</h2>
            <p>Confirmá tu asistencia para que podamos esperarte.</p>
            <a className="origin01-button origin01-button--light" href={whatsappUrl} target="_blank" rel="noreferrer">
              <OriginIcon name="message" />
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
              <div className="origin01-closing__share">
                <p>Ahora podés compartir este momento con quienes querés cerca.</p>
                <button type="button" className="origin01-button origin01-button--glass" onClick={shareInvitation}>
                  <OriginIcon name="share" />
                  Compartir invitación
                </button>
                <p className="origin01-closing__share-status" aria-live="polite">{shareStatus}</p>
              </div>
              <p className="origin01-closing__brand">Origin 01 · LIMEN</p>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}
