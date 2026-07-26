import type { InvitationModuleConfig, InvitationModuleId } from '../invitations/engine/moduleTypes'
import type { InvitationTemplateDefinition } from '../invitations/engine/templateTypes'
import type { InvitationValidationResult } from '../invitations/engine/invitationValidation'

type StudioModuleListProps = {
  template: InvitationTemplateDefinition
  modules: readonly InvitationModuleConfig[]
  validation: InvitationValidationResult
  onModuleChange: (moduleId: InvitationModuleId, enabled: boolean) => void
  onReset: () => void
  resetDisabled: boolean
}

export function StudioModuleList({
  template,
  modules,
  validation,
  onModuleChange,
  onReset,
  resetDisabled,
}: StudioModuleListProps) {
  const definitions = new Map(template.modules.map((module) => [module.moduleId, module]))
  const configuredModules = new Map(modules.map((module) => [module.moduleId, module]))
  const requiredModules = new Set(template.requiredModules)

  return (
    <>
      <div className="limen-studio__panel-heading">
        <div>
          <h2 id="studio-scenes-title">Configuración de escenas</h2>
          <p>Las escenas opcionales se ajustan solo durante esta sesión.</p>
        </div>
        <button
          className="limen-studio__reset"
          type="button"
          onClick={onReset}
          disabled={resetDisabled}
        >
          Restablecer configuración
        </button>
      </div>

      <ul className="limen-studio__scene-list">
        {template.canonicalOrder.map((moduleId) => {
          const definition = definitions.get(moduleId)
          const configuration = configuredModules.get(moduleId)
          const isRequired = requiredModules.has(moduleId)
          const isEnabled = isRequired || configuration?.enabled === true
          const controlId = `studio-module-${moduleId}`

          return (
            <li className="limen-studio__scene" key={moduleId}>
              <div className="limen-studio__scene-details">
                <span className="limen-studio__scene-label">{definition?.internalLabel ?? moduleId}</span>
                <span className="limen-studio__scene-id">{moduleId}</span>
              </div>

              {isRequired ? (
                <div className="limen-studio__required-state">
                  <strong>Obligatoria</strong>
                  <span>La plantilla requiere esta escena y siempre está activa.</span>
                </div>
              ) : (
                <label className="limen-studio__switch" htmlFor={controlId}>
                  <span className="limen-studio__state-label">{isEnabled ? 'Activa' : 'Inactiva'}</span>
                  <input
                    id={controlId}
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(event) => onModuleChange(moduleId, event.currentTarget.checked)}
                  />
                  <span className="limen-studio__switch-track" aria-hidden="true" />
                </label>
              )}
            </li>
          )
        })}
      </ul>

      <div
        className={`limen-studio__validation ${validation.valid ? 'limen-studio__validation--valid' : 'limen-studio__validation--invalid'}`}
        role="status"
        aria-live="polite"
      >
        <p><strong>{validation.valid ? 'Configuración válida' : 'La configuración necesita revisión'}</strong></p>
        {!validation.valid ? (
          <ul className="limen-studio__validation-messages">
            {validation.errors.map((error, index) => (
              <li key={`${error.code}-${error.fieldPath ?? index}`}>{error.message}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  )
}
