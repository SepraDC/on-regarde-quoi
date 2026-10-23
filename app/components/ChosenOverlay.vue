<script setup lang="ts">
import type { Film } from '#shared/types/film'

const props = defineProps<{ film: Film }>()
defineEmits<{ restart: [] }>()

const { t, locale } = useI18n()
const { follow } = useHolo()
const open = ref(false)
const expanded = ref(false)
const tilt = ref<HTMLElement>()

const overview = computed(() => {
  const { fr, en } = props.film.overview
  return (locale.value === 'fr' ? fr || en : en || fr) ?? ''
})
const meta = computed(() => [
  props.film.year,
  props.film.runtime && formatRuntime(props.film.runtime, locale.value),
  sortGenres(props.film.genreIds).slice(0, 2).map(id => t(`genre.${id}`)).join(', '),
].filter(Boolean).join(' · '))

onMounted(() => requestAnimationFrame(() => requestAnimationFrame(() => {
  open.value = true
})))
</script>

<template>
  <Teleport to="body">
    <div class="chosen" :class="{ open }" role="dialog" aria-modal="true" :aria-label="film.title">
      <div class="backdrop" :style="film.posterLarge ? { backgroundImage: `url('${film.posterLarge}')` } : undefined" />
      <p class="kicker">
        {{ t('chosen.kicker') }}
      </p>
      <div class="poster">
        <div ref="tilt" class="tilt" @pointermove="follow($event, tilt)" @touchmove.passive="follow($event, tilt)">
          <img v-if="film.posterLarge" :src="film.posterLarge" :alt="film.title">
          <span v-else class="no-poster">{{ film.title }}</span>
          <span class="holo" />
          <span class="glare" />
        </div>
      </div>
      <h2>{{ film.title }}</h2>
      <p class="meta">
        {{ meta }}
      </p>
      <p v-if="overview" class="overview" :class="{ expanded }">
        {{ overview }}
      </p>
      <button v-if="overview.length > 150 && !expanded" type="button" class="link" @click="expanded = true">
        {{ t('chosen.more') }}
      </button>
      <a class="primary" :href="film.letterboxdUrl" target="_blank" rel="noopener">{{ t('chosen.letterboxd') }}</a>
      <button type="button" class="link" @click="$emit('restart')">
        {{ t('chosen.restart') }}
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.chosen {
  position: fixed;
  inset: 0;
  z-index: 50;
  isolation: isolate;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding-top: calc(env(safe-area-inset-top, 0px) + 28px);
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 28px);
  padding-left: max(20px, env(safe-area-inset-left, 0px));
  padding-right: max(20px, env(safe-area-inset-right, 0px));
  background: var(--bg);
  opacity: 0;
  transition: opacity 0.35s;
}
.chosen.open { opacity: 1; }
.backdrop {
  position: fixed;
  inset: -60px;
  z-index: -1;
  background-size: cover;
  background-position: center;
  filter: blur(34px) saturate(1.3) brightness(0.4);
}
.kicker { margin: 0; font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: var(--gold); }
.poster {
  flex: none;
  width: min(66vw, 300px);
  aspect-ratio: 2 / 3;
  perspective: 900px;
  transform: scale(0.55) rotateY(-100deg);
  transition: transform 0.8s cubic-bezier(0.2, 0.9, 0.25, 1.1) 0.05s;
}
.open .poster { transform: none; }
.tilt {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 14px;
  box-shadow: 0 30px 70px rgb(0 0 0 / 0.65);
  transform: rotateX(calc((var(--hy, 0.5) - 0.5) * -10deg)) rotateY(calc((var(--hx, 0.5) - 0.5) * 14deg));
  transition: transform 0.15s linear;
}
.tilt img { display: block; width: 100%; height: 100%; object-fit: cover; }
.no-poster { display: grid; place-items: center; height: 100%; padding: 16px; font: 400 26px / 1.2 var(--display); color: var(--bulb); text-align: center; background: #1a0a0c; }
h2 { margin: 4px 0 0; font: 400 32px / 1.05 var(--display); text-align: center; text-wrap: balance; }
.meta { margin: 0; font-size: 14px; text-align: center; opacity: 0.85; }
.overview {
  margin: 0;
  max-width: 34em;
  font-size: 14px;
  line-height: 1.55;
  opacity: 0.85;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.overview.expanded { display: block; }
.primary {
  display: block;
  width: min(100%, 340px);
  margin-top: 6px;
  padding: 15px;
  border-radius: 999px;
  background: var(--gold);
  color: var(--ink);
  font-weight: 700;
  font-size: 17px;
  text-align: center;
  text-decoration: none;
}
.link { border: 0; background: none; padding: 8px; font-size: 14px; text-decoration: underline; opacity: 0.75; }

@media (prefers-reduced-motion: reduce) {
  .tilt { transform: none; }
}
</style>
