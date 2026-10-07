import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PersistedStudioInvitationRoute } from './StudioInvitationRoute'
import { createNewStudioInvitation } from './studioNewInvitation'

export function StudioNewInvitationRoute() {
  const navigate = useNavigate()
  const [invitation] = useState(createNewStudioInvitation)
  const openPersistedInvitation = useCallback((code: string) => {
    navigate(`/studio/invitaciones/${code}`, { replace: true })
  }, [navigate])

  return <PersistedStudioInvitationRoute invitation={invitation} onFirstPersist={openPersistedInvitation} />
}
