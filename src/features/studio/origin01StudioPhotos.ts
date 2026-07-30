import {
  getStudioMediaAssignments,
  replaceStudioMediaAssignment,
} from './studioMedia'
import type { StudioImageAccessibility, StudioImageMedia } from './studioMedia'
import {
  origin01MediaSlots,
} from './origin01StudioMedia'
import type { Origin01MediaSlotId, Origin01StudioMediaState } from './origin01StudioMedia'

export const origin01PhotoSlotIds = [
  'hero.image',
  'dressCode.image',
  'gifts.image',
  'closing.image',
] as const

export type Origin01SinglePhotoSlotId = (typeof origin01PhotoSlotIds)[number]

const normalizeGalleryPositions = (state: Origin01StudioMediaState): Origin01StudioMediaState => {
  let position = 0
  return {
    ...state,
    assignments: state.assignments.map((assignment) => assignment.slotId === 'gallery.images'
      ? { ...assignment, position: position++ }
      : assignment),
  }
}

const pruneUnassignedStudioImages = (state: Origin01StudioMediaState): Origin01StudioMediaState => {
  const assigned = new Set(state.assignments.map(({ mediaId }) => mediaId))
  return {
    ...state,
    items: state.items.filter((item) => item.origin === 'canonical' || assigned.has(item.id)
      || item.kind === 'image' && item.status !== 'ready'),
  }
}

export function addStudioPhotoItem(
  state: Origin01StudioMediaState,
  item: StudioImageMedia,
): Origin01StudioMediaState {
  const assigned = new Set(state.assignments.map(({ mediaId }) => mediaId))
  return {
    ...state,
    items: [
      ...state.items.filter((current) => current.id !== item.id
        && (current.origin === 'canonical' || assigned.has(current.id)
          || current.status === 'pending' || current.status === 'processing')),
      item,
    ],
  }
}

export function updateStudioPhotoItem(
  state: Origin01StudioMediaState,
  mediaId: string,
  updater: (item: StudioImageMedia) => StudioImageMedia,
): Origin01StudioMediaState {
  return {
    ...state,
    items: state.items.map((item) => item.id === mediaId && item.kind === 'image' ? updater(item) : item),
  }
}

export function discardStudioPhotoItem(
  state: Origin01StudioMediaState,
  mediaId: string,
): Origin01StudioMediaState {
  return {
    items: state.items.filter(({ id }) => id !== mediaId),
    assignments: state.assignments.filter((assignment) => assignment.mediaId !== mediaId),
  }
}

export function assignStudioPhoto(
  state: Origin01StudioMediaState,
  slotId: Origin01MediaSlotId,
  mediaId: string,
  position?: number,
): Origin01StudioMediaState {
  const replacement = replaceStudioMediaAssignment(state, origin01MediaSlots, slotId, mediaId, position)
  return replacement.ok ? pruneUnassignedStudioImages(replacement.state) : state
}

export function removeStudioPhotoAssignment(
  state: Origin01StudioMediaState,
  slotId: Origin01MediaSlotId,
  position?: number,
): Origin01StudioMediaState {
  return pruneUnassignedStudioImages(normalizeGalleryPositions({
    ...state,
    assignments: state.assignments.filter((assignment) => assignment.slotId !== slotId
      || slotId === 'gallery.images' && assignment.position !== position),
  }))
}

export function moveStudioGalleryPhoto(
  state: Origin01StudioMediaState,
  from: number,
  to: number,
): Origin01StudioMediaState {
  const gallery = [...getStudioMediaAssignments(state.assignments, 'gallery.images')]
  if (from < 0 || from >= gallery.length || to < 0 || to >= gallery.length || from === to) return state
  const [moved] = gallery.splice(from, 1)
  gallery.splice(to, 0, moved)
  return {
    ...state,
    assignments: [
      ...state.assignments.filter(({ slotId }) => slotId !== 'gallery.images'),
      ...gallery.map((assignment, position) => ({ ...assignment, position })),
    ],
  }
}

export function updateStudioPhotoAccessibility(
  state: Origin01StudioMediaState,
  mediaId: string,
  accessibility: StudioImageAccessibility,
): Origin01StudioMediaState {
  return updateStudioPhotoItem(state, mediaId, (item) => ({ ...item, accessibility }))
}

export function updateStudioPhotoFocalPoint(
  state: Origin01StudioMediaState,
  slotId: Origin01MediaSlotId,
  position: number | undefined,
  axis: 'x' | 'y',
  value: number,
): Origin01StudioMediaState {
  const bounded = Math.max(0, Math.min(100, Math.round(value)))
  return {
    ...state,
    assignments: state.assignments.map((assignment) => assignment.slotId === slotId
      && (slotId !== 'gallery.images' || assignment.position === position)
      ? {
          ...assignment,
          focalPoint: {
            x: assignment.focalPoint?.x ?? 50,
            y: assignment.focalPoint?.y ?? 50,
            [axis]: bounded,
          },
        }
      : assignment),
  }
}

export function updateStudioPhotoZoom(
  state: Origin01StudioMediaState,
  slotId: Origin01MediaSlotId,
  position: number | undefined,
  value: number,
): Origin01StudioMediaState {
  const bounded = Math.max(1, Math.min(2, Math.round(value * 100) / 100))
  return {
    ...state,
    assignments: state.assignments.map((assignment) => {
      if (assignment.slotId !== slotId
        || slotId === 'gallery.images' && assignment.position !== position) return assignment
      if (bounded === 1) {
        return { ...assignment, zoom: undefined }
      }
      return { ...assignment, zoom: bounded }
    }),
  }
}
