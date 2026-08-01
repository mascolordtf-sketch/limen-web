import { AppRoutes } from '../src/app/routes'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Origin01Invitation, Origin01Schedule, Origin01WeatherPanel } from '../src/features/invitations/origin01/Origin01Invitation'
import { Origin01Community } from '../src/features/invitations/origin01/Origin01Community'
import origin01Css from '../src/features/invitations/origin01/origin01.css?raw'
import { calculateCoverNameFittedSize } from '../src/features/invitations/origin01/origin01CoverNameFit'
import { origin01DemoData } from '../src/features/invitations/origin01/origin01DemoData'
import { origin01Template } from '../src/features/invitations/origin01/origin01Template'
import { origin01ThemeVariants } from '../src/features/invitations/origin01/origin01ThemeVariants'
import { origin01VisualMatrixViewports,
  resolveOrigin01VisualMatrixCase } from '../src/features/invitations/origin01/origin01VisualMatrix'
import { findOrigin01TypographyCombination, getOrigin01TypographyStylesheets,
  origin01TypographyCombinations } from '../src/features/invitations/origin01/origin01Typography'
import { getOrigin01WeatherAvailability, parseOrigin01WeatherForecast } from '../src/features/invitations/origin01/origin01Weather'
import { validateInvitationConfiguration } from '../src/features/invitations/engine/invitationValidation'
import { findInvitationTemplate } from '../src/features/invitations/engine/templateRegistry'
import { StudioInvitationRoute } from '../src/features/studio/StudioInvitationRoute'
import { StudioVisualMatrixCase } from '../src/features/studio/StudioVisualMatrixCase'
import { StudioTypographyEvaluationStatus } from '../src/features/studio/StudioTypographyEvaluation'
import { canReuseEvaluationStylesheets,
  isTypographyEvaluationBusy } from '../src/features/studio/typographyEvaluationReadiness'
import { StudioPreview } from '../src/features/studio/StudioPreview'
import { getStudioPreviewMode, studioPreviewSceneSelectors } from '../src/features/studio/studioPreviewScenes'
import { StudioPreviewPane } from '../src/features/studio/StudioPreviewPane'
import { StudioReviewStage } from '../src/features/studio/StudioReviewStage'
import { StudioNavigationShell } from '../src/features/studio/StudioNavigationShell'
import { StudioReviewPanel } from '../src/features/studio/StudioReviewPanel'
import { StudioAestheticStage, StudioStageNavigation, StudioStagePresentation } from '../src/features/studio/StudioWorkspaceStages'
import { createStudioReturnToReview, studioWorkspaceStages } from '../src/features/studio/studioWorkspaceStages'
import { StudioTemplateStage } from '../src/features/studio/StudioTemplateStage'
import { StudioSectionsStage } from '../src/features/studio/StudioSectionsStage'
import { StudioScenesContent } from '../src/features/studio/StudioScenesContent'
import { findStudioSceneByEditorId, getVisibleStudioScenes, selectSceneAfterExclusion, studioGeneralScene,
  studioPublicScenes, studioScenes } from '../src/features/studio/studioScenes'
import { studioDesktopMediaQuery } from '../src/features/studio/studioViewport'
import { createStudioTemplateGalleryState, createStudioTemplateOptions,
  transitionStudioTemplateGallery } from '../src/features/studio/studioTemplateGallery'
import { StudioStoryEditor } from '../src/features/studio/StudioStoryEditor'
import { StudioContentEditor } from '../src/features/studio/StudioContentEditor'
import { StudioEventScheduleEditor } from '../src/features/studio/StudioEventScheduleEditor'
import { StudioScheduleEditor } from '../src/features/studio/StudioScheduleEditor'
import { StudioWeatherEditor } from '../src/features/studio/StudioWeatherEditor'
import { StudioCommunityEditor } from '../src/features/studio/StudioCommunityEditor'
import { validateOrigin01Community } from '../src/features/studio/studioCommunityValidation'
import { isTriviaContentValid } from '../src/features/studio/studioTriviaValidation'
import { StudioDressCodeEditor } from '../src/features/studio/StudioDressCodeEditor'
import { StudioGiftsEditor } from '../src/features/studio/StudioGiftsEditor'
import { getStudioEditorResolution, isStudioEditorId } from '../src/features/studio/studioEditorContract'
import { showsCountdownContent, showsEditorialContent, showsEventDetailsContent,
  showsOperationalContent } from '../src/features/studio/studioEditorVisibility'
import { deriveOrigin01PreviewInvitation } from '../src/features/studio/origin01StudioDerivations'
import {
  createOrigin01StudioMediaState,
  origin01MediaSlots,
  validateOrigin01StudioMedia,
} from '../src/features/studio/origin01StudioMedia'
import {
  createOrigin01StudioDraft,
  getOrigin01StudioDraftSessionId,
  resetOrigin01StudioConfiguration,
  resetOrigin01StudioField,
  resetOrigin01StudioGroup,
  resetOrigin01StudioScene,
  updateOrigin01StudioDraftField,
  updateOrigin01StudioDraftGroup,
  updateOrigin01StudioModule,
} from '../src/features/studio/origin01StudioDraft'
import {
  addOrigin01ScheduleMoment,
  moveOrigin01ScheduleMoment,
  removeOrigin01ScheduleMoment,
  studioScheduleMaxMoments,
  updateOrigin01ScheduleMoment,
  validateOrigin01Schedule,
} from '../src/features/studio/origin01StudioSchedule'
import {
  findStudioMediaById,
  getStudioMediaAssignments,
  normalizeInvitationMediaReference,
  projectRenderableMedia,
  replaceStudioMediaAssignment,
  validateStudioMediaContract,
} from '../src/features/studio/studioMedia'
import {
  addStudioPhotoItem,
  assignStudioPhoto,
  moveStudioGalleryPhoto,
  removeStudioPhotoAssignment,
  updateStudioPhotoAccessibility,
  updateStudioPhotoFocalPoint,
  updateStudioPhotoZoom,
} from '../src/features/studio/origin01StudioPhotos'
import {
  createPendingStudioPhoto,
  studioPhotoMaxBytes,
  validateStudioPhotoFile,
} from '../src/features/studio/studioPhotoProcessing'
import {
  createReadyStudioAudio,
  studioAudioMaxBytes,
  validateStudioAudioFile,
} from '../src/features/studio/studioAudioSelection'
import {
  addStudioAudioItem,
  assignStudioMusic,
  removeStudioMusicAssignment,
} from '../src/features/studio/origin01StudioMusic'
import { createOrigin01StudioDomains, origin01TriviaFlow } from '../src/features/studio/origin01StudioConfiguration'
import { selectValidStudioPreview, validateOrigin01StudioDraft } from '../src/features/studio/origin01StudioValidation'
import { selectStudioIssueSummary, selectStudioItemStatus } from '../src/features/studio/studioItemStatus'
import {
  createStudioPreviewAudienceState,
  getStudioPreviewKey,
  transitionStudioPreviewAudience,
} from '../src/features/studio/studioPreviewAudience'
import { createInitialStudioNavigation, transitionStudioNavigation } from '../src/features/studio/studioNavigation'
import { focusStudioEditorHeading, focusStudioIssueDestination, focusStudioReviewHeading, isStudioPreviewCloseKey,
  restoreStudioPreviewOpener } from '../src/features/studio/studioFocus'
import { createStudioPreviewSurfaceState, isStudioPreviewEffectivelyCollapsed, selectStudioPreviewContextLabel,
  resolveStudioPreviewContextLabel,
  transitionStudioPreviewSurface } from '../src/features/studio/studioPreviewSurface'
import { commitStudioRenderablePreview, createStudioCommittedPreviewCell,
  selectStudioRenderablePreview } from '../src/features/studio/useStudioRenderablePreview'
import { createStudioIssueCorrectionContext, groupStudioIssues, resolveStudioCorrectionReturn,
  issueNeedsCorrectionReturn, resolveStudioIssueDestination, resolveStudioStructuralDestination } from '../src/features/studio/studioReviewIssues'

let passed = 0
const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message)
  passed += 1
}

assert(studioDesktopMediaQuery === '(min-width: 76rem)',
  'Studio interpreta como escritorio el mismo breakpoint de 76rem usado por CSS')

const initial = createOrigin01StudioDraft(origin01DemoData)
assert(initial.themeVariant === 'origin01-wine'
  && origin01ThemeVariants.map(({ id }) => id).join('|') === origin01Template.supportedThemeVariants.join('|'),
  'inicializa la variante canónica y mantiene una única fuente de variantes admitidas')

const matrixCaseIds = origin01Template.canonicalOrder.flatMap((scene) => [
  ...(['protagonist', 'guest'] as const).flatMap((audience) =>
    origin01Template.supportedThemeVariants.flatMap((variant) =>
      (Object.keys(origin01VisualMatrixViewports) as (keyof typeof origin01VisualMatrixViewports)[])
        .map((viewport) => `BASE-${scene}-${audience}-${variant}-${viewport}`))),
  ...(['short', 'long'] as const).flatMap((profile) =>
    (Object.keys(origin01VisualMatrixViewports) as (keyof typeof origin01VisualMatrixViewports)[])
      .map((viewport) => `BOUNDARY-${scene}-${profile}-${viewport}`)),
])
const resolvedMatrixCases = matrixCaseIds.map((id) =>
  resolveOrigin01VisualMatrixCase(id, origin01DemoData))
assert(matrixCaseIds.length === 224 && resolvedMatrixCases.every(Boolean),
  'cada fila canónica de la matriz resuelve una invitación y un viewport reproducibles')
assert(resolvedMatrixCases.every((matrixCase) => matrixCase
  && validateInvitationConfiguration(matrixCase.invitation, findInvitationTemplate).valid),
  'todas las invitaciones derivadas conservan una configuración estructural válida')
assert(new Set(resolvedMatrixCases.map((matrixCase) => matrixCase?.id)).size === 224
  && resolveOrigin01VisualMatrixCase('BASE-unknown-protagonist-origin01-wine-mobile', origin01DemoData) === undefined,
  'la matriz conserva identidades únicas y rechaza casos inventados')
assert(/\.origin01-trivia\s*\{[^}]*overflow:\s*visible;/s.test(origin01Css)
  && /\.origin01-trivia__confetti\s*\{[^}]*width:\s*100cqw;[^}]*height:\s*max\(48rem,\s*100svh\);/s.test(origin01Css)
  && /\.origin01-trivia__confetti\s*\{[^}]*transform:\s*translateX\(-50%\);/s.test(origin01Css),
  'la celebración de Trivia ocupa el ancho de Origin 01, conserva altura de viewport y no queda recortada por la escena')

const midnightGuestDesktop = resolveOrigin01VisualMatrixCase(
  'BASE-hero-guest-origin01-midnight-desktop', origin01DemoData)
const guestPrelude = resolveOrigin01VisualMatrixCase(
  'BASE-prelude-guest-origin01-wine-mobile', origin01DemoData)
assert(midnightGuestDesktop?.audience === 'guest'
  && midnightGuestDesktop.variant === 'origin01-midnight'
  && midnightGuestDesktop.invitation.themeVariant === 'origin01-midnight'
  && midnightGuestDesktop.viewport.width === 1440
  && midnightGuestDesktop.viewport.height === 1000,
  'un caso base aplica audiencia, variante y viewport desde su identificador')
const forcedPreludeMarkup = renderToStaticMarkup(createElement(Origin01Invitation, {
  invitation: guestPrelude!.invitation,
  audience: guestPrelude!.audience,
  startAtPrelude: guestPrelude!.startAtPrelude,
}))
const canonicalGuestMarkup = renderToStaticMarkup(createElement(Origin01Invitation, {
  invitation: origin01DemoData,
  audience: 'guest',
}))
assert(guestPrelude?.audience === 'guest' && guestPrelude.startAtPrelude
  && forcedPreludeMarkup.includes('origin01-prelude')
  && !forcedPreludeMarkup.includes('origin01-envelope-stage')
  && canonicalGuestMarkup.includes('origin01-envelope-stage')
  && !canonicalGuestMarkup.includes('origin01-prelude'),
  'el harness puede inspeccionar el Preludio de invitado sin cambiar su entrada pública predeterminada')

const shortHero = resolveOrigin01VisualMatrixCase(
  'BOUNDARY-hero-short-mobile', origin01DemoData)
const longSchedule = resolveOrigin01VisualMatrixCase(
  'BOUNDARY-schedule-long-desktop', origin01DemoData)
const longCommunity = resolveOrigin01VisualMatrixCase(
  'BOUNDARY-instagram-long-desktop', origin01DemoData)
const longTrivia = resolveOrigin01VisualMatrixCase(
  'BOUNDARY-trivia-long-desktop', origin01DemoData)
assert(shortHero?.invitation.event.name === 'Ana'
  && shortHero.invitation.content.story === origin01DemoData.content.story
  && origin01DemoData.event.name === 'Valentina',
  'el perfil corto deriva solo la escena y sus dependencias sin mutar el fixture canónico')
assert(longSchedule?.invitation.content.schedule.moments.length === 8
  && longSchedule.invitation.content.schedule.moments.every(({ description }) => Boolean(description))
  && Object.values(validateOrigin01Schedule(longSchedule.invitation.content.schedule)).every((error) => error === null)
  && longSchedule.invitation.content.hero === origin01DemoData.content.hero,
  'el perfil largo utiliza valores concretos y conserva las escenas ajenas')
assert(longCommunity !== undefined
  && Object.values(validateOrigin01Community(longCommunity.invitation.content.community)).every((error) => error === null)
  && longTrivia !== undefined && isTriviaContentValid(longTrivia.invitation.content.trivia),
  'los perfiles complejos de Comunidad y Trivia continúan siendo contenido editorial válido')

const harnessMarkup = renderToStaticMarkup(createElement(MemoryRouter, {
  initialEntries: ['/studio/matriz/BASE-hero-guest-origin01-midnight-desktop'],
}, createElement(Routes, null, createElement(Route, {
  path: '/studio/matriz/:caseId', element: createElement(StudioVisualMatrixCase),
}))))
assert(harnessMarkup.includes('width="1440"') && harnessMarkup.includes('height="1000"')
  && harnessMarkup.includes('matriz=BASE-hero-guest-origin01-midnight-desktop'),
  'el harness materializa la fila en un iframe con dimensiones y estado exactos')

assert(initial.event.venue === 'Palacio del Lago', 'inicializa el lugar desde el fixture')
assert(initial !== createOrigin01StudioDraft(origin01DemoData), 'crea borradores independientes')
const canonicalMediaState = createOrigin01StudioMediaState(origin01DemoData)
assert(canonicalMediaState.items.map(({ id }) => id).join('|') === origin01DemoData.media.map(({ id }) => id).join('|')
  && canonicalMediaState.items.every(({ origin }) => origin === 'canonical'),
  'normaliza los medios canónicos sin perder identidad ni procedencia')
assert(getStudioMediaAssignments(canonicalMediaState.assignments, 'hero.image')[0]?.mediaId === 'hero'
  && getStudioMediaAssignments(canonicalMediaState.assignments, 'dressCode.image')[0]?.mediaId === 'dress'
  && getStudioMediaAssignments(canonicalMediaState.assignments, 'gifts.image')[0]?.mediaId === 'gift'
  && getStudioMediaAssignments(canonicalMediaState.assignments, 'closing.image')[0]?.mediaId === 'closing'
  && getStudioMediaAssignments(canonicalMediaState.assignments, 'music.audio')[0]?.mediaId === 'music',
  'asocia cada referencia única de Origin 01 con su slot declarativo')
assert(getStudioMediaAssignments(canonicalMediaState.assignments, 'gallery.images')
  .map(({ mediaId }) => mediaId).join('|') === 'hero|dress|closing',
  'normaliza la galería conservando el orden canónico')
const normalizedHero = findStudioMediaById(canonicalMediaState.items, 'hero')
const normalizedMusic = findStudioMediaById(canonicalMediaState.items, 'music')
assert(normalizedHero?.kind === 'image' && 'accessibility' in normalizedHero
  && normalizedMusic?.kind === 'audio' && !('accessibility' in normalizedMusic),
  'imagen y audio comparten el contrato sin recibir propiedades incompatibles')
assert(validateOrigin01StudioMedia(canonicalMediaState).length === 0,
  'los medios y asignaciones canónicos satisfacen el contrato estructural')
assert(projectRenderableMedia(canonicalMediaState.items).length === origin01DemoData.media.length,
  'todos los medios canónicos listos se proyectan al contrato renderizable')
const nonReadyMedia = [
  { id: 'pending', kind: 'image', origin: 'studio', accessibility: { kind: 'decorative' }, status: 'pending' },
  { id: 'processing', kind: 'audio', origin: 'studio', status: 'processing', progress: 40 },
  { id: 'failed', kind: 'audio', origin: 'studio', status: 'error', message: 'No se pudo procesar.' },
] as const
assert(projectRenderableMedia(nonReadyMedia).length === 0,
  'los medios pendientes, procesándose o con error no se proyectan como listos')
const imageIntoMusic = replaceStudioMediaAssignment(canonicalMediaState, origin01MediaSlots,
  'music.audio', 'hero')
const audioIntoHero = replaceStudioMediaAssignment(canonicalMediaState, origin01MediaSlots,
  'hero.image', 'music')
assert(!imageIntoMusic.ok && imageIntoMusic.error.code === 'incompatible-media-kind'
  && !audioIntoHero.ok && audioIntoHero.error.code === 'incompatible-media-kind',
  'los slots de imagen y música rechazan tipos incompatibles en ambas direcciones')
const repeatedSingleState = {
  ...canonicalMediaState,
  assignments: [...canonicalMediaState.assignments, { slotId: 'hero.image', mediaId: 'closing' }] as const,
}
assert(validateOrigin01StudioMedia(repeatedSingleState).some(({ code, slotId }) =>
  code === 'invalid-cardinality' && slotId === 'hero.image'),
  'un slot único rechaza múltiples asignaciones')
assert(getStudioMediaAssignments(canonicalMediaState.assignments, 'gallery.images').length === 3
  && !validateOrigin01StudioMedia(canonicalMediaState).some(({ slotId }) => slotId === 'gallery.images'),
  'la galería admite múltiples asignaciones ordenadas')
const missingMediaState = {
  ...canonicalMediaState,
  assignments: [...canonicalMediaState.assignments, { slotId: 'gallery.images', mediaId: 'missing', position: 3 }] as const,
}
assert(validateOrigin01StudioMedia(missingMediaState).some(({ code, message }) =>
  code === 'missing-media' && message.includes('missing')),
  'una asignación inexistente produce un error de dominio comprensible')
const duplicateMediaState = {
  ...canonicalMediaState,
  items: [...canonicalMediaState.items, canonicalMediaState.items[0]!],
}
assert(validateOrigin01StudioMedia(duplicateMediaState).some(({ code }) => code === 'duplicate-media-id'),
  'detecta identificadores de medios duplicados')
const replacement = replaceStudioMediaAssignment(canonicalMediaState, origin01MediaSlots,
  'hero.image', 'closing')
assert(replacement.ok
  && getStudioMediaAssignments(replacement.state.assignments, 'hero.image')[0]?.mediaId === 'closing'
  && getStudioMediaAssignments(canonicalMediaState.assignments, 'hero.image')[0]?.mediaId === 'hero'
  && replacement.state.items === canonicalMediaState.items,
  'la sustitución de una asignación es inmutable y conserva la biblioteca')
const informativeWithoutAlt = {
  items: [{
    id: 'informative', kind: 'image', origin: 'studio',
    accessibility: { kind: 'informative', alt: '' }, status: 'ready', src: '/informative.webp',
  }],
  assignments: [],
} as const
const decorativeWithoutAlt = {
  items: [{
    id: 'decorative', kind: 'image', origin: 'studio',
    accessibility: { kind: 'decorative' }, status: 'ready', src: '/decorative.webp',
  }],
  assignments: [],
} as const
assert(validateStudioMediaContract(informativeWithoutAlt, origin01MediaSlots)
  .some(({ code }) => code === 'missing-informative-alt')
  && !validateStudioMediaContract(decorativeWithoutAlt, origin01MediaSlots)
    .some(({ code }) => code === 'missing-informative-alt'),
  'exige alt a imágenes informativas y permite declarar imágenes decorativas')
assert(normalizeInvitationMediaReference({
  id: 'future-video', kind: 'video', src: '/future.mp4',
}) === null,
  'el contrato editorial del MVP no habilita video')
const mediaDerivedPreview = deriveOrigin01PreviewInvitation(origin01DemoData, initial)
assert(mediaDerivedPreview.media.map(({ id }) => id).join('|') === origin01DemoData.media.map(({ id }) => id).join('|')
  && mediaDerivedPreview.content.gallery.images.map(({ mediaId }) => mediaId).join('|') === 'hero|dress|closing',
  'Studio deriva medios renderizables y asignaciones sin cambiar la invitación actual')
const midnightDraft = updateOrigin01StudioDraftField(initial, 'themeVariant', 'origin01-midnight')
const midnightPreview = deriveOrigin01PreviewInvitation(origin01DemoData, midnightDraft)
assert(midnightPreview.themeVariant === 'origin01-midnight'
  && origin01DemoData.themeVariant === 'origin01-wine'
  && validateOrigin01StudioDraft(origin01DemoData, midnightDraft).structurallyValid,
  'cambia la variante visual en la preview sin mutar la invitación canónica')
const midnightMarkup = renderToStaticMarkup(createElement(Origin01Invitation, {
  invitation: midnightPreview,
  audience: 'protagonist',
}))
assert(midnightMarkup.includes('origin01--theme-origin01-midnight'),
  'el renderer expone la variante seleccionada como un límite visual propio')
assert(origin01TypographyCombinations.length === 12
  && new Set(origin01TypographyCombinations.map(({ id }) => id)).size === 12
  && origin01TypographyCombinations.every((combination) =>
    getOrigin01TypographyStylesheets(combination).length >= 2
    && getOrigin01TypographyStylesheets(combination).length <= 3
    && getOrigin01TypographyStylesheets(combination).every((path) => path.endsWith('/font-face.css'))),
  'el laboratorio registra doce combinaciones únicas y limita cada prueba a sus fuentes reales')
assert(isTypographyEvaluationBusy('loading') && !isTypographyEvaluationBusy('ready')
  && !isTypographyEvaluationBusy('error'),
  'el laboratorio informa aria-busy únicamente mientras prepara las fuentes')
const typographyLoadingMarkup = renderToStaticMarkup(createElement(StudioTypographyEvaluationStatus,
  { readiness: 'loading', onRetry: () => undefined }))
const typographyErrorMarkup = renderToStaticMarkup(createElement(StudioTypographyEvaluationStatus,
  { readiness: 'error', onRetry: () => undefined }))
const typographyReadyMarkup = renderToStaticMarkup(createElement(StudioTypographyEvaluationStatus,
  { readiness: 'ready', onRetry: () => undefined }))
assert(typographyLoadingMarkup.includes('role="status"')
  && typographyErrorMarkup.includes('role="alert"')
  && typographyErrorMarkup.includes('Reintentar carga')
  && typographyReadyMarkup === '',
  'los estados loading, error y ready exponen mensajes y reintento accesibles cuando corresponde')
const verifiedStylesheets = origin01TypographyCombinations.flatMap(getOrigin01TypographyStylesheets)
  .filter((path, index, paths) => paths.indexOf(path) === index)
  .map(() => ({ dataset: { limenFontState: 'verified' } }))
assert(canReuseEvaluationStylesheets(verifiedStylesheets, verifiedStylesheets.length)
  && !canReuseEvaluationStylesheets(
    verifiedStylesheets.map((stylesheet, index) => index === 0
      ? { dataset: { limenFontState: 'loaded' } }
      : stylesheet),
    verifiedStylesheets.length,
  )
  && !canReuseEvaluationStylesheets(verifiedStylesheets.slice(1), verifiedStylesheets.length),
  'solo reutiliza el conjunto completo de hojas cuya carga tipográfica terminó verificada')
const gardenTypography = findOrigin01TypographyCombination('garden-antigua')
const typographyMarkup = renderToStaticMarkup(createElement(Origin01Invitation, {
  invitation: origin01DemoData,
  audience: 'protagonist',
  typography: gardenTypography,
}))
assert(gardenTypography?.coverName.family === 'WindSong'
  && typographyMarkup.includes('--origin-cover-name:&#x27;WindSong&#x27;, cursive')
  && typographyMarkup.includes('--origin-display:&#x27;Fraunces&#x27;, serif')
  && typographyMarkup.includes('--origin-reading:&#x27;Quicksand&#x27;, sans-serif')
  && findOrigin01TypographyCombination('desconocida') === undefined,
  'la evaluación aplica las tres familias autoalojadas y rechaza identificadores desconocidos')
assert(calculateCoverNameFittedSize({ availableWidth: 360, renderedWidth: 300, fontSize: 90 }) === undefined
  && calculateCoverNameFittedSize({ availableWidth: 360, renderedWidth: 420, fontSize: 90 }) === 72
  && calculateCoverNameFittedSize({ availableWidth: 0, renderedWidth: 420, fontSize: 90 }) === undefined,
  'el nombre conserva su escala cuando entra y se reduce proporcionalmente antes de desbordar')
assert(validateStudioPhotoFile({ name: 'foto.gif', type: 'image/gif', size: 1_000 })?.includes('JPG')
  && validateStudioPhotoFile({ name: 'foto.jpg', type: 'image/jpeg', size: studioPhotoMaxBytes + 1 })?.includes('12 MB')
  && validateStudioPhotoFile({ name: 'foto.webp', type: 'image/webp', size: 1_000 }) === null,
  'la selección de fotografías acepta solo formatos y tamaño del alcance')
const pendingPhoto = createPendingStudioPhoto('studio-new', {
  name: 'valentina.jpg', type: 'image/jpeg', size: 2_000,
}, 'Retrato de Valentina')
const withPendingPhoto = addStudioPhotoItem(canonicalMediaState, pendingPhoto)
assert(findStudioMediaById(withPendingPhoto.items, 'studio-new')?.status === 'pending'
  && findStudioMediaById(canonicalMediaState.items, 'studio-new') === undefined,
  'una fotografía temporal se incorpora sin mutar el estado canónico')
const readyPhoto = { ...pendingPhoto, status: 'ready' as const, src: 'blob:studio-new' }
const assignedPhoto = assignStudioPhoto(addStudioPhotoItem(canonicalMediaState, readyPhoto),
  'hero.image', readyPhoto.id)
assert(getStudioMediaAssignments(assignedPhoto.assignments, 'hero.image')[0]?.mediaId === readyPhoto.id
  && getStudioMediaAssignments(canonicalMediaState.assignments, 'hero.image')[0]?.mediaId === 'hero',
  'el reemplazo de una fotografía conserva identidad e inmutabilidad')
const galleryMoved = moveStudioGalleryPhoto(canonicalMediaState, 0, 2)
assert(getStudioMediaAssignments(galleryMoved.assignments, 'gallery.images')
  .map(({ mediaId }) => mediaId).join('|') === 'dress|closing|hero',
  'la galería reordena asignaciones y normaliza posiciones')
const galleryReduced = removeStudioPhotoAssignment(canonicalMediaState, 'gallery.images', 1)
assert(getStudioMediaAssignments(galleryReduced.assignments, 'gallery.images')
  .map(({ position }) => position).join('|') === '0|1',
  'quitar una fotografía de galería mantiene posiciones continuas')
const galleryReplacement = assignStudioPhoto(addStudioPhotoItem(canonicalMediaState, readyPhoto),
  'gallery.images', readyPhoto.id, 1)
const galleryReducedAfterReplacement = removeStudioPhotoAssignment(galleryReplacement, 'gallery.images', 0)
assert(getStudioMediaAssignments(galleryReducedAfterReplacement.assignments, 'gallery.images')
  .map(({ mediaId }) => mediaId).join('|') === `${readyPhoto.id}|closing`,
  'quitar después de reemplazar conserva el orden visual declarado de la galería')
const focusedHero = updateStudioPhotoFocalPoint(canonicalMediaState, 'hero.image', undefined, 'x', 18)
const focusedPreview = deriveOrigin01PreviewInvitation(origin01DemoData, { ...initial, media: focusedHero })
const focusedHeroId = focusedPreview.content.hero.imageMediaId
assert(focusedHeroId.startsWith('studio-slot:hero.image')
  && focusedPreview.media.find(({ id }) => id === focusedHeroId)?.focalPoint?.x === 18,
  'el encuadre pertenece al uso de la foto y se proyecta sin alterar el medio compartido')
const boundedFocus = updateStudioPhotoFocalPoint(canonicalMediaState, 'hero.image', undefined, 'y', 140)
assert(getStudioMediaAssignments(boundedFocus.assignments, 'hero.image')[0]?.focalPoint?.y === 100,
  'el encuadre queda limitado al rango visible')
const zoomedHero = updateStudioPhotoZoom(canonicalMediaState, 'hero.image', undefined, 1.45)
const zoomedPreview = deriveOrigin01PreviewInvitation(origin01DemoData, { ...initial, media: zoomedHero })
const zoomedHeroId = zoomedPreview.content.hero.imageMediaId
assert(zoomedHeroId.startsWith('studio-slot:hero.image')
  && zoomedPreview.media.find(({ id }) => id === zoomedHeroId)?.zoom === 1.45
  && getStudioMediaAssignments(canonicalMediaState.assignments, 'hero.image')[0]?.zoom === undefined,
  'el zoom pertenece al uso de la foto, se proyecta y no altera el medio compartido')
const boundedZoom = updateStudioPhotoZoom(canonicalMediaState, 'hero.image', undefined, 4)
const resetZoom = updateStudioPhotoZoom(zoomedHero, 'hero.image', undefined, 1)
assert(getStudioMediaAssignments(boundedZoom.assignments, 'hero.image')[0]?.zoom === 2
  && getStudioMediaAssignments(resetZoom.assignments, 'hero.image')[0]?.zoom === undefined,
  'el zoom se limita a 2× y volver a 1× restaura la representación canónica')
assert(validateOrigin01StudioMedia({
  ...canonicalMediaState,
  assignments: canonicalMediaState.assignments.map((assignment) =>
    assignment.slotId === 'hero.image' ? { ...assignment, zoom: .5 } : assignment),
}).some(({ code }) => code === 'invalid-zoom'),
  'el contrato rechaza un zoom fuera del rango permitido')
const withoutDress = removeStudioPhotoAssignment(canonicalMediaState, 'dressCode.image')
const withoutDressPreview = deriveOrigin01PreviewInvitation(origin01DemoData, { ...initial, media: withoutDress })
assert(withoutDressPreview.content.dressCode.imageMediaId === '',
  'un slot fotográfico opcional puede quedar vacío sin recuperar silenciosamente la imagen canónica')
const withoutAlt = updateStudioPhotoAccessibility(canonicalMediaState, 'hero.image', undefined,
  { kind: 'informative', alt: '' })
assert(validateOrigin01StudioMedia(withoutAlt).some(({ code }) => code === 'missing-informative-alt'),
  'la edición de texto alternativo conserva la validación accesible')
const distinctHeroAlt = updateStudioPhotoAccessibility(canonicalMediaState, 'hero.image', undefined,
  { kind: 'informative', alt: 'Valentina en la portada' })
const distinctGalleryAlt = updateStudioPhotoAccessibility(distinctHeroAlt, 'gallery.images', 0,
  { kind: 'informative', alt: 'Valentina durante la celebración' })
const distinctAltPreview = deriveOrigin01PreviewInvitation(origin01DemoData, { ...initial, media: distinctGalleryAlt })
const distinctHeroId = distinctAltPreview.content.hero.imageMediaId
const distinctGalleryId = distinctAltPreview.content.gallery.images[0]?.mediaId
assert(distinctHeroId !== distinctGalleryId
  && distinctAltPreview.media.find(({ id }) => id === distinctHeroId)?.alt === 'Valentina en la portada'
  && distinctAltPreview.media.find(({ id }) => id === distinctGalleryId)?.alt === 'Valentina durante la celebración'
  && findStudioMediaById(distinctGalleryAlt.items, 'hero') === normalizedHero,
  'cada uso compartido conserva un texto alternativo independiente sin mutar el medio')
assert(validateStudioAudioFile({ name: 'tema.aac', type: 'audio/aac', size: 1_000 })?.includes('MP3')
  && validateStudioAudioFile({ name: 'tema.mp3', type: 'audio/mpeg', size: studioAudioMaxBytes + 1 })?.includes('20 MB')
  && validateStudioAudioFile({ name: 'tema.m4a', type: 'audio/mp4', size: 1_000 }) === null
  && validateStudioAudioFile({ name: 'tema.m4a', type: 'audio/m4a', size: 1_000 }) === null
  && validateStudioAudioFile({ name: 'tema.wav', type: 'audio/wave', size: 1_000 }) === null
  && validateStudioAudioFile({ name: 'tema.wav', type: 'audio/vnd.wave', size: 1_000 }) === null
  && validateStudioAudioFile({ name: 'tema.mp3', type: '', size: 1_000 }) === null
  && validateStudioAudioFile({ name: 'tema.m4a', type: 'application/octet-stream', size: 1_000 }) === null,
  'la selección musical acepta formatos, variantes MIME y tamaño del alcance')
const readyAudio = createReadyStudioAudio('studio-music', {
  name: 'noche-especial.mp3', type: 'audio/mpeg', size: 2_000,
}, 'blob:studio-music')
const assignedMusic = assignStudioMusic(addStudioAudioItem(canonicalMediaState, readyAudio), readyAudio.id)
const assignedMusicPreview = deriveOrigin01PreviewInvitation(origin01DemoData, { ...initial, media: assignedMusic })
assert(getStudioMediaAssignments(assignedMusic.assignments, 'music.audio')[0]?.mediaId === readyAudio.id
  && assignedMusicPreview.content.music.mediaId === readyAudio.id
  && assignedMusicPreview.media.find(({ id }) => id === readyAudio.id)?.src === 'blob:studio-music'
  && getStudioMediaAssignments(canonicalMediaState.assignments, 'music.audio')[0]?.mediaId === 'music',
  'reemplazar música conserva identidad, inmutabilidad y proyección renderizable')
const withoutMusic = removeStudioMusicAssignment(assignedMusic)
const withoutMusicPreview = deriveOrigin01PreviewInvitation(origin01DemoData, { ...initial, media: withoutMusic })
assert(getStudioMediaAssignments(withoutMusic.assignments, 'music.audio').length === 0
  && withoutMusicPreview.content.music.mediaId === ''
  && findStudioMediaById(withoutMusic.items, readyAudio.id) === undefined
  && !renderToStaticMarkup(createElement(Origin01Invitation, {
    invitation: withoutMusicPreview, audience: 'protagonist',
  })).includes('<audio'),
  'desactivar música vacía el slot sin recuperar la pista canónica y descarta el audio temporal sin uso')
const restoredMusic = assignStudioMusic(withoutMusic, 'music')
assert(getStudioMediaAssignments(restoredMusic.assignments, 'music.audio')[0]?.mediaId === 'music'
  && findStudioMediaById(restoredMusic.items, 'music')?.origin === 'canonical',
  'restablecer música recupera la asignación canónica sin duplicar el medio')
const sectionsMarkup = renderToStaticMarkup(createElement(StudioSectionsStage,
  { draft: initial, onSceneChange: () => undefined }))
assert(sectionsMarkup.includes('Armá el recorrido') && sectionsMarkup.includes('Elegí qué momentos forman parte')
  && studioPublicScenes.length === 13 && studioPublicScenes.every(({ label }) => sectionsMarkup.includes(label))
  && !sectionsMarkup.includes('Datos generales'), 'Secciones presenta las trece escenas públicas, sin Datos generales')
assert(studioPublicScenes.filter(({ required }) => required).map(({ label }) => label).join('|')
  === 'Portada|Información del evento|Confirmación|Cierre'
  && (sectionsMarkup.match(/Siempre incluida/g) ?? []).length === 4,
  'Secciones protege las escenas aprobadas y la obligatoriedad adicional de Cierre definida por Origin 01')
assert(sectionsMarkup.includes('El umbral') && sectionsMarkup.includes('La celebración')
  && sectionsMarkup.includes('La participación') && sectionsMarkup.includes('La despedida')
  && sectionsMarkup.includes('13 escenas') && sectionsMarkup.includes('4 esenciales')
  && sectionsMarkup.includes('9 de 9 opcionales')
  && sectionsMarkup.indexOf('Portada') < sectionsMarkup.indexOf('Cuenta regresiva')
  && sectionsMarkup.indexOf('Cuenta regresiva') < sectionsMarkup.indexOf('Historia')
  && sectionsMarkup.indexOf('Información del evento') < sectionsMarkup.indexOf('Cronograma')
  && sectionsMarkup.indexOf('Cronograma') < sectionsMarkup.indexOf('Clima')
  && sectionsMarkup.indexOf('Clima') < sectionsMarkup.indexOf('Dress code')
  && sectionsMarkup.indexOf('Galería') < sectionsMarkup.indexOf('Comunidad')
  && sectionsMarkup.indexOf('Comunidad') < sectionsMarkup.indexOf('Trivia')
  && sectionsMarkup.indexOf('Confirmación') < sectionsMarkup.indexOf('Cierre'),
  'Secciones organiza el orden canónico en cuatro capítulos narrativos y resume su composición')
const giftsOff = updateOrigin01StudioModule(origin01DemoData, initial, 'gifts', false)
assert(!getVisibleStudioScenes(giftsOff).some(({ id }) => id === 'gifts')
  && getVisibleStudioScenes(initial).map(({ id }) => id).indexOf('gifts')
    < getVisibleStudioScenes(initial).map(({ id }) => id).indexOf('rsvp'),
  'Contenido deriva la exclusión y reinclusión de Regalos en su posición canónica')
const giftsOffSectionsMarkup = renderToStaticMarkup(createElement(StudioSectionsStage,
  { draft: giftsOff, onSceneChange: () => undefined }))
assert(giftsOffSectionsMarkup.includes('8 de 9 opcionales')
  && giftsOffSectionsMarkup.includes('No incluida') && giftsOffSectionsMarkup.includes('Fuera del recorrido'),
  'Secciones actualiza el resumen y el estado editorial al excluir una escena opcional')
const editedGifts = updateOrigin01StudioDraftGroup(initial, 'gifts', (gifts) => ({ ...gifts, accountValue: 'Alias.Editado' }))
const editedGiftsOff = updateOrigin01StudioModule(origin01DemoData, editedGifts, 'gifts', false)
const editedGiftsOn = updateOrigin01StudioModule(origin01DemoData, editedGiftsOff, 'gifts', true)
assert(!getVisibleStudioScenes(editedGiftsOff).some(({ id }) => id === 'gifts')
  && getVisibleStudioScenes(editedGiftsOn).map(({ id }) => id).join('|') === getVisibleStudioScenes(initial).map(({ id }) => id).join('|')
  && editedGiftsOn.gifts.accountValue === 'Alias.Editado',
  'excluir y reactivar Regalos restaura su posición sin perder el valor temporal editado')
const sceneEditors = Object.fromEntries(studioPublicScenes.map(({ id, editorIds }) => [id, editorIds]))
assert(sceneEditors.story?.join() === 'story' && sceneEditors['event-details']?.join() === 'event-copy'
  && sceneEditors.schedule?.join() === 'schedule'
  && sceneEditors['dress-code']?.join() === 'dress-code'
  && new Set([sceneEditors.story?.[0], sceneEditors['event-details']?.[0], sceneEditors.schedule?.[0],
    sceneEditors['dress-code']?.[0]]).size === 4,
  'Historia, Información del evento, Cronograma y Dress code resuelven grupos de editores distintos')
const declaredEditorIds = studioScenes.flatMap(({ editorIds }) => [...editorIds])
assert(findStudioSceneByEditorId('identity')?.id === 'general'
  && findStudioSceneByEditorId('event-canonical')?.id === 'general'
  && findStudioSceneByEditorId('event-operations')?.id === 'general'
  && findStudioSceneByEditorId('share')?.id === 'general'
  && findStudioSceneByEditorId('opening')?.id === 'cover'
  && findStudioSceneByEditorId('story')?.id === 'story'
  && new Set(declaredEditorIds).size === declaredEditorIds.length
  && studioGeneralScene.editorIds.length === 4,
  'cada editor visible resuelve de forma única hacia Datos generales o una escena pública')
const inconsistentRequired = { ...initial, modules: initial.modules.map((module) =>
  ['prelude', 'hero', 'eventDetails', 'rsvp', 'closing'].includes(module.moduleId) ? { ...module, enabled: false } : module) }
assert(['cover', 'event-details', 'rsvp', 'closing'].every((id) =>
  getVisibleStudioScenes(inconsistentRequired).some((scene) => scene.id === id)),
  'la proyección visible normaliza las escenas obligatorias de un borrador inconsistente')
assert(selectSceneAfterExclusion('gifts', giftsOff) === 'rsvp',
  'al excluir la escena seleccionada elige la siguiente escena incluida')
const contentMarkup = renderToStaticMarkup(createElement(StudioScenesContent, {
  draft: giftsOff, selectedScene: 'story', onSceneSelect: () => undefined,
  editor: createElement('div', null, 'EDITOR_CONTEXTUAL'), preview: createElement('div', null, 'PREVIEW_REAL'),
  previewDedicated: false, previewCollapsed: false, onShowPreview: () => undefined,
}))
assert(contentMarkup.includes('Datos generales') && contentMarkup.includes('Historia')
  && !contentMarkup.includes('>Regalos<') && !contentMarkup.includes('Agregar o quitar secciones')
  && (contentMarkup.match(/EDITOR_CONTEXTUAL/g) ?? []).length === 1,
  'Contenido muestra solo escenas incluidas y una región editorial sin duplicar el acceso a Secciones')
assert(contentMarkup.includes('Editando ahora') && contentMarkup.includes('Escena opcional')
  && contentMarkup.includes('limen-studio__editor-scene-number')
  && contentMarkup.includes('limen-studio__editor-heading'),
  'el workspace editorial identifica la escena activa, su orden y su carácter narrativo')
const generalContentMarkup = renderToStaticMarkup(createElement(StudioScenesContent, {
  draft: initial, selectedScene: 'general', onSceneSelect: () => undefined,
  editor: createElement('div', null, 'EDITOR_GENERAL'), preview: createElement('div', null, 'PREVIEW_GENERAL'),
  previewDedicated: false, previewCollapsed: false, onShowPreview: () => undefined,
  editorTabs: [{ id: 'identity', label: 'Identidad' }], selectedEditorId: 'identity',
  onEditorSelect: () => undefined,
}))
assert(generalContentMarkup.includes('Base compartida') && generalContentMarkup.includes('Áreas de edición')
  && generalContentMarkup.includes('aria-label="Configuraciones de Datos generales"'),
  'Datos generales presenta su condición compartida y agrupa la navegación interna como áreas de edición')
assert((contentMarkup.match(/PREVIEW_REAL/g) ?? []).length === 1 && !contentMarkup.includes('Ver invitación')
  && !contentMarkup.includes('Proyecciones') && !contentMarkup.includes('Datos canónicos'),
  'Contenido mantiene una preview junto al editor sin duplicar su apertura y oculta la taxonomía técnica del motor')
const draftBeforeStageNavigation = JSON.stringify(initial)
const stageLabels = ['Plantilla', 'Estética', 'Secciones', 'Contenido', 'Revisión']
const stageMarkup = renderToStaticMarkup(createElement(StudioStageNavigation,
  { activeStage: 'template', onStageChange: () => undefined }))
assert(studioWorkspaceStages.map(({ label }) => label).join('|') === stageLabels.join('|')
  && stageLabels.every((label) => stageMarkup.includes(label)) && !stageMarkup.includes('Diseño'),
  'la navegación superior presenta las cinco etapas aprobadas en orden')
assert(studioWorkspaceStages.every(({ id }) => renderToStaticMarkup(createElement(StudioStageNavigation,
  { activeStage: id, onStageChange: () => undefined })).includes('aria-current="step"')),
  'cada etapa superior puede activarse, incluida Revisión')
const aestheticStageElement = createElement(StudioAestheticStage, {
  demoPath: '/demo/LMN-015-001',
  media: initial.media,
  initialMedia: initial.media,
  themeVariant: initial.themeVariant,
  initialThemeVariant: initial.themeVariant,
  protagonistName: initial.protagonistName,
  initialGalleryCaptions: initial.gallery.captions,
  onMediaChange: () => undefined,
  onGalleryCaptionsChange: () => undefined,
  onThemeVariantChange: () => undefined,
  onTemporaryUrl: () => undefined,
})
const aestheticMarkup = renderToStaticMarkup(aestheticStageElement)
assert(aestheticMarkup.includes('Elegí la atmósfera de Origin 01')
  && origin01ThemeVariants.every(({ name }) => aestheticMarkup.includes(name))
  && aestheticMarkup.includes('Compará las doce voces de Origin 01')
  && origin01TypographyCombinations.every(({ name }) => aestheticMarkup.includes(name))
  && aestheticMarkup.includes('/demo/LMN-015-001?tipografia=noche-plateada&amp;inicio=invitacion')
  && aestheticMarkup.includes('aria-busy="true"')
  && aestheticMarkup.includes('Cargando las tipografías reales para comparar')
  && aestheticMarkup.includes('Nombre de portada · Cormorant Garamond')
  && aestheticMarkup.includes('Evaluación · sin persistencia')
  && aestheticMarkup.includes('Sistema visual curado')
  && aestheticMarkup.includes('Las imágenes que cuentan la historia')
  && aestheticMarkup.includes('Zoom')
  && (aestheticMarkup.match(/Cambiar foto/g) ?? []).length === 7
  && aestheticMarkup.includes('El sonido que acompaña la experiencia')
  && aestheticMarkup.includes('Música asignada')
  && aestheticMarkup.includes('Cambiar audio')
  && aestheticMarkup.includes('Desactivar música')
  && aestheticMarkup.includes('controls=""')
  && JSON.stringify(initial) === draftBeforeStageNavigation,
  'Estética administra variantes, fotografías y música sin mutar el borrador')
const templateMainMarkup = renderToStaticMarkup(createElement(StudioTemplateStage,
  { template: origin01Template, demoPath: '/demo/RUTA-DINAMICA' }))
assert(templateMainMarkup.includes('Elegí cómo contar la celebración') && templateMainMarkup.includes('Origin 01')
  && templateMainMarkup.includes('Universo Origen') && templateMainMarkup.includes('Experiencia narrativa')
  && templateMainMarkup.includes('Seleccionada') && templateMainMarkup.includes('Ver demostración')
  && templateMainMarkup.includes('/demo/RUTA-DINAMICA')
  && templateMainMarkup.includes('/images/origin-01/hero-valentina.webp'),
  'Plantilla presenta Origin 01 con preview vertical, nomenclatura aprobada, estado y demo dinámica')
assert(['Editorial', 'Esencial', 'Celebración'].every((name) => templateMainMarkup.includes(name))
  && (templateMainMarkup.match(/Próximamente/g) ?? []).length === 3
  && !templateMainMarkup.includes('Seleccionar plantilla')
  && !templateMainMarkup.includes('/images/origin-01/dress-detail.webp')
  && !templateMainMarkup.includes('/images/origin-01/gift-still-life.webp')
  && !templateMainMarkup.includes('/images/origin-01/closing-valentina.webp'),
  'las exploraciones son conceptos visibles sin controles ni fotografías de Origin 01')
const options = createStudioTemplateOptions(origin01Template)
assert(options.filter(({ selectable }) => selectable).map(({ id }) => id).join() === 'origin01'
  && options.filter(({ availability }) => availability === 'coming-soon').length === 3
  && options.every(({ demoPath }) => demoPath === undefined),
  'el contrato distingue disponibilidad y no contiene un fallback de demostración específico')
const initialTemplateGallery = createStudioTemplateGalleryState(origin01Template.id, origin01Template.id)
const unavailableSelection = transitionStudioTemplateGallery(initialTemplateGallery,
  { type: 'select', templateId: 'example-editorial', selectable: false })
assert(unavailableSelection === initialTemplateGallery && JSON.stringify(initial) === draftBeforeStageNavigation,
  'una exploración no seleccionable no cambia el estado ni el borrador')
assert(createStudioTemplateGalleryState('example-editorial', origin01Template.id).selectedId === origin01Template.id,
  'un identificador anterior se normaliza al identificador disponible sin acoplarse a un literal interno')

const triviaProjectionKeys = ['protagonistName', 'accessibleTitle', 'title', 'revealSignature'] as const
assert(triviaProjectionKeys.every((key) => !(key in initial.trivia)), 'el borrador de Trivia excluye todas las proyecciones identitarias')

const renamed = updateOrigin01StudioDraftField(initial, 'protagonistName', 'Amparo')
const renamedPreview = deriveOrigin01PreviewInvitation(origin01DemoData, renamed)
assert(renamedPreview.identities[0]?.displayName === 'Amparo', 'actualiza la fuente canónica de identidad')
assert(renamedPreview.content.prelude.title === 'Hola, Amparo.', 'deriva el saludo')
assert(renamedPreview.content.envelope.monogram === 'A', 'deriva el monograma')
assert(renamedPreview.content.story.signature === 'Amparo', 'deriva la firma')
assert(renamedPreview.content.trivia.protagonistName === 'Amparo', 'deriva la identidad de Trivia')

assert(renamed.trivia === initial.trivia, 'cambiar el nombre no muta ni reemplaza el borrador editorial de Trivia')
assert(renamedPreview.content.trivia.accessibleTitle === 'Trivia sobre Amparo', 'deriva el título accesible de Trivia')
assert(renamedPreview.content.trivia.title === '¿Cuánto conocés de verdad a Amparo?', 'deriva el título visible de Trivia')
assert(renamedPreview.content.trivia.revealSignature === 'Amparo', 'deriva la firma final de Trivia')
assert(renamedPreview.content.trivia.description === initial.trivia.description
  && renamedPreview.content.trivia.questions === initial.trivia.questions
  && renamedPreview.content.trivia.resultTiers === initial.trivia.resultTiers,
  'el contenido editorial de Trivia se conserva durante la derivación')

const editedStory = updateOrigin01StudioDraftGroup(initial, 'story', (story) => ({
  ...story,
  message: 'Un texto editorial actualizado.',
}))
assert(editedStory.story.message === 'Un texto editorial actualizado.', 'actualiza un texto editorial')

const storyDisabled = updateOrigin01StudioModule(origin01DemoData, editedStory, 'story', false)
assert(storyDisabled.story.message === editedStory.story.message, 'conserva contenido al desactivar una escena')
assert(!storyDisabled.modules.find(({ moduleId }) => moduleId === 'story')?.enabled, 'desactiva una escena opcional')
const requiredAttempt = updateOrigin01StudioModule(origin01DemoData, initial, 'prelude', false)
assert(requiredAttempt === initial, 'impide desactivar una escena obligatoria desde el modelo')

const changedEvent = updateOrigin01StudioDraftGroup(initial, 'event', (event) => ({
  ...event, start: '2028-04-10T20:30', end: '2028-04-11T02:30', venue: 'Salón del Río', address: 'Costanera 100',
}))
const resetField = resetOrigin01StudioField(changedEvent, initial, 'event', 'venue')
assert(resetField.event.venue === initial.event.venue, 'restablece un campo desde el borrador inicial')
assert(resetField.event.start === changedEvent.event.start, 'el reset de campo conserva campos hermanos')
const resetGroup = resetOrigin01StudioGroup(changedEvent, initial, 'event')
assert(resetGroup.event.start === initial.event.start && resetGroup.event.venue === initial.event.venue, 'restablece un grupo completo')
assert(resetGroup.story === changedEvent.story, 'el reset de grupo conserva los demás grupos')
const resetScene = resetOrigin01StudioScene(storyDisabled, initial, 'story')
assert(resetScene.story.message === initial.story.message, 'restablece el contenido editorial de una escena')
assert(!resetScene.modules.find(({ moduleId }) => moduleId === 'story')?.enabled, 'el reset de escena conserva su activación')
const resetConfiguration = resetOrigin01StudioConfiguration(storyDisabled, initial)
assert(resetConfiguration.modules.find(({ moduleId }) => moduleId === 'story')?.enabled, 'restablece la configuración de escenas')
assert(resetConfiguration.story.message === editedStory.story.message, 'el reset de configuración conserva el contenido editorial')
const editedOpening = updateOrigin01StudioDraftGroup(initial, 'opening', (opening) => ({
  ...opening, preludeBody: 'Otro preludio', heroPhrase: 'Otra portada',
}))
const resetPrelude = resetOrigin01StudioScene(editedOpening, initial, 'prelude')
assert(resetPrelude.opening.preludeBody === initial.opening.preludeBody, 'restablece solamente Preludio')
assert(resetPrelude.opening.heroPhrase === 'Otra portada', 'restablecer Preludio conserva Portada')

const scheduleWithAddedMoment = addOrigin01ScheduleMoment(initial.schedule)
const addedScheduleMoment = scheduleWithAddedMoment.moments.at(-1)!
const scheduleWithEditedMoment = updateOrigin01ScheduleMoment(
  scheduleWithAddedMoment,
  addedScheduleMoment.id,
  (moment) => ({ ...moment, time: '00:30', title: 'Despedida', description: '' }),
)
const scheduleWithMovedMoment = moveOrigin01ScheduleMoment(scheduleWithEditedMoment, addedScheduleMoment.id, -1)
const scheduleWithoutFirstMoment = removeOrigin01ScheduleMoment(
  scheduleWithMovedMoment,
  scheduleWithMovedMoment.moments[0]!.id,
)
assert(scheduleWithAddedMoment.moments.length === initial.schedule.moments.length + 1
  && new Set(scheduleWithAddedMoment.moments.map(({ id }) => id)).size === scheduleWithAddedMoment.moments.length
  && scheduleWithAddedMoment.moments.at(-1)?.time === '00:30',
  'Cronograma agrega momentos con identidad estable y sugiere el horario siguiente')
assert(scheduleWithMovedMoment.moments.at(-2)?.id === addedScheduleMoment.id
  && scheduleWithoutFirstMoment.moments.length === scheduleWithMovedMoment.moments.length - 1,
  'Cronograma reordena y quita momentos sin alterar las demás identidades')
let cappedSchedule = initial.schedule
for (let index = cappedSchedule.moments.length; index < studioScheduleMaxMoments + 2; index += 1) {
  cappedSchedule = addOrigin01ScheduleMoment(cappedSchedule)
}
assert(cappedSchedule.moments.length === studioScheduleMaxMoments,
  'Cronograma limita la colección temporal a ocho momentos')
assert(validateOrigin01Schedule(initial.schedule).scheduleHeading === null
  && validateOrigin01Schedule({ ...initial.schedule, heading: '' }).scheduleHeading !== null
  && validateOrigin01Schedule({ ...initial.schedule,
    moments: [initial.schedule.moments[0]!, { ...initial.schedule.moments[1]!,
      id: initial.schedule.moments[0]!.id }] }).scheduleMomentIds !== null,
  'Cronograma valida sus textos generales y las identidades de sus momentos')

const rescheduledPreview = deriveOrigin01PreviewInvitation(origin01DemoData, changedEvent)
assert(rescheduledPreview.event.startsAt.startsWith('2028-04-10'), 'deriva el inicio ISO desde la fuente local')
assert(rescheduledPreview.content.eventDetails.timeLabel === '20:30 a 02:30', 'deriva el rango horario editorial')
assert(rescheduledPreview.event.venue === 'Salón del Río', 'proyecta el lugar canónico')
assert(rescheduledPreview.event.address === 'Costanera 100', 'proyecta el destino de mapa desde la dirección')
assert(!('dateLabel' in changedEvent.event), 'no duplica proyecciones dentro de la fuente canónica')
const editedScheduleDraft = updateOrigin01StudioDraftField(initial, 'schedule', scheduleWithEditedMoment)
const editedSchedulePreview = deriveOrigin01PreviewInvitation(origin01DemoData, editedScheduleDraft)
assert(editedSchedulePreview.content.schedule.moments.at(-1)?.title === 'Despedida'
  && editedSchedulePreview.content.schedule.moments.at(-1)?.description === undefined
  && origin01DemoData.content.schedule.moments.length === 3,
  'deriva el Cronograma sin mutar el contenido canónico y omite descripciones vacías')
const schedulePreviewMarkup = renderToStaticMarkup(createElement(Origin01Schedule, {
  schedule: editedSchedulePreview.content.schedule,
}))
assert(schedulePreviewMarkup.includes('origin01-schedule')
  && schedulePreviewMarkup.indexOf('21:00') < schedulePreviewMarkup.indexOf('22:00')
  && schedulePreviewMarkup.includes('Despedida'),
  'el renderer público proyecta los momentos en el orden editorial')
const scheduleOff = updateOrigin01StudioModule(origin01DemoData, editedScheduleDraft, 'schedule', false)
assert(!scheduleOff.modules.find(({ moduleId }) => moduleId === 'schedule')?.enabled
  && !getVisibleStudioScenes(scheduleOff).some(({ id }) => id === 'schedule')
  && scheduleOff.schedule === editedScheduleDraft.schedule,
  'desactivar Cronograma lo quita del recorrido sin perder su contenido')
const invitationWithoutSchedule = {
  ...origin01DemoData,
  modules: origin01DemoData.modules.filter(({ moduleId }) => moduleId !== 'schedule'),
}
const draftWithoutSchedule = createOrigin01StudioDraft(invitationWithoutSchedule)
const scheduleDisabledFromAbsentConfiguration = updateOrigin01StudioModule(
  invitationWithoutSchedule,
  draftWithoutSchedule,
  'schedule',
  false,
)
const scheduleEnabledFromAbsentConfiguration = updateOrigin01StudioModule(
  invitationWithoutSchedule,
  draftWithoutSchedule,
  'schedule',
  true,
)
assert(validateInvitationConfiguration(invitationWithoutSchedule, findInvitationTemplate).valid
  && scheduleDisabledFromAbsentConfiguration === draftWithoutSchedule
  && scheduleEnabledFromAbsentConfiguration.modules.filter(({ moduleId }) => moduleId === 'schedule').length === 1
  && scheduleEnabledFromAbsentConfiguration.modules.find(({ moduleId }) => moduleId === 'schedule')?.enabled === true
  && getVisibleStudioScenes(scheduleEnabledFromAbsentConfiguration).some(({ id }) => id === 'schedule'),
  'activar Cronograma agrega su configuración cuando una invitación válida omite el módulo opcional')

const weatherFuture = getOrigin01WeatherAvailability(
  '2027-03-20T21:00:00-03:00', 'America/Argentina/Buenos_Aires', new Date('2027-03-04T15:00:00Z'),
)
const weatherAvailable = getOrigin01WeatherAvailability(
  '2027-03-20T21:00:00-03:00', 'America/Argentina/Buenos_Aires', new Date('2027-03-05T15:00:00Z'),
)
assert(weatherFuture.kind === 'future' && weatherFuture.availableFrom === '2027-03-05'
  && weatherAvailable.kind === 'available',
  'respeta el horizonte real de dieciséis días sin fabricar un pronóstico anticipado')
const parsedWeather = parseOrigin01WeatherForecast({ daily: {
  time: ['2027-03-20'], weather_code: [61], temperature_2m_min: [16.4], temperature_2m_max: [24.6],
  apparent_temperature_min: [15.8], apparent_temperature_max: [25.2],
  precipitation_probability_max: [70], wind_speed_10m_max: [22.1],
} }, '2027-03-20', '2027-03-20T12:00:00.000Z')
assert(parsedWeather.condition === 'Con lluvia' && parsedWeather.precipitationProbability === 70
  && parsedWeather.temperatureMax === 24.6,
  'normaliza exclusivamente los datos reales devueltos por el proveedor')
const futureWeatherMarkup = renderToStaticMarkup(createElement(Origin01WeatherPanel, {
  weather: initial.weather, availability: weatherFuture, state: { kind: 'loading' },
}))
const readyWeatherMarkup = renderToStaticMarkup(createElement(Origin01WeatherPanel, {
  weather: initial.weather, availability: weatherAvailable, state: { kind: 'ready', forecast: parsedWeather },
}))
assert(futureWeatherMarkup.includes('todavía no está disponible')
  && !futureWeatherMarkup.includes('Prob. de lluvia')
  && readyWeatherMarkup.includes('70%') && readyWeatherMarkup.includes('Open-Meteo'),
  'la escena diferencia el estado futuro del pronóstico real disponible y atribuye la fuente')
const changedWeather = updateOrigin01StudioDraftGroup(initial, 'weather', (weather) => ({
  ...weather, location: { name: 'Rosario', admin1: 'Santa Fe', country: 'Argentina', latitude: -32.9468,
    longitude: -60.6393, timezone: 'America/Argentina/Cordoba' },
}))
assert(deriveOrigin01PreviewInvitation(origin01DemoData, changedWeather).content.weather.location.name === 'Rosario'
  && origin01DemoData.content.weather.location.name === 'Buenos Aires',
  'proyecta una localidad meteorológica confirmada sin mutar el fixture')

const communityMarkup = renderToStaticMarkup(createElement(Origin01Community, { community: initial.community }))
assert(communityMarkup.includes('@valentina.limen') && communityMarkup.includes('#ValeCruzaElLimen')
  && communityMarkup.includes('https://photos.google.com/')
  && communityMarkup.indexOf('Instagram') < communityMarkup.indexOf('Hashtag oficial'),
  'Comunidad renderiza los tres destinos reales en su composición canónica')
const editedCommunity = updateOrigin01StudioDraftGroup(initial, 'community', (community) => ({
  ...community,
  instagram: { ...community.instagram, handle: '@fiesta.vale' },
  hashtag: { ...community.hashtag, value: '##NuevaHistoria' },
}))
const editedCommunityPreview = deriveOrigin01PreviewInvitation(origin01DemoData, editedCommunity)
assert(editedCommunityPreview.content.community.instagram.handle === 'fiesta.vale'
  && editedCommunityPreview.content.community.hashtag.value === '#NuevaHistoria'
  && origin01DemoData.content.community.instagram.handle === 'valentina.limen',
  'Comunidad normaliza usuario y hashtag sin mutar el fixture canónico')
const communityWithoutFeatures = updateOrigin01StudioDraftGroup(initial, 'community', (community) => ({
  ...community,
  instagram: { ...community.instagram, enabled: false },
  hashtag: { ...community.hashtag, enabled: false },
  album: { ...community.album, enabled: false },
}))
const invalidCommunityResult = validateOrigin01StudioDraft(origin01DemoData, communityWithoutFeatures)
assert(invalidCommunityResult.fieldErrors.communityFeatures !== null
  && invalidCommunityResult.sceneStatuses.find(({ sceneId }) => sceneId === 'instagram')?.relevantErrorCount === 1,
  'Comunidad activa exige al menos una función real configurada')
const inactiveInvalidCommunity = updateOrigin01StudioModule(origin01DemoData, communityWithoutFeatures, 'instagram', false)
assert(validateOrigin01StudioDraft(origin01DemoData, inactiveInvalidCommunity).sceneStatuses
  .find(({ sceneId }) => sceneId === 'instagram')?.relevantErrorCount === 0
  && inactiveInvalidCommunity.community === communityWithoutFeatures.community,
  'excluir Comunidad conserva sus ediciones y vuelve irrelevantes sus errores')
const invitationWithoutCommunityConfiguration = {
  ...origin01DemoData,
  modules: origin01DemoData.modules.filter(({ moduleId }) => moduleId !== 'instagram'),
}
const draftWithoutCommunity = createOrigin01StudioDraft(invitationWithoutCommunityConfiguration)
const enabledAbsentCommunity = updateOrigin01StudioModule(
  invitationWithoutCommunityConfiguration, draftWithoutCommunity, 'instagram', true,
)
assert(validateInvitationConfiguration(invitationWithoutCommunityConfiguration, findInvitationTemplate).valid
  && enabledAbsentCommunity.modules.filter(({ moduleId }) => moduleId === 'instagram').length === 1
  && getVisibleStudioScenes(enabledAbsentCommunity).some(({ id }) => id === 'community'),
  'activar Comunidad agrega una configuración opcional ausente sin duplicarla')

const validBase = updateOrigin01StudioDraftGroup(initial, 'rsvp', (rsvp) => ({
  ...rsvp,
  recipientPhone: '+54 11 5555 5555',
}))
const validResult = validateOrigin01StudioDraft(origin01DemoData, validBase)
const validPreview = deriveOrigin01PreviewInvitation(origin01DemoData, validBase)
assert(validResult.invitationValid, 'distingue una invitación técnicamente válida')
assert(selectValidStudioPreview(validResult, validPreview) === validPreview, 'entrega a preview solamente una invitación válida')
assert(!validResult.editoriallyReviewed && !validResult.readyToPublish, 'mantiene revisión y publicación separadas de la validez')
assert(validResult.domainStatuses.every(({ complete }) => complete), 'marca completos los dominios técnicamente válidos')
assert(validResult.domainStatuses.every(({ hasContentPendingReview }) => hasContentPendingReview), 'agrega revisión pendiente en todos los dominios')

const invalidGiftAccount = updateOrigin01StudioDraftGroup(validBase, 'gifts', (gifts) => ({
  ...gifts, accountValue: '',
}))
const invalidGiftResult = validateOrigin01StudioDraft(origin01DemoData, invalidGiftAccount)
const giftEventDomain = invalidGiftResult.domainStatuses.find(({ domainId }) => domainId === 'event')
const giftExperiencesDomain = invalidGiftResult.domainStatuses.find(({ domainId }) => domainId === 'experiences')
const giftScene = invalidGiftResult.sceneStatuses.find(({ sceneId }) => sceneId === 'gifts')
const giftIssue = invalidGiftResult.issues.find(({ fieldId }) => fieldId === 'giftsAccount')
assert(giftIssue?.domainId === 'event' && giftIssue.editorId === 'event-operations', 'ubica el dato operativo de Regalos inequívocamente en Evento')
assert(giftEventDomain?.complete === false && giftEventDomain.relevantErrorCount === 1, 'Evento contabiliza el error operativo de Regalos')
assert(giftExperiencesDomain?.complete === true && giftExperiencesDomain.relevantErrorCount === 0, 'Experiencias no hereda silenciosamente el error operativo de Regalos')
assert(giftScene?.complete === false && giftScene.relevantErrorCount === 1, 'la escena Regalos contempla globalmente su campo operativo')

const invalidRsvpPhone = updateOrigin01StudioDraftGroup(validBase, 'rsvp', (rsvp) => ({
  ...rsvp, recipientPhone: '',
}))
const invalidRsvpResult = validateOrigin01StudioDraft(origin01DemoData, invalidRsvpPhone)
const rsvpEventDomain = invalidRsvpResult.domainStatuses.find(({ domainId }) => domainId === 'event')
const rsvpExperiencesDomain = invalidRsvpResult.domainStatuses.find(({ domainId }) => domainId === 'experiences')
const rsvpScene = invalidRsvpResult.sceneStatuses.find(({ sceneId }) => sceneId === 'rsvp')
const rsvpIssue = invalidRsvpResult.issues.find(({ fieldId }) => fieldId === 'rsvpRecipientPhone')
assert(rsvpIssue?.domainId === 'event' && rsvpIssue.editorId === 'event-operations', 'ubica el teléfono de RSVP inequívocamente en Evento')
assert(rsvpEventDomain?.complete === false && rsvpEventDomain.relevantErrorCount === 1, 'Evento contabiliza el error operativo de RSVP')
assert(rsvpExperiencesDomain?.complete === true && rsvpExperiencesDomain.relevantErrorCount === 0, 'Experiencias no hereda silenciosamente el error operativo de RSVP')
assert(rsvpScene?.complete === false && rsvpScene.relevantErrorCount === 1, 'la escena RSVP contempla globalmente su campo operativo')
for (const domain of [...invalidGiftResult.domainStatuses, ...invalidRsvpResult.domainStatuses]) {
  assert(domain.complete === (domain.relevantErrorCount === 0), `coherencia de completitud y conteo en ${domain.domainId}`)
  assert(!domain.blocksPreview || (!domain.complete && domain.relevantErrorCount > 0), `coherencia de bloqueo en ${domain.domainId}`)
}

const emptyName = updateOrigin01StudioDraftField(validBase, 'protagonistName', '')
assert(validateOrigin01StudioDraft(origin01DemoData, emptyName).fieldErrors.protagonistName !== null, 'reporta un campo obligatorio vacío')

const invalidStory = updateOrigin01StudioDraftGroup(validBase, 'story', (story) => ({ ...story, message: '' }))
const activeStoryResult = validateOrigin01StudioDraft(origin01DemoData, invalidStory)
assert(activeStoryResult.sceneStatuses.find(({ sceneId }) => sceneId === 'story')?.relevantErrorCount === 1, 'cuenta errores de una escena activa')
assert(!activeStoryResult.domainStatuses.find(({ domainId }) => domainId === 'narrative')?.complete, 'marca incompleto el dominio afectado')
assert(!activeStoryResult.invitationValid, 'un error editorial activo invalida el borrador actual')
assert(selectValidStudioPreview(activeStoryResult, validPreview) === validPreview, 'un error editorial activo conserva el borrador actual en preview')
const inactiveInvalidStory = updateOrigin01StudioModule(origin01DemoData, invalidStory, 'story', false)
const inactiveStoryResult = validateOrigin01StudioDraft(origin01DemoData, inactiveInvalidStory)
const storyStatus = inactiveStoryResult.sceneStatuses.find(({ sceneId }) => sceneId === 'story')
assert(storyStatus?.active === false, 'expone el estado inactivo de una escena')
assert(storyStatus?.relevantErrorCount === 0, 'los errores de contenido inactivo no son relevantes')
assert(inactiveStoryResult.invitationValid, 'el contenido inválido inactivo no bloquea la invitación')
assert(selectValidStudioPreview(inactiveStoryResult, validPreview) === validPreview, 'el contenido inválido inactivo no bloquea la entrega a preview')

const invalidSchedule = updateOrigin01StudioDraftGroup(validBase, 'schedule', (schedule) => ({
  ...schedule,
  moments: schedule.moments.map((moment, index) => index === 0 ? { ...moment, title: '' } : moment),
}))
const activeScheduleResult = validateOrigin01StudioDraft(origin01DemoData, invalidSchedule)
const scheduleIssue = activeScheduleResult.issues.find(({ fieldId }) =>
  fieldId === `scheduleMoment-${invalidSchedule.schedule.moments[0]!.id}-title`)
assert(scheduleIssue?.editorId === 'schedule' && scheduleIssue.sceneId === 'schedule'
  && scheduleIssue.fieldTargetId === `studio-schedule-${invalidSchedule.schedule.moments[0]!.id}-title`
  && activeScheduleResult.sceneStatuses.find(({ sceneId }) => sceneId === 'schedule')?.relevantErrorCount === 1,
  'Cronograma vincula el error de cada momento con su control y su escena')
const inactiveScheduleResult = validateOrigin01StudioDraft(
  origin01DemoData,
  updateOrigin01StudioModule(origin01DemoData, invalidSchedule, 'schedule', false),
)
assert(inactiveScheduleResult.invitationValid
  && inactiveScheduleResult.sceneStatuses.find(({ sceneId }) => sceneId === 'schedule')?.relevantErrorCount === 0,
  'el contenido inválido de Cronograma se conserva pero deja de ser relevante al excluir la escena')

const invalidWeather = updateOrigin01StudioDraftGroup(validBase, 'weather', (weather) => ({
  ...weather, location: { ...weather.location, name: '', latitude: Number.NaN },
}))
const activeWeatherResult = validateOrigin01StudioDraft(origin01DemoData, invalidWeather)
const weatherIssue = activeWeatherResult.issues.find(({ fieldId }) => fieldId === 'weatherLocation')
assert(weatherIssue?.editorId === 'weather' && weatherIssue.sceneId === 'weather'
  && activeWeatherResult.sceneStatuses.find(({ sceneId }) => sceneId === 'weather')?.relevantErrorCount === 1,
  'una ubicación meteorológica inválida navega al editor real de Clima')
const inactiveWeatherResult = validateOrigin01StudioDraft(origin01DemoData,
  updateOrigin01StudioModule(origin01DemoData, invalidWeather, 'weather', false))
assert(inactiveWeatherResult.invitationValid
  && inactiveWeatherResult.sceneStatuses.find(({ sceneId }) => sceneId === 'weather')?.relevantErrorCount === 0,
  'Clima excluido conserva la ubicación pendiente sin bloquear la invitación')

const invalidDate = updateOrigin01StudioDraftGroup(validBase, 'event', (event) => ({ ...event, start: 'fecha inválida' }))
const invalidDateResult = validateOrigin01StudioDraft(origin01DemoData, invalidDate)
assert(invalidDateResult.previewBlocked && !invalidDateResult.structurallyValid, 'un error canónico estructural bloquea la derivación actual')
assert(invalidDateResult.domainStatuses.find(({ domainId }) => domainId === 'event')?.blocksPreview, 'el dominio agrega el bloqueo estructural')

const malformedRequired = { ...validBase, modules: validBase.modules.map((module) => module.moduleId === 'prelude'
  ? { ...module, enabled: false } : module) }
const malformedResult = validateOrigin01StudioDraft(origin01DemoData, malformedRequired)
const malformedPrelude = malformedResult.sceneStatuses.find(({ sceneId }) => sceneId === 'prelude')
assert(malformedPrelude?.complete === false && malformedPrelude.blocksPreview, 'una escena estructuralmente inválida no figura completa')
assert(!malformedResult.domainStatuses.find(({ domainId }) => domainId === 'narrative')?.complete, 'el dominio agrega el error estructural de su escena')

const longCaption = updateOrigin01StudioDraftGroup(validBase, 'gallery', (gallery) => ({
  ...gallery,
  captions: ['x'.repeat(161), ...gallery.captions.slice(1)],
}))
const warningResult = validateOrigin01StudioDraft(origin01DemoData, longCaption)
assert(warningResult.issues.some(({ severity }) => severity === 'warning'), 'clasifica advertencias no bloqueantes')
assert(!warningResult.previewBlocked && warningResult.invitationValid, 'una advertencia no vuelve inválida la invitación')
assert(selectValidStudioPreview(warningResult, validPreview) === validPreview, 'una advertencia permite entregar la preview')

const domains = createOrigin01StudioDomains(origin01Template)
assert(domains.map(({ id }) => id).join(',') === 'identity,event,narrative,experiences,review', 'define los cinco dominios en orden')
const experienceScenes = domains.find(({ id }) => id === 'experiences')?.items.map(({ sceneId }) => sceneId)
const expectedExperiences = origin01Template.canonicalOrder.filter((sceneId) =>
  ['countdown', 'schedule', 'weather', 'dressCode', 'gallery', 'instagram', 'trivia', 'gifts', 'rsvp'].includes(sceneId))
assert(experienceScenes?.join() === expectedExperiences.join(), 'deriva el orden de experiencias desde la plantilla canónica')
const narrativeScenes = domains.find(({ id }) => id === 'narrative')?.items.flatMap(({ id, sceneId }) =>
  id === 'opening' ? ['prelude', 'hero'] : sceneId ? [sceneId] : [])
const expectedNarrative = origin01Template.canonicalOrder.filter((sceneId) =>
  ['prelude', 'hero', 'story', 'closing'].includes(sceneId))
assert(narrativeScenes?.join() === expectedNarrative.join(), 'Narrativa mantiene el orden canónico de la plantilla')
const storyNavigation = domains.flatMap(({ items }) => items).find(({ sceneId }) => sceneId === 'story')
assert(storyNavigation?.required === origin01Template.requiredModules.includes('story')
  && storyNavigation.canToggle === origin01Template.optionalModules.includes('story'), 'deriva obligatoriedad y activación desde la plantilla')
assert(origin01TriviaFlow[1].id === 'questions' && origin01TriviaFlow[1].preservesCanonicalOrder, 'prepara el flujo canónico de Trivia')
const navigation = createInitialStudioNavigation(domains)
assert(navigation.domainId === 'identity' && navigation.editorId === 'identity', 'la selección inicial es determinista y resoluble')
const experiencesDomain = domains.find(({ id }) => id === 'experiences')!
const triviaItem = experiencesDomain.items.find(({ editorId }) => editorId === 'trivia')!
const triviaNavigation = transitionStudioNavigation(navigation, { type: 'open-item', domainId: 'experiences', item: triviaItem })
const returnedNavigation = transitionStudioNavigation(triviaNavigation, { type: 'show-domain-index' })
assert(triviaNavigation.mobileLevel === 'editor' && triviaNavigation.returnLevel === 'domain-index'
  && returnedNavigation.mobileLevel === 'domain-index', 'el modelo móvil representa editor y retorno contextual')
const draftBeforeNavigation = JSON.stringify(initial)
transitionStudioNavigation(triviaNavigation, { type: 'show-general-index' })
assert(JSON.stringify(initial) === draftBeforeNavigation, 'navegar no modifica borrador, módulos ni Trivia')
assert(domains.every((domain) => domain.items.length > 0), 'la navegación secundaria proviene de los metadatos de cada dominio')
assert(domains.flatMap(({ items }) => items).every(({ editorId }) => isStudioEditorId(editorId)),
  'todos los editorId configurados se resuelven con el contrato productivo')
assert(getStudioEditorResolution(undefined) === 'unselected'
  && getStudioEditorResolution('editor-inexistente') === 'unresolved',
  'distingue una selección ausente de un editor no resoluble')
const openedEvent = transitionStudioNavigation(navigation, { type: 'open-domain', domainId: 'event' })
assert(openedEvent.domainId === 'event' && openedEvent.itemId === undefined && openedEvent.editorId === undefined,
  'open-domain representa un dominio sin item activo')
assert(triviaNavigation.editorId === 'trivia'
  && initial.trivia.questions.map(({ id }) => id).join() === validBase.trivia.questions.map(({ id }) => id).join()
  && initial.modules.find(({ moduleId }) => moduleId === 'trivia')?.enabled,
  'entrar y salir de Trivia conserva contenido, activación y orden')
assert(showsOperationalContent('operational') && !showsEditorialContent('operational'),
  'event-operations expone exclusivamente los campos operativos de Regalos y RSVP')
assert(showsEditorialContent('editorial') && !showsOperationalContent('editorial'),
  'las experiencias Regalos y RSVP excluyen sus destinos operativos')
assert(showsCountdownContent('countdown') && !showsEventDetailsContent('countdown'),
  'Cuenta regresiva no expone Datos del evento')
const eventOperations = domains.find(({ id }) => id === 'event')!.items.find(({ editorId }) => editorId === 'event-operations')!
assert(selectStudioItemStatus(invalidGiftResult, eventOperations, 'event').relevantErrorCount === 1
  && selectStudioItemStatus(invalidRsvpResult, eventOperations, 'event').relevantErrorCount === 1,
  'event-operations refleja los errores relevantes de sus campos propietarios')
assert(storyStatus?.active === false && invalidStory.story.message === inactiveInvalidStory.story.message,
  'una experiencia opcional inactiva conserva contenido y comunica estado inactivo')
assert(selectStudioIssueSummary(activeStoryResult).errorCount >= 1
  && activeStoryResult.issues.find(({ fieldId }) => fieldId === 'storyMessage')?.severity === 'active-error',
  'review-errors cuenta errores editoriales relevantes además de bloqueos estructurales')

const initialAudience = createStudioPreviewAudienceState()
assert(initialAudience.audience === 'protagonist' && initialAudience.run === 0, 'inicializa la audiencia productiva')
transitionStudioNavigation(navigation, { type: 'open-domain', domainId: 'review' })
assert(initialAudience.audience === 'protagonist' && getStudioPreviewKey(initialAudience) === 'protagonist-0',
  'navegar no modifica audiencia ni previewKey')
const guestAudience = transitionStudioPreviewAudience(initialAudience, { type: 'change-audience', audience: 'guest' })
assert(guestAudience.audience === 'guest' && guestAudience.run === 1, 'la transición productiva cambia audiencia y reinicia')
const restartedAudience = transitionStudioPreviewAudience(guestAudience, { type: 'restart' })
assert(restartedAudience.audience === 'guest' && restartedAudience.run === 2, 'el reinicio manual conserva audiencia e incrementa run')
assert(getStudioPreviewKey(restartedAudience) === 'guest-2', 'la key productiva refleja audiencia y run')
assert(initial.protagonistName === 'Valentina', 'audiencia y borrador permanecen independientes')

const initialSurface = createStudioPreviewSurfaceState()
assert(initialSurface.desktop === 'visible' && initialSurface.mobile === 'closed', 'la superficie preview inicia de forma determinista')
const editorOrigin = { domainId: triviaNavigation.domainId, itemId: triviaNavigation.itemId, editorId: triviaNavigation.editorId }
const openedSurface = transitionStudioPreviewSurface(initialSurface, { type: 'open', viewport: 'mobile', origin: editorOrigin,
  target: triviaItem.previewTarget })
const expandedSurface = transitionStudioPreviewSurface(transitionStudioPreviewSurface(openedSurface, { type: 'collapse' }),
  { type: 'open', viewport: 'desktop', origin: editorOrigin, target: triviaItem.previewTarget })
const closedSurface = transitionStudioPreviewSurface(expandedSurface, { type: 'close' })
assert(openedSurface.mobile === 'full-screen' && openedSurface.returnContext?.editorId === 'trivia'
  && openedSurface.target?.sceneId === 'trivia', 'abrir preview móvil conserva origen, retorno y target contextual')
assert(closedSurface.mobile === 'closed' && closedSurface.returnContext?.editorId === 'trivia', 'cerrar conserva el contexto exacto de retorno')
assert(triviaNavigation.mobileLevel === 'editor' && JSON.stringify(initial) === draftBeforeNavigation,
  'la superficie full-screen es independiente de navegación y borrador')
assert(getStudioPreviewKey(initialAudience) === 'protagonist-0', 'abrir, contraer y expandir no reinician el renderer')
const storedContextLabel = resolveStudioPreviewContextLabel(openedSurface, domains)
const navigationAfterOpening = transitionStudioNavigation(triviaNavigation, { type: 'open-item', domainId: 'experiences',
  item: experiencesDomain.items.find(({ editorId }) => editorId === 'dress-code')! })
assert(storedContextLabel === 'Revisando: Trivia' && navigationAfterOpening.editorId === 'dress-code'
  && resolveStudioPreviewContextLabel(openedSurface, domains) === 'Revisando: Trivia',
  'la etiqueta contextual se resuelve desde el origen almacenado y no desde la navegación activa')
const desktopCollapsed = transitionStudioPreviewSurface(initialSurface, { type: 'collapse' })
const mobileFromCollapsed = transitionStudioPreviewSurface(desktopCollapsed, { type: 'open', viewport: 'mobile',
  origin: editorOrigin, target: triviaItem.previewTarget })
assert(isStudioPreviewEffectivelyCollapsed(desktopCollapsed)
  && !isStudioPreviewEffectivelyCollapsed(mobileFromCollapsed),
  'abrir preview móvil anula visualmente el colapso de escritorio sin perder su preferencia')
assert(selectStudioPreviewContextLabel(openedSurface, domains) === 'Revisando: Trivia'
  && selectStudioPreviewContextLabel(closedSurface, domains) === undefined,
  'la etiqueta contextual solo aparece mientras la superficie dedicada está abierta')
const dressItem = experiencesDomain.items.find(({ editorId }) => editorId === 'dress-code')!
const reopenedFromDress = transitionStudioPreviewSurface(closedSurface, { type: 'open', viewport: 'desktop',
  origin: { domainId: 'experiences', itemId: dressItem.id, editorId: dressItem.editorId }, target: dressItem.previewTarget })
assert(selectStudioPreviewContextLabel(reopenedFromDress, domains) === 'Revisando: Dress Code',
  'una apertura nueva reemplaza deliberadamente el contexto anterior')

const committedCell = createStudioCommittedPreviewCell<typeof validPreview>()
const uncommittedValid = { ...validPreview, code: 'UNCOMMITTED' }
assert(selectStudioRenderablePreview(committedCell, 'sync', uncommittedValid, true).showing === 'current'
  && selectStudioRenderablePreview(committedCell, 'sync', renamedPreview, false).showing === 'unavailable',
  'seleccionar un render válido no confirmado no lo convierte en retenido')
commitStudioRenderablePreview(committedCell, 'sync', validPreview)
assert(selectStudioRenderablePreview(committedCell, 'sync', renamedPreview, false).invitation === validPreview
  && selectStudioRenderablePreview(committedCell, 'new-session', renamedPreview, false).showing === 'unavailable',
  'la frontera productiva conserva solo output confirmado y aísla sesiones')
for (let index = 0; index < 25; index += 1) {
  const unstableCurrent = { ...validPreview, code: `UNSTABLE-${index}` }
  assert(selectStudioRenderablePreview(committedCell, 'sync', unstableCurrent, true).invitation === unstableCurrent,
    'cada identidad inestable se devuelve inmediatamente sin programar una actualización')
}
assert(committedCell.commitCount === 1,
  'identidades derivadas inestables no causan commits ni bucles durante render')
const withoutProtagonist = { ...origin01DemoData,
  identities: origin01DemoData.identities.filter(({ role }) => role !== 'protagonist') }
const missingIdentityValidation = validateOrigin01StudioDraft(withoutProtagonist, initial)
const missingIdentityIssue = missingIdentityValidation.issues.find(({ id }) => id === 'configuration-missing-protagonist')
assert(!missingIdentityValidation.structurallyValid && missingIdentityValidation.previewBlocked
  && missingIdentityIssue?.blocksPreview && selectValidStudioPreview(missingIdentityValidation, validPreview) === null,
  'la ausencia de protagonista es un bloqueo estructural y nunca entrega datos inválidos al renderer')
const emptyIdentityCell = createStudioCommittedPreviewCell<typeof validPreview>()
assert(selectStudioRenderablePreview(emptyIdentityCell, 'missing', validPreview, false).showing === 'unavailable',
  'una sesión inicial sin protagonista muestra preview no disponible')
commitStudioRenderablePreview(emptyIdentityCell, 'same-session', validPreview)
assert(selectStudioRenderablePreview(emptyIdentityCell, 'same-session', renamedPreview, false).showing === 'last-renderable'
  && selectStudioRenderablePreview(emptyIdentityCell, 'other-session', renamedPreview, false).showing === 'unavailable',
  'el bloqueo identitario usa solo output confirmado de la misma sesión')

const groupedIssues = groupStudioIssues(inactiveStoryResult.issues)
assert(groupedIssues.some(({ severity, issues }) => severity === 'inactive-content' && issues.length > 0)
  && !inactiveStoryResult.previewBlocked, 'los grupos conservan contenido inactivo sin bloquear preview')
const storyIssue = inactiveStoryResult.issues.find(({ fieldId }) => fieldId === 'storyMessage')!
const reviewErrorsItem = domains.find(({ id }) => id === 'review')!.items.find(({ id }) => id === 'errors')!
const returnDestination = createStudioReturnToReview(reviewErrorsItem)
const reviewErrorsNavigation = transitionStudioNavigation(triviaNavigation, returnDestination.navigation)
const returnedReviewMarkup = renderToStaticMarkup(createElement('div', null,
  createElement(StudioStageNavigation, { activeStage: returnDestination.activeStage, onStageChange: () => undefined }),
  returnDestination.activeStage === 'review' ? createElement(StudioNavigationShell, {
    domains, navigation: reviewErrorsNavigation, validation: inactiveStoryResult,
    editor: createElement(StudioReviewPanel, { kind: 'errors', validation: inactiveStoryResult, domains,
      showing: 'current', audience: 'protagonist', onIssue: () => undefined,
      onAudience: () => undefined, onPreview: () => undefined }),
    editorResolvable: true, previewAudience: 'Protagonista', previewStatus: 'Borrador actual',
    onNavigate: () => undefined, onOpenPreview: () => undefined, onShowPreview: () => undefined,
    onReturnToErrors: () => undefined,
  }) : createElement('div', null, 'Contenido activo')))
assert(returnDestination.activeStage === 'review' && reviewErrorsNavigation.domainId === 'review'
  && reviewErrorsNavigation.itemId === 'errors' && returnedReviewMarkup.includes('Problemas del borrador')
  && returnedReviewMarkup.includes('aria-current="step">Revisión') && !returnedReviewMarkup.includes('Contenido activo'),
  'Volver a Errores restaura Revisión, abre su panel de errores y deja Contenido inactivo')
assert(resolveStudioIssueDestination(storyIssue, domains)?.editorId === 'story', 'una issue resuelve dominio, editor y campo por metadatos')
const storyEditorMarkup = renderToStaticMarkup(createElement(StudioStoryEditor, { eyebrowValue: '', canonicalEyebrowValue: '',
  eyebrowError: null, messageValue: '', canonicalMessageValue: '', messageError: storyIssue.message,
  onEyebrowChange: () => undefined, onEyebrowReset: () => undefined,
  onMessageChange: () => undefined, onMessageReset: () => undefined }))
assert(storyIssue.fieldTargetId === 'studio-story-message'
  && storyEditorMarkup.includes(`id="${storyIssue.fieldTargetId}"`),
  'el target estable de la issue coincide con el id renderizado por su editor productivo')
const noop = () => undefined
const identityIssue = validateOrigin01StudioDraft(origin01DemoData,
  updateOrigin01StudioDraftField(initial, 'protagonistName', '')).issues.find(({ fieldId }) => fieldId === 'protagonistName')!
const identityMarkup = renderToStaticMarkup(createElement(StudioContentEditor,
  { value: '', canonicalValue: '', error: identityIssue.message, onChange: noop, onReset: noop }))
const eventIssue = invalidDateResult.issues.find(({ fieldId }) => fieldId === 'eventStart')!
const eventMarkup = renderToStaticMarkup(createElement(StudioEventScheduleEditor, { startValue: '', canonicalStartValue: '',
  startError: eventIssue.message, endValue: '', canonicalEndValue: '', endError: null, timeZone: 'UTC',
  onStartChange: noop, onStartReset: noop, onEndChange: noop, onEndReset: noop }))
const dressIssue = validateOrigin01StudioDraft(origin01DemoData,
  updateOrigin01StudioDraftGroup(initial, 'dressCode', (value) => ({ ...value, title: '' })))
  .issues.find(({ fieldId }) => fieldId === 'dressCodeTitle')!
const dressMarkup = renderToStaticMarkup(createElement(StudioDressCodeEditor, { titleValue: '', canonicalTitleValue: '',
  titleError: dressIssue.message, descriptionValue: '', canonicalDescriptionValue: '', descriptionError: null,
  noteValue: '', canonicalNoteValue: '', noteError: null, onTitleChange: noop, onTitleReset: noop,
  onDescriptionChange: noop, onDescriptionReset: noop, onNoteChange: noop, onNoteReset: noop }))
const scheduleMarkup = renderToStaticMarkup(createElement(StudioScheduleEditor, {
  value: invalidSchedule.schedule,
  canonicalValue: initial.schedule,
  errors: activeScheduleResult.fieldErrors,
  onChange: noop,
  onReset: noop,
}))
const weatherMarkup = renderToStaticMarkup(createElement(StudioWeatherEditor, {
  value: invalidWeather.weather,
  canonicalValue: initial.weather,
  errors: activeWeatherResult.fieldErrors,
  onChange: noop,
  onReset: noop,
}))
const communityIssue = invalidCommunityResult.issues.find(({ fieldId }) => fieldId === 'communityFeatures')!
const communityEditorMarkup = renderToStaticMarkup(createElement(StudioCommunityEditor, {
  value: communityWithoutFeatures.community,
  canonicalValue: initial.community,
  errors: invalidCommunityResult.fieldErrors,
  onChange: noop,
  onReset: noop,
}))
const giftMarkup = renderToStaticMarkup(createElement(StudioGiftsEditor, { mode: 'operational', titleValue: '', canonicalTitleValue: '',
  titleError: null, descriptionValue: '', canonicalDescriptionValue: '', descriptionError: null, noteValue: '',
  canonicalNoteValue: '', noteError: null, accountValue: '', canonicalAccountValue: '', accountError: giftIssue?.message ?? null,
  onTitleChange: noop, onTitleReset: noop, onDescriptionChange: noop, onDescriptionReset: noop,
  onNoteChange: noop, onNoteReset: noop, onAccountChange: noop, onAccountReset: noop }))
for (const [issue, markup] of [[identityIssue, identityMarkup], [eventIssue, eventMarkup], [storyIssue, storyEditorMarkup],
  [dressIssue, dressMarkup], [scheduleIssue!, scheduleMarkup], [weatherIssue!, weatherMarkup],
  [communityIssue, communityEditorMarkup],
  [giftIssue!, giftMarkup]] as const) {
  assert(Boolean(issue.fieldTargetId) && markup.includes(`id="${issue.fieldTargetId}"`),
    'fieldTargetId coincide con el control productivo de identidad, evento, narrativa, experiencia u operación')
}
assert(resolveStudioIssueDestination({ ...storyIssue, editorId: 'unknown' }, domains) === null, 'un destino desconocido permanece seguro y sin resolución')
const directStructural = resolveStudioStructuralDestination(eventIssue, domains)
const fallbackStructural = resolveStudioStructuralDestination({ ...eventIssue, editorId: 'unknown' }, domains)
assert(directStructural?.kind === 'direct' && directStructural.item.editorId === 'event-canonical',
  'un bloqueo estructural resoluble conserva su destino directo productivo')
assert(fallbackStructural?.kind === 'fallback' && fallbackStructural.item.editorId === 'review-errors',
  'un bloqueo estructural no resoluble cae determinísticamente en Revisión / Errores')
const reviewErrorsDestination = resolveStudioIssueDestination(missingIdentityIssue!, domains)!
assert(!issueNeedsCorrectionReturn(missingIdentityIssue!, reviewErrorsDestination)
  && issueNeedsCorrectionReturn(storyIssue, resolveStudioIssueDestination(storyIssue, domains)!),
  'Review / Errores no crea retorno autorreferencial y un editor corregible sí lo conserva')
const correctionContext = createStudioIssueCorrectionContext(storyIssue)
const correctionDestination = resolveStudioIssueDestination(storyIssue, domains)!
const correctionNavigation = transitionStudioNavigation(triviaNavigation, { type: 'open-item', domainId: storyIssue.domainId, item: correctionDestination })
const errorReturn = resolveStudioCorrectionReturn(correctionContext, domains)!
const returnedToErrors = transitionStudioNavigation(correctionNavigation, { type: 'open-item', domainId: 'review', item: errorReturn })
assert(returnedToErrors.domainId === 'review' && returnedToErrors.editorId === 'review-errors'
  && JSON.stringify(initial) === draftBeforeNavigation, 'corregir una issue y volver a Errores conserva borrador y retorno tipado')

const secondInvitation = {
  ...origin01DemoData,
  id: 'origin01-demo-second-session',
  code: 'LMN-SECOND',
  identities: [{ displayName: 'Renata', role: 'protagonist' }],
  event: { ...origin01DemoData.event, name: 'Renata' },
}
const editedFirstSession = updateOrigin01StudioDraftField(initial, 'protagonistName', 'Borrador anterior')
const secondSessionDraft = createOrigin01StudioDraft(secondInvitation)
assert(getOrigin01StudioDraftSessionId(origin01DemoData) !== getOrigin01StudioDraftSessionId(secondInvitation), 'cada invitación posee una identidad de sesión estable y distinta')
assert(editedFirstSession.protagonistName === 'Borrador anterior' && secondSessionDraft.protagonistName === 'Renata', 'una invitación nueva inicializa un borrador independiente')
assert(secondSessionDraft.event.venue === secondInvitation.event.venue, 'resets y derivaciones de la nueva sesión parten de su propia invitación')

assert(typeof AppRoutes === 'function' && typeof StudioInvitationRoute === 'function', 'la ruta actual de Studio continúa disponible')
assert(typeof StudioPreview === 'function' && typeof Origin01Invitation === 'function', 'StudioPreview continúa conectado al renderer público real')
const previewMarkup = renderToStaticMarkup(StudioPreview({ invitation: validPreview, audience: 'protagonist',
  publicInvitationUrl: '/demo/LMN-ORIGIN01', previewKey: 'protagonist-0', showing: 'current',
  onAudienceChange: () => undefined, onRestart: () => undefined, onStructuralIssue: () => undefined }))
assert((previewMarkup.match(/id="studio-preview-renderer-title"/g) ?? []).length === 1
  && (previewMarkup.match(/name="studio-preview-audience"/g) ?? []).length === 2
  && previewMarkup.includes('limen-studio__preview-device')
  && previewMarkup.includes('limen-studio__preview-device-screen'),
  'la preview productiva expone un heading único, una audiencia y un viewport dentro de un teléfono')
assert(getStudioPreviewMode('trivia') === 'contextual' && getStudioPreviewMode() === 'full'
  && studioPreviewSceneSelectors.trivia === '.origin01-trivia'
  && studioPreviewSceneSelectors.community === '.origin01-community'
  && Object.keys(studioPreviewSceneSelectors).length === studioScenes.length,
  'Contenido abre una escena contextual y Revisión conserva el recorrido completo')
const previewElement = createElement(StudioPreview, { invitation: validPreview, audience: 'protagonist',
  publicInvitationUrl: '/demo/LMN-ORIGIN01', previewKey: 'protagonist-0', showing: 'current',
  onAudienceChange: () => undefined, onRestart: () => undefined, onStructuralIssue: () => undefined })
const previewPaneElement = createElement(StudioPreviewPane, {
  audienceLabel: 'Protagonista', layerOpen: false, preview: previewElement,
  publicInvitationUrl: '/demo/LMN-ORIGIN01', onClose: () => undefined, onCollapse: () => undefined,
  onOpen: () => undefined, onRestart: () => undefined,
})
const realContentBoundary = renderToStaticMarkup(createElement(StudioScenesContent, {
  draft: initial, selectedScene: 'story', onSceneSelect: () => undefined,
  editor: createElement('div', null, 'Editor de Historia'), preview: previewPaneElement,
  previewDedicated: false, previewCollapsed: false, onShowPreview: () => undefined,
}))
assert((realContentBoundary.match(/id="studio-preview-renderer-title"/g) ?? []).length === 1
  && !realContentBoundary.includes('Ver invitación'),
  'Contenido mantiene una única preview real visible junto al editor')
const collapsedContentBoundary = renderToStaticMarkup(createElement(StudioScenesContent, {
  draft: initial, selectedScene: 'story', onSceneSelect: () => undefined,
  editor: createElement('div', null, 'Editor de Historia'), preview: previewPaneElement,
  previewDedicated: false, previewCollapsed: true, onShowPreview: () => undefined,
}))
assert(collapsedContentBoundary.includes('studio-preview-renderer-title')
  && collapsedContentBoundary.includes('hidden=""'),
  'el estado contraído conserva una única preview montada y la retira de la interacción')
const dedicatedContentBoundary = renderToStaticMarkup(createElement(StudioScenesContent, {
  draft: initial, selectedScene: 'story', onSceneSelect: () => undefined,
  editor: createElement('div', null, 'Editor de Historia'), preview: previewPaneElement,
  previewDedicated: true, previewCollapsed: false, onShowPreview: () => undefined,
}))
assert((dedicatedContentBoundary.match(/id="studio-preview-renderer-title"/g) ?? []).length === 1,
  'Contenido monta exactamente una instancia del renderer real al abrir la preview dedicada')
const realReviewBoundary = renderToStaticMarkup(createElement(StudioReviewStage, {
  audience: 'protagonist', domains, preview: previewPaneElement, previewCollapsed: false, previewDedicated: false,
  validation: validResult, onAudience: () => undefined, onIssue: () => undefined, onOpenPreview: () => undefined,
  onShowPreview: () => undefined,
}))
assert((realReviewBoundary.match(/id="studio-preview-renderer-title"/g) ?? []).length === 1
  && realReviewBoundary.includes('Revisá la invitación antes de compartirla')
  && realReviewBoundary.includes('Qué necesita atención')
  && !realReviewBoundary.includes('Índice general')
  && !realReviewBoundary.includes('Dominio:')
  && !realReviewBoundary.includes('Datos canónicos')
  && !realReviewBoundary.includes('Proyecciones'),
  'Revisión usa una frontera productiva, una preview real y no expone la taxonomía del motor')
const renderStagePresentation = (galleryOpen: boolean, previewDedicated: boolean, activeStage: 'template' | 'aesthetic' = 'template') =>
  renderToStaticMarkup(createElement('div', null,
    createElement('header', null, 'LIMEN Studio'),
    createElement(StudioStageNavigation, { activeStage, onStageChange: () => undefined }),
    createElement(StudioStagePresentation, {
      activeStage, previewDedicated, templateGalleryOpen: galleryOpen,
      templateStage: createElement(StudioTemplateStage, { template: origin01Template }),
      aestheticStage: aestheticStageElement,
    }, createElement('div', null, 'Resumen de invitación', 'Estado del prototipo', 'Shell de edición', previewElement))))
const independentGalleryPresentation = renderStagePresentation(true, false)
assert(independentGalleryPresentation.includes('LIMEN Studio') && independentGalleryPresentation.includes('Etapas de edición')
  && independentGalleryPresentation.includes('Exploraciones futuras')
  && !independentGalleryPresentation.includes('Resumen de invitación')
  && !independentGalleryPresentation.includes('Estado del prototipo')
  && !independentGalleryPresentation.includes('Shell de edición')
  && !independentGalleryPresentation.includes('studio-preview-renderer-title'),
  'el boundary real presenta la galería independiente y retira el workspace existente')
const restoredStagePresentation = renderStagePresentation(false, false)
assert(restoredStagePresentation.includes('Resumen de invitación')
  && (restoredStagePresentation.match(/id="studio-preview-renderer-title"/g) ?? []).length === 1,
  'cerrar la galería restaura el workspace con una única preview real')
const protectedTemplatePresentation = renderStagePresentation(true, true)
const protectedAestheticPresentation = renderStagePresentation(false, true, 'aesthetic')
assert(protectedTemplatePresentation.includes('inert=""')
  && protectedAestheticPresentation.includes('inert=""')
  && protectedTemplatePresentation.includes('Resumen de invitación')
  && (protectedTemplatePresentation.match(/id="studio-preview-renderer-title"/g) ?? []).length === 1,
  'la preview dedicada vuelve inertes Plantilla y Estética e impide que la galería retire el renderer activo')
const shellMarkup = (previewCollapsed: boolean, previewDedicated: boolean) => renderToStaticMarkup(createElement(
  StudioNavigationShell, { domains, navigation: triviaNavigation, validation: validResult,
    editor: createElement('div'), editorResolvable: true, onNavigate: () => undefined, preview: previewElement,
    previewCollapsed, previewDedicated, previewAudience: 'Protagonista', previewStatus: 'Borrador actual',
    onOpenPreview: () => undefined, onShowPreview: () => undefined, correctionReturn: false,
    onReturnToErrors: () => undefined }))
for (const markup of [shellMarkup(false, false), shellMarkup(false, true), shellMarkup(true, false)]) {
  assert((markup.match(/id="studio-preview-renderer-title"/g) ?? []).length === 1
    && (markup.match(/name="studio-preview-audience"/g) ?? []).length === 2,
  'el shell productivo mantiene un solo host, heading y grupo de audiencia en cada presentación')
}
assert(shellMarkup(true, false).includes('hidden=""') && shellMarkup(true, false).includes('inert=""'),
  'el estado contraído conserva el host pero retira sus controles del foco')
assert(shellMarkup(false, true).match(/inert=""/g)?.length === 3,
  'la presentación dedicada vuelve inertes navegación primaria, secundaria y editor')
assert((shellMarkup(false, false).match(/Ver preview/g) ?? []).length === 3,
  'el mismo control de apertura está disponible en índice general, índice de dominio y editor móvil')
const correctionShell = renderToStaticMarkup(createElement(StudioNavigationShell, { domains,
  navigation: triviaNavigation, validation: validResult, editor: createElement('div'), editorResolvable: true,
  onNavigate: () => undefined, preview: previewElement, previewCollapsed: false, previewDedicated: false,
  previewAudience: 'Protagonista', previewStatus: 'Borrador actual', onOpenPreview: () => undefined,
  onShowPreview: () => undefined, correctionReturn: true, onReturnToErrors: () => undefined }))
assert(correctionShell.includes('Volver a Errores') && !shellMarkup(false, false).includes('Volver a Errores'),
  'el control productivo de retorno aparece solo durante una corrección')
const unresolvedPanel = renderToStaticMarkup(createElement(StudioReviewPanel, { kind: 'errors',
  validation: { ...validResult, issues: [{ ...storyIssue, editorId: 'unknown' }] }, domains,
  showing: 'current', audience: 'protagonist', onIssue: () => undefined, onAudience: () => undefined,
  onPreview: () => undefined }))
assert(unresolvedPanel.includes('Destino no disponible') && !unresolvedPanel.includes('Corregir en'),
  'Review productiva mantiene destinos no resueltos visibles y no navegables')
let focused = 0
const focusable = { isConnected: true, focus: () => { focused += 1 } } as HTMLElement
assert(restoreStudioPreviewOpener(focusable) && focused === 1
  && !restoreStudioPreviewOpener({ ...focusable, isConnected: false } as HTMLElement),
  'el cierre restaura foco solo al opener que continúa conectado')
assert(isStudioPreviewCloseKey('Escape') && !isStudioPreviewCloseKey('Enter'), 'Escape es la única tecla de cierre dedicada')
const fieldRoot = { getElementById: () => focusable, querySelector: () => null } as unknown as Document
const headingRoot = { getElementById: () => null, querySelector: () => focusable } as unknown as Document
assert(focusStudioIssueDestination(storyIssue, fieldRoot) === 'field'
  && focusStudioIssueDestination({ ...storyIssue, fieldId: undefined, fieldTargetId: undefined }, headingRoot) === 'heading',
  'la navegación estructural enfoca campo estable y, si no existe, el heading del editor')
assert(focusStudioEditorHeading(headingRoot), 'la navegación externa y el retorno a Errores enfocan el heading nuevo')
const reviewHeadingRoot = { querySelector: (selector: string) =>
  selector === '.limen-studio__review-title' ? focusable : null } as unknown as Document
const focusedBeforeReviewReturn = focused
assert(focusStudioReviewHeading(reviewHeadingRoot) && focused === focusedBeforeReviewReturn + 1,
  'el retorno a Errores enfoca específicamente el heading visible de Revisión')
assert(origin01DemoData.event.venue === 'Palacio del Lago', 'el fixture canónico no se muta')
assert(origin01DemoData.content.hero.phrase === 'Antes era un sueño. Ahora empieza.', 'la narrativa pública no cambia')

console.log(`Studio model: ${passed} assertions passed.`)
process.exit(0)
