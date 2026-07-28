import { useState } from 'react'

import type { InvitationAudience } from '../invitations/engine/invitationTypes'

export type StudioPreviewAudienceState = {
  readonly audience: InvitationAudience
  readonly run: number
}

export function changeStudioPreviewAudience(
  state: StudioPreviewAudienceState,
  audience: InvitationAudience,
): StudioPreviewAudienceState {
  return { audience, run: state.run + 1 }
}

export function useStudioPreviewAudience(initialAudience: InvitationAudience = 'protagonist') {
  const [audience, setAudience] = useState<InvitationAudience>(initialAudience)
  const [previewRun, setPreviewRun] = useState(0)

  const changeAudience = (nextAudience: InvitationAudience) => {
    setPreviewRun((current) => current + 1)
    setAudience(nextAudience)
  }

  const restartPreview = () => setPreviewRun((current) => current + 1)

  return { audience, previewKey: `${audience}-${previewRun}`, changeAudience, restartPreview }
}
