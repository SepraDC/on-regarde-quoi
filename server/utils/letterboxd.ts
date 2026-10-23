import type { ListErrorCode } from '#shared/types/film'
import type { ListEntry } from './letterboxd-parse'

const BASE = 'https://letterboxd.com'
const HEADERS = {
  'user-agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36',
  'accept': 'text/html,application/json',
}
const FILMS_PER_PAGE = 100
const MAX_PAGES = 10

export function listError(statusCode: number, code: ListErrorCode) {
  return createError({ statusCode, statusMessage: code, data: { code } })
}

/** Transforme ce que l'utilisateur a collé ou partagé en liste, en suivant les liens courts boxd.it. */
export async function resolveListRef(input: string): Promise<{ user: string, slug: string }> {
  const ref = parseListUrl(input)
  if (!ref) throw listError(400, 'invalid_url')
  if (ref.kind === 'list') return ref

  const res = await fetch(`https://boxd.it/${ref.code}`, { redirect: 'manual', headers: HEADERS })
  const resolved = parseListUrl(res.headers.get('location') ?? '')
  if (resolved?.kind !== 'list') throw listError(400, 'invalid_url')
  return resolved
}

export async function fetchList(ref: { user: string, slug: string }) {
  const url = listPageUrl(ref)
  const entries: ListEntry[] = []
  let title: string | null = null

  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(page === 1 ? url : `${url}page/${page}/`, { headers: HEADERS })
    if (res.status === 404) throw listError(404, 'list_not_found')
    if (!res.ok) throw listError(502, 'letterboxd_unavailable')

    const parsed = parseListPage(await res.text())
    title ??= parsed.title
    entries.push(...parsed.entries)
    if (parsed.entries.length < FILMS_PER_PAGE) break
  }

  const unique = [...new Map(entries.map(e => [e.slug, e])).values()]
  return { title: title ?? ref.slug, url, entries: unique }
}

/** Secours quand la recherche TMDB par titre et année échoue : la page du film donne l'identifiant TMDB. */
export async function fetchTmdbIdFromFilmPage(slug: string): Promise<number | null> {
  const res = await fetch(`${BASE}/film/${slug}/`, { headers: HEADERS })
  return res.ok ? parseTmdbId(await res.text()) : null
}

/** Secours quand TMDB n'a pas d'affiche. */
export async function fetchLetterboxdPoster(slug: string): Promise<string | null> {
  const res = await fetch(`${BASE}/film/${slug}/poster/std/230/`, { headers: HEADERS })
  if (!res.ok) return null
  const json = await res.json() as { url?: string, url2x?: string }
  return json.url2x ?? json.url ?? null
}
