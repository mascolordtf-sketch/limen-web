import type { InvitationAudience } from '../invitations/engine/invitationTypes'

export type StudioPreviewAudienceState = {
  readonly audience: InvitationAudience
  readonly run: number
}

export type StudioPreviewAudienceAction =
  | { readonly type: 'change-audience'; readonly audience: InvitationAudience }
  | { readonly type: 'restart' }

export const createStudioPreviewAudienceState = (
  audience: InvitationAudience = 'protagonist',
): StudioPreviewAudienceState => ({ audience, run: 0 })

export function transitionStudioPreviewAudience(
  state: StudioPreviewAudienceState,
  action: StudioPreviewAudienceAction,
): StudioPreviewAudienceState {
  return {
    audience: action.type === 'change-audience' ? action.audience : state.audience,
    run: state.run + 1,
  }
}

export const getStudioPreviewKey = ({ audience, run }: StudioPreviewAudienceState) =>
  `${audience}-${run}`
