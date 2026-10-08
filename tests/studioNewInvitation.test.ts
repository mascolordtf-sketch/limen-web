import { createNewStudioInvitation } from '../src/features/studio/studioNewInvitation'

const now = new Date('2026-10-08T12:00:00.000Z')
const invitation = createNewStudioInvitation('  15 años de Maia  ', now)

const assertions = [
  invitation.internalName === '15 años de Maia',
  invitation.lifecycleStatus === 'draft',
  invitation.code.startsWith('LMN-261008-'),
  invitation.createdAt === now.toISOString() && invitation.updatedAt === now.toISOString(),
  invitation.publishedAt === undefined,
]

assertions.forEach((condition, index) => {
  if (!condition) throw new Error(`New invitation assertion ${index + 1} failed.`)
})

console.log(`Studio new invitation: ${assertions.length} assertions passed.`)
