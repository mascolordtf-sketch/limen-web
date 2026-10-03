export const studioAutosaveDelayMs = 2_000

export type StudioSaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'conflict'

export type StudioSaveState = {
  readonly status: StudioSaveStatus
  readonly message?: string
}

type StudioAutosaveState = {
  readonly dirty: boolean
  readonly hasTemporaryMedia: boolean
  readonly saveStatus: StudioSaveStatus
}

export function shouldScheduleStudioAutosave({ dirty, hasTemporaryMedia, saveStatus }: StudioAutosaveState): boolean {
  return dirty && !hasTemporaryMedia && (saveStatus === 'idle' || saveStatus === 'saved')
}
