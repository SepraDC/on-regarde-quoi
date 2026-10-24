import { describe, expect, it } from 'vitest'
import { DRAW_TTL, EMPTY_DRAW, parseSavedDraw, sameList } from '../app/utils/savedDraw'

const saved = {
  ...EMPTY_DRAW,
  drawn: ['alien'],
  url: 'https://letterboxd.com/moi/list/ce-soir/',
  data: { list: { title: 'Ce soir', url: 'https://letterboxd.com/moi/list/ce-soir/' }, films: [] },
  savedAt: 1_000,
}
const raw = JSON.stringify(saved)

describe('parseSavedDraw', () => {
  it('rend le tirage tant que les 6 h ne sont pas écoulées', () => {
    expect(parseSavedDraw(raw, 1_000 + DRAW_TTL - 1)).toEqual(saved)
  })

  it('oublie le tirage 6 h après la dernière action', () => {
    expect(parseSavedDraw(raw, 1_000 + DRAW_TTL)).toBeNull()
  })

  it('ignore un contenu absent ou illisible', () => {
    expect(parseSavedDraw(null, 0)).toBeNull()
    expect(parseSavedDraw('{', 0)).toBeNull()
    expect(parseSavedDraw('{"savedAt":1}', 1)).toBeNull()
  })
})

describe('sameList', () => {
  it('reconnaît la même liste sous deux écritures', () => {
    expect(sameList('letterboxd.com/Moi/list/ce-soir/detail/', 'https://www.letterboxd.com/moi/list/ce-soir/')).toBe(true)
  })

  it('distingue deux listes, ou un lien invalide', () => {
    expect(sameList('letterboxd.com/moi/list/ce-soir/', 'letterboxd.com/moi/list/plus-tard/')).toBe(false)
    expect(sameList('pas un lien', 'pas un lien')).toBe(false)
  })
})
