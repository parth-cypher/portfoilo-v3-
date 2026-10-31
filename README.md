# portfolio

Parth P Patil's portfolio, v2. Clean, glossy surfaces around one signature idea: a network map of my projects. Every project sits on one of four tracks, all tracks meet at "you are here", and the map fills in as projects ship.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
npm run preview  # preview the build
```

## Before you deploy

- Add your photo at `public/images/portrait.jpg` (4:5, at least 800 × 1000 px). Until then a designed monogram card shows instead.
- Confirm the items marked `TODO` in `src/data/portfolio.js` (FinSecure contribution, Athlete Biography status).

## Work With Me: email setup

`/work-with-me` is a three-step project brief. Submissions go to `api/inquiry.js`, a serverless
function that validates them again on the server, filters spam (hidden honeypot field, minimum
fill time, per-IP rate limit) and emails them through [Resend](https://resend.com). The API key
lives only on the server; nothing secret is ever bundled into the site.

### 1. Create a Resend API key

1. Sign up at resend.com with **parthpatil8106@gmail.com** (or whichever inbox should receive inquiries).
2. Go to **API Keys → Create API key** (permission: *Sending access*). Copy it.

### 2. Local development

```bash
cp .env.example .env.local   # then paste the key after RESEND_API_KEY=
npm run dev                  # the form now sends real email from localhost
```

`.env.local` is gitignored. Restart `npm run dev` after editing it.

### 3. Production (Vercel)

Vercel → your project → **Settings → Environment Variables**, add the same keys, then redeploy.
`vercel.json` already routes `/work-with-me` to the app and leaves `/api/*` to the function.

| Variable | Required | What it does |
|---|---|---|
| `RESEND_API_KEY` | yes | Resend API key. Never prefix it with `VITE_`. |
| `INQUIRY_TO` | no | Inbox for inquiries. Default: `parthpatil8106@gmail.com`. |
| `INQUIRY_FROM` | no | Sender of the notification. Default: Resend's test sender `onboarding@resend.dev`. |
| `CONFIRMATION_FROM` | no | e.g. `Parth Patil <hello@yourdomain.com>`. Set it only after verifying a domain in Resend; clients then get an automatic confirmation email. |

**Without your own domain**, Resend's test sender can only deliver to the email you signed up
with, so: notifications to you work; client confirmations stay off (leave `CONFIRMATION_FROM` empty).
To turn them on, add a domain under **Resend → Domains**, add the DNS records it shows, then set
`CONFIRMATION_FROM` (and optionally `INQUIRY_FROM`) to an address on that domain.

### What visitors see

- Validation on each step, with the same rules enforced again by the server (`shared/inquiry.js`).
- A reference number like `PP-3110-4K7Q`, shown on the success screen and in the email subject.
- If sending fails, the brief stays on screen with "Try again", "Email me instead" and "Copy your message".
- The brief is kept as a draft in the tab (sessionStorage) until it's sent.

## Everything you edit lives in one file

`src/data/portfolio.js` holds every piece of text, link, status and photo path on the site.

### Images

| Where | Put the file at | Then set |
|---|---|---|
| Profile card portrait (4:5) | `public/images/portrait.jpg` | already set in `profile.portrait` |
| Project cover (16:10, ~1600×1000) | `public/images/projects/<id>.png` | that station's `screenshot` field |

Without a screenshot, each project gets a generated cover drawn from its track and status.

### When a project is done

1. Paste the repo URL into its `github` field. Until you do, the site shows "GitHub link coming soon".
2. Add a `demo` link if it has one.
3. Change `status` from `'building'` to `'shipped'`. Its dot fills in on the map and it moves to the top of the status board.
4. Fill in `description`, `highlights` and `stack` wherever they're empty.

### Adding a new project

Copy any station object, give it a unique `id`, pick a `line` (`ai`, `data`, `systems` or `web`) and a `short` name under 21 characters. The map, the status board and the mobile track list all place it automatically.

### Other things you can change

- `nextStops`: the dashed "next" track on the map and the next stops in About. Update it when your goals change.
- `experience`: the Experience section. No dates are shown; add them only once confirmed.
- `announcements`: the "Note to self" lines that rotate under the hero.
- `profile.year`: moves the degree progress bar on the profile card and the "you are here" label on the map.

## Stack

Vite + React 19 + react-icons. All motion is hand-written CSS and small React hooks, with no animation library:

- the opening sequence: a fine line draws Chiplun → Karad → Pune, then the curtain lifts (plays once per session)
- the name rising in letter by letter, then the split-flap status board flipping through every project
- eased, interruptible section scrolling that lands below the floating nav (`src/utils/scroll.js`)
- scroll reveals and subtle parallax from one IntersectionObserver setup (`src/hooks/useMotion.js`, driven by `data-reveal` / `data-parallax`)
- a desktop-only custom cursor with magnetic buttons (`data-magnetic`) and restrained card tilt (`data-tilt`); touch devices keep the native cursor
- a filterable project map with flowing tracks, keyboard stepping (← →) and a detail panel
- a hairline scroll-progress bar and a section index on wide screens

Respects `prefers-reduced-motion`: the opening sequence, reveals, parallax and custom cursor are skipped and animations settle instantly.

Fonts: Geist and Geist Mono, loaded from Google Fonts.
