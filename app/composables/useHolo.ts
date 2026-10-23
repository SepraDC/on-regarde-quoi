// Reflet holographique des cartes, piloté par les variables CSS --hx / --hy (0 → 1).
// Avec le gyroscope, elles sont posées sur <html> et valent pour toutes les cartes ;
// sans gyroscope, chaque carte suit le doigt.

type OrientationWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

const gyroActive = ref(false)
let listening = false
let asked = false

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function onOrientation(e: DeviceOrientationEvent) {
  if (e.gamma === null || e.beta === null) return
  gyroActive.value = true
  const style = document.documentElement.style
  style.setProperty('--hx', clamp01((e.gamma + 25) / 50).toFixed(3))
  style.setProperty('--hy', clamp01((e.beta - 20) / 50).toFixed(3))
}

function listen() {
  if (listening) return
  listening = true
  addEventListener('deviceorientation', onOrientation)
}

function permissionApi() {
  if (typeof DeviceOrientationEvent === 'undefined') return undefined
  return (DeviceOrientationEvent as OrientationWithPermission).requestPermission
}

export function useHolo() {
  /** Au montage : Android et les autres navigateurs donnent le gyroscope sans autorisation. */
  function init() {
    if (typeof DeviceOrientationEvent !== 'undefined' && !permissionApi()) listen()
  }

  /** Dans un geste (tap sur « Tourner la roue ») : iOS demande l'autorisation une seule fois. */
  function requestGyro() {
    const request = permissionApi()
    if (!request || asked) return
    asked = true
    request.call(DeviceOrientationEvent).then((state) => {
      if (state === 'granted') listen()
    }).catch(() => {})
  }

  function follow(e: PointerEvent | TouchEvent, el: HTMLElement | undefined) {
    if (gyroActive.value || !el) return
    const point = 'touches' in e ? e.touches[0] : e
    if (!point) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--hx', clamp01((point.clientX - rect.left) / rect.width).toFixed(3))
    el.style.setProperty('--hy', clamp01((point.clientY - rect.top) / rect.height).toFixed(3))
  }

  return { init, requestGyro, follow }
}
