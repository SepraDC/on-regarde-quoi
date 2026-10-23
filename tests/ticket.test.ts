import { describe, expect, it } from 'vitest'
import { genreColor, sortGenres } from '../app/utils/genres'
import { formatRuntime, ticketSerial } from '../app/utils/ticket'

describe('sortGenres', () => {
  it('met les genres distinctifs devant le drame', () => {
    // Drame, Animation, Romance
    expect(sortGenres([18, 16, 10749])).toEqual([16, 10749, 18])
  })

  it('garde les genres inconnus, en dernier', () => {
    expect(sortGenres([12345, 18])).toEqual([18, 12345])
  })
})

describe('genreColor', () => {
  it('prend la couleur du genre principal', () => {
    expect(genreColor([18, 27])).toBe(genreColor([27]))
  })

  it('a une couleur par défaut', () => {
    expect(genreColor([])).toBe('#777777')
  })
})

describe('formatRuntime', () => {
  it('écrit les durées à la française ou à l’anglaise', () => {
    expect(formatRuntime(107, 'fr')).toBe('1 h 47')
    expect(formatRuntime(120, 'fr')).toBe('2 h 00')
    expect(formatRuntime(107, 'en')).toBe('1h 47m')
    expect(formatRuntime(52, 'fr')).toBe('52 min')
  })
})

describe('ticketSerial', () => {
  it('donne toujours le même numéro à six chiffres pour un film', () => {
    expect(ticketSerial('whiplash-2014')).toMatch(/^\d{6}$/)
    expect(ticketSerial('whiplash-2014')).toBe(ticketSerial('whiplash-2014'))
  })
})
