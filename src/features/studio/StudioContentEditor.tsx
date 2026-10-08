type StudioContentEditorProps = {
  value: string
  canonicalValue: string
  error: string | null
  onChange: (value: string) => void
  onReset: () => void
}

const protagonistInputId = 'studio-protagonist-name'

export function StudioContentEditor({
  value,
  canonicalValue,
  error,
  onChange,
  onReset,
}: StudioContentEditorProps) {
  return (
    <section className="limen-studio__content-editor" aria-labelledby="studio-content-title">
      <h2 id="studio-content-title">Identidad pública</h2>
      <div className="limen-studio__field-group">
        <label className="limen-studio__field-label" htmlFor={protagonistInputId}>
          Nombre de la protagonista
        </label>
        <p className="limen-studio__field-help" id={`${protagonistInputId}-help`}>
          Es público y se reutiliza en los textos principales de la invitación.
        </p>
        <input
          className="limen-studio__text-input"
          id={protagonistInputId}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error
            ? `${protagonistInputId}-help ${protagonistInputId}-error`
            : `${protagonistInputId}-help`}
        />
        {error ? (
          <p className="limen-studio__field-error" id={`${protagonistInputId}-error`} role="alert">
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
