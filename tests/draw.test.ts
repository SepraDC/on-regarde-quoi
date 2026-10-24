import { describe, expect, it } from 'vitest'
import { drawLimit, fitsRuntime, pickFilm } from '../app/utils/draw'

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

describe('drawLimit', () => {
  it('plafonne à 3 tirages, ou au nombre de films', () => {
    expect(drawLimit(films, [])).toBe(3)
    expect(drawLimit(films.slice(0, 2), [])).toBe(2)
    expect(drawLimit([], [])).toBe(0)
  })

  it('compte les films encore disponibles après les cartes déjà tirées', () => {
    // Filtre posé après un premier tirage hors filtre : le film tiré n'est plus dans le pool.
    expect(drawLimit([films[1]!], [films[0]!])).toBe(2)
    expect(drawLimit([films[0]!, films[1]!], [films[0]!])).toBe(2)
  })

  it('ne descend jamais sous le nombre de cartes sur la table', () => {
    expect(drawLimit([], [films[0]!, films[1]!])).toBe(2)
  })
})

describe('fitsRuntime', () => {
  it('garde tout sans filtre, même les durées inconnues', () => {
    expect(fitsRuntime({ runtime: 200 }, null)).toBe(true)
    expect(fitsRuntime({ runtime: null }, null)).toBe(true)
  })

  it('inclut le seuil et exclut les durées inconnues', () => {
    expect(fitsRuntime({ runtime: 120 }, 120)).toBe(true)
    expect(fitsRuntime({ runtime: 121 }, 120)).toBe(false)
    expect(fitsRuntime({ runtime: null }, 90)).toBe(false)
  })
})
