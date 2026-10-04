import { useState, type ReactNode } from 'react'

import type { Origin01ThemeVariantId } from '../invitations/origin01/origin01ThemeVariants'
import type { Origin01StudioMediaState } from './origin01StudioMedia'
import { StudioMusicManager } from './StudioMusicManager'
import { StudioPhotographyManager } from './StudioPhotographyManager'
import type { StudioPhotoTarget } from './StudioPhotographyManager'
import type { StudioMediaUploadInput } from './studioMediaStorage'
import type { StudioSceneId } from './studioScenes'
import { StudioVisualVariantSelector } from './StudioVisualVariantSelector'
import { studioWorkspaceStages } from './studioWorkspaceStages'
import type { StudioWorkspaceStage } from './studioWorkspaceStages'

export function StudioStageNavigation({ activeStage, onStageChange }: {
  activeStage: StudioWorkspaceStage
  onStageChange: (stage: StudioWorkspaceStage) => void
}) {
  return <nav className="limen-studio__stage-nav" aria-label="Etapas de edición">
    {studioWorkspaceStages.map((stage, index) => <button key={stage.id} type="button"
      aria-current={activeStage === stage.id ? 'step' : undefined}
      onClick={() => onStageChange(stage.id)}>
      <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <strong>{stage.label}</strong>
    </button>)}
  </nav>
}

export function StudioUnifiedWorkspace({ activeStage, preview, previewCollapsed, previewDedicated,
  onStageChange, onShowPreview, children }: {
  activeStage: StudioWorkspaceStage
  preview: ReactNode
  previewCollapsed: boolean
  previewDedicated: boolean
  onStageChange: (stage: StudioWorkspaceStage) => void
  onShowPreview: () => void
  children: ReactNode
}) {
  return <section className={`limen-studio__unified-workspace limen-studio__unified-workspace--${activeStage}${
    previewCollapsed && !previewDedicated ? ' limen-studio__unified-workspace--preview-collapsed' : ''}`}>
    <aside className="limen-studio__workspace-navigation" inert={previewDedicated ? true : undefined}>
      <p className="limen-studio__workspace-navigation-label">Flujo de trabajo</p>
      <StudioStageNavigation activeStage={activeStage} onStageChange={onStageChange} />
    </aside>
    <div className="limen-studio__workspace-editor" inert={previewDedicated ? true : undefined}>
      {children}
    </div>
    <aside className={`limen-studio__desktop-preview${previewDedicated ? ' limen-studio__desktop-preview--dedicated' : ''}`}
      aria-label="Vista previa de la invitación">
      {previewCollapsed && !previewDedicated && <div className="limen-studio__preview-collapsed">
        <span>La vista previa está contraída.</span><button type="button" onClick={onShowPreview}>Mostrar</button>
      </div>}
      <div hidden={previewCollapsed && !previewDedicated}
        inert={previewCollapsed && !previewDedicated ? true : undefined}>{preview}</div>
    </aside>
  </section>
}

export function StudioDesignStage({ template, themeVariant, initialThemeVariant, onThemeVariantChange }: {
  template: ReactNode
  themeVariant: Origin01ThemeVariantId
  initialThemeVariant: Origin01ThemeVariantId
  onThemeVariantChange: (variant: Origin01ThemeVariantId) => void
}) {
  return <section className="limen-studio__design-stage" aria-labelledby="studio-design-title">
    <header className="limen-studio__stage-heading">
      <p className="limen-studio__eyebrow">Diseño</p>
      <h2 id="studio-design-title">Definí la identidad visual</h2>
      <p>Elegí la plantilla y la paleta que van a ordenar toda la invitación.</p>
    </header>
    <div className="limen-studio__design-content">
      {template}
      <StudioVisualVariantSelector value={themeVariant} initialValue={initialThemeVariant}
        onChange={onThemeVariantChange} />
    </div>
  </section>
}

export function StudioMediaStage({
  media,
  initialMedia,
  protagonistName,
  initialGalleryCaptions,
  onMediaChange,
  onGalleryCaptionsChange,
  onUploadMedia,
  onPreviewFocusChange,
}: {
  media: Origin01StudioMediaState
  initialMedia: Origin01StudioMediaState
  protagonistName: string
  initialGalleryCaptions: readonly string[]
  onMediaChange: (updater: (current: Origin01StudioMediaState) => Origin01StudioMediaState) => void
  onGalleryCaptionsChange: (updater: (current: readonly string[]) => readonly string[]) => void
  onUploadMedia: (input: StudioMediaUploadInput) => Promise<{ readonly storageKey: string; readonly src: string }>
  onPreviewFocusChange?: (focus?: StudioMediaPreviewFocus) => void
}) {
  const [editingPhoto, setEditingPhoto] = useState<StudioPhotoTarget>()
  const [activeMediaPanel, setActiveMediaPanel] = useState<'photography' | 'music'>('photography')
  const changeEditingPhoto = (target?: StudioPhotoTarget) => {
    setEditingPhoto(target)
    onPreviewFocusChange?.(target ? {
      scene: target.previewScene,
      item: target.previewScene === 'gallery' ? target.position : undefined,
      label: target.position === undefined ? target.label : `${target.label} ${target.position + 1}`,
    } : undefined)
  }

  return <section className={`limen-studio__media-stage${editingPhoto ? ' limen-studio__media-stage--editing' : ''}`}
    aria-labelledby={editingPhoto ? 'studio-photo-editor-title' : 'studio-media-title'}>
    {!editingPhoto && <header className="limen-studio__stage-heading">
      <p className="limen-studio__eyebrow">Fotos y música</p>
      <h2 id="studio-media-title">Completá la experiencia</h2>
      <p>Configurá las imágenes y, si corresponde, la música de la invitación.</p>
    </header>}
    {!editingPhoto && <div className="limen-studio__media-tabs" role="tablist" aria-label="Fotos y música"
      onKeyDown={(event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
        event.preventDefault()
        const nextPanel = event.key === 'ArrowLeft' || event.key === 'Home' ? 'photography' : 'music'
        setActiveMediaPanel(nextPanel)
        requestAnimationFrame(() => document.getElementById(`studio-media-${nextPanel}-tab`)?.focus())
      }}>
      <button id="studio-media-photography-tab" type="button" role="tab"
        aria-selected={activeMediaPanel === 'photography'} aria-controls="studio-media-photography-panel"
        tabIndex={activeMediaPanel === 'photography' ? 0 : -1}
        onClick={() => setActiveMediaPanel('photography')}>Fotografías</button>
      <button id="studio-media-music-tab" type="button" role="tab"
        aria-selected={activeMediaPanel === 'music'} aria-controls="studio-media-music-panel"
        tabIndex={activeMediaPanel === 'music' ? 0 : -1}
        onClick={() => setActiveMediaPanel('music')}>Música</button>
    </div>}
    <div id="studio-media-photography-panel" role="tabpanel" aria-labelledby="studio-media-photography-tab"
      className={`limen-studio__media-panel${editingPhoto ? ' limen-studio__media-panel--editing' : ''}`}
      hidden={!editingPhoto && activeMediaPanel !== 'photography'}>
      <StudioPhotographyManager state={media} initialState={initialMedia} protagonistName={protagonistName}
        initialGalleryCaptions={initialGalleryCaptions}
        onMediaChange={onMediaChange} onGalleryCaptionsChange={onGalleryCaptionsChange}
        onUploadMedia={onUploadMedia} editingTarget={editingPhoto}
        onEditingTargetChange={changeEditingPhoto} />
    </div>
    {!editingPhoto && <div id="studio-media-music-panel" role="tabpanel"
      aria-labelledby="studio-media-music-tab" className="limen-studio__media-panel"
      hidden={activeMediaPanel !== 'music'}>
      <StudioMusicManager state={media} initialState={initialMedia}
        onMediaChange={onMediaChange} onUploadMedia={onUploadMedia} />
    </div>}
  </section>
}

export type StudioMediaPreviewFocus = {
  readonly scene: StudioSceneId
  readonly item?: number
  readonly label: string
}
