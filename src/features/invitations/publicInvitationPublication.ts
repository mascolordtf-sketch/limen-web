import { supabase } from '../auth/supabaseClient'
import { currentProjectSchemaVersion } from '../platform/dataModel'
import type { Origin01InvitationData } from './origin01/origin01ContentTypes'
import { isOrigin01InvitationDocument } from './origin01/origin01Document'

const publicMediaBucket = 'invitation-media'
const publicMediaSignedUrlLifetimeSeconds = 12 * 60 * 60

export type PublicInvitationDelivery =
  | { readonly mode: 'fixture' }
  | { readonly mode: 'unavailable' }
  | { readonly mode: 'publication'; readonly projectId: string; readonly document: Origin01InvitationData }

export type LoadedPublicInvitation =
  | { readonly mode: 'fixture' }
  | { readonly mode: 'unavailable' }
  | { readonly mode: 'published'; readonly invitation: Origin01InvitationData }

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
): PublicInvitationDelivery {
  if (!isRecord(value) || typeof value.project_id !== 'string') {
    throw new PublicInvitationPublicationError()
  }
  if (value.delivery_state === 'fixture') return { mode: 'fixture' }
  if (value.delivery_state === 'unavailable') return { mode: 'unavailable' }
  if ((value.delivery_state !== undefined && value.delivery_state !== 'publication')
    || value.schema_version !== currentProjectSchemaVersion
    || !isOrigin01InvitationDocument(value.document)
    || value.document.code !== requestedCode) {
    throw new PublicInvitationPublicationError()
  }
  return { mode: 'publication', projectId: value.project_id, document: value.document }
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

  const delivery = parsePublicInvitationPublication(data, publicCode)
  if (delivery.mode !== 'publication') return delivery
  const { projectId, document } = delivery
  const storageKeys = [...new Set(document.media.flatMap((item) => {
    if (!item.storageKey) return []
    if (!item.storageKey.startsWith(`${projectId}/`)) throw new PublicInvitationPublicationError()
    return [item.storageKey]
  }))]
  if (storageKeys.length === 0) return { mode: 'published', invitation: document }

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
    mode: 'published',
    invitation: { ...document, media },
  }
}
