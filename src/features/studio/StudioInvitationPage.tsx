import { useEffect, useReducer, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { findInvitationTemplate } from '../invitations/engine/templateRegistry'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { StudioActiveEditor } from './StudioActiveEditor'
import { createOrigin01StudioDomains } from './origin01StudioConfiguration'
import { useStudioNavigation } from './useStudioNavigation'
import { StudioPreview } from './StudioPreview'
import { StudioPreviewPane } from './StudioPreviewPane'
import { StudioReviewStage } from './StudioReviewStage'
import { useOrigin01StudioModel } from './useOrigin01StudioModel'
import { useStudioPreviewAudience } from './useStudioPreviewAudience'
import { createStudioPreviewSurfaceState, isStudioPreviewDedicated, isStudioPreviewEffectivelyCollapsed,
  transitionStudioPreviewSurface } from './studioPreviewSurface'
import { useStudioRenderablePreview } from './useStudioRenderablePreview'
import { getOrigin01StudioDraftSessionId } from './origin01StudioDraft'
import { createStudioIssueCorrectionContext, resolveStudioCorrectionReturn, resolveStudioIssueDestination,
  issueNeedsCorrectionReturn, resolveStudioStructuralDestination } from './studioReviewIssues'
import type { StudioIssueCorrectionContext } from './studioReviewIssues'
import type { StudioIssue } from './origin01StudioValidation'
import { focusStudioEditorHeading, focusStudioIssueDestination, focusStudioReviewHeading,
  isStudioPreviewCloseKey, restoreStudioPreviewOpener } from './studioFocus'
import { StudioAestheticStage, StudioStageNavigation } from './StudioWorkspaceStages'
import type { StudioWorkspaceStage } from './studioWorkspaceStages'
import { createStudioReturnToReview } from './studioWorkspaceStages'
import { StudioTemplateStage } from './StudioTemplateStage'
import { studioDesktopMediaQuery } from './studioViewport'
import { StudioSectionsStage } from './StudioSectionsStage'
import { StudioScenesContent } from './StudioScenesContent'
import { StudioIcon } from './StudioIcon'
import { findStudioSceneByEditorId, selectSceneAfterExclusion, studioGeneralScene, studioScenes,
  type StudioSceneId } from './studioScenes'
import { createStudioTemplateGalleryState } from './studioTemplateGallery'
import './studio.css'

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
  const [selectedScene, setSelectedScene] = useState<StudioSceneId>('general')
  const [selectedEditorByScene, setSelectedEditorByScene] = useState<Partial<Record<StudioSceneId, string>>>({
    general: studioGeneralScene.editorIds[0],
  })
  const [templateState, setTemplateState] = useState(() => createStudioTemplateGalleryState(template?.id ?? invitation.templateId))
  const opener = useRef<HTMLElement | null>(null)
  const scrollPosition = useRef(0)
  const layerTitle = useRef<HTMLHeadingElement>(null)
  const activeDomain = domains.find(({ id }) => id === navigation.domainId)
  const activeItem = activeDomain?.items.find(({ id }) => id === navigation.itemId)
  const publicInvitationUrl = new URL(`/demo/${invitation.code}`, window.location.origin).toString()
  const layerOpen = isStudioPreviewDedicated(surface)
  const previewCollapsed = isStudioPreviewEffectivelyCollapsed(surface)

  const openPreview = (event?: React.MouseEvent<HTMLElement>) => {
    opener.current = event?.currentTarget ?? document.activeElement as HTMLElement
    scrollPosition.current = window.scrollY
    surfaceDispatch({ type: 'open', viewport: window.matchMedia(studioDesktopMediaQuery).matches ? 'desktop' : 'mobile',
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
    const issueScene = findStudioSceneByEditorId(destination.editorId)
    if (issueScene) {
      setSelectedScene(issueScene.id)
      setSelectedEditorByScene((current) => ({ ...current, [issueScene.id]: destination.editorId }))
      setActiveStage('content')
    } else if (destination.editorId === 'scene-configuration') setActiveStage('sections')
    else setActiveStage('review')
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
        setActiveStage(destination.domainId === 'review' ? 'review' : 'sections')
        requestAnimationFrame(() => requestAnimationFrame(() => focusStudioEditorHeading()))
      }
    }
  }
  const returnToErrors = () => {
    const errors = correctionContext ? resolveStudioCorrectionReturn(correctionContext, domains) : null
    if (errors) {
      const destination = createStudioReturnToReview(errors)
      setActiveStage(destination.activeStage)
      navigate(destination.navigation)
      setCorrectionContext(undefined)
      requestAnimationFrame(() => requestAnimationFrame(() => focusStudioReviewHeading()))
    }
  }
  const visibleScene = studioScenes.find(({ id }) => id === selectedScene) ?? studioGeneralScene
  const selectedEditorId = selectedEditorByScene[visibleScene.id] ?? visibleScene.editorIds[0]
  const editorLabels: Record<string, string> = {
    identity: 'Identidad',
    'event-canonical': 'Fecha y lugar',
    'event-operations': 'Datos operativos',
    share: 'Compartir',
  }
  const contextualEditor = <div className="limen-studio__contextual-editor-body">
    <StudioActiveEditor invitation={invitation} template={template} model={model} editorId={selectedEditorId} />
  </div>
  const preview = <StudioPreview invitation={retained.invitation} audience={audience.audience}
    publicInvitationUrl={publicInvitationUrl} previewKey={audience.previewKey} showing={retained.showing}
    contextualLabel={activeStage === 'content' ? visibleScene.label : 'Revisión completa'}
    previewScene={activeStage === 'content' ? visibleScene.id : undefined}
    onAudienceChange={audience.changeAudience} onRestart={audience.restartPreview}
    onStructuralIssue={structuralIssue} headingRef={layerTitle} />
  const previewPane = <StudioPreviewPane audienceLabel={audience.audience === 'guest' ? 'Invitado' : 'Protagonista'}
    layerOpen={layerOpen} preview={preview} publicInvitationUrl={publicInvitationUrl}
    onClose={closePreview}
    onOpen={openPreview} onRestart={audience.restartPreview} />

  return <div className="limen-studio"><div className="limen-studio__workspace">
    <header className="limen-studio__header" inert={layerOpen ? true : undefined}>
      <div className="limen-studio__brand">
        <h1><span className="limen-studio__brand-name">LIMEN</span><span>Studio</span></h1>
        <div><span className="limen-studio__context-label">Invitación en edición</span>
          <strong>{model.draft.protagonistName}</strong>
          <small>{invitation.event.celebrationLabel} · {invitation.code}</small></div>
      </div>
      <div className="limen-studio__stage-nav-wrap">
        <StudioStageNavigation activeStage={activeStage} onStageChange={setActiveStage} />
      </div>
      <div className="limen-studio__header-actions">
        <span className="limen-studio__draft-status"><StudioIcon name="temporary" />
          <span><small>Estado</small>Cambios temporales</span></span>
        <Link className="limen-studio__back-link" to="/"><StudioIcon name="exit" />Salir</Link>
      </div>
    </header>
    <main className="limen-studio__stage">
      <div hidden={activeStage !== 'template'} inert={activeStage !== 'template' || layerOpen ? true : undefined}>
        {template && <StudioTemplateStage template={template} state={templateState} onStateChange={setTemplateState} />}
      </div>
      {activeStage === 'aesthetic' && <StudioAestheticStage />}
      {activeStage === 'sections' && <StudioSectionsStage draft={model.draft} onSceneChange={(scene, included) => {
        for (const moduleId of scene.moduleIds) model.setModuleEnabled(moduleId, included)
        if (!included && selectedScene === scene.id) {
          const projected = { modules: model.draft.modules.map((module) => scene.moduleIds.includes(module.moduleId)
            ? { ...module, enabled: false } : module) }
          setSelectedScene(selectSceneAfterExclusion(scene.id, projected))
        }
      }} />}
      {activeStage === 'content' && <>
        <header className="limen-studio__stage-heading limen-studio__stage-heading--content">
          <p className="limen-studio__eyebrow">Contenido</p><h2>Contá la historia, escena por escena</h2>
          <p>Elegí una escena y editá una configuración por vez.</p>
        </header>
        <StudioScenesContent draft={model.draft} selectedScene={selectedScene} onSceneSelect={(scene) => {
          setSelectedScene(scene)
          const nextScene = studioScenes.find(({ id }) => id === scene)
          if (nextScene && !selectedEditorByScene[scene]) {
            setSelectedEditorByScene((current) => ({ ...current, [scene]: nextScene.editorIds[0] }))
          }
        }}
          editor={contextualEditor} preview={previewPane}
          previewCollapsed={previewCollapsed} previewDedicated={layerOpen}
          onShowPreview={() => surfaceDispatch({ type: 'show' })} correctionReturn={correctionContext !== undefined}
          onReturnToErrors={returnToErrors}
          editorTabs={visibleScene.editorIds.length > 1 ? visibleScene.editorIds.map((editorId) => ({
            id: editorId, label: editorLabels[editorId] ?? editorId,
          })) : undefined}
          selectedEditorId={selectedEditorId}
          onEditorSelect={(editorId) => setSelectedEditorByScene((current) => ({
            ...current, [visibleScene.id]: editorId,
          }))} />
      </>}
      {activeStage === 'review' && <StudioReviewStage audience={audience.audience} domains={domains}
        preview={previewPane} previewCollapsed={previewCollapsed} previewDedicated={layerOpen}
        validation={model.validation} onAudience={audience.changeAudience} onIssue={openIssue}
        onOpenPreview={openPreview} onShowPreview={() => surfaceDispatch({ type: 'show' })} />}
    </main>
  </div></div>
}
