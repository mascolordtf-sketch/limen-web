import type { StudioShareMode } from './studioNavigation'

type StudioShareEditorProps = {
  mode: StudioShareMode
  defaultMessage: string
  customMessage: string
  error: string | null
  resetDisabled: boolean
  onModeChange: (mode: StudioShareMode) => void
  onCustomMessageChange: (message: string) => void
  onReset: () => void
}

const textareaId = 'studio-custom-share-message'
const helpId = 'studio-custom-share-message-help'
const errorId = 'studio-custom-share-message-error'

export function StudioShareEditor({
  mode,
  defaultMessage,
  customMessage,
  error,
  resetDisabled,
  onModeChange,
  onCustomMessageChange,
  onReset,
}: StudioShareEditorProps) {
  return (
    <section className="limen-studio__share-editor" aria-labelledby="studio-share-title">
      <h2 id="studio-share-title">Compartir invitación</h2>
      <fieldset className="limen-studio__share-options">
        <legend>Mensaje para compartir</legend>
        <div className="limen-studio__share-radio-group">
          <label>
            <input
              type="radio"
              name="studio-share-mode"
              checked={mode === 'default'}
              onChange={() => onModeChange('default')}
            />
            <span>Mensaje sugerido por LIMEN</span>
          </label>
          <label>
            <input
              type="radio"
              name="studio-share-mode"
              checked={mode === 'custom'}
              onChange={() => onModeChange('custom')}
            />
            <span>Mensaje personalizado</span>
          </label>
        </div>
      </fieldset>

      {mode === 'default' ? (
        <p className="limen-studio__message-preview">{defaultMessage}</p>
      ) : (
        <div className="limen-studio__field-group">
          <label className="limen-studio__field-label" htmlFor={textareaId}>Mensaje personalizado</label>
          <p className="limen-studio__field-help" id={helpId}>
            Escribí el texto que acompañará el enlace público de la invitación.
          </p>
          <textarea
            className="limen-studio__share-textarea"
            id={textareaId}
            value={customMessage}
            onChange={(event) => onCustomMessageChange(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${helpId} ${errorId}` : helpId}
          />
          {error ? <p className="limen-studio__field-error" id={errorId}>{error}</p> : null}
        </div>
      )}

      <p className="limen-studio__share-link-help">
        El enlace público de la invitación se agrega automáticamente.
      </p>
      <button
        className="limen-studio__field-reset"
        type="button"
        onClick={onReset}
        disabled={resetDisabled}
      >
        Restablecer mensaje
      </button>
    </section>
  )
}
