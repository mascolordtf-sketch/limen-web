import { useLayoutEffect, useRef, type RefObject } from 'react'
import type { InvitationAudience } from '../invitations/engine/invitationTypes'
import { Origin01Invitation } from '../invitations/origin01/Origin01Invitation'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import type { StudioSceneId } from './studioScenes'
import { getStudioPreviewMode, studioPreviewSceneSelectors } from './studioPreviewScenes'

type Props = {
  invitation: Origin01InvitationData | null
  audience: InvitationAudience
  publicInvitationUrl: string
  previewKey: string
  showing: 'current' | 'last-renderable' | 'unavailable'
  contextualLabel?: string
  previewScene?: StudioSceneId
  onAudienceChange: (audience: InvitationAudience) => void
  onRestart: () => void
  onStructuralIssue: () => void
  headingRef?: RefObject<HTMLHeadingElement | null>
}

export function StudioAudienceControls({ audience, onAudienceChange }: Pick<Props, 'audience' | 'onAudienceChange'>) {
  return <fieldset className="limen-studio__audience"><legend>Audiencia</legend><div className="limen-studio__audience-options">
    {([['protagonist', 'Protagonista'], ['guest', 'Invitado']] as const).map(([value, label]) =>
      <label className="limen-studio__audience-option" key={value}><input type="radio" name="studio-preview-audience"
        checked={audience === value} onChange={() => onAudienceChange(value)} /><span>{label}</span></label>)}
  </div><p>Cambiar la audiencia reinicia la experiencia desde el comienzo.</p></fieldset>
}

function StudioPreviewViewport({ invitation, audience, publicInvitationUrl, previewKey, previewScene }: {
  invitation: Origin01InvitationData
  audience: InvitationAudience
  publicInvitationUrl: string
  previewKey: string
  previewScene?: StudioSceneId
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const mode = getStudioPreviewMode(previewScene)

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const updateScale = () => {
      const availableWidth = Math.max(0, stage.clientWidth - 16)
      const availableHeight = Math.max(0, stage.clientHeight - 16)
      const scale = Math.min(1, availableWidth / 424, availableHeight / 868)
      stage.style.setProperty('--studio-preview-scale', String(scale))
    }
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    if (!previewScene) {
      viewport.scrollTop = 0
      return
    }

    const target = viewport.querySelector<HTMLElement>(studioPreviewSceneSelectors[previewScene])
    if (!target) return
    viewport.scrollTop += target.getBoundingClientRect().top - viewport.getBoundingClientRect().top
  }, [previewScene, previewKey])

  return <div className="limen-studio__preview-device-stage" ref={stageRef}>
    <div className="limen-studio__preview-device" aria-label="Vista previa en un teléfono">
      <span className="limen-studio__preview-device-speaker" aria-hidden="true" />
      <div className="limen-studio__preview-device-screen">
        <div className="limen-studio__preview-shell" ref={viewportRef}><Origin01Invitation
          key={`${previewKey}:${previewScene ?? mode}`} invitation={invitation} audience={audience}
          publicInvitationUrl={publicInvitationUrl} startAtInvitation={mode === 'contextual'} /></div>
      </div>
    </div>
  </div>
}

export function StudioPreview({ invitation, audience, publicInvitationUrl, previewKey, showing,
  contextualLabel, previewScene, onAudienceChange, onRestart, onStructuralIssue, headingRef }: Props) {
  return <section className="limen-studio__preview-content" aria-labelledby="studio-preview-renderer-title">
    <h2 id="studio-preview-renderer-title" ref={headingRef} tabIndex={-1}>Preview real</h2>
    {contextualLabel && <p><strong>{contextualLabel}</strong></p>}
    <StudioAudienceControls audience={audience} onAudienceChange={onAudienceChange} />
    <button className="limen-studio__action" type="button" onClick={onRestart}>Reiniciar preview</button>
    {showing === 'last-renderable' && <div className="limen-studio__stale-preview" role="status">
      <strong>El cambio actual no puede renderizarse.</strong><p>Mostramos el último borrador renderizable; el cambio inválido no está representado.</p>
      <button type="button" onClick={onStructuralIssue}>Ir al problema estructural</button></div>}
    {invitation ? <StudioPreviewViewport invitation={invitation} audience={audience}
      publicInvitationUrl={publicInvitationUrl} previewKey={previewKey} previewScene={previewScene} />
      : <div className="limen-studio__preview-unavailable" role="status"><h3>Preview no disponible</h3>
        <p>No existe todavía un borrador estructuralmente renderizable en esta sesión.</p>
        <button type="button" onClick={onStructuralIssue}>Ir al problema estructural</button></div>}
  </section>
}
