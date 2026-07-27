import type { ChangeEvent } from 'react'

type OpeningFieldProps = {
  value: string
  canonicalValue: string
  error: string | null
  onChange: (value: string) => void
  onReset: () => void
}

type StudioOpeningEditorProps = {
  preludeEyebrow: OpeningFieldProps
  preludeBody: OpeningFieldProps
  preludeReveal: OpeningFieldProps
  preludeQuestion: OpeningFieldProps
  preludeActionLabel: OpeningFieldProps
  preludeSoundHint: OpeningFieldProps
  heroPhrase: OpeningFieldProps
  heroScrollHint: OpeningFieldProps
}

function describedBy(id: string, error: string | null) {
  return error ? `${id}-help ${id}-error` : `${id}-help`
}

function OpeningField({
  id, label, help, resetLabel, textarea = false, field,
}: {
  id: string
  label: string
  help: string
  resetLabel: string
  textarea?: boolean
  field: OpeningFieldProps
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
    <div className="limen-studio__opening-field-group">
      <div className="limen-studio__field-group">
        <label className="limen-studio__field-label" htmlFor={id}>{label}</label>
        <p className="limen-studio__field-help" id={`${id}-help`}>{help}</p>
        {textarea ? (
          <textarea className="limen-studio__opening-textarea" {...inputProps} />
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

export function StudioOpeningEditor({
  preludeEyebrow, preludeBody, preludeReveal, preludeQuestion, preludeActionLabel,
  preludeSoundHint, heroPhrase, heroScrollHint,
}: StudioOpeningEditorProps) {
  return (
    <section className="limen-studio__opening-editor" aria-labelledby="studio-opening-heading">
      <h2 id="studio-opening-heading">Apertura de la invitación</h2>
      <p className="limen-studio__opening-intro">
        Editá los textos que presentan la experiencia antes de entrar al contenido principal.
      </p>

      <div className="limen-studio__opening-groups">
        <section className="limen-studio__opening-group" aria-labelledby="studio-prelude-heading">
          <h3 id="studio-prelude-heading">Preludio</h3>
          <OpeningField id="studio-opening-prelude-eyebrow" label="Texto introductorio"
            help="Es la frase breve que prepara el ingreso a la invitación."
            resetLabel="Restablecer texto introductorio" field={preludeEyebrow} />
          <OpeningField id="studio-opening-prelude-body" label="Mensaje de apertura"
            help="Acompaña el saludo inicial antes de revelar la invitación."
            resetLabel="Restablecer mensaje" textarea field={preludeBody} />
          <OpeningField id="studio-opening-prelude-reveal" label="Texto de revelación"
            help="Presenta la invitación después del mensaje de apertura."
            resetLabel="Restablecer revelación" field={preludeReveal} />
          <OpeningField id="studio-opening-prelude-question" label="Pregunta de entrada"
            help="Invita a la protagonista a dar el siguiente paso."
            resetLabel="Restablecer pregunta" field={preludeQuestion} />
          <OpeningField id="studio-opening-prelude-action" label="Texto de la acción"
            help="Es la invitación que impulsa a continuar."
            resetLabel="Restablecer acción" field={preludeActionLabel} />
          <OpeningField id="studio-opening-prelude-sound" label="Indicación de sonido"
            help="Anticipa qué sucede con el sonido al continuar."
            resetLabel="Restablecer indicación de sonido" field={preludeSoundHint} />
        </section>

        <section className="limen-studio__opening-group" aria-labelledby="studio-hero-heading">
          <h3 id="studio-hero-heading">Portada principal</h3>
          <OpeningField id="studio-opening-hero-phrase" label="Título principal"
            help="Es el mensaje central de la portada."
            resetLabel="Restablecer título" textarea field={heroPhrase} />
          <OpeningField id="studio-opening-hero-scroll" label="Texto de desplazamiento"
            help="Indica cómo continuar para descubrir el resto de la invitación."
            resetLabel="Restablecer texto de desplazamiento" field={heroScrollHint} />
        </section>
      </div>
    </section>
  )
}
