import { profile } from '../data/portfolio.js'
import { onRouteClick } from '../utils/router.js'

export default function Footer() {
  const year = new Date().getFullYear()
  const links = [
    { label: 'Work with me', href: '/work-with-me' },
    { label: 'GitHub', href: profile.github },
    { label: 'LinkedIn', href: profile.linkedin },
    { label: 'X', href: profile.twitter },
    { label: 'Email', href: `mailto:${profile.email}` },
  ]

  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <p className="footer__name">
          <span className="brand__mark brand__mark--sm" aria-hidden="true">
            PP
          </span>
          {profile.name}
        </p>
        <ul className="footer__links">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                {...(l.href.startsWith('/') ? { onClick: (e) => onRouteClick(e, l.href) } : {})}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="footer__meta">
          Designed and built by hand in {profile.location.split(',')[0]}. {year}.
        </p>
      </div>
    </footer>
  )
}
