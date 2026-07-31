import type { ChangeEvent } from 'react'

import type { Origin01Content } from '../invitations/origin01/origin01ContentTypes'
import {
  addOrigin01ScheduleMoment,
  moveOrigin01ScheduleMoment,
  removeOrigin01ScheduleMoment,
  studioScheduleMaxMoments,
  studioScheduleMinMoments,
  updateOrigin01ScheduleMoment,
} from './origin01StudioSchedule'

type Schedule = Origin01Content['schedule']

type Props = {
  value: Schedule
  canonicalValue: Schedule
  errors: Readonly<Record<string, string | null>>
  onChange: (value: Schedule) => void
  onReset: () => void
}

const describedBy = (id: string, error: string | null, help = false) =>
  [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined

function ScheduleField({ id, label, help, value, error, multiline = false, onChange }: {
  id: string
  label: string
  help?: string
  value: string
  error: string | null
  multiline?: boolean
  onChange: (value: string) => void
}) {
  const props = {
    id,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    'aria-invalid': error ? true as const : undefined,
    'aria-describedby': describedBy(id, error, Boolean(help)),
  }
  return <div className="limen-studio__field-group">
    <label className="limen-studio__field-label" htmlFor={id}>{label}</label>
    {help ? <p className="limen-studio__field-help" id={`${id}-help`}>{help}</p> : null}
    {multiline
      ? <textarea className="limen-studio__event-information-textarea" {...props} />
      : <input className="limen-studio__text-input" type="text" {...props} />}
    {error ? <p className="limen-studio__field-error" id={`${id}-error`} role="alert">{error}</p> : null}
  </div>
}

export function StudioScheduleEditor({ value, canonicalValue, errors, onChange, onReset }: Props) {
  const unchanged = JSON.stringify(value) === JSON.stringify(canonicalValue)
  return <section className="limen-studio__schedule-editor" aria-labelledby="studio-schedule-heading">
    <header>
      <div>
        <h2 id="studio-schedule-heading">Cronograma</h2>
        <p>Ordená los momentos principales para orientar a los invitados durante la celebración.</p>
      </div>
      <button className="limen-studio__field-reset" type="button" disabled={unchanged} onClick={onReset}>
        Restablecer cronograma
      </button>
    </header>

    <div className="limen-studio__schedule-copy">
      <ScheduleField id="studio-schedule-eyebrow" label="Texto introductorio"
        help="Es la frase breve que presenta la escena." value={value.eyebrow}
        error={errors.scheduleEyebrow}
        onChange={(eyebrow) => onChange({ ...value, eyebrow })} />
      <ScheduleField id="studio-schedule-heading-field" label="Título"
        value={value.heading} error={errors.scheduleHeading} multiline
        onChange={(heading) => onChange({ ...value, heading })} />
      <ScheduleField id="studio-schedule-introduction" label="Presentación"
        help="Explicá brevemente qué representa este recorrido." value={value.introduction}
        error={errors.scheduleIntroduction} multiline
        onChange={(introduction) => onChange({ ...value, introduction })} />
    </div>

    <div className="limen-studio__schedule-list-heading">
      <div><h3>Momentos</h3><p>{value.moments.length} de {studioScheduleMaxMoments}</p></div>
      <button className="limen-studio__schedule-add" type="button"
        disabled={value.moments.length >= studioScheduleMaxMoments}
        onClick={() => onChange(addOrigin01ScheduleMoment(value))}>Agregar momento</button>
    </div>
    {errors.scheduleMoments ? <p className="limen-studio__field-error" role="alert">{errors.scheduleMoments}</p> : null}

    <ol className="limen-studio__schedule-moments">{value.moments.map((moment, index) => {
      const timeId = `studio-schedule-${moment.id}-time`
      const titleId = `studio-schedule-${moment.id}-title`
      const descriptionId = `studio-schedule-${moment.id}-description`
      const timeError = errors[`scheduleMoment-${moment.id}-time`]
      const titleError = errors[`scheduleMoment-${moment.id}-title`]
      return <li key={moment.id} className="limen-studio__schedule-moment">
        <header>
          <div><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <strong>{moment.title || 'Momento sin título'}</strong></div>
          <div className="limen-studio__schedule-order" aria-label={`Orden de ${moment.title || `momento ${index + 1}`}`}>
            <button type="button" disabled={index === 0}
              onClick={() => onChange(moveOrigin01ScheduleMoment(value, moment.id, -1))}>Subir</button>
            <button type="button" disabled={index === value.moments.length - 1}
              onClick={() => onChange(moveOrigin01ScheduleMoment(value, moment.id, 1))}>Bajar</button>
          </div>
        </header>
        <div className="limen-studio__schedule-moment-fields">
          <div className="limen-studio__field-group">
            <label className="limen-studio__field-label" htmlFor={timeId}>Horario</label>
            <input id={timeId} className="limen-studio__datetime-input" type="time" value={moment.time}
              aria-invalid={timeError ? true : undefined}
              aria-describedby={describedBy(timeId, timeError)}
              onChange={(event) => onChange(updateOrigin01ScheduleMoment(
                value, moment.id, (current) => ({ ...current, time: event.target.value }),
              ))} />
            {timeError ? <p className="limen-studio__field-error" id={`${timeId}-error`} role="alert">{timeError}</p> : null}
          </div>
          <ScheduleField id={titleId} label="Título" value={moment.title} error={titleError}
            onChange={(title) => onChange(updateOrigin01ScheduleMoment(
              value, moment.id, (current) => ({ ...current, title }),
            ))} />
          <ScheduleField id={descriptionId} label="Descripción"
            help="Opcional. Dejala vacía para mostrar solo el horario y el título."
            value={moment.description ?? ''} error={null} multiline
            onChange={(description) => onChange(updateOrigin01ScheduleMoment(
              value, moment.id, (current) => ({ ...current, description }),
            ))} />
        </div>
        <button className="limen-studio__schedule-remove" type="button"
          disabled={value.moments.length <= studioScheduleMinMoments}
          onClick={() => onChange(removeOrigin01ScheduleMoment(value, moment.id))}>
          Quitar momento
        </button>
      </li>
    })}</ol>
  </section>
}
