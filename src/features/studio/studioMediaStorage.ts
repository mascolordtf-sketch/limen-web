import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { supabase } from '../auth/supabaseClient'
import type { StudioMediaKind } from './studioMedia'

export const studioMediaBucket = 'invitation-media'
export const studioMediaSignedUrlLifetimeSeconds = 12 * 60 * 60

export type StudioMediaUploadInput = {
  readonly id: string
  readonly kind: StudioMediaKind
  readonly body: Blob
  readonly mimeType: string
  readonly originalFilename: string
}

export type PersistedStudioMedia = {
  readonly id: string
  readonly storageKey: string
  readonly src: string
}

export class StudioMediaStorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StudioMediaStorageError'
  }
}

const extensionByMimeType: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
}

export function createStudioMediaAssetId(): string {
  return globalThis.crypto.randomUUID()
}

export function createStudioMediaStorageKey(
  projectId: string,
  assetId: string,
  mimeType: string,
): string {
  const extension = extensionByMimeType[mimeType]
  if (!extension) throw new StudioMediaStorageError('El formato del archivo no está habilitado en Storage.')
  return `${projectId}/${assetId}.${extension}`
}

const removeUploadedAsset = async (storageKey: string, assetId?: string) => {
  if (!supabase) return
  await supabase.storage.from(studioMediaBucket).remove([storageKey])
  if (assetId) await supabase.from('project_media_assets').delete().eq('id', assetId)
}

export async function uploadStudioMedia(
  projectId: string,
  userId: string,
  input: StudioMediaUploadInput,
): Promise<PersistedStudioMedia> {
  if (!supabase) throw new StudioMediaStorageError('Supabase no está configurado.')
  const storageKey = createStudioMediaStorageKey(projectId, input.id, input.mimeType)
  const { error: uploadError } = await supabase.storage.from(studioMediaBucket).upload(storageKey, input.body, {
    cacheControl: '3600',
    contentType: input.mimeType,
    upsert: false,
  })
  if (uploadError) {
    throw new StudioMediaStorageError('No pudimos subir el archivo. Intentá nuevamente.')
  }

  const { error: metadataError } = await supabase.from('project_media_assets').insert({
    id: input.id,
    project_id: projectId,
    storage_key: storageKey,
    kind: input.kind,
    status: 'ready',
    mime_type: input.mimeType,
    size_bytes: input.body.size,
    original_filename: input.originalFilename,
    created_by: userId,
  })
  if (metadataError) {
    await removeUploadedAsset(storageKey)
    throw new StudioMediaStorageError('El archivo subió, pero no pudimos registrarlo en el proyecto.')
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from(studioMediaBucket)
    .createSignedUrl(storageKey, studioMediaSignedUrlLifetimeSeconds)
  if (signedUrlError || !data?.signedUrl) {
    await removeUploadedAsset(storageKey, input.id)
    throw new StudioMediaStorageError('No pudimos preparar una vista privada del archivo.')
  }
  return { id: input.id, storageKey, src: data.signedUrl }
}

export function serializeStudioDocument(document: Origin01InvitationData): Origin01InvitationData {
  return {
    ...document,
    media: document.media.map((media) => media.storageKey
      ? { ...media, src: media.storageKey }
      : media),
  }
}

export async function hydrateStudioDocument(
  document: Origin01InvitationData,
  projectId: string,
): Promise<Origin01InvitationData> {
  if (!supabase) throw new StudioMediaStorageError('Supabase no está configurado.')
  const client = supabase
  const projectPrefix = `${projectId}/`
  const media = await Promise.all(document.media.map(async (item) => {
    if (!item.storageKey) return item
    if (!item.storageKey.startsWith(projectPrefix)) {
      throw new StudioMediaStorageError('El borrador contiene un archivo que no pertenece a este proyecto.')
    }
    const { data, error } = await client.storage
      .from(studioMediaBucket)
      .createSignedUrl(item.storageKey, studioMediaSignedUrlLifetimeSeconds)
    if (error || !data?.signedUrl) {
      throw new StudioMediaStorageError('No pudimos abrir uno de los archivos privados del borrador.')
    }
    return { ...item, src: data.signedUrl }
  }))
  return { ...document, media }
}
