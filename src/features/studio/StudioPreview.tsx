import type { InvitationAudience } from '../invitations/engine/invitationTypes'
import { Origin01Invitation } from '../invitations/origin01/Origin01Invitation'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'

type Props = {
  invitation: Origin01InvitationData | null
  audience: InvitationAudience
  publicInvitationUrl: string
  previewKey: string
  showing: 'current' | 'last-renderable' | 'unavailable'
  contextualLabel?: string
  onAudienceChange: (audience: InvitationAudience) => void
  onRestart: () => void
  onStructuralIssue: () => void
}

export function StudioAudienceControls({ audience, onAudienceChange }: Pick<Props, 'audience' | 'onAudienceChange'>) {
  return <fieldset className="limen-studio__audience"><legend>Audiencia</legend><div className="limen-studio__audience-options">
    {([['protagonist', 'Protagonista'], ['guest', 'Invitado']] as const).map(([value, label]) =>
      <label className="limen-studio__audience-option" key={value}><input type="radio" name="studio-preview-audience"
        checked={audience === value} onChange={() => onAudienceChange(value)} /><span>{label}</span></label>)}
  </div><p>Cambiar la audiencia reinicia la experiencia desde el comienzo.</p></fieldset>
}

export function StudioPreview({ invitation, audience, publicInvitationUrl, previewKey, showing,
  contextualLabel, onAudienceChange, onRestart, onStructuralIssue }: Props) {
  return <section className="limen-studio__preview-content" aria-labelledby="studio-preview-renderer-title">
    <h2 id="studio-preview-renderer-title">Preview real</h2>
    {contextualLabel && <p><strong>{contextualLabel}</strong></p>}
    <StudioAudienceControls audience={audience} onAudienceChange={onAudienceChange} />
    <button className="limen-studio__action" type="button" onClick={onRestart}>Reiniciar preview</button>
    {showing === 'last-renderable' && <div className="limen-studio__stale-preview" role="status">
      <strong>El cambio actual no puede renderizarse.</strong><p>Mostramos el último borrador renderizable; el cambio inválido no está representado.</p>
      <button type="button" onClick={onStructuralIssue}>Ir al problema estructural</button></div>}
    {invitation ? <div className="limen-studio__preview-shell"><Origin01Invitation key={previewKey}
      invitation={invitation} audience={audience} publicInvitationUrl={publicInvitationUrl} /></div>
      : <div className="limen-studio__preview-unavailable" role="status"><h3>Preview no disponible</h3>
        <p>No existe todavía un borrador estructuralmente renderizable en esta sesión.</p>
        <button type="button" onClick={onStructuralIssue}>Ir al problema estructural</button></div>}
  </section>
}
