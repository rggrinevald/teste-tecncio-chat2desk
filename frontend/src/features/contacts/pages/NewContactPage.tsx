import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ContactForm } from '../components/ContactForm'
import { useContacts } from '../hooks/useContacts'
import type { ContactFormData } from '../schemas'

export const NewContactPage = () => {
  const navigate = useNavigate()
  const { createContact } = useContacts()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: ContactFormData): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await createContact({
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
      })
      navigate('/contacts')
    } catch (err) {
      setError('Erro ao criar contato. Tente novamente.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/contacts" className="text-gray-400 hover:text-gray-600 transition-colors">
            ← Voltar
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Novo Contato</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <ContactForm onSubmit={handleSubmit} error={error} isLoading={isLoading} />
        </div>
      </main>
    </div>
  )
}
