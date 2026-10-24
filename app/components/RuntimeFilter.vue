<script setup lang="ts">
import type { Film } from '#shared/types/film'

const props = defineProps<{ films: Film[], disabled: boolean }>()
const model = defineModel<RuntimeLimit>({ required: true })

const { t } = useI18n()
const { unlock, ratchet } = useSound()

const options = computed(() => RUNTIME_LIMITS.map(limit => ({
  limit,
  label: limit === null ? t('filter.all') : t(`filter.max${limit}`),
  empty: !props.films.some(f => fitsRuntime(f, limit)),
})))

// Le son ne se joue qu'au toucher : remettre le filtre à zéro (« Recommencer », réouverture) reste silencieux.
function pick(limit: RuntimeLimit) {
  if (limit === model.value) return
  unlock()
  const steps = Math.abs(RUNTIME_LIMITS.indexOf(limit) - RUNTIME_LIMITS.indexOf(model.value))
  ratchet(steps, limit !== null)
  model.value = limit
}
</script>

<template>
  <div class="filter" role="radiogroup" :aria-label="t('filter.label')">
    <span class="kicker">{{ t('filter.label') }}</span>
    <button
      v-for="o in options"
      :key="String(o.limit)"
      type="button"
      role="radio"
      class="stub"
      :class="{ on: model === o.limit }"
      :aria-checked="model === o.limit"
      :disabled="disabled || o.empty"
      @click="pick(o.limit)"
    >
      {{ o.label }}
    </button>
  </div>
</template>

<style scoped>
.filter { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 4px; }
.kicker { margin-right: 4px; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.6; }
.stub {
  border: 1px dashed rgb(217 169 69 / 0.4);
  border-radius: 4px;
  background: none;
  padding: 2px 7px;
  font: 400 13px var(--display);
  color: rgb(243 231 207 / 0.65);
}
.stub.on { border-style: solid; border-color: var(--gold); background: rgb(217 169 69 / 0.15); color: var(--bulb); }
.stub:disabled { opacity: 0.35; }
.stub.on:disabled { opacity: 0.7; }
</style>
