import * as FileSystem from 'expo-file-system/legacy'

// ============================================================
// Cache de lecture (audio + texte) pour les boucles de passage.
//
// Objectif : le PREMIER passage d'un verset paie l'appel réseau ;
// toutes les lectures suivantes (boucle du passage) sont servies
// localement, donc instantanées.
//
// Cohérence de durée : le cache est vidé à chaque changement de
// passage / sourate / réciteur (voir PlayerContext) — il ne vit
// que le temps d'une session d'écoute d'un même passage.
// ============================================================

// Nombre MAXIMUM de versets d'un passage pour activer le cache.
// Au-delà, la boucle est trop longue pour que le cache vaille le
// coût (stockage + bande passante doublée au premier tour).
// ⚙️ Valeur volontairement facile à modifier ici ; elle sera pilotée
// par la configuration globale du backoffice plus tard.
export const CACHE_MAX_VERSE_SPAN = 10

const AUDIO_CACHE_DIR = `${FileSystem.cacheDirectory}playback-audio/`

// Texte des versets : un cache mémoire suffit (petites chaînes,
// vidé en même temps que l'audio).
const textCache = new Map()

async function ensureCacheDir() {
  try {
    const info = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR)
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, {
        intermediates: true,
      })
    }
  } catch (e) { }
}

// La clé inclut le réciteur : pas de mélange de voix possible.
const audioCachePath = key => `${AUDIO_CACHE_DIR}${key}.mp3`

// Renvoie l'uri locale si ce verset est déjà en cache, sinon null.
export async function getCachedAudio(key) {
  try {
    const info = await FileSystem.getInfoAsync(audioCachePath(key))
    return info.exists ? audioCachePath(key) : null
  } catch (e) {
    return null
  }
}

// Télécharge l'audio vers le cache, en arrière-plan (fire-and-forget
// depuis l'appelant). Sans effet si déjà présent.
export async function cacheAudio(key, url) {
  try {
    await ensureCacheDir()
    const path = audioCachePath(key)
    const info = await FileSystem.getInfoAsync(path)
    if (info.exists) return path

    const { uri } = await FileSystem.downloadAsync(url, path)
    return uri
  } catch (e) {
    // Échec silencieux : le cache est une optimisation, jamais bloquant.
    return null
  }
}

export function getCachedText(key) {
  return textCache.get(key) ?? null
}

export function cacheText(key, text) {
  textCache.set(key, text)
}

// Vide TOUT le cache de lecture (audio + texte). Appelé à chaque
// changement de passage/sourate/réciteur pour garder une durée de
// vie cohérente et un stockage borné.
export async function clearPlaybackCache() {
  textCache.clear()
  try {
    await FileSystem.deleteAsync(AUDIO_CACHE_DIR, { idempotent: true })
  } catch (e) { }
}
