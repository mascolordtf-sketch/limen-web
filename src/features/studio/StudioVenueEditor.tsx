type StudioVenueEditorProps = {
  value: string
  canonicalValue: string
  error: string | null
  onChange: (value: string) => void
  onReset: () => void
}

const inputId = 'studio-event-venue'
const helpId = 'studio-event-venue-help'
const errorId = 'studio-event-venue-error'

export function StudioVenueEditor({
  value, canonicalValue, error, onChange, onReset,
}: StudioVenueEditorProps) {
  const describedBy = error ? `${helpId} ${errorId}` : helpId

  return (
    <section className="limen-studio__venue-editor" aria-labelledby="studio-venue-title">
      <h2 id="studio-venue-title">Lugar del evento</h2>
      <div className="limen-studio__field-group">
        <label className="limen-studio__field-label" htmlFor={inputId}>
          Nombre del lugar
        </label>
        <p className="limen-studio__field-help" id={helpId}>
          Este cambio es temporal y solo afecta la vista previa.
        </p>
        <input
          className="limen-studio__text-input"
          id={inputId}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        {error ? (
          <p className="limen-studio__field-error" id={errorId} role="alert">{error}</p>
        ) : null}
        <button
          className="limen-studio__field-reset"
          type="button"
          onClick={onReset}
          disabled={value === canonicalValue}
        >
          Restablecer lugar
        </button>
      </div>
    </section>
  )
}
