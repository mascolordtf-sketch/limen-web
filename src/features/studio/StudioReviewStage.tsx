import { useState, type MouseEvent } from 'react'

import type { InvitationAudience } from '../invitations/engine/invitationTypes'
import type { Origin01StudioValidation, StudioIssue } from './origin01StudioValidation'
import type { StudioDomainDefinition } from './studioNavigation'
import { groupStudioIssues, resolveStudioIssueDestination } from './studioReviewIssues'
import { StudioPublicationPanel } from './StudioPublicationPanel'
import type { StudioPublicationSnapshot, StudioPublicationState } from './studioPublication'
import type { StudioPublicationEquivalence } from './studioPublicationEquivalence'

type Props = {
  audience: InvitationAudience
  domains: readonly StudioDomainDefinition[]
  validation: Origin01StudioValidation
  onAudience: (audience: InvitationAudience) => void
  onIssue: (issue: StudioIssue) => void
  onOpenPreview: (event: MouseEvent<HTMLButtonElement>) => void
  publication?: StudioPublicationSnapshot
  publicationEquivalence?: StudioPublicationEquivalence
  publicationState: StudioPublicationState
  draftRevision?: number
  publicationBlockReason?: string
  editoriallyConfirmed: boolean
  onEditorialConfirmation: (confirmed: boolean) => void
  onPublish: () => void
}

const visibleSeverities = new Set<StudioIssue['severity']>(['structural', 'active-error', 'warning'])

export function StudioReviewStage({ audience, domains, validation,
  onAudience, onIssue, onOpenPreview, publication, publicationState, draftRevision,
  publicationEquivalence, publicationBlockReason, editoriallyConfirmed, onEditorialConfirmation, onPublish }: Props) {
  const actionableGroups = groupStudioIssues(validation.issues)
    .filter(({ severity }) => visibleSeverities.has(severity))
    .map((group) => ({ ...group, issues: group.issues.filter(({ relevant }) => relevant) }))
    .filter(({ issues }) => issues.length > 0)
  const correctionCount = validation.issues.filter(({ relevant, severity }) =>
    relevant && (severity === 'structural' || severity === 'active-error')).length
  const warningCount = validation.issues.filter(({ relevant, severity }) =>
    relevant && severity === 'warning').length
  const inactiveCount = validation.issues.filter(({ severity }) => severity === 'inactive-content').length
  const [reviewedAudiences, setReviewedAudiences] = useState<ReadonlySet<InvitationAudience>>(() => new Set())
  const primaryCorrection = actionableGroups
    .filter(({ severity }) => severity === 'structural' || severity === 'active-error')
    .flatMap(({ issues }) => issues)[0]
  const ready = validation.structurallyValid && correctionCount === 0
  const completedChecks = (ready ? 1 : 0)
    + (reviewedAudiences.has('protagonist') ? 1 : 0)
    + (reviewedAudiences.has('guest') ? 1 : 0)
  const reviewAudience = (nextAudience: InvitationAudience, event: MouseEvent<HTMLButtonElement>) => {
    setReviewedAudiences((current) => current.has(nextAudience)
      ? current
      : new Set([...current, nextAudience]))
    onAudience(nextAudience)
    onOpenPreview(event)
  }

  return <section className="limen-studio__review-stage" aria-labelledby="studio-review-title">
    <header className="limen-studio__stage-heading">
      <p className="limen-studio__eyebrow">Último paso</p>
      <h2 className="limen-studio__review-title" id="studio-review-title" tabIndex={-1}>Revisar y publicar</h2>
      <p>Confirmá lo importante y generá una versión lista para compartir.</p>
    </header>
    <div className="limen-studio__review-layout">
      <div className="limen-studio__review-main">
        <section className={`limen-studio__review-readiness${ready ? ' is-ready' : ' needs-attention'}`}
          aria-label="Estado de la invitación">
          <span className="limen-studio__review-readiness-icon" aria-hidden="true">{ready ? '✓' : '!'}</span>
          <div><strong>{ready ? 'La invitación está lista' : 'La invitación necesita atención'}</strong>
            <span>{ready
              ? warningCount > 0
                ? `No hay errores activos. Quedan ${warningCount} ${warningCount === 1 ? 'advertencia' : 'advertencias'} para revisar.`
                : 'No hay errores de contenido ni archivos pendientes.'
              : correctionCount === 1
                ? 'Hay una corrección necesaria antes de publicar.'
                : `Hay ${correctionCount} correcciones necesarias antes de publicar.`}</span></div>
          <span className="limen-studio__review-revision">
            {draftRevision ? `Borrador ${draftRevision} guardado` : 'Borrador pendiente de guardar'}
          </span>
        </section>

        <section className="limen-studio__review-final-checks" aria-labelledby="studio-review-checks-title">
          <div className="limen-studio__review-section-heading">
            <h3 id="studio-review-checks-title">Controles finales</h3>
            <span>{completedChecks} de 3 completos</span>
          </div>
          <div className={`limen-studio__review-check-row${ready ? ' is-complete' : ' needs-attention'}`}>
            <span className="limen-studio__review-check-icon" aria-hidden="true">{ready ? '✓' : '!'}</span>
            <div><strong>Contenido y archivos</strong><span>{ready
              ? 'Sin correcciones activas.'
              : correctionCount === 1 ? 'Hay una corrección activa.' : `Hay ${correctionCount} correcciones activas.`}</span></div>
            {primaryCorrection
              ? <button type="button" onClick={() => onIssue(primaryCorrection)}>Corregir</button>
              : <span className="limen-studio__review-check-status">Completo</span>}
          </div>
          {(['protagonist', 'guest'] as const).map((reviewAudienceId) => {
            const reviewed = reviewedAudiences.has(reviewAudienceId)
            const label = reviewAudienceId === 'protagonist' ? 'Vista de protagonista' : 'Vista de invitado'
            return <div key={reviewAudienceId}
              className={`limen-studio__review-check-row${reviewed ? ' is-complete' : ''}`}>
              <span className="limen-studio__review-check-icon" aria-hidden="true">{reviewed ? '✓' : '○'}</span>
              <div><strong>{label}</strong><span>{reviewed
                ? 'Recorrida en esta revisión.'
                : 'Abrí esta vista y recorré la invitación completa.'}</span></div>
              <button type="button" aria-pressed={audience === reviewAudienceId}
                onClick={(event) => reviewAudience(reviewAudienceId, event)}>Revisar</button>
            </div>
          })}
        </section>

        {actionableGroups.length > 0 && <section className="limen-studio__review-checks"
          aria-labelledby="studio-review-attention-title">
          <h3 id="studio-review-attention-title">Correcciones y advertencias</h3>
          {actionableGroups.map((group) => <section key={group.severity} className="limen-studio__review-group">
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
        </section>}
        <StudioPublicationPanel draftRevision={draftRevision} publication={publication} state={publicationState}
          equivalence={publicationEquivalence} blockReason={publicationBlockReason}
          editoriallyConfirmed={editoriallyConfirmed}
          onEditorialConfirmation={onEditorialConfirmation} onPublish={onPublish} />
      </div>
    </div>
  </section>
}
