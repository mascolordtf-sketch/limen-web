import { useEffect, useReducer, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { findInvitationTemplate } from '../invitations/engine/templateRegistry'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { StudioNavigationShell } from './StudioNavigationShell'
import { StudioActiveEditor } from './StudioActiveEditor'
import { isStudioEditorId } from './studioEditorContract'
import { createOrigin01StudioDomains } from './origin01StudioConfiguration'
import { useStudioNavigation } from './useStudioNavigation'
import { StudioPreview } from './StudioPreview'
import { useOrigin01StudioModel } from './useOrigin01StudioModel'
import { useStudioPreviewAudience } from './useStudioPreviewAudience'
import { createStudioPreviewSurfaceState, transitionStudioPreviewSurface } from './studioPreviewSurface'
import { createStudioRenderablePreview, retainStudioRenderablePreview } from './studioRenderablePreview'
import { getOrigin01StudioDraftSessionId } from './origin01StudioDraft'
import { StudioReviewPanel } from './StudioReviewPanel'
import { resolveStudioIssueDestination } from './studioReviewIssues'
import type { StudioIssue } from './origin01StudioValidation'
import './studio.css'

const lifecycleLabels = { draft: 'Borrador', awaiting_content: 'Esperando contenido', in_preparation: 'En preparación',
  review: 'En revisión', published: 'Publicada', completed: 'Finalizada', archived: 'Archivada' } as const

export function StudioInvitationPage({ invitation }: { invitation: Origin01InvitationData }) {
  const template = findInvitationTemplate(invitation.templateId)
  const model = useOrigin01StudioModel(invitation)
  const audience = useStudioPreviewAudience('protagonist')
  const domains = createOrigin01StudioDomains(template)
  const [navigation, navigate] = useStudioNavigation(domains)
  const [surface, surfaceDispatch] = useReducer(transitionStudioPreviewSurface, undefined, createStudioPreviewSurfaceState)
  const sessionId = getOrigin01StudioDraftSessionId(invitation)
  const [retained, setRetained] = useState(() => retainStudioRenderablePreview(
    createStudioRenderablePreview<Origin01InvitationData>(), sessionId, model.previewInvitation, model.validation.structurallyValid))
  useEffect(() => {
    const update = window.setTimeout(() => setRetained((current) => retainStudioRenderablePreview(current, sessionId,
      model.previewInvitation, model.validation.structurallyValid)), 0)
    return () => window.clearTimeout(update)
  }, [sessionId, model.previewInvitation, model.validation.structurallyValid])
  const opener = useRef<HTMLElement | null>(null)
  const scrollPosition = useRef(0)
  const layerTitle = useRef<HTMLHeadingElement>(null)
  const activeDomain = domains.find(({ id }) => id === navigation.domainId)
  const activeItem = activeDomain?.items.find(({ id }) => id === navigation.itemId)
  const publicInvitationUrl = new URL(`/demo/${invitation.code}`, window.location.origin).toString()
  const contextualLabel = surface.target && activeItem ? `Revisando: ${activeItem.label}` : undefined
  const layerOpen = surface.mobile === 'full-screen' || surface.desktop === 'expanded'

  const openPreview = (event?: React.MouseEvent<HTMLElement>) => {
    opener.current = event?.currentTarget ?? document.activeElement as HTMLElement
    scrollPosition.current = window.scrollY
    surfaceDispatch({ type: 'open', viewport: window.matchMedia('(min-width: 64rem)').matches ? 'desktop' : 'mobile',
      origin: navigation, target: activeItem?.previewTarget })
  }
  const closePreview = () => { surfaceDispatch({ type: 'close' }); requestAnimationFrame(() => {
    window.scrollTo({ top: scrollPosition.current }); opener.current?.focus()
  }) }
  useEffect(() => { if (layerOpen) layerTitle.current?.focus() }, [layerOpen])
  useEffect(() => { if (!layerOpen) return; const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') closePreview() }
    document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape) })

  const openIssue = (issue: StudioIssue) => {
    const destination = resolveStudioIssueDestination(issue, domains)
    if (!destination) return
    if (layerOpen) surfaceDispatch({ type: 'close' })
    navigate({ type: 'open-item', domainId: issue.domainId, item: destination })
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const field = issue.fieldId ? document.getElementById(issue.fieldId) : null
      ;(field ?? document.querySelector<HTMLElement>('.limen-studio__editor-title'))?.focus()
    }))
  }
  const structuralIssue = () => { const issue = model.validation.issues.find(({ severity }) => severity === 'structural'); if (issue) openIssue(issue) }
  const reviewPanel = (kind: 'status' | 'errors' | 'audiences') => <StudioReviewPanel kind={kind}
    validation={model.validation} domains={domains} showing={retained.showing} audience={audience.audience}
    onIssue={openIssue} onAudience={audience.changeAudience} onPreview={() => openPreview()} />
  const editor = navigation.editorId ? <StudioActiveEditor invitation={invitation} template={template} model={model}
    editorId={navigation.editorId} reviewPanels={{ 'review-status': reviewPanel('status'), 'review-errors': reviewPanel('errors'),
      'review-audiences': reviewPanel('audiences') }} /> : null
  const preview = <StudioPreview invitation={retained.invitation} audience={audience.audience}
    publicInvitationUrl={publicInvitationUrl} previewKey={audience.previewKey} showing={retained.showing}
    contextualLabel={contextualLabel} onAudienceChange={audience.changeAudience} onRestart={audience.restartPreview}
    onStructuralIssue={structuralIssue} />
  const eventDate = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short',
    timeZone: invitation.event.timeZone }).format(new Date(invitation.event.startsAt))

  return <div className="limen-studio"><div className="limen-studio__workspace">
    <header className="limen-studio__header"><div><p className="limen-studio__eyebrow">LIMEN Studio</p><h1>Espacio interno de composición</h1></div><Link className="limen-studio__back-link" to="/">Volver al sitio</Link></header>
    <section className="limen-studio__summary" aria-labelledby="studio-invitation-title"><div className="limen-studio__summary-heading"><p className="limen-studio__eyebrow">Invitación</p><h2 id="studio-invitation-title">{model.draft.protagonistName}</h2><p className="limen-studio__technical">Borrador temporal · Código estable {invitation.code}</p><p className="limen-studio__technical">{model.validation.invitationValid ? 'Invitación válida' : 'Invitación con errores'} · Cambios no persistentes</p></div>
      <dl className="limen-studio__metadata"><div><dt>Evento</dt><dd>{invitation.event.name}</dd></div><div><dt>Celebración</dt><dd>{invitation.event.celebrationLabel}</dd></div><div><dt>Fecha</dt><dd>{eventDate}</dd></div><div><dt>Plantilla</dt><dd>Origin 01 <span>{invitation.templateId}</span></dd></div><div><dt>Estado</dt><dd>{lifecycleLabels[invitation.lifecycleStatus]}</dd></div><div><dt>Módulos configurados</dt><dd>{invitation.modules.length}</dd></div></dl></section>
    <section className="limen-studio__notice"><h2>Estado del prototipo</h2><p><strong>Prototipo interno sin autenticación. No contiene persistencia.</strong></p><p>Los cambios son temporales y se restablecen al recargar.</p></section>
    <StudioNavigationShell domains={domains} navigation={navigation} validation={model.validation} editor={editor}
      editorResolvable={!navigation.editorId || isStudioEditorId(navigation.editorId)} onNavigate={navigate}
      preview={<div className="limen-studio__embedded-preview"><header><strong>Preview · {audience.audience === 'guest' ? 'Invitado' : 'Protagonista'} · {retained.showing === 'current' ? 'Actual' : 'No actual'}</strong><div><button type="button" onClick={audience.restartPreview}>Reiniciar</button><button type="button" onClick={() => surfaceDispatch({ type: 'collapse' })}>Contraer</button><button type="button" onClick={() => surfaceDispatch({ type: 'expand' })}>Expandir</button><a href={publicInvitationUrl}>Abrir demo público</a></div></header>{preview}</div>}
      previewCollapsed={surface.desktop === 'collapsed'} onOpenPreview={openPreview} onShowPreview={() => surfaceDispatch({ type: 'show' })} />
    {layerOpen && <div className="limen-studio__preview-layer" role="dialog" aria-modal="true" aria-labelledby="studio-preview-layer-title"><header><h2 id="studio-preview-layer-title" ref={layerTitle} tabIndex={-1}>Preview real</h2><button type="button" onClick={closePreview}>← Volver al editor</button></header>{preview}</div>}
  </div></div>
}
