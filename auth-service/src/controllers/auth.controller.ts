import type { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { AppError } from '../lib/errors'

const handleError = (err: unknown, res: Response): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }
  console.error('[Auth Controller] Unexpected error:', err)
  res.status(500).json({ error: 'Erro interno do servidor' })
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await authService.register(req.body)
    res.status(201).json({ message: 'Usuário criado com sucesso', user })
  } catch (err) {
    handleError(err, res)
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const tokens = await authService.login(req.body)
    res.json(tokens)
  } catch (err) {
    handleError(err, res)
  }
}

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken)
    res.json(tokens)
  } catch (err) {
    handleError(err, res)
  }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    await authService.logout(req.body.refreshToken)
    res.status(204).send()
  } catch (err) {
    handleError(err, res)
  }
}
