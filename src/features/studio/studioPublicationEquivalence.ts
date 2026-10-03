import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'

export type StudioPublicationEquivalence = {
  readonly equivalent: boolean
  readonly changedSections: readonly string[]
}

const sectionLabels: Readonly<Record<string, string>> = {
  identities: 'identidad',
  event: 'fecha y lugar',
  modules: 'secciones activas',
  media: 'fotografías o música',
  content: 'contenido',
  themeVariant: 'estética',
  code: 'código público',
  templateId: 'plantilla',
  eventType: 'tipo de evento',
}

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

export function compareStudioPublicationToPublicBaseline(
  baseline: Origin01InvitationData,
  publication: Origin01InvitationData,
): StudioPublicationEquivalence {
  const ignoredKeys = new Set<keyof Origin01InvitationData>(['id', 'internalName'])
  const keys = Array.from(new Set([...Object.keys(baseline), ...Object.keys(publication)]))
    .filter((key) => !ignoredKeys.has(key as keyof Origin01InvitationData))
  const changedSections = keys
    .filter((key) => stableJson(baseline[key as keyof Origin01InvitationData])
      !== stableJson(publication[key as keyof Origin01InvitationData]))
    .map((key) => sectionLabels[key] ?? 'datos generales')
    .filter((label, index, labels) => labels.indexOf(label) === index)

  return { equivalent: changedSections.length === 0, changedSections }
}
