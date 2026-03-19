import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware } from './middlewares/auth.middleware'
import { authRoutes } from './routes/auth.routes'
import type { Env, Variables } from './types'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.CORS_ORIGIN ?? '*',
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
  return corsMiddleware(c, next)
})

app.get('/health', (c) => c.json({ status: 'ok' }))

app.route('/auth', authRoutes)

app.get('/contacts', authMiddleware, async (c) => {
  const response = await fetch(`${c.env.N8N_URL}/webhook/contacts`, {
    method: 'GET',
    headers: {
      'x-user-id': c.get('userId'),
      'x-user-email': c.get('userEmail'),
    },
  })
  const body = await response.arrayBuffer()
  return new Response(body, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  })
})

app.post('/contacts', authMiddleware, async (c) => {
  const body = await c.req.arrayBuffer()
  const response = await fetch(`${c.env.N8N_URL}/webhook/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': c.get('userId'),
      'x-user-email': c.get('userEmail'),
    },
    body,
  })
  const responseBody = await response.arrayBuffer()
  return new Response(responseBody, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  })
})

app.delete('/contacts/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const response = await fetch(`${c.env.N8N_URL}/webhook/contacts-delete`, {
    method: 'DELETE',
    headers: {
      'x-user-id': c.get('userId'),
      'x-user-email': c.get('userEmail'),
      'x-contact-id': id,
    },
  })
  return new Response(null, { status: response.status })
})

export default app
