import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'
import { AppError } from '../lib/errors'
import type { RegisterInput, LoginInput } from '../lib/schemas'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface UserPayload {
  id: string
  name: string
  email: string
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not defined')
  return secret
}

const getRefreshTokenTTL = (): number => {
  return Number(process.env.REFRESH_TOKEN_TTL ?? 604800)
}

const getJwtExpiresIn = (): string => {
  return process.env.JWT_EXPIRES_IN ?? '15m'
}

export const authService = {
  async register(data: RegisterInput): Promise<UserPayload> {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      throw new AppError('Email já está em uso', 409)
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true },
    })

    return user
  },

  async login(data: LoginInput): Promise<AuthTokens> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new AppError('Email ou senha inválidos', 401)
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password)
    if (!isPasswordValid) {
      throw new AppError('Email ou senha inválidos', 401)
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, name: user.name },
      getJwtSecret(),
      { expiresIn: getJwtExpiresIn(), algorithm: 'HS256' }
    )

    const refreshToken = crypto.randomUUID()
    const ttl = getRefreshTokenTTL()

    await redis.setex(`refresh:${refreshToken}`, ttl, user.id)

    return { accessToken, refreshToken }
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const userId = await redis.get(`refresh:${refreshToken}`)

    if (!userId) {
      throw new AppError('Refresh token inválido ou expirado', 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      await redis.del(`refresh:${refreshToken}`)
      throw new AppError('Usuário não encontrado', 401)
    }

    const newAccessToken = jwt.sign(
      { sub: user.id, email: user.email, name: user.name },
      getJwtSecret(),
      { expiresIn: getJwtExpiresIn(), algorithm: 'HS256' }
    )

    const newRefreshToken = crypto.randomUUID()
    const ttl = getRefreshTokenTTL()

    await redis.del(`refresh:${refreshToken}`)
    await redis.setex(`refresh:${newRefreshToken}`, ttl, userId)

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  },

  async logout(refreshToken: string): Promise<void> {
    await redis.del(`refresh:${refreshToken}`)
  },
}
