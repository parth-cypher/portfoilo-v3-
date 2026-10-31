import { useEffect, useRef } from 'react'

// Calls `onFrame` at most once per animation frame while the page scrolls or resizes.
// The callback lives in a ref, so it can read fresh props without re-subscribing.
export function useScrollFrame(onFrame) {
  const cb = useRef(onFrame)

  useEffect(() => {
    cb.current = onFrame
  })

  useEffect(() => {
    let raf = 0
    const run = () => {
      raf = 0
      cb.current()
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(run)
    }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])
}
