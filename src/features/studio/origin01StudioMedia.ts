import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import {
  findStudioMediaById,
  getStudioMediaAssignments,
  normalizeInvitationMediaReference,
  projectRenderableMedia,
  validateStudioMediaContract,
} from './studioMedia'
import type {
  StudioMediaAssignment,
  StudioMediaSlotDefinition,
  StudioMediaState,
} from './studioMedia'

export const origin01MediaSlotIds = [
  'hero.image',
  'dressCode.image',
  'gallery.images',
  'gifts.image',
  'closing.image',
  'music.audio',
] as const

export type Origin01MediaSlotId = (typeof origin01MediaSlotIds)[number]
export type Origin01StudioMediaState = StudioMediaState<Origin01MediaSlotId>

export const origin01MediaSlots = [
  { id: 'hero.image', label: 'Imagen de portada', kind: 'image', cardinality: 'single', optional: false },
  { id: 'dressCode.image', label: 'Imagen de Dress Code', kind: 'image', cardinality: 'single', optional: true },
  { id: 'gallery.images', label: 'Imágenes de galería', kind: 'image', cardinality: 'ordered-many', optional: true },
  { id: 'gifts.image', label: 'Imagen de regalos', kind: 'image', cardinality: 'single', optional: true },
  { id: 'closing.image', label: 'Imagen de cierre', kind: 'image', cardinality: 'single', optional: false },
  { id: 'music.audio', label: 'Música', kind: 'audio', cardinality: 'single', optional: true },
] as const satisfies readonly StudioMediaSlotDefinition<Origin01MediaSlotId>[]

export function createOrigin01StudioMediaState(
  invitation: Origin01InvitationData,
): Origin01StudioMediaState {
  const assignments: StudioMediaAssignment<Origin01MediaSlotId>[] = [
    { slotId: 'hero.image', mediaId: invitation.content.hero.imageMediaId },
    { slotId: 'dressCode.image', mediaId: invitation.content.dressCode.imageMediaId },
    ...invitation.content.gallery.images.map(({ mediaId }, position) => ({
      slotId: 'gallery.images' as const,
      mediaId,
      position,
    })),
    { slotId: 'gifts.image', mediaId: invitation.content.gifts.imageMediaId },
    { slotId: 'closing.image', mediaId: invitation.content.closing.imageMediaId },
    { slotId: 'music.audio', mediaId: invitation.content.music.mediaId },
  ]
  return {
    items: invitation.media.flatMap((media) => {
      const normalized = normalizeInvitationMediaReference(media)
      return normalized ? [normalized] : []
    }),
    assignments,
  }
}

const singleMediaId = (
  state: Origin01StudioMediaState,
  slotId: Origin01MediaSlotId,
  fallback: string,
) => getStudioMediaAssignments(state.assignments, slotId)[0]?.mediaId ?? fallback

const projectedAssignment = (
  state: Origin01StudioMediaState,
  assignment: StudioMediaAssignment<Origin01MediaSlotId> | undefined,
  fallback = '',
) => {
  if (!assignment) return { mediaId: fallback }
  if (!assignment.focalPoint) return { mediaId: assignment.mediaId }
  const media = findStudioMediaById(state.items, assignment.mediaId)
  if (!media || media.kind !== 'image' || media.status !== 'ready') return { mediaId: assignment.mediaId }
  return {
    mediaId: `studio-slot:${assignment.slotId}:${assignment.position ?? 0}:${assignment.mediaId}`,
    media: {
      ...projectRenderableMedia([media])[0],
      id: `studio-slot:${assignment.slotId}:${assignment.position ?? 0}:${assignment.mediaId}`,
      focalPoint: assignment.focalPoint,
    },
  }
}

export function deriveOrigin01MediaInvitation(
  invitation: Origin01InvitationData,
  state: Origin01StudioMediaState,
): Origin01InvitationData {
  const galleryAssignments = getStudioMediaAssignments(state.assignments, 'gallery.images')
  const hero = projectedAssignment(state, getStudioMediaAssignments(state.assignments, 'hero.image')[0],
    invitation.content.hero.imageMediaId)
  const dressCode = projectedAssignment(state, getStudioMediaAssignments(state.assignments, 'dressCode.image')[0],
    '')
  const gifts = projectedAssignment(state, getStudioMediaAssignments(state.assignments, 'gifts.image')[0],
    '')
  const closing = projectedAssignment(state, getStudioMediaAssignments(state.assignments, 'closing.image')[0],
    invitation.content.closing.imageMediaId)
  const gallery = galleryAssignments.map((assignment) => projectedAssignment(state, assignment, assignment.mediaId))
  const projected = [hero.media, dressCode.media, gifts.media, closing.media, ...gallery.map(({ media }) => media)]
    .filter((media): media is NonNullable<typeof media> => Boolean(media))
  return {
    ...invitation,
    media: [...projectRenderableMedia(state.items), ...projected],
    content: {
      ...invitation.content,
      hero: {
        ...invitation.content.hero,
        imageMediaId: hero.mediaId,
      },
      dressCode: {
        ...invitation.content.dressCode,
        imageMediaId: dressCode.mediaId,
      },
      gallery: {
        ...invitation.content.gallery,
        images: gallery.map((assignment, index) => ({
          mediaId: assignment.mediaId,
          caption: invitation.content.gallery.images[index]?.caption,
        })),
      },
      gifts: {
        ...invitation.content.gifts,
        imageMediaId: gifts.mediaId,
      },
      closing: {
        ...invitation.content.closing,
        imageMediaId: closing.mediaId,
      },
      music: {
        mediaId: singleMediaId(state, 'music.audio', invitation.content.music.mediaId),
      },
    },
  }
}

export function validateOrigin01StudioMedia(state: Origin01StudioMediaState) {
  return validateStudioMediaContract(state, origin01MediaSlots)
}
