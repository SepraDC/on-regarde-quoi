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

/** Bruit court passé dans un filtre passe-bande : crans et verrou du réglage de durée. */
function noise(duration: number, freq: number, q: number, volume: number, delay = 0) {
  if (muted.value || !ctx) return
  const t = ctx.currentTime + delay
  const length = Math.ceil(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3
  const source = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  filter.type = 'bandpass'
  filter.frequency.value = freq
  filter.Q.value = q
  gain.gain.value = volume
  source.buffer = buffer
  source.connect(filter).connect(gain).connect(ctx.destination)
  source.start(t)
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
    /** Cliquet : `steps` crans, puis un verrou (`lock`) ou, en relâchant, un petit ressort. */
    ratchet(steps: number, lock: boolean) {
      const gap = 0.07
      for (let i = 0; i < steps; i++) {
        const pitch = lock ? 3200 - i * 350 : 2400 + i * 350
        noise(0.03, pitch, 6, 0.9, i * gap)
        blip(pitch / 2, 0.02, 'square', 0.02, i * gap)
      }
      const end = steps * gap + 0.02
      const clicks = Array.from({ length: steps }, () => [6, 60]).flat()
      if (lock) {
        noise(0.09, 420, 2, 1.4, end)
        blip(140, 0.18, 'sine', 0.22, end)
        blip(1900, 0.25, 'triangle', 0.025, end + 0.01)
        vibrate([...clicks, 35])
      }
      else {
        noise(0.12, 1600, 1, 0.5, end)
        blip(260, 0.12, 'sine', 0.08, end)
        vibrate([...clicks, 15])
      }
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
