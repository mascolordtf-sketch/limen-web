import { studioWorkspaceStages } from './studioWorkspaceStages'
import type { StudioWorkspaceStage } from './studioWorkspaceStages'
import type { ReactNode } from 'react'
import { StudioPhotographyManager } from './StudioPhotographyManager'
import { StudioMusicManager } from './StudioMusicManager'
import type { Origin01StudioMediaState } from './origin01StudioMedia'
import type { Origin01ThemeVariantId } from '../invitations/origin01/origin01ThemeVariants'
import { findOrigin01ThemeVariant } from '../invitations/origin01/origin01ThemeVariants'
import { StudioVisualVariantSelector } from './StudioVisualVariantSelector'
import { StudioTypographyEvaluation } from './StudioTypographyEvaluation'

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
  onTemporaryUrl,
  onThemeVariantChange,
  demoPath,
}: {
  media: Origin01StudioMediaState
  initialMedia: Origin01StudioMediaState
  themeVariant: Origin01ThemeVariantId
  initialThemeVariant: Origin01ThemeVariantId
  protagonistName: string
  initialGalleryCaptions: readonly string[]
  onMediaChange: (updater: (current: Origin01StudioMediaState) => Origin01StudioMediaState) => void
  onGalleryCaptionsChange: (updater: (current: readonly string[]) => readonly string[]) => void
  onTemporaryUrl: (url: string) => void
  onThemeVariantChange: (variant: Origin01ThemeVariantId) => void
  demoPath: string
}) {
  const visualVariant = findOrigin01ThemeVariant(themeVariant)
  return <section className="limen-studio__aesthetic-stage" aria-labelledby="studio-aesthetic-title">
    <div className="limen-studio__stage-heading"><p className="limen-studio__eyebrow">Estética</p>
      <h2 id="studio-aesthetic-title">El universo visual de Origin 01</h2>
      <p>Elegí una atmósfera curada y administrá las fotografías y la música de la experiencia.</p></div>
    <StudioVisualVariantSelector value={themeVariant} initialValue={initialThemeVariant}
      onChange={onThemeVariantChange} />
    <StudioTypographyEvaluation demoPath={demoPath} />
    <div className={`limen-studio__aesthetic-board limen-studio__aesthetic-board--${themeVariant}`}>
      <article className="limen-studio__aesthetic-hero">
        <div className={`limen-studio__aesthetic-hero-art limen-studio__aesthetic-hero-art--${themeVariant}`}
          aria-hidden="true">
          <span>Origin</span><strong>01</strong><i /><i />
        </div>
        <div><p className="limen-studio__eyebrow">Dirección visual</p><h3>{visualVariant?.name}</h3>
          <p>{visualVariant?.description}</p>
          <dl>{visualVariant?.character.split(' · ').map((value, index) =>
            <div key={value}><dt>{['Carácter', 'Ritmo', 'Gesto'][index]}</dt><dd>{value}</dd></div>)}</dl>
        </div>
      </article>
      <article className="limen-studio__aesthetic-panel limen-studio__aesthetic-colors">
        <header><span>01</span><div><h3>Paleta</h3><p>Color y función</p></div></header>
        <ul aria-label={`Paleta ${visualVariant?.name ?? ''}`}>
          {visualVariant?.palette.map((color) => <li key={color.role}>
            <span style={{ background: color.value }} /><strong>{color.name}</strong><small>{color.role}</small>
          </li>)}
        </ul>
      </article>
      <article className="limen-studio__aesthetic-panel limen-studio__aesthetic-type">
        <header><span>02</span><div><h3>Tipografía</h3><p>Voz y contraste</p></div></header>
        <div aria-label="Muestra tipográfica"><strong>Una historia</strong><span>merece un gran comienzo</span>
          <small>La comparación detallada está en el laboratorio superior</small></div>
      </article>
      <article className="limen-studio__aesthetic-panel limen-studio__aesthetic-image">
        <header><span>03</span><div><h3>Imagen</h3><p>Tratamiento fotográfico</p></div></header>
        <div aria-hidden="true"><span /><i /><i /></div>
        <p>Luz suave, encuadre protagonista y profundidad nocturna.</p>
      </article>
      <article className="limen-studio__aesthetic-panel limen-studio__aesthetic-detail">
        <header><span>04</span><div><h3>Detalle</h3><p>Recurso ornamental</p></div></header>
        <div aria-hidden="true"><i /><i /><i /><span /></div>
        <p>Líneas botánicas finas que acompañan sin ocupar la escena.</p>
      </article>
    </div>
    <aside className="limen-studio__aesthetic-note"><span aria-hidden="true">i</span>
      <div><strong>Sistema visual curado</strong>
        <p>La variante aplica una paleta completa y accesible. El laboratorio tipográfico permite evaluar combinaciones sin guardar cambios.</p></div>
    </aside>
    <StudioPhotographyManager state={media} initialState={initialMedia} protagonistName={protagonistName}
      initialGalleryCaptions={initialGalleryCaptions}
      onMediaChange={onMediaChange} onGalleryCaptionsChange={onGalleryCaptionsChange}
      onTemporaryUrl={onTemporaryUrl} />
    <StudioMusicManager state={media} initialState={initialMedia}
      onMediaChange={onMediaChange} onTemporaryUrl={onTemporaryUrl} />
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
