import { Router } from 'express'
import { register, login, refresh, logout } from '../controllers/auth.controller'
import { validate } from '../middlewares/validate.middleware'
import { registerSchema, loginSchema, refreshSchema } from '../lib/schemas'

export const authRouter = Router()

authRouter.post('/register', validate(registerSchema), register)
authRouter.post('/login', validate(loginSchema), login)
authRouter.post('/refresh', validate(refreshSchema), refresh)
authRouter.post('/logout', validate(refreshSchema), logout)
