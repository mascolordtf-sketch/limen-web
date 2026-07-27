import type { ChangeEvent } from 'react'

import type { Origin01TriviaContent, Origin01TriviaQuestion } from '../invitations/origin01/origin01ContentTypes'

type Props = {
  value: Origin01TriviaContent
  canonicalValue: Origin01TriviaContent
  onChange: (value: Origin01TriviaContent) => void
}

const presentationFields = [
  ['introEyebrow', 'Texto introductorio', 'Es la frase breve que presenta el juego.'],
  ['description', 'Presentación', 'Explicá brevemente el desafío antes de comenzar.'],
  ['primaryActionLabel', 'Texto del botón inicial', 'Es la acción que inicia la trivia.'],
  ['questionMetaLabel', 'Etiqueta de pregunta', 'Acompaña el progreso durante el juego.'],
  ['nextLabel', 'Texto para continuar', 'Es la acción que avanza a la siguiente pregunta.'],
  ['resultLabel', 'Texto para ver el resultado', 'Es la acción que finaliza las preguntas.'],
  ['replayLabel', 'Texto para volver a jugar', 'Es la acción que inicia una nueva partida.'],
  ['scoreTotalLabel', 'Texto del puntaje total', 'Acompaña el puntaje obtenido.'],
  ['revealTitle', 'Título final', 'Presenta el mensaje que aparece después del resultado.'],
  ['revealMessage', 'Mensaje final', 'Cierra la trivia después de mostrar el resultado.'],
] as const satisfies readonly (readonly [keyof Origin01TriviaContent, string, string])[]

const fieldError = (value: string, message: string) => value.trim() ? null : message
const describedBy = (id: string, error: string | null, help = true) =>
  [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined

function sameQuestion(a: Origin01TriviaQuestion, b: Origin01TriviaQuestion) {
  return a.prompt === b.prompt && a.correctOptionId === b.correctOptionId
    && a.correctFeedback === b.correctFeedback && a.incorrectFeedback === b.incorrectFeedback
    && a.options.every((option, index) => option.label === b.options[index]?.label)
}

export function StudioTriviaEditor({ value, canonicalValue, onChange }: Props) {
  const updateQuestion = (questionIndex: number, update: (question: Origin01TriviaQuestion) => Origin01TriviaQuestion) => {
    onChange({ ...value, questions: value.questions.map((question, index) => (
      index === questionIndex ? update(question) : question
    )) })
  }

  return (
    <section className="limen-studio__trivia-editor" aria-labelledby="studio-trivia-heading">
      <h2 id="studio-trivia-heading">Trivia</h2>
      <p className="limen-studio__trivia-intro">
        Personalizá las preguntas y los resultados sin cambiar la dinámica del juego.
      </p>

      <div className="limen-studio__trivia-groups">
        <section className="limen-studio__trivia-group" aria-labelledby="studio-trivia-presentation">
          <h3 id="studio-trivia-presentation">Presentación</h3>
          {presentationFields.map(([key, label, help]) => {
            const id = `studio-trivia-${key}`
            const current = String(value[key])
            const canonical = String(canonicalValue[key])
            const error = fieldError(current, `Ingresá ${label.toLocaleLowerCase('es-AR')}.`)
            const textarea = key === 'description' || key === 'revealMessage'
            const props = {
              id, value: current,
              onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => (
                onChange({ ...value, [key]: event.target.value })
              ),
              'aria-invalid': error ? true as const : undefined,
              'aria-describedby': describedBy(id, error),
            }
            return <div className="limen-studio__trivia-field" key={key}>
              <div className="limen-studio__field-group">
                <label className="limen-studio__field-label" htmlFor={id}>{label}</label>
                <p className="limen-studio__field-help" id={`${id}-help`}>{help}</p>
                {textarea
                  ? <textarea className="limen-studio__trivia-textarea" {...props} />
                  : <input className="limen-studio__text-input" type="text" {...props} />}
                {error ? <p className="limen-studio__field-error" id={`${id}-error`} role="alert">{error}</p> : null}
                <button className="limen-studio__field-reset" type="button"
                  disabled={current === canonical}
                  onClick={() => onChange({ ...value, [key]: canonical })}>
                  Restablecer {label.toLocaleLowerCase('es-AR')}
                </button>
              </div>
            </div>
          })}
        </section>

        <section className="limen-studio__trivia-group" aria-labelledby="studio-trivia-questions">
          <h3 id="studio-trivia-questions">Preguntas</h3>
          {value.questions.map((question, questionIndex) => {
            const canonicalQuestion = canonicalValue.questions[questionIndex]
            const promptId = `studio-trivia-question-${question.id}-prompt`
            const promptError = fieldError(question.prompt, `Ingresá el enunciado de la pregunta ${questionIndex + 1}.`)
            const correctAnswerError = !question.isPrediction && !question.options.some(
              (option) => option.id === question.correctOptionId,
            ) ? 'Seleccioná la respuesta correcta.' : null
            return <div className="limen-studio__trivia-question" key={question.id}>
              <h4>Pregunta {questionIndex + 1}</h4>
              <div className="limen-studio__field-group">
                <label className="limen-studio__field-label" htmlFor={promptId}>Enunciado</label>
                <textarea id={promptId} className="limen-studio__trivia-textarea"
                  value={question.prompt} aria-invalid={promptError ? true : undefined}
                  aria-describedby={describedBy(promptId, promptError, false)}
                  onChange={(event) => updateQuestion(questionIndex, (current) => ({ ...current, prompt: event.target.value }))} />
                {promptError ? <p className="limen-studio__field-error" id={`${promptId}-error`} role="alert">{promptError}</p> : null}
              </div>
              <div className="limen-studio__trivia-options">
                {question.options.map((option, optionIndex) => {
                  const id = `studio-trivia-question-${question.id}-option-${option.id}`
                  const error = fieldError(option.label, `Ingresá el texto de la opción ${optionIndex + 1}.`)
                  return <div className="limen-studio__field-group" key={option.id}>
                    <label className="limen-studio__field-label" htmlFor={id}>Opción {optionIndex + 1}</label>
                    <input id={id} className="limen-studio__text-input" type="text" value={option.label}
                      aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, false)}
                      onChange={(event) => updateQuestion(questionIndex, (current) => ({
                        ...current, options: current.options.map((item) => item.id === option.id
                          ? { ...item, label: event.target.value } : item),
                      }))} />
                    {error ? <p className="limen-studio__field-error" id={`${id}-error`} role="alert">{error}</p> : null}
                  </div>
                })}
              </div>
              {question.isPrediction ? (
                <p className="limen-studio__trivia-note" id={`studio-trivia-question-${question.id}-prediction`}>
                  Esta pregunta no tiene respuesta incorrecta y no modifica el puntaje.
                </p>
              ) : (
                <fieldset className="limen-studio__trivia-correct" aria-describedby={correctAnswerError ? `studio-trivia-question-${question.id}-correct-error` : undefined}>
                  <legend>Respuesta correcta</legend>
                  {question.options.map((option) => <label key={option.id}>
                    <input type="radio" name={`studio-trivia-question-${question.id}-correct`}
                      value={option.id} checked={question.correctOptionId === option.id}
                      onChange={() => updateQuestion(questionIndex, (current) => ({ ...current, correctOptionId: option.id }))} />
                    <span>{option.label || `Opción ${question.options.indexOf(option) + 1}`}</span>
                  </label>)}
                  {correctAnswerError ? <p className="limen-studio__field-error" id={`studio-trivia-question-${question.id}-correct-error`} role="alert">{correctAnswerError}</p> : null}
                </fieldset>
              )}
              {(['correctFeedback', ...(question.incorrectFeedback === undefined ? [] : ['incorrectFeedback'])] as readonly ('correctFeedback' | 'incorrectFeedback')[]).map((key) => {
                const prediction = question.isPrediction
                const label = prediction ? 'Mensaje de participación' : key === 'correctFeedback' ? 'Mensaje de respuesta correcta' : 'Mensaje de respuesta incorrecta'
                const id = `studio-trivia-question-${question.id}-${key}`
                const text = question[key] ?? ''
                const error = fieldError(text, `Ingresá el ${label.toLocaleLowerCase('es-AR')}.`)
                return <div className="limen-studio__field-group" key={key}>
                  <label className="limen-studio__field-label" htmlFor={id}>{label}</label>
                  <textarea id={id} className="limen-studio__trivia-textarea" value={text}
                    aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, false)}
                    onChange={(event) => updateQuestion(questionIndex, (current) => ({ ...current, [key]: event.target.value }))} />
                  {error ? <p className="limen-studio__field-error" id={`${id}-error`} role="alert">{error}</p> : null}
                </div>
              })}
              <button className="limen-studio__field-reset" type="button"
                disabled={sameQuestion(question, canonicalQuestion)}
                onClick={() => updateQuestion(questionIndex, () => ({ ...canonicalQuestion, options: canonicalQuestion.options.map((option) => ({ ...option })) }))}>
                Restablecer pregunta
              </button>
            </div>
          })}
        </section>

        <section className="limen-studio__trivia-group" aria-labelledby="studio-trivia-results">
          <h3 id="studio-trivia-results">Resultados</h3>
          {value.resultTiers.map((tier, index) => {
            const nextMin = index === 0 ? tier.minScore : value.resultTiers[index - 1].minScore - 1
            const range = tier.minScore === nextMin ? `${tier.minScore} ${tier.minScore === 1 ? 'respuesta correcta' : 'respuestas correctas'}` : `${tier.minScore} a ${nextMin} respuestas correctas`
            const canonicalTier = canonicalValue.resultTiers[index]
            return <div className="limen-studio__trivia-result" key={tier.minScore}>
              <h4>Resultado: {range}</h4>
              {(['title', 'message'] as const).map((key) => {
                const id = `studio-trivia-result-${tier.minScore}-${key}`
                const label = key === 'title' ? 'Título del resultado' : 'Mensaje del resultado'
                const error = fieldError(tier[key], `Ingresá el ${label.toLocaleLowerCase('es-AR')}.`)
                return <div className="limen-studio__field-group" key={key}>
                  <label className="limen-studio__field-label" htmlFor={id}>{label}</label>
                  {key === 'message'
                    ? <textarea id={id} className="limen-studio__trivia-textarea" value={tier[key]}
                      aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, false)}
                      onChange={(event) => onChange({ ...value, resultTiers: value.resultTiers.map((item, tierIndex) => tierIndex === index ? { ...item, [key]: event.target.value } : item) })} />
                    : <input id={id} className="limen-studio__text-input" type="text" value={tier[key]}
                      aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, false)}
                      onChange={(event) => onChange({ ...value, resultTiers: value.resultTiers.map((item, tierIndex) => tierIndex === index ? { ...item, [key]: event.target.value } : item) })} />}
                  {error ? <p className="limen-studio__field-error" id={`${id}-error`} role="alert">{error}</p> : null}
                </div>
              })}
              <button className="limen-studio__field-reset" type="button"
                disabled={tier.title === canonicalTier.title && tier.message === canonicalTier.message}
                onClick={() => onChange({ ...value, resultTiers: value.resultTiers.map((item, tierIndex) => tierIndex === index ? { ...canonicalTier } : item) })}>
                Restablecer resultado
              </button>
            </div>
          })}
        </section>
      </div>
    </section>
  )
}
