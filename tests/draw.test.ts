import { describe, expect, it } from 'vitest'
import { maxDraws, pickFilm } from '../app/utils/draw'

const films = ['a', 'b', 'c', 'd'].map(slug => ({ slug }))

describe('pickFilm', () => {
  it('ne retire jamais un film déjà sorti', () => {
    const drawn = [films[0]!, films[2]!]
    for (let i = 0; i < 50; i++) {
      expect(['b', 'd']).toContain(pickFilm(films, drawn)!.slug)
    }
  })

  it('donne sa chance à chaque film restant', () => {
    expect(pickFilm(films, [films[0]!], () => 0)!.slug).toBe('b')
    expect(pickFilm(films, [films[0]!], () => 0.999)!.slug).toBe('d')
  })

  it('renvoie null quand tout est sorti', () => {
    expect(pickFilm(films, films)).toBeNull()
  })
})

describe('maxDraws', () => {
  it('plafonne à 3 tirages, ou au nombre de films', () => {
    expect(maxDraws(films)).toBe(3)
    expect(maxDraws(films.slice(0, 2))).toBe(2)
    expect(maxDraws([])).toBe(0)
  })
})
