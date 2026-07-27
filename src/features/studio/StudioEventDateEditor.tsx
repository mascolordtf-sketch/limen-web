type StudioEventDateEditorProps = {
  value: string
  canonicalValue: string
  timeZone: string
  error: string | null
  onChange: (value: string) => void
  onReset: () => void
}

const inputId = 'studio-event-start'
const helpId = 'studio-event-start-help'
const timeZoneId = 'studio-event-start-time-zone'
const errorId = 'studio-event-start-error'

export function StudioEventDateEditor({
  value, canonicalValue, timeZone, error, onChange, onReset,
}: StudioEventDateEditorProps) {
  const describedBy = error
    ? `${helpId} ${timeZoneId} ${errorId}`
    : `${helpId} ${timeZoneId}`

  return (
    <section className="limen-studio__event-date-editor" aria-labelledby="studio-event-date-title">
      <h2 id="studio-event-date-title">Fecha y hora del evento</h2>
      <div className="limen-studio__field-group">
        <label className="limen-studio__field-label" htmlFor={inputId}>Fecha y hora del evento</label>
        <p className="limen-studio__field-help" id={helpId}>
          Este cambio es temporal y se interpreta en la zona horaria de la invitación.
        </p>
        <p className="limen-studio__field-time-zone" id={timeZoneId}>Zona horaria: {timeZone}</p>
        <input
          className="limen-studio__datetime-input"
          id={inputId}
          type="datetime-local"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        {error ? <p className="limen-studio__field-error" id={errorId} role="alert">{error}</p> : null}
        <button
          className="limen-studio__field-reset"
          type="button"
          onClick={onReset}
          disabled={value === canonicalValue}
        >
          Restablecer fecha y hora
        </button>
      </div>
    </section>
  )
}
