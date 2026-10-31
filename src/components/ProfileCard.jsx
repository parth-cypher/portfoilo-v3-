import { profile, stations } from '../data/portfolio.js'
import { Portrait } from './bits.jsx'

export default function ProfileCard() {
  const years = Array.from({ length: profile.totalYears }, (_, i) => i + 1)
  const shipped = stations.filter((s) => s.status === 'shipped').length

  return (
    <div className="profile surface surface--lg" data-reveal style={{ '--d': '120ms' }}>
      <div className="profile__photo">
        <Portrait src={profile.portrait} name={profile.name} />
      </div>

      <div className="profile__body">
        <p className="profile__name">{profile.name}</p>
        <p className="profile__role">{profile.role}</p>

        <dl className="profile__facts">
          <div>
            <dt>Studying</dt>
            <dd>
              {profile.degree}, {profile.college}
            </dd>
          </div>
          <div>
            <dt>Based in</dt>
            <dd>{profile.location}</dd>
          </div>
          <div>
            <dt>Projects</dt>
            <dd>
              {stations.length} on the map, {shipped} shipped
            </dd>
          </div>
        </dl>

        <div className="profile__years">
          <div className="profile__years-label">
            <span>Degree progress</span>
            <span>
              Year {profile.year} of {profile.totalYears}
            </span>
          </div>
          <div className="profile__segments" aria-hidden="true">
            {years.map((y) => (
              <i key={y} className={y < profile.year ? 'is-done' : y === profile.year ? 'is-now' : ''} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
