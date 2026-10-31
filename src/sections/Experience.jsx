import { experience, lines } from '../data/portfolio.js'
import { SectionHead } from '../components/bits.jsx'

export default function Experience() {
  return (
    <section id="experience" className="section experience" aria-labelledby="experience-title">
      <div className="wrap">
        <SectionHead
          id="experience-title"
          index={3}
          label="Experience"
          title="Hands-on work"
          text="Technical operations at a gaming facility, alongside my degree."
        />

        <ol className="jobs">
          {experience.map((job, i) => (
            <li key={job.org} className="job surface surface--lg" style={{ '--line': lines[job.line].color, '--d': `${i * 120}ms` }} data-reveal data-tilt="1.5">
              <div className="job__side">
                <span className={`job__kind job__kind--${job.kind.toLowerCase()}`}>
                  <i aria-hidden="true" />
                  {job.kind}
                </span>
                <h3 className="job__role">{job.role}</h3>
                <p className="job__org">{job.org}</p>
              </div>
              <div className="job__main">
                <p className="job__desc">{job.description}</p>
                <ul className="job__points" aria-label={`${job.role} responsibilities`}>
                  {job.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
