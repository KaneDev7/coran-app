import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '@/services/auth'
import type { ApiResult, User } from '@/types/models'

interface AuthContextValue {
  user: User | null
  isPremium: boolean
  refreshUser: () => Promise<ApiResult | null>
  isAuthLoading: boolean
  register: (fullName: string, email: string, password: string) => Promise<ApiResult>
  confirmEmail: (email: string, code: string) => Promise<ApiResult>
  resendCode: (email: string) => Promise<ApiResult>
  login: (email: string, password: string) => Promise<ApiResult>
  forgotPassword: (email: string) => Promise<ApiResult>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<ApiResult>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Un compte est réellement premium si le drapeau est actif ET que
// l'échéance n'est pas dépassée. Une échéance nulle = premium accordé
// manuellement sans expiration (support / backoffice).
function computeIsPremium(user: User | null): boolean {
  if (!user?.premium) return false
  if (!user.premiumUntil) return true
  return new Date(user.premiumUntil).getTime() > Date.now()
}

function toUser(current: Record<string, any>): User {
  return {
    id: current.id,
    fullName: current.fullName,
    email: current.email,
    premium: current.premium,
    premiumUntil: current.premiumUntil,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
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
  const refreshUser = async (): Promise<ApiResult | null> => {
    const current = await authApi.fetchCurrentUser()
    if (current) setUser(toUser(current))
    return current
  }

  const isPremium = useMemo(() => computeIsPremium(user), [user])

  const register = (fullName: string, email: string, password: string) =>
    authApi.register(fullName, email, password)

  const confirmEmail = async (email: string, code: string): Promise<ApiResult> => {
    const result = await authApi.verifyEmail(email, code)
    if (result.success) setUser(result.user as User)
    return result
  }

  const resendCode = (email: string) => authApi.resendCode(email)

  const login = async (email: string, password: string): Promise<ApiResult> => {
    const result = await authApi.login(email, password)
    if (result.success) setUser(result.user as User)
    return result
  }

  const forgotPassword = (email: string) => authApi.forgotPassword(email)

  const resetPassword = (email: string, code: string, newPassword: string) =>
    authApi.resetPassword(email, code, newPassword)

  const logout = async (): Promise<void> => {
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

export const useAuth = (): AuthContextValue => useContext(AuthContext) as AuthContextValue
