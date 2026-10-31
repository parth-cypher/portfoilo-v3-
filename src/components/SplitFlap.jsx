import { useEffect, useRef } from 'react'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

// A row of split-flap cells. When `run` is true the cells spin through random
// characters and settle left to right, like a station departure board.
export default function SplitFlap({ text, cells, run, delay = 0, className = '' }) {
  const ref = useRef(null)
  const target = text.padEnd(cells, ' ').slice(0, cells)

  useEffect(() => {
    const root = ref.current
    if (!root || !run) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const nodes = Array.from(root.children)
    const start = performance.now()
    const settleAt = nodes.map((_, i) => delay + i * 34 + Math.random() * 160 + 220)
    let last = 0
    let raf = 0

    const tick = (now) => {
      const t = now - start
      if (now - last < 55) {
        raf = requestAnimationFrame(tick)
        return
      }
      last = now
      let busy = false
      nodes.forEach((node, i) => {
        if (t < delay) {
          busy = true
          return
        }
        if (t < settleAt[i]) {
          busy = true
          node.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0]
          node.classList.add('is-flipping')
        } else {
          node.textContent = target[i] === ' ' ? ' ' : target[i]
          node.classList.remove('is-flipping')
        }
      })
      if (busy) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      nodes.forEach((node, i) => {
        node.textContent = target[i] === ' ' ? ' ' : target[i]
        node.classList.remove('is-flipping')
      })
    }
  }, [run, target, delay])

  return (
    <span ref={ref} className={`flap ${className}`} aria-hidden="true">
      {Array.from(target).map((ch, i) => (
        <span key={i} className="flap__cell">
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}
