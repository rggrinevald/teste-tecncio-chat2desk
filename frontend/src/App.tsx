import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { ContactsPage } from './features/contacts/pages/ContactsPage'
import { NewContactPage } from './features/contacts/pages/NewContactPage'
import { getAccessToken } from './lib/axios'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = Boolean(getAccessToken() ?? localStorage.getItem('refreshToken'))
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <ContactsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts/new"
          element={
            <ProtectedRoute>
              <NewContactPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/contacts" replace />} />
        <Route path="*" element={<Navigate to="/contacts" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
