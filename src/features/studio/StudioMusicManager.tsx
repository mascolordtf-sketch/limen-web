import { useId, useState } from 'react'

import { findStudioMediaById, getStudioMediaAssignments } from './studioMedia'
import type { Origin01StudioMediaState } from './origin01StudioMedia'
import { addStudioAudioItem, assignStudioMusic, removeStudioMusicAssignment } from './origin01StudioMusic'
import { createReadyStudioAudio, validateStudioAudioFile } from './studioAudioSelection'

type MediaUpdater = (updater: (current: Origin01StudioMediaState) => Origin01StudioMediaState) => void

const createdAudioId = () => `studio-audio-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`

export function StudioMusicManager({
  state,
  initialState,
  onMediaChange,
  onTemporaryUrl,
}: {
  state: Origin01StudioMediaState
  initialState: Origin01StudioMediaState
  onMediaChange: MediaUpdater
  onTemporaryUrl: (url: string) => void
}) {
  const inputId = useId()
  const [error, setError] = useState('')
  const assignment = getStudioMediaAssignments(state.assignments, 'music.audio')[0]
  const initialAssignment = getStudioMediaAssignments(initialState.assignments, 'music.audio')[0]
  const found = assignment ? findStudioMediaById(state.items, assignment.mediaId) : undefined
  const audio = found?.kind === 'audio' && found.status === 'ready' ? found : undefined
  const changed = assignment?.mediaId !== initialAssignment?.mediaId

  const chooseAudio = (file: File) => {
    const validationError = validateStudioAudioFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    const src = URL.createObjectURL(file)
    const media = createReadyStudioAudio(createdAudioId(), file, src)
    onTemporaryUrl(src)
    onMediaChange((current) => assignStudioMusic(addStudioAudioItem(current, media), media.id))
    setError('')
  }

  return <section className="limen-studio__music" aria-labelledby="studio-music-title">
    <header>
      <div><p className="limen-studio__eyebrow">Música</p>
        <h2 id="studio-music-title">El sonido que acompaña la experiencia</h2>
        <p>Elegí un audio MP3, M4A, OGG o WAV de hasta 20 MB. Podés escucharlo antes de continuar.</p>
      </div>
      {changed && <button type="button" onClick={() => {
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
      }}>Restablecer música</button>}
    </header>
    <div className="limen-studio__music-card">
      <div className="limen-studio__music-summary">
        <span aria-hidden="true">♫</span>
        <div><small>{audio ? 'Música asignada' : 'Música desactivada'}</small>
          <strong>{audio?.title ?? 'La invitación se reproducirá sin música'}</strong>
          {audio?.originalName && <span>{audio.originalName}</span>}</div>
      </div>
      {audio && <audio key={audio.id} controls preload="metadata" src={audio.src}>
        Tu navegador no puede reproducir este audio.
      </audio>}
      <div className="limen-studio__music-actions">
        <label className="limen-studio__photo-action" htmlFor={inputId}>
          {audio ? 'Cambiar audio' : 'Elegir audio'}
        </label>
        <input id={inputId} className="limen-studio__visually-hidden" type="file"
          accept={studioAudioMimeTypesForInput}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''
            if (file) chooseAudio(file)
          }} />
        {audio && <button type="button" onClick={() => {
          onMediaChange(removeStudioMusicAssignment)
          setError('')
        }}>Desactivar música</button>}
      </div>
      {error && <p className="limen-studio__field-error" role="alert">{error}</p>}
    </div>
    <p className="limen-studio__photo-status" aria-live="polite">
      Los cambios se reflejan en la preview de Studio y no modifican la invitación canónica.
    </p>
  </section>
}

const studioAudioMimeTypesForInput = 'audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg,audio/wav,audio/x-wav,.mp3,.m4a,.ogg,.wav'
