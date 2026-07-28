import type { MouseEvent } from 'react'
import type { InvitationAudience } from '../invitations/engine/invitationTypes'
import type { Origin01StudioValidation, StudioIssue } from './origin01StudioValidation'
import type { StudioDomainDefinition } from './studioNavigation'
import { groupStudioIssues, resolveStudioIssueDestination } from './studioReviewIssues'

type Props = { kind: 'status' | 'errors' | 'audiences'; validation: Origin01StudioValidation;
  domains: readonly StudioDomainDefinition[]; showing: 'current' | 'last-renderable' | 'unavailable'; audience: InvitationAudience;
  onIssue: (issue: StudioIssue) => void; onAudience: (value: InvitationAudience) => void; onPreview: (event: MouseEvent<HTMLButtonElement>) => void }

export function StudioReviewPanel({ kind, validation, domains, showing, audience, onIssue, onAudience, onPreview }: Props) {
  const counts = (severity: StudioIssue['severity']) => validation.issues.filter((issue) => issue.severity === severity).length
  if (kind === 'status') return <section className="limen-studio__panel"><h2>Estado general</h2><dl className="limen-studio__review-status">
    <div><dt>Renderizable</dt><dd>{validation.structurallyValid ? 'Sí' : 'No'}</dd></div>
    <div><dt>Preview</dt><dd>{showing === 'current' ? 'Borrador actual' : showing === 'last-renderable' ? 'Último borrador renderizable' : 'No disponible'}</dd></div>
    <div><dt>Correcciones activas</dt><dd>{counts('active-error')}</dd></div><div><dt>Advertencias</dt><dd>{counts('warning')}</dd></div>
    <div><dt>Contenido inactivo conservado</dt><dd>{counts('inactive-content')}</dd></div><div><dt>Revisión editorial</dt><dd>{counts('editorial-review') ? 'Pendiente' : 'Completa'}</dd></div>
  </dl></section>
  if (kind === 'audiences') return <section className="limen-studio__panel"><h2>Audiencias</h2>
    <p>Cambiar la audiencia reinicia la experiencia desde el comienzo.</p><div className="limen-studio__review-actions">
      <button type="button" aria-pressed={audience === 'protagonist'} onClick={() => onAudience('protagonist')}>Revisar como protagonista</button>
      <button type="button" aria-pressed={audience === 'guest'} onClick={() => onAudience('guest')}>Revisar como invitado</button>
      <button type="button" onClick={onPreview}>Abrir preview</button></div></section>
  return <section className="limen-studio__panel"><h2>Problemas del borrador</h2>
    {groupStudioIssues(validation.issues).map((group) => <section key={group.severity} className="limen-studio__issue-group">
      <h3>{group.label} ({group.issues.length})</h3>{group.issues.length === 0 ? <p>Sin elementos.</p> : <ul>{group.issues.map((issue) => {
        const destination = resolveStudioIssueDestination(issue, domains)
        return <li key={issue.id}><p>{issue.message}</p><small>Dominio: {issue.domainId}{issue.sceneId ? ` · Escena: ${issue.sceneId}` : ''}{issue.fieldId ? ` · Campo: ${issue.fieldId}` : ''}</small>
          {destination ? <button type="button" onClick={() => onIssue(issue)}>Corregir en {destination.label}</button> : <span>Destino no disponible</span>}</li>
      })}</ul>}</section>)}</section>
}
