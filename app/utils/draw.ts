export const MAX_DRAWS = 3

export function maxDraws(films: readonly { slug: string }[]): number {
  return Math.min(MAX_DRAWS, films.length)
}

/** Tire un film au hasard, de façon équitable, parmi ceux qui ne sont pas encore sortis. */
export function pickFilm<T extends { slug: string }>(films: readonly T[], drawn: readonly T[], random = Math.random): T | null {
  const pool = films.filter(f => !drawn.some(d => d.slug === f.slug))
  return pool.length ? pool[Math.floor(random() * pool.length)]! : null
}
