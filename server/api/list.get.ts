import type { ListResponse } from '#shared/types/film'

export default defineEventHandler(async (event): Promise<ListResponse> => {
  const { url } = getQuery(event)
  if (typeof url !== 'string' || !parseListUrl(url)) throw listError(400, 'invalid_url')
  if (!useRuntimeConfig(event).tmdbToken) throw listError(500, 'tmdb_not_configured')

  const list = await fetchList(await resolveListRef(url))
  const films = await mapLimit(list.entries, 8, async entry => (await getFilm(entry)).film)

  return { list: { title: list.title, url: list.url }, films }
})
