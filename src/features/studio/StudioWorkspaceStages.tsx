import type { InvitationModuleConfig } from '../invitations/engine/moduleTypes'
import type { InvitationTemplateDefinition } from '../invitations/engine/templateTypes'

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

export function StudioDesignStage({ template, onPreview }: {
  template: InvitationTemplateDefinition
  onPreview: () => void
}) {
  return <section className="limen-studio__stage-panel" aria-labelledby="studio-design-title">
    <p className="limen-studio__eyebrow">Plantilla actual</p>
    <h2 id="studio-design-title">{template.internalName}</h2>
    <p>{template.description}</p>
    <button className="limen-studio__action" type="button" onClick={onPreview}>Ver invitación</button>
  </section>
}

export function StudioSectionsStage({ template, modules }: {
  template: InvitationTemplateDefinition
  modules: readonly InvitationModuleConfig[]
}) {
  const configured = new Map(modules.map((module) => [module.moduleId, module.enabled]))
  const definitions = new Map(template.modules.map((module) => [module.moduleId, module]))
  const orderedSections = template.canonicalOrder.flatMap((moduleId) => {
    const definition = definitions.get(moduleId)
    return definition ? [definition] : []
  })
  return <section className="limen-studio__stage-panel" aria-labelledby="studio-sections-title">
    <h2 id="studio-sections-title">Secciones</h2>
    <p>Este es el recorrido actual de tu invitación.</p>
    <ol className="limen-studio__section-summary">
      {orderedSections.map((module) => {
        const included = template.requiredModules.includes(module.moduleId) || configured.get(module.moduleId) === true
        return <li key={module.moduleId}><span>{module.internalLabel}</span>
          <strong className={included ? 'is-included' : undefined}>{included ? 'Sección incluida' : 'No incluida'}</strong></li>
      })}
    </ol>
  </section>
}
