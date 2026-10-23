<script setup lang="ts">
import gsap from 'gsap'
import type { Film } from '#shared/types/film'

const props = defineProps<{ films: Film[] }>()
const emit = defineEmits<{ tick: [] }>()

const viewport = ref<HTMLElement>()
const track = ref<HTMLElement>()
const strip = ref<Film[]>([])
const hitIndex = ref(-1)

// Position de la bande en pixels, animée par GSAP hors de la réactivité Vue.
const pos = { x: 0 }
let step = 0
let cardWidth = 0
let viewportWidth = 0

const randomFilms = (n: number) =>
  Array.from({ length: n }, () => props.films[Math.floor(Math.random() * props.films.length)]!)
const centerX = (i: number) => i * step + cardWidth / 2 - viewportWidth / 2
const indexAtCenter = () => Math.floor((pos.x + viewportWidth / 2) / step)
const nearestIndex = () => Math.round((pos.x + viewportWidth / 2 - cardWidth / 2) / step)

function render() {
  if (track.value) track.value.style.transform = `translate3d(${-pos.x}px, 0, 0)`
}

function measure() {
  const [first, second] = track.value!.children as HTMLCollectionOf<HTMLElement>
  cardWidth = first!.offsetWidth
  step = second!.offsetLeft - first!.offsetLeft
  viewportWidth = viewport.value!.clientWidth
}

function recenter() {
  const i = nearestIndex()
  measure()
  pos.x = centerX(i)
  render()
}

onMounted(async () => {
  strip.value = randomFilms(41)
  await nextTick()
  measure()
  pos.x = centerX(20)
  render()
  addEventListener('resize', recenter)
})
onBeforeUnmount(() => removeEventListener('resize', recenter))

/** Fait défiler la roue et s'arrête sur `target`, déjà tiré au sort par l'appelant. */
async function spin(target: Film) {
  hitIndex.value = -1
  // La nouvelle bande commence par les tickets visibles, pour que son remplacement ne se voie pas.
  const current = nearestIndex()
  const from = Math.max(0, current - 8)
  const kept = strip.value.slice(from, current + 9)
  const fillers = randomFilms(36)
  strip.value = [...kept, ...fillers, target, ...randomFilms(8)]
  await nextTick()
  pos.x -= from * step
  render()

  const targetIndex = kept.length + fillers.length
  let lastIndex = indexAtCenter()
  const onUpdate = () => {
    render()
    const i = indexAtCenter()
    if (i !== lastIndex) {
      lastIndex = i
      emit('tick')
    }
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  // On s'arrête un peu à côté du centre, comme un vrai case opening, puis on recentre.
  const offset = (Math.random() - 0.5) * cardWidth * 0.7
  await gsap.to(pos, { x: centerX(targetIndex) + offset, duration: reduced ? 0.9 : 3, ease: 'power3.out', onUpdate })
  await gsap.to(pos, { x: centerX(targetIndex), duration: 0.38, ease: 'power2.inOut', onUpdate })
  hitIndex.value = targetIndex
}

defineExpose({ spin })
</script>

<template>
  <section ref="viewport" class="wheel" aria-hidden="true">
    <div ref="track" class="track">
      <div
        v-for="(film, i) in strip"
        :key="i"
        class="ticket"
        :class="{ hit: i === hitIndex }"
        :style="{ '--g': genreColor(film.genreIds) }"
      >
        <!-- Squelette illisible qui imite le dos d'un ticket tiré : « Entrée », durée, 2 genres, numéro. -->
        <i class="sk band" /><i class="sk label" /><i class="sk rt" />
        <i class="sk chip" /><i class="sk chip two" /><i class="sk serial" />
      </div>
    </div>
    <i class="pointer top" />
    <i class="pointer bottom" />
  </section>
</template>

<style scoped>
.wheel {
  position: relative;
  overflow: hidden;
  background: linear-gradient(#1a0709, #3a0f18 50%, #1a0709);
  border-block: 3px solid var(--gold);
  touch-action: pan-y;
}
.wheel::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, #1a0709, transparent 20%, transparent 80%, #1a0709);
}
.track { position: relative; display: flex; gap: 8px; padding-block: 14px; will-change: transform; }
.ticket {
  position: relative;
  flex: 0 0 64px;
  height: 96px;
  border-radius: 6px;
  background: linear-gradient(var(--g) 0 34%, var(--paper) 34%);
  -webkit-mask: radial-gradient(circle at 0 62%, #0000 5px, #000 5.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 62%, #0000 5px, #000 5.5px) right / 51% 100% no-repeat;
  mask: radial-gradient(circle at 0 62%, #0000 5px, #000 5.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 62%, #0000 5px, #000 5.5px) right / 51% 100% no-repeat;
  transition: transform 0.3s, filter 0.3s;
}
.ticket.hit { transform: scale(1.12); filter: brightness(1.2); }
.sk { position: absolute; left: 50%; transform: translateX(-50%); border-radius: 2px; background: rgb(43 26 18 / 0.2); }
.sk.band { top: 14%; width: 44%; height: 3px; background: rgb(255 255 255 / 0.55); }
.sk.label { top: 41%; width: 34%; height: 2px; }
.sk.rt { top: 47%; width: 62%; height: 9px; background: rgb(43 26 18 / 0.32); }
.sk.chip { top: 74%; left: 32%; width: 30%; height: 7px; background: none; border: 1px solid rgb(43 26 18 / 0.3); }
.sk.chip.two { left: 68%; }
.sk.serial { top: 88%; width: 40%; height: 2px; background: rgb(138 42 26 / 0.35); }
.pointer {
  position: absolute;
  left: 50%;
  z-index: 2;
  width: 0;
  height: 0;
  transform: translateX(-50%);
  border: 9px solid transparent;
}
.pointer.top { top: 0; border-top-color: var(--bulb); }
.pointer.bottom { bottom: 0; border-bottom-color: var(--bulb); }
</style>
