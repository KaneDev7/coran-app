import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '@/services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Vrai tant qu'on n'a pas essayé de restaurer la session persistée :
  // évite un flash de l'écran de connexion au démarrage.
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    authApi
      .fetchCurrentUser()
      .then(current => {
        if (current) {
          setUser({
            id: current.id,
            fullName: current.fullName,
            email: current.email,
            premium: current.premium,
            premiumUntil: current.premiumUntil,
          })
        }
      })
      .finally(() => setIsAuthLoading(false))
  }, [])

  const register = (fullName, email, password) =>
    authApi.register(fullName, email, password)

  const confirmEmail = async (email, code) => {
    const result = await authApi.verifyEmail(email, code)
    if (result.success) setUser(result.user)
    return result
  }

  const resendCode = email => authApi.resendCode(email)

  const login = async (email, password) => {
    const result = await authApi.login(email, password)
    if (result.success) setUser(result.user)
    return result
  }

  const forgotPassword = email => authApi.forgotPassword(email)

  const resetPassword = (email, code, newPassword) =>
    authApi.resetPassword(email, code, newPassword)

  const logout = async () => {
    await authApi.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        register,
        confirmEmail,
        resendCode,
        login,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
