import { studioWorkspaceStages } from './studioWorkspaceStages'
import type { StudioWorkspaceStage } from './studioWorkspaceStages'
import type { ReactNode } from 'react'
import { StudioPhotographyManager } from './StudioPhotographyManager'
import { StudioMusicManager } from './StudioMusicManager'
import type { Origin01StudioMediaState } from './origin01StudioMedia'
import type { Origin01ThemeVariantId } from '../invitations/origin01/origin01ThemeVariants'
import { StudioVisualVariantSelector } from './StudioVisualVariantSelector'
import type { StudioMediaUploadInput } from './studioMediaStorage'

export function StudioStageNavigation({ activeStage, onStageChange }: {
  activeStage: StudioWorkspaceStage
  onStageChange: (stage: StudioWorkspaceStage) => void
}) {
  return <nav className="limen-studio__stage-nav" aria-label="Etapas de edición">
    {studioWorkspaceStages.map((stage) => <button key={stage.id} type="button"
      aria-current={activeStage === stage.id ? 'step' : undefined}
      onClick={() => onStageChange(stage.id)}>{stage.label}</button>)}
  </nav>
}

export function StudioAestheticStage({
  media,
  initialMedia,
  themeVariant,
  initialThemeVariant,
  protagonistName,
  initialGalleryCaptions,
  onMediaChange,
  onGalleryCaptionsChange,
  onUploadMedia,
  onThemeVariantChange,
}: {
  media: Origin01StudioMediaState
  initialMedia: Origin01StudioMediaState
  themeVariant: Origin01ThemeVariantId
  initialThemeVariant: Origin01ThemeVariantId
  protagonistName: string
  initialGalleryCaptions: readonly string[]
  onMediaChange: (updater: (current: Origin01StudioMediaState) => Origin01StudioMediaState) => void
  onGalleryCaptionsChange: (updater: (current: readonly string[]) => readonly string[]) => void
  onUploadMedia: (input: StudioMediaUploadInput) => Promise<{ readonly storageKey: string; readonly src: string }>
  onThemeVariantChange: (variant: Origin01ThemeVariantId) => void
}) {
  return <section className="limen-studio__aesthetic-stage" aria-labelledby="studio-aesthetic-title">
    <div className="limen-studio__stage-heading"><p className="limen-studio__eyebrow">Estética</p>
      <h2 id="studio-aesthetic-title">Colores, fotos y música</h2>
      <p>Personalizá el diseño sin cambiar la estructura de la invitación.</p></div>
    <StudioVisualVariantSelector value={themeVariant} initialValue={initialThemeVariant}
      onChange={onThemeVariantChange} />
    <StudioPhotographyManager state={media} initialState={initialMedia} protagonistName={protagonistName}
      initialGalleryCaptions={initialGalleryCaptions}
      onMediaChange={onMediaChange} onGalleryCaptionsChange={onGalleryCaptionsChange}
      onUploadMedia={onUploadMedia} />
    <StudioMusicManager state={media} initialState={initialMedia}
      onMediaChange={onMediaChange} onUploadMedia={onUploadMedia} />
  </section>
}

export function StudioStagePresentation({ activeStage, previewDedicated, templateGalleryOpen,
  templateStage, aestheticStage, children }: {
  activeStage: StudioWorkspaceStage
  previewDedicated: boolean
  templateGalleryOpen: boolean
  templateStage: ReactNode
  aestheticStage: ReactNode
  children: ReactNode
}) {
  const independentGallery = activeStage === 'template' && templateGalleryOpen && !previewDedicated
  return <>
    <div hidden={activeStage !== 'template'} inert={previewDedicated ? true : undefined}>{templateStage}</div>
    {activeStage === 'aesthetic' && <div inert={previewDedicated ? true : undefined}>{aestheticStage}</div>}
    {!independentGallery && children}
  </>
}
