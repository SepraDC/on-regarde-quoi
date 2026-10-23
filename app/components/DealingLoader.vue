<template>
  <div class="loader" role="status">
    <div class="deal" aria-hidden="true">
      <span v-for="i in 3" :key="i" class="ticket" :style="{ '--i': i - 2, 'animationDelay': `${i * 0.18}s` }" />
    </div>
    <p class="title">
      {{ $t('loading.title') }}
    </p>
    <p class="note">
      {{ $t('loading.note') }}
    </p>
  </div>
</template>

<style scoped>
.loader { display: flex; flex-direction: column; align-items: center; gap: 10px; padding-top: 24px; text-align: center; }
.deal { position: relative; width: 200px; height: 110px; }
.ticket {
  position: absolute;
  left: calc(50% - 28px);
  top: 10px;
  width: 56px;
  height: 84px;
  border-radius: 6px;
  background: linear-gradient(var(--gold) 0 30%, var(--paper) 30%);
  box-shadow: 0 8px 18px rgb(0 0 0 / 0.4);
  animation: deal 1.8s cubic-bezier(0.2, 0.9, 0.3, 1.2) infinite both;
}
@keyframes deal {
  0% { transform: translateY(-70px) rotate(-25deg); opacity: 0; }
  30%, 80% { transform: translateX(calc(var(--i) * 64px)) rotate(calc(var(--i) * 6deg)); opacity: 1; }
  100% { transform: translateX(calc(var(--i) * 64px)) translateY(20px); opacity: 0; }
}
.title { margin: 0; font: 400 22px var(--display); color: var(--bulb); }
.note { margin: 0; max-width: 30ch; font-size: 13px; line-height: 1.5; opacity: 0.7; }
</style>
