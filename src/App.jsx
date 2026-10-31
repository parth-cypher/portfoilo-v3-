import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { stations } from './data/portfolio.js'
import Loader from './components/Loader.jsx'
import Nav from './components/Nav.jsx'
import Cursor from './components/Cursor.jsx'
import { ScrollProgress, SectionIndicator } from './components/Chrome.jsx'
import Hero from './sections/Hero.jsx'
import About from './sections/About.jsx'
import Experience from './sections/Experience.jsx'
import Network from './sections/Network.jsx'
import Skills from './sections/Skills.jsx'
import Contact from './sections/Contact.jsx'
import Footer from './sections/Footer.jsx'
import WorkWithMe from './pages/WorkWithMe.jsx'
import { useActiveSection } from './hooks/useActiveSection.js'
import { useMotion } from './hooks/useMotion.js'
import { scrollToEl, scrollToId } from './utils/scroll.js'
import { takePendingScroll, useRoute } from './utils/router.js'

const SEEN_KEY = 'pp-doors-opened'
const WORK_PATH = '/work-with-me'
const TITLES = {
  '/': 'Parth P Patil | Software Developer & CS Student',
  [WORK_PATH]: 'Work With Me | Parth P Patil',
}

const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience', short: 'Work' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
]
const IDS = SECTIONS.map((s) => s.id)

// Skip the opening sequence for reduced motion, after the first visit in a session,
// and when someone lands directly on an inner page.
function skipLoader() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  if (window.location.pathname.replace(/\/+$/, '') === WORK_PATH) return true
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const route = useRoute()
  const isWork = route === WORK_PATH
  const [ready, setReady] = useState(skipLoader)
  const [selected, setSelected] = useState(stations[0].id)
  const active = useActiveSection(IDS)
  useMotion()

  // Each page starts at the top, unless a section link asked for a specific section.
  useLayoutEffect(() => {
    document.title = TITLES[route] || TITLES['/']
    const target = takePendingScroll()
    if (target) requestAnimationFrame(() => scrollToId(target))
    else window.scrollTo(0, 0)
  }, [route])

  // An unknown path falls back to the home page URL.
  useEffect(() => {
    if (!TITLES[route]) window.history.replaceState({}, '', '/')
  }, [route])

  const finishLoader = useCallback(() => {
    setReady(true)
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* storage can be unavailable; the loader just plays again */
    }
  }, [])

  // A click on the status board selects that project and scrolls down to its detail panel.
  const showStation = useCallback((id) => {
    setSelected(id)
    requestAnimationFrame(() => {
      const target = document.getElementById('station-board') || document.querySelector('.strip__stop.is-open')
      if (!target) return scrollToId('projects')
      scrollToEl(target)
    })
  }, [])

  return (
    <>
      {!ready && <Loader onDone={finishLoader} />}
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollProgress />
      <Nav sections={SECTIONS} active={isWork ? -1 : active} page={isWork ? 'work' : 'home'} />
      {!isWork && <SectionIndicator sections={SECTIONS} active={active} />}
      <main id="main" key={isWork ? 'work' : 'home'}>
        {isWork ? (
          <WorkWithMe />
        ) : (
          <>
            <Hero ready={ready} onSelectStation={showStation} />
            <About />
            <Experience />
            <Network selected={selected} onSelect={setSelected} />
            <Skills />
            <Contact />
          </>
        )}
      </main>
      <Footer />
      <Cursor />
    </>
  )
}
