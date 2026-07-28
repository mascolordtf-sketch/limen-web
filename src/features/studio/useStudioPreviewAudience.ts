import { useReducer } from 'react'

import type { InvitationAudience } from '../invitations/engine/invitationTypes'
import {
  createStudioPreviewAudienceState,
  getStudioPreviewKey,
  transitionStudioPreviewAudience,
} from './studioPreviewAudience'

export function useStudioPreviewAudience(initialAudience: InvitationAudience = 'protagonist') {
  const [state, dispatch] = useReducer(
    transitionStudioPreviewAudience,
    initialAudience,
    createStudioPreviewAudienceState,
  )

  const changeAudience = (audience: InvitationAudience) =>
    dispatch({ type: 'change-audience', audience })
  const restartPreview = () => dispatch({ type: 'restart' })

  return {
    audience: state.audience,
    previewKey: getStudioPreviewKey(state),
    changeAudience,
    restartPreview,
  }
}
