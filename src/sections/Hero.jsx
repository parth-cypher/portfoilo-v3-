import { useEffect, useState } from 'react'
import { FiArrowDown, FiArrowUpRight, FiFileText, FiGithub, FiLinkedin } from 'react-icons/fi'
import { announcements, profile } from '../data/portfolio.js'
import StatusBoard from '../components/StatusBoard.jsx'
import { handleAnchorClick } from '../utils/scroll.js'
import { onRouteClick } from '../utils/router.js'

function NoteToSelf() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (announcements.length < 2) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const id = setInterval(() => setI((n) => (n + 1) % announcements.length), 5200)
    return () => clearInterval(id)
  }, [])
  return (
    <p className="note">
      <span className="note__label">Note to self</span>
      <span className="note__text" key={i}>
        {announcements[i]}
      </span>
    </p>
  )
}

// The name, split into masked characters that rise in sequence.
function Name({ text }) {
  let n = 0
  return (
    <h1 className="hero__name" aria-label={text}>
      {text.split(' ').map((word, w) => (
        <span className="hero__word" key={w} aria-hidden="true">
          {Array.from(word).map((ch) => {
            const i = n++
            return (
              <span className="hero__char" key={i} style={{ '--i': i }}>
                <span>{ch}</span>
              </span>
            )
          })}
        </span>
      ))}
    </h1>
  )
}

export default function Hero({ ready, onSelectStation }) {
  return (
    <section id="home" className={`hero ${ready ? 'is-ready' : ''}`}>
      <div className="hero__backdrop" data-parallax="-0.12" aria-hidden="true" />
      <div className="wrap">
        <p className="hero__signal">
          <span className="hero__lamp" aria-hidden="true" />
          {profile.availability}
        </p>

        <Name text={profile.name} />

        <div className="hero__grid">
          <span className="hero__rule" aria-hidden="true" />
          <div className="hero__copy">
            <p className="hero__role">{profile.role}</p>
            <p className="hero__lede">{profile.headline}</p>

            <div className="hero__actions">
              <a className="btn btn--dark btn--arrow" href="/work-with-me" onClick={(e) => onRouteClick(e, '/work-with-me')} data-magnetic="0.22">
                <span>Work with me</span>
                <span className="btn__icon" aria-hidden="true">
                  <FiArrowUpRight />
                  <FiArrowUpRight />
                </span>
              </a>
              <a className="btn btn--light" href="#projects" onClick={(e) => handleAnchorClick(e, 'projects')} data-magnetic="0.22">
                View projects
                <FiArrowDown aria-hidden="true" className="btn__down" />
              </a>
            </div>

            <div className="hero__links">
              <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub (opens in a new tab)" data-magnetic="0.35">
                <FiGithub aria-hidden="true" />
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn (opens in a new tab)" data-magnetic="0.35">
                <FiLinkedin aria-hidden="true" />
              </a>
              <a className="hero__resume" href={profile.resume} target="_blank" rel="noreferrer" data-magnetic="0.25">
                <FiFileText aria-hidden="true" />
                Resume
              </a>
            </div>

            <NoteToSelf />
          </div>

          <div className="hero__board">
            <StatusBoard run={ready} onSelect={onSelectStation} />
          </div>
        </div>
      </div>
    </section>
  )
}
