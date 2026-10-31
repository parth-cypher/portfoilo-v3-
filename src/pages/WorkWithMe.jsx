import { useEffect, useRef, useState } from 'react'
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiCheck,
  FiCopy,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiSend,
} from 'react-icons/fi'
import { profile } from '../data/portfolio.js'
import { BUDGETS, LIMITS, PROJECT_TYPES, STEP_FIELDS, TIMELINES, labelFor, validateInquiry } from '../../shared/inquiry.js'
import { onRouteClick } from '../utils/router.js'

const DRAFT_KEY = 'pp-inquiry-draft'
const STEPS = ['Project', 'Budget & timeline', 'Your details']
const EMPTY = { projectType: '', budget: '', timeline: '', name: '', email: '', company: '', description: '', website: '' }

function loadDraft() {
  try {
    return { ...EMPTY, ...JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}'), website: '' }
  } catch {
    return EMPTY
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// A row of radio "cards" or pills. Native radios underneath, so keyboard and screen readers just work.
function Choice({ name, legend, options, value, onChange, error, variant = 'pill' }) {
  return (
    <fieldset className={`choice choice--${variant}`} aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="field__label">{legend}</legend>
      <div className="choice__options">
        {options.map((o) => (
          <label key={o.id} className={`choice__option ${value === o.id ? 'is-on' : ''}`}>
            <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(name, o.id)} />
            <span className="choice__mark" aria-hidden="true">
              <FiCheck />
            </span>
            <span className="choice__text">
              <b>{o.label}</b>
              {o.hint ? <small>{o.hint}</small> : null}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p className="field__error" id={`${name}-error`}>
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}

function Field({ name, label, optional, error, children, aside }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <div className="field__top">
        <label className="field__label" htmlFor={`f-${name}`}>
          {label}
          {optional ? <span className="field__optional">Optional</span> : null}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p className="field__error" id={`${name}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

function Success({ reference, email, confirmed, onReset }) {
  const titleRef = useRef(null)
  useEffect(() => titleRef.current?.focus({ preventScroll: true }), [])
  return (
    <div className="brief-success" role="status" aria-live="polite">
      <svg className="brief-success__check" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="29" />
        <path d="M20 33.5l8 8 16-17" />
      </svg>
      <h2 className="brief-success__title" tabIndex={-1} ref={titleRef}>
        Message received. Thanks for reaching out!
      </h2>
      <p className="brief-success__text">I’ll review your inquiry and get back to you as soon as possible.</p>
      <p className="brief-success__ref">
        Reference <code>{reference}</code>
      </p>
      {confirmed ? <p className="brief-success__note">A confirmation is on its way to {email}.</p> : null}
      <div className="brief-success__actions">
        <a className="btn btn--dark" href="/" onClick={(e) => onRouteClick(e, '/')} data-magnetic="0.2">
          <FiArrowLeft aria-hidden="true" />
          Back to portfolio
        </a>
        <button type="button" className="btn btn--light" onClick={onReset} data-magnetic="0.2">
          Send another brief
        </button>
      </div>
    </div>
  )
}

export default function WorkWithMe() {
  const [data, setData] = useState(loadDraft)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [serverError, setServerError] = useState('')
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState('')
  const startedAt = useRef(0) // set on mount; the server uses it to spot instant bot submissions
  const stepRef = useRef(null)
  const formRef = useRef(null)
  const firstRender = useRef(true)

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  // Keep a draft for this tab, so a reload or a wrong click never loses the brief.
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, website: '' }))
    } catch {
      /* storage unavailable: nothing to persist */
    }
  }, [data])

  // Move focus to the new step's heading (not on first load).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    stepRef.current?.focus({ preventScroll: true })
    const top = formRef.current?.getBoundingClientRect().top ?? 0
    if (top < 80) window.scrollBy({ top: top - 110, behavior: 'smooth' })
  }, [step, status])

  const set = (name, value) => {
    setData((d) => ({ ...d, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
  }

  const stepErrors = (i) => {
    const all = validateInquiry(data).errors
    return Object.fromEntries(STEP_FIELDS[i].filter((f) => all[f]).map((f) => [f, all[f]]))
  }

  const focusFirstError = (errs) => {
    const first = Object.keys(errs)[0]
    if (!first) return
    requestAnimationFrame(() => {
      const el = document.getElementById(`f-${first}`) || document.querySelector(`input[name="${first}"]`)
      el?.focus()
    })
  }

  const next = () => {
    const errs = stepErrors(step)
    setErrors(errs)
    if (Object.keys(errs).length) return focusFirstError(errs)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const back = () => setStep((s) => Math.max(s - 1, 0))

  const goTo = (i) => {
    // Only allow jumping back, or forward past steps that are already complete.
    for (let s = 0; s < i; s++) if (Object.keys(stepErrors(s)).length) return setStep(s)
    setStep(i)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (step < STEPS.length - 1) return next()
    const { errors: all } = validateInquiry(data)
    if (Object.keys(all).length) {
      const badStep = STEP_FIELDS.findIndex((fields) => fields.some((f) => all[f]))
      setErrors(all)
      setStep(badStep)
      return focusFirstError(all)
    }

    setStatus('sending')
    setServerError('')
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, startedAt: startedAt.current }),
      })
      const body = await res.json().catch(() => ({}))
      if (res.ok && body.ok) {
        setResult({ reference: body.reference, confirmed: !!body.confirmed, email: data.email })
        setStatus('success')
        try {
          sessionStorage.removeItem(DRAFT_KEY)
        } catch {
          /* ignore */
        }
        return
      }
      if (res.status === 422 && body.fields) {
        const badStep = STEP_FIELDS.findIndex((fields) => fields.some((f) => body.fields[f]))
        setErrors(body.fields)
        setStep(badStep < 0 ? step : badStep)
        setStatus('idle')
        return focusFirstError(body.fields)
      }
      setServerError(body.error || 'Something went wrong while sending. Your brief is still here.')
      setStatus('error')
    } catch {
      setServerError('Couldn’t reach the server. Check your connection and try again — your brief is still here.')
      setStatus('error')
    }
  }

  const reset = () => {
    setData(EMPTY)
    setErrors({})
    setStep(0)
    setResult(null)
    setStatus('idle')
    startedAt.current = Date.now()
  }

  const copy = async (what, text) => {
    const ok = await copyText(text)
    setCopied(ok ? what : `${what}-fail`)
    setTimeout(() => setCopied(''), 2000)
  }

  const descLength = data.description.trim().length
  const sending = status === 'sending'

  return (
    <section className="section wwm" aria-labelledby="wwm-title">
      <div className="wrap">
        <header className="wwm__head">
          <p className="eyebrow" data-reveal>
            <span>✦</span>Work with me
          </p>
          <h1 id="wwm-title" className="wwm__title" data-reveal style={{ '--d': '60ms' }}>
            Have a project in mind?
          </h1>
          <p className="wwm__lede" data-reveal style={{ '--d': '140ms' }}>
            Tell me what you’re building. Whether it’s a website, an AI-powered application or an interesting technical challenge, I’d love to hear about
            it.
          </p>
          <p className="hero__signal wwm__signal" data-reveal style={{ '--d': '200ms' }}>
            <span className="hero__lamp" aria-hidden="true" />
            Available for selected projects and collaborations.
          </p>
        </header>

        <div className="wwm__grid">
          <aside className="inquiry wwm__info" data-cursor-dark data-reveal style={{ '--d': '120ms' }} aria-label="Contact information">
            <p className="wwm__name">Parth Patil</p>
            <p className="wwm__role">{profile.role}</p>

            <ul className="wwm__facts">
              <li>
                <FiMail aria-hidden="true" />
                <span className="wwm__fact-label">Email</span>
                <button type="button" className="wwm__copy" onClick={() => copy('email', profile.email)} aria-label={`Copy email address ${profile.email}`}>
                  {profile.email}
                  {copied === 'email' ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
                </button>
              </li>
              <li>
                <FiMapPin aria-hidden="true" />
                <span className="wwm__fact-label">Location</span>
                <span>Pune, India</span>
              </li>
              <li>
                <FiGithub aria-hidden="true" />
                <span className="wwm__fact-label">GitHub</span>
                <a href={profile.github} target="_blank" rel="noreferrer">
                  parth-cypher <FiArrowUpRight aria-hidden="true" />
                </a>
              </li>
              <li>
                <FiLinkedin aria-hidden="true" />
                <span className="wwm__fact-label">LinkedIn</span>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  Parth Patil <FiArrowUpRight aria-hidden="true" />
                </a>
              </li>
              <li>
                <span className="hero__lamp" aria-hidden="true" />
                <span className="wwm__fact-label">Availability</span>
                <span>Selected projects &amp; collaborations</span>
              </li>
            </ul>

            <blockquote className="wwm__quote">
              I believe great projects begin with good conversations. Tell me about your idea and let’s explore what’s possible.
            </blockquote>

            <a className="btn btn--glass wwm__mail" href={`mailto:${profile.email}`} data-magnetic="0.2">
              Prefer email? Write to me directly
              <FiArrowUpRight aria-hidden="true" />
            </a>
            <p className="sr-only" role="status">
              {copied === 'email' ? 'Email address copied' : ''}
            </p>
          </aside>

          <div className="brief surface surface--lg" ref={formRef} data-reveal style={{ '--d': '200ms' }}>
            {status === 'success' && result ? (
              <Success {...result} onReset={reset} />
            ) : (
              <form className="brief__form" onSubmit={submit} noValidate aria-describedby="brief-progress">
                <ol className="brief__progress" id="brief-progress" aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
                  {STEPS.map((label, i) => (
                    <li key={label} className={i === step ? 'is-current' : i < step ? 'is-done' : ''}>
                      <button type="button" onClick={() => goTo(i)} disabled={i > step || sending} aria-current={i === step ? 'step' : undefined}>
                        <span className="brief__num">{i < step ? <FiCheck aria-hidden="true" /> : i + 1}</span>
                        <span className="brief__step-label">{label}</span>
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="brief__bar" aria-hidden="true">
                  <i style={{ transform: `scaleX(${(step + 1) / STEPS.length})` }} />
                </div>

                {/* Honeypot: hidden from people, tempting to bots. */}
                <div className="brief__hp" aria-hidden="true">
                  <label>
                    Website
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => set('website', e.target.value)} />
                  </label>
                </div>

                <div className="brief__step" key={step}>
                  {step === 0 && (
                    <>
                      <h2 className="brief__title" ref={stepRef} tabIndex={-1}>
                        What are you building?
                      </h2>
                      <Choice
                        name="projectType"
                        legend="Type of project"
                        variant="card"
                        options={PROJECT_TYPES}
                        value={data.projectType}
                        onChange={set}
                        error={errors.projectType}
                      />
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <h2 className="brief__title" ref={stepRef} tabIndex={-1}>
                        Budget and timeline
                      </h2>
                      <p className="brief__hint">Rough is fine — this just helps me suggest the right scope.</p>
                      <Choice name="budget" legend="Estimated budget" options={BUDGETS} value={data.budget} onChange={set} error={errors.budget} />
                      <Choice name="timeline" legend="Project timeline" options={TIMELINES} value={data.timeline} onChange={set} error={errors.timeline} />
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h2 className="brief__title" ref={stepRef} tabIndex={-1}>
                        Tell me about it
                      </h2>
                      <div className="brief__review" aria-label="Your choices so far">
                        <button type="button" onClick={() => goTo(0)}>
                          {labelFor(PROJECT_TYPES, data.projectType)}
                        </button>
                        <button type="button" onClick={() => goTo(1)}>
                          {labelFor(BUDGETS, data.budget)}
                        </button>
                        <button type="button" onClick={() => goTo(1)}>
                          {labelFor(TIMELINES, data.timeline)}
                        </button>
                      </div>
                      <div className="brief__row">
                        <Field name="name" label="Full name" error={errors.name}>
                          <input
                            id="f-name"
                            className="input"
                            autoComplete="name"
                            maxLength={LIMITS.name}
                            value={data.name}
                            onChange={(e) => set('name', e.target.value)}
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? 'name-error' : undefined}
                          />
                        </Field>
                        <Field name="email" label="Email address" error={errors.email}>
                          <input
                            id="f-email"
                            className="input"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            maxLength={LIMITS.email}
                            value={data.email}
                            onChange={(e) => set('email', e.target.value)}
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                          />
                        </Field>
                      </div>
                      <Field name="company" label="Company / organisation" optional>
                        <input
                          id="f-company"
                          className="input"
                          autoComplete="organization"
                          maxLength={LIMITS.company}
                          value={data.company}
                          onChange={(e) => set('company', e.target.value)}
                        />
                      </Field>
                      <Field
                        name="description"
                        label="Project description"
                        error={errors.description}
                        aside={
                          <span className={`field__count ${descLength > 0 && descLength < LIMITS.description.min ? 'is-low' : ''}`} aria-live="polite">
                            {descLength} / {LIMITS.description.max}
                          </span>
                        }
                      >
                        <textarea
                          id="f-description"
                          className="input input--area"
                          rows={6}
                          maxLength={LIMITS.description.max}
                          placeholder="What are you building, who is it for, and what does success look like?"
                          value={data.description}
                          onChange={(e) => set('description', e.target.value)}
                          aria-invalid={!!errors.description}
                          aria-describedby={errors.description ? 'description-error' : undefined}
                        />
                      </Field>
                    </>
                  )}
                </div>

                {status === 'error' && (
                  <div className="brief__alert" role="alert">
                    <p>{serverError}</p>
                    <div className="brief__alert-actions">
                      <a href={`mailto:${profile.email}?subject=${encodeURIComponent('Project inquiry')}`}>Email me instead</a>
                      <button type="button" onClick={() => copy('brief', data.description)}>
                        {copied === 'brief' ? 'Copied' : 'Copy your message'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="brief__actions">
                  {step > 0 ? (
                    <button type="button" className="btn btn--light" onClick={back} disabled={sending}>
                      <FiArrowLeft aria-hidden="true" />
                      Back
                    </button>
                  ) : (
                    <span className="brief__meta">Takes about two minutes</span>
                  )}
                  {step < STEPS.length - 1 ? (
                    <button type="submit" className="btn btn--dark" data-magnetic="0.2">
                      Continue
                      <FiArrowRight aria-hidden="true" />
                    </button>
                  ) : (
                    <button type="submit" className={`btn btn--dark ${sending ? 'is-loading' : ''}`} disabled={sending} data-magnetic="0.2">
                      {sending ? (
                        <>
                          <span className="spinner" aria-hidden="true" />
                          Sending…
                        </>
                      ) : (
                        <>
                          {status === 'error' ? 'Try again' : 'Send brief'}
                          <FiSend aria-hidden="true" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
