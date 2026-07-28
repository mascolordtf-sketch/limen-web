import type { StudioDomainDefinition, StudioNavigationItem } from './studioNavigation'
import type { StudioIssue, StudioIssueSeverity } from './origin01StudioValidation'

export const studioIssueGroupLabels: Record<StudioIssueSeverity, string> = {
  structural: 'Bloquea renderizado', 'active-error': 'Requiere corrección', warning: 'Advertencias',
  'inactive-content': 'Contenido inactivo', 'editorial-review': 'Revisión editorial pendiente',
}

export function groupStudioIssues(issues: readonly StudioIssue[]) {
  return (Object.keys(studioIssueGroupLabels) as StudioIssueSeverity[]).map((severity) => ({
    severity, label: studioIssueGroupLabels[severity], issues: issues.filter((issue) => issue.severity === severity),
  }))
}

export function resolveStudioIssueDestination(issue: StudioIssue, domains: readonly StudioDomainDefinition[]): StudioNavigationItem | null {
  return domains.find(({ id }) => id === issue.domainId)?.items.find(({ editorId }) => editorId === issue.editorId) ?? null
}
