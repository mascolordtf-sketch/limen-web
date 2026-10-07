import type { Database } from '../platform/database.types'
import { supabase } from '../auth/supabaseClient'
import { findStudioInvitation } from './studioInvitationRegistry'

type ProjectRow = Database['public']['Tables']['invitation_projects']['Row']
type DraftRow = Pick<Database['public']['Tables']['invitation_drafts']['Row'],
  'project_id' | 'revision' | 'updated_at'>
type PublicationRow = Pick<Database['public']['Tables']['invitation_publications']['Row'],
  'draft_revision' | 'project_id' | 'published_at' | 'revision' | 'status'>

export type StudioInvitationAvailability = 'online' | 'paused' | 'offline' | 'archived'
export type StudioInvitationFilter = 'all' | StudioInvitationAvailability

export type StudioInvitationSummary = {
  readonly projectId: string
  readonly code: string
  readonly internalName: string
  readonly eventLabel?: string
  readonly thumbnailSrc?: string
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

function resolveAvailability(project: ProjectRow, latestPublication: PublicationRow | undefined,
  hasBundledInvitation: boolean): StudioInvitationAvailability {
  if (project.status === 'archived') return 'archived'
  if (project.public_source === 'fixture') return hasBundledInvitation ? 'online' : 'offline'
  if (latestPublication?.status === 'active') return 'online'
  if (latestPublication?.status === 'paused' || project.status === 'paused') return 'paused'
  return 'offline'
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
    const invitation = findStudioInvitation(project.public_code)
    const draft = draftByProject.get(project.id)
    const latestPublication = selectLatestPublication(publicationsByProject.get(project.id) ?? [])
    const heroMediaId = invitation?.content.hero.imageMediaId
    const thumbnail = invitation?.media.find(({ id, kind }) => id === heroMediaId && kind === 'image')
    const sourceLabel: StudioInvitationSummary['sourceLabel'] = project.public_source === 'publication'
      ? 'Publicación dinámica'
      : 'Ficha estable'

    return {
      projectId: project.id,
      code: project.public_code,
      internalName: project.internal_name,
      eventLabel: invitation ? eventDateFormatter.format(new Date(invitation.event.startsAt)) : undefined,
      thumbnailSrc: thumbnail?.src,
      availability: resolveAvailability(project, latestPublication, Boolean(invitation)),
      sourceLabel,
      projectStatus: project.status,
      projectStatusLabel: projectStatusLabels[project.status] ?? 'En preparación',
      draftRevision: draft?.revision,
      publicationRevision: latestPublication?.revision,
      hasUnpublishedChanges: Boolean(draft && (!latestPublication
        || draft.revision > latestPublication.draft_revision)),
      updatedAt: resolveUpdatedAt(project, draft, latestPublication),
      editable: Boolean(invitation),
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
      .select('project_id, revision, updated_at')
      .in('project_id', projectIds),
    supabase.from('invitation_publications')
      .select('project_id, revision, draft_revision, status, published_at')
      .in('project_id', projectIds)
      .order('revision', { ascending: false }),
  ])

  if (draftsResult.error || publicationsResult.error) throw new StudioInvitationIndexError()
  return buildStudioInvitationSummaries(projects, draftsResult.data, publicationsResult.data)
}
