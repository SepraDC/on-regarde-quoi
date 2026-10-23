<script setup lang="ts">
defineProps<{ kicker: string }>()
</script>

<template>
  <header class="marquee">
    <div class="marquee-in">
      <p class="kicker">{{ kicker }}</p>
      <h1>{{ $t('app.name') }}</h1>
    </div>
  </header>
</template>

<style scoped>
.marquee {
  border-radius: 18px;
  padding: 10px;
  background: radial-gradient(circle, var(--bulb) 0 3px, transparent 3.6px) 0 0 / 16px 16px, #7a2a1a;
  box-shadow: 0 0 34px rgb(255 200 120 / 0.28);
  animation: chase 1s steps(2) infinite;
}
@keyframes chase { to { background-position: 8px 0, 0 0; } }
.marquee-in {
  border-radius: 10px;
  padding: 14px 12px 16px;
  text-align: center;
  background: #1a0a0c;
  box-shadow: inset 0 0 0 2px var(--gold);
}
.kicker {
  margin: 0;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold);
}
h1 {
  margin: 6px 0 0;
  font: 400 clamp(30px, 10vw, 44px) / 1.05 var(--display);
  color: var(--bulb);
  text-shadow: 0 0 12px rgb(255 210 120 / 0.6);
  text-wrap: balance;
}
</style>
