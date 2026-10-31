import { useEffect, useState } from 'react'

// Returns [ref, inView]. By default flips to true once, the first time the element is visible.
// With `once: false` it tracks visibility continuously (used to pause looping animations off-screen).
// `ref` is a callback ref, so elements that mount later (e.g. after a resize) are still observed.
export function useInView(threshold = 0.2, { once = true } = {}) {
  const [el, ref] = useState(null)
  const [inView, setInView] = useState(() => !('IntersectionObserver' in window))

  useEffect(() => {
    if (!el || !('IntersectionObserver' in window)) return undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [el, threshold, once])

  return [ref, inView]
}
