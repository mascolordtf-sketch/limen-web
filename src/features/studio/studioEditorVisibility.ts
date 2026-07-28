export type StudioOwnedContentMode = 'complete' | 'editorial' | 'operational'
export type StudioEventInformationMode = 'complete' | 'countdown' | 'event-details'

export const showsEditorialContent = (mode: StudioOwnedContentMode) => mode !== 'operational'
export const showsOperationalContent = (mode: StudioOwnedContentMode) => mode !== 'editorial'
export const showsCountdownContent = (mode: StudioEventInformationMode) => mode !== 'event-details'
export const showsEventDetailsContent = (mode: StudioEventInformationMode) => mode !== 'countdown'
