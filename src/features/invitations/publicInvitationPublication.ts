import { supabase } from '../auth/supabaseClient'
import { currentProjectSchemaVersion } from '../platform/dataModel'
import type { Origin01InvitationData } from './origin01/origin01ContentTypes'
import { isOrigin01InvitationDocument } from './origin01/origin01Document'

const publicMediaBucket = 'invitation-media'
const publicMediaSignedUrlLifetimeSeconds = 12 * 60 * 60

export type LoadedPublicInvitation = {
  readonly invitation: Origin01InvitationData
}

export class PublicInvitationPublicationError extends Error {
  constructor() {
    super('No pudimos abrir la publicación activa.')
    this.name = 'PublicInvitationPublicationError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export function parsePublicInvitationPublication(
  value: unknown,
  requestedCode: string,
): { readonly projectId: string; readonly document: Origin01InvitationData } {
  if (!isRecord(value)
    || typeof value.project_id !== 'string'
    || value.schema_version !== currentProjectSchemaVersion
    || !isOrigin01InvitationDocument(value.document)
    || value.document.code !== requestedCode) {
    throw new PublicInvitationPublicationError()
  }
  return { projectId: value.project_id, document: value.document }
}

export async function loadPublicInvitationPublication(
  publicCode: string,
): Promise<LoadedPublicInvitation | undefined> {
  if (!supabase) throw new PublicInvitationPublicationError()
  const client = supabase
  const { data, error } = await client
    .rpc('get_public_invitation', { p_public_code: publicCode })
    .maybeSingle()

  if (error) throw new PublicInvitationPublicationError()
  if (!data) return undefined

  const { projectId, document } = parsePublicInvitationPublication(data, publicCode)
  const storageKeys = [...new Set(document.media.flatMap((item) => {
    if (!item.storageKey) return []
    if (!item.storageKey.startsWith(`${projectId}/`)) throw new PublicInvitationPublicationError()
    return [item.storageKey]
  }))]
  if (storageKeys.length === 0) return { invitation: document }

  const { data: signedMedia, error: signedMediaError } = await client.storage
    .from(publicMediaBucket)
    .createSignedUrls(storageKeys, publicMediaSignedUrlLifetimeSeconds)
  if (signedMediaError || !signedMedia) throw new PublicInvitationPublicationError()

  const signedUrlByStorageKey = new Map<string, string>()
  signedMedia.forEach(({ error: mediaError, path, signedUrl }) => {
    if (mediaError || !path || !signedUrl) throw new PublicInvitationPublicationError()
    signedUrlByStorageKey.set(path, signedUrl)
  })
  const media = document.media.map((item) => {
    if (!item.storageKey) return item
    const src = signedUrlByStorageKey.get(item.storageKey)
    if (!src) throw new PublicInvitationPublicationError()
    return { ...item, src }
  })
  return {
    invitation: { ...document, media },
  }
}
