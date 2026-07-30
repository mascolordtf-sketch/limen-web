import type { InvitationMediaReference } from '../invitations/engine/invitationTypes'

export const studioMediaKinds = ['image', 'audio'] as const
export type StudioMediaKind = (typeof studioMediaKinds)[number]

export type StudioMediaOrigin = 'canonical' | 'studio'

export type StudioImageAccessibility =
  | { readonly kind: 'informative'; readonly alt: string }
  | { readonly kind: 'decorative' }

type StudioMediaBase = {
  readonly id: string
  readonly origin: StudioMediaOrigin
  readonly originalName?: string
  readonly mimeType?: string
  readonly sizeBytes?: number
  readonly title?: string
}

export type StudioMediaLifecycle =
  | { readonly status: 'pending'; readonly previewSrc?: string }
  | { readonly status: 'processing'; readonly previewSrc?: string; readonly progress?: number }
  | { readonly status: 'ready'; readonly src: string }
  | { readonly status: 'error'; readonly message: string; readonly previewSrc?: string }

export type StudioImageMedia = StudioMediaBase & {
  readonly kind: 'image'
  readonly accessibility: StudioImageAccessibility
} & StudioMediaLifecycle

export type StudioAudioMedia = StudioMediaBase & {
  readonly kind: 'audio'
} & StudioMediaLifecycle

export type StudioMediaItem = StudioImageMedia | StudioAudioMedia

export type StudioMediaCardinality = 'single' | 'ordered-many'

export type StudioMediaSlotDefinition<TSlotId extends string = string> = {
  readonly id: TSlotId
  readonly label: string
  readonly kind: StudioMediaKind
  readonly cardinality: StudioMediaCardinality
  readonly optional: boolean
}

export type StudioMediaAssignment<TSlotId extends string = string> = {
  readonly slotId: TSlotId
  readonly mediaId: string
  readonly position?: number
  readonly accessibility?: StudioImageAccessibility
  readonly focalPoint?: {
    readonly x: number
    readonly y: number
  }
  readonly zoom?: number
}

export type StudioMediaState<TSlotId extends string = string> = {
  readonly items: readonly StudioMediaItem[]
  readonly assignments: readonly StudioMediaAssignment<TSlotId>[]
}

export type StudioMediaValidationErrorCode =
  | 'duplicate-media-id'
  | 'unknown-slot'
  | 'missing-media'
  | 'incompatible-media-kind'
  | 'invalid-cardinality'
  | 'duplicate-position'
  | 'ready-without-source'
  | 'error-without-message'
  | 'missing-informative-alt'
  | 'invalid-focal-point'
  | 'invalid-zoom'

export type StudioMediaValidationError = {
  readonly code: StudioMediaValidationErrorCode
  readonly message: string
  readonly mediaId?: string
  readonly slotId?: string
}

const inferMimeType = (src: string): string | undefined => {
  const path = src.split(/[?#]/, 1)[0]?.toLowerCase() ?? ''
  if (path.endsWith('.webp')) return 'image/webp'
  if (path.endsWith('.png')) return 'image/png'
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg'
  if (path.endsWith('.mp3')) return 'audio/mpeg'
  if (path.endsWith('.ogg')) return 'audio/ogg'
  if (path.endsWith('.wav')) return 'audio/wav'
  return undefined
}

export function normalizeInvitationMediaReference(
  media: InvitationMediaReference,
): StudioMediaItem | null {
  if (media.kind === 'video') return null
  const common = {
    id: media.id,
    origin: 'canonical' as const,
    mimeType: inferMimeType(media.src),
    title: media.title,
    status: 'ready' as const,
    src: media.src,
  }
  if (media.kind === 'audio') return { ...common, kind: 'audio' }
  return {
    ...common,
    kind: 'image',
    accessibility: media.alt?.trim()
      ? { kind: 'informative', alt: media.alt }
      : { kind: 'decorative' },
  }
}

export function findStudioMediaById(
  items: readonly StudioMediaItem[],
  mediaId: string,
): StudioMediaItem | undefined {
  return items.find(({ id }) => id === mediaId)
}

export function getStudioMediaAssignments<TSlotId extends string>(
  assignments: readonly StudioMediaAssignment<TSlotId>[],
  slotId: TSlotId,
): readonly StudioMediaAssignment<TSlotId>[] {
  return assignments
    .filter((assignment) => assignment.slotId === slotId)
    .sort((left, right) => (left.position ?? 0) - (right.position ?? 0))
}

export function isStudioMediaCompatible<TSlotId extends string>(
  slot: StudioMediaSlotDefinition<TSlotId>,
  media: StudioMediaItem,
): boolean {
  return slot.kind === media.kind
}

export function projectRenderableMedia(
  items: readonly StudioMediaItem[],
): readonly InvitationMediaReference[] {
  return items.flatMap((media): readonly InvitationMediaReference[] => {
    if (media.status !== 'ready') return []
    if (media.kind === 'audio') {
      return [{ id: media.id, kind: 'audio', src: media.src, title: media.title }]
    }
    return [{
      id: media.id,
      kind: 'image',
      src: media.src,
      alt: media.accessibility.kind === 'informative' ? media.accessibility.alt : '',
      title: media.title,
    }]
  })
}

export function replaceStudioMediaAssignment<TSlotId extends string>(
  state: StudioMediaState<TSlotId>,
  slots: readonly StudioMediaSlotDefinition<TSlotId>[],
  slotId: TSlotId,
  mediaId: string,
  position?: number,
): { readonly ok: true; readonly state: StudioMediaState<TSlotId> }
  | { readonly ok: false; readonly error: StudioMediaValidationError } {
  const slot = slots.find(({ id }) => id === slotId)
  if (!slot) {
    return { ok: false, error: { code: 'unknown-slot', slotId, message: `El slot "${slotId}" no existe.` } }
  }
  const media = findStudioMediaById(state.items, mediaId)
  if (!media) {
    return { ok: false, error: { code: 'missing-media', slotId, mediaId, message: `El medio "${mediaId}" no existe.` } }
  }
  if (!isStudioMediaCompatible(slot, media)) {
    return {
      ok: false,
      error: {
        code: 'incompatible-media-kind',
        slotId,
        mediaId,
        message: `El medio "${mediaId}" no es compatible con el slot "${slotId}".`,
      },
    }
  }
  if (slot.cardinality === 'ordered-many' && (!Number.isInteger(position) || (position ?? -1) < 0)) {
    return {
      ok: false,
      error: {
        code: 'invalid-cardinality',
        slotId,
        mediaId,
        message: `El slot ordenado "${slotId}" requiere una posición válida.`,
      },
    }
  }

  const assignment: StudioMediaAssignment<TSlotId> = slot.cardinality === 'single'
    ? { slotId, mediaId }
    : { slotId, mediaId, position }
  const assignments = slot.cardinality === 'single'
    ? [...state.assignments.filter((current) => current.slotId !== slotId), assignment]
    : [
        ...state.assignments.filter((current) => current.slotId !== slotId || current.position !== position),
        assignment,
      ]
  return { ok: true, state: { items: state.items, assignments } }
}

export function validateStudioMediaContract<TSlotId extends string>(
  state: StudioMediaState<TSlotId>,
  slots: readonly StudioMediaSlotDefinition<TSlotId>[],
): readonly StudioMediaValidationError[] {
  const errors: StudioMediaValidationError[] = []
  const seenMediaIds = new Set<string>()
  for (const media of state.items) {
    if (seenMediaIds.has(media.id)) {
      errors.push({
        code: 'duplicate-media-id',
        mediaId: media.id,
        message: `El identificador de medio "${media.id}" está repetido.`,
      })
    }
    seenMediaIds.add(media.id)
    if (media.status === 'ready' && media.src.trim().length === 0) {
      errors.push({
        code: 'ready-without-source',
        mediaId: media.id,
        message: `El medio listo "${media.id}" no tiene una fuente renderizable.`,
      })
    }
    if (media.status === 'error' && media.message.trim().length === 0) {
      errors.push({
        code: 'error-without-message',
        mediaId: media.id,
        message: `El medio con error "${media.id}" no describe el problema.`,
      })
    }
    if (media.kind === 'image' && media.accessibility.kind === 'informative'
      && media.accessibility.alt.trim().length === 0) {
      errors.push({
        code: 'missing-informative-alt',
        mediaId: media.id,
        message: `La imagen informativa "${media.id}" no tiene texto alternativo.`,
      })
    }
  }

  for (const assignment of state.assignments) {
    const slot = slots.find(({ id }) => id === assignment.slotId)
    if (!slot) {
      errors.push({
        code: 'unknown-slot',
        slotId: assignment.slotId,
        mediaId: assignment.mediaId,
        message: `El slot "${assignment.slotId}" no existe.`,
      })
      continue
    }
    const media = findStudioMediaById(state.items, assignment.mediaId)
    if (!media) {
      errors.push({
        code: 'missing-media',
        slotId: assignment.slotId,
        mediaId: assignment.mediaId,
        message: `El slot "${assignment.slotId}" referencia el medio inexistente "${assignment.mediaId}".`,
      })
      continue
    }
    if (!isStudioMediaCompatible(slot, media)) {
      errors.push({
        code: 'incompatible-media-kind',
        slotId: assignment.slotId,
        mediaId: assignment.mediaId,
        message: `El medio "${assignment.mediaId}" no es compatible con el slot "${assignment.slotId}".`,
      })
    }
    if (media.kind === 'image' && assignment.accessibility?.kind === 'informative'
      && assignment.accessibility.alt.trim().length === 0) {
      errors.push({
        code: 'missing-informative-alt',
        slotId: assignment.slotId,
        mediaId: assignment.mediaId,
        message: `El uso de la imagen "${assignment.mediaId}" no tiene texto alternativo.`,
      })
    }
    if (assignment.focalPoint && (
      !Number.isFinite(assignment.focalPoint.x)
      || !Number.isFinite(assignment.focalPoint.y)
      || assignment.focalPoint.x < 0
      || assignment.focalPoint.x > 100
      || assignment.focalPoint.y < 0
      || assignment.focalPoint.y > 100
    )) {
      errors.push({
        code: 'invalid-focal-point',
        slotId: assignment.slotId,
        mediaId: assignment.mediaId,
        message: `El encuadre del slot "${assignment.slotId}" está fuera del rango permitido.`,
      })
    }
    if (assignment.zoom !== undefined && (
      !Number.isFinite(assignment.zoom)
      || assignment.zoom < 1
      || assignment.zoom > 2
    )) {
      errors.push({
        code: 'invalid-zoom',
        slotId: assignment.slotId,
        mediaId: assignment.mediaId,
        message: `El zoom del slot "${assignment.slotId}" está fuera del rango permitido.`,
      })
    }
  }

  for (const slot of slots) {
    const assignments = state.assignments.filter((assignment) => assignment.slotId === slot.id)
    if (slot.cardinality === 'single' && assignments.length > 1) {
      errors.push({
        code: 'invalid-cardinality',
        slotId: slot.id,
        message: `El slot único "${slot.id}" tiene más de una asignación.`,
      })
    }
    if (slot.cardinality === 'ordered-many') {
      const positions = new Set<number>()
      for (const assignment of assignments) {
        if (!Number.isInteger(assignment.position) || (assignment.position ?? -1) < 0) {
          errors.push({
            code: 'invalid-cardinality',
            slotId: slot.id,
            mediaId: assignment.mediaId,
            message: `El slot ordenado "${slot.id}" contiene una posición inválida.`,
          })
        } else if (positions.has(assignment.position as number)) {
          errors.push({
            code: 'duplicate-position',
            slotId: slot.id,
            mediaId: assignment.mediaId,
            message: `El slot ordenado "${slot.id}" repite la posición ${assignment.position}.`,
          })
        } else {
          positions.add(assignment.position as number)
        }
      }
    }
  }
  return errors
}
