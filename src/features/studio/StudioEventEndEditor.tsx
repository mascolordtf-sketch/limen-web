type StudioEventEndEditorProps = {
  value: string
  canonicalValue: string
  timeZone: string
  error: string | null
  onChange: (value: string) => void
  onReset: () => void
}

const inputId = 'studio-event-end'
const helpId = 'studio-event-end-help'
const timeZoneId = 'studio-event-end-time-zone'
const errorId = 'studio-event-end-error'

export function StudioEventEndEditor({
  value, canonicalValue, timeZone, error, onChange, onReset,
}: StudioEventEndEditorProps) {
  const describedBy = error
    ? `${helpId} ${timeZoneId} ${errorId}`
    : `${helpId} ${timeZoneId}`

  return (
    <section className="limen-studio__event-end-editor" aria-labelledby="studio-event-end-title">
      <h2 id="studio-event-end-title">Finalización del evento</h2>
      <div className="limen-studio__field-group">
        <label className="limen-studio__field-label" htmlFor={inputId}>
          Fecha y hora de finalización
        </label>
        <p className="limen-studio__field-help" id={helpId}>
          Definí cuándo termina el evento. Puede finalizar al día siguiente.
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
          Restablecer finalización
        </button>
      </div>
    </section>
  )
}
