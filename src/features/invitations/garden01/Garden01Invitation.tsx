import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import type { InvitationMediaReference } from '../engine/invitationTypes'
import { getEnabledInvitationModuleIds } from '../engine/moduleRuntime'
import {
  fetchOrigin01WeatherForecast,
  formatOrigin01WeatherLocation,
  getOrigin01WeatherAvailability,
  type Origin01WeatherForecast,
} from '../origin01/origin01Weather'
import type { Garden01InvitationData } from './garden01ContentTypes'
import './garden01.css'

const materialPath = '/images/garden-01/materials/'

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

function GardenMaterial({ name, className = '' }: { name: string; className?: string }) {
  return <img className={`garden01-material ${className}`} src={`${materialPath}${name}.webp`} alt="" aria-hidden="true" />
}

function GardenJourneyLine() {
  return <svg className="garden01-journey-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <path className="garden01-journey-line__shadow" d="M8 15C4 21 18 23 9 29S7 38 17 42 8 49 14 55 6 62 15 67 8 73 14 79 6 85 13 91" />
    <path className="garden01-journey-line__cord" pathLength="1" d="M8 15C4 21 18 23 9 29S7 38 17 42 8 49 14 55 6 62 15 67 8 73 14 79 6 85 13 91" />
  </svg>
}

function GardenTree({ side }: { side: 'left' | 'right' }) {
  return <div className={`garden01-tree garden01-tree--${side}`} aria-hidden="true">
    <i className="garden01-tree__trunk" />
    <GardenMaterial name="jasmine-sprig-a" className="garden01-tree__crown garden01-tree__crown--a" />
    <GardenMaterial name="jasmine-sprig-b" className="garden01-tree__crown garden01-tree__crown--b" />
  </div>
}

function GardenPhoto({ media, crop, className = '' }: {
  media?: InvitationMediaReference
  crop: number
  className?: string
}) {
  return <div className={`garden01-photo garden01-photo--crop-${crop} ${className}`}>
    {media?.src ? <img src={media.src} alt={media.alt || 'Fotografía editorial'} /> : <span aria-hidden="true" />}
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

type WeatherState = { readonly kind: 'idle' | 'loading' | 'error' }
  | { readonly kind: 'ready'; readonly forecast: Origin01WeatherForecast }

function GardenWeather({ invitation }: { invitation: Garden01InvitationData }) {
  const weather = invitation.content.weather
  const availability = useMemo(() => getOrigin01WeatherAvailability(
    invitation.event.startsAt, weather.location.timezone,
  ), [invitation.event.startsAt, weather.location.timezone])
  const [state, setState] = useState<WeatherState>({ kind: 'idle' })

  useEffect(() => {
    if (availability.kind !== 'available') return
    const controller = new AbortController()
    void fetchOrigin01WeatherForecast(invitation.event.startsAt, weather.location, controller.signal)
      .then((forecast) => setState({ kind: 'ready', forecast }))
      .catch(() => { if (!controller.signal.aborted) setState({ kind: 'error' }) })
    return () => controller.abort()
  }, [availability.kind, invitation.event.startsAt, weather.location])

  const message = availability.kind === 'future'
    ? <>El pronóstico estará disponible desde el <strong>{new Intl.DateTimeFormat('es-AR', {
      day: 'numeric', month: 'long', timeZone: 'UTC',
    }).format(new Date(`${availability.availableFrom}T12:00:00Z`))}</strong>.</>
    : availability.kind === 'past' ? <>Esta celebración ya pasó.</>
      : state.kind === 'ready' ? <><strong>{Math.round(state.forecast.temperatureMax)}°</strong> · {state.forecast.condition}</>
        : state.kind === 'error' ? <>Pronóstico temporalmente no disponible.</> : <>Consultando el pronóstico real…</>

  return <section className="garden01-weather" aria-labelledby="garden01-weather-title">
    <span className="garden01-weather__icon" aria-hidden="true">☾</span>
    <div><p className="garden01-kicker">{weather.eyebrow}</p><h2 id="garden01-weather-title">{message}</h2>
      <p>{weather.introduction}</p><small>{formatOrigin01WeatherLocation(weather.location)}</small></div>
  </section>
}

function GardenTrivia({ config }: { config: Garden01InvitationData['content']['trivia'] }) {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const question = config.questions[questionIndex]

  const reset = () => { setPhase('playing'); setQuestionIndex(0); setSelectedId(null); setScore(0) }
  const select = (optionId: string) => {
    if (selectedId) return
    setSelectedId(optionId)
    if (optionId === question.correctOptionId) setScore((current) => current + 1)
  }
  const next = () => {
    if (questionIndex + 1 >= config.questions.length) { setPhase('result'); return }
    setQuestionIndex((current) => current + 1)
    setSelectedId(null)
  }
  const tier = [...config.resultTiers].reverse().find(({ minScore }) => score >= minScore) ?? config.resultTiers[0]

  return <section className="garden01-trivia" aria-labelledby="garden01-trivia-title">
    {phase === 'intro' ? <>
      <p className="garden01-kicker">{config.introEyebrow}</p><h2 id="garden01-trivia-title">{config.title}</h2>
      <p>{config.description}</p><button type="button" onClick={reset}>{config.primaryActionLabel}<span aria-hidden="true">›</span></button>
    </> : phase === 'playing' ? <>
      <p className="garden01-kicker">{config.questionMetaLabel} {questionIndex + 1} / {config.questions.length}</p>
      <h2 id="garden01-trivia-title">{question.prompt}</h2>
      <div className="garden01-trivia__options">
        {question.options.map((option) => <button key={option.id} type="button" disabled={Boolean(selectedId)}
          className={selectedId === option.id ? 'is-selected' : ''} onClick={() => select(option.id)}>{option.label}</button>)}
      </div>
      {selectedId ? <div className="garden01-trivia__feedback" aria-live="polite">
        <p>{selectedId === question.correctOptionId ? question.correctFeedback : question.incorrectFeedback}</p>
        <button type="button" onClick={next}>{questionIndex + 1 === config.questions.length ? config.resultLabel : config.nextLabel}</button>
      </div> : null}
    </> : <>
      <p className="garden01-kicker">{config.revealTitle}</p><h2 id="garden01-trivia-title">{tier.title}</h2>
      <p>{tier.message}</p><strong className="garden01-trivia__score">{score}/{config.questions.length}</strong>
      <button type="button" onClick={reset}>{config.replayLabel}</button>
    </>}
  </section>
}

export function Garden01Invitation({ invitation }: { invitation: Garden01InvitationData }) {
  const enabled = getEnabledInvitationModuleIds(invitation.modules)
  const media = (id: string) => invitation.media.find((item) => item.id === id && item.kind === 'image')
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${invitation.event.venue}, ${invitation.event.address}`)}`
  const whatsappUrl = invitation.content.rsvp.recipientPhone
    ? `https://wa.me/${invitation.content.rsvp.recipientPhone}?text=${encodeURIComponent(invitation.content.rsvp.message)}` : undefined
  const gallery = invitation.content.gallery.images.slice(0, 6)
  const heroMedia = media(invitation.content.hero.imageMediaId)

  return <main className="garden01">
    <link rel="stylesheet" href="/fonts/limen/fonts.css" precedence="limen-garden-fonts" />
    {heroMedia?.src ? <link rel="preload" as="image" href={heroMedia.src} /> : null}
    <div className="garden01-frame">
      <GardenJourneyLine />
      <section className="garden01-hero" aria-labelledby="garden01-title">
        <GardenPhoto media={heroMedia} crop={1} className="garden01-hero__photo" />
        <div className="garden01-hero__wash" />
        <p className="garden01-hero__brand">LIMEN · GARDEN 01</p>
        <div className="garden01-hero__copy"><p>{invitation.content.hero.eyebrow}</p>
          <h1 id="garden01-title">{invitation.content.hero.name}</h1>
          <time dateTime={invitation.event.startsAt}>{invitation.content.hero.dateLabel}</time></div>
        <a className="garden01-scroll" href="#garden01-opening"><span>{invitation.content.hero.scrollHint}</span><i aria-hidden="true">⌄</i></a>
      </section>

      <div className="garden01-canvas" id="garden01-opening">
        {enabled.has('prelude') ? <section className="garden01-prelude garden01-paper garden01-paper--vellum">
          <p className="garden01-kicker">{invitation.content.prelude.eyebrow}</p>
          <p>{invitation.content.prelude.body}</p><strong>{invitation.content.prelude.reveal}</strong>
          <GardenMaterial name="botanical-seal" className="garden01-prelude__seal" />
        </section> : null}
        {enabled.has('countdown') ? <section className="garden01-countdown-section garden01-paper garden01-paper--sage" aria-labelledby="garden01-countdown-title">
          <p className="garden01-kicker" id="garden01-countdown-title">{invitation.content.countdown.eyebrow}</p>
          <GardenCountdown startsAt={invitation.event.startsAt} completedMessage={invitation.content.countdown.completedMessage} />
          <p>Nos encontramos en</p>
        </section> : null}
        {enabled.has('story') ? <section className="garden01-story garden01-paper garden01-paper--warm" aria-labelledby="garden01-story-title">
          <p className="garden01-kicker">{invitation.content.story.eyebrow}</p><h2 id="garden01-story-title">{invitation.content.story.heading}</h2>
          <p>{invitation.content.story.introduction}</p></section> : null}
        <GardenMaterial name="jasmine-sprig-a" className="garden01-opening-sprig" />
        <GardenMaterial name="jasmine-sprig-b" className="garden01-opening-sprig garden01-opening-sprig--small" />
      </div>

      {enabled.has('gallery') ? <section className="garden01-gallery" aria-labelledby="garden01-gallery-title">
        <div className="garden01-gallery__heading"><p className="garden01-kicker">Recuerdos que florecen</p>
          <h2 id="garden01-gallery-title">Momentos para guardar</h2></div>
        <GardenTree side="left" /><GardenTree side="right" />
        <div className="garden01-hanging-gallery"><span className="garden01-gallery-rope garden01-gallery-rope--3" aria-hidden="true" />
          {gallery.map((item, index) => <figure key={`${item.mediaId}-${index}`} className={`garden01-hanging-photo garden01-hanging-photo--${index + 1}`}>
          <span className="garden01-clip" aria-hidden="true" /><GardenPhoto media={media(item.mediaId)} crop={index + 1} />
          <figcaption>{item.caption}</figcaption></figure>)}</div>
        <GardenMaterial name="jasmine-sprig-b" className="garden01-gallery-sprig" />
      </section> : null}

      <div className="garden01-celebration">
        {enabled.has('eventDetails') ? <section className="garden01-event garden01-paper garden01-paper--ivory" aria-labelledby="garden01-event-title">
          <p className="garden01-kicker">{invitation.content.eventDetails.eyebrow}</p><h2 id="garden01-event-title">{invitation.content.eventDetails.heading}</h2>
          <div className="garden01-event__facts"><div><span aria-hidden="true">▣</span><strong>{invitation.content.eventDetails.dateLabel}</strong></div>
            <div><span aria-hidden="true">◷</span><strong>{invitation.content.eventDetails.timeLabel}</strong></div>
            <div><span aria-hidden="true">⌖</span><strong>{invitation.content.eventDetails.venueLabel}</strong><small>{invitation.event.address}</small></div></div>
          <a href={mapsUrl} target="_blank" rel="noreferrer">{invitation.content.eventDetails.mapActionLabel}<span aria-hidden="true">›</span></a>
        </section> : null}
        {enabled.has('schedule') ? <section className="garden01-schedule garden01-paper garden01-paper--sage" aria-labelledby="garden01-schedule-title">
          <p className="garden01-kicker" id="garden01-schedule-title">{invitation.content.schedule.eyebrow}</p>
          <ol>{invitation.content.schedule.moments.map((moment) => <li key={moment.id}><time>{moment.time}</time><strong>{moment.title}</strong></li>)}</ol>
        </section> : null}
        {enabled.has('weather') ? <GardenWeather invitation={invitation} /> : null}
        {enabled.has('dressCode') ? <section className="garden01-dress garden01-paper garden01-paper--warm" aria-labelledby="garden01-dress-title">
          <div className="garden01-fabric" aria-hidden="true"><i /><i /></div><p className="garden01-kicker">{invitation.content.dressCode.eyebrow}</p>
          <h2 id="garden01-dress-title">{invitation.content.dressCode.title}</h2><p>{invitation.content.dressCode.description}</p>
          <strong>{invitation.content.dressCode.note}</strong><div className="garden01-swatches" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        </section> : null}
      </div>

      <div className="garden01-participation">
        {enabled.has('gifts') ? <section className="garden01-gifts garden01-paper garden01-paper--rose" aria-labelledby="garden01-gifts-title">
          <GardenMaterial name="sage-envelope" className="garden01-gifts__envelope" /><GardenMaterial name="botanical-seal" className="garden01-gifts__seal" />
          <div><p className="garden01-kicker">{invitation.content.gifts.eyebrow}</p><h2 id="garden01-gifts-title">{invitation.content.gifts.title}</h2>
            <p>{invitation.content.gifts.description}</p><details><summary>{invitation.content.gifts.actionLabel}<span aria-hidden="true">›</span></summary>
              <dl><div><dt>Titular</dt><dd>{invitation.content.gifts.accountHolder}</dd></div><div><dt>{invitation.content.gifts.accountLabel}</dt><dd>{invitation.content.gifts.accountValue}</dd></div><div><dt>Banco o billetera</dt><dd>{invitation.content.gifts.bankName}</dd></div></dl>
              <small>{invitation.content.gifts.demoNote}</small></details></div>
        </section> : null}
        {enabled.has('instagram') ? <section className="garden01-community garden01-paper garden01-paper--sage" aria-labelledby="garden01-community-title">
          <div><p className="garden01-kicker">{invitation.content.community.eyebrow}</p><h2 id="garden01-community-title">{invitation.content.community.heading}</h2>
            <p>{invitation.content.community.introduction}</p>{invitation.content.community.albumUrl
              ? <a href={invitation.content.community.albumUrl} target="_blank" rel="noreferrer">{invitation.content.community.albumActionLabel}<span aria-hidden="true">›</span></a>
              : <span className="garden01-disabled-action" aria-disabled="true">{invitation.content.community.albumActionLabel}<span aria-hidden="true">›</span></span>}</div>
          <div className="garden01-community__photos" aria-hidden="true">{gallery.slice(0, 3).map((item, index) => <GardenPhoto key={item.mediaId} media={media(item.mediaId)} crop={index + 1} />)}</div>
        </section> : null}
        {enabled.has('trivia') ? <GardenTrivia config={invitation.content.trivia} /> : null}
        {enabled.has('rsvp') ? <section className="garden01-rsvp" aria-labelledby="garden01-rsvp-title">
          <p className="garden01-kicker">{invitation.content.rsvp.eyebrow}</p><h2 id="garden01-rsvp-title">{invitation.content.rsvp.title}</h2>
          <p>{invitation.content.rsvp.description}</p>{whatsappUrl
            ? <a href={whatsappUrl} target="_blank" rel="noreferrer">{invitation.content.rsvp.actionLabel}<span aria-hidden="true">›</span></a>
            : <span className="garden01-rsvp__disabled-action" aria-disabled="true">{invitation.content.rsvp.actionLabel}<span aria-hidden="true">›</span></span>}
          <GardenMaterial name="jasmine-sprig-a" className="garden01-rsvp__sprig" />
        </section> : null}
      </div>
      {enabled.has('closing') ? <footer className="garden01-closing"><p>{invitation.content.closing.message}</p>
        <strong>{invitation.content.closing.signature}</strong>{invitation.presentation?.showTemplateBranding ? <small>LIMEN · GARDEN 01</small> : null}</footer> : null}
    </div>
  </main>
}
