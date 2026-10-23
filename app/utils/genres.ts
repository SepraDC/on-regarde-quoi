// Genres TMDB (identifiants stables). Les libellés traduits sont dans i18n/locales, sous `genre.<id>`.
const GENRE_COLORS: Record<number, string> = {
  28: '#e2552d', // Action
  12: '#c07a26', // Aventure
  16: '#2fae8f', // Animation
  35: '#e9a62b', // Comédie
  80: '#4a5a86', // Policier
  99: '#7c8a4a', // Documentaire
  18: '#b03a48', // Drame
  10751: '#5fb14f', // Familial
  14: '#8a5cc7', // Fantastique
  36: '#8c6a4a', // Histoire
  27: '#6a2f86', // Horreur
  10402: '#cf4fae', // Musique
  9648: '#3d4e9f', // Mystère
  10749: '#e0709b', // Romance
  878: '#2b7bd1', // Science-fiction
  10770: '#777777', // Téléfilm
  53: '#2c7479', // Thriller
  10752: '#6b6f4e', // Guerre
  37: '#b5683a', // Western
}
const UNKNOWN_COLOR = '#777777'

// Les genres les plus distinctifs passent devant : un film d'animation dramatique reste d'abord « Animation ».
const PRIORITY = [16, 99, 27, 878, 14, 37, 10752, 10402, 10749, 35, 80, 53, 9648, 28, 12, 10751, 36, 18, 10770]

const rank = (id: number) => {
  const i = PRIORITY.indexOf(id)
  return i === -1 ? PRIORITY.length : i
}

export function sortGenres(ids: number[]): number[] {
  return [...ids].sort((a, b) => rank(a) - rank(b))
}

export function genreColor(ids: number[]): string {
  const main = sortGenres(ids)[0]
  return (main !== undefined && GENRE_COLORS[main]) || UNKNOWN_COLOR
}
