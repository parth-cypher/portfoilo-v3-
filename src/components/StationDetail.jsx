import { FiArrowUpRight, FiChevronLeft, FiChevronRight, FiFileText, FiGithub } from 'react-icons/fi'
import { lines } from '../data/portfolio.js'
import { LineTag, ProjectVisual, StatusPill } from './bits.jsx'

// Detail panel for one project.
export default function StationDetail({ station, position, onPrev, onNext, compact = false }) {
  const line = lines[station.line]

  return (
    <article
      id={compact ? undefined : 'station-board'}
      className={`station surface surface--lg ${compact ? 'station--compact' : ''}`}
      style={{ '--line': line.color }}
      aria-live="polite"
      aria-label={`Project: ${station.title}`}
    >
      {!compact && (
        <div className="station__bar">
          <p className="station__where">
            <LineTag lineId={station.line} />
            <span className="station__count">
              {position.index} of {position.count} on this track
            </span>
          </p>
          <div className="station__nav">
            <button type="button" className="icon-btn" onClick={onPrev} aria-label="Previous project" data-magnetic="0.3">
              <FiChevronLeft aria-hidden="true" />
            </button>
            <button type="button" className="icon-btn" onClick={onNext} aria-label="Next project" data-magnetic="0.3">
              <FiChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="station__body" key={station.id}>
        <div className="station__shot-wrap" data-tilt="5" {...(station.demo ? { 'data-cursor': 'view', 'data-cursor-label': 'Open ↗' } : {})}>
          {station.demo ? (
            <a className="station__shot-link" href={station.demo} target="_blank" rel="noreferrer" aria-label={`Open the live demo of ${station.title} (new tab)`}>
              <ProjectVisual className="station__shot" station={station} index={position.index} count={position.count} />
            </a>
          ) : (
            <ProjectVisual className="station__shot" station={station} index={position.index} count={position.count} />
          )}
        </div>

        <div className="station__info">
          <StatusPill status={station.status} note={station.note} />
          <h3 className="station__title">{station.title}</h3>
          <p className="station__sub">{station.subtitle}</p>

          {station.description ? <p className="station__desc">{station.description}</p> : <p className="station__desc">Details coming soon.</p>}

          {station.highlights.length > 0 && (
            <ul className="station__highlights">
              {station.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}

          {station.stack.length > 0 && (
            <ul className="chips" aria-label="Built with">
              {station.stack.map((item) => (
                <li key={item} className="chip">
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className="station__links">
            {station.demo && (
              <a className="btn btn--dark btn--small" href={station.demo} target="_blank" rel="noreferrer" data-magnetic="0.2">
                Live demo
                <FiArrowUpRight aria-hidden="true" />
              </a>
            )}
            {station.github ? (
              <a className="btn btn--light btn--small" href={station.github} target="_blank" rel="noreferrer" data-magnetic="0.2">
                <FiGithub aria-hidden="true" />
                GitHub
              </a>
            ) : (
              <span className="soon">
                <FiGithub aria-hidden="true" />
                GitHub link coming soon
              </span>
            )}
            {station.caseStudy && (
              <a className="btn btn--light btn--small" href={station.caseStudy} target="_blank" rel="noreferrer" data-magnetic="0.2">
                <FiFileText aria-hidden="true" />
                Case study
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
