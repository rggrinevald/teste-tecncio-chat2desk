export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface User {
  id: string
  name: string
  email: string
}

export interface RegisterResponse {
  message: string
  user: User
}
