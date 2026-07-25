import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

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
type IconName = 'calendar' | 'calendarPlus' | 'check' | 'clock' | 'copy' | 'error' | 'gift' | 'hanger' | 'message' | 'pause' | 'pin' | 'play' | 'route' | 'share'

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
    className: `origin01-icon origin01-icon--${name}`,
    fill: 'none',
    viewBox: '0 0 24 24',
  } as const

  if (name === 'calendar' || name === 'calendarPlus') {
    return (
      <svg {...commonProps}>
        <rect className="origin01-icon__calendar-frame" x="4" y="5.25" width="16" height="14.75" rx="1.75" />
        <path className="origin01-icon__calendar-binding" d="M6.75 3.75v3m10.5-3v3M4.5 9h15" />
        {name === 'calendarPlus' ? <path className="origin01-icon__calendar-mark origin01-icon__action-detail" d="M12 12v5m-2.5-2.5h5" /> : <><path className="origin01-icon__calendar-dates" d="M8 12.25h2m2 0h2m2 0h.01M8 16h2m2 0h2" /><circle className="origin01-icon__calendar-mark" cx="13" cy="16" r="1.45" /></>}
      </svg>
    )
  }

  if (name === 'clock') {
    return (
      <svg {...commonProps}>
        <circle className="origin01-icon__clock-face" cx="12" cy="12" r="8.25" />
        <path className="origin01-icon__clock-hands" d="M12 7.75V12l3 1.75" />
      </svg>
    )
  }

  if (name === 'copy' || name === 'check' || name === 'error') {
    return (
      <svg {...commonProps}>
        {name === 'copy' ? (
          <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>
        ) : name === 'check' ? <path d="m5 12.5 4.25 4.25L19 7" /> : <><circle cx="12" cy="12" r="8" /><path d="m9.5 9.5 5 5m0-5-5 5" /></>}
      </svg>
    )
  }

  if (name === 'play' || name === 'pause') {
    return (
      <svg {...commonProps}>
        {name === 'play' ? <path className="origin01-icon__primary" d="m9 6 9 6-9 6Z" /> : <path className="origin01-icon__primary" d="M9 7v10M15 7v10" />}
      </svg>
    )
  }

  if (name === 'gift') {
    return (
      <svg {...commonProps}>
        <path className="origin01-icon__gift-box" d="M4.5 10h15v10h-15Z" />
        <path className="origin01-icon__gift-lid" d="M3.5 7h17v3h-17" />
        <path className="origin01-icon__gift-ribbon" d="M12 7v13" />
        <path className="origin01-icon__gift-bow" d="M12 7H8.75a2.15 2.15 0 1 1 .05-4.3C10.85 2.7 12 7 12 7Zm0 0h3.25a2.15 2.15 0 1 0-.05-4.3C13.15 2.7 12 7 12 7Z" />
      </svg>
    )
  }

  if (name === 'hanger') {
    return (
      <svg {...commonProps}>
        <path className="origin01-icon__hanger-hook" d="M9.8 6.2a2.2 2.2 0 1 1 3.62 1.68C12.56 8.61 12 9.04 12 10" />
        <path className="origin01-icon__hanger-body" d="m12 10 8.1 6.15a1.05 1.05 0 0 1-.64 1.85H4.54a1.05 1.05 0 0 1-.64-1.85L12 10Z" />
        <path className="origin01-icon__hanger-detail" d="M8 15.6h8" />
      </svg>
    )
  }

  if (name === 'message') {
    return (
      <svg {...commonProps}>
        <path className="origin01-icon__message-bubble" d="M20 11.5a7.5 7.5 0 0 1-11.3 6.47L4 19.25l1.3-4.38A7.5 7.5 0 1 1 20 11.5Z" />
        <path className="origin01-icon__message-line" d="M8.6 10h6.8M8.6 13h4.8" />
        <circle className="origin01-icon__message-response" cx="16.8" cy="15.7" r="1.35" />
      </svg>
    )
  }

  if (name === 'pin') {
    return (
      <svg {...commonProps}>
        <ellipse className="origin01-icon__pin-ring" cx="12" cy="20.25" rx="3.5" ry="1.15" />
        <path className="origin01-icon__pin-body" d="M19 10c0 5.25-7 10-7 10s-7-4.75-7-10a7 7 0 1 1 14 0Z" />
        <circle className="origin01-icon__pin-center" cx="12" cy="10" r="2.25" />
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
  const [isMusicLoading, setIsMusicLoading] = useState(false)
  const [isMusicFailed, setIsMusicFailed] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const [shareStatus, setShareStatus] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const envelopeRef = useRef<HTMLButtonElement | null>(null)
  const experienceRef = useRef<HTMLDivElement | null>(null)
  const copyResetRef = useRef<number | null>(null)
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

  useEffect(() => () => {
    if (copyResetRef.current) window.clearTimeout(copyResetRef.current)
  }, [])

  useLayoutEffect(() => {
    if (!invitationIsVisible || !experienceRef.current) return

    const experience = experienceRef.current
    const motionMap = [
      { selector: '.origin01-countdown-panel__surface > .origin01-kicker, .origin01-countdown-panel__surface > h2', motion: 'up', level: 'content' },
      { selector: '.origin01-countdown', motion: 'depth', level: 'content', delay: 'follow' },
      { selector: '.origin01-message__card', motion: 'up', level: 'content' },
      { selector: '.origin01-info > .origin01-section-heading', motion: 'up', level: 'content' },
      { selector: '.origin01-info__surface', motion: 'up', level: 'content', delay: 'follow' },
      { selector: '.origin01-info > .origin01-actions', motion: 'scale', level: 'action', delay: 'action' },
      { selector: '.origin01-dress__media', motion: 'depth', level: 'protagonist' },
      { selector: '.origin01-dress__content', motion: 'right', level: 'content', delay: 'follow' },
      { selector: '.origin01-gallery > .origin01-section-heading', motion: 'up', level: 'content' },
      { selector: '.origin01-gallery__item--1', motion: 'depth', level: 'protagonist', delay: 'follow' },
      { selector: '.origin01-gallery__item--2', motion: 'left', level: 'protagonist', delay: 'gallery-second' },
      { selector: '.origin01-gallery__item--3', motion: 'right', level: 'protagonist', delay: 'gallery-third' },
      { selector: '.origin01-gift__media', motion: 'depth', level: 'protagonist' },
      { selector: '.origin01-gift__content', motion: 'up', level: 'content', delay: 'follow' },
      { selector: '.origin01-rsvp', motion: 'up', level: 'content' },
      { selector: '.origin01-rsvp > .origin01-button', motion: 'scale', level: 'action', delay: 'action' },
      { selector: '.origin01-closing__content', motion: 'up', level: 'protagonist' },
      { selector: '.origin01-closing__share', motion: 'up', level: 'action', delay: 'final-action' },
      { selector: '[data-icon-motion]', motion: 'icon', level: 'content' },
    ] as const
    const motionElements = motionMap.flatMap(({ selector, motion, level, ...timing }) =>
      Array.from(experience.querySelectorAll<HTMLElement>(selector)).map((element) => {
        element.dataset.motion = motion
        element.dataset.motionLevel = level
        if ('delay' in timing) element.dataset.motionDelay = timing.delay
        return element
      }))

    experience.classList.add('origin01-motion-ready')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      motionElements.forEach((element) => element.classList.add('origin01-motion-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('origin01-motion-visible')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -18% 0px', threshold: 0.08 },
    )

    motionElements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [invitationIsVisible])

  const playMusic = () => {
    const audio = audioRef.current
    if (!audio) return

    if (!audio.paused && !audio.ended) {
      setIsPlaying(true)
      setIsMusicLoading(false)
      setIsMusicFailed(false)
      return
    }

    setIsMusicLoading(true)
    setIsMusicFailed(false)
    void audio.play().then(
      () => {
        setIsPlaying(true)
        setIsMusicLoading(false)
      },
      () => {
        setIsPlaying(false)
        setIsMusicLoading(false)
        setIsMusicFailed(true)
      },
    )
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

  const copyGiftAccount = async () => {
    if (!invitation.gift) return
    if (copyResetRef.current) window.clearTimeout(copyResetRef.current)
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(invitation.gift.accountValue)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
    copyResetRef.current = window.setTimeout(() => setCopyStatus('idle'), 2_400)
  }

  return (
    <main className={`origin01 origin01--${phase}`}>
      {hasMusic && musicSrc ? (
        <audio
          ref={audioRef}
          src={musicSrc}
          loop
          preload="auto"
          onPlay={() => setIsMusicFailed(false)}
          onPause={() => { setIsPlaying(false); setIsMusicLoading(false) }}
          onPlaying={() => { setIsPlaying(true); setIsMusicLoading(false); setIsMusicFailed(false) }}
          onWaiting={() => setIsMusicLoading(true)}
          onCanPlay={() => setIsMusicLoading(false)}
          onEnded={() => { setIsPlaying(false); setIsMusicLoading(false) }}
          onError={() => { setIsPlaying(false); setIsMusicLoading(false); setIsMusicFailed(true) }}
        />
      ) : null}

      {hasMusic && phase !== 'prelude' ? (
        <button
          type="button"
          className={`origin01-music ${isPlaying ? 'origin01-music--playing' : ''} ${isMusicLoading ? 'origin01-music--loading' : ''} ${isMusicFailed ? 'origin01-music--failed' : ''}`}
          onClick={toggleMusic}
          aria-label={isMusicLoading ? 'Cargando música' : isMusicFailed ? 'Reintentar música' : isPlaying ? 'Pausar música' : 'Reproducir música'}
          aria-pressed={isPlaying}
          aria-busy={isMusicLoading}
        >
          <span className="origin01-music__symbol" aria-hidden="true">
            <OriginIcon name={isPlaying ? 'pause' : 'play'} />
          </span>
        </button>
      ) : null}

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
                <span className="origin01-icon-wrap" data-icon-motion="calendar"><OriginIcon name="calendar" /></span>
                <div>
                  <p>Fecha</p>
                  <strong>{invitation.event.dateLabel}</strong>
                  <span className="origin01-info__meta"><span className="origin01-clock-mark" data-icon-motion="clock"><OriginIcon name="clock" /></span> {invitation.event.timeLabel} hs</span>
                </div>
              </article>
              <article className="origin01-info__row">
                <span className="origin01-icon-wrap" data-icon-motion="pin"><OriginIcon name="pin" /></span>
                <div>
                  <p>Lugar</p>
                  <strong>{invitation.event.venue}</strong>
                  <span>{invitation.event.address}</span>
                </div>
              </article>
            </div>
            <div className="origin01-actions">
              <a className="origin01-button origin01-button--dark" href={mapsUrl} target="_blank" rel="noreferrer">
                <OriginIcon name="pin" />
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
              <span className="origin01-feature-icon" data-icon-motion="hanger"><OriginIcon name="hanger" /></span>
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
                  <span className="origin01-feature-icon origin01-feature-icon--light" data-icon-motion="gift"><OriginIcon name="gift" /></span>
                  <p className="origin01-kicker">Un detalle</p>
                  <h2 id="origin01-gift-title">{invitation.gift.title}</h2>
                  <p>{invitation.gift.description}</p>
                  <div className="origin01-gift__account">
                    <span>{invitation.gift.accountLabel}</span>
                    <strong>{invitation.gift.accountValue}</strong>
                    <button type="button" className={`origin01-copy origin01-copy--${copyStatus}`} onClick={copyGiftAccount} aria-label="Copiar alias">
                      <span className="origin01-copy__icons" aria-hidden="true">
                        <OriginIcon name="copy" />
                        <OriginIcon name="check" />
                        <OriginIcon name="error" />
                      </span>
                      <span className="origin01-copy__label">{copyStatus === 'copied' ? 'Copiado' : copyStatus === 'error' ? 'No se pudo copiar' : 'Copiar alias'}</span>
                    </button>
                    <span className="origin01-sr-only" aria-live="polite">{copyStatus === 'copied' ? 'Alias copiado' : copyStatus === 'error' ? 'No se pudo copiar el alias' : ''}</span>
                  </div>
                  <small>{invitation.gift.demoNote}</small>
                </div>
              </div>
            </section>
          ) : null}

          <section className="origin01-section origin01-rsvp" aria-labelledby="origin01-rsvp-title">
            <div className="origin01-rsvp__sparkles" aria-hidden="true" />
            <span className="origin01-feature-icon origin01-feature-icon--rsvp" data-icon-motion="message"><OriginIcon name="message" /></span>
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
              {audience === 'protagonist' ? (
                <div className="origin01-closing__share">
                  <p>Ahora podés compartir este momento con quienes querés cerca.</p>
                  <button type="button" className="origin01-button origin01-button--glass" onClick={shareInvitation}>
                    <OriginIcon name="share" />
                    Compartir invitación
                  </button>
                  <p className="origin01-closing__share-status" aria-live="polite">{shareStatus}</p>
                </div>
              ) : null}
              <p className="origin01-closing__brand">Origin 01 · LIMEN</p>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}
