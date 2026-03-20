export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  userId: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CreateContactPayload {
  name: string
  email?: string
  phone?: string
}
