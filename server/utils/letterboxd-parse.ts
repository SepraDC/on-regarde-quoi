// Lecture du HTML des pages Letterboxd. Fonctions pures, sans dépendance à Nitro, pour être testées seules.

export interface ListEntry {
  slug: string
  title: string
  year: number | null
}

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', nbsp: ' ' }

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const n = code[1]?.toLowerCase() === 'x' ? Number.parseInt(code.slice(2), 16) : Number(code.slice(1))
      return Number.isFinite(n) ? String.fromCodePoint(n) : match
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match
  })
}

function attribute(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]
}

/** Une page de liste contient jusqu'à 100 films, chacun porté par une balise `data-item-slug`. */
export function parseListPage(html: string): { title: string | null, entries: ListEntry[] } {
  const rawTitle = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1]
  const entries: ListEntry[] = []
  for (const [tag] of html.matchAll(/<[a-z]+\b[^>]*\bdata-item-slug="[^"]*"[^>]*>/gi)) {
    const slug = attribute(tag, 'data-item-slug')!
    const name = decodeEntities(attribute(tag, 'data-item-name') ?? slug)
    const titled = name.match(/^(.*) \((\d{4})\)$/)
    entries.push({ slug, title: titled ? titled[1]! : name, year: titled ? Number(titled[2]) : null })
  }
  return { title: rawTitle ? decodeEntities(rawTitle) : null, entries }
}

export function parseTmdbId(filmPageHtml: string): number | null {
  const type = filmPageHtml.match(/data-tmdb-type="(\w+)"/)?.[1]
  const id = filmPageHtml.match(/data-tmdb-id="(\d+)"/)?.[1]
  return id && (!type || type === 'movie') ? Number(id) : null
}
