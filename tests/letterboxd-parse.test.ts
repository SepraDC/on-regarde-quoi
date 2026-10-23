import { describe, expect, it } from 'vitest'
import { decodeEntities, parseListPage, parseTmdbId } from '../server/utils/letterboxd-parse'

// Extrait d'une vraie page de liste (octobre 2026), réduit aux attributs utiles.
const LIST_PAGE = `
<meta property="og:title" content="Films d&#039;Ozu &amp; co">
<ul class="poster-list">
  <li class="posteritem numbered-list-item" data-owner-rating="9" data-object-id="filmListEntry:2856210121">
    <div class="react-component" data-component-class="LazyPoster" data-item-name="The Shawshank Redemption (1994)" data-item-slug="the-shawshank-redemption" data-item-link="/film/the-shawshank-redemption/" data-postered-identifier='{&quot;lid&quot;:&quot;2aHi&quot;}'></div>
  </li>
  <li class="posteritem numbered-list-item">
    <div class="react-component" data-component-class="LazyPoster" data-item-name="Pride &amp; Prejudice (2005)" data-item-slug="pride-prejudice" data-item-link="/film/pride-prejudice/"></div>
  </li>
  <li class="posteritem numbered-list-item">
    <div class="react-component" data-component-class="LazyPoster" data-item-name="Untitled Project" data-item-slug="untitled-project"></div>
  </li>
</ul>`

describe('parseListPage', () => {
  it('lit le titre de la liste et chaque film avec son année', () => {
    expect(parseListPage(LIST_PAGE)).toEqual({
      title: 'Films d\'Ozu & co',
      entries: [
        { slug: 'the-shawshank-redemption', title: 'The Shawshank Redemption', year: 1994 },
        { slug: 'pride-prejudice', title: 'Pride & Prejudice', year: 2005 },
        { slug: 'untitled-project', title: 'Untitled Project', year: null },
      ],
    })
  })

  it('renvoie une liste vide au-delà de la dernière page', () => {
    expect(parseListPage('<meta property="og:title" content="Liste"><ul></ul>').entries).toEqual([])
  })
})

describe('parseTmdbId', () => {
  it('lit l’identifiant TMDB d’un film', () => {
    expect(parseTmdbId('<body data-tmdb-type="movie" data-tmdb-id="278">')).toBe(278)
  })

  it('ignore les séries', () => {
    expect(parseTmdbId('<body data-tmdb-type="tv" data-tmdb-id="1396">')).toBeNull()
  })
})

describe('decodeEntities', () => {
  it('décode les entités nommées et numériques', () => {
    expect(decodeEntities('L&#039;&Eacute;t&eacute; &amp; &#x2014; &quot;x&quot;')).toBe('L\'&Eacute;t&eacute; & — "x"')
  })
})
