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
import { createStudioPreviewSurfaceState, isStudioPreviewDedicated, isStudioPreviewEffectivelyCollapsed,
  selectStudioPreviewContextLabel, transitionStudioPreviewSurface } from './studioPreviewSurface'
import { useStudioRenderablePreview } from './useStudioRenderablePreview'
import { getOrigin01StudioDraftSessionId } from './origin01StudioDraft'
import { StudioReviewPanel } from './StudioReviewPanel'
import { createStudioIssueCorrectionContext, resolveStudioCorrectionReturn, resolveStudioIssueDestination,
  issueNeedsCorrectionReturn, resolveStudioStructuralDestination } from './studioReviewIssues'
import type { StudioIssueCorrectionContext } from './studioReviewIssues'
import type { StudioIssue } from './origin01StudioValidation'
import { focusStudioEditorHeading, focusStudioIssueDestination, isStudioPreviewCloseKey, restoreStudioPreviewOpener } from './studioFocus'
import { StudioAestheticStage, StudioStageNavigation } from './StudioWorkspaceStages'
import type { StudioWorkspaceStage } from './studioWorkspaceStages'
import { StudioTemplateStage } from './StudioTemplateStage'
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
  const retained = useStudioRenderablePreview(getOrigin01StudioDraftSessionId(invitation), model.previewInvitation,
    model.validation.structurallyValid)
  const [correctionContext, setCorrectionContext] = useState<StudioIssueCorrectionContext>()
  const [activeStage, setActiveStage] = useState<StudioWorkspaceStage>('template')
  const opener = useRef<HTMLElement | null>(null)
  const scrollPosition = useRef(0)
  const layerTitle = useRef<HTMLHeadingElement>(null)
  const activeDomain = domains.find(({ id }) => id === navigation.domainId)
  const activeItem = activeDomain?.items.find(({ id }) => id === navigation.itemId)
  const publicInvitationUrl = new URL(`/demo/${invitation.code}`, window.location.origin).toString()
  const layerOpen = isStudioPreviewDedicated(surface)
  const previewCollapsed = isStudioPreviewEffectivelyCollapsed(surface)
  const contextualLabel = selectStudioPreviewContextLabel(surface, domains)

  const openPreview = (event?: React.MouseEvent<HTMLElement>) => {
    opener.current = event?.currentTarget ?? document.activeElement as HTMLElement
    scrollPosition.current = window.scrollY
    surfaceDispatch({ type: 'open', viewport: window.matchMedia('(min-width: 64rem)').matches ? 'desktop' : 'mobile',
      origin: navigation, target: activeItem?.previewTarget })
  }
  const closePreview = () => { surfaceDispatch({ type: 'close' }); requestAnimationFrame(() => {
    window.scrollTo({ top: scrollPosition.current }); restoreStudioPreviewOpener(opener.current)
  }) }
  useEffect(() => { if (layerOpen) layerTitle.current?.focus() }, [layerOpen])
  useEffect(() => { if (!layerOpen) return; const escape = (event: KeyboardEvent) => { if (isStudioPreviewCloseKey(event.key)) closePreview() }
    document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape) })

  const openIssue = (issue: StudioIssue) => {
    const destination = resolveStudioIssueDestination(issue, domains)
    if (!destination) return
    setCorrectionContext(issueNeedsCorrectionReturn(issue, destination)
      ? createStudioIssueCorrectionContext(issue) : undefined)
    if (layerOpen) surfaceDispatch({ type: 'close' })
    navigate({ type: 'open-item', domainId: issue.domainId, item: destination })
    requestAnimationFrame(() => requestAnimationFrame(() => {
      focusStudioIssueDestination(issue)
    }))
  }
  const structuralIssue = () => {
    const issue = model.validation.issues.find(({ severity, relevant, blocksPreview }) => severity === 'structural' && relevant && blocksPreview)
    const destination = resolveStudioStructuralDestination(issue, domains)
    if (destination?.kind === 'direct' && issue) openIssue(issue)
    else {
      if (destination) {
        if (layerOpen) surfaceDispatch({ type: 'close' })
        navigate({ type: 'open-item', domainId: destination.domainId, item: destination.item })
        requestAnimationFrame(() => requestAnimationFrame(() => focusStudioEditorHeading()))
      }
    }
  }
  const returnToErrors = () => {
    const errors = correctionContext ? resolveStudioCorrectionReturn(correctionContext, domains) : null
    if (errors) {
      navigate({ type: 'open-item', domainId: 'review', item: errors })
      setCorrectionContext(undefined)
      requestAnimationFrame(() => requestAnimationFrame(() => focusStudioEditorHeading()))
    }
  }
  const reviewPanel = (kind: 'status' | 'errors' | 'audiences') => <StudioReviewPanel kind={kind}
    validation={model.validation} domains={domains} showing={retained.showing} audience={audience.audience}
    onIssue={openIssue} onAudience={audience.changeAudience} onPreview={openPreview} />
  const editor = navigation.editorId ? <StudioActiveEditor invitation={invitation} template={template} model={model}
    editorId={navigation.editorId} reviewPanels={{ 'review-status': reviewPanel('status'), 'review-errors': reviewPanel('errors'),
      'review-audiences': reviewPanel('audiences') }} /> : null
  const preview = <StudioPreview invitation={retained.invitation} audience={audience.audience}
    publicInvitationUrl={publicInvitationUrl} previewKey={audience.previewKey} showing={retained.showing}
    contextualLabel={contextualLabel} onAudienceChange={audience.changeAudience} onRestart={audience.restartPreview}
    onStructuralIssue={structuralIssue} headingRef={layerTitle} />
  const eventDate = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short',
    timeZone: invitation.event.timeZone }).format(new Date(invitation.event.startsAt))

  return <div className="limen-studio"><div className="limen-studio__workspace">
    <header className="limen-studio__header" inert={layerOpen ? true : undefined}><div><p className="limen-studio__eyebrow">LIMEN Studio</p><h1>Espacio interno de composición</h1></div><Link className="limen-studio__back-link" to="/">Volver al sitio</Link></header>
    <div inert={layerOpen ? true : undefined}><StudioStageNavigation activeStage={activeStage} onStageChange={setActiveStage} /></div>
    {template && <div hidden={activeStage !== 'template'}><StudioTemplateStage template={template} /></div>}
    {activeStage === 'aesthetic' && <StudioAestheticStage />}
    <section className="limen-studio__summary" inert={layerOpen ? true : undefined} aria-labelledby="studio-invitation-title"><div className="limen-studio__summary-heading"><p className="limen-studio__eyebrow">Invitación</p><h2 id="studio-invitation-title">{model.draft.protagonistName}</h2><p className="limen-studio__technical">Borrador temporal · Código estable {invitation.code}</p><p className="limen-studio__technical">{model.validation.invitationValid ? 'Invitación válida' : 'Invitación con errores'} · Cambios no persistentes</p></div>
      <dl className="limen-studio__metadata"><div><dt>Evento</dt><dd>{invitation.event.name}</dd></div><div><dt>Celebración</dt><dd>{invitation.event.celebrationLabel}</dd></div><div><dt>Fecha</dt><dd>{eventDate}</dd></div><div><dt>Plantilla</dt><dd>Origin 01 <span>{invitation.templateId}</span></dd></div><div><dt>Estado</dt><dd>{lifecycleLabels[invitation.lifecycleStatus]}</dd></div><div><dt>Módulos configurados</dt><dd>{invitation.modules.length}</dd></div></dl></section>
    <section className="limen-studio__notice" inert={layerOpen ? true : undefined}><h2>Estado del prototipo</h2><p><strong>Prototipo interno sin autenticación. No contiene persistencia.</strong></p><p>Los cambios son temporales y se restablecen al recargar.</p></section>
    <StudioNavigationShell domains={domains} navigation={navigation} validation={model.validation} editor={editor}
      editorResolvable={!navigation.editorId || isStudioEditorId(navigation.editorId)} onNavigate={navigate}
      preview={<div className="limen-studio__embedded-preview"><header><strong>Preview · {audience.audience === 'guest' ? 'Invitado' : 'Protagonista'} · {retained.showing === 'current' ? 'Borrador actual' : retained.showing === 'last-renderable' ? 'Último borrador renderizable' : 'No disponible'}</strong><div>{layerOpen && <button type="button" onClick={closePreview}>← Volver al editor</button>}<button type="button" onClick={audience.restartPreview}>Reiniciar</button>{!layerOpen && <><button type="button" onClick={() => surfaceDispatch({ type: 'collapse' })}>Contraer</button><button type="button" onClick={openPreview}>Expandir</button></>}<a href={publicInvitationUrl}>Abrir demo público</a></div></header>{preview}</div>}
      previewCollapsed={previewCollapsed} previewDedicated={layerOpen}
      previewAudience={audience.audience === 'guest' ? 'Invitado' : 'Protagonista'}
      previewStatus={retained.showing === 'current' ? 'Borrador actual' : retained.showing === 'last-renderable' ? 'Último borrador renderizable' : 'No disponible'}
      onOpenPreview={openPreview} onShowPreview={() => surfaceDispatch({ type: 'show' })}
      correctionReturn={correctionContext !== undefined} onReturnToErrors={returnToErrors} />
  </div></div>
}
