import { Hono } from 'hono'
import type { Env } from '../types'

export const authRoutes = new Hono<{ Bindings: Env }>()

authRoutes.all('/*', async (c) => {
  const url = new URL(c.req.url)
  const targetUrl = `${c.env.AUTH_SERVICE_URL}${url.pathname}${url.search}`

  const response = await fetch(targetUrl, {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: c.req.raw.body,
  })

  const responseBody = await response.arrayBuffer()

  return new Response(responseBody, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
    },
  })
})
