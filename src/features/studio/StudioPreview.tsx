import { Origin01Invitation } from '../invitations/origin01/Origin01Invitation'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'

type StudioPreviewProps = {
  invitation: Origin01InvitationData | null
}

export function StudioPreview({ invitation }: StudioPreviewProps) {
  return (
    <section className="limen-studio__preview-section" aria-labelledby="studio-preview-title">
      <div className="limen-studio__preview-heading">
        <h2 id="studio-preview-title">Vista previa real</h2>
        <p>Esta invitación utiliza la configuración temporal de escenas definida arriba.</p>
      </div>

      {invitation ? (
        <div className="limen-studio__preview-shell">
          <Origin01Invitation invitation={invitation} audience="protagonist" />
        </div>
      ) : (
        <p className="limen-studio__preview-unavailable" role="status">
          La vista previa no está disponible hasta corregir la configuración.
        </p>
      )}
    </section>
  )
}
