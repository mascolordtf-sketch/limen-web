import { useId, useRef, useState } from 'react'

import { getStudioMediaAssignments } from './studioMedia'
import { getOrigin01StudioMusic } from './origin01StudioMedia'
import type { Origin01StudioMediaState } from './origin01StudioMedia'
import { addStudioAudioItem, assignStudioMusic, removeStudioMusicAssignment } from './origin01StudioMusic'
import { createReadyStudioAudio, resolveStudioAudioMimeType, validateStudioAudioFile } from './studioAudioSelection'
import { createStudioMediaAssetId } from './studioMediaStorage'
import type { StudioMediaUploadInput } from './studioMediaStorage'

type MediaUpdater = (updater: (current: Origin01StudioMediaState) => Origin01StudioMediaState) => void

export function StudioMusicManager({
  state,
  initialState,
  onMediaChange,
  onUploadMedia,
}: {
  state: Origin01StudioMediaState
  initialState: Origin01StudioMediaState
  onMediaChange: MediaUpdater
  onUploadMedia: (input: StudioMediaUploadInput) => Promise<{ readonly storageKey: string; readonly src: string }>
}) {
  const inputId = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const assignment = getStudioMediaAssignments(state.assignments, 'music.audio')[0]
  const initialAssignment = getStudioMediaAssignments(initialState.assignments, 'music.audio')[0]
  const audio = getOrigin01StudioMusic(state)
  const changed = assignment?.mediaId !== initialAssignment?.mediaId

  const chooseAudio = async (file: File) => {
    const validationError = validateStudioAudioFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    setUploading(true)
    setError('')
    try {
      const id = createStudioMediaAssetId()
      const mimeType = resolveStudioAudioMimeType(file)
      const persisted = await onUploadMedia({
        id,
        kind: 'audio',
        body: file,
        mimeType,
        originalFilename: file.name,
      })
      const media = {
        ...createReadyStudioAudio(id, { name: file.name, type: mimeType, size: file.size }, persisted.src),
        storageKey: persisted.storageKey,
      }
      onMediaChange((current) => assignStudioMusic(addStudioAudioItem(current, media), media.id))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos guardar el audio.')
    } finally {
      setUploading(false)
    }
  }

  return <section className="limen-studio__music" aria-labelledby="studio-music-title">
    <header className="limen-studio__media-section-heading">
      <div><h3 id="studio-music-title" className="limen-studio__visually-hidden">Música</h3>
        <p>Opcional · MP3, M4A, OGG o WAV · hasta 20 MB.</p>
      </div>
      {changed && <button type="button" disabled={uploading} onClick={() => {
        if (initialAssignment) {
          onMediaChange((current) => assignStudioMusic({
            ...current,
            items: current.items.some(({ id }) => id === initialAssignment.mediaId)
              ? current.items
              : [...current.items, ...initialState.items.filter(({ id }) => id === initialAssignment.mediaId)],
          }, initialAssignment.mediaId))
        } else {
          onMediaChange(removeStudioMusicAssignment)
        }
        setError('')
      }}>Restablecer</button>}
    </header>
    <div className="limen-studio__music-card">
      <div className="limen-studio__music-summary">
        <span aria-hidden="true">♫</span>
        <div><small>{audio ? 'Música asignada' : 'Música desactivada'}</small>
          <strong>{audio?.title ?? 'Sin música'}</strong>
          {audio?.originalName && <span>{audio.originalName}</span>}</div>
      </div>
      {audio && <audio key={audio.id} controls preload="metadata" src={audio.src}>
        Tu navegador no puede reproducir este audio.
      </audio>}
      <div className="limen-studio__music-actions">
        <button type="button" disabled={uploading} onClick={() => fileInput.current?.click()}>
          {audio ? 'Cambiar audio' : 'Agregar audio'}
        </button>
        <input ref={fileInput} id={inputId} hidden type="file" disabled={uploading}
          aria-label="Seleccionar archivo de audio"
          accept={studioAudioMimeTypesForInput}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''
            if (file) void chooseAudio(file)
          }} />
        {assignment && <button type="button" disabled={uploading} onClick={() => {
          onMediaChange(removeStudioMusicAssignment)
          setError('')
        }}>Desactivar música</button>}
      </div>
      {error && <p className="limen-studio__field-error" role="alert">{error}</p>}
    </div>
    <p className={uploading ? 'limen-studio__photo-status' : 'limen-studio__visually-hidden'} aria-live="polite">
      {uploading ? 'Guardando audio…' : ''}
    </p>
  </section>
}

const studioAudioMimeTypesForInput = 'audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg,audio/wav,audio/x-wav,.mp3,.m4a,.ogg,.wav'
