import { replaceStudioMediaAssignment } from './studioMedia'
import type { StudioAudioMedia } from './studioMedia'
import { origin01MediaSlots } from './origin01StudioMedia'
import type { Origin01StudioMediaState } from './origin01StudioMedia'

const pruneUnassignedStudioAudio = (state: Origin01StudioMediaState): Origin01StudioMediaState => {
  const assigned = new Set(state.assignments.map(({ mediaId }) => mediaId))
  return {
    ...state,
    items: state.items.filter((item) => item.origin === 'canonical' || assigned.has(item.id)
      || item.kind === 'audio' && item.status !== 'ready'),
  }
}

export function addStudioAudioItem(
  state: Origin01StudioMediaState,
  item: StudioAudioMedia,
): Origin01StudioMediaState {
  return {
    ...state,
    items: [...state.items.filter(({ id }) => id !== item.id), item],
  }
}

export function assignStudioMusic(
  state: Origin01StudioMediaState,
  mediaId: string,
): Origin01StudioMediaState {
  const replacement = replaceStudioMediaAssignment(state, origin01MediaSlots, 'music.audio', mediaId)
  return replacement.ok ? pruneUnassignedStudioAudio(replacement.state) : state
}

export function removeStudioMusicAssignment(
  state: Origin01StudioMediaState,
): Origin01StudioMediaState {
  return pruneUnassignedStudioAudio({
    ...state,
    assignments: state.assignments.filter(({ slotId }) => slotId !== 'music.audio'),
  })
}
