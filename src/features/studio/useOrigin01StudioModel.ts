import { useMemo, useState } from 'react'

import type { InvitationModuleId } from '../invitations/engine/moduleTypes'
import { findInvitationTemplate } from '../invitations/engine/templateRegistry'
import { validateInvitationConfiguration } from '../invitations/engine/invitationValidation'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { deriveOrigin01PreviewInvitation } from './origin01StudioDerivations'
import {
  createOrigin01StudioDraft,
  resetOrigin01StudioConfiguration,
  resetOrigin01StudioField,
  resetOrigin01StudioGroup,
  resetOrigin01StudioScene,
  resetOrigin01StudioValue,
  updateOrigin01StudioDraftField,
  updateOrigin01StudioDraftGroup,
  updateOrigin01StudioModule,
} from './origin01StudioDraft'
import type { Origin01EditableSceneId, Origin01StudioDraft } from './origin01StudioDraft'
import { validateOrigin01StudioDraft } from './origin01StudioValidation'
import type { StudioDirtyStateBoundary } from './studioNavigation'

export function useOrigin01StudioModel(invitation: Origin01InvitationData) {
  const initialDraft = useMemo(() => createOrigin01StudioDraft(invitation), [invitation])
  const [draft, setDraft] = useState<Origin01StudioDraft>(() => createOrigin01StudioDraft(invitation))
  const validation = useMemo(() => validateOrigin01StudioDraft(invitation, draft), [draft, invitation])
  const previewInvitation = useMemo(() => deriveOrigin01PreviewInvitation(invitation, draft), [draft, invitation])
  const configurationValidation = useMemo(
    () => validateInvitationConfiguration({ ...invitation, modules: draft.modules }, findInvitationTemplate),
    [draft.modules, invitation],
  )

  const update = <K extends keyof Origin01StudioDraft>(key: K, value: Origin01StudioDraft[K]) =>
    setDraft((current) => updateOrigin01StudioDraftField(current, key, value))
  const updateGroup = <K extends keyof Origin01StudioDraft>(
    key: K,
    updater: (current: Origin01StudioDraft[K]) => Origin01StudioDraft[K],
  ) => setDraft((current) => updateOrigin01StudioDraftGroup(current, key, updater))
  const resetValue = <K extends keyof Origin01StudioDraft>(key: K) =>
    setDraft((current) => resetOrigin01StudioValue(current, initialDraft, key))
  const resetField = <
    G extends Exclude<keyof Origin01StudioDraft, 'protagonistName' | 'modules'>,
    F extends keyof Origin01StudioDraft[G],
  >(group: G, field: F) => setDraft((current) => resetOrigin01StudioField(current, initialDraft, group, field))
  const resetGroup = <G extends Exclude<keyof Origin01StudioDraft, 'protagonistName' | 'modules'>>(group: G) =>
    setDraft((current) => resetOrigin01StudioGroup(current, initialDraft, group))
  const resetScene = (sceneId: Origin01EditableSceneId) =>
    setDraft((current) => resetOrigin01StudioScene(current, initialDraft, sceneId))
  const resetConfiguration = () =>
    setDraft((current) => resetOrigin01StudioConfiguration(current, initialDraft))
  const setModuleEnabled = (moduleId: InvitationModuleId, enabled: boolean) =>
    setDraft((current) => updateOrigin01StudioModule(invitation, current, moduleId, enabled))

  const dirtyState: StudioDirtyStateBoundary<Origin01StudioDraft> = {
    initialDraft,
    currentDraft: draft,
  }

  return {
    draft,
    initialDraft,
    validation,
    configurationValidation,
    previewInvitation,
    dirtyState,
    update,
    updateGroup,
    resetValue,
    resetField,
    resetGroup,
    resetScene,
    resetConfiguration,
    setModuleEnabled,
  }
}
