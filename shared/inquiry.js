// Project inquiry: the options and validation rules, shared by the form (browser)
// and the /api/inquiry function (server) so both always agree.

export const PROJECT_TYPES = [
  { id: 'website', label: 'Website development', hint: 'Business sites, portfolios, landing pages' },
  { id: 'frontend', label: 'Frontend development', hint: 'React interfaces, UI from a design' },
  { id: 'fullstack', label: 'Full-stack application', hint: 'Frontend, API and database' },
  { id: 'ai-ml', label: 'AI / ML project', hint: 'Models, data pipelines, AI features' },
  { id: 'collab', label: 'Technical collaboration', hint: 'Hackathons, open source, research' },
  { id: 'other', label: 'Something else', hint: 'An interesting idea that fits none of these' },
]

export const BUDGETS = [
  { id: 'lt-25k', label: 'Under ₹25k' },
  { id: '25-75k', label: '₹25k – ₹75k' },
  { id: '75k-1.5l', label: '₹75k – ₹1.5L' },
  { id: 'gt-1.5l', label: '₹1.5L+' },
  { id: 'unsure', label: 'Not sure yet' },
]

export const TIMELINES = [
  { id: 'asap', label: 'As soon as possible' },
  { id: 'month', label: 'Within a month' },
  { id: '1-3m', label: '1 – 3 months' },
  { id: 'flexible', label: 'Flexible' },
]

export const LIMITS = { name: 100, email: 200, company: 120, description: { min: 20, max: 3000 } }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const ids = (list) => new Set(list.map((o) => o.id))
const TYPE_IDS = ids(PROJECT_TYPES)
const BUDGET_IDS = ids(BUDGETS)
const TIMELINE_IDS = ids(TIMELINES)

export const labelFor = (list, id) => list.find((o) => o.id === id)?.label ?? id

const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')

// Which fields each form step owns; the form validates one step at a time.
export const STEP_FIELDS = [['projectType'], ['budget', 'timeline'], ['name', 'email', 'company', 'description']]

// Returns { value, errors } with trimmed values and a message per invalid field.
export function validateInquiry(input = {}) {
  const value = {
    projectType: clean(input.projectType, 40),
    budget: clean(input.budget, 40),
    timeline: clean(input.timeline, 40),
    name: clean(input.name, LIMITS.name),
    email: clean(input.email, LIMITS.email).toLowerCase(),
    company: clean(input.company, LIMITS.company),
    // keep line breaks in the description, just tidy the ends
    description: typeof input.description === 'string' ? input.description.trim().slice(0, LIMITS.description.max) : '',
  }
  const errors = {}
  if (!TYPE_IDS.has(value.projectType)) errors.projectType = 'Choose the kind of project.'
  if (!BUDGET_IDS.has(value.budget)) errors.budget = 'Choose a budget range, or “Not sure yet”.'
  if (!TIMELINE_IDS.has(value.timeline)) errors.timeline = 'Choose a timeline.'
  if (value.name.length < 2) errors.name = 'Please enter your name.'
  if (!EMAIL.test(value.email)) errors.email = 'Please enter a valid email address.'
  if (value.description.length < LIMITS.description.min)
    errors.description = `Tell me a little more — at least ${LIMITS.description.min} characters.`
  return { value, errors }
}

// A short, readable reference like PP-2611-4K7Q (date + random, no ambiguous characters).
export function makeReference(date = new Date()) {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let tail = ''
  for (let i = 0; i < 4; i++) tail += alphabet[Math.floor(Math.random() * alphabet.length)]
  const dd = String(date.getUTCDate()).padStart(2, '0')
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `PP-${dd}${mm}-${tail}`
}
