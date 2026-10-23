const API = 'https://api.themoviedb.org/3'
const IMAGES = 'https://image.tmdb.org/t/p'

interface SearchResponse {
  results: { id: number, release_date?: string }[]
}

interface Translation {
  iso_639_1: string
  iso_3166_1: string
  data: { overview?: string }
}

interface MovieResponse {
  runtime: number | null
  genres: { id: number }[]
  poster_path: string | null
  overview: string
  translations?: { translations: Translation[] }
}

function tmdb<T>(path: string, query: Record<string, string | number | boolean>) {
  return $fetch<T>(path, {
    baseURL: API,
    query,
    headers: { Authorization: `Bearer ${useRuntimeConfig().tmdbToken}` },
    retry: 3,
    retryDelay: 1000,
    retryStatusCodes: [429, 500, 502, 503, 504],
  })
}

/** Recherche par titre et année ; sans résultat, retente sans l'année en acceptant ±1 an d'écart. */
export async function findTmdbId(title: string, year: number | null): Promise<number | null> {
  if (year) {
    const exact = await tmdb<SearchResponse>('/search/movie', { query: title, year, include_adult: false })
    if (exact.results[0]) return exact.results[0].id
  }
  const loose = await tmdb<SearchResponse>('/search/movie', { query: title, include_adult: false })
  const match = loose.results.find(r => !year || Math.abs(Number(r.release_date?.slice(0, 4)) - year) <= 1)
  return match?.id ?? null
}

export async function fetchMovie(id: number) {
  // Sans `language` : la durée reste celle de la version d'origine. Avec `fr-FR`, TMDB renvoie
  // la durée du montage français quand il existe (« Shining » : 119 min au lieu de 144).
  const movie = await tmdb<MovieResponse>(`/movie/${id}`, { append_to_response: 'translations' })
  const translations = movie.translations?.translations ?? []
  const fr = translations.find(t => t.iso_639_1 === 'fr' && t.iso_3166_1 === 'FR') ?? translations.find(t => t.iso_639_1 === 'fr')
  return {
    runtime: movie.runtime || null,
    genreIds: movie.genres.map(g => g.id),
    poster: movie.poster_path ? `${IMAGES}/w342${movie.poster_path}` : null,
    posterLarge: movie.poster_path ? `${IMAGES}/w780${movie.poster_path}` : null,
    overview: { fr: fr?.data.overview ?? '', en: movie.overview },
  }
}
