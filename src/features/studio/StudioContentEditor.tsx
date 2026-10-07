type StudioContentEditorProps = {
  managementName: string
  canonicalManagementName: string
  managementNameError: string | null
  value: string
  canonicalValue: string
  error: string | null
  onManagementNameChange: (value: string) => void
  onManagementNameReset: () => void
  onChange: (value: string) => void
  onReset: () => void
}

const managementInputId = 'studio-management-name'
const protagonistInputId = 'studio-protagonist-name'

export function StudioContentEditor({
  managementName,
  canonicalManagementName,
  managementNameError,
  value,
  canonicalValue,
  error,
  onManagementNameChange,
  onManagementNameReset,
  onChange,
  onReset,
}: StudioContentEditorProps) {
  return (
    <section className="limen-studio__content-editor" aria-labelledby="studio-content-title">
      <h2 id="studio-content-title">Identidad y organización</h2>
      <div className="limen-studio__field-group">
        <label className="limen-studio__field-label" htmlFor={managementInputId}>
          Nombre de gestión
        </label>
        <p className="limen-studio__field-help" id={`${managementInputId}-help`}>
          Es privado: sirve para encontrar y ordenar esta invitación en Studio. No se muestra públicamente.
        </p>
        <input
          className="limen-studio__text-input"
          id={managementInputId}
          type="text"
          value={managementName}
          maxLength={120}
          onChange={(event) => onManagementNameChange(event.target.value)}
          aria-invalid={managementNameError ? true : undefined}
          aria-describedby={managementNameError
            ? `${managementInputId}-help ${managementInputId}-error`
            : `${managementInputId}-help`}
        />
        {managementNameError ? (
          <p className="limen-studio__field-error" id={`${managementInputId}-error`} role="alert">
            {managementNameError}
          </p>
        ) : null}
        <button className="limen-studio__field-reset" type="button" onClick={onManagementNameReset}
          disabled={managementName === canonicalManagementName}>
          Restablecer nombre de gestión
        </button>
      </div>
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
