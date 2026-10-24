<script setup lang="ts">
import type { FetchError } from 'ofetch'
import type { ListErrorCode, ListResponse } from '#shared/types/film'

type Screen = 'boot' | 'form' | 'loading' | 'deck'
type ErrorCode = ListErrorCode | 'empty' | 'unknown'
const SERVER_ERRORS: ListErrorCode[] = ['invalid_url', 'list_not_found', 'letterboxd_unavailable', 'tmdb_not_configured']

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const screen = ref<Screen>('boot')
const data = ref<ListResponse | null>(null)
const draw = ref<DrawState>(EMPTY_DRAW)
const lastUrl = ref('')
const errorCode = ref<ErrorCode | null>(null)
const errorMessage = computed(() => errorCode.value && t(`errors.${errorCode.value}`))

function fail(code: ErrorCode) {
  errorCode.value = code
  screen.value = 'form'
}

function resume(saved: SavedDraw) {
  lastUrl.value = saved.url
  data.value = saved.data
  draw.value = saved
  screen.value = 'deck'
}

function save(state: DrawState) {
  writeSavedDraw({ ...state, url: lastUrl.value, data: data.value! })
}

async function load(url: string) {
  lastUrl.value = url
  errorCode.value = null
  if (!parseListUrl(url)) return fail('invalid_url')

  // La même liste dans les 6 h : on reprend le tirage en cours, sans relire Letterboxd.
  const saved = readSavedDraw()
  if (saved && (sameList(url, saved.url) || sameList(url, saved.data.list.url))) return resume(saved)

  screen.value = 'loading'
  try {
    const res = await $fetch<ListResponse>('/api/list', { query: { url } })
    if (!res.films.length) return fail('empty')
    writeSetting('list', url)
    data.value = res
    draw.value = EMPTY_DRAW
    save(EMPTY_DRAW)
    screen.value = 'deck'
  }
  catch (e) {
    const code = (e as FetchError).data?.data?.code
    fail(SERVER_ERRORS.includes(code) ? code : 'unknown')
  }
}

onMounted(() => {
  // Partage Android : Letterboxd met le lien dans `text` ou `url`, parfois au milieu d'une phrase.
  const shared = ['url', 'text', 'title']
    .map(key => route.query[key])
    .find((v): v is string => typeof v === 'string' && parseListUrl(v) !== null)
  if (shared) {
    void router.replace({ query: {} })
    return load(shared)
  }
  const saved = readSavedDraw()
  if (saved) return resume(saved)
  const stored = readSetting('list')
  if (stored) return load(stored)
  screen.value = 'form'
})
</script>

<template>
  <DeckScreen
    v-if="screen === 'deck' && data"
    :list="data.list"
    :films="data.films"
    :initial="draw"
    @change="save"
    @change-list="screen = 'form'"
  />
  <main v-else class="screen">
    <MarqueeHeader :kicker="t('app.kicker')" />
    <DealingLoader v-if="screen === 'loading'" />
    <ListForm v-else-if="screen === 'form'" :initial-url="lastUrl" :error="errorMessage" @submit="load" />
    <footer class="footer">
      <div class="footer-links">
        <LangToggle />
        <NuxtLink to="/mentions-legales" class="text-btn">
          {{ t('footer.legal') }}
        </NuxtLink>
      </div>
      <p>{{ t('footer.tmdb') }}</p>
    </footer>
  </main>
</template>

<style scoped>
.footer { margin-top: auto; display: grid; justify-items: center; gap: 4px; text-align: center; }
.footer-links { display: flex; gap: 16px; }
.footer-links a { color: inherit; text-decoration: none; }
.footer p { margin: 0; max-width: 36ch; font-size: 11px; line-height: 1.5; opacity: 0.55; }
</style>
