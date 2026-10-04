import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'

import { findStudioMediaById, getStudioMediaAssignments } from './studioMedia'
import type { StudioImageMedia } from './studioMedia'
import type { Origin01MediaSlotId, Origin01StudioMediaState } from './origin01StudioMedia'
import {
  addStudioPhotoItem,
  assignStudioPhoto,
  moveStudioGalleryPhoto,
  removeStudioPhotoAssignment,
  updateStudioPhotoAccessibility,
  updateStudioPhotoFocalPoint,
  updateStudioPhotoItem,
  updateStudioPhotoZoom,
} from './origin01StudioPhotos'
import { createPendingStudioPhoto, processStudioPhoto, validateStudioPhotoFile } from './studioPhotoProcessing'
import { createStudioMediaAssetId } from './studioMediaStorage'
import type { StudioMediaUploadInput } from './studioMediaStorage'
import type { StudioSceneId } from './studioScenes'

type MediaUpdater = (updater: (current: Origin01StudioMediaState) => Origin01StudioMediaState) => void

type StudioPhotographyManagerProps = {
  state: Origin01StudioMediaState
  initialState: Origin01StudioMediaState
  protagonistName: string
  initialGalleryCaptions: readonly string[]
  onMediaChange: MediaUpdater
  onGalleryCaptionsChange: (updater: (current: readonly string[]) => readonly string[]) => void
  onUploadMedia: (input: StudioMediaUploadInput) => Promise<{ readonly storageKey: string; readonly src: string }>
  selectedTarget?: StudioPhotoTarget
  onSelectedTargetChange?: (target?: StudioPhotoTarget) => void
  editingTarget?: StudioPhotoTarget
  onEditingTargetChange?: (target?: StudioPhotoTarget) => void
}

export type StudioPhotoTarget = {
  readonly key: string
  readonly slotId: Origin01MediaSlotId
  readonly label: string
  readonly position?: number
  readonly previewScene: StudioSceneId
}

const singleTargets = [
  { key: 'hero', slotId: 'hero.image', label: 'Portada', previewScene: 'cover' },
  { key: 'dress', slotId: 'dressCode.image', label: 'Dress Code', previewScene: 'dress-code' },
  { key: 'gifts', slotId: 'gifts.image', label: 'Regalos', previewScene: 'gifts' },
  { key: 'closing', slotId: 'closing.image', label: 'Cierre', previewScene: 'closing' },
] as const satisfies readonly StudioPhotoTarget[]

const defaultAlt = (label: string, name: string) =>
  `${label === 'Galería' ? 'Fotografía' : `Imagen de ${label.toLowerCase()}`} de ${name.trim() || 'la protagonista'}`

const photographyFingerprint = (state: Origin01StudioMediaState) => JSON.stringify({
  items: state.items.filter(({ kind }) => kind === 'image'),
  assignments: state.assignments.filter(({ slotId }) => slotId !== 'music.audio'),
})

const targetLabel = (target: StudioPhotoTarget) => target.slotId === 'gallery.images'
  ? `Foto ${(target.position ?? 0) + 1}`
  : target.label

type StudioPhotoCardProps = {
  target: StudioPhotoTarget
  media?: StudioImageMedia
  focalPoint?: { readonly x: number; readonly y: number }
  zoom?: number
  selected: boolean
  disabled: boolean
  processing: boolean
  error?: string
  dragHandle?: ReactNode
  overlay?: boolean
  onSelect: () => void
}

function StudioPhotoCard({
  target, media, focalPoint, zoom = 1, selected, disabled, processing, error, dragHandle, overlay, onSelect,
}: StudioPhotoCardProps) {
  const src = media?.status === 'ready' ? media.src : media?.previewSrc

  return <article className={`limen-studio__photo-card${selected ? ' is-selected' : ''}${overlay ? ' is-overlay' : ''}`}>
    <button id={overlay ? undefined : `studio-photo-select-${target.key}`}
      className="limen-studio__photo-card-select" type="button" disabled={disabled || overlay}
      aria-pressed={selected} aria-label={`Seleccionar ${targetLabel(target)}`} onClick={onSelect}>
      <span className="limen-studio__photo-preview">
        {src ? <img src={src} alt="" style={{
          objectPosition: `${focalPoint?.x ?? 50}% ${focalPoint?.y ?? 50}%`,
          transform: `scale(${zoom})`,
          transformOrigin: `${focalPoint?.x ?? 50}% ${focalPoint?.y ?? 50}%`,
        }} /> : <span>Sin fotografía</span>}
        {processing && <span className="limen-studio__photo-progress">Procesando…</span>}
      </span>
      <span className="limen-studio__photo-card-caption">
        <strong>{targetLabel(target)}</strong>
        {selected && <small>Seleccionada</small>}
      </span>
    </button>
    {dragHandle}
    {error && <p className="limen-studio__field-error" role="alert">{error}</p>}
  </article>
}

function SortableStudioPhotoCard({ sortableId, ...props }: StudioPhotoCardProps & { sortableId: string }) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId, disabled: props.disabled })
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return <div ref={setNodeRef} style={style}
    className={`limen-studio__sortable-photo${isDragging ? ' is-dragging' : ''}`}>
    <StudioPhotoCard {...props} dragHandle={<button ref={setActivatorNodeRef}
      className="limen-studio__photo-drag-handle" type="button" disabled={props.disabled}
      aria-label={`Reordenar ${targetLabel(props.target)}`} {...attributes} {...listeners}>
      <span aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
    </button>} />
  </div>
}

function StudioPhotoInspector({
  target, media, canonical, canRemove, disabled, processing, onChoose, onEdit, onReset, onRemove,
}: {
  target: StudioPhotoTarget
  media?: StudioImageMedia
  canonical: boolean
  canRemove: boolean
  disabled: boolean
  processing: boolean
  onChoose: (file: File) => void
  onEdit: () => void
  onReset: () => void
  onRemove: () => void
}) {
  const inputId = useId()
  const actionsMenuRef = useRef<HTMLDetailsElement>(null)
  const closeActionsMenu = () => actionsMenuRef.current?.removeAttribute('open')
  const runMenuAction = (action: () => void) => {
    closeActionsMenu()
    action()
  }
  const hasSecondaryActions = !canonical || canRemove

  return <section className="limen-studio__photo-inspector" aria-label={`Acciones para ${targetLabel(target)}`}>
    <div className="limen-studio__photo-inspector-copy">
      <strong>{targetLabel(target)}</strong>
      <span>{target.slotId === 'gallery.images'
        ? 'Esta fotografía forma parte de la galería.'
        : 'Esta imagen se muestra en una escena fija de la invitación.'}</span>
    </div>
    <div className="limen-studio__photo-inspector-actions">
      <button type="button" disabled={disabled || !media} onClick={onEdit}>Reencuadrar</button>
      <label className="limen-studio__photo-action" htmlFor={inputId}>
        {media ? 'Reemplazar' : 'Elegir fotografía'}
      </label>
      <input id={inputId} className="limen-studio__visually-hidden" type="file"
        accept="image/jpeg,image/png,image/webp" disabled={disabled}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0]
          event.currentTarget.value = ''
          if (file) onChoose(file)
        }} />
      {hasSecondaryActions && <details className="limen-studio__photo-actions-menu" ref={actionsMenuRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) closeActionsMenu()
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return
          closeActionsMenu()
          event.currentTarget.querySelector<HTMLElement>('summary')?.focus()
        }}>
        <summary aria-label={`Más acciones para ${targetLabel(target)}`}><span aria-hidden="true">•••</span></summary>
        <div>
          {!canonical && <button type="button" onClick={() => runMenuAction(onReset)}
            disabled={disabled}>Restablecer</button>}
          {canRemove && <button className="limen-studio__photo-destructive-action" type="button"
            onClick={() => runMenuAction(onRemove)} disabled={disabled}>Quitar</button>}
        </div>
      </details>}
    </div>
    {processing && <p className="limen-studio__photo-inspector-status" role="status">Preparando fotografía…</p>}
  </section>
}

function StudioPhotoEditor({
  target, alt, focalPoint, zoom = 1, canonical, disabled, error, headingRef,
  onClose, onReset, onAltChange, onFocalPoint, onZoom,
}: {
  target: StudioPhotoTarget
  alt: string
  focalPoint?: { readonly x: number; readonly y: number }
  zoom?: number
  canonical: boolean
  disabled: boolean
  error?: string
  headingRef: RefObject<HTMLHeadingElement | null>
  onClose: () => void
  onReset: () => void
  onAltChange: (value: string) => void
  onFocalPoint: (axis: 'x' | 'y', value: number) => void
  onZoom: (value: number) => void
}) {
  const horizontal = focalPoint?.x ?? 50
  const vertical = focalPoint?.y ?? 50
  const formattedZoom = zoom.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return <>
    <button className="limen-studio__photo-editor-back" type="button" onClick={onClose}>
      <span aria-hidden="true">←</span> Volver a fotografías
    </button>
    <header className="limen-studio__photo-editor-heading">
      <p className="limen-studio__eyebrow">Encuadre</p>
      <h3 id="studio-photo-editor-title" ref={headingRef} tabIndex={-1}>{targetLabel(target)}</h3>
      <p>La vista previa está ubicada en la escena real. Ajustá la imagen y mirá el resultado a la derecha.</p>
    </header>
    <div className="limen-studio__photo-editor-form">
      <fieldset className="limen-studio__photo-editor-framing">
        <legend>Encuadre</legend>
        <label><span>Posición horizontal <output>{horizontal}%</output></span>
          <input type="range" min="0" max="100" value={horizontal} disabled={disabled}
            onChange={(event) => onFocalPoint('x', Number(event.target.value))} />
        </label>
        <label><span>Posición vertical <output>{vertical}%</output></span>
          <input type="range" min="0" max="100" value={vertical} disabled={disabled}
            onChange={(event) => onFocalPoint('y', Number(event.target.value))} />
        </label>
        <label><span>Zoom <output>{formattedZoom}×</output></span>
          <input type="range" min="1" max="2" step=".05" value={zoom} disabled={disabled}
            aria-valuetext={`${zoom.toLocaleString('es-AR', { maximumFractionDigits: 2 })} aumentos`}
            onChange={(event) => onZoom(Number(event.target.value))} />
        </label>
      </fieldset>
      <details className="limen-studio__photo-editor-accessibility">
        <summary><span>Descripción de la foto</span><small>Accesibilidad</small></summary>
        <label>Descripción accesible
          <input type="text" value={alt} maxLength={180} disabled={disabled}
            onChange={(event) => onAltChange(event.target.value)} />
          <small>Contá brevemente qué se ve para quienes usan lectores de pantalla.</small>
        </label>
      </details>
      {error && <p className="limen-studio__field-error" role="alert">{error}</p>}
      {!canonical && <button className="limen-studio__photo-editor-reset" type="button"
        disabled={disabled} onClick={onReset}>Restablecer esta foto</button>}
    </div>
  </>
}

export function StudioPhotographyManager({
  state, initialState, protagonistName, initialGalleryCaptions,
  onMediaChange, onGalleryCaptionsChange, onUploadMedia,
  selectedTarget, onSelectedTargetChange, editingTarget, onEditingTargetChange,
}: StudioPhotographyManagerProps) {
  const [busyTarget, setBusyTarget] = useState<string>()
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({})
  const [galleryOrderAnnouncement, setGalleryOrderAnnouncement] = useState('')
  const [activeGalleryId, setActiveGalleryId] = useState<string>()
  const editorHeadingRef = useRef<HTMLHeadingElement>(null)
  const editorOpenerKeyRef = useRef<string | undefined>(undefined)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const galleryAssignments = getStudioMediaAssignments(state.assignments, 'gallery.images')
  const galleryIds = galleryAssignments.map(({ mediaId }) => mediaId)
  const photographyChanged = photographyFingerprint(state) !== photographyFingerprint(initialState)
  const assignmentFor = (target: StudioPhotoTarget, source = state) =>
    getStudioMediaAssignments(source.assignments, target.slotId)
      .find((assignment) => target.slotId !== 'gallery.images' || assignment.position === target.position)

  const resolveTarget = (target: StudioPhotoTarget) => {
    const assignment = assignmentFor(target)
    const initial = assignmentFor(target, initialState)
    const found = assignment ? findStudioMediaById(state.items, assignment.mediaId) : undefined
    const media = found?.kind === 'image' ? found : undefined
    const accessibility = assignment?.accessibility ?? media?.accessibility
    const alt = accessibility?.kind === 'informative' ? accessibility.alt : ''
    const accessibilityError = accessibility?.kind === 'informative' && alt.trim().length === 0
      ? 'Describí brevemente qué muestra esta fotografía.'
      : undefined
    return {
      assignment,
      initial,
      media,
      alt,
      accessibilityError,
      canonical: JSON.stringify(assignment) === JSON.stringify(initial),
    }
  }

  const galleryTargetAt = (position: number): StudioPhotoTarget => ({
    key: `gallery-${galleryAssignments[position]?.mediaId ?? position}`,
    slotId: 'gallery.images',
    label: 'Galería',
    position,
    previewScene: 'gallery',
  })

  useEffect(() => {
    if (editingTarget) editorHeadingRef.current?.focus()
  }, [editingTarget])

  const closeEditor = () => {
    onEditingTargetChange?.(undefined)
    requestAnimationFrame(() => {
      if (!editorOpenerKeyRef.current) return
      document.getElementById(`studio-photo-select-${editorOpenerKeyRef.current}`)?.focus()
    })
  }

  const beginEditing = (target: StudioPhotoTarget) => {
    editorOpenerKeyRef.current = target.key
    onSelectedTargetChange?.(target)
    onEditingTargetChange?.(target)
  }

  const choosePhoto = async (target: StudioPhotoTarget, file: File) => {
    const validationError = validateStudioPhotoFile(file)
    if (validationError) {
      setErrors((current) => ({ ...current, [target.key]: validationError }))
      return
    }
    const id = createStudioMediaAssetId()
    setErrors((current) => ({ ...current, [target.key]: '' }))
    setBusyTarget(target.key)
    onMediaChange((current) => addStudioPhotoItem(current,
      createPendingStudioPhoto(id, file, defaultAlt(target.label, protagonistName))))
    onMediaChange((current) => updateStudioPhotoItem(current, id, (item) => ({
      ...item, status: 'processing', progress: 20,
    })))
    try {
      const processed = await processStudioPhoto(file)
      const persisted = await onUploadMedia({
        id,
        kind: 'image',
        body: processed.blob,
        mimeType: processed.mimeType,
        originalFilename: file.name,
      })
      onMediaChange((current) => assignStudioPhoto(updateStudioPhotoItem(current, id, (item) => ({
        ...item,
        mimeType: processed.mimeType,
        sizeBytes: processed.blob.size,
        status: 'ready',
        storageKey: persisted.storageKey,
        src: persisted.src,
      })), target.slotId, id, target.position))
      if (target.slotId === 'gallery.images' && target.position === galleryAssignments.length) {
        onGalleryCaptionsChange((current) => [...current, ''])
      }
      onSelectedTargetChange?.(target.slotId === 'gallery.images'
        ? { ...target, key: `gallery-${id}` }
        : target)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'No pudimos preparar la imagen.'
      onMediaChange((current) => updateStudioPhotoItem(current, id, (item) => ({
        ...item, status: 'error', message,
      })))
      setErrors((current) => ({ ...current, [target.key]: message }))
    } finally {
      setBusyTarget(undefined)
    }
  }

  const resetTarget = (target: StudioPhotoTarget) => {
    const initial = assignmentFor(target, initialState)
    const initialMedia = initial ? findStudioMediaById(initialState.items, initial.mediaId) : undefined
    onMediaChange((current) => {
      if (!initial || !initialMedia) return removeStudioPhotoAssignment(current, target.slotId, target.position)
      const withInitialMedia = current.items.some(({ id }) => id === initialMedia.id)
        ? current
        : { ...current, items: [...current.items, initialMedia] }
      const restored = assignStudioPhoto(withInitialMedia, target.slotId, initialMedia.id, target.position)
      return {
        ...restored,
        assignments: restored.assignments.map((assignment) => assignment.slotId === target.slotId
          && (target.slotId !== 'gallery.images' || assignment.position === target.position)
          ? { ...initial }
          : assignment),
      }
    })
    setErrors((current) => ({ ...current, [target.key]: '' }))
    if (!initial) {
      if (editingTarget?.key === target.key) closeEditor()
      if (selectedTarget?.key === target.key) onSelectedTargetChange?.(undefined)
    } else if (target.slotId === 'gallery.images') {
      onSelectedTargetChange?.({ ...target, key: `gallery-${initial.mediaId}` })
    }
  }

  const removeTarget = (target: StudioPhotoTarget) => {
    onMediaChange((current) => removeStudioPhotoAssignment(current, target.slotId, target.position))
    if (target.slotId === 'gallery.images' && target.position !== undefined) {
      onGalleryCaptionsChange((current) => current.filter((_, position) => position !== target.position))
    }
    if (selectedTarget?.key === target.key) onSelectedTargetChange?.(undefined)
  }

  const moveGalleryPhoto = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= galleryAssignments.length
      || to >= galleryAssignments.length) return
    onMediaChange((current) => moveStudioGalleryPhoto(current, from, to))
    onGalleryCaptionsChange((current) => {
      const next = [...current]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
    setErrors((current) => Object.fromEntries(
      Object.entries(current).filter(([key]) => !key.startsWith('gallery-')),
    ))
    setGalleryOrderAnnouncement(`La foto ${from + 1} ahora ocupa la posición ${to + 1}.`)
  }

  const handleDragStart = ({ active }: DragStartEvent) => {
    const id = String(active.id)
    setActiveGalleryId(id)
    const position = galleryIds.indexOf(id)
    if (position >= 0) onSelectedTargetChange?.(galleryTargetAt(position))
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveGalleryId(undefined)
    if (!over || active.id === over.id) return
    const from = galleryIds.indexOf(String(active.id))
    const to = galleryIds.indexOf(String(over.id))
    if (from < 0 || to < 0) return
    const movedTarget = galleryTargetAt(from)
    moveGalleryPhoto(from, to)
    onSelectedTargetChange?.({ ...movedTarget, position: to })
  }

  const renderCard = (target: StudioPhotoTarget, sortableId?: string) => {
    const resolved = resolveTarget(target)
    const cardProps: StudioPhotoCardProps = {
      target,
      media: resolved.media,
      focalPoint: resolved.assignment?.focalPoint,
      zoom: resolved.assignment?.zoom,
      selected: selectedTarget?.key === target.key,
      disabled: busyTarget !== undefined,
      processing: busyTarget === target.key,
      error: errors[target.key] || resolved.accessibilityError,
      onSelect: () => onSelectedTargetChange?.(target),
    }
    return sortableId
      ? <SortableStudioPhotoCard key={sortableId} sortableId={sortableId} {...cardProps} />
      : <StudioPhotoCard key={target.key} {...cardProps} />
  }

  if (editingTarget) {
    const resolved = resolveTarget(editingTarget)
    return <section className="limen-studio__photography limen-studio__photography--editing"
      aria-labelledby="studio-photo-editor-title">
      {resolved.assignment && resolved.media
        ? <StudioPhotoEditor target={editingTarget} alt={resolved.alt}
          focalPoint={resolved.assignment.focalPoint} zoom={resolved.assignment.zoom}
          canonical={resolved.canonical} disabled={busyTarget !== undefined}
          error={errors[editingTarget.key] || resolved.accessibilityError}
          headingRef={editorHeadingRef} onClose={closeEditor}
          onReset={() => resetTarget(editingTarget)}
          onAltChange={(value) => onMediaChange((current) => updateStudioPhotoAccessibility(
            current, editingTarget.slotId, editingTarget.position, { kind: 'informative', alt: value }))}
          onFocalPoint={(axis, value) => onMediaChange((current) => updateStudioPhotoFocalPoint(
            current, editingTarget.slotId, editingTarget.position, axis, value))}
          onZoom={(value) => onMediaChange((current) => updateStudioPhotoZoom(
            current, editingTarget.slotId, editingTarget.position, value))} />
        : <>
          <button className="limen-studio__photo-editor-back" type="button" onClick={closeEditor}>
            <span aria-hidden="true">←</span> Volver a fotografías
          </button>
          <div className="limen-studio__photo-editor-missing" role="status">
            <h3 id="studio-photo-editor-title" ref={editorHeadingRef} tabIndex={-1}>Foto no disponible</h3>
            <p>Volvé a la lista y elegí nuevamente la fotografía.</p>
          </div>
        </>}
    </section>
  }

  const addTargetKey = `gallery-new-${galleryAssignments.length}`
  const selected = selectedTarget ? resolveTarget(selectedTarget) : undefined
  const selectedCanRemove = selectedTarget
    ? (selectedTarget.slotId === 'gallery.images' && galleryAssignments.length > 1)
      || selectedTarget.slotId === 'dressCode.image' || selectedTarget.slotId === 'gifts.image'
    : false
  const activeGalleryPosition = activeGalleryId ? galleryIds.indexOf(activeGalleryId) : -1
  const activeGalleryTarget = activeGalleryPosition >= 0 ? galleryTargetAt(activeGalleryPosition) : undefined
  const activeGalleryResolved = activeGalleryTarget ? resolveTarget(activeGalleryTarget) : undefined

  return <section className="limen-studio__photography" aria-labelledby="studio-photography-title">
    <header className="limen-studio__media-section-heading">
      <div>
        <h3 id="studio-photography-title" className="limen-studio__visually-hidden">Fotografías</h3>
        <p>Seleccioná una imagen para trabajarla. La vista previa te muestra su escena real.</p>
      </div>
      {photographyChanged && <button type="button" disabled={busyTarget !== undefined} onClick={() => {
        onMediaChange((current) => ({
          items: [
            ...current.items.filter(({ kind }) => kind !== 'image'),
            ...initialState.items.filter(({ kind }) => kind === 'image'),
          ],
          assignments: [
            ...current.assignments.filter(({ slotId }) => slotId === 'music.audio'),
            ...initialState.assignments.filter(({ slotId }) => slotId !== 'music.audio'),
          ],
        }))
        onGalleryCaptionsChange(() => [...initialGalleryCaptions])
        onSelectedTargetChange?.(undefined)
        setErrors({})
      }}>Restablecer fotos</button>}
    </header>
    <section className="limen-studio__photo-group" aria-labelledby="studio-primary-photos-title">
      <h4 id="studio-primary-photos-title">Escenas principales</h4>
      <div className="limen-studio__photo-grid limen-studio__photo-grid--scenes">
        {singleTargets.map((target) => renderCard(target))}
      </div>
    </section>
    {selectedTarget && selected && <StudioPhotoInspector target={selectedTarget} media={selected.media}
      canonical={selected.canonical} canRemove={selectedCanRemove} disabled={busyTarget !== undefined}
      processing={busyTarget === selectedTarget.key}
      onChoose={(file) => void choosePhoto(selectedTarget, file)}
      onEdit={() => beginEditing(selectedTarget)} onReset={() => resetTarget(selectedTarget)}
      onRemove={() => removeTarget(selectedTarget)} />}
    <div className="limen-studio__gallery-manager">
      <header><div><h4>Galería</h4><p>Arrastrá desde el controlador para ordenar.</p></div></header>
      <DndContext sensors={sensors} collisionDetection={closestCenter}
        onDragStart={handleDragStart} onDragCancel={() => setActiveGalleryId(undefined)} onDragEnd={handleDragEnd}>
        <SortableContext items={galleryIds} strategy={rectSortingStrategy}>
          <div className="limen-studio__photo-grid limen-studio__photo-grid--gallery">
            {galleryAssignments.map((assignment, index) => renderCard(galleryTargetAt(index), assignment.mediaId))}
            <label className="limen-studio__photo-add-tile" htmlFor="studio-add-gallery-photo">
              <span aria-hidden="true">+</span><strong>Agregar foto</strong><small>JPG, PNG o WebP</small>
            </label>
            <input id="studio-add-gallery-photo" className="limen-studio__visually-hidden" type="file"
              accept="image/jpeg,image/png,image/webp" disabled={busyTarget !== undefined}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0]
                event.currentTarget.value = ''
                if (file) void choosePhoto({
                  key: addTargetKey,
                  slotId: 'gallery.images',
                  label: 'Galería',
                  position: galleryAssignments.length,
                  previewScene: 'gallery',
                }, file)
              }} />
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {activeGalleryTarget && activeGalleryResolved
            ? <div className="limen-studio__photo-drag-overlay">
              <StudioPhotoCard target={activeGalleryTarget} media={activeGalleryResolved.media}
                focalPoint={activeGalleryResolved.assignment?.focalPoint}
                zoom={activeGalleryResolved.assignment?.zoom} selected={false} disabled processing={false}
                overlay onSelect={() => undefined} />
            </div>
            : null}
        </DragOverlay>
      </DndContext>
      {errors[addTargetKey] && <p className="limen-studio__field-error" role="alert">{errors[addTargetKey]}</p>}
    </div>
    <p className="limen-studio__visually-hidden" aria-live="polite">{galleryOrderAnnouncement}</p>
    <p className={busyTarget ? 'limen-studio__photo-status' : 'limen-studio__visually-hidden'} aria-live="polite">
      {busyTarget ? 'Preparando y guardando la fotografía. La imagen anterior permanece visible hasta terminar.' : ''}
    </p>
  </section>
}
