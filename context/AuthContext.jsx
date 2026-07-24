import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '@/services/auth'

const AuthContext = createContext(null)

// Un compte est réellement premium si le drapeau est actif ET que
// l'échéance n'est pas dépassée. Une échéance nulle = premium accordé
// manuellement sans expiration (support / backoffice).
function computeIsPremium(user) {
  if (!user?.premium) return false
  if (!user.premiumUntil) return true
  return new Date(user.premiumUntil).getTime() > Date.now()
}

function toUser(current) {
  return {
    id: current.id,
    fullName: current.fullName,
    email: current.email,
    premium: current.premium,
    premiumUntil: current.premiumUntil,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Vrai tant qu'on n'a pas essayé de restaurer la session persistée :
  // évite un flash de l'écran de connexion au démarrage.
  const [isAuthLoading, setIsAuthLoading] = useState(true)


  useEffect(() => {
    let active = true
    const restore = async () => {
      try {
        const current = await authApi.fetchCurrentUser()
        if (!active) return
        if (current) {
          setUser(toUser(current))
          return
        }
        // Session non confirmée : jeton absent/expiré OU backend
        // injoignable. On nettoie les jetons en local pour repartir
        // proprement sur l'écran de connexion (pas de splash bloqué).
        await authApi.clearStoredSession().catch(() => {})
        if (active) setUser(null)
      } catch (e) {
        await authApi.clearStoredSession().catch(() => {})
        if (active) setUser(null)
      } finally {
        if (active) setIsAuthLoading(false)
      }
    }
    restore()
    return () => {
      active = false
    }
  }, [])

  // Recharge le profil depuis le serveur (après un achat premium, par
  // exemple) pour rafraîchir le statut sans se déconnecter.
  const refreshUser = async () => {
    const current = await authApi.fetchCurrentUser()
    if (current) setUser(toUser(current))
    return current
  }

  const isPremium = useMemo(() => computeIsPremium(user), [user])

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
        isPremium,
        refreshUser,
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
