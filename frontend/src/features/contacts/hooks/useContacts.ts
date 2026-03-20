import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { api } from '../../../lib/axios'
import type { Contact, CreateContactPayload } from '../types'

export const useContacts = (includeDeleted: boolean = false) => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.get<Contact[]>('/contacts', {
        params: { includeDeleted: includeDeleted ? 'true' : 'false' },
      })
      setContacts(Array.isArray(data) ? data : [])
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setContacts([])
      } else {
        setError('Erro ao carregar contatos. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [includeDeleted])

  const createContact = async (payload: CreateContactPayload): Promise<Contact> => {
    const { data } = await api.post<Contact>('/contacts', payload)
    setContacts((prev) => [data, ...prev])
    return data
  }

  const deleteContact = async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`)
    await fetchContacts()
  }

  // Restaura um contato excluído (soft delete), limpando o campo deletedAt
  const restoreContact = async (id: string): Promise<void> => {
    await api.patch(`/contacts/${id}/restore`)
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, deletedAt: null } : c))
    )
  }

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  return {
    contacts,
    isLoading,
    error,
    createContact,
    deleteContact,
    restoreContact,
    refetch: fetchContacts,
  }
}
