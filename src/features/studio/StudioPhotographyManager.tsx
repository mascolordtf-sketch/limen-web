import { useId, useState } from 'react'

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

type MediaUpdater = (updater: (current: Origin01StudioMediaState) => Origin01StudioMediaState) => void

type StudioPhotographyManagerProps = {
  state: Origin01StudioMediaState
  initialState: Origin01StudioMediaState
  protagonistName: string
  initialGalleryCaptions: readonly string[]
  onMediaChange: MediaUpdater
  onGalleryCaptionsChange: (updater: (current: readonly string[]) => readonly string[]) => void
  onUploadMedia: (input: StudioMediaUploadInput) => Promise<{ readonly storageKey: string; readonly src: string }>
}

type PhotoTarget = {
  readonly key: string
  readonly slotId: Origin01MediaSlotId
  readonly label: string
  readonly position?: number
}

const singleTargets = [
  { key: 'hero', slotId: 'hero.image', label: 'Portada' },
  { key: 'dress', slotId: 'dressCode.image', label: 'Dress Code' },
  { key: 'gifts', slotId: 'gifts.image', label: 'Regalos' },
  { key: 'closing', slotId: 'closing.image', label: 'Cierre' },
] as const satisfies readonly PhotoTarget[]

const defaultAlt = (label: string, name: string) =>
  `${label === 'Galería' ? 'Fotografía' : `Imagen de ${label.toLowerCase()}`} de ${name.trim() || 'la protagonista'}`

const photographyFingerprint = (state: Origin01StudioMediaState) => JSON.stringify({
  items: state.items.filter(({ kind }) => kind === 'image'),
  assignments: state.assignments.filter(({ slotId }) => slotId !== 'music.audio'),
})

function StudioPhotoCard({
  target, media, alt, focalPoint, zoom = 1, canonical, canRemove, canMoveUp, canMoveDown, disabled, processing, error,
  onChoose, onReset, onRemove, onMove, onAltChange, onFocalPoint, onZoom,
}: {
  target: PhotoTarget
  media?: StudioImageMedia
  alt: string
  focalPoint?: { readonly x: number; readonly y: number }
  zoom?: number
  canonical: boolean
  canRemove: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  disabled: boolean
  processing: boolean
  error?: string
  onChoose: (file: File) => void
  onReset: () => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
  onAltChange: (value: string) => void
  onFocalPoint: (axis: 'x' | 'y', value: number) => void
  onZoom: (value: number) => void
}) {
  const inputId = useId()
  const [settingsOpen, setSettingsOpen] = useState(Boolean(error))
  const src = media?.status === 'ready' ? media.src : media?.previewSrc
  return <article className="limen-studio__photo-card">
    <div className="limen-studio__photo-preview">
      {src ? <img src={src} alt="" style={{
        objectPosition: `${focalPoint?.x ?? 50}% ${focalPoint?.y ?? 50}%`,
        transform: `scale(${zoom})`,
        transformOrigin: `${focalPoint?.x ?? 50}% ${focalPoint?.y ?? 50}%`,
      }} /> : <span>Sin fotografía</span>}
      <strong>{target.label}{target.position === undefined ? '' : ` ${target.position + 1}`}</strong>
      {processing && <span className="limen-studio__photo-progress">Procesando…</span>}
    </div>
    <div className="limen-studio__photo-card-body">
      <div className="limen-studio__photo-actions">
        <label className="limen-studio__photo-action" htmlFor={inputId}>
          {src ? 'Cambiar foto' : 'Elegir foto'}
        </label>
        <input id={inputId} className="limen-studio__visually-hidden" type="file"
          accept="image/jpeg,image/png,image/webp" disabled={disabled}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''
            if (file) onChoose(file)
          }} />
        {!canonical && <button type="button" onClick={onReset} disabled={disabled}>Restablecer</button>}
        {canRemove && <button type="button" onClick={onRemove} disabled={disabled}>Quitar</button>}
      </div>
      {(canMoveUp || canMoveDown) && <div className="limen-studio__photo-order" aria-label={`Orden de ${target.label}`}>
        <button type="button" disabled={!canMoveUp || disabled} onClick={() => onMove(-1)}>Subir</button>
        <button type="button" disabled={!canMoveDown || disabled} onClick={() => onMove(1)}>Bajar</button>
      </div>}
      {media && <details className="limen-studio__photo-settings" open={settingsOpen}
        onToggle={(event) => setSettingsOpen(event.currentTarget.open)}>
        <summary>
          <span>Detalles y encuadre</span>
          <small>Descripción, foco y zoom</small>
        </summary>
        <div className="limen-studio__photo-fields">
          <label>Descripción accesible
            <input type="text" value={alt} maxLength={180} onChange={(event) => onAltChange(event.target.value)} />
          </label>
          <fieldset className="limen-studio__photo-framing">
            <legend>Encuadre</legend>
            <label>Horizontal
              <input type="range" min="0" max="100" value={focalPoint?.x ?? 50}
                onChange={(event) => onFocalPoint('x', Number(event.target.value))} />
            </label>
            <label>Vertical
              <input type="range" min="0" max="100" value={focalPoint?.y ?? 50}
                onChange={(event) => onFocalPoint('y', Number(event.target.value))} />
            </label>
            <label>Zoom <output>{zoom.toLocaleString('es-AR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}×</output>
              <input type="range" min="1" max="2" step=".05" value={zoom}
                aria-valuetext={`${zoom.toLocaleString('es-AR', { maximumFractionDigits: 2 })} aumentos`}
                onChange={(event) => onZoom(Number(event.target.value))} />
            </label>
          </fieldset>
        </div>
      </details>}
      {error && <p className="limen-studio__field-error" role="alert">{error}</p>}
    </div>
  </article>
}

export function StudioPhotographyManager({
  state, initialState, protagonistName, initialGalleryCaptions,
  onMediaChange, onGalleryCaptionsChange, onUploadMedia,
}: StudioPhotographyManagerProps) {
  const [busyTarget, setBusyTarget] = useState<string>()
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({})

  const galleryAssignments = getStudioMediaAssignments(state.assignments, 'gallery.images')
  const photographyChanged = photographyFingerprint(state) !== photographyFingerprint(initialState)
  const assignmentFor = (target: PhotoTarget, source = state) =>
    getStudioMediaAssignments(source.assignments, target.slotId)
      .find((assignment) => target.slotId !== 'gallery.images' || assignment.position === target.position)

  const choosePhoto = async (target: PhotoTarget, file: File) => {
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

  const resetTarget = (target: PhotoTarget) => {
    const initial = assignmentFor(target, initialState)
    onMediaChange((current) => initial
      ? assignStudioPhoto(current, target.slotId, initial.mediaId, target.position)
      : removeStudioPhotoAssignment(current, target.slotId, target.position))
    setErrors((current) => ({ ...current, [target.key]: '' }))
  }

  const renderCard = (target: PhotoTarget, index?: number) => {
    const assignment = assignmentFor(target)
    const initial = assignmentFor(target, initialState)
    const found = assignment ? findStudioMediaById(state.items, assignment.mediaId) : undefined
    const media = found?.kind === 'image' ? found : undefined
    const accessibility = assignment?.accessibility ?? media?.accessibility
    const alt = accessibility?.kind === 'informative' ? accessibility.alt : ''
    const accessibilityError = accessibility?.kind === 'informative'
      && alt.trim().length === 0
      ? 'Describí brevemente qué muestra esta fotografía.'
      : undefined
    return <StudioPhotoCard key={target.key} target={target} media={media} alt={alt}
      focalPoint={assignment?.focalPoint}
      zoom={assignment?.zoom}
      canonical={assignment?.mediaId === initial?.mediaId && !assignment?.accessibility
        && !assignment?.focalPoint && assignment?.zoom === undefined}
      canRemove={(target.slotId === 'gallery.images' && galleryAssignments.length > 1)
        || target.slotId === 'dressCode.image' || target.slotId === 'gifts.image'}
      canMoveUp={target.slotId === 'gallery.images' && (index ?? 0) > 0}
      canMoveDown={target.slotId === 'gallery.images' && (index ?? 0) < galleryAssignments.length - 1}
      disabled={busyTarget !== undefined} processing={busyTarget === target.key}
      error={errors[target.key] || accessibilityError}
      onChoose={(file) => void choosePhoto(target, file)}
      onReset={() => resetTarget(target)}
      onRemove={() => {
        onMediaChange((current) => removeStudioPhotoAssignment(current, target.slotId, target.position))
        if (target.slotId === 'gallery.images' && target.position !== undefined) {
          onGalleryCaptionsChange((current) => current.filter((_, position) => position !== target.position))
        }
      }}
      onMove={(direction) => {
        if (target.position === undefined) return
        const destination = target.position + direction
        onMediaChange((current) => moveStudioGalleryPhoto(current, target.position as number, destination))
        onGalleryCaptionsChange((current) => {
          const next = [...current]
          const [moved] = next.splice(target.position as number, 1)
          next.splice(destination, 0, moved)
          return next
        })
      }}
      onAltChange={(value) => assignment && onMediaChange((current) =>
        updateStudioPhotoAccessibility(current, target.slotId, target.position,
          { kind: 'informative', alt: value }))}
      onFocalPoint={(axis, value) => onMediaChange((current) =>
        updateStudioPhotoFocalPoint(current, target.slotId, target.position, axis, value))}
      onZoom={(value) => onMediaChange((current) =>
        updateStudioPhotoZoom(current, target.slotId, target.position, value))}
    />
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
      <header><div><h4>Galería</h4><p>Ordená las fotos que aparecen durante el recorrido.</p></div>
        <label className="limen-studio__photo-action" htmlFor="studio-add-gallery-photo">Agregar foto</label>
        <input id="studio-add-gallery-photo" className="limen-studio__visually-hidden" type="file"
          accept="image/jpeg,image/png,image/webp" disabled={busyTarget !== undefined}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''
            if (file) void choosePhoto({
              key: addTargetKey, slotId: 'gallery.images', label: 'Galería', position: galleryAssignments.length,
            }, file)
          }} />
      </header>
      <div className="limen-studio__photo-grid">{galleryAssignments.map((_, index) => renderCard({
        key: `gallery-${index}`, slotId: 'gallery.images', label: 'Galería', position: index,
      }, index))}</div>
      {errors[addTargetKey] && <p className="limen-studio__field-error" role="alert">{errors[addTargetKey]}</p>}
    </div>
    <p className={busyTarget ? 'limen-studio__photo-status' : 'limen-studio__visually-hidden'} aria-live="polite">
      {busyTarget ? 'Preparando y guardando la fotografía. La imagen anterior permanece visible hasta terminar.'
        : ''}
    </p>
  </section>
}
