import { useEffect } from 'react'

// Page-wide scroll motion, set up once:
//  • [data-reveal]   fades and lifts into place the first time it enters the viewport.
//                    Optional style="--d: 120ms" staggers it.
//  • [data-parallax] drifts by `value × distance from viewport centre` (desktop only).
// New nodes (e.g. the mobile project list) are picked up by a MutationObserver.
export function useMotion() {
  useEffect(() => {
    const root = document.documentElement
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) return undefined

    root.classList.add('motion')

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )

    // Parallax: only elements near the viewport are updated each frame.
    const wide = window.matchMedia('(min-width: 900px)')
    const visible = new Set()
    const pio = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))),
      { rootMargin: '20% 0px' },
    )

    // Tracked per effect run (not with DOM markers) so a remount re-observes everything.
    const seen = new WeakSet()
    const scan = () => {
      document.querySelectorAll('[data-reveal]:not(.is-revealed), [data-parallax]').forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        if (el.hasAttribute('data-reveal') && !el.classList.contains('is-revealed')) io.observe(el)
        if (el.hasAttribute('data-parallax')) pio.observe(el)
      })
    }
    scan()

    // Only rescan when elements are added (the split-flap board changes text constantly), at most once a frame.
    let scanRaf = 0
    const mo = new MutationObserver((records) => {
      if (scanRaf || !records.some((r) => Array.from(r.addedNodes).some((n) => n.nodeType === 1))) return
      scanRaf = requestAnimationFrame(() => {
        scanRaf = 0
        scan()
      })
    })
    mo.observe(document.getElementById('root') || document.body, { childList: true, subtree: true })

    let raf = 0
    const frame = () => {
      raf = 0
      const vh = window.innerHeight
      visible.forEach((el) => {
        if (!wide.matches) {
          el.style.removeProperty('--py')
          return
        }
        const r = el.getBoundingClientRect()
        const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax || '0')
        el.style.setProperty('--py', `${offset.toFixed(1)}px`)
      })
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()

    return () => {
      io.disconnect()
      pio.disconnect()
      mo.disconnect()
      cancelAnimationFrame(raf)
      cancelAnimationFrame(scanRaf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      root.classList.remove('motion')
    }
  }, [])
}
