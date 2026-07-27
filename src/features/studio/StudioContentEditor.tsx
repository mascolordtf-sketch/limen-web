type StudioContentEditorProps = {
  value: string
  canonicalValue: string
  error: string | null
  onChange: (value: string) => void
  onReset: () => void
}

const inputId = 'studio-protagonist-name'
const helpId = 'studio-protagonist-name-help'
const errorId = 'studio-protagonist-name-error'

export function StudioContentEditor({
  value,
  canonicalValue,
  error,
  onChange,
  onReset,
}: StudioContentEditorProps) {
  return (
    <section className="limen-studio__content-editor" aria-labelledby="studio-content-title">
      <h2 id="studio-content-title">Contenido principal</h2>
      <div className="limen-studio__field-group">
        <label className="limen-studio__field-label" htmlFor={inputId}>
          Nombre de la protagonista
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
          aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        />
        {error ? (
          <p className="limen-studio__field-error" id={errorId}>
            {error}
          </p>
        ) : null}
        <button
          className="limen-studio__field-reset"
          type="button"
          onClick={onReset}
          disabled={value === canonicalValue}
        >
          Restablecer nombre
        </button>
      </div>
    </section>
  )
}
