type StudioEventLocationEditorProps = {
  venueValue: string
  canonicalVenueValue: string
  venueError: string | null
  addressValue: string
  canonicalAddressValue: string
  addressError: string | null
  onVenueChange: (value: string) => void
  onVenueReset: () => void
  onAddressChange: (value: string) => void
  onAddressReset: () => void
}

const venueInputId = 'studio-event-venue'
const venueHelpId = 'studio-event-venue-help'
const venueErrorId = 'studio-event-venue-error'
const addressInputId = 'studio-event-address'
const addressHelpId = 'studio-event-address-help'
const addressErrorId = 'studio-event-address-error'

export function StudioEventLocationEditor({
  venueValue,
  canonicalVenueValue,
  venueError,
  addressValue,
  canonicalAddressValue,
  addressError,
  onVenueChange,
  onVenueReset,
  onAddressChange,
  onAddressReset,
}: StudioEventLocationEditorProps) {
  const venueDescribedBy = venueError ? `${venueHelpId} ${venueErrorId}` : venueHelpId
  const addressDescribedBy = addressError ? `${addressHelpId} ${addressErrorId}` : addressHelpId

  return (
    <section className="limen-studio__event-location-editor" aria-labelledby="studio-location-title">
      <h2 id="studio-location-title">Ubicación del evento</h2>
      <p>Definí el lugar y la dirección que verán los invitados.</p>

      <div className="limen-studio__location-fields">
        <div className="limen-studio__location-field-group">
          <h3>Lugar</h3>
          <div className="limen-studio__field-group">
            <label className="limen-studio__field-label" htmlFor={venueInputId}>
              Nombre del lugar
            </label>
            <p className="limen-studio__field-help" id={venueHelpId}>
              Nombre del salón, espacio o establecimiento.
            </p>
            <input
              className="limen-studio__text-input"
              id={venueInputId}
              type="text"
              value={venueValue}
              onChange={(event) => onVenueChange(event.target.value)}
              aria-invalid={venueError ? true : undefined}
              aria-describedby={venueDescribedBy}
            />
            {venueError ? (
              <p className="limen-studio__field-error" id={venueErrorId} role="alert">
                {venueError}
              </p>
            ) : null}
            <button
              className="limen-studio__field-reset"
              type="button"
              onClick={onVenueReset}
              disabled={venueValue === canonicalVenueValue}
            >
              Restablecer lugar
            </button>
          </div>
        </div>

        <div className="limen-studio__location-field-group">
          <h3>Dirección</h3>
          <div className="limen-studio__field-group">
            <label className="limen-studio__field-label" htmlFor={addressInputId}>
              Dirección del evento
            </label>
            <p className="limen-studio__field-help" id={addressHelpId}>
              Usá una dirección suficientemente clara para abrirla en el mapa.
            </p>
            <input
              className="limen-studio__text-input"
              id={addressInputId}
              type="text"
              value={addressValue}
              onChange={(event) => onAddressChange(event.target.value)}
              aria-invalid={addressError ? true : undefined}
              aria-describedby={addressDescribedBy}
            />
            {addressError ? (
              <p className="limen-studio__field-error" id={addressErrorId} role="alert">
                {addressError}
              </p>
            ) : null}
            <button
              className="limen-studio__field-reset"
              type="button"
              onClick={onAddressReset}
              disabled={addressValue === canonicalAddressValue}
            >
              Restablecer dirección
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
