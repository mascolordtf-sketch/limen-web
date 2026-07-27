import { useParams } from 'react-router-dom'

import { findStudioInvitation } from './studioInvitationRegistry'
import { StudioInvitationPage } from './StudioInvitationPage'
import { StudioUnavailablePage } from './StudioUnavailablePage'

export function StudioInvitationRoute() {
  const { code } = useParams()
  const invitation = code ? findStudioInvitation(code) : undefined

  if (!invitation) return <StudioUnavailablePage code={code} />

  return <StudioInvitationPage key={invitation.code} invitation={invitation} />
}
