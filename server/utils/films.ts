import type { Film } from '#shared/types/film'
import type { ListEntry } from './letterboxd-parse'

const THIRTY_DAYS = 60 * 60 * 24 * 30

interface CachedFilm {
  film: Film
  /** Faux si TMDB n'a rien donné : on ne garde pas ce résultat, pour retenter au prochain chargement. */
  complete: boolean
}

async function resolveFilm(entry: ListEntry): Promise<CachedFilm> {
  let tmdbId = await findTmdbId(entry.title, entry.year).catch(() => null)
  tmdbId ??= await fetchTmdbIdFromFilmPage(entry.slug).catch(() => null)
  const movie = tmdbId ? await fetchMovie(tmdbId).catch(() => null) : null
  const letterboxdPoster = movie?.poster ? null : await fetchLetterboxdPoster(entry.slug).catch(() => null)

  return {
    complete: movie !== null,
    film: {
      slug: entry.slug,
      title: entry.title,
      year: entry.year,
      runtime: movie?.runtime ?? null,
      genreIds: movie?.genreIds ?? [],
      poster: movie?.poster ?? letterboxdPoster,
      posterLarge: movie?.posterLarge ?? letterboxdPoster,
      overview: movie?.overview ?? { fr: '', en: '' },
      letterboxdUrl: `https://letterboxd.com/film/${entry.slug}/`,
    },
  }
}

export const getFilm = defineCachedFunction(resolveFilm, {
  name: 'film',
  maxAge: THIRTY_DAYS,
  getKey: (entry: ListEntry) => entry.slug,
  validate: entry => entry.value?.complete === true,
})

/** Applique `fn` à chaque élément avec au plus `limit` appels en parallèle, en gardant l'ordre. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i]!)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}
