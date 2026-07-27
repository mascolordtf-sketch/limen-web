type StudioEventScheduleEditorProps = {
  startValue: string
  canonicalStartValue: string
  startError: string | null
  endValue: string
  canonicalEndValue: string
  endError: string | null
  timeZone: string
  onStartChange: (value: string) => void
  onStartReset: () => void
  onEndChange: (value: string) => void
  onEndReset: () => void
}

const startInputId = 'studio-event-start'
const startHelpId = 'studio-event-start-help'
const startTimeZoneId = 'studio-event-start-time-zone'
const startErrorId = 'studio-event-start-error'
const endInputId = 'studio-event-end'
const endHelpId = 'studio-event-end-help'
const endTimeZoneId = 'studio-event-end-time-zone'
const endErrorId = 'studio-event-end-error'

export function StudioEventScheduleEditor({
  startValue, canonicalStartValue, startError, endValue, canonicalEndValue, endError,
  timeZone, onStartChange, onStartReset, onEndChange, onEndReset,
}: StudioEventScheduleEditorProps) {
  const startDescribedBy = startError
    ? `${startHelpId} ${startTimeZoneId} ${startErrorId}`
    : `${startHelpId} ${startTimeZoneId}`
  const endDescribedBy = endError
    ? `${endHelpId} ${endTimeZoneId} ${endErrorId}`
    : `${endHelpId} ${endTimeZoneId}`

  return (
    <section className="limen-studio__event-schedule-editor" aria-labelledby="studio-event-schedule-title">
      <h2 id="studio-event-schedule-title">Fecha y horario del evento</h2>
      <p className="limen-studio__schedule-intro">
        Definí cuándo comienza y cuándo termina. El evento puede finalizar al día siguiente.
      </p>

      <div className="limen-studio__schedule-field-group">
        <h3>Inicio</h3>
        <div className="limen-studio__field-group">
          <label className="limen-studio__field-label" htmlFor={startInputId}>
            Fecha y hora de inicio
          </label>
          <p className="limen-studio__field-help" id={startHelpId}>
            Este cambio es temporal y se interpreta en la zona horaria de la invitación.
          </p>
          <p className="limen-studio__field-time-zone" id={startTimeZoneId}>
            Zona horaria: {timeZone}
          </p>
          <input
            className="limen-studio__datetime-input"
            id={startInputId}
            type="datetime-local"
            value={startValue}
            onChange={(event) => onStartChange(event.target.value)}
            aria-invalid={startError ? true : undefined}
            aria-describedby={startDescribedBy}
          />
          {startError ? (
            <p className="limen-studio__field-error" id={startErrorId} role="alert">{startError}</p>
          ) : null}
          <button
            className="limen-studio__field-reset"
            type="button"
            onClick={onStartReset}
            disabled={startValue === canonicalStartValue}
          >
            Restablecer fecha y hora
          </button>
        </div>
      </div>

      <div className="limen-studio__schedule-field-group limen-studio__schedule-field-group--end">
        <h3>Finalización</h3>
        <div className="limen-studio__field-group">
          <label className="limen-studio__field-label" htmlFor={endInputId}>
            Fecha y hora de finalización
          </label>
          <p className="limen-studio__field-help" id={endHelpId}>
            Definí cuándo termina el evento. Puede finalizar al día siguiente.
          </p>
          <p className="limen-studio__field-time-zone" id={endTimeZoneId}>
            Zona horaria: {timeZone}
          </p>
          <input
            className="limen-studio__datetime-input"
            id={endInputId}
            type="datetime-local"
            value={endValue}
            onChange={(event) => onEndChange(event.target.value)}
            aria-invalid={endError ? true : undefined}
            aria-describedby={endDescribedBy}
          />
          {endError ? (
            <p className="limen-studio__field-error" id={endErrorId} role="alert">{endError}</p>
          ) : null}
          <button
            className="limen-studio__field-reset"
            type="button"
            onClick={onEndReset}
            disabled={endValue === canonicalEndValue}
          >
            Restablecer finalización
          </button>
        </div>
      </div>
    </section>
  )
}
