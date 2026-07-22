import AsyncStorage from '@react-native-async-storage/async-storage'

// ============================================================
// Sauvegarde/reprise des passages du mode Professeur.
// Propres à chaque utilisateur (clé `teacher_sessions_<userId>`,
// même pattern que les passages hors ligne d'OfflineContext).
// On ne stocke QUE la configuration (pas d'audio) : léger et
// suffisant pour reprendre un drill en un tap.
// ============================================================

const key = userId => `teacher_sessions_${userId ?? 'anonymous'}`

export async function getSavedSessions(userId) {
  try {
    const raw = await AsyncStorage.getItem(key(userId))
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

// Enregistre une config. Dédoublonne sur (sourate + plage + réciteur
// + répétitions) pour ne pas accumuler de doublons.
export async function saveSession(userId, config) {
  try {
    const existing = await getSavedSessions(userId)
    const isSame = s =>
      s.surahIndex === config.surahIndex &&
      s.startVerse === config.startVerse &&
      s.endVerse === config.endVerse &&
      s.reciter === config.reciter &&
      s.repetitions === config.repetitions
    const deduped = existing.filter(s => !isSame(s))
    const entry = { id: Date.now(), createdAt: new Date().toISOString(), ...config }
    const next = [entry, ...deduped]
    await AsyncStorage.setItem(key(userId), JSON.stringify(next))
    return entry
  } catch (e) {
    return null
  }
}

export async function deleteSession(userId, id) {
  try {
    const existing = await getSavedSessions(userId)
    const next = existing.filter(s => s.id !== id)
    await AsyncStorage.setItem(key(userId), JSON.stringify(next))
    return true
  } catch (e) {
    return false
  }
}
