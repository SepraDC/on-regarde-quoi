<script setup lang="ts">
const { locale, setLocale } = useI18n()
</script>

<template>
  <button
    type="button"
    class="text-btn"
    :lang="locale === 'fr' ? 'en' : 'fr'"
    @click="setLocale(locale === 'fr' ? 'en' : 'fr')"
  >
    {{ locale === 'fr' ? 'English' : 'Français' }}
  </button>
</template>
