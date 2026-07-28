import { studioWorkspaceStages } from './studioWorkspaceStages'
import type { StudioWorkspaceStage } from './studioWorkspaceStages'

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
