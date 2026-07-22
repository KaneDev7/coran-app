import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from './api'

// ============================================================
// Client d'authentification branché sur le backend NestJS.
//
// Sécurité de la session côté mobile :
//  - les tokens sont stockés dans SecureStore (Keychain iOS /
//    Keystore Android), PAS dans AsyncStorage en clair ;
//  - l'access token est court (1h) ; la durée de session illimitée
//    est portée par le refresh token, renouvelé par rotation à
//    chaque rafraîchissement.
// ============================================================

const ACCESS_TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'

// ---------- Stockage sécurisé des tokens ----------
// SecureStore (Keychain/Keystore) en priorité. Si le module natif est
// absent — lancement web, ou build de développement antérieur à
// l'installation d'expo-secure-store — on se replie sur AsyncStorage
// pour ne pas bloquer le développement.
// ⚠️ Sur un build de production à jour, c'est TOUJOURS SecureStore
// qui est utilisé.

const secureStorage = {
  async set(key, value) {
    try {
      await SecureStore.setItemAsync(key, value)
    } catch (e) {
      await AsyncStorage.setItem(key, value)
    }
  },
  async get(key) {
    try {
      const value = await SecureStore.getItemAsync(key)
      if (value !== null) return value
    } catch (e) { }
    return AsyncStorage.getItem(key)
  },
  async remove(key) {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch (e) { }
    await AsyncStorage.removeItem(key)
  },
}

async function storeSession(accessToken, refreshToken) {
  await secureStorage.set(ACCESS_TOKEN_KEY, accessToken)
  await secureStorage.set(REFRESH_TOKEN_KEY, refreshToken)
}

async function clearSession() {
  await secureStorage.remove(ACCESS_TOKEN_KEY)
  await secureStorage.remove(REFRESH_TOKEN_KEY)
}

const getAccessToken = () => secureStorage.get(ACCESS_TOKEN_KEY)
const getRefreshToken = () => secureStorage.get(REFRESH_TOKEN_KEY)

// ---------- Appels HTTP ----------

async function request(path, { method = 'POST', body, token } = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const message = Array.isArray(data.message)
        ? data.message[0]
        : data.message
      return {
        success: false,
        status: response.status,
        error: message || 'Une erreur est survenue',
      }
    }
    return { success: true, status: response.status, ...data }
  } catch (e) {
    return {
      success: false,
      status: 0,
      error: 'Serveur injoignable, vérifiez votre connexion',
    }
  }
}

// Appel authentifié avec rafraîchissement automatique : si l'access
// token a expiré (401), on tente UNE rotation du refresh token puis
// on rejoue la requête.
export async function authenticatedRequest(path, options = {}) {
  const token = await getAccessToken()
  let result = await request(path, { ...options, token })

  if (result.status === 401) {
    const refreshed = await tryRefreshSession()
    if (!refreshed) {
      await clearSession()
      return { ...result, sessionExpired: true }
    }
    const newToken = await getAccessToken()
    result = await request(path, { ...options, token: newToken })
  }

  return result
}

async function tryRefreshSession() {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) return false

  const result = await request('/auth/refresh', { body: { refreshToken } })
  if (!result.success) return false

  await storeSession(result.accessToken, result.refreshToken)
  return true
}

// ---------- API d'authentification ----------

export async function register(fullName, email, password) {
  return request('/auth/register', { body: { fullName, email, password } })
}

export async function verifyEmail(email, code) {
  const result = await request('/auth/verify-email', { body: { email, code } })
  if (result.success) {
    await storeSession(result.accessToken, result.refreshToken)
  }
  return result
}

export async function resendCode(email) {
  return request('/auth/resend-code', { body: { email } })
}

export async function login(email, password) {
  const result = await request('/auth/login', { body: { email, password } })
  if (result.success) {
    await storeSession(result.accessToken, result.refreshToken)
  }
  return result
}

export async function forgotPassword(email) {
  return request('/auth/forgot-password', { body: { email } })
}

export async function resetPassword(email, code, newPassword) {
  return request('/auth/reset-password', { body: { email, code, newPassword } })
}

// Recharge la session au démarrage : profil via l'access token stocké,
// avec rafraîchissement automatique si expiré. Timeout après 5s pour éviter le blocage.
export async function fetchCurrentUser() {
  const token = await getAccessToken()
  if (!token) return null

  try {
    // Timeout de 5 secondes pour éviter le blocage indéfini
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )

    const result = await Promise.race([
      authenticatedRequest('/users/me', { method: 'GET' }),
      timeoutPromise,
    ])

    return result.success ? result : null
  } catch (error) {
    // En cas d'erreur ou timeout, on retourne null sans bloquer
    return null
  }
}

export async function signOut() {
  const refreshToken = await getRefreshToken()
  if (refreshToken) {
    // Révoque la session côté serveur (meilleur effort).
    await request('/auth/logout', { body: { refreshToken } })
  }
  await clearSession()
}
