import { useRef } from 'react'
import { nextStops, profile, route } from '../data/portfolio.js'
import ProfileCard from '../components/ProfileCard.jsx'
import { SectionHead } from '../components/bits.jsx'
import { useScrollFrame } from '../hooks/useScrollFrame.js'

export default function About() {
  const routeRef = useRef(null)
  const hereRef = useRef(null)

  // The solid line grows down to "You are here" as you scroll past it.
  useScrollFrame(() => {
    const el = routeRef.current
    const here = hereRef.current
    if (!el || !here) return
    const rect = el.getBoundingClientRect()
    const target = here.offsetTop + 10
    const travelled = window.innerHeight * 0.7 - rect.top
    const p = Math.min(1, Math.max(0, travelled / target))
    el.style.setProperty('--fill', `${(p * target).toFixed(1)}px`)
    el.classList.toggle('is-arrived', p >= 1)
  })

  const [lede, ...rest] = profile.about

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="wrap">
        <SectionHead id="about-title" index={2} label="About" title="The route so far" />

        <div className="about__grid">
          <div className="about__main">
            <p className="about__lede" data-reveal>
              {lede}
            </p>
            <div className="about__body">
              {rest.map((p, i) => (
                <p key={i} data-reveal style={{ '--d': `${80 + i * 70}ms` }}>
                  {p}
                </p>
              ))}
            </div>

            <h3 className="about__sub" data-reveal>
              Education
            </h3>
            <div className="route" ref={routeRef}>
              <span className="route__rail" aria-hidden="true" />
              <span className="route__fill" aria-hidden="true" />
              <ol className="route__list">
                {route.map((stop, i) => (
                  <li
                    key={stop.place}
                    ref={stop.state === 'current' ? hereRef : undefined}
                    className={`route__stop route__stop--${stop.state}`}
                    data-reveal
                    style={{ '--d': `${i * 90}ms` }}
                  >
                    <span className="route__dot" aria-hidden="true" />
                    <div className="route__head">
                      <p className="route__stage">{stop.stage}</p>
                      {stop.state === 'current' && <span className="route__here">You are here</span>}
                    </div>
                    <p className="route__what">
                      <span>{stop.school}</span>
                      <span className="route__place">{stop.place}</span>
                    </p>
                  </li>
                ))}
              </ol>

              <p className="route__next-title" data-reveal>
                Next stops
              </p>
              <ol className="route__list route__list--next">
                {nextStops.map((stop, i) => (
                  <li key={stop.text} className="route__stop route__stop--next" data-reveal style={{ '--d': `${i * 60}ms` }}>
                    <span className="route__dot" aria-hidden="true" />
                    <p className="route__what">
                      <span>{stop.text}</span>
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <aside className="about__side" aria-label="Profile">
            <ProfileCard />
          </aside>
        </div>
      </div>
    </section>
  )
}
