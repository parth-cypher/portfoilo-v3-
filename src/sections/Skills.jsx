import { lines, skillGroups } from '../data/portfolio.js'
import { SectionHead } from '../components/bits.jsx'

function swatch(lineIds) {
  if (lineIds.length === 0) return 'var(--ink)'
  if (lineIds.length === 1) return lines[lineIds[0]].color
  const step = 100 / lineIds.length
  return `linear-gradient(90deg, ${lineIds.map((id, i) => `${lines[id].color} ${i * step}% ${(i + 1) * step}%`).join(', ')})`
}

// Skills, each group marked with the colour of the track it powers.
export default function Skills() {
  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <div className="wrap">
        <SectionHead
          id="skills-title"
          index={5}
          label="Skills"
          title="Skills"
          text="The tools behind the projects on the map, marked with the colour of the track they power."
        />

        <div className="key surface surface--lg">
          {skillGroups.map((group, g) => (
            <div
              key={group.title}
              className="key__row"
              data-reveal
              style={{ '--d': `${g * 70}ms`, '--accent': group.lines.length ? lines[group.lines[0]].color : 'var(--ink)' }}
            >
              <div className="key__name">
                <span className="key__num" aria-hidden="true">
                  {String(g + 1).padStart(2, '0')}
                </span>
                <span className="key__swatch" style={{ background: swatch(group.lines) }} aria-hidden="true" />
                <h3>{group.title}</h3>
              </div>
              <ul className="chips">
                {group.items.map((item, i) => (
                  <li key={item} className="chip chip--skill" style={{ '--ci': i }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
