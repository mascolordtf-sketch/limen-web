import type { ReactNode } from 'react'

type StudioGiftsEditorProps = {
  mode?: 'complete' | 'editorial' | 'operational'
  titleValue: string
  canonicalTitleValue: string
  titleError: string | null
  descriptionValue: string
  canonicalDescriptionValue: string
  descriptionError: string | null
  noteValue: string
  canonicalNoteValue: string
  noteError: string | null
  accountValue: string
  canonicalAccountValue: string
  accountError: string | null
  onTitleChange: (value: string) => void
  onTitleReset: () => void
  onDescriptionChange: (value: string) => void
  onDescriptionReset: () => void
  onNoteChange: (value: string) => void
  onNoteReset: () => void
  onAccountChange: (value: string) => void
  onAccountReset: () => void
}

const fields = {
  title: 'studio-gifts-title',
  description: 'studio-gifts-description',
  note: 'studio-gifts-note',
  account: 'studio-gifts-account',
} as const

function describedBy(id: string, error: string | null) {
  return error ? `${id}-help ${id}-error` : `${id}-help`
}

type GiftsFieldProps = {
  id: string
  label: string
  help: string
  error: string | null
  resetLabel: string
  resetDisabled: boolean
  onReset: () => void
  children: ReactNode
}

function GiftsField({
  id, label, help, error, resetLabel, resetDisabled, onReset, children,
}: GiftsFieldProps) {
  return (
    <div className="limen-studio__gifts-field-group">
      <div className="limen-studio__field-group">
        <label className="limen-studio__field-label" htmlFor={id}>{label}</label>
        <p className="limen-studio__field-help" id={`${id}-help`}>{help}</p>
        {children}
        {error ? (
          <p className="limen-studio__field-error" id={`${id}-error`} role="alert">{error}</p>
        ) : null}
        <button className="limen-studio__field-reset" type="button" onClick={onReset}
          disabled={resetDisabled}>
          {resetLabel}
        </button>
      </div>
    </div>
  )
}

export function StudioGiftsEditor({
  mode = 'complete',
  titleValue, canonicalTitleValue, titleError, descriptionValue,
  canonicalDescriptionValue, descriptionError, noteValue, canonicalNoteValue,
  noteError, accountValue, canonicalAccountValue, accountError, onTitleChange,
  onTitleReset, onDescriptionChange, onDescriptionReset, onNoteChange,
  onNoteReset, onAccountChange, onAccountReset,
}: StudioGiftsEditorProps) {
  return (
    <section className="limen-studio__gifts-editor" aria-labelledby="studio-gifts-heading">
      <h2 id="studio-gifts-heading">Regalos</h2>
      <p className="limen-studio__gifts-intro">{mode === 'operational'
        ? 'Definí el dato operativo que usarán los invitados para regalar.'
        : 'Definí el contenido editorial que verán los invitados.'}</p>
      <div className="limen-studio__gifts-fields">
        {mode !== 'operational' && <>
        <GiftsField id={fields.title} label="Título"
          help="Es el mensaje principal de la sección de regalos." error={titleError}
          resetLabel="Restablecer título" resetDisabled={titleValue === canonicalTitleValue}
          onReset={onTitleReset}>
          <input className="limen-studio__text-input" id={fields.title} type="text"
            value={titleValue} onChange={(event) => onTitleChange(event.target.value)}
            aria-invalid={titleError ? true : undefined}
            aria-describedby={describedBy(fields.title, titleError)} />
        </GiftsField>

        <GiftsField id={fields.description} label="Descripción"
          help="Explicá con calidez cómo pueden acompañar a la protagonista."
          error={descriptionError} resetLabel="Restablecer descripción"
          resetDisabled={descriptionValue === canonicalDescriptionValue}
          onReset={onDescriptionReset}>
          <textarea className="limen-studio__gifts-textarea" id={fields.description}
            value={descriptionValue} onChange={(event) => onDescriptionChange(event.target.value)}
            aria-invalid={descriptionError ? true : undefined}
            aria-describedby={describedBy(fields.description, descriptionError)} />
        </GiftsField>

        <GiftsField id={fields.note} label="Nota destacada"
          help="Una frase breve que acompaña la propuesta de regalos." error={noteError}
          resetLabel="Restablecer nota" resetDisabled={noteValue === canonicalNoteValue}
          onReset={onNoteReset}>
          <textarea className="limen-studio__gifts-textarea limen-studio__gifts-textarea--note"
            id={fields.note} value={noteValue}
            onChange={(event) => onNoteChange(event.target.value)}
            aria-invalid={noteError ? true : undefined}
            aria-describedby={describedBy(fields.note, noteError)} />
        </GiftsField>
        </>}

        {mode !== 'editorial' &&
        <GiftsField id={fields.account} label="Alias"
          help="Es el dato que se mostrará o copiará desde la invitación." error={accountError}
          resetLabel="Restablecer dato" resetDisabled={accountValue === canonicalAccountValue}
          onReset={onAccountReset}>
          <input className="limen-studio__text-input limen-studio__gifts-destination"
            id={fields.account} type="text" value={accountValue}
            onChange={(event) => onAccountChange(event.target.value)}
            aria-invalid={accountError ? true : undefined}
            aria-describedby={describedBy(fields.account, accountError)} />
        </GiftsField>}
      </div>
    </section>
  )
}
