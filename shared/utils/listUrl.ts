export type ListRef =
  | { kind: 'list', user: string, slug: string }
  | { kind: 'short', code: string }

const LIST_RE = /(?:https?:\/\/)?(?:www\.)?letterboxd\.com\/([\w-]+)\/list\/([\w-]+)/i
const SHORT_RE = /(?:https?:\/\/)?boxd\.it\/([A-Za-z0-9]+)/

/**
 * Trouve une liste Letterboxd dans un texte : URL complète (avec ou sans `www`, suffixes
 * comme `/detail/` ou `/page/2/`), lien court `boxd.it/…`, ou texte partagé qui en contient un.
 * Un lien court peut aussi désigner un film : seul le serveur peut le vérifier en le suivant.
 */
export function parseListUrl(text: string): ListRef | null {
  const list = text.match(LIST_RE)
  if (list) return { kind: 'list', user: list[1]!.toLowerCase(), slug: list[2]!.toLowerCase() }
  const short = text.match(SHORT_RE)
  if (short) return { kind: 'short', code: short[1]! }
  return null
}

export function listPageUrl(ref: { user: string, slug: string }): string {
  return `https://letterboxd.com/${ref.user}/list/${ref.slug}/`
}
