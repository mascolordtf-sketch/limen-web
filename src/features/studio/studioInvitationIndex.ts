import type { Database } from '../platform/database.types'
import { supabase } from '../auth/supabaseClient'
import { isOrigin01InvitationDocument } from '../invitations/origin01/origin01Document'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { findStudioInvitation } from './studioInvitationRegistry'
import { studioMediaBucket, studioMediaSignedUrlLifetimeSeconds } from './studioMediaStorage'

type ProjectRow = Database['public']['Tables']['invitation_projects']['Row']
type DraftRow = Pick<Database['public']['Tables']['invitation_drafts']['Row'],
  'document' | 'project_id' | 'revision' | 'updated_at'>
type PublicationRow = Pick<Database['public']['Tables']['invitation_publications']['Row'],
  'document' | 'draft_revision' | 'project_id' | 'published_at' | 'revision' | 'status'>

export type StudioInvitationAvailability = 'online' | 'paused' | 'offline' | 'archived'
export type StudioInvitationFilter = 'all' | StudioInvitationAvailability

export type StudioInvitationSummary = {
  readonly projectId: string
  readonly code: string
  readonly internalName: string
  readonly eventLabel?: string
  readonly thumbnailSrc?: string
  readonly thumbnailStorageKey?: string
  readonly availability: StudioInvitationAvailability
  readonly sourceLabel: 'Ficha estable' | 'Publicación dinámica'
  readonly projectStatus: string
  readonly projectStatusLabel: string
  readonly draftRevision?: number
  readonly publicationRevision?: number
  readonly hasUnpublishedChanges: boolean
  readonly updatedAt: string
  readonly editable: boolean
}

export class StudioInvitationIndexError extends Error {
  constructor(message = 'No pudimos recuperar las invitaciones. Intentá nuevamente.') {
    super(message)
    this.name = 'StudioInvitationIndexError'
  }
}

const projectStatusLabels: Readonly<Record<string, string>> = {
  awaiting_information: 'Esperando información',
  draft: 'Borrador',
  internal_review: 'Revisión interna',
  client_review: 'Revisión del cliente',
  approved: 'Aprobada',
  published: 'Publicada',
  paused: 'Pausada',
  expired: 'Vencida',
  archived: 'Archivada',
}

const eventDateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Buenos_Aires',
})

function selectLatestPublication(publications: readonly PublicationRow[]): PublicationRow | undefined {
  return [...publications].sort((left, right) => right.revision - left.revision)[0]
}

function resolveAvailability(project: ProjectRow, activePublication: PublicationRow | undefined,
  latestPublication: PublicationRow | undefined, hasBundledInvitation: boolean): StudioInvitationAvailability {
  if (project.public_source === 'fixture') return hasBundledInvitation ? 'online' : 'offline'
  if (project.status === 'archived') return 'archived'
  if (latestPublication?.status === 'paused' || project.status === 'paused') return 'paused'
  if (project.status === 'published' && activePublication) return 'online'
  return 'offline'
}

function selectCardDocument(draft: DraftRow | undefined, activePublication: PublicationRow | undefined,
  bundledInvitation: Origin01InvitationData | undefined): Origin01InvitationData | undefined {
  if (draft && isOrigin01InvitationDocument(draft.document)) return draft.document
  if (activePublication && isOrigin01InvitationDocument(activePublication.document)) return activePublication.document
  return bundledInvitation
}

function formatEventDate(document: Origin01InvitationData | undefined): string | undefined {
  if (!document || !Number.isFinite(Date.parse(document.event.startsAt))) return undefined
  return eventDateFormatter.format(new Date(document.event.startsAt))
}

function resolveUpdatedAt(project: ProjectRow, draft: DraftRow | undefined,
  publication: PublicationRow | undefined): string {
  return [project.updated_at, draft?.updated_at, publication?.published_at]
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0]
}

export function buildStudioInvitationSummaries(
  projects: readonly ProjectRow[],
  drafts: readonly DraftRow[],
  publications: readonly PublicationRow[],
): readonly StudioInvitationSummary[] {
  const draftByProject = new Map(drafts.map((draft) => [draft.project_id, draft]))
  const publicationsByProject = new Map<string, PublicationRow[]>()
  for (const publication of publications) {
    const current = publicationsByProject.get(publication.project_id) ?? []
    current.push(publication)
    publicationsByProject.set(publication.project_id, current)
  }

  return projects.map((project) => {
    const bundledInvitation = findStudioInvitation(project.public_code)
    const draft = draftByProject.get(project.id)
    const projectPublications = publicationsByProject.get(project.id) ?? []
    const latestPublication = selectLatestPublication(projectPublications)
    const activePublication = projectPublications.find(({ status }) => status === 'active')
    const cardDocument = selectCardDocument(draft, activePublication, bundledInvitation)
    const heroMediaId = cardDocument?.content.hero.imageMediaId
    const thumbnail = cardDocument?.media.find(({ id, kind }) => id === heroMediaId && kind === 'image')
    const thumbnailStorageKey = thumbnail?.storageKey?.startsWith(`${project.id}/`)
      ? thumbnail.storageKey
      : undefined
    const sourceLabel: StudioInvitationSummary['sourceLabel'] = project.public_source === 'publication'
      ? 'Publicación dinámica'
      : 'Ficha estable'

    return {
      projectId: project.id,
      code: project.public_code,
      internalName: cardDocument?.internalName ?? project.internal_name,
      eventLabel: formatEventDate(cardDocument),
      thumbnailSrc: thumbnailStorageKey ? undefined : thumbnail?.src,
      thumbnailStorageKey,
      availability: resolveAvailability(project, activePublication, latestPublication, Boolean(bundledInvitation)),
      sourceLabel,
      projectStatus: project.status,
      projectStatusLabel: projectStatusLabels[project.status] ?? 'En preparación',
      draftRevision: draft?.revision,
      publicationRevision: latestPublication?.revision,
      hasUnpublishedChanges: Boolean(draft && (!latestPublication
        || draft.revision > latestPublication.draft_revision)),
      updatedAt: resolveUpdatedAt(project, draft, latestPublication),
      editable: Boolean(bundledInvitation || (draft && isOrigin01InvitationDocument(draft.document))),
    }
  }).sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
}

export function filterStudioInvitationSummaries(
  invitations: readonly StudioInvitationSummary[],
  filter: StudioInvitationFilter,
  query: string,
): readonly StudioInvitationSummary[] {
  const normalizedQuery = query.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es-AR')
  return invitations.filter((invitation) => {
    if (filter !== 'all' && invitation.availability !== filter) return false
    if (!normalizedQuery) return true
    const searchable = `${invitation.internalName} ${invitation.code}`
      .normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es-AR')
    return searchable.includes(normalizedQuery)
  })
}

export async function loadStudioInvitationSummaries(): Promise<readonly StudioInvitationSummary[]> {
  if (!supabase) throw new StudioInvitationIndexError('Supabase no está configurado.')

  const { data: projects, error: projectsError } = await supabase
    .from('invitation_projects')
    .select('id, public_code, internal_name, event_type, plan_code, plan_version, status, public_source, created_by, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (projectsError) throw new StudioInvitationIndexError()
  if (!projects.length) return []

  const projectIds = projects.map(({ id }) => id)
  const [draftsResult, publicationsResult] = await Promise.all([
    supabase.from('invitation_drafts')
      .select('project_id, revision, document, updated_at')
      .in('project_id', projectIds),
    supabase.from('invitation_publications')
      .select('project_id, revision, draft_revision, document, status, published_at')
      .in('project_id', projectIds)
      .order('revision', { ascending: false }),
  ])

  if (draftsResult.error || publicationsResult.error) throw new StudioInvitationIndexError()
  const summaries = buildStudioInvitationSummaries(projects, draftsResult.data, publicationsResult.data)
  const thumbnailKeys = [...new Set(summaries.flatMap(({ thumbnailStorageKey }) =>
    thumbnailStorageKey ? [thumbnailStorageKey] : []))]
  if (thumbnailKeys.length === 0) return summaries

  const { data: signedThumbnails, error: thumbnailError } = await supabase.storage
    .from(studioMediaBucket)
    .createSignedUrls(thumbnailKeys, studioMediaSignedUrlLifetimeSeconds)
  if (thumbnailError || !signedThumbnails) return summaries
  const signedUrlByKey = new Map(signedThumbnails.flatMap(({ path, signedUrl, error }) =>
    !error && path && signedUrl ? [[path, signedUrl] as const] : []))
  return summaries.map((summary) => summary.thumbnailStorageKey
    ? { ...summary, thumbnailSrc: signedUrlByKey.get(summary.thumbnailStorageKey) }
    : summary)
}
