import type { ChangeEvent } from 'react'

type ClosingFieldProps = {
  value: string
  canonicalValue: string
  error: string | null
  onChange: (value: string) => void
  onReset: () => void
}

type StudioClosingEditorProps = {
  eyebrow: ClosingFieldProps
  title: ClosingFieldProps
  sharePrompt: ClosingFieldProps
  shareActionLabel: ClosingFieldProps
}

function describedBy(id: string, error: string | null) {
  return error ? `${id}-help ${id}-error` : `${id}-help`
}

function ClosingField({
  id, label, help, resetLabel, textarea = false, field,
}: {
  id: string
  label: string
  help: string
  resetLabel: string
  textarea?: boolean
  field: ClosingFieldProps
}) {
  const inputProps = {
    id,
    value: field.value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => (
      field.onChange(event.target.value)
    ),
    'aria-invalid': field.error ? true as const : undefined,
    'aria-describedby': describedBy(id, field.error),
  }

  return (
    <div className="limen-studio__closing-field-group">
      <div className="limen-studio__field-group">
        <label className="limen-studio__field-label" htmlFor={id}>{label}</label>
        <p className="limen-studio__field-help" id={`${id}-help`}>{help}</p>
        {textarea ? (
          <textarea className="limen-studio__closing-textarea" {...inputProps} />
        ) : (
          <input className="limen-studio__text-input" type="text" {...inputProps} />
        )}
        {field.error ? (
          <p className="limen-studio__field-error" id={`${id}-error`} role="alert">
            {field.error}
          </p>
        ) : null}
        <button className="limen-studio__field-reset" type="button" onClick={field.onReset}
          disabled={field.value === field.canonicalValue}>
          {resetLabel}
        </button>
      </div>
    </div>
  )
}

export function StudioClosingEditor({
  eyebrow, title, sharePrompt, shareActionLabel,
}: StudioClosingEditorProps) {
  return (
    <section className="limen-studio__closing-editor" aria-labelledby="studio-closing-heading">
      <h2 id="studio-closing-heading">Cierre de la invitación</h2>
      <p className="limen-studio__closing-intro">
        Editá el mensaje final con el que termina la experiencia.
      </p>

      <div className="limen-studio__closing-fields">
        <ClosingField id="studio-closing-eyebrow" label="Texto introductorio"
          help="Es la frase breve que presenta el cierre."
          resetLabel="Restablecer texto introductorio" field={eyebrow} />
        <ClosingField id="studio-closing-title" label="Título"
          help="Es el mensaje principal de despedida."
          resetLabel="Restablecer título" textarea field={title} />
        <ClosingField id="studio-closing-share-prompt" label="Invitación a compartir"
          help="Acompaña la despedida antes de la acción final."
          resetLabel="Restablecer invitación a compartir" textarea field={sharePrompt} />
        <ClosingField id="studio-closing-share-action" label="Texto para compartir"
          help="Es la acción visible que invita a compartir la invitación."
          resetLabel="Restablecer acción" field={shareActionLabel} />
      </div>
    </section>
  )
}
