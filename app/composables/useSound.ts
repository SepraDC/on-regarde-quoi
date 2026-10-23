// Sons synthétisés (aucun fichier audio) et vibrations. iOS ne vibre pas depuis le web : `vibrate` y est absent.

const muted = ref(false)
let ctx: AudioContext | null = null
let settingsLoaded = false

function vibrate(pattern: number | number[]) {
  navigator.vibrate?.(pattern)
}

function blip(freq: number, duration: number, type: OscillatorType, volume: number, delay = 0) {
  if (muted.value || !ctx) return
  const t = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + duration + 0.02)
}

export function useSound() {
  if (import.meta.client && !settingsLoaded) {
    settingsLoaded = true
    muted.value = readSetting('muted') === '1'
  }

  /** À appeler dans un geste : les navigateurs ne jouent du son qu'après une interaction. */
  function unlock() {
    try {
      ctx ??= new AudioContext()
      void ctx.resume()
    }
    catch {}
  }

  function toggleMute() {
    muted.value = !muted.value
    writeSetting('muted', muted.value ? '1' : '0')
  }

  return {
    muted: readonly(muted),
    unlock,
    toggleMute,
    tick() {
      blip(2300, 0.025, 'square', 0.035)
      vibrate(5)
    },
    ding() {
      blip(880, 1.1, 'sine', 0.14)
      blip(1320, 0.9, 'sine', 0.07, 0.05)
      vibrate([25, 40, 60])
    },
    fanfare() {
      [523, 659, 784, 1047].forEach((f, i) => blip(f, 0.5, 'triangle', 0.09, i * 0.09))
      vibrate([40, 30, 40, 30, 90])
    },
    whoosh() {
      if (muted.value || !ctx) return
      const length = ctx.sampleRate * 0.35
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length)
      const source = ctx.createBufferSource()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      const t = ctx.currentTime
      filter.type = 'bandpass'
      filter.Q.value = 1.2
      filter.frequency.setValueAtTime(500, t)
      filter.frequency.exponentialRampToValueAtTime(2600, t + 0.3)
      gain.gain.value = 0.22
      source.buffer = buffer
      source.connect(filter).connect(gain).connect(ctx.destination)
      source.start()
    },
  }
}
