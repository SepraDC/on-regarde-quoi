import type { ListResponse } from '#shared/types/film'
import { parseListUrl } from '../../shared/utils/listUrl'
import type { RuntimeLimit } from './draw'
import { readSetting, writeSetting } from './storage'

// Le tirage de la soirée, gardé sur le téléphone pour survivre à un rechargement ou à la fermeture de l'app.
// La liste est gardée avec : on rouvre sans attendre Letterboxd, et les cartes tirées existent forcément.

/** Le tirage est oublié 6 h après la dernière action : ça couvre un film long et une pause. */
export const DRAW_TTL = 6 * 60 * 60 * 1000
const KEY = 'draw'

/** Ce que l'écran de tirage sait de la partie en cours. Les films sont désignés par leur slug. */
export interface DrawState {
  drawn: string[]
  flipped: string[]
  chosen: string | null
  maxRuntime: RuntimeLimit
}

export interface SavedDraw extends DrawState {
  /** Le lien tel que saisi ou partagé. */
  url: string
  data: ListResponse
  savedAt: number
}

export const EMPTY_DRAW: DrawState = { drawn: [], flipped: [], chosen: null, maxRuntime: null }

/** Relit un tirage gardé, ou `null` s'il est absent, illisible ou expiré. */
export function parseSavedDraw(raw: string | null, now: number): SavedDraw | null {
  if (!raw) return null
  try {
    const saved = JSON.parse(raw) as SavedDraw
    if (typeof saved.savedAt !== 'number' || !saved.data?.films) return null
    return now - saved.savedAt < DRAW_TTL ? saved : null
  }
  catch {
    return null
  }
}

/** Vrai si les deux liens désignent la même liste (`/detail/`, `www`, majuscules… ignorés). */
export function sameList(a: string, b: string): boolean {
  const ra = parseListUrl(a)
  const rb = parseListUrl(b)
  return !!ra && !!rb && JSON.stringify(ra) === JSON.stringify(rb)
}

export function readSavedDraw(now = Date.now()): SavedDraw | null {
  return parseSavedDraw(readSetting(KEY), now)
}

export function writeSavedDraw(draw: Omit<SavedDraw, 'savedAt'>, now = Date.now()): void {
  writeSetting(KEY, JSON.stringify({ ...draw, savedAt: now }))
}
