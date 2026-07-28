import type { ChangeEvent } from 'react'
import { showsCountdownContent, showsEventDetailsContent } from './studioEditorVisibility'
import type { StudioEventInformationMode } from './studioEditorVisibility'

export type StudioEventInformationField = {
  value: string
  error: string | null
  onChange: (value: string) => void
}

type StudioEventInformationEditorProps = {
  mode?: StudioEventInformationMode
  countdown: {
    eyebrow: StudioEventInformationField
    heading: StudioEventInformationField
    completedMessage: StudioEventInformationField
    resetDisabled: boolean
    onReset: () => void
  }
  eventDetails: {
    eyebrow: StudioEventInformationField
    heading: StudioEventInformationField
    venueLabel: StudioEventInformationField
    mapActionLabel: StudioEventInformationField
    calendarActionLabel: StudioEventInformationField
    calendarDescription: StudioEventInformationField
    resetDisabled: boolean
    onReset: () => void
  }
}

function EditorialField({
  id, label, help, field, multiline = false,
}: {
  id: string
  label: string
  help: string
  field: StudioEventInformationField
  multiline?: boolean
}) {
  const helpId = `${id}-help`
  const errorId = `${id}-error`
  const props = {
    id,
    value: field.value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => (
      field.onChange(event.target.value)
    ),
    'aria-invalid': field.error ? true as const : undefined,
    'aria-describedby': field.error ? `${helpId} ${errorId}` : helpId,
  }

  return (
    <div className="limen-studio__field-group">
      <label className="limen-studio__field-label" htmlFor={id}>{label}</label>
      <p className="limen-studio__field-help" id={helpId}>{help}</p>
      {multiline ? (
        <textarea className="limen-studio__event-information-textarea" {...props} />
      ) : (
        <input className="limen-studio__text-input" type="text" {...props} />
      )}
      {field.error ? (
        <p className="limen-studio__field-error" id={errorId} role="alert">{field.error}</p>
      ) : null}
    </div>
  )
}

export function StudioEventInformationEditor({
  countdown, eventDetails, mode = 'complete',
}: StudioEventInformationEditorProps) {
  return (
    <section
      className="limen-studio__event-information-editor"
      aria-labelledby="studio-event-information-heading"
    >
      <h2 id="studio-event-information-heading">{mode === 'countdown' ? 'Cuenta regresiva'
        : mode === 'event-details' ? 'Datos del evento' : 'Información del evento y cuenta regresiva'}</h2>
      <p className="limen-studio__event-information-intro">
        {mode === 'countdown' ? 'Editá únicamente los textos de la cuenta regresiva.'
          : mode === 'event-details' ? 'Editá los textos informativos de los datos del evento.'
            : 'Editá los textos de la cuenta regresiva y de los datos del evento.'}
      </p>

      <div className="limen-studio__event-information-groups">
        {showsCountdownContent(mode) && <section className="limen-studio__event-information-group" aria-labelledby="studio-countdown-copy-heading">
          <h3 id="studio-countdown-copy-heading">Cuenta regresiva</h3>
          <EditorialField id="studio-countdown-eyebrow" label="Texto introductorio"
            help="Es la frase breve que presenta la cuenta regresiva." field={countdown.eyebrow} />
          <EditorialField id="studio-countdown-heading" label="Título"
            help="Es el mensaje principal que aparece sobre el contador."
            field={countdown.heading} multiline />
          <EditorialField id="studio-countdown-completed-message" label="Mensaje al finalizar"
            help="Se muestra cuando ya llegó el inicio del evento."
            field={countdown.completedMessage} multiline />
          <button className="limen-studio__field-reset" type="button"
            onClick={countdown.onReset} disabled={countdown.resetDisabled}>
            Restablecer cuenta regresiva
          </button>
        </section>}

        {showsEventDetailsContent(mode) && <section className="limen-studio__event-information-group" aria-labelledby="studio-event-details-copy-heading">
          <h3 id="studio-event-details-copy-heading">Datos del evento</h3>
          <EditorialField id="studio-event-details-eyebrow" label="Texto introductorio"
            help="Es la frase breve que presenta los datos del evento." field={eventDetails.eyebrow} />
          <EditorialField id="studio-event-details-heading" label="Título"
            help="Es el mensaje principal de esta sección." field={eventDetails.heading} multiline />
          <EditorialField id="studio-event-details-venue-label" label="Etiqueta del lugar"
            help="Identifica el nombre y la dirección del evento." field={eventDetails.venueLabel} />
          <EditorialField id="studio-event-details-map-action" label="Acción de ubicación"
            help="Es el texto del enlace que abre la ubicación derivada." field={eventDetails.mapActionLabel} />
          <EditorialField id="studio-event-details-calendar-action" label="Acción de calendario"
            help="Es el texto del enlace para agendar el evento." field={eventDetails.calendarActionLabel} />
          <EditorialField id="studio-event-details-calendar-description" label="Descripción del calendario"
            help="Acompaña los datos derivados cuando se abre el calendario."
            field={eventDetails.calendarDescription} multiline />
          <button className="limen-studio__field-reset" type="button"
            onClick={eventDetails.onReset} disabled={eventDetails.resetDisabled}>
            Restablecer datos del evento
          </button>
        </section>}
      </div>
    </section>
  )
}
