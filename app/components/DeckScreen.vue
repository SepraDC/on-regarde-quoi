<script setup lang="ts">
import type { Film, ListResponse } from '#shared/types/film'

const props = defineProps<{ list: ListResponse['list'], films: Film[], initial: DrawState }>()
const emit = defineEmits<{ changeList: [], change: [state: DrawState] }>()

const { t } = useI18n()
const { muted, toggleMute, unlock, tick, ding, whoosh, fanfare } = useSound()
const { requestGyro } = useHolo()

const bySlug = (slugs: string[]) => slugs.flatMap(slug => props.films.filter(f => f.slug === slug))

const wheel = ref<{ spin: (film: Film) => Promise<void> }>()
const drawn = ref<Film[]>(bySlug(props.initial.drawn))
const flipped = ref(new Set(props.initial.flipped))
const dealtSlug = ref<string | null>(null)
const chosen = ref<Film | null>(bySlug(props.initial.chosen ? [props.initial.chosen] : [])[0] ?? null)
// Un film déjà choisi au retour sur l'app s'affiche tout de suite, sans animation ni fanfare.
const instantChoice = ref(chosen.value !== null)
const maxRuntime = ref<RuntimeLimit>(props.initial.maxRuntime)
const spinning = ref(false)

const pool = computed(() => props.films.filter(f => fitsRuntime(f, maxRuntime.value)))
const max = computed(() => drawLimit(pool.value, drawn.value))
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
const count = computed(() => maxRuntime.value === null
  ? t('deck.films', props.films.length)
  : t('deck.filmsOf', { total: props.films.length }, pool.value.length))

watch([drawn, flipped, chosen, maxRuntime], () => emit('change', {
  drawn: drawn.value.map(f => f.slug),
  flipped: [...flipped.value],
  chosen: chosen.value?.slug ?? null,
  maxRuntime: maxRuntime.value,
}), { deep: true })

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function spin() {
  if (!canSpin.value) return
  requestGyro()
  unlock()
  const target = pickFilm(pool.value, drawn.value)
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
  instantChoice.value = false
  chosen.value = film
  fanfare()
}

function restart() {
  chosen.value = null
  drawn.value = []
  flipped.value = new Set()
  dealtSlug.value = null
  maxRuntime.value = null
}
</script>

<template>
  <div class="screen">
    <MarqueeHeader :kicker="t('app.kicker')" />
    <div class="info">
      <p class="list-name">
        {{ list.title }} · <span :class="{ filtered: maxRuntime !== null }">{{ count }}</span>
      </p>
      <RuntimeFilter v-model="maxRuntime" :films="films" :disabled="spinning" />
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

    <TicketWheel ref="wheel" class="bleed" :films="pool" @tick="tick" />

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

    <ChosenOverlay v-if="chosen" :film="chosen" :instant="instantChoice" @restart="restart" />
  </div>
</template>

<style scoped>
.info { display: grid; gap: 2px; }
.list-name { margin: 0; font-size: 13px; overflow-wrap: anywhere; }
.filtered { color: var(--gold); font-weight: 700; }
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
