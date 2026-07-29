import type { MouseEvent, ReactNode } from 'react'

import type { InvitationAudience } from '../invitations/engine/invitationTypes'
import type { Origin01StudioValidation, StudioIssue } from './origin01StudioValidation'
import type { StudioDomainDefinition } from './studioNavigation'
import { groupStudioIssues, resolveStudioIssueDestination } from './studioReviewIssues'

type Props = {
  audience: InvitationAudience
  domains: readonly StudioDomainDefinition[]
  preview: ReactNode
  previewCollapsed: boolean
  previewDedicated: boolean
  validation: Origin01StudioValidation
  onAudience: (audience: InvitationAudience) => void
  onIssue: (issue: StudioIssue) => void
  onOpenPreview: (event: MouseEvent<HTMLButtonElement>) => void
  onShowPreview: () => void
}

const visibleSeverities = new Set<StudioIssue['severity']>(['structural', 'active-error', 'warning'])

export function StudioReviewStage({ audience, domains, preview, previewCollapsed, previewDedicated, validation,
  onAudience, onIssue, onOpenPreview, onShowPreview }: Props) {
  const actionableGroups = groupStudioIssues(validation.issues)
    .filter(({ severity }) => visibleSeverities.has(severity))
    .map((group) => ({ ...group, issues: group.issues.filter(({ relevant }) => relevant) }))
    .filter(({ issues }) => issues.length > 0)
  const correctionCount = validation.issues.filter(({ relevant, severity }) =>
    relevant && (severity === 'structural' || severity === 'active-error')).length
  const warningCount = validation.issues.filter(({ relevant, severity }) =>
    relevant && severity === 'warning').length
  const inactiveCount = validation.issues.filter(({ severity }) => severity === 'inactive-content').length

  return <section className="limen-studio__review-stage" aria-labelledby="studio-review-title">
    <header className="limen-studio__stage-heading">
      <p className="limen-studio__eyebrow">Revisión</p>
      <h2 className="limen-studio__review-title" id="studio-review-title" tabIndex={-1}>Revisá la invitación antes de compartirla</h2>
      <p>Comprobá el contenido, recorré ambas audiencias y corregí únicamente lo que necesita atención.</p>
    </header>
    <div className={`limen-studio__review-layout${previewCollapsed ? ' limen-studio__review-layout--preview-collapsed' : ''}`}>
      <div className="limen-studio__review-main" inert={previewDedicated ? true : undefined}>
        <section className="limen-studio__review-summary" aria-label="Estado de la invitación">
          <div><strong>{validation.structurallyValid ? 'Preview disponible' : 'Preview bloqueada'}</strong>
            <span>{validation.structurallyValid ? 'La experiencia puede recorrerse.' : 'Hay un problema que impide mostrar los últimos cambios.'}</span></div>
          <div><strong>{correctionCount}</strong><span>{correctionCount === 1 ? 'corrección necesaria' : 'correcciones necesarias'}</span></div>
          <div><strong>{warningCount}</strong><span>{warningCount === 1 ? 'advertencia' : 'advertencias'}</span></div>
        </section>

        <section className="limen-studio__review-audience" aria-labelledby="studio-review-audience-title">
          <div><h3 id="studio-review-audience-title">Recorrer como</h3>
            <p>Cambiar la audiencia reinicia la experiencia desde el comienzo.</p></div>
          <div className="limen-studio__segmented-actions">
            <button type="button" aria-pressed={audience === 'protagonist'}
              onClick={() => onAudience('protagonist')}>Protagonista</button>
            <button type="button" aria-pressed={audience === 'guest'}
              onClick={() => onAudience('guest')}>Invitado</button>
            <button type="button" onClick={onOpenPreview}>Ver invitación completa</button>
          </div>
        </section>

        <section className="limen-studio__review-checks" aria-labelledby="studio-review-checks-title">
          <h3 id="studio-review-checks-title">Qué necesita atención</h3>
          {actionableGroups.length === 0
            ? <p className="limen-studio__review-clear">No hay correcciones activas. La revisión editorial final continúa siendo manual.</p>
            : actionableGroups.map((group) => <section key={group.severity} className="limen-studio__review-group">
              <h4>{group.label} <span>{group.issues.length}</span></h4>
              <ul>{group.issues.map((issue) => {
                const destination = resolveStudioIssueDestination(issue, domains)
                return <li key={issue.id}><p>{issue.message}</p>
                  {destination && <button type="button" onClick={() => onIssue(issue)}>Corregir</button>}
                </li>
              })}</ul>
            </section>)}
          {inactiveCount > 0 && <p className="limen-studio__review-note">
            Hay contenido conservado en {inactiveCount} {inactiveCount === 1 ? 'campo de una sección excluida' : 'campos de secciones excluidas'}.
          </p>}
          <p className="limen-studio__review-note">La publicación y la persistencia todavía no forman parte de este prototipo.</p>
        </section>
      </div>
      <aside className={`limen-studio__desktop-preview${previewDedicated ? ' limen-studio__desktop-preview--dedicated' : ''}`}>
        {previewCollapsed && !previewDedicated && <div className="limen-studio__preview-collapsed">
          <span>La vista previa está contraída.</span><button type="button" onClick={onShowPreview}>Mostrar</button></div>}
        <div hidden={previewCollapsed && !previewDedicated}
          inert={previewCollapsed && !previewDedicated ? true : undefined}>{preview}</div>
      </aside>
    </div>
  </section>
}
