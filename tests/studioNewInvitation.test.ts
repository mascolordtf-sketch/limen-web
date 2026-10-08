import { createNewStudioInvitation } from '../src/features/studio/studioNewInvitation'
import { createOrigin01StudioDraft } from '../src/features/studio/origin01StudioDraft'
import { validateOrigin01StudioDraft } from '../src/features/studio/origin01StudioValidation'

const now = new Date('2026-10-08T12:00:00.000Z')
const invitation = createNewStudioInvitation('  15 años de Maia  ', now)
const draft = createOrigin01StudioDraft(invitation, now)
const validation = validateOrigin01StudioDraft(invitation, draft)
const serializedInvitation = JSON.stringify(invitation)
const missingRequiredMediaIssues = validation.issues.filter(({ id }) => id.includes('missing-required-media'))

const assertions = [
  invitation.internalName === '15 años de Maia',
  invitation.lifecycleStatus === 'draft',
  invitation.code.startsWith('LMN-261008-'),
  invitation.createdAt === now.toISOString() && invitation.updatedAt === now.toISOString(),
  invitation.publishedAt === undefined,
  invitation.media.length === 0,
  invitation.content.hero.imageMediaId === '' && invitation.content.closing.imageMediaId === '',
  invitation.content.music.mediaId === '',
  !serializedInvitation.includes('Valentina')
    && !serializedInvitation.includes('/images/origin-01/')
    && !serializedInvitation.includes('/audio/'),
  draft.media.items.length === 0 && draft.media.assignments.length === 0,
  missingRequiredMediaIssues.length === 2,
  validation.previewBlocked === false && validation.invitationValid === false,
  invitation.modules.find(({ moduleId }) => moduleId === 'schedule')?.enabled === false
    && invitation.modules.find(({ moduleId }) => moduleId === 'weather')?.enabled === false
    && invitation.modules.find(({ moduleId }) => moduleId === 'instagram')?.enabled === false
    && invitation.modules.find(({ moduleId }) => moduleId === 'trivia')?.enabled === false,
]

assertions.forEach((condition, index) => {
  if (!condition) throw new Error(`New invitation assertion ${index + 1} failed.`)
})

console.log(`Studio new invitation: ${assertions.length} assertions passed.`)
