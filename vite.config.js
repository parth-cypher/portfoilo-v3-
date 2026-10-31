import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Local dev only: serve api/*.js handlers the way Vercel does in production,
// so the Work With Me form can be tested end to end with `npm run dev`.
function devApi() {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use('/api/inquiry', async (req, res) => {
        try {
          const { default: handler } = await server.ssrLoadModule('/api/inquiry.js')
          await handler(req, res)
        } catch (err) {
          server.config.logger.error(String(err?.stack || err))
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Local API error.' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Make .env / .env.local values (e.g. RESEND_API_KEY) visible to the dev API.
  // Only VITE_-prefixed values ever reach browser code, so secrets stay server-side.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), devApi()],
  }
})
