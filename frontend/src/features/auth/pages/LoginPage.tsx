import { Link } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'
import type { LoginFormData } from '../schemas'

export const LoginPage = () => {
  const { login, isLoading, error } = useAuth()

  const handleSubmit = async (data: LoginFormData): Promise<void> => {
    await login(data.email, data.password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">MiniCRM</h1>
            <p className="mt-1 text-sm text-gray-500">Entre com sua conta</p>
          </div>

          <LoginForm onSubmit={handleSubmit} error={error} isLoading={isLoading} />

          <p className="mt-4 text-center text-sm text-gray-500">
            Não tem conta?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
