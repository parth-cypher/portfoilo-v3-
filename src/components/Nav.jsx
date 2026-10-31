import { useLayoutEffect, useRef, useState } from 'react'
import { FiArrowUpRight } from 'react-icons/fi'
import { profile } from '../data/portfolio.js'
import { useScrollFrame } from '../hooks/useScrollFrame.js'
import { handleAnchorClick } from '../utils/scroll.js'
import { onRouteClick } from '../utils/router.js'

// Floating glass navigation. A glossy pill slides to the section you are reading;
// a fainter one follows the link under the pointer.
export default function Nav({ sections, active, page = 'home' }) {
  const linksRef = useRef(null)
  const pillRef = useRef(null)
  const hoverRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)

  useScrollFrame(() => {
    const next = window.scrollY > 24
    setScrolled((s) => (s === next ? s : next))
  })

  const placeOn = (pill, link) => {
    if (!pill) return
    if (!link || link.offsetWidth === 0) {
      pill.style.opacity = '0'
      return
    }
    pill.style.opacity = '1'
    pill.style.width = `${link.offsetWidth}px`
    pill.style.transform = `translateX(${link.offsetLeft}px)`
  }

  // Move the pill under the active link.
  useLayoutEffect(() => {
    const place = () => placeOn(pillRef.current, linksRef.current?.querySelectorAll('a')[active])
    place()
    window.addEventListener('resize', place)
    document.fonts?.ready.then(place)
    return () => window.removeEventListener('resize', place)
  }, [active])

  const onHover = (e) => {
    const link = e.target.closest('a')
    const hover = hoverRef.current
    if (!hover) return
    if (!link || link.classList.contains('is-active')) {
      hover.style.opacity = '0'
      return
    }
    // Snap into place on first entry, glide between links after that.
    if (hover.style.opacity !== '1') hover.style.transition = 'none'
    placeOn(hover, link)
    requestAnimationFrame(() => hover.style.removeProperty('transition'))
  }

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav__bar">
        <a className="brand" href="/" onClick={(e) => handleAnchorClick(e, 'home')} aria-label="Parth P Patil, back to top">
          <span className="brand__mark">PP</span>
          <span className="brand__name">{profile.name}</span>
        </a>

        <nav
          className="nav__links"
          ref={linksRef}
          aria-label="Sections"
          onPointerOver={onHover}
          onPointerLeave={() => hoverRef.current && (hoverRef.current.style.opacity = '0')}
        >
          <span className="nav__hover" ref={hoverRef} aria-hidden="true" />
          <span className="nav__pill" ref={pillRef} aria-hidden="true" />
          {sections.map((s, i) => (
            <a
              key={s.id}
              href={page === 'home' ? `#${s.id}` : `/#${s.id}`}
              onClick={(e) => handleAnchorClick(e, s.id)}
              className={`nav__link ${i === active ? 'is-active' : ''} ${s.id === 'home' ? 'nav__link--home' : ''}`}
              aria-current={i === active ? 'location' : undefined}
            >
              {s.short ? (
                <>
                  <span className="nav__full">{s.label}</span>
                  <span className="nav__short">{s.short}</span>
                </>
              ) : (
                s.label
              )}
            </a>
          ))}
        </nav>

        <a
          className={`btn btn--dark btn--small nav__cta ${page === 'work' ? 'is-current' : ''}`}
          href="/work-with-me"
          onClick={(e) => onRouteClick(e, '/work-with-me')}
          aria-current={page === 'work' ? 'page' : undefined}
          data-magnetic="0.2"
        >
          Work With Me
          <FiArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </header>
  )
}
