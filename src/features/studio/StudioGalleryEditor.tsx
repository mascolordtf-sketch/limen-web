import type { ChangeEvent } from 'react'

type GalleryField = {
  value: string
  error: string | null
  onChange: (value: string) => void
}

type StudioGalleryEditorProps = {
  eyebrow: GalleryField
  heading: GalleryField
  captions: readonly string[]
  copyResetDisabled: boolean
  captionsResetDisabled: boolean
  onCaptionChange: (index: number, value: string) => void
  onCopyReset: () => void
  onCaptionsReset: () => void
}

function RequiredField({ id, label, help, field, multiline = false }: {
  id: string
  label: string
  help: string
  field: GalleryField
  multiline?: boolean
}) {
  const helpId = `${id}-help`
  const errorId = `${id}-error`
  const props = {
    id,
    value: field.value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => field.onChange(event.target.value),
    'aria-invalid': field.error ? true as const : undefined,
    'aria-describedby': field.error ? `${helpId} ${errorId}` : helpId,
  }

  return (
    <div className="limen-studio__field-group">
      <label className="limen-studio__field-label" htmlFor={id}>{label}</label>
      <p className="limen-studio__field-help" id={helpId}>{help}</p>
      {multiline ? (
        <textarea className="limen-studio__event-information-textarea" {...props} />
      ) : (
        <input className="limen-studio__text-input" type="text" {...props} />
      )}
      {field.error ? <p className="limen-studio__field-error" id={errorId} role="alert">{field.error}</p> : null}
    </div>
  )
}

export function StudioGalleryEditor({
  eyebrow, heading, captions, copyResetDisabled, captionsResetDisabled,
  onCaptionChange, onCopyReset, onCaptionsReset,
}: StudioGalleryEditorProps) {
  return (
    <section className="limen-studio__gallery-editor" aria-labelledby="studio-gallery-heading">
      <h2 id="studio-gallery-heading">Galería</h2>
      <p className="limen-studio__gallery-intro">Editá los textos de la galería sin cambiar sus imágenes.</p>

      <div className="limen-studio__gallery-groups">
        <section className="limen-studio__gallery-group" aria-labelledby="studio-gallery-copy-heading">
          <h3 id="studio-gallery-copy-heading">Contenido general</h3>
          <RequiredField id="studio-gallery-eyebrow" label="Texto introductorio"
            help="Es la frase breve que presenta la galería." field={eyebrow} />
          <RequiredField id="studio-gallery-title" label="Título"
            help="Es el mensaje principal que aparece antes de las imágenes." field={heading} multiline />
          <button className="limen-studio__field-reset" type="button" onClick={onCopyReset}
            disabled={copyResetDisabled}>Restablecer contenido general</button>
        </section>

        <section className="limen-studio__gallery-group" aria-labelledby="studio-gallery-captions-heading">
          <h3 id="studio-gallery-captions-heading">Epígrafes</h3>
          {captions.map((caption, index) => {
            const id = `studio-gallery-caption-${index + 1}`
            const helpId = `${id}-help`
            return (
              <div className="limen-studio__field-group" key={id}>
                <label className="limen-studio__field-label" htmlFor={id}>Imagen {index + 1}</label>
                <p className="limen-studio__field-help" id={helpId}>Opcional. Dejalo vacío para ocultarlo.</p>
                <textarea id={id} className="limen-studio__event-information-textarea"
                  value={caption} aria-describedby={helpId}
                  onChange={(event) => onCaptionChange(index, event.target.value)} />
              </div>
            )
          })}
          <button className="limen-studio__field-reset" type="button" onClick={onCaptionsReset}
            disabled={captionsResetDisabled}>Restablecer epígrafes</button>
        </section>
      </div>
    </section>
  )
}
