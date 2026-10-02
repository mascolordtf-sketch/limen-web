import type { LimenInvitation } from '../invitations/engine/invitationTypes'

export const currentProjectSchemaVersion = 1 as const

export const studioRoles = ['administrator', 'editor'] as const
export type StudioRole = (typeof studioRoles)[number]

export const projectAccessRoles = ['administrator', 'editor', 'host', 'reviewer', 'reception', 'support'] as const
export type ProjectAccessRole = (typeof projectAccessRoles)[number]

export const projectLifecycleStatuses = [
  'awaiting_information',
  'draft',
  'internal_review',
  'client_review',
  'approved',
  'published',
  'paused',
  'expired',
  'archived',
] as const
export type ProjectLifecycleStatus = (typeof projectLifecycleStatuses)[number]

export const servicePlanCodes = ['essential', 'premium', 'premium_access'] as const
export type ServicePlanCode = (typeof servicePlanCodes)[number]

export const platformCapabilities = [
  'general_public_link',
  'whatsapp_rsvp',
  'personalized_deliveries',
  'native_rsvp',
  'host_dashboard',
  'attendee_export',
  'qr_access',
  'check_in',
] as const
export type PlatformCapability = (typeof platformCapabilities)[number]

export const planCapabilities: Readonly<Record<ServicePlanCode, readonly PlatformCapability[]>> = {
  essential: ['general_public_link', 'whatsapp_rsvp'],
  premium: [
    'general_public_link',
    'whatsapp_rsvp',
    'personalized_deliveries',
    'native_rsvp',
    'host_dashboard',
    'attendee_export',
  ],
  premium_access: [...platformCapabilities],
}

export type InvitationProject = {
  readonly id: string
  readonly publicCode: string
  readonly internalName: string
  readonly eventType: string
  readonly planCode: ServicePlanCode
  readonly planVersion: number
  readonly status: ProjectLifecycleStatus
  readonly createdAt: string
  readonly updatedAt: string
}

export type ProjectAccess = {
  readonly projectId: string
  readonly userId: string
  readonly role: ProjectAccessRole
  readonly createdAt: string
}

export type InvitationDraft<TDocument extends LimenInvitation = LimenInvitation> = {
  readonly id: string
  readonly projectId: string
  readonly schemaVersion: typeof currentProjectSchemaVersion
  readonly revision: number
  readonly document: TDocument
  readonly updatedAt: string
  readonly updatedBy: string
}

export const publicationStatuses = ['active', 'superseded', 'paused', 'expired'] as const
export type PublicationStatus = (typeof publicationStatuses)[number]

export type InvitationPublication<TDocument extends LimenInvitation = LimenInvitation> = {
  readonly id: string
  readonly projectId: string
  readonly publicCode: string
  readonly schemaVersion: typeof currentProjectSchemaVersion
  readonly revision: number
  readonly document: TDocument
  readonly status: PublicationStatus
  readonly publishedAt: string
  readonly publishedBy: string
}

export const mediaAssetStatuses = ['pending', 'ready', 'failed', 'removed'] as const
export type MediaAssetStatus = (typeof mediaAssetStatuses)[number]

export type ProjectMediaAsset = {
  readonly id: string
  readonly projectId: string
  readonly storageKey: string
  readonly kind: 'image' | 'audio'
  readonly status: MediaAssetStatus
  readonly mimeType: string
  readonly sizeBytes: number
  readonly originalFilename: string
  readonly createdAt: string
  readonly createdBy: string
}

export const deliveryRecipientTypes = ['individual', 'couple', 'family', 'group'] as const
export type DeliveryRecipientType = (typeof deliveryRecipientTypes)[number]

export type FutureDeliveryContract = {
  readonly recipientLabel: string
  readonly recipientType: DeliveryRecipientType
  readonly maxAttendees: number
  readonly dedicatedMessage?: string
}

export type FutureAttendeeContract = {
  readonly displayName: string
  readonly attendance: 'pending' | 'attending' | 'not_attending'
  readonly dietaryRequirements: readonly string[]
  readonly isMinor?: boolean
  readonly notes?: string
}

export function planHasCapability(planCode: ServicePlanCode, capability: PlatformCapability): boolean {
  return planCapabilities[planCode].includes(capability)
}

export function isPublicationDocumentDetachedFromDraft(
  draft: InvitationDraft,
  publication: InvitationPublication,
): boolean {
  return draft.document !== publication.document
}

export function createPublicationDocument<TDocument extends LimenInvitation>(document: TDocument): TDocument {
  return structuredClone(document)
}
