import { createContext, useContext, useEffect, useState } from 'react'
import {
  getStoredUser,
  requestVerificationCode,
  verifyCode,
  signOut,
} from '@/services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Vrai tant qu'on n'a pas encore lu la session persistée :
  // évite un flash de l'écran de connexion au démarrage.
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    getStoredUser()
      .then(setUser)
      .finally(() => setIsAuthLoading(false))
  }, [])

  const requestCode = phone => requestVerificationCode(phone)

  const confirmCode = async (phone, code) => {
    const result = await verifyCode(phone, code)
    if (result.success) setUser(result.user)
    return result
  }

  const logout = async () => {
    await signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthLoading, requestCode, confirmCode, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
