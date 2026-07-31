import type { StudioAudioMedia } from './studioMedia'

export const studioAudioMimeTypes = [
  'audio/mpeg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/ogg',
  'audio/wav',
  'audio/x-wav',
] as const

export const studioAudioMaxBytes = 20 * 1024 * 1024

export type StudioAudioFileMetadata = {
  readonly name: string
  readonly type: string
  readonly size: number
}

export function validateStudioAudioFile(file: StudioAudioFileMetadata): string | null {
  const supportedExtension = /\.(mp3|m4a|ogg|wav)$/i.test(file.name)
  if (!studioAudioMimeTypes.includes(file.type as (typeof studioAudioMimeTypes)[number])
    && !(file.type === '' && supportedExtension)) {
    return 'Elegí un audio MP3, M4A, OGG o WAV.'
  }
  if (file.size <= 0) return 'El audio está vacío.'
  if (file.size > studioAudioMaxBytes) return 'El audio supera el límite de 20 MB.'
  return null
}

const audioTitle = (name: string) => name.replace(/\.[^.]+$/, '').trim() || 'Música de la invitación'

export function createReadyStudioAudio(
  id: string,
  file: StudioAudioFileMetadata,
  src: string,
): StudioAudioMedia {
  return {
    id,
    kind: 'audio',
    origin: 'studio',
    originalName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    title: audioTitle(file.name),
    status: 'ready',
    src,
  }
}
