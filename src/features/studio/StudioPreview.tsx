import type { InvitationAudience } from '../invitations/engine/invitationTypes'
import { Origin01Invitation } from '../invitations/origin01/Origin01Invitation'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'

type StudioPreviewProps = {
  invitation: Origin01InvitationData | null
  audience: InvitationAudience
  onAudienceChange: (audience: InvitationAudience) => void
}

const audienceOptions: ReadonlyArray<{ value: InvitationAudience, label: string }> = [
  { value: 'protagonist', label: 'Protagonista' },
  { value: 'guest', label: 'Invitado' },
]

export function StudioPreview({ invitation, audience, onAudienceChange }: StudioPreviewProps) {
  return (
    <section className="limen-studio__preview-section" aria-labelledby="studio-preview-title">
      <div className="limen-studio__preview-heading">
        <h2 id="studio-preview-title">Vista previa real</h2>
        <p>Esta invitación utiliza la configuración temporal de escenas definida arriba.</p>

        <fieldset className="limen-studio__audience">
          <legend className="limen-studio__audience-legend">Vista de la invitación</legend>
          <div className="limen-studio__audience-options">
            {audienceOptions.map((option) => (
              <label className="limen-studio__audience-option" key={option.value}>
                <input
                  type="radio"
                  name="studio-invitation-audience"
                  value={option.value}
                  checked={audience === option.value}
                  onChange={() => onAudienceChange(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {invitation ? (
        <div className="limen-studio__preview-shell">
          <Origin01Invitation invitation={invitation} audience={audience} />
        </div>
      ) : (
        <p className="limen-studio__preview-unavailable" role="status">
          La vista previa no está disponible hasta corregir la configuración.
        </p>
      )}
    </section>
  )
}
