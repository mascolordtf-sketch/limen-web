import { useEffect, useRef, useState } from 'react'

import confettiAnimation from '../../../assets/lottie/origin01-trivia-confetti.json'
import questionAnimation from '../../../assets/lottie/origin01-trivia-question.json'
import { Origin01Lottie } from './Origin01Lottie'
import type { Origin01TriviaContent } from './origin01ContentTypes'

type Phase = 'intro' | 'playing' | 'result'

export function Origin01Trivia({ config }: { config: Origin01TriviaContent }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<(string | null)[]>(() => Array(config.questions.length).fill(null))
  const [playthrough, setPlaythrough] = useState(0)
  const playingRef = useRef<HTMLDivElement | null>(null)
  const answeredRef = useRef<HTMLDivElement | null>(null)
  const question = config.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === config.questions.length - 1
  const completedCount = answers.filter((answer) => answer !== null).length
  const correctCount = config.questions.reduce((score, item, index) =>
    item.isPrediction ? score : score + Number(answers[index] === item.correctOptionId), 0)

  useEffect(() => {
    if (phase !== 'playing') return
    const target = selectedOptionId === null ? playingRef.current : answeredRef.current
    if (!target) return
    const view = target.ownerDocument.defaultView
    const behavior = view?.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    view?.requestAnimationFrame(() => target.scrollIntoView({ behavior, block: selectedOptionId === null ? 'start' : 'nearest' }))
  }, [currentQuestionIndex, phase, selectedOptionId])

  const selectOption = (optionId: string) => {
    if (selectedOptionId !== null) return
    setSelectedOptionId(optionId)
    setAnswers((previous) => previous.map((answer, index) => index === currentQuestionIndex ? optionId : answer))
  }

  const next = () => {
    if (isLastQuestion) {
      setPhase('result')
      return
    }
    setCurrentQuestionIndex((index) => index + 1)
    setSelectedOptionId(null)
  }

  const replay = () => {
    setPhase('playing')
    setCurrentQuestionIndex(0)
    setSelectedOptionId(null)
    setAnswers(Array(config.questions.length).fill(null))
    setPlaythrough((value) => value + 1)
  }

  if (phase === 'intro') return (
    <div className="origin01-trivia__intro">
      <Origin01Lottie animationData={questionAnimation} className="origin01-trivia__question-lottie" playWhenVisible />
      <p className="origin01-kicker origin01-trivia__eyebrow">{config.introEyebrow}</p>
      <h2 className="origin01-trivia__title">{config.title}</h2>
      <p className="origin01-trivia__description">{config.description}</p>
      <button type="button" className="origin01-button origin01-button--dark origin01-trivia__primary" onClick={() => setPhase('playing')}>{config.primaryActionLabel}</button>
    </div>
  )

  if (phase === 'playing') {
    const isCorrect = !question.isPrediction && selectedOptionId === question.correctOptionId
    const feedback = question.isPrediction || isCorrect ? question.correctFeedback : question.incorrectFeedback
    return (
      <div className="origin01-trivia__playing" ref={playingRef}>
        <div className="origin01-trivia__progress">
          <p>{config.questionMetaLabel} {currentQuestionIndex + 1} de {config.questions.length}</p>
          <div className="origin01-trivia__progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={config.questions.length} aria-valuenow={completedCount} aria-label="Progreso de la trivia">
            <span style={{ width: `${(completedCount / config.questions.length) * 100}%` }} />
          </div>
        </div>
        <h3 key={question.id} className="origin01-trivia__question">{question.prompt}</h3>
        <div className="origin01-trivia__options" role="group" aria-label={`Respuestas para: ${question.prompt}`}>
          {question.options.map((option, index) => {
            const selected = selectedOptionId === option.id
            const answered = selectedOptionId !== null
            const correct = !question.isPrediction && option.id === question.correctOptionId
            const state = !answered ? '' : question.isPrediction ? (selected ? 'selected' : 'quiet') : correct ? 'correct' : selected ? 'incorrect' : 'quiet'
            return <button key={option.id} type="button" className={`origin01-trivia__option ${state ? `origin01-trivia__option--${state}` : ''}`} onClick={() => selectOption(option.id)} disabled={answered} aria-pressed={selected}>
              <span aria-hidden="true">{String.fromCharCode(65 + index)}</span><strong>{option.label}</strong>
            </button>
          })}
        </div>
        {selectedOptionId !== null ? (
          <div className="origin01-trivia__answered" ref={answeredRef}>
            <p className={`origin01-trivia__feedback origin01-trivia__feedback--${question.isPrediction ? 'prediction' : isCorrect ? 'correct' : 'incorrect'}`} aria-live="polite">{feedback}</p>
            <button type="button" className="origin01-button origin01-button--dark origin01-trivia__next" onClick={next}>{isLastQuestion ? config.resultLabel : config.nextLabel}</button>
          </div>
        ) : null}
      </div>
    )
  }

  const tier = config.resultTiers.find((item) => correctCount >= item.minScore) ?? config.resultTiers.at(-1)!
  return (
    <div className="origin01-trivia__result">
      <Origin01Lottie animationData={confettiAnimation} className="origin01-trivia__confetti" playKey={playthrough}
        hideForReducedMotion preserveAspectRatio="xMidYMin slice" />
      <p className="origin01-trivia__score"><strong>{correctCount}</strong><span>{config.scoreTotalLabel}</span></p>
      <h3 className="origin01-trivia__tier" aria-live="polite">{tier.title}</h3>
      <p className="origin01-trivia__result-message">{tier.message}</p>
      <div className="origin01-trivia__closing">
        <h3>{config.revealTitle}</h3>
        <p>{config.revealMessage}</p>
        <span>{config.revealSignature}</span>
      </div>
      <button type="button" className="origin01-button origin01-trivia__replay" onClick={replay}>{config.replayLabel}</button>
    </div>
  )
}
