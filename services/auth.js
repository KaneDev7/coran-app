import AsyncStorage from '@react-native-async-storage/async-storage'

// ============================================================
// Service d'authentification — DONNÉES MOCKÉES
// Toutes les fonctions async simulent un appel réseau : il
// suffira de remplacer leur corps par des fetch vers le vrai
// backend sans toucher aux écrans.
// ============================================================

const USER_KEY = 'auth_user'
const MOCK_CODE = '123456'
const MOCK_DELAY_MS = 900

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

// Numéro mobile sénégalais : 9 chiffres commençant par
// 70, 75, 76, 77 ou 78 (sans l'indicatif +221).
export function isValidSenegalPhone(phone) {
  const digits = String(phone).replace(/\D/g, '')
  return /^7[05678]\d{7}$/.test(digits)
}

// "771234567" -> "77 123 45 67"
export function formatSenegalPhone(phone) {
  const digits = String(phone).replace(/\D/g, '').slice(0, 9)
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9),
  ].filter(Boolean)
  return parts.join(' ')
}

// Demande l'envoi d'un code de vérification par SMS.
export async function requestVerificationCode(phone) {
  await wait(MOCK_DELAY_MS)

  if (!isValidSenegalPhone(phone)) {
    return { success: false, error: 'Numéro sénégalais invalide' }
  }

  // MOCK : le backend enverra un vrai SMS. On renvoie le code
  // pour pouvoir l'afficher à l'écran pendant le développement.
  return { success: true, mockCode: MOCK_CODE }
}

// Vérifie le code reçu et crée la session utilisateur.
export async function verifyCode(phone, code) {
  await wait(MOCK_DELAY_MS)

  if (String(code) !== MOCK_CODE) {
    return { success: false, error: 'Code de vérification incorrect' }
  }

  const digits = String(phone).replace(/\D/g, '')
  const user = {
    id: `user_${digits}`,
    phone: digits,
    premium: false,
    createdAt: new Date().toISOString(),
  }

  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
  return { success: true, user }
}

// Session persistée localement.
export async function getStoredUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export async function signOut() {
  await AsyncStorage.removeItem(USER_KEY)
}
