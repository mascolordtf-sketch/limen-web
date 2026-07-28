import type { ReactNode } from 'react'

type StudioRsvpEditorProps = {
  mode?: 'complete' | 'editorial' | 'operational'
  titleValue: string
  canonicalTitleValue: string
  titleError: string | null
  descriptionValue: string
  canonicalDescriptionValue: string
  descriptionError: string | null
  actionLabelValue: string
  canonicalActionLabelValue: string
  actionLabelError: string | null
  recipientPhoneValue: string
  canonicalRecipientPhoneValue: string
  recipientPhoneError: string | null
  onTitleChange: (value: string) => void
  onTitleReset: () => void
  onDescriptionChange: (value: string) => void
  onDescriptionReset: () => void
  onActionLabelChange: (value: string) => void
  onActionLabelReset: () => void
  onRecipientPhoneChange: (value: string) => void
  onRecipientPhoneReset: () => void
}

const fields = {
  title: 'studio-rsvp-title',
  description: 'studio-rsvp-description',
  actionLabel: 'studio-rsvp-action-label',
  recipientPhone: 'studio-rsvp-recipient-phone',
} as const

function describedBy(id: string, error: string | null) {
  return error ? `${id}-help ${id}-error` : `${id}-help`
}

type RsvpFieldProps = {
  id: string
  label: string
  help: string
  error: string | null
  resetLabel: string
  resetDisabled: boolean
  onReset: () => void
  children: ReactNode
}

function RsvpField({
  id, label, help, error, resetLabel, resetDisabled, onReset, children,
}: RsvpFieldProps) {
  return (
    <div className="limen-studio__rsvp-field-group">
      <div className="limen-studio__field-group">
        <label className="limen-studio__field-label" htmlFor={id}>{label}</label>
        <p className="limen-studio__field-help" id={`${id}-help`}>{help}</p>
        {children}
        {error ? (
          <p className="limen-studio__field-error" id={`${id}-error`} role="alert">{error}</p>
        ) : null}
        <button
          className="limen-studio__field-reset"
          type="button"
          onClick={onReset}
          disabled={resetDisabled}
        >
          {resetLabel}
        </button>
      </div>
    </div>
  )
}

export function StudioRsvpEditor({
  mode = 'complete',
  titleValue, canonicalTitleValue, titleError, descriptionValue,
  canonicalDescriptionValue, descriptionError, actionLabelValue,
  canonicalActionLabelValue, actionLabelError, recipientPhoneValue,
  canonicalRecipientPhoneValue, recipientPhoneError, onTitleChange, onTitleReset,
  onDescriptionChange, onDescriptionReset, onActionLabelChange, onActionLabelReset,
  onRecipientPhoneChange, onRecipientPhoneReset,
}: StudioRsvpEditorProps) {
  return (
    <section className="limen-studio__rsvp-editor" aria-labelledby="studio-rsvp-heading">
      <h2 id="studio-rsvp-heading">Confirmación de asistencia</h2>
      <p className="limen-studio__rsvp-intro">{mode === 'operational'
        ? 'Definí el destino operativo de las confirmaciones.'
        : 'Definí cómo se presenta la confirmación a los invitados.'}</p>
      <div className="limen-studio__rsvp-fields">
        {mode !== 'operational' && <>
        <RsvpField
          id={fields.title}
          label="Título"
          help="Es el mensaje principal de la sección de confirmación."
          error={titleError}
          resetLabel="Restablecer título"
          resetDisabled={titleValue === canonicalTitleValue}
          onReset={onTitleReset}
        >
          <input className="limen-studio__text-input" id={fields.title} type="text"
            value={titleValue} onChange={(event) => onTitleChange(event.target.value)}
            aria-invalid={titleError ? true : undefined}
            aria-describedby={describedBy(fields.title, titleError)} />
        </RsvpField>

        <RsvpField
          id={fields.description}
          label="Descripción"
          help="Explicá brevemente cómo deben confirmar los invitados."
          error={descriptionError}
          resetLabel="Restablecer descripción"
          resetDisabled={descriptionValue === canonicalDescriptionValue}
          onReset={onDescriptionReset}
        >
          <textarea className="limen-studio__rsvp-textarea" id={fields.description}
            value={descriptionValue} onChange={(event) => onDescriptionChange(event.target.value)}
            aria-invalid={descriptionError ? true : undefined}
            aria-describedby={describedBy(fields.description, descriptionError)} />
        </RsvpField>

        <RsvpField
          id={fields.actionLabel}
          label="Texto del botón"
          help="Es la acción que verán los invitados para confirmar."
          error={actionLabelError}
          resetLabel="Restablecer botón"
          resetDisabled={actionLabelValue === canonicalActionLabelValue}
          onReset={onActionLabelReset}
        >
          <input className="limen-studio__text-input" id={fields.actionLabel} type="text"
            value={actionLabelValue} onChange={(event) => onActionLabelChange(event.target.value)}
            aria-invalid={actionLabelError ? true : undefined}
            aria-describedby={describedBy(fields.actionLabel, actionLabelError)} />
        </RsvpField>
        </>}

        {mode !== 'editorial' &&
        <RsvpField
          id={fields.recipientPhone}
          label="Número de WhatsApp"
          help="Incluí código de país y código de área para que el enlace funcione correctamente."
          error={recipientPhoneError}
          resetLabel="Restablecer destino"
          resetDisabled={recipientPhoneValue === canonicalRecipientPhoneValue}
          onReset={onRecipientPhoneReset}
        >
          <input
            className="limen-studio__text-input limen-studio__rsvp-destination"
            id={fields.recipientPhone}
            type="tel"
            inputMode="tel"
            value={recipientPhoneValue}
            onChange={(event) => onRecipientPhoneChange(event.target.value)}
            aria-invalid={recipientPhoneError ? true : undefined}
            aria-describedby={describedBy(fields.recipientPhone, recipientPhoneError)}
          />
        </RsvpField>}
      </div>
    </section>
  )
}
