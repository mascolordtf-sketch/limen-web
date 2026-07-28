import { useParams } from 'react-router-dom'

import { findStudioInvitation } from './studioInvitationRegistry'
import { StudioInvitationPage } from './StudioInvitationPage'
import { StudioUnavailablePage } from './StudioUnavailablePage'
import { getOrigin01StudioDraftSessionId } from './origin01StudioDraft'

export function StudioInvitationRoute() {
  const { code } = useParams()
  const invitation = code ? findStudioInvitation(code) : undefined

  if (!invitation) return <StudioUnavailablePage code={code} />

  return <StudioInvitationPage key={getOrigin01StudioDraftSessionId(invitation)} invitation={invitation} />
}
