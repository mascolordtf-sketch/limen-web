import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import {
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

export function deriveOrigin01MediaInvitation(
  invitation: Origin01InvitationData,
  state: Origin01StudioMediaState,
): Origin01InvitationData {
  const galleryAssignments = getStudioMediaAssignments(state.assignments, 'gallery.images')
  return {
    ...invitation,
    media: projectRenderableMedia(state.items),
    content: {
      ...invitation.content,
      hero: {
        ...invitation.content.hero,
        imageMediaId: singleMediaId(state, 'hero.image', invitation.content.hero.imageMediaId),
      },
      dressCode: {
        ...invitation.content.dressCode,
        imageMediaId: singleMediaId(state, 'dressCode.image', invitation.content.dressCode.imageMediaId),
      },
      gallery: {
        ...invitation.content.gallery,
        images: galleryAssignments.map((assignment, index) => ({
          mediaId: assignment.mediaId,
          caption: invitation.content.gallery.images[index]?.caption,
        })),
      },
      gifts: {
        ...invitation.content.gifts,
        imageMediaId: singleMediaId(state, 'gifts.image', invitation.content.gifts.imageMediaId),
      },
      closing: {
        ...invitation.content.closing,
        imageMediaId: singleMediaId(state, 'closing.image', invitation.content.closing.imageMediaId),
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
