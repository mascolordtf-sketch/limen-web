import { studioWorkspaceStages } from './studioWorkspaceStages'
import type { StudioWorkspaceStage } from './studioWorkspaceStages'
import type { ReactNode } from 'react'

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

export function StudioAestheticStage() {
  return <section className="limen-studio__aesthetic-placeholder" aria-labelledby="studio-aesthetic-title">
    <h2 id="studio-aesthetic-title">Estética</h2>
    <p>La personalización de la apariencia de esta plantilla se incorporará en una próxima entrega.</p>
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
