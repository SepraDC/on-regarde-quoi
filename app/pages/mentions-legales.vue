<script setup lang="ts">
const { t } = useI18n()
useHead({ title: () => `${t('legal.title')} · ${t('app.name')}` })
</script>

<template>
  <main class="screen legal">
    <NuxtLink to="/" class="back">
      ← {{ t('legal.back') }}
    </NuxtLink>
    <h1>{{ t('legal.title') }}</h1>

    <section>
      <h2>{{ t('legal.publisher.title') }}</h2>
      <i18n-t keypath="legal.publisher.body" tag="p" scope="global">
        <template #name>
          <a href="https://github.com/SepraDC" target="_blank" rel="noopener">SepraDC</a>
        </template>
      </i18n-t>
    </section>

    <section>
      <h2>{{ t('legal.hosting.title') }}</h2>
      <p>
        Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, {{ t('legal.hosting.country') }}.
        <a href="https://vercel.com" target="_blank" rel="noopener">vercel.com</a>
      </p>
    </section>

    <section>
      <h2>{{ t('legal.data.title') }}</h2>
      <a class="tmdb" href="https://www.themoviedb.org" target="_blank" rel="noopener">
        <img src="/tmdb-logo.svg" alt="The Movie Database (TMDB)" width="160" height="21">
      </a>
      <p>{{ t('footer.tmdb') }} {{ t('legal.data.tmdb') }}</p>
      <p>{{ t('legal.data.letterboxd') }}</p>
      <p>{{ t('legal.data.posters') }}</p>
    </section>

    <section>
      <h2>{{ t('legal.privacy.title') }}</h2>
      <p>{{ t('legal.privacy.body') }}</p>
      <ul>
        <li>{{ t('legal.privacy.list') }}</li>
        <li>{{ t('legal.privacy.draw') }}</li>
        <li>{{ t('legal.privacy.sound') }}</li>
        <li>{{ t('legal.privacy.lang') }}</li>
      </ul>
      <p>{{ t('legal.privacy.server') }}</p>
    </section>

    <footer class="footer">
      <LangToggle />
    </footer>
  </main>
</template>

<style scoped>
.legal { gap: 22px; line-height: 1.6; font-size: 14px; }
.back { align-self: flex-start; color: var(--gold); font-weight: 700; text-decoration: none; }
h1 { margin: 0; font: 400 32px / 1.1 var(--display); color: var(--bulb); text-wrap: balance; }
h2 { margin: 0 0 6px; font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); }
section { display: grid; gap: 8px; }
p, ul { margin: 0; max-width: 62ch; }
ul { padding-left: 1.2em; }
a { color: var(--bulb); }
.tmdb { justify-self: start; padding: 4px 0; }
.tmdb img { display: block; width: 160px; height: auto; }
.footer { margin-top: auto; display: flex; justify-content: center; }
</style>
