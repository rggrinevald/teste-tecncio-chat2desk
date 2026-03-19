import { Link } from 'react-router-dom'
import { RegisterForm } from '../components/RegisterForm'
import { useAuth } from '../hooks/useAuth'
import type { RegisterFormData } from '../schemas'

export const RegisterPage = () => {
  const { register, isLoading, error } = useAuth()

  const handleSubmit = async (data: RegisterFormData): Promise<void> => {
    await register(data.name, data.email, data.password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">MiniCRM</h1>
            <p className="mt-1 text-sm text-gray-500">Crie sua conta</p>
          </div>

          <RegisterForm onSubmit={handleSubmit} error={error} isLoading={isLoading} />

          <p className="mt-4 text-center text-sm text-gray-500">
            Já tem conta?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
