import { supabase } from '../auth/supabaseClient'
import { currentProjectSchemaVersion } from '../platform/dataModel'
import type { Origin01InvitationData } from './origin01/origin01ContentTypes'
import { isOrigin01InvitationDocument } from './origin01/origin01Document'

const publicMediaBucket = 'invitation-media'

export type LoadedPublicInvitation = {
  readonly invitation: Origin01InvitationData
  readonly release: () => void
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
  if (!supabase) return undefined
  const client = supabase
  const { data, error } = await client
    .rpc('get_public_invitation', { p_public_code: publicCode })
    .maybeSingle()

  if (error) throw new PublicInvitationPublicationError()
  if (!data) return undefined

  const { projectId, document } = parsePublicInvitationPublication(data, publicCode)
  const objectUrls: string[] = []
  try {
    const media = await Promise.all(document.media.map(async (item) => {
      if (!item.storageKey) return item
      if (!item.storageKey.startsWith(`${projectId}/`)) throw new PublicInvitationPublicationError()
      const { data: file, error: fileError } = await client.storage
        .from(publicMediaBucket)
        .download(item.storageKey)
      if (fileError || !file) throw new PublicInvitationPublicationError()
      const src = URL.createObjectURL(file)
      objectUrls.push(src)
      return { ...item, src }
    }))
    return {
      invitation: { ...document, media },
      release: () => objectUrls.forEach((src) => URL.revokeObjectURL(src)),
    }
  } catch (error) {
    objectUrls.forEach((src) => URL.revokeObjectURL(src))
    throw error
  }
}
