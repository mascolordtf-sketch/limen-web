import { useEffect, useId, useRef, useState, type RefObject } from 'react'

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

const targetLabel = (target: StudioPhotoTarget) =>
  `${target.label}${target.position === undefined ? '' : ` ${target.position + 1}`}`

function StudioPhotoCard({
  target, media, focalPoint, zoom = 1, canonical, canRemove, canMoveUp, canMoveDown, disabled, processing, error,
  reorderable, dragging, dropTarget,
  onChoose, onReset, onRemove, onMove, onEdit, onDragStart, onDragOver, onDrop, onDragEnd,
}: {
  target: StudioPhotoTarget
  media?: StudioImageMedia
  focalPoint?: { readonly x: number; readonly y: number }
  zoom?: number
  canonical: boolean
  canRemove: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  disabled: boolean
  processing: boolean
  error?: string
  reorderable: boolean
  dragging: boolean
  dropTarget: boolean
  onChoose: (file: File) => void
  onReset: () => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
  onEdit: () => void
  onDragStart: () => void
  onDragOver: () => void
  onDrop: () => void
  onDragEnd: () => void
}) {
  const inputId = useId()
  const actionsMenuRef = useRef<HTMLDetailsElement>(null)
  const src = media?.status === 'ready' ? media.src : media?.previewSrc
  const hasSecondaryActions = !canonical || canRemove || canMoveUp || canMoveDown
  const closeActionsMenu = () => actionsMenuRef.current?.removeAttribute('open')
  const runMenuAction = (action: () => void) => {
    closeActionsMenu()
    action()
  }

  return <article className={`limen-studio__photo-card${dragging ? ' limen-studio__photo-card--dragging' : ''}${
    dropTarget ? ' limen-studio__photo-card--drop-target' : ''}`}
    onDragOver={reorderable ? (event) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      onDragOver()
    } : undefined}
    onDrop={reorderable ? (event) => {
      event.preventDefault()
      onDrop()
    } : undefined}>
    <div className="limen-studio__photo-preview">
      {src ? <img src={src} alt="" style={{
        objectPosition: `${focalPoint?.x ?? 50}% ${focalPoint?.y ?? 50}%`,
        transform: `scale(${zoom})`,
        transformOrigin: `${focalPoint?.x ?? 50}% ${focalPoint?.y ?? 50}%`,
      }} /> : <span>Sin fotografía</span>}
      <strong>{targetLabel(target)}</strong>
      {processing && <span className="limen-studio__photo-progress">Procesando…</span>}
      {media && <button id={`studio-photo-edit-${target.key}`} className="limen-studio__photo-preview-edit"
        type="button" disabled={disabled}
        aria-label={`Detalles y encuadre de ${targetLabel(target)}: posición y Zoom`}
        onClick={onEdit}><span>Editar</span></button>}
      {reorderable && <button className="limen-studio__photo-drag-handle" type="button"
        draggable={!disabled} disabled={disabled} title="Arrastrar para cambiar el orden"
        aria-label={`Arrastrar ${targetLabel(target)} para cambiar su posición`}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = 'move'
          event.dataTransfer.setData('text/plain', String(target.position ?? 0))
          const card = event.currentTarget.closest<HTMLElement>('.limen-studio__photo-card')
          if (card) event.dataTransfer.setDragImage(card, 24, 24)
          onDragStart()
        }}
        onDragEnd={onDragEnd}><span aria-hidden="true">⠿</span></button>}
    </div>
    <div className="limen-studio__photo-card-body">
      <div className="limen-studio__photo-actions">
        <label className="limen-studio__photo-action" htmlFor={inputId}
          aria-label={`${src ? 'Cambiar foto' : 'Elegir foto'} de ${targetLabel(target)}`}>
          {src ? 'Cambiar' : 'Elegir'}
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
          <summary aria-label={`Más acciones para ${targetLabel(target)}`}>
            <span aria-hidden="true">•••</span>
          </summary>
          <div>
            {!canonical && <button type="button" onClick={() => runMenuAction(onReset)}
              disabled={disabled}>Restablecer</button>}
            {canMoveUp && <button type="button" onClick={() => runMenuAction(() => onMove(-1))}
              disabled={disabled}>Subir</button>}
            {canMoveDown && <button type="button" onClick={() => runMenuAction(() => onMove(1))}
              disabled={disabled}>Bajar</button>}
            {canRemove && <button className="limen-studio__photo-destructive-action" type="button"
              onClick={() => runMenuAction(onRemove)} disabled={disabled}>Quitar</button>}
          </div>
        </details>}
      </div>
      {error && <p className="limen-studio__field-error" role="alert">{error}</p>}
    </div>
  </article>
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
      <p>La preview ya está ubicada en la escena real. Ajustá la imagen y mirá el resultado a la derecha.</p>
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
  onMediaChange, onGalleryCaptionsChange, onUploadMedia, editingTarget, onEditingTargetChange,
}: StudioPhotographyManagerProps) {
  const [busyTarget, setBusyTarget] = useState<string>()
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({})
  const [draggedGalleryPosition, setDraggedGalleryPosition] = useState<number>()
  const [dragOverGalleryPosition, setDragOverGalleryPosition] = useState<number>()
  const [galleryOrderAnnouncement, setGalleryOrderAnnouncement] = useState('')
  const editorHeadingRef = useRef<HTMLHeadingElement>(null)
  const editorOpenerKeyRef = useRef<string | undefined>(undefined)

  const galleryAssignments = getStudioMediaAssignments(state.assignments, 'gallery.images')
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

  useEffect(() => {
    if (editingTarget) editorHeadingRef.current?.focus()
  }, [editingTarget])

  const closeEditor = () => {
    onEditingTargetChange?.(undefined)
    requestAnimationFrame(() => {
      if (!editorOpenerKeyRef.current) return
      document.getElementById(`studio-photo-edit-${editorOpenerKeyRef.current}`)?.focus()
    })
  }

  const beginEditing = (target: StudioPhotoTarget) => {
    editorOpenerKeyRef.current = target.key
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
      const restored = assignStudioPhoto(withInitialMedia, target.slotId, initial.mediaId, target.position)
      return {
        ...restored,
        assignments: restored.assignments.map((assignment) => assignment.slotId === target.slotId
          && (target.slotId !== 'gallery.images' || assignment.position === target.position)
          ? { ...initial }
          : assignment),
      }
    })
    setErrors((current) => ({ ...current, [target.key]: '' }))
    if (!initial && editingTarget?.key === target.key) closeEditor()
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

  const finishGalleryDrag = () => {
    setDraggedGalleryPosition(undefined)
    setDragOverGalleryPosition(undefined)
  }

  const dropGalleryPhoto = (to: number) => {
    if (draggedGalleryPosition !== undefined) moveGalleryPhoto(draggedGalleryPosition, to)
    finishGalleryDrag()
  }

  const renderCard = (target: StudioPhotoTarget, index?: number) => {
    const resolved = resolveTarget(target)
    const reorderable = target.slotId === 'gallery.images' && galleryAssignments.length > 1
    return <StudioPhotoCard key={target.key} target={target} media={resolved.media}
      focalPoint={resolved.assignment?.focalPoint}
      zoom={resolved.assignment?.zoom}
      canonical={resolved.canonical}
      canRemove={(target.slotId === 'gallery.images' && galleryAssignments.length > 1)
        || target.slotId === 'dressCode.image' || target.slotId === 'gifts.image'}
      canMoveUp={target.slotId === 'gallery.images' && (index ?? 0) > 0}
      canMoveDown={target.slotId === 'gallery.images' && (index ?? 0) < galleryAssignments.length - 1}
      disabled={busyTarget !== undefined} processing={busyTarget === target.key}
      error={errors[target.key] || resolved.accessibilityError}
      reorderable={reorderable}
      dragging={reorderable && draggedGalleryPosition === target.position}
      dropTarget={reorderable && dragOverGalleryPosition === target.position
        && draggedGalleryPosition !== target.position}
      onChoose={(file) => void choosePhoto(target, file)}
      onReset={() => resetTarget(target)}
      onEdit={() => beginEditing(target)}
      onRemove={() => {
        onMediaChange((current) => removeStudioPhotoAssignment(current, target.slotId, target.position))
        if (target.slotId === 'gallery.images' && target.position !== undefined) {
          onGalleryCaptionsChange((current) => current.filter((_, position) => position !== target.position))
        }
      }}
      onMove={(direction) => {
        if (target.position === undefined) return
        moveGalleryPhoto(target.position, target.position + direction)
      }}
      onDragStart={() => {
        if (target.position === undefined) return
        setDraggedGalleryPosition(target.position)
        setDragOverGalleryPosition(undefined)
        setGalleryOrderAnnouncement('')
      }}
      onDragOver={() => target.position !== undefined && setDragOverGalleryPosition(target.position)}
      onDrop={() => target.position !== undefined && dropGalleryPhoto(target.position)}
      onDragEnd={finishGalleryDrag}
    />
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
  return <section className="limen-studio__photography" aria-labelledby="studio-photography-title">
    <header className="limen-studio__media-section-heading">
      <div>
        <h3 id="studio-photography-title">Fotografías</h3>
        <p>Portada, escenas y galería · JPG, PNG o WebP · hasta 12 MB.</p>
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
        setErrors({})
      }}>Restablecer fotos</button>}
    </header>
    <section className="limen-studio__photo-group" aria-labelledby="studio-primary-photos-title">
      <h4 id="studio-primary-photos-title">Escenas principales</h4>
      <div className="limen-studio__photo-grid">{singleTargets.map((target) => renderCard(target))}</div>
    </section>
    <div className="limen-studio__gallery-manager">
      <header><div><h4>Galería</h4><p>Arrastrá las fotos desde el tirador para cambiar el orden.</p></div>
        <label className="limen-studio__photo-action" htmlFor="studio-add-gallery-photo">Agregar foto</label>
        <input id="studio-add-gallery-photo" className="limen-studio__visually-hidden" type="file"
          accept="image/jpeg,image/png,image/webp" disabled={busyTarget !== undefined}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''
            if (file) void choosePhoto({
              key: addTargetKey, slotId: 'gallery.images', label: 'Galería', position: galleryAssignments.length,
              previewScene: 'gallery',
            }, file)
          }} />
      </header>
      <div className="limen-studio__photo-grid">{galleryAssignments.map((_, index) => renderCard({
        key: `gallery-${index}`, slotId: 'gallery.images', label: 'Galería', position: index,
        previewScene: 'gallery',
      }, index))}</div>
      {errors[addTargetKey] && <p className="limen-studio__field-error" role="alert">{errors[addTargetKey]}</p>}
    </div>
    <p className="limen-studio__visually-hidden" aria-live="polite">{galleryOrderAnnouncement}</p>
    <p className={busyTarget ? 'limen-studio__photo-status' : 'limen-studio__visually-hidden'} aria-live="polite">
      {busyTarget ? 'Preparando y guardando la fotografía. La imagen anterior permanece visible hasta terminar.'
        : ''}
    </p>
  </section>
}
