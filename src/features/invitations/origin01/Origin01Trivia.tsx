import { useEffect, useRef, useState } from 'react'

import { origin01Trivia as config } from './origin01TriviaData'

type Phase = 'intro' | 'playing' | 'result'
type LightState = 'unlit' | 'lit' | 'dim' | 'soft'

type RevealImage = {
  src?: string
  alt: string
}

function ConstellationIcon() {
  return (
    <svg
      className="origin01-icon origin01-trivia__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.05}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        className="origin01-icon__constellation-lines"
        d="M6 5.5L12 11.5M17.5 6.5L12 11.5M12 11.5L5.5 17M12 11.5L17 17.5"
        strokeWidth={0.65}
        opacity={0.45}
      />
      <circle cx="6" cy="5.5" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="6.5" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="12" cy="11.5" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="5.5" cy="17" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="17" cy="17.5" r="1.35" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Origin01Trivia({ revealImage }: { revealImage: RevealImage }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<(string | null)[]>(
    Array(config.questions.length).fill(null),
  )
  const [lights, setLights] = useState<LightState[]>(
    Array(config.questions.length).fill('unlit'),
  )

  const questionRef = useRef<HTMLHeadingElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const question = config.questions[currentQ]
  const totalQuestions = config.questions.length
  const isAnswered = selectedId !== null
  const isLastQuestion = currentQ === totalQuestions - 1

  const correctCount = config.questions.reduce((count, q, i) => {
    if (q.isPrediction) return count
    return answers[i] === q.correctOptionId ? count + 1 : count
  }, 0)

  const scoredQuestions = config.questions.filter((q) => !q.isPrediction).length

  // — Handlers —

  const startTrivia = () => {
    setPhase('playing')
  }

  const selectOption = (optionId: string) => {
    if (isAnswered) return
    setSelectedId(optionId)
    setAnswers((prev) => {
      const next = [...prev]
      next[currentQ] = optionId
      return next
    })
    setLights((prev) => {
      const next = [...prev]
      if (question.isPrediction) {
        next[currentQ] = 'soft'
      } else if (optionId === question.correctOptionId) {
        next[currentQ] = 'lit'
      } else {
        next[currentQ] = 'dim'
      }
      return next
    })
  }

  const handleNext = () => {
    if (isLastQuestion) {
      setPhase('result')
      return
    }
    setCurrentQ((q) => q + 1)
    setSelectedId(null)
  }

  const handleReplay = () => {
    setPhase('intro')
    setCurrentQ(0)
    setSelectedId(null)
    setAnswers(Array(config.questions.length).fill(null))
    setLights(Array(config.questions.length).fill('unlit'))
  }

  // — Focus management —

  useEffect(() => {
    if (phase === 'playing' && questionRef.current) {
      questionRef.current.focus({ preventScroll: true })
    }
  }, [phase, currentQ])

  useEffect(() => {
    if (phase === 'result' && resultRef.current) {
      resultRef.current.focus({ preventScroll: true })
    }
  }, [phase])

  // — Render: intro —

  if (phase === 'intro') {
    return (
      <div className="origin01-trivia__intro">
        <span
          className="origin01-feature-icon origin01-trivia__icon-wrap"
          data-icon-motion="constellation"
        >
          <ConstellationIcon />
        </span>
        <p className="origin01-kicker origin01-trivia__eyebrow">
          {config.introEyebrow}
        </p>
        <h2 className="origin01-trivia__title">{config.title}</h2>
        <p className="origin01-trivia__desc">{config.description}</p>
        <div
          className="origin01-trivia__lights origin01-trivia__lights--intro"
          aria-hidden="true"
        >
          {lights.map((_, i) => (
            <span
              key={i}
              className="origin01-trivia__light origin01-trivia__light--unlit"
            />
          ))}
        </div>
        <button
          type="button"
          className="origin01-button origin01-button--dark origin01-trivia__start"
          onClick={startTrivia}
        >
          {config.primaryAction}
        </button>
        <p className="origin01-trivia__meta">{config.meta}</p>
      </div>
    )
  }

  // — Render: playing —

  if (phase === 'playing') {
    const isCorrect =
      !question.isPrediction && selectedId === question.correctOptionId
    const feedback = question.isPrediction
      ? question.correctFeedback
      : isCorrect
        ? question.correctFeedback
        : question.incorrectFeedback

    return (
      <div className="origin01-trivia__play">
        <div className="origin01-trivia__progress">
          <span className="origin01-trivia__progress-label">
            Pregunta {currentQ + 1} de {totalQuestions}
          </span>
          <div
            className="origin01-trivia__lights"
            role="img"
            aria-label={`${lights.filter((l) => l === 'lit').length} de ${scoredQuestions} respuestas correctas`}
          >
            {lights.map((state, i) => (
              <span
                key={i}
                className={`origin01-trivia__light origin01-trivia__light--${state}`}
              />
            ))}
          </div>
        </div>

        <h3
          key={currentQ}
          ref={questionRef}
          className="origin01-trivia__question"
          tabIndex={-1}
        >
          {question.prompt}
        </h3>

        <div
          key={`opts-${currentQ}`}
          className="origin01-trivia__options"
          role="group"
          aria-label={question.prompt}
        >
          {question.options.map((option, i) => {
            const isSelected = selectedId === option.id
            const isAnswerCorrect = option.id === question.correctOptionId
            let className = 'origin01-trivia__option'
            if (isAnswered) {
              if (question.isPrediction) {
                if (isSelected) className += ' origin01-trivia__option--selected'
                else className += ' origin01-trivia__option--dimmed'
              } else if (isAnswerCorrect) {
                className += ' origin01-trivia__option--correct'
              } else if (isSelected) {
                className += ' origin01-trivia__option--incorrect'
              } else {
                className += ' origin01-trivia__option--dimmed'
              }
            }
            return (
              <button
                key={option.id}
                type="button"
                className={className}
                onClick={() => selectOption(option.id)}
                disabled={isAnswered}
                aria-pressed={isSelected || undefined}
              >
                <span className="origin01-trivia__option-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="origin01-trivia__option-text">
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Feedback area — always rendered so the action remains stable */}
        <div className="origin01-trivia__feedback" aria-live="polite">
          {isAnswered ? (
            <p
              className={`origin01-trivia__feedback-text${
                question.isPrediction
                  ? ' origin01-trivia__feedback-text--neutral'
                  : isCorrect
                    ? ' origin01-trivia__feedback-text--correct'
                    : ' origin01-trivia__feedback-text--wrong'
              }`}
            >
              {feedback}
            </p>
          ) : null}
        </div>

        {/* Action area — the button and hint keep their natural footprint */}
        <div className="origin01-trivia__action">
          <button
            type="button"
            className="origin01-button origin01-button--dark origin01-trivia__next"
            onClick={handleNext}
            disabled={!isAnswered}
          >
            {isLastQuestion ? config.resultLabel : config.nextLabel}
          </button>
          <p
            className={`origin01-trivia__action-hint${
              isAnswered ? ' origin01-trivia__action-hint--hidden' : ''
            }`}
            aria-hidden={isAnswered}
          >
            Elegí una respuesta
          </p>
        </div>
      </div>
    )
  }

  // — Render: result + reveal —

  const tier =
    config.resultTiers.find((t) => correctCount >= t.minScore) ??
    config.resultTiers[config.resultTiers.length - 1]

  return (
    <div className="origin01-trivia__result" ref={resultRef} tabIndex={-1}>
      <div className="origin01-trivia__result-score">
        <span className="origin01-trivia__result-number">{correctCount}</span>
        <span className="origin01-trivia__result-divider">/</span>
        <span className="origin01-trivia__result-total">{scoredQuestions}</span>
      </div>
      <h3 className="origin01-trivia__result-tier" aria-live="polite">
        {tier.title}
      </h3>
      <p className="origin01-trivia__result-message">{tier.message}</p>

      <div className="origin01-trivia__reveal">
        <div className="origin01-trivia__reveal-frame">
          <div className="origin01-trivia__reveal-lights" aria-hidden="true">
            {lights.map((state, i) => (
              <span
                key={i}
                className={`origin01-trivia__light origin01-trivia__light--${state} origin01-trivia__reveal-light origin01-trivia__reveal-light--${i + 1}`}
              />
            ))}
          </div>
          {revealImage.src ? (
            <img
              className="origin01-trivia__reveal-photo"
              src={revealImage.src}
              alt={revealImage.alt}
              loading="lazy"
            />
          ) : (
            <div
              className="origin01-trivia__reveal-placeholder"
              role="img"
              aria-label={revealImage.alt}
            />
          )}
        </div>
        <h3 className="origin01-trivia__reveal-title">{config.revealTitle}</h3>
        <p className="origin01-trivia__reveal-body">{config.revealMessage}</p>
        <span className="origin01-trivia__reveal-signature">
          {config.revealSignature}
        </span>
        <button
          type="button"
          className="origin01-button origin01-trivia__replay"
          onClick={handleReplay}
        >
          {config.replayLabel}
        </button>
      </div>
    </div>
  )
}
