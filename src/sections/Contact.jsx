import { useEffect, useRef, useState } from 'react'
import { FiArrowUpRight, FiCheck, FiCopy, FiFileText, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi'
import { profile } from '../data/portfolio.js'
import { onRouteClick } from '../utils/router.js'

// Clipboard API where available, with a textarea fallback for older or non-secure contexts.
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    ta.remove()
    return ok
  }
}

export default function Contact() {
  const [copied, setCopied] = useState(null)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    const ok = await copyText(profile.email)
    setCopied(ok ? 'ok' : 'fail')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), 2200)
  }

  const links = [
    { label: 'GitHub', href: profile.github, icon: FiGithub },
    { label: 'LinkedIn', href: profile.linkedin, icon: FiLinkedin },
    { label: 'Resume', href: profile.resume, icon: FiFileText },
    { label: 'X', href: profile.twitter, icon: FiTwitter },
  ]

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="wrap">
        <p className="eyebrow" data-reveal>
          <span>06</span>Contact
        </p>
        <div className="contact__grid">
          <div className="contact__main">
            <h2 id="contact-title" className="contact__title" data-reveal style={{ '--d': '60ms' }}>
              Let&rsquo;s build something meaningful.
            </h2>
            <p className="contact__text" data-reveal style={{ '--d': '140ms' }}>
              I&rsquo;m interested in software engineering internships, collaborative projects and opportunities to build useful technology.
            </p>

            <ul className="contact__links" data-reveal style={{ '--d': '200ms' }}>
              {links.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer" data-magnetic="0.25">
                    <Icon aria-hidden="true" />
                    {label}
                    <FiArrowUpRight className="contact__arrow" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="inquiry" data-reveal data-parallax="-0.04" data-cursor-dark style={{ '--d': '160ms' }}>
            <p className="inquiry__title">Internships &amp; collaboration</p>
            <p className="inquiry__text">The quickest way to reach me is email. Tell me about the role or the project.</p>
            <button type="button" className="inquiry__email" onClick={copy} aria-label={`Copy email address ${profile.email}`}>
              {profile.email}
              <FiCopy aria-hidden="true" />
            </button>
            <div className="inquiry__actions">
              <a className="btn btn--white" href={`mailto:${profile.email}`} data-magnetic="0.22">
                Email Parth
                <FiArrowUpRight aria-hidden="true" />
              </a>
              <button type="button" className={`btn btn--glass ${copied === 'ok' ? 'is-copied' : ''}`} onClick={copy} data-magnetic="0.22">
                {copied === 'ok' ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
                {copied === 'ok' ? 'Copied' : copied === 'fail' ? 'Copy failed' : 'Copy address'}
              </button>
            </div>
            <a className="inquiry__brief" href="/work-with-me" onClick={(e) => onRouteClick(e, '/work-with-me')}>
              <span>
                <b>Have a project in mind?</b>
                Send a short project brief in three steps.
              </span>
              <FiArrowUpRight aria-hidden="true" />
            </a>
            <p className="sr-only" role="status">
              {copied === 'ok' ? 'Email address copied to clipboard' : copied === 'fail' ? 'Could not copy the email address' : ''}
            </p>
            <p className="inquiry__meta">
              <span className="hero__lamp" aria-hidden="true" />
              {profile.availability}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
