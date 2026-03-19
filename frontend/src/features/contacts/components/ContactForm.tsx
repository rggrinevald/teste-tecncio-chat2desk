import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormData } from '../schemas'

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>
  error: string | null
  isLoading: boolean
}

export const ContactForm = ({ onSubmit, error, isLoading }: ContactFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const handleFormSubmit = async (data: ContactFormData): Promise<void> => {
    try {
      await onSubmit(data)
      reset()
    } catch {
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      {error && (
        <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          id="name"
          type="text"
          placeholder="Nome do contato"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && (
          <span className="text-xs text-red-600">{errors.name.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          {...register('email')}
          id="email"
          type="email"
          placeholder="email@exemplo.com (opcional)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && (
          <span className="text-xs text-red-600">{errors.email.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Telefone
        </label>
        <input
          {...register('phone')}
          id="phone"
          type="text"
          placeholder="(11) 99999-9999 (opcional)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.phone && (
          <span className="text-xs text-red-600">{errors.phone.message}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Salvando...' : 'Salvar contato'}
      </button>
    </form>
  )
}
