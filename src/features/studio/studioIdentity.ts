export function deriveMonogram(displayName: string): string {
  return displayName.trim().charAt(0).toLocaleUpperCase('es')
}
