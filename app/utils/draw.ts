export const MAX_DRAWS = 3

/** Seuils du filtre de durée, en minutes, du plus large au plus strict. `null` : pas de filtre. */
export const RUNTIME_LIMITS = [null, 120, 90] as const
export type RuntimeLimit = typeof RUNTIME_LIMITS[number]

/** Un film passe le filtre si sa durée est connue et ne dépasse pas le seuil (seuil inclus). */
export function fitsRuntime(film: { runtime: number | null }, limit: RuntimeLimit): boolean {
  return limit === null || (film.runtime !== null && film.runtime <= limit)
}

/**
 * Nombre de tirages possibles : 3 au plus, moins si le filtre laisse trop peu de films,
 * et jamais moins que les cartes déjà sur la table (elles restent même si le filtre a changé).
 */
export function drawLimit(pool: readonly { slug: string }[], drawn: readonly { slug: string }[]): number {
  const left = pool.filter(f => !drawn.some(d => d.slug === f.slug)).length
  return Math.max(drawn.length, Math.min(MAX_DRAWS, drawn.length + left))
}

/** Tire un film au hasard, de façon équitable, parmi ceux qui ne sont pas encore sortis. */
export function pickFilm<T extends { slug: string }>(films: readonly T[], drawn: readonly T[], random = Math.random): T | null {
  const pool = films.filter(f => !drawn.some(d => d.slug === f.slug))
  return pool.length ? pool[Math.floor(random() * pool.length)]! : null
}
