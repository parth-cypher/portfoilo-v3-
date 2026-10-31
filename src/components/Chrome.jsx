import { useRef } from 'react'
import { useScrollFrame } from '../hooks/useScrollFrame.js'
import { handleAnchorClick } from '../utils/scroll.js'

// Hairline progress bar pinned to the very top of the window.
export function ScrollProgress() {
  const ref = useRef(null)
  useScrollFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
    ref.current?.style.setProperty('--p', p.toFixed(4))
  })
  return <div className="progress" ref={ref} aria-hidden="true" />
}

// Small fixed index on wide screens: which section you are in, and a quick way to jump.
export function SectionIndicator({ sections, active }) {
  return (
    <nav className="indicator" aria-label="Section index">
      <ol>
        {sections.map((s, i) => (
          <li key={s.id} className={i === active ? 'is-active' : ''}>
            <a href={`#${s.id}`} onClick={(e) => handleAnchorClick(e, s.id)} aria-current={i === active ? 'location' : undefined}>
              <span className="indicator__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="indicator__label">{s.label}</span>
              <i aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
