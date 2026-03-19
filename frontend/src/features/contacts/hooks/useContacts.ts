import { useState, useEffect, useCallback } from 'react'
import { api } from '../../../lib/axios'
import type { Contact, CreateContactPayload } from '../types'

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.get<Contact[]>('/contacts')
      setContacts(Array.isArray(data) ? data : [])
    } catch {
      setError('Erro ao carregar contatos. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createContact = async (payload: CreateContactPayload): Promise<Contact> => {
    const { data } = await api.post<Contact>('/contacts', payload)
    setContacts((prev) => [data, ...prev])
    return data
  }

  const deleteContact = async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`)
    setContacts((prev) => prev.filter((c) => c.id !== id))
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
    refetch: fetchContacts,
  }
}
