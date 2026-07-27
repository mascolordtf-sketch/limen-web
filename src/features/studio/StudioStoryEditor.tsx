type StudioStoryEditorProps = {
  eyebrowValue: string
  canonicalEyebrowValue: string
  eyebrowError: string | null
  messageValue: string
  canonicalMessageValue: string
  messageError: string | null
  onEyebrowChange: (value: string) => void
  onEyebrowReset: () => void
  onMessageChange: (value: string) => void
  onMessageReset: () => void
}

const eyebrowId = 'studio-story-eyebrow'
const messageId = 'studio-story-message'

function describedBy(id: string, error: string | null) {
  return error ? `${id}-help ${id}-error` : `${id}-help`
}

export function StudioStoryEditor({
  eyebrowValue, canonicalEyebrowValue, eyebrowError, messageValue,
  canonicalMessageValue, messageError, onEyebrowChange, onEyebrowReset,
  onMessageChange, onMessageReset,
}: StudioStoryEditorProps) {
  return (
    <section className="limen-studio__story-editor" aria-labelledby="studio-story-heading">
      <h2 id="studio-story-heading">Historia</h2>
      <p className="limen-studio__story-intro">
        Editá el relato que acompaña este momento de la invitación.
      </p>

      <div className="limen-studio__story-fields">
        <div className="limen-studio__story-field-group">
          <div className="limen-studio__field-group">
            <label className="limen-studio__field-label" htmlFor={eyebrowId}>
              Texto introductorio
            </label>
            <p className="limen-studio__field-help" id={`${eyebrowId}-help`}>
              Es la frase breve que presenta esta parte de la historia.
            </p>
            <input className="limen-studio__text-input" id={eyebrowId} type="text"
              value={eyebrowValue} onChange={(event) => onEyebrowChange(event.target.value)}
              aria-invalid={eyebrowError ? true : undefined}
              aria-describedby={describedBy(eyebrowId, eyebrowError)} />
            {eyebrowError ? (
              <p className="limen-studio__field-error" id={`${eyebrowId}-error`} role="alert">
                {eyebrowError}
              </p>
            ) : null}
            <button className="limen-studio__field-reset" type="button"
              onClick={onEyebrowReset} disabled={eyebrowValue === canonicalEyebrowValue}>
              Restablecer texto introductorio
            </button>
          </div>
        </div>

        <div className="limen-studio__story-field-group">
          <div className="limen-studio__field-group">
            <label className="limen-studio__field-label" htmlFor={messageId}>Historia</label>
            <p className="limen-studio__field-help" id={`${messageId}-help`}>
              Contá este momento con una voz cercana, emocional y auténtica.
            </p>
            <textarea className="limen-studio__story-textarea" id={messageId}
              value={messageValue} onChange={(event) => onMessageChange(event.target.value)}
              aria-invalid={messageError ? true : undefined}
              aria-describedby={describedBy(messageId, messageError)} />
            {messageError ? (
              <p className="limen-studio__field-error" id={`${messageId}-error`} role="alert">
                {messageError}
              </p>
            ) : null}
            <button className="limen-studio__field-reset" type="button"
              onClick={onMessageReset} disabled={messageValue === canonicalMessageValue}>
              Restablecer historia
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
