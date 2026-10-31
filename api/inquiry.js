// POST /api/inquiry — receives a project inquiry and emails it through Resend.
//
// Runs as a Vercel serverless function in production, and through a small Vite
// middleware in local dev (see vite.config.js). Secrets come from environment
// variables only; see README → "Work With Me: email setup".
//
//   RESEND_API_KEY     required  Resend API key (server-side only, never in the browser)
//   INQUIRY_TO         optional  inbox that receives inquiries (defaults to the site email)
//   INQUIRY_FROM       optional  sender for the notification (defaults to Resend's test sender)
//   CONFIRMATION_FROM  optional  sender on a domain verified in Resend; when set, the client
//                                also gets a confirmation email. Leave unset without a domain.

import { BUDGETS, PROJECT_TYPES, TIMELINES, labelFor, makeReference, validateInquiry } from '../shared/inquiry.js'

const DEFAULT_TO = 'parthpatil8106@gmail.com'
const DEFAULT_FROM = 'Parth Patil Portfolio <onboarding@resend.dev>'
const MIN_FILL_MS = 3000 // humans don't finish a three-step form in under 3 seconds
const RATE = { max: 5, windowMs: 10 * 60 * 1000 }

// Best-effort rate limit per IP. Serverless instances are short-lived and not shared,
// so this blunts bursts rather than guaranteeing a global limit.
const hits = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > RATE.max
}

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body)
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > 20000) throw new Error('too large')
  }
  return raw ? JSON.parse(raw) : {}
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function summary(v) {
  return [
    ['Project type', labelFor(PROJECT_TYPES, v.projectType)],
    ['Budget', labelFor(BUDGETS, v.budget)],
    ['Timeline', labelFor(TIMELINES, v.timeline)],
    ['Name', v.name],
    ['Email', v.email],
    ['Company', v.company || '—'],
  ]
}

function layout(title, intro, rows, message, ref) {
  const tr = rows
    .map(
      ([k, val]) =>
        `<tr><td style="padding:8px 16px 8px 0;color:#646b7b;font-size:13px;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:8px 0;color:#0e1320;font-size:14px">${esc(val)}</td></tr>`,
    )
    .join('')
  return `<!doctype html><html><body style="margin:0;background:#eef0f3;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
  <div style="background:#ffffff;border:1px solid #e3e6eb;border-radius:16px;padding:28px">
    <p style="margin:0 0 6px;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#8b7bd8;letter-spacing:.06em">${esc(ref)}</p>
    <h1 style="margin:0 0 8px;font-size:22px;color:#0e1320;letter-spacing:-.02em">${esc(title)}</h1>
    <p style="margin:0 0 20px;color:#4a5162;font-size:14px;line-height:1.6">${esc(intro)}</p>
    <table style="border-collapse:collapse;width:100%;border-top:1px solid #eef0f3">${tr}</table>
    <div style="margin-top:20px;padding:16px;border-radius:12px;background:#f5f6f8;color:#0e1320;font-size:14px;line-height:1.6;white-space:pre-wrap">${esc(message)}</div>
  </div>
  <p style="margin:16px 0 0;text-align:center;color:#8a90a0;font-size:12px">Parth Patil · Pune, India</p>
</div></body></html>`
}

const text = (title, rows, message, ref) => `${title}\nRef: ${ref}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${message}\n`

async function resend(apiKey, payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!r.ok) {
    const detail = await r.text().catch(() => '')
    throw new Error(`Resend ${r.status}: ${detail.slice(0, 300)}`)
  }
  return r.json()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return send(res, 405, { error: 'Method not allowed.' })
  }

  let body
  try {
    body = await readJson(req)
  } catch {
    return send(res, 400, { error: 'The request could not be read. Please try again.' })
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  if (rateLimited(ip)) {
    return send(res, 429, { error: 'Too many messages in a short time. Please wait a few minutes, or email me directly.' })
  }

  // Spam: a filled hidden field, or a form completed impossibly fast. Bots get a
  // normal-looking reply so they don't adapt; nothing is sent.
  const elapsed = Date.now() - Number(body.startedAt || 0)
  if (body.website || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) {
    return send(res, 200, { ok: true, reference: makeReference() })
  }

  const { value, errors } = validateInquiry(body)
  if (Object.keys(errors).length) {
    return send(res, 422, { error: 'Some fields need attention.', fields: errors })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[inquiry] RESEND_API_KEY is not set')
    return send(res, 503, { error: 'The inquiry service is not configured yet. Please email me directly.' })
  }

  const reference = makeReference()
  const rows = summary(value)
  const type = labelFor(PROJECT_TYPES, value.projectType)

  try {
    await resend(apiKey, {
      from: process.env.INQUIRY_FROM || DEFAULT_FROM,
      to: [process.env.INQUIRY_TO || DEFAULT_TO],
      reply_to: value.email,
      subject: `New inquiry ${reference} · ${type} · ${value.name}`,
      html: layout('New project inquiry', `${value.name} sent a project brief through your portfolio. Reply to this email to answer them directly.`, rows, value.description, reference),
      text: text('New project inquiry', rows, value.description, reference),
    })
  } catch (err) {
    console.error('[inquiry] notification failed', err)
    return send(res, 502, { error: 'Your message could not be delivered right now. Please try again, or email me directly.' })
  }

  // The client confirmation needs a verified sending domain; it never blocks success.
  let confirmed = false
  if (process.env.CONFIRMATION_FROM) {
    try {
      await resend(apiKey, {
        from: process.env.CONFIRMATION_FROM,
        to: [value.email],
        reply_to: process.env.INQUIRY_TO || DEFAULT_TO,
        subject: `Thanks for reaching out — ${reference}`,
        html: layout(
          'Message received. Thanks for reaching out!',
          `Hi ${value.name.split(' ')[0]}, I’ll review your inquiry and get back to you as soon as possible. Here’s a copy of what you sent.`,
          rows,
          value.description,
          reference,
        ),
        text: text('Message received. Thanks for reaching out!', rows, value.description, reference),
      })
      confirmed = true
    } catch (err) {
      console.error('[inquiry] confirmation failed', err)
    }
  }

  return send(res, 200, { ok: true, reference, confirmed })
}
