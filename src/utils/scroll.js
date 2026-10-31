import { navigate } from './router.js'

// Eased, interruptible section scrolling that lands below the floating nav.

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const easeInOutQuart = (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2)

let raf = 0
let cancelCurrent = null

function navOffset() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
  return (parseFloat(v) || 88) + 8
}

export function scrollToY(y, { onDone } = {}) {
  cancelCurrent?.()
  const max = document.documentElement.scrollHeight - window.innerHeight
  const target = Math.max(0, Math.min(max, y))
  const start = window.scrollY
  const dist = target - start

  if (reduced() || Math.abs(dist) < 2) {
    window.scrollTo(0, target)
    onDone?.()
    return
  }

  // Longer trips take a little longer, but never drag.
  const duration = Math.min(1300, Math.max(550, Math.abs(dist) * 0.32))
  const t0 = performance.now()
  const root = document.documentElement
  const prevBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'

  const stop = () => {
    cancelAnimationFrame(raf)
    raf = 0
    root.style.scrollBehavior = prevBehavior
    window.removeEventListener('wheel', stop)
    window.removeEventListener('touchstart', stop)
    window.removeEventListener('keydown', stop)
    cancelCurrent = null
  }
  // Any user input takes back control immediately.
  window.addEventListener('wheel', stop, { passive: true })
  window.addEventListener('touchstart', stop, { passive: true })
  window.addEventListener('keydown', stop)
  cancelCurrent = stop

  const tick = (now) => {
    const t = Math.min(1, (now - t0) / duration)
    window.scrollTo(0, start + dist * easeInOutQuart(t))
    if (t < 1) {
      raf = requestAnimationFrame(tick)
    } else {
      stop()
      onDone?.()
    }
  }
  raf = requestAnimationFrame(tick)
}

export function scrollToEl(el, { focus = false } = {}) {
  if (!el) return
  const y = el.id === 'home' ? 0 : el.getBoundingClientRect().top + window.scrollY - navOffset()
  scrollToY(y, {
    onDone: () => {
      if (!focus) return
      // Move keyboard focus to the section without another jump.
      const heading = el.querySelector('h1, h2') || el
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
      heading.focus({ preventScroll: true })
    },
  })
}

export function scrollToId(id, options) {
  scrollToEl(document.getElementById(id), options)
}

export function handleAnchorClick(event, id) {
  event.preventDefault()
  // From another page, go home first; App scrolls to the section once it renders.
  if (window.location.pathname.replace(/\/+$/, '') !== '') {
    navigate('/', { scrollTo: id })
    return
  }
  // Keyboard activation moves focus too; mouse clicks keep it where it is.
  scrollToId(id, { focus: event.detail === 0 })
}
