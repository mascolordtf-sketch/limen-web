import type { StudioDomainDefinition, StudioNavigationItem } from './studioNavigation'
import type { StudioIssue, StudioIssueSeverity } from './origin01StudioValidation'
import type { StudioNavigationSelection } from './studioNavigation'

export const studioIssueGroupLabels: Record<StudioIssueSeverity, string> = {
  structural: 'Impide ver los cambios actuales', 'active-error': 'Requiere corrección', warning: 'Sugerencias',
  'inactive-content': 'Contenido no incluido', 'editorial-review': 'Lectura final pendiente',
}

export type StudioIssueCorrectionContext = { readonly returnTo: StudioNavigationSelection; readonly issueId: string }
export const createStudioIssueCorrectionContext = (issue: StudioIssue): StudioIssueCorrectionContext => ({
  returnTo: { domainId: 'review', itemId: 'errors', editorId: 'review-errors' }, issueId: issue.id,
})
export const issueNeedsCorrectionReturn = (issue: StudioIssue, destination: StudioNavigationItem) =>
  !(issue.domainId === 'review' && destination.editorId === 'review-errors')
export const resolveStudioCorrectionReturn = (context: StudioIssueCorrectionContext,
  domains: readonly StudioDomainDefinition[]) => domains.find(({ id }) => id === context.returnTo.domainId)?.items
  .find(({ id }) => id === context.returnTo.itemId) ?? null

export function groupStudioIssues(issues: readonly StudioIssue[]) {
  return (Object.keys(studioIssueGroupLabels) as StudioIssueSeverity[]).map((severity) => ({
    severity, label: studioIssueGroupLabels[severity], issues: issues.filter((issue) => issue.severity === severity),
  }))
}

export function resolveStudioIssueDestination(issue: StudioIssue, domains: readonly StudioDomainDefinition[]): StudioNavigationItem | null {
  return domains.find(({ id }) => id === issue.domainId)?.items.find(({ editorId }) => editorId === issue.editorId) ?? null
}

export function resolveStudioStructuralDestination(issue: StudioIssue | undefined,
  domains: readonly StudioDomainDefinition[]) {
  const direct = issue ? resolveStudioIssueDestination(issue, domains) : null
  if (direct && issue) return { domainId: issue.domainId, item: direct, kind: 'direct' as const }
  const fallback = domains.find(({ id }) => id === 'review')?.items.find(({ id }) => id === 'errors')
  return fallback ? { domainId: 'review' as const, item: fallback, kind: 'fallback' as const } : null
}
