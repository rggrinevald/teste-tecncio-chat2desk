import { useState } from 'react'
import type { Contact } from '../types'

interface ContactsTableProps {
  contacts: Contact[]
  onDelete: (id: string) => Promise<void>
}

export const ContactsTable = ({ contacts, onDelete }: ContactsTableProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string): Promise<void> => {
    if (!window.confirm(`Deseja remover o contato "${name}"?`)) return
    setDeletingId(id)
    setError(null)
    try {
      await onDelete(id)
    } catch {
      setError(`Erro ao remover o contato "${name}". Tente novamente.`)
    } finally {
      setDeletingId(null)
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Nenhum contato cadastrado</p>
        <p className="text-sm mt-1">Clique em "Novo Contato" para adicionar um.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts.map((contact) => (
              <tr key={contact.id} className="bg-white hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{contact.name}</td>
                <td className="px-4 py-3 text-gray-600">{contact.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{contact.phone ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(contact.id, contact.name)}
                    disabled={deletingId === contact.id}
                    className="text-red-600 hover:text-red-800 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {deletingId === contact.id ? 'Removendo...' : 'Remover'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
