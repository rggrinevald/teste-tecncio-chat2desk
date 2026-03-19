import { createMiddleware } from 'hono/factory'
import { jwtVerify } from 'jose'
import type { Env, Variables } from '../types'

export const authMiddleware = createMiddleware<{
  Bindings: Env
  Variables: Variables
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Token de autenticação não fornecido' }, 401)
  }

  const token = authHeader.slice(7)
  const secret = new TextEncoder().encode(c.env.JWT_SECRET)

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    })

    c.set('userId', payload.sub as string)
    c.set('userEmail', payload.email as string)

    await next()
  } catch {
    return c.json({ error: 'Token inválido ou expirado' }, 401)
  }
})
