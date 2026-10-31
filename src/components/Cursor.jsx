import { useEffect, useRef } from 'react'

const SEGMENTS = 7
const INTERACTIVE = 'a, button, [role="button"], summary, label'

// Inkflow: seven segments share one pointer position (--x, --y). The lead segment
// snaps to it; each following segment has a longer CSS transition, so the trail
// smears behind like ink. JS only writes --x, --y, --angle and --speed and toggles
// state classes; all trailing motion is CSS.
//
// The same pointer listener also drives [data-magnetic] buttons and [data-tilt] cards.
// Desktop only: the native cursor is hidden (html.has-cursor) only after this has
// received a real pointer move, so it stays usable if anything here fails.
export default function Cursor() {
  const rootRef = useRef(null)
  const wordRef = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const root = rootRef.current
    const word = wordRef.current
    if (!fine.matches || reduce.matches || !root || !word) return undefined

    const html = document.documentElement
    let x = 0
    let y = 0
    let lastX = 0
    let lastY = 0
    let lastT = 0
    let angle = 0 // unwrapped, so the trail never spins the long way round
    let speed = 0
    let target = 0 // speed measured from the latest move
    let raf = 0
    let state = ''
    let magnet = null
    let tilt = null

    const write = () => {
      raf = 0
      // Ease speed toward the measured value, then let it decay once the pointer rests.
      speed += (target - speed) * 0.35
      target *= 0.82
      root.style.setProperty('--x', x.toFixed(1))
      root.style.setProperty('--y', y.toFixed(1))
      root.style.setProperty('--angle', `${angle.toFixed(1)}deg`)
      root.style.setProperty('--speed', speed < 0.005 ? '0' : speed.toFixed(3))
      if (speed > 0.005 || target > 0.005) raf = requestAnimationFrame(write)
    }

    const setState = (next, label = '') => {
      if (next === state) return
      root.classList.remove(`is-${state}`)
      if (next) root.classList.add(`is-${next}`)
      state = next
      if (label) word.textContent = label
    }

    const release = (el, props) => props.forEach((p) => el.style.removeProperty(p))

    const onMove = (e) => {
      const now = e.timeStamp || performance.now()
      x = e.clientX
      y = e.clientY

      if (!html.classList.contains('has-cursor')) {
        // First move: jump everything into place without a trail sweeping in from the corner.
        root.classList.add('is-snap')
        lastX = x
        lastY = y
        lastT = now
        root.style.setProperty('--x', x.toFixed(1))
        root.style.setProperty('--y', y.toFixed(1))
        html.classList.add('has-cursor')
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('is-snap')))
      }
      root.classList.add('is-active')

      const dx = x - lastX
      const dy = y - lastY
      const dist = Math.hypot(dx, dy)
      if (dist > 0.5) {
        const a = (Math.atan2(dy, dx) * 180) / Math.PI
        // shortest turn from the current heading to the new one, in (-180, 180]
        angle += ((((a - angle + 180) % 360) + 360) % 360) - 180
        const dt = Math.max(8, now - lastT)
        target = Math.max(target, Math.min(1, dist / dt / 2.2)) // ~2.2px/ms counts as "fast"
      }
      lastX = x
      lastY = y
      lastT = now
      if (!raf) raf = requestAnimationFrame(write)

      const el = e.target instanceof Element ? e.target : null

      // Interaction states, most specific first.
      const view = el?.closest('[data-cursor="view"]')
      if (view) setState('view', view.dataset.cursorLabel || 'View ↗')
      else if (el?.closest('.nav__links a, .indicator a')) setState('nav')
      else if (el?.closest(INTERACTIVE)) setState('near')
      else setState('')
      root.classList.toggle('is-dark', !!el?.closest('[data-cursor-dark]'))

      // Magnetic pull
      const m = el?.closest('[data-magnetic]')
      if (m !== magnet) {
        if (magnet) release(magnet, ['--mx', '--my'])
        magnet = m
      }
      if (magnet) {
        const r = magnet.getBoundingClientRect()
        const strength = parseFloat(magnet.dataset.magnetic) || 0.25
        magnet.style.setProperty('--mx', `${((x - (r.left + r.width / 2)) * strength).toFixed(2)}px`)
        magnet.style.setProperty('--my', `${((y - (r.top + r.height / 2)) * strength).toFixed(2)}px`)
      }

      // Restrained 3D tilt
      const t = el?.closest('[data-tilt]')
      if (t !== tilt) {
        if (tilt) release(tilt, ['--rx', '--ry', '--gx', '--gy'])
        tilt = t
      }
      if (tilt) {
        const r = tilt.getBoundingClientRect()
        const px = (x - r.left) / r.width
        const py = (y - r.top) / r.height
        const max = parseFloat(tilt.dataset.tilt) || 4
        tilt.style.setProperty('--rx', `${((0.5 - py) * max).toFixed(2)}deg`)
        tilt.style.setProperty('--ry', `${((px - 0.5) * max).toFixed(2)}deg`)
        tilt.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`)
        tilt.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`)
      }
    }

    const onDown = () => root.classList.add('is-down')
    const onUp = () => root.classList.remove('is-down')
    const onLeave = () => root.classList.remove('is-active')

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)

    // Switching to touch or turning on reduced motion hands the native cursor back.
    const onChange = () => {
      if (!fine.matches || reduce.matches) {
        html.classList.remove('has-cursor')
        root.classList.remove('is-active')
      }
    }
    fine.addEventListener('change', onChange)
    reduce.addEventListener('change', onChange)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      fine.removeEventListener('change', onChange)
      reduce.removeEventListener('change', onChange)
      if (magnet) release(magnet, ['--mx', '--my'])
      if (tilt) release(tilt, ['--rx', '--ry', '--gx', '--gy'])
      html.classList.remove('has-cursor')
    }
  }, [])

  return (
    <div ref={rootRef} className="cur cur-paint" data-cursor="paint" role="img" aria-label="Inkflow cursor demo" aria-hidden="true">
      <span className="cur-hint mono" aria-hidden="true">
        hover
      </span>
      <span ref={wordRef} className="cur-word" aria-hidden="true" />
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <i key={i} className="cursor" style={{ '--i': i }} />
      ))}
    </div>
  )
}
