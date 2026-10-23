<script setup lang="ts">
const props = defineProps<{ initialUrl?: string, error?: string | null }>()
const emit = defineEmits<{ submit: [url: string] }>()

const url = ref(props.initialUrl ?? '')
const canPaste = ref(false)

onMounted(() => {
  canPaste.value = typeof navigator.clipboard?.readText === 'function'
})

async function paste() {
  try {
    url.value = (await navigator.clipboard.readText()).trim()
  }
  catch {}
}

function submit() {
  if (url.value.trim()) emit('submit', url.value.trim())
}
</script>

<template>
  <form class="list-form" @submit.prevent="submit">
    <label for="list-url">{{ $t('form.label') }}</label>
    <div class="field">
      <input
        id="list-url"
        v-model="url"
        type="text"
        inputmode="url"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        :placeholder="$t('form.placeholder')"
        :aria-invalid="!!error"
        aria-describedby="list-url-help"
      >
      <button v-if="canPaste" type="button" class="paste" @click="paste">
        {{ $t('form.paste') }}
      </button>
    </div>
    <p v-if="error" class="error" role="alert">
      {{ error }}
    </p>
    <button class="brass" type="submit" :disabled="!url.trim()">
      {{ $t('form.submit') }}
    </button>
    <p id="list-url-help" class="help">
      {{ $t('form.help') }}
    </p>
  </form>
</template>

<style scoped>
.list-form { display: flex; flex-direction: column; gap: 14px; }
label { font-weight: 700; font-size: 14px; }
.field {
  display: flex;
  align-items: stretch;
  border-radius: 10px;
  overflow: hidden;
  background: var(--paper);
  box-shadow: inset 0 0 0 2px var(--gold);
}
input {
  flex: 1;
  min-width: 0;
  border: 0;
  padding: 14px 12px;
  background: transparent;
  color: var(--ink);
  font: 16px var(--body);
}
input:focus { outline: none; }
.field:focus-within { box-shadow: inset 0 0 0 3px var(--bulb); }
.paste {
  border: 0;
  border-left: 2px dashed rgb(43 26 18 / 0.35);
  padding: 0 14px;
  background: transparent;
  color: var(--rust);
  font-weight: 700;
  font-size: 14px;
}
.error {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgb(138 42 26 / 0.35);
  border: 1px solid var(--rust);
  font-size: 14px;
  line-height: 1.45;
}
.help { margin: 0; font-size: 13px; line-height: 1.5; opacity: 0.75; text-align: center; }
</style>
