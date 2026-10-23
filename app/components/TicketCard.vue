<script setup lang="ts">
import type { Film } from '#shared/types/film'

const props = defineProps<{ film: Film, flipped: boolean, dealt?: boolean }>()
defineEmits<{ flip: [] }>()

const { t, locale } = useI18n()
const { follow } = useHolo()
const el = ref<HTMLElement>()

const runtime = computed(() =>
  props.film.runtime ? formatRuntime(props.film.runtime, locale.value) : t('card.unknownRuntime'))
const genres = computed(() => sortGenres(props.film.genreIds).slice(0, 2).map(id => t(`genre.${id}`)))
const label = computed(() =>
  props.flipped ? props.film.title : t('card.flipLabel', { runtime: runtime.value, genres: genres.value.join(', ') }))
</script>

<template>
  <button
    ref="el"
    type="button"
    class="card"
    :class="{ flipped, dealt }"
    :style="{ '--g': genreColor(film.genreIds) }"
    :aria-label="label"
    @click="$emit('flip')"
    @pointermove="follow($event, el)"
    @touchmove.passive="follow($event, el)"
  >
    <span class="tilt">
      <span class="inner">
        <span class="face back">
          <span class="ticket">
            <span class="band">{{ t('card.admit') }}</span>
            <span class="runtime">
              <small>{{ t('card.runtime') }}</small>
              <strong>{{ runtime }}</strong>
            </span>
            <span class="genres">
              <span v-for="g in genres" :key="g" class="chip">{{ g }}</span>
            </span>
            <span class="serial">{{ t('card.serial', { n: ticketSerial(film.slug) }) }}</span>
          </span>
          <span class="holo soft" />
        </span>
        <span class="face front">
          <img v-if="film.poster" :src="film.poster" :alt="film.title">
          <span v-else class="no-poster">{{ film.title }}</span>
          <span class="holo" />
          <span class="glare" />
        </span>
      </span>
    </span>
  </button>
</template>

<style scoped>
.card {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 2 / 3;
  padding: 0;
  border: 0;
  background: none;
  perspective: 900px;
  user-select: none;
  -webkit-user-select: none;
}
.dealt { animation: deal 0.65s cubic-bezier(0.2, 0.9, 0.3, 1.25) both; }
@keyframes deal { from { transform: translateY(-80px) scale(0.45) rotate(-10deg); opacity: 0; } }
.tilt, .inner, .face { position: absolute; inset: 0; }
.tilt {
  transform-style: preserve-3d;
  transform: rotateX(calc((var(--hy, 0.5) - 0.5) * -12deg)) rotateY(calc((var(--hx, 0.5) - 0.5) * 16deg));
  transition: transform 0.15s linear;
}
.inner { transform-style: preserve-3d; transition: transform 0.85s cubic-bezier(0.2, 0.9, 0.25, 1.12); }
.flipped .inner { transform: rotateY(180deg); }
.face { display: block; overflow: hidden; border-radius: 10px; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.back {
  -webkit-mask: radial-gradient(circle at 0 64%, #0000 7px, #000 7.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 64%, #0000 7px, #000 7.5px) right / 51% 100% no-repeat;
  mask: radial-gradient(circle at 0 64%, #0000 7px, #000 7.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 64%, #0000 7px, #000 7.5px) right / 51% 100% no-repeat;
}
.front { transform: rotateY(180deg); background: #111; }
.front img { display: block; width: 100%; height: 100%; object-fit: cover; }
.no-poster {
  display: grid;
  place-items: center;
  height: 100%;
  padding: 10px;
  font: 400 15px / 1.2 var(--display);
  color: var(--bulb);
  text-align: center;
  background: linear-gradient(var(--g), #1a0a0c);
}
.ticket { display: flex; flex-direction: column; height: 100%; background: var(--paper); color: var(--ink); }
.band {
  padding: 7px;
  background: var(--g);
  color: #fff;
  font-weight: 700;
  font-size: 7.5px;
  letter-spacing: 0.16em;
  text-align: center;
  text-transform: uppercase;
}
.runtime {
  flex: 1;
  display: grid;
  place-content: center;
  gap: 4px;
  text-align: center;
  border-bottom: 2px dashed rgb(43 26 18 / 0.35);
}
.runtime small { font-size: 8px; letter-spacing: 0.22em; text-transform: uppercase; }
.runtime strong { font: 400 22px / 1 var(--display); }
.genres { display: flex; flex-wrap: wrap; justify-content: center; gap: 3px; padding: 7px 5px 4px; min-height: 27px; }
.chip { padding: 2px 4px; border: 1px solid currentColor; border-radius: 3px; font-weight: 700; font-size: 9px; white-space: nowrap; }
.serial { padding-bottom: 7px; font-size: 8px; letter-spacing: 0.12em; text-align: center; color: var(--rust); }

@media (prefers-reduced-motion: reduce) {
  .tilt { transform: none; }
}
</style>
