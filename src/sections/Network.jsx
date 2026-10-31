import { useMemo, useState } from 'react'
import { lines, nextStops, profile, route, stations, statuses } from '../data/portfolio.js'
import StationDetail from '../components/StationDetail.jsx'
import { LineTag, SectionHead } from '../components/bits.jsx'
import { useInView } from '../hooks/useInView.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'

// ── Map geometry (SVG units). All four tracks meet at the hub: where you are now.
const W = 1240
const H = 800
const HUB = [620, 460]
const GEO = {
  ai: { path: [HUB, [760, 320], [1200, 320]], from: [860, 320], to: [1110, 320], labels: ['above'] },
  data: { path: [HUB, [480, 320], [30, 320]], from: [430, 320], to: [75, 320], labels: ['above', 'below'] },
  systems: { path: [HUB, [480, 600], [60, 600]], from: [330, 600], to: [130, 600], labels: ['below'] },
  web: { path: [HUB, [760, 600], [1200, 600]], from: [850, 600], to: [1130, 600], labels: ['below', 'above'] },
}
const LINE_IDS = Object.keys(GEO)
const pct = (x, y) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` })
const toD = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')

function placeStations() {
  const placed = []
  LINE_IDS.forEach((lineId, lineIndex) => {
    const g = GEO[lineId]
    const list = stations.filter((s) => s.line === lineId)
    list.forEach((s, i) => {
      const t = list.length === 1 ? 0 : i / (list.length - 1)
      placed.push({
        ...s,
        x: g.from[0] + (g.to[0] - g.from[0]) * t,
        y: g.from[1] + (g.to[1] - g.from[1]) * t,
        side: g.labels[i % g.labels.length],
        delay: 700 + lineIndex * 200 + i * 90,
      })
    })
  })
  return placed
}

const FUTURE_Y = [250, 190, 130, 70]
const ORIGIN_Y = [740, 670]

export default function Network({ selected, onSelect }) {
  const [mapRef, inView] = useInView(0.25)
  const [liveRef, live] = useInView(0, { once: false })
  const isWide = useMediaQuery('(min-width: 900px)')
  const placed = useMemo(() => placeStations(), [])
  const order = useMemo(() => LINE_IDS.flatMap((id) => stations.filter((s) => s.line === id)), [])
  const [filter, setFilter] = useState('all')
  const [hovered, setHovered] = useState(null)

  const visibleOrder = filter === 'all' ? order : order.filter((s) => s.line === filter)
  const current = order.find((s) => s.id === selected) ?? order[0]
  const lineStations = order.filter((s) => s.line === current.line)
  const position = { index: lineStations.indexOf(current) + 1, count: lineStations.length }
  const step = (dir) => {
    const list = visibleOrder.includes(current) ? visibleOrder : order
    const i = list.indexOf(current)
    onSelect(list[(i + dir + list.length) % list.length].id)
  }

  const chooseFilter = (id) => {
    setFilter(id)
    if (id !== 'all' && current.line !== id) {
      const first = order.find((s) => s.line === id)
      if (first) onSelect(first.id)
    }
  }

  // Arrow keys step through projects while focus is inside the map.
  const onKeyDown = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    step(e.key === 'ArrowRight' ? 1 : -1)
    requestAnimationFrame(() => document.querySelector('.map__station.is-selected')?.focus())
  }

  const counts = Object.fromEntries(Object.keys(statuses).map((k) => [k, stations.filter((s) => s.status === k).length]))
  const summary = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${n} ${statuses[k].label.toLowerCase()}`)
    .join(', ')
  const focusLine = hovered ?? (filter === 'all' ? null : filter)
  const dim = (lineId) => (focusLine && focusLine !== lineId ? 'is-dim' : '')

  return (
    <section id="projects" className="section network" aria-labelledby="projects-title" ref={liveRef}>
      <div className="wrap">
        <SectionHead
          id="projects-title"
          index={4}
          label="Projects"
          title="Project network"
          text={
            counts.shipped === stations.length
              ? `${stations.length} shipped projects on four tracks, all meeting where I am now. Select a project to see what it does and what it runs on.`
              : `${stations.length} projects on four tracks, all meeting where I am now: ${summary}. Select a project to see what it does and what it runs on.`
          }
        />

        <div className="legend" data-reveal>
          <div className="filters" role="group" aria-label="Filter projects by category">
            <button type="button" className={`filter ${filter === 'all' ? 'is-on' : ''}`} aria-pressed={filter === 'all'} onClick={() => chooseFilter('all')}>
              All
              <span className="filter__count">{stations.length}</span>
            </button>
            {LINE_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className={`filter ${filter === id ? 'is-on' : ''}`}
                style={{ '--line': lines[id].color }}
                aria-pressed={filter === id}
                onClick={() => chooseFilter(filter === id ? 'all' : id)}
                onMouseEnter={() => isWide && setHovered(id)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="filter__swatch" aria-hidden="true" />
                {lines[id].name}
                <span className="filter__count">{stations.filter((s) => s.line === id).length}</span>
              </button>
            ))}
          </div>
          <ul className="legend__status" aria-label="Status key">
            {Object.entries(statuses).map(([key, s]) => (
              <li key={key} title={s.meaning}>
                <span className={`legend__dot legend__dot--${key}`} aria-hidden="true" />
                {s.label}
              </li>
            ))}
          </ul>
        </div>

        {isWide ? (
          <>
            <div className="map-panel surface surface--lg" data-reveal style={{ '--d': '80ms' }}>
              <div ref={mapRef} className={`map ${inView ? 'is-in' : ''} ${live ? 'is-live' : ''}`} onKeyDown={onKeyDown}>
                <svg className="map__svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
                  <path className="map__origin" d={toD([[HUB[0], H - 20], HUB])} pathLength="1" />
                  <path className="map__future" d={toD([HUB, [HUB[0], 44]])} />
                  {LINE_IDS.map((id, i) => (
                    <g key={id} className={`map__track ${dim(id)}`}>
                      <path className="map__line" d={toD(GEO[id].path)} stroke={lines[id].color} pathLength="1" style={{ transitionDelay: `${250 + i * 200}ms` }} />
                      <path className="map__flow" d={toD(GEO[id].path)} style={{ animationDelay: `${-i * 0.7}s` }} />
                    </g>
                  ))}
                </svg>

                <div className="map__layer">
                  <div className="map__hub" style={pct(...HUB)}>
                    <span>You are here</span>
                    <b>Pune, year {profile.year}</b>
                  </div>

                  <p className="map__future-title" style={pct(HUB[0] + 22, 26)}>
                    Next
                  </p>
                  {nextStops.map((stop, i) => (
                    <span key={stop.text} className="map__ghost" style={pct(HUB[0], FUTURE_Y[i] ?? 70)}>
                      <i aria-hidden="true" />
                      <span>{stop.short}</span>
                    </span>
                  ))}

                  {route
                    .filter((r) => r.state === 'done')
                    .map((stop, i) => (
                      <span key={stop.place} className="map__origin-stop" style={pct(HUB[0], ORIGIN_Y[i] ?? 740)}>
                        <i aria-hidden="true" />
                        <span>
                          {stop.place}, {stop.stage}
                        </span>
                      </span>
                    ))}

                  {placed.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`map__station map__station--${s.status} map__station--${s.side} ${selected === s.id ? 'is-selected' : ''} ${dim(s.line)}`}
                      style={{ ...pct(s.x, s.y), '--line': lines[s.line].color, '--delay': `${s.delay}ms` }}
                      onClick={() => onSelect(s.id)}
                      data-cursor="view"
                      aria-pressed={selected === s.id}
                      aria-label={`${s.title}. ${lines[s.line].name} track. ${statuses[s.status].label}.`}
                    >
                      <span className="map__dot" aria-hidden="true" />
                      <span className="map__label" aria-hidden="true">
                        {s.short}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <p className="map__hint" aria-hidden="true">
                <kbd>←</kbd>
                <kbd>→</kbd> to step through projects
              </p>
            </div>

            <StationDetail station={current} position={position} onPrev={() => step(-1)} onNext={() => step(1)} />
          </>
        ) : (
          <div className="strips">
            {LINE_IDS.filter((id) => filter === 'all' || filter === id).map((id) => (
              <div key={id} className="strip" style={{ '--line': lines[id].color }} data-reveal>
                <p className="strip__head">
                  <LineTag lineId={id} />
                </p>
                <ol className="strip__list">
                  {stations
                    .filter((s) => s.line === id)
                    .map((s) => {
                      const open = selected === s.id
                      const list = stations.filter((x) => x.line === id)
                      return (
                        <li key={s.id} className={`strip__stop ${open ? 'is-open' : ''}`}>
                          <button
                            type="button"
                            className={`strip__btn map__station--${s.status}`}
                            data-cursor="view"
                            onClick={() => onSelect(open ? '' : s.id)}
                            aria-expanded={open}
                          >
                            <span className="map__dot" aria-hidden="true" />
                            <span className="strip__name">{s.title}</span>
                            <span className={`strip__status strip__status--${s.status}`}>{statuses[s.status].label}</span>
                          </button>
                          {open && <StationDetail station={s} position={{ index: list.indexOf(s) + 1, count: list.length }} compact />}
                        </li>
                      )
                    })}
                </ol>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
