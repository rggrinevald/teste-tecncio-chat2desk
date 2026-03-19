import { Link } from 'react-router-dom'
import { ContactsTable } from '../components/ContactsTable'
import { useContacts } from '../hooks/useContacts'
import { useAuth } from '../../auth/hooks/useAuth'

export const ContactsPage = () => {
  const { contacts, isLoading, error, deleteContact } = useContacts()
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">MiniCRM</h1>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sair
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Contatos</h2>
            {!isLoading && (
              <p className="text-sm text-gray-500 mt-0.5">
                {contacts.length} contato{contacts.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Link
            to="/contacts/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Novo Contato
          </Link>
        </div>

        {isLoading && (
          <div className="text-center py-12 text-gray-500">Carregando contatos...</div>
        )}

        {error && !isLoading && (
          <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <ContactsTable contacts={contacts} onDelete={deleteContact} />
        )}
      </main>
    </div>
  )
}
