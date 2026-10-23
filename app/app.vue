<script setup lang="ts">
const { locale } = useI18n()
useHead({ htmlAttrs: { lang: locale } })

onMounted(() => useHolo().init())
</script>

<template>
  <NuxtPwaManifest />
  <NuxtPage />
</template>
