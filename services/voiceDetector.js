import { Audio } from 'expo-av'

// ============================================================
// Détecteur de voix (VAD) par AMPLITUDE — hors ligne.
//
// Utilise l'enregistrement micro d'expo-av avec le "metering"
// (niveau sonore en dBFS) pour repérer :
//   - le DÉBUT de la voix : niveau au-dessus du seuil pendant
//     quelques frames consécutives (évite les clics parasites) ;
//   - la FIN de la voix : niveau sous le seuil en continu pendant
//     `silenceTimeoutMs`.
//
// ⚠️ Détecte la PRÉSENCE de la voix, pas l'exactitude de la
// récitation. Les valeurs ci-dessous sont volontairement faciles
// à ajuster ici (pilotables par la config globale du backoffice
// plus tard, comme CACHE_MAX_VERSE_SPAN).
// ============================================================

// Seuil de voix en dBFS. Le metering va de ~-160 (silence) à 0 (max).
// Au-dessus de ce seuil = on considère qu'il y a de la voix.
export const DEFAULT_SENSITIVITY_DB = -35
// Durée de silence continu qui marque la fin d'une répétition.
export const DEFAULT_SILENCE_TIMEOUT_MS = 1500
// Nombre de frames consécutives au-dessus du seuil pour valider le
// début de la voix (à ~100 ms/frame → ~250 ms).
const ONSET_FRAMES = 3
// Fréquence de lecture du niveau sonore.
const METER_INTERVAL_MS = 100

// Normalise un niveau dBFS vers 0..1 pour l'affichage du mètre.
export function normalizeLevel(db) {
  if (db == null) return 0
  return Math.max(0, Math.min(1, (db + 60) / 60))
}

// Demande (ou vérifie) la permission micro. Renvoie un booléen.
export async function ensureMicPermission() {
  try {
    const current = await Audio.getPermissionsAsync()
    if (current.granted) return true
    const asked = await Audio.requestPermissionsAsync()
    return asked.granted
  } catch (e) {
    return false
  }
}

// Crée un détecteur à usage unique par phase d'écoute.
// callbacks : { onSpeechStart, onSpeechEnd, onLevel }
export function createVoiceDetector({
  sensitivityDb = DEFAULT_SENSITIVITY_DB,
  silenceTimeoutMs = DEFAULT_SILENCE_TIMEOUT_MS,
} = {}) {
  let recording = null
  let stopped = false
  let hasSpoken = false
  let onsetCount = 0
  let silenceStart = null
  let cbs = {}

  function handleStatus(status) {
    if (stopped || !status || !status.isRecording) return

    const db = status.metering ?? -160
    cbs.onLevel?.(normalizeLevel(db))

    const isLoud = db > sensitivityDb

    if (!hasSpoken) {
      // Attente de l'onset de la voix.
      if (isLoud) {
        onsetCount += 1
        if (onsetCount >= ONSET_FRAMES) {
          hasSpoken = true
          silenceStart = null
          cbs.onSpeechStart?.()
        }
      } else {
        onsetCount = 0
      }
      return
    }

    // La voix a commencé : on guette un silence prolongé.
    if (isLoud) {
      silenceStart = null
    } else {
      if (silenceStart == null) {
        silenceStart = Date.now()
      } else if (Date.now() - silenceStart >= silenceTimeoutMs) {
        const done = cbs.onSpeechEnd
        // Stop d'abord pour libérer le micro, puis notifie.
        stop().then(() => done?.())
      }
    }
  }

  async function start(callbacks) {
    cbs = callbacks || {}
    stopped = false
    hasSpoken = false
    onsetCount = 0
    silenceStart = null

    const options = {
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
    }
    const { recording: rec } = await Audio.Recording.createAsync(
      options,
      handleStatus,
      METER_INTERVAL_MS,
    )
    recording = rec
  }

  async function stop() {
    if (stopped) return
    stopped = true
    const rec = recording
    recording = null
    if (rec) {
      try {
        await rec.stopAndUnloadAsync()
      } catch (e) { }
    }
  }

  return { start, stop }
}
