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
import { StudioDesignStage, StudioSectionsStage, StudioStageNavigation } from './StudioWorkspaceStages'
import type { StudioWorkspaceStage } from './studioWorkspaceStages'
import { StudioWorkspaceFrame } from './StudioWorkspaceFrame'
import type { StudioPreviewMode } from './StudioWorkspaceFrame'
import { createInitialStudioNavigation, isStudioNavigationAvailable, resolveStudioNavigationForDomains,
  transitionStudioNavigation } from './studioNavigation'
import './studio.css'

const lifecycleLabels = { draft: 'Borrador', awaiting_content: 'Esperando contenido', in_preparation: 'En preparación',
  review: 'En revisión', published: 'Publicada', completed: 'Finalizada', archived: 'Archivada' } as const

export function StudioInvitationPage({ invitation }: { invitation: Origin01InvitationData }) {
  const template = findInvitationTemplate(invitation.templateId)
  const model = useOrigin01StudioModel(invitation)
  const audience = useStudioPreviewAudience('protagonist')
  const domains = createOrigin01StudioDomains(template)
  const contentDomains = domains.filter(({ id }) => id !== 'review')
  const [navigation, dispatchNavigation] = useStudioNavigation(domains)
  const [surface, surfaceDispatch] = useReducer(transitionStudioPreviewSurface, undefined, createStudioPreviewSurfaceState)
  const retained = useStudioRenderablePreview(getOrigin01StudioDraftSessionId(invitation), model.previewInvitation,
    model.validation.structurallyValid)
  const [correctionContext, setCorrectionContext] = useState<StudioIssueCorrectionContext>()
  const [activeStage, setActiveStage] = useState<StudioWorkspaceStage>('design')
  const opener = useRef<HTMLElement | null>(null)
  const scrollPosition = useRef(0)
  const layerTitle = useRef<HTMLHeadingElement>(null)
  const [lastContentNavigation, setLastContentNavigation] = useState(() => createInitialStudioNavigation(contentDomains))
  const contentNavigation = resolveStudioNavigationForDomains(navigation, contentDomains, lastContentNavigation)
  const navigate = (action: Parameters<typeof dispatchNavigation>[0]) => {
    const nextNavigation = transitionStudioNavigation(navigation, action)
    if (isStudioNavigationAvailable(nextNavigation, contentDomains)) setLastContentNavigation(nextNavigation)
    dispatchNavigation(action)
  }
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
    setActiveStage('content')
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
        setActiveStage('content')
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
      setActiveStage('review')
      setCorrectionContext(undefined)
      requestAnimationFrame(() => requestAnimationFrame(() => focusStudioEditorHeading()))
    }
  }
  const reviewPanel = (kind: 'status' | 'errors' | 'audiences') => <StudioReviewPanel kind={kind}
    validation={model.validation} domains={domains} showing={retained.showing} audience={audience.audience}
    onIssue={openIssue} onAudience={audience.changeAudience} onPreview={openPreview} />
  const editor = contentNavigation.editorId ? <StudioActiveEditor invitation={invitation} template={template} model={model}
    editorId={contentNavigation.editorId} reviewPanels={{ 'review-status': reviewPanel('status'), 'review-errors': reviewPanel('errors'),
      'review-audiences': reviewPanel('audiences') }} /> : null
  const preview = <StudioPreview invitation={retained.invitation} audience={audience.audience}
    publicInvitationUrl={publicInvitationUrl} previewKey={audience.previewKey} showing={retained.showing}
    contextualLabel={contextualLabel} onAudienceChange={audience.changeAudience} onRestart={audience.restartPreview}
    onStructuralIssue={structuralIssue} headingRef={layerTitle} />
  if (!template) return null
  const previewMode: StudioPreviewMode = layerOpen ? 'dedicated' : previewCollapsed ? 'collapsed' : 'visible'
  const background = <><header className="limen-studio__project-header">
      <Link className="limen-studio__back-link" to="/">← Volver</Link><div><p className="limen-studio__eyebrow">LIMEN Studio</p>
      <h1>{model.draft.protagonistName || invitation.event.name}</h1><p>{template.internalName} · {lifecycleLabels[invitation.lifecycleStatus]} temporal</p></div>
      <button className="limen-studio__action" type="button" onClick={openPreview}>Ver invitación</button>
    </header><StudioStageNavigation activeStage={activeStage} onStageChange={setActiveStage} />
    <div className="limen-studio__stage-content">
      {activeStage === 'design' && <StudioDesignStage template={template} onPreview={openPreview} />}
      {activeStage === 'sections' && <StudioSectionsStage template={template} modules={model.draft.modules} />}
      <div hidden={activeStage !== 'content'}><StudioNavigationShell domains={contentDomains} navigation={contentNavigation} validation={model.validation} editor={editor}
      editorResolvable={!contentNavigation.editorId || isStudioEditorId(contentNavigation.editorId)} onNavigate={navigate}
      onOpenPreview={openPreview}
      correctionReturn={correctionContext !== undefined} onReturnToErrors={returnToErrors} /></div>
      {activeStage === 'review' && <section className="limen-studio__stage-panel" aria-labelledby="studio-review-title"><h2 id="studio-review-title">Revisión</h2>{reviewPanel('status')}{reviewPanel('errors')}</section>}
    </div></>
  const previewSurface = <>
      {previewCollapsed && !layerOpen ? <div className="limen-studio__preview-collapsed"><strong>Vista previa</strong><button type="button" onClick={() => surfaceDispatch({ type: 'show' })}>Mostrar preview</button></div> : null}
      <div hidden={previewMode === 'collapsed'} inert={previewMode === 'collapsed' ? true : undefined} className="limen-studio__embedded-preview"><header><strong>Vista previa · {retained.showing === 'current' ? 'Borrador actual' : retained.showing === 'last-renderable' ? 'Último borrador disponible' : 'No disponible'}</strong><div>{layerOpen && <button type="button" onClick={closePreview}>← Volver al editor</button>}<button type="button" onClick={audience.restartPreview}>Reiniciar</button>{!layerOpen && <button type="button" onClick={() => surfaceDispatch({ type: 'collapse' })}>Contraer</button>}<a href={publicInvitationUrl}>Abrir demo público</a></div></header>{preview}</div>
    </>
  return <div className="limen-studio"><div className="limen-studio__workspace">
    <StudioWorkspaceFrame background={background} preview={previewSurface} previewMode={previewMode} />
  </div></div>
}
