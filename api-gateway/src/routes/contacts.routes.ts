import { Hono } from 'hono'
import { authMiddleware } from '../middlewares/auth.middleware'
import type { Env, Variables } from '../types'

export const contactRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

contactRoutes.use('/*', authMiddleware)

contactRoutes.get('/', async (c) => {
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

contactRoutes.post('/', async (c) => {
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

contactRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')

  const response = await fetch(`${c.env.N8N_URL}/webhook/contacts/${id}`, {
    method: 'DELETE',
    headers: {
      'x-user-id': c.get('userId'),
      'x-user-email': c.get('userEmail'),
    },
  })

  return new Response(null, { status: response.status })
})
