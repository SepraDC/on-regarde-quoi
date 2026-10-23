/** « 1 h 47 » en français, « 1h 47m » en anglais, « 52 min » sous l'heure. */
export function formatRuntime(minutes: number, locale: string): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = String(minutes % 60).padStart(2, '0')
  return locale === 'fr' ? `${h} h ${m}` : `${h}h ${m}m`
}

/** Numéro de série décoratif du ticket, stable pour un film donné. */
export function ticketSerial(slug: string): string {
  let hash = 7
  for (const ch of slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return String(hash % 1_000_000).padStart(6, '0')
}
