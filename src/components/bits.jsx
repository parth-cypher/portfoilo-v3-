import { useState } from 'react'
import { lines, statuses } from '../data/portfolio.js'

// A track name with its colour dot.
export function LineTag({ lineId, className = '' }) {
  const line = lines[lineId]
  return (
    <span className={`line-tag ${className}`}>
      <i style={{ background: line.color }} aria-hidden="true" />
      {line.name}
    </span>
  )
}

export function StatusPill({ status, note, tone = 'light' }) {
  const s = statuses[status]
  return (
    <span className={`status-pill status-pill--${status} status-pill--${tone}`}>
      <span className="status-pill__dot" aria-hidden="true" />
      {s.label}
      {note ? <span className="status-pill__note">{note}</span> : null}
    </span>
  )
}

// Portrait with a designed fallback: if the file is missing or fails to load,
// a monogram card takes its place instead of a broken image.
export function Portrait({ src, name }) {
  const [failed, setFailed] = useState(!src)
  const initials = name
    .split(' ')
    .filter((p) => p.length > 1)
    .map((p) => p[0])
    .join('')
  if (!failed) {
    return (
      <div className="portrait">
        <img src={src} alt={`Portrait of ${name}`} loading="lazy" decoding="async" onError={() => setFailed(true)} data-parallax="0.04" />
      </div>
    )
  }
  return (
    <div className="portrait portrait--fallback" role="img" aria-label={`${name}, monogram`}>
      <svg className="portrait__tracks" viewBox="0 0 400 500" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <path d="M-20 330 L120 330 L200 250" stroke="var(--data)" />
        <path d="M420 330 L280 330 L200 250" stroke="var(--ai)" />
        <path d="M-20 420 L110 420 L200 330" stroke="var(--sys)" opacity="0.7" />
        <path d="M420 420 L290 420 L200 330" stroke="var(--web)" opacity="0.7" />
        <path d="M200 520 L200 250" stroke="#ffffff" strokeOpacity="0.18" strokeDasharray="4 10" />
        <circle cx="200" cy="250" r="7" />
      </svg>
      <span className="portrait__mono">{initials}</span>
      <span className="portrait__caption">Pune, India</span>
    </div>
  )
}

// A generated cover for a project: its track drawn as a line with this project's stop lit,
// on a blueprint grid. Uses a real screenshot instead when one is set in the data file.
export function ProjectVisual({ station, index, count, className = '' }) {
  const line = lines[station.line]
  const [failed, setFailed] = useState(false)

  if (station.screenshot && !failed) {
    return (
      <div className={`visual visual--shot ${station.shotFit === 'contain' ? 'visual--contain' : ''} ${className}`} style={{ '--line': line.color }}>
        <img src={station.screenshot} alt={`Screenshot of ${station.title}`} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      </div>
    )
  }

  const stops = Math.max(count, 1)
  const xs = Array.from({ length: stops }, (_, i) => (stops === 1 ? 300 : 120 + (i * 360) / (stops - 1)))
  return (
    <div className={`visual ${className}`} style={{ '--line': line.color }} aria-hidden="true">
      <div className="visual__grid" />
      <svg className="visual__svg" viewBox="0 0 600 375" preserveAspectRatio="xMidYMid meet">
        <path className="visual__track" d={`M-10 250 L60 250 L${xs[0] - 30} 250 L${xs[stops - 1] + 30} 250 L610 250`} />
        <path className="visual__flow" d="M-10 250 L610 250" />
        {xs.map((x, i) => (
          <g key={i} className={i === index - 1 ? 'is-here' : ''}>
            {i === index - 1 && <circle className="visual__halo" cx={x} cy="250" r="22" />}
            <circle className={`visual__stop visual__stop--${station.status}`} cx={x} cy="250" r={i === index - 1 ? 11 : 7} />
          </g>
        ))}
      </svg>
      <div className="visual__meta">
        <span>~/projects/{station.id}</span>
        <span>
          {String(index).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
      </div>
      <div className="visual__title">
        <span className="visual__track-name">{line.name}</span>
        <strong>{station.short}</strong>
      </div>
    </div>
  )
}

export function SectionHead({ title, text, id, index, label, aside = null }) {
  return (
    <header className="section-head">
      <div>
        {index ? (
          <p className="eyebrow" data-reveal>
            <span>{String(index).padStart(2, '0')}</span>
            {label}
          </p>
        ) : null}
        <h2 id={id} data-reveal style={{ '--d': '60ms' }}>
          {title}
        </h2>
        {text ? (
          <p data-reveal style={{ '--d': '140ms' }}>
            {text}
          </p>
        ) : null}
      </div>
      {aside}
    </header>
  )
}
