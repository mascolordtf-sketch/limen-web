type StudioDressCodeEditorProps = {
  titleValue: string
  canonicalTitleValue: string
  titleError: string | null
  descriptionValue: string
  canonicalDescriptionValue: string
  descriptionError: string | null
  noteValue: string
  canonicalNoteValue: string
  noteError: string | null
  onTitleChange: (value: string) => void
  onTitleReset: () => void
  onDescriptionChange: (value: string) => void
  onDescriptionReset: () => void
  onNoteChange: (value: string) => void
  onNoteReset: () => void
}

const fields = {
  title: {
    inputId: 'studio-dress-code-title',
    helpId: 'studio-dress-code-title-help',
    errorId: 'studio-dress-code-title-error',
  },
  description: {
    inputId: 'studio-dress-code-description',
    helpId: 'studio-dress-code-description-help',
    errorId: 'studio-dress-code-description-error',
  },
  note: {
    inputId: 'studio-dress-code-note',
    helpId: 'studio-dress-code-note-help',
    errorId: 'studio-dress-code-note-error',
  },
} as const

function describedBy(helpId: string, errorId: string, error: string | null) {
  return error ? `${helpId} ${errorId}` : helpId
}

export function StudioDressCodeEditor({
  titleValue,
  canonicalTitleValue,
  titleError,
  descriptionValue,
  canonicalDescriptionValue,
  descriptionError,
  noteValue,
  canonicalNoteValue,
  noteError,
  onTitleChange,
  onTitleReset,
  onDescriptionChange,
  onDescriptionReset,
  onNoteChange,
  onNoteReset,
}: StudioDressCodeEditorProps) {
  return (
    <section className="limen-studio__dress-code-editor" aria-labelledby="studio-dress-code-heading">
      <h2 id="studio-dress-code-heading">Dress Code</h2>
      <p className="limen-studio__dress-code-intro">
        Definí cómo querés comunicar la vestimenta sugerida para el evento.
      </p>

      <div className="limen-studio__dress-code-fields">
        <div className="limen-studio__dress-code-field-group">
          <div className="limen-studio__field-group">
            <label className="limen-studio__field-label" htmlFor={fields.title.inputId}>
              Tipo de vestimenta
            </label>
            <p className="limen-studio__field-help" id={fields.title.helpId}>
              Es el texto principal que verán los invitados.
            </p>
            <input
              className="limen-studio__text-input"
              id={fields.title.inputId}
              type="text"
              value={titleValue}
              onChange={(event) => onTitleChange(event.target.value)}
              aria-invalid={titleError ? true : undefined}
              aria-describedby={describedBy(fields.title.helpId, fields.title.errorId, titleError)}
            />
            {titleError ? (
              <p className="limen-studio__field-error" id={fields.title.errorId} role="alert">
                {titleError}
              </p>
            ) : null}
            <button
              className="limen-studio__field-reset"
              type="button"
              onClick={onTitleReset}
              disabled={titleValue === canonicalTitleValue}
            >
              Restablecer tipo
            </button>
          </div>
        </div>

        <div className="limen-studio__dress-code-field-group">
          <div className="limen-studio__field-group">
            <label className="limen-studio__field-label" htmlFor={fields.description.inputId}>
              Descripción
            </label>
            <p className="limen-studio__field-help" id={fields.description.helpId}>
              Explicá brevemente qué estilo esperás para la celebración.
            </p>
            <textarea
              className="limen-studio__dress-code-textarea"
              id={fields.description.inputId}
              value={descriptionValue}
              onChange={(event) => onDescriptionChange(event.target.value)}
              aria-invalid={descriptionError ? true : undefined}
              aria-describedby={describedBy(
                fields.description.helpId,
                fields.description.errorId,
                descriptionError,
              )}
            />
            {descriptionError ? (
              <p
                className="limen-studio__field-error"
                id={fields.description.errorId}
                role="alert"
              >
                {descriptionError}
              </p>
            ) : null}
            <button
              className="limen-studio__field-reset"
              type="button"
              onClick={onDescriptionReset}
              disabled={descriptionValue === canonicalDescriptionValue}
            >
              Restablecer descripción
            </button>
          </div>
        </div>

        <div className="limen-studio__dress-code-field-group">
          <div className="limen-studio__field-group">
            <label className="limen-studio__field-label" htmlFor={fields.note.inputId}>
              Nota destacada
            </label>
            <p className="limen-studio__field-help" id={fields.note.helpId}>
              Una frase breve que acompaña el mensaje principal.
            </p>
            <textarea
              className="limen-studio__dress-code-textarea limen-studio__dress-code-textarea--note"
              id={fields.note.inputId}
              value={noteValue}
              onChange={(event) => onNoteChange(event.target.value)}
              aria-invalid={noteError ? true : undefined}
              aria-describedby={describedBy(fields.note.helpId, fields.note.errorId, noteError)}
            />
            {noteError ? (
              <p className="limen-studio__field-error" id={fields.note.errorId} role="alert">
                {noteError}
              </p>
            ) : null}
            <button
              className="limen-studio__field-reset"
              type="button"
              onClick={onNoteReset}
              disabled={noteValue === canonicalNoteValue}
            >
              Restablecer nota
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
