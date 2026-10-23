<script setup lang="ts">
import type { Film, ListResponse } from '#shared/types/film'

const props = defineProps<{ list: ListResponse['list'], films: Film[] }>()
const emit = defineEmits<{ changeList: [] }>()

const { t } = useI18n()
const { muted, toggleMute, unlock, tick, ding, whoosh, fanfare } = useSound()
const { requestGyro } = useHolo()

const wheel = ref<{ spin: (film: Film) => Promise<void> }>()
const drawn = ref<Film[]>([])
const flipped = ref(new Set<string>())
const dealtSlug = ref<string | null>(null)
const chosen = ref<Film | null>(null)
const spinning = ref(false)

const max = computed(() => maxDraws(props.films))
const canSpin = computed(() => !spinning.value && drawn.value.length < max.value)
const spinLabel = computed(() => {
  const n = drawn.value.length
  if (n === 0) return t('deck.spin')
  return n < max.value ? t('deck.again', { n: n + 1, max: max.value }) : t('deck.done')
})
const hint = computed(() => {
  if (spinning.value) return ''
  if (!drawn.value.length) return t('deck.hintStart', { max: max.value }, max.value)
  return flipped.value.size ? t('deck.hintChoose') : t('deck.hintFlip')
})

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function spin() {
  if (!canSpin.value) return
  requestGyro()
  unlock()
  const target = pickFilm(props.films, drawn.value)
  if (!target) return
  spinning.value = true
  await wheel.value!.spin(target)
  ding()
  await wait(650)
  drawn.value.push(target)
  dealtSlug.value = target.slug
  spinning.value = false
}

function flip(film: Film) {
  if (flipped.value.has(film.slug)) return
  requestGyro()
  unlock()
  flipped.value = new Set(flipped.value).add(film.slug)
  whoosh()
}

function choose(film: Film) {
  chosen.value = film
  fanfare()
}

function restart() {
  chosen.value = null
  drawn.value = []
  flipped.value = new Set()
  dealtSlug.value = null
}
</script>

<template>
  <div class="screen">
    <MarqueeHeader :kicker="t('app.kicker')" />
    <div class="info">
      <p class="list-name">
        {{ list.title }} · {{ t('deck.films', films.length) }}
      </p>
      <div class="controls">
        <button type="button" class="text-btn" :aria-pressed="muted" @click="toggleMute">
          {{ muted ? t('deck.soundOff') : t('deck.soundOn') }}
        </button>
        <LangToggle />
        <button type="button" class="text-btn" @click="emit('changeList')">
          {{ t('deck.changeList') }}
        </button>
        <NuxtLink to="/mentions-legales" class="text-btn">
          {{ t('footer.legal') }}
        </NuxtLink>
      </div>
    </div>

    <TicketWheel ref="wheel" class="bleed" :films="films" @tick="tick" />

    <button type="button" class="brass" :disabled="!canSpin" @click="spin">
      {{ spinLabel }}
    </button>

    <section class="slots" :aria-label="t('deck.slotsLabel')">
      <div v-for="i in max" :key="i" class="slot">
        <template v-if="drawn[i - 1]">
          <TicketCard
            :film="drawn[i - 1]!"
            :flipped="flipped.has(drawn[i - 1]!.slug)"
            :dealt="dealtSlug === drawn[i - 1]!.slug"
            @flip="flip(drawn[i - 1]!)"
          />
          <button v-if="flipped.has(drawn[i - 1]!.slug)" type="button" class="choose" @click="choose(drawn[i - 1]!)">
            {{ t('deck.choose') }}
          </button>
        </template>
        <div v-else class="empty">
          {{ t('deck.slot', { n: i }) }}
        </div>
      </div>
    </section>

    <p class="hint" aria-live="polite">
      {{ hint }}
    </p>

    <ChosenOverlay v-if="chosen" :film="chosen" @restart="restart" />
  </div>
</template>

<style scoped>
.info { display: grid; gap: 2px; }
.list-name { margin: 0; font-size: 13px; overflow-wrap: anywhere; }
.controls { display: flex; flex-wrap: wrap; column-gap: 16px; }
.controls a { color: inherit; text-decoration: none; }
.slots { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; align-items: start; }
.slot { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.empty {
  display: grid;
  place-items: center;
  aspect-ratio: 2 / 3;
  border: 2px dashed rgb(217 169 69 / 0.45);
  border-radius: 10px;
  font-size: 12px;
  color: rgb(243 231 207 / 0.5);
}
.choose { border: 0; border-radius: 6px; padding: 8px 4px; background: var(--gold); color: var(--ink); font-weight: 700; font-size: 12px; }
.hint { margin: 0; min-height: 1.3em; font-size: 13px; text-align: center; opacity: 0.7; }
</style>
