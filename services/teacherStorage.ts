import AsyncStorage from '@react-native-async-storage/async-storage'
import type { SavedSession, SessionConfig } from '@/types/models'

// ============================================================
// Sauvegarde/reprise des passages du mode Professeur.
// Propres à chaque utilisateur (clé `teacher_sessions_<userId>`,
// même pattern que les passages hors ligne d'OfflineContext).
// On ne stocke QUE la configuration (pas d'audio) : léger et
// suffisant pour reprendre un drill en un tap.
// ============================================================

const key = (userId?: string | null): string => `teacher_sessions_${userId ?? 'anonymous'}`

export async function getSavedSessions(userId?: string | null): Promise<SavedSession[]> {
  try {
    const raw = await AsyncStorage.getItem(key(userId))
    return raw ? (JSON.parse(raw) as SavedSession[]) : []
  } catch (e) {
    return []
  }
}

// Enregistre une config. Dédoublonne sur (sourate + plage + réciteur
// + répétitions) pour ne pas accumuler de doublons.
export async function saveSession(
  userId: string | null | undefined,
  config: SessionConfig,
): Promise<SavedSession | null> {
  try {
    const existing = await getSavedSessions(userId)
    const isSame = (s: SavedSession): boolean =>
      s.surahIndex === config.surahIndex &&
      s.startVerse === config.startVerse &&
      s.endVerse === config.endVerse &&
      s.reciter === config.reciter &&
      s.repetitions === config.repetitions
    const deduped = existing.filter(s => !isSame(s))
    const entry: SavedSession = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...config,
    }
    const next = [entry, ...deduped]
    await AsyncStorage.setItem(key(userId), JSON.stringify(next))
    return entry
  } catch (e) {
    return null
  }
}

export async function deleteSession(
  userId: string | null | undefined,
  id: number,
): Promise<boolean> {
  try {
    const existing = await getSavedSessions(userId)
    const next = existing.filter(s => s.id !== id)
    await AsyncStorage.setItem(key(userId), JSON.stringify(next))
    return true
  } catch (e) {
    return false
  }
}

// Met à jour (écrase) les paramètres d'une séance enregistrée par son id.
// `patch` contient les champs à modifier (repetitions, rate, sensitivityDb).
export async function updateSession(
  userId: string | null | undefined,
  id: number,
  patch: Partial<SavedSession>,
): Promise<SavedSession | null> {
  try {
    const existing = await getSavedSessions(userId)
    const next = existing.map(s => (s.id === id ? { ...s, ...patch } : s))
    await AsyncStorage.setItem(key(userId), JSON.stringify(next))
    return next.find(s => s.id === id) ?? null
  } catch (e) {
    return null
  }
}
