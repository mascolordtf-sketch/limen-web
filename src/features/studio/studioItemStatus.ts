import type { Origin01StudioValidation } from './origin01StudioValidation'
import type { StudioDomainId, StudioNavigationItem } from './studioNavigation'

export type StudioVisibleItemStatus = {
  readonly complete: boolean
  readonly active?: boolean
  readonly relevantErrorCount: number
  readonly warningCount: number
  readonly blocksPreview: boolean
  readonly hasContentPendingReview: boolean
}

export function selectStudioIssueSummary(validation: Origin01StudioValidation) {
  const relevant = validation.issues.filter(({ relevant }) => relevant)
  return {
    errorCount: relevant.filter(({ severity }) => severity === 'active-error' || severity === 'structural').length,
    warningCount: relevant.filter(({ severity }) => severity === 'warning').length,
    structurallyBlocked: relevant.some(({ severity, blocksPreview }) => severity === 'structural' && blocksPreview),
  }
}

export function selectStudioItemStatus(
  validation: Origin01StudioValidation,
  item: StudioNavigationItem,
  domainId: StudioDomainId,
): StudioVisibleItemStatus {
  const scene = item.sceneId
    ? validation.sceneStatuses.find(({ sceneId }) => sceneId === item.sceneId)
    : undefined
  if (scene) return scene
  const issues = validation.issues.filter((issue) => issue.editorId === item.editorId && issue.relevant)
  const domain = validation.domainStatuses.find((status) => status.domainId === domainId)
  const relevantErrorCount = issues.filter(({ severity }) => severity === 'active-error' || severity === 'structural').length
  const warningCount = issues.filter(({ severity }) => severity === 'warning').length
  return {
    complete: relevantErrorCount === 0,
    relevantErrorCount,
    warningCount,
    blocksPreview: issues.some(({ blocksPreview }) => blocksPreview),
    hasContentPendingReview: issues.some(({ severity }) => severity === 'editorial-review')
      || (issues.length === 0 && Boolean(domain?.hasContentPendingReview)),
  }
}
