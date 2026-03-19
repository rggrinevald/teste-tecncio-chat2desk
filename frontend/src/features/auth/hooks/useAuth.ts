import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setAccessToken } from '../../../lib/axios'
import type { AuthTokens, RegisterResponse } from '../types'

export const useAuth = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.post<AuthTokens>('/auth/login', { email, password })
      setAccessToken(data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      navigate('/contacts')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await api.post<RegisterResponse>('/auth/register', { name, email, password })
      navigate('/login')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken }).catch(() => {})
    }
    setAccessToken(null)
    localStorage.removeItem('refreshToken')
    navigate('/login')
  }

  return { login, register, logout, isLoading, error }
}

function getErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    err.response &&
    typeof err.response === 'object' &&
    'data' in err.response &&
    err.response.data &&
    typeof err.response.data === 'object' &&
    'error' in err.response.data
  ) {
    return String((err.response.data as { error: string }).error)
  }
  return 'Ocorreu um erro. Tente novamente.'
}
