import { describe, expect, it } from 'vitest'
import { listPageUrl, parseListUrl } from '../shared/utils/listUrl'

const list = { kind: 'list', user: 'cinephile', slug: 'a-voir-ensemble' }

describe('parseListUrl', () => {
  it.each([
    'https://letterboxd.com/cinephile/list/a-voir-ensemble/',
    'https://www.letterboxd.com/cinephile/list/a-voir-ensemble',
    'letterboxd.com/cinephile/list/a-voir-ensemble/detail/',
    'https://letterboxd.com/cinephile/list/a-voir-ensemble/page/2/',
    'https://letterboxd.com/CinePhile/list/A-Voir-Ensemble/',
    'Regarde ma liste : https://letterboxd.com/cinephile/list/a-voir-ensemble/ !',
  ])('reconnaît une liste dans %s', (input) => {
    expect(parseListUrl(input)).toEqual(list)
  })

  it('garde la casse des liens courts, qui y sont sensibles', () => {
    expect(parseListUrl('Check out this list on Letterboxd https://boxd.it/AbC12')).toEqual({ kind: 'short', code: 'AbC12' })
    expect(parseListUrl('boxd.it/AbC12')).toEqual({ kind: 'short', code: 'AbC12' })
  })

  it.each([
    'https://letterboxd.com/film/whiplash-2014/',
    'https://letterboxd.com/cinephile/',
    'une liste de films',
    '',
  ])('refuse %s', (input) => {
    expect(parseListUrl(input)).toBeNull()
  })
})

describe('listPageUrl', () => {
  it('construit l’URL canonique de la liste', () => {
    expect(listPageUrl(list)).toBe('https://letterboxd.com/cinephile/list/a-voir-ensemble/')
  })
})
