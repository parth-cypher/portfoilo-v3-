import { useEffect, useState } from 'react'
import { route } from '../data/portfolio.js'

// Opening sequence: a fine line draws Chiplun → Karad → Pune, the name settles,
// then the curtain lifts to reveal the page.
export default function Loader({ onDone }) {
  const [phase, setPhase] = useState('draw')

  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    const lift = setTimeout(() => setPhase('lift'), 1500)
    const done = setTimeout(() => {
      root.style.overflow = previous
      onDone()
    }, 2300)
    return () => {
      clearTimeout(lift)
      clearTimeout(done)
      root.style.overflow = previous
    }
  }, [onDone])

  return (
    <div className={`loader loader--${phase}`} aria-hidden="true">
      <div className="loader__inner">
        <div className="loader__route">
          <span className="loader__rail" />
          {route.map((stop, i) => (
            <span
              key={stop.place}
              className={`loader__stop ${stop.state === 'current' ? 'is-current' : ''}`}
              style={{ left: `${(i / (route.length - 1)) * 100}%`, animationDelay: `${200 + i * 300}ms` }}
            >
              <i />
              <b>{stop.place}</b>
            </span>
          ))}
        </div>
        <p className="loader__name">Parth P Patil</p>
      </div>
    </div>
  )
}
