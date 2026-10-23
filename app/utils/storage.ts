// Réglages propres à ce téléphone. Le stockage peut être indisponible (navigation privée) : on fait sans.

export function readSetting(key: string): string | null {
  try {
    return localStorage.getItem(`orq:${key}`)
  }
  catch {
    return null
  }
}

export function writeSetting(key: string, value: string): void {
  try {
    localStorage.setItem(`orq:${key}`, value)
  }
  catch {}
}
