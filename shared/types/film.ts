export interface Film {
  slug: string
  /** Titre tel qu'affiché sur Letterboxd. */
  title: string
  year: number | null
  /** Durée en minutes, `null` si inconnue. */
  runtime: number | null
  /** Identifiants de genres TMDB, dans l'ordre donné par TMDB. */
  genreIds: number[]
  /** Affiche pour les cartes (~342 px de large). */
  poster: string | null
  /** Affiche pour la carte en plein écran. */
  posterLarge: string | null
  overview: { fr: string, en: string }
  letterboxdUrl: string
}

export interface ListResponse {
  list: { title: string, url: string }
  films: Film[]
}

/** Codes d'erreur renvoyés par `/api/list` dans `data.code`. */
export type ListErrorCode =
  | 'invalid_url'
  | 'list_not_found'
  | 'letterboxd_unavailable'
  | 'tmdb_not_configured'
