import type { StudioIssue } from './origin01StudioValidation'

export const isStudioPreviewCloseKey = (key: string) => key === 'Escape'

export function restoreStudioPreviewOpener(opener: HTMLElement | null) {
  if (!opener?.isConnected) return false
  opener.focus()
  return true
}

export function focusStudioIssueDestination(issue: StudioIssue, root: Pick<Document, 'getElementById' | 'querySelector'> = document) {
  const destination = issue.fieldTargetId ? root.getElementById(issue.fieldTargetId) : null
  const focusTarget = destination ?? root.querySelector<HTMLElement>(
    '.limen-studio__contextual-editor h2, .limen-studio__stage-heading h2',
  )
  focusTarget?.focus()
  return destination ? 'field' : focusTarget ? 'heading' : 'unavailable'
}

export function focusStudioEditorHeading(root: Pick<Document, 'querySelector'> = document) {
  const heading = root.querySelector<HTMLElement>(
    '.limen-studio__contextual-editor h2, .limen-studio__stage-heading h2',
  )
  heading?.focus()
  return Boolean(heading)
}

export function focusStudioReviewHeading(root: Pick<Document, 'querySelector'> = document) {
  const heading = root.querySelector<HTMLElement>('.limen-studio__review-title')
  heading?.focus()
  return Boolean(heading)
}
