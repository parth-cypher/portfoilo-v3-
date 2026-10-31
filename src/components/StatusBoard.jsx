import { useEffect, useMemo, useRef, useState } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import { lines, stations, statuses } from '../data/portfolio.js'
import SplitFlap from './SplitFlap.jsx'

const ROWS = 5
const NAME_CELLS = 20
const ORDER = { shipped: 0, building: 1, planned: 2 }

function useClock() {
  const format = () =>
    new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
  const [time, setTime] = useState(format)
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 15000)
    return () => clearInterval(id)
  }, [])
  return time
}

// Live status board. Project names flip into place; pages turn every few seconds.
export default function StatusBoard({ run, onSelect }) {
  const time = useClock()
  const boardRef = useRef(null)
  const pages = useMemo(() => {
    const sorted = [...stations].sort((a, b) => ORDER[a.status] - ORDER[b.status])
    const out = []
    for (let i = 0; i < sorted.length; i += ROWS) out.push(sorted.slice(i, i + ROWS))
    return out
  }, [])
  const counts = useMemo(
    () => Object.keys(statuses).map((key) => ({ key, n: stations.filter((s) => s.status === key).length })).filter((c) => c.n > 0),
    [],
  )
  const [page, setPage] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!run || paused || pages.length < 2) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const id = setInterval(() => setPage((p) => (p + 1) % pages.length), 7000)
    return () => clearInterval(id)
  }, [run, paused, pages.length])

  // Soft spotlight that follows the pointer across the glass.
  const onMove = (e) => {
    const el = boardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--sx', `${e.clientX - r.left}px`)
    el.style.setProperty('--sy', `${e.clientY - r.top}px`)
  }

  const rows = pages[page]
  const [hh, mm] = time.split(':')

  return (
    <section
      ref={boardRef}
      className="board"
      aria-label="Project status"
      data-cursor-dark
      onPointerMove={onMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="board__head">
        <div>
          <p className="board__path">
            <span>~/parth</span>/projects
          </p>
          <p className="board__title">Build status</p>
        </div>
        <p className="board__clock" aria-label={`Time in Pune ${time}`}>
          <span className="board__live" aria-hidden="true" />
          <span>
            Pune {hh}
            <span className="board__colon">:</span>
            {mm}
          </span>
        </p>
      </div>

      <ul className="board__summary" aria-label="Project counts">
        <li>
          <b>{stations.length}</b> projects
        </li>
        {counts.length === 1 ? (
          <li className={`board__count board__count--${counts[0].key}`}>
            <i aria-hidden="true" />
            all {statuses[counts[0].key].label.toLowerCase()}
          </li>
        ) : null}
        {counts.length > 1 && counts.map((c) => (
          <li key={c.key} className={`board__count board__count--${c.key}`}>
            <i aria-hidden="true" />
            <b>{c.n}</b> {statuses[c.key].label.toLowerCase()}
          </li>
        ))}
      </ul>

      <ul className="board__rows">
        {Array.from({ length: ROWS }, (_, i) => {
          const s = rows[i]
          if (!s) {
            return (
              <li key={`blank-${page}-${i}`} className="board__row board__row--blank" aria-hidden="true">
                <span className="board__dot" />
                <SplitFlap text="" cells={NAME_CELLS} run={run} delay={i * 90} />
                <span />
              </li>
            )
          }
          return (
            <li key={`${page}-${s.id}`}>
              <button
                type="button"
                className="board__row"
                onClick={() => onSelect(s.id)}
                data-cursor="view"
                aria-label={`${s.title}, ${lines[s.line].name} track, ${statuses[s.status].label}. Show on the map.`}
              >
                <span className="board__dot" style={{ '--c': lines[s.line].color }} aria-hidden="true" />
                <SplitFlap text={s.short} cells={NAME_CELLS} run={run} delay={i * 90} />
                <span className={`board__status board__status--${s.status}`}>
                  <i aria-hidden="true" />
                  {statuses[s.status].label}
                </span>
                <FiArrowRight className="board__go" aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ul>

      <div className="board__foot">
        <p className="board__prompt" aria-hidden="true">
          <span>$</span> status --watch <span className="board__caret" />
        </p>
        <span className="board__pager" aria-hidden="true">
          {pages.map((_, i) => (
            <i key={i} className={i === page ? 'is-on' : ''} />
          ))}
        </span>
        {pages.length > 1 && (
          <button
            type="button"
            className="board__more"
            onClick={() => setPage((p) => (p + 1) % pages.length)}
            aria-label={`Show page ${((page + 1) % pages.length) + 1} of ${pages.length}`}
          >
            {page + 1}/{pages.length}
            <FiArrowRight aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  )
}
