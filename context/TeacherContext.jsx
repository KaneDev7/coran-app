import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av'
import { convertSelectVerset } from '@/helpers'
import { sourates } from '@/constants/sorats.list'
import {
  getDownloadedAudio,
  getDownloadedText,
  downloadAudio,
  downloadText,
  removeDownloadedAudio,
  removeDownloadedText,
} from '@/services/downloads'
import { getCachedAudio, cacheAudio, getCachedText, cacheText } from '@/services/cache'
import {
  saveSession,
  deleteSession,
  getDefaults,
  saveDefaults,
} from '@/services/teacherStorage'
import { useAuth } from '@/context/AuthContext'
import {
  createVoiceDetector,
  ensureMicPermission,
  DEFAULT_SENSITIVITY_DB,
  DEFAULT_SILENCE_TIMEOUT_MS,
} from '@/services/voiceDetector'

// ============================================================
// Domaine : mode Professeur (drill de mémorisation guidé).
// Auto-contenu : ne dépend pas des contextes des onglets.
//
// Phases du drill :
//   idle → reciter → prompt → listening → repeating → (verset/rep
//   suivant) → ... → BOUCLE le passage à l'infini jusqu'à "stop".
// ============================================================

const TeacherContext = createContext(null)

const PROMPT_DELAY_MS = 800

export function TeacherProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id ?? 'anonymous'

  // ---- Configuration (renseignée par l'assistant en 3 étapes) ----
  const [surahIndex, setSurahIndex] = useState(0)
  const [startVerse, setStartVerse] = useState(1)
  const [endVerse, setEndVerse] = useState(7)
  const [repetitions, setRepetitionsState] = useState(3)
  const [reciter, setReciter] = useState('aymanswoaid')
  const [rate, setRate] = useState(1)
  const [settings, setSettings] = useState({
    sensitivityDb: DEFAULT_SENSITIVITY_DB,
    silenceTimeoutMs: DEFAULT_SILENCE_TIMEOUT_MS,
    promptDelayMs: PROMPT_DELAY_MS,
  })

  // ---- Suivi du téléchargement hors ligne des séances enregistrées ----
  // downloadState = { [sessionId]: { versets: { [numVerset]: statut } } }
  // statut ∈ 'pending' | 'downloading' | 'done' | 'error'  (même modèle
  // que OfflineContext du mode libre).
  const [downloadState, setDownloadState] = useState({})
  const downloadStateRef = useRef({})
  const [downloadingId, setDownloadingId] = useState(null)
  const dlKey = `teacher_dl_${userId}`

  const surah = sourates[surahIndex]
  const surahNumber = surah?.numero ?? 1
  const versesCount = surah?.versets ?? 7

  // ---- État runtime du drill (pour l'UI) ----
  const [phase, setPhase] = useState('idle') // idle|reciter|prompt|listening|repeating|paused
  const [currentVerse, setCurrentVerse] = useState(1)
  const [currentRepetition, setCurrentRepetition] = useState(1)
  const [loopCount, setLoopCount] = useState(0)
  const [verseText, setVerseText] = useState('')
  const [micLevel, setMicLevel] = useState(0)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [startedAt, setStartedAt] = useState(null)

  // ---- Refs moteur (fiables dans les closures async) ----
  const soundRef = useRef(null)
  const detectorRef = useRef(null)
  // Jeton de session : toute opération en vol s'abandonne si le jeton
  // a changé (stop / rejouer / passer / démontage) — anti-course, même
  // principe que PlayerContext.
  const sessionRef = useRef(0)
  const verseRef = useRef(1)
  const repRef = useRef(1)
  const loopRef = useRef(0)
  // Valeurs ajustables EN DIRECT pendant la séance. La chaîne asynchrone
  // du drill s'exécute sur des closures figées au démarrage : on lit donc
  // ces valeurs via des refs pour que les réglages en direct (vitesse,
  // sensibilité) soient pris en compte à chaque verset, pas seulement au
  // premier.
  const rateRef = useRef(1)
  const repetitionsRef = useRef(3)
  const settingsRef = useRef({
    sensitivityDb: DEFAULT_SENSITIVITY_DB,
    silenceTimeoutMs: DEFAULT_SILENCE_TIMEOUT_MS,
    promptDelayMs: PROMPT_DELAY_MS,
  })
  // Vrai quand la config vient d'un passage repris (loadConfig) : on
  // n'écrase alors PAS les réglages par défaut au démarrage.
  const resumedRef = useRef(false)

  // Le mode Professeur n'autorise que Ayman Swoaid comme réciteur (les
  // autres sont grisés dans l'UI) : pas de chargement du réciteur
  // persisté par le mode Révision libre, sous peine de désaligner la
  // présélection avec ce qui est affiché comme actif.

  // Persiste les réglages courants comme valeurs par défaut d'une
  // nouvelle séance (point 4 : l'utilisateur modifie ses défauts).
  const persistDefaults = () => {
    saveDefaults(userId, {
      repetitions: repetitionsRef.current,
      rate: rateRef.current,
      sensitivityDb: settingsRef.current.sensitivityDb,
    })
  }

  // Setter de répétitions : garde la ref à jour (persistance des défauts).
  const setRepetitions = value => {
    repetitionsRef.current = value
    setRepetitionsState(value)
  }

  // ---- Sélection depuis l'assistant ----
  const selectSurah = index => {
    resumedRef.current = false // nouvelle séance : les réglages deviennent les défauts
    setSurahIndex(index)
    setStartVerse(1)
    setEndVerse(sourates[index]?.versets ?? 1)
  }

  // Charge une configuration complète (reprise d'un passage sauvegardé).
  const loadConfig = config => {
    resumedRef.current = true
    setSurahIndex(config.surahIndex)
    setStartVerse(config.startVerse)
    setEndVerse(config.endVerse)
    setReciter(config.reciter)
    repetitionsRef.current = config.repetitions
    setRepetitionsState(config.repetitions)
    const nextRate = config.rate ?? 1
    rateRef.current = nextRate
    setRate(nextRate)
    if (config.sensitivityDb != null) {
      settingsRef.current = { ...settingsRef.current, sensitivityDb: config.sensitivityDb }
      setSettings(s => ({ ...s, sensitivityDb: config.sensitivityDb }))
    }
  }

  // ---- Modes audio (bascule lecture <-> enregistrement) ----
  const setPlaybackMode = () =>
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: true,
    }).catch(() => {})

  const setRecordingMode = () =>
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    }).catch(() => {})

  async function unloadCurrentSound() {
    const current = soundRef.current
    soundRef.current = null
    if (current) {
      try {
        current.setOnPlaybackStatusUpdate(null)
        await current.stopAsync()
      } catch (e) { }
      try {
        await current.unloadAsync()
      } catch (e) { }
    }
  }

  async function stopDetector() {
    const d = detectorRef.current
    detectorRef.current = null
    if (d) {
      try {
        await d.stop()
      } catch (e) { }
    }
  }

  // ---- Chargement du texte (cache → local → API) ----
  async function loadVerseText(ayah, session) {
    const cached = getCachedText(`text_${ayah}`)
    if (cached != null) {
      setVerseText(cached)
      return
    }
    const local = await getDownloadedText(`text_${ayah}`)
    const url = local ? local : `http://api.alquran.cloud/v1/ayah/${ayah}`
    try {
      const res = await fetch(url)
      const data = await res.json()
      if (session !== sessionRef.current) return
      const text = data?.data?.text ?? ''
      setVerseText(text)
      if (text) cacheText(`text_${ayah}`, text)
    } catch (e) {
      if (session === sessionRef.current) setVerseText('')
    }
  }

  // ---- Lecture d'un verset par le réciteur (cache → local → API) ----
  async function reciteCurrentVerse(session) {
    if (session !== sessionRef.current) return
    setPhase('reciter')
    setCurrentVerse(verseRef.current)
    setCurrentRepetition(repRef.current)
    setMicLevel(0)

    await setPlaybackMode()
    await stopDetector()
    await unloadCurrentSound()
    if (session !== sessionRef.current) return

    const ayah = convertSelectVerset({
      surahNumber,
      selectedValue: verseRef.current,
    })
    await loadVerseText(ayah, session)
    if (session !== sessionRef.current) return

    const apiUrl = `https://cdn.islamic.network/quran/audio/64/ar.${reciter}/${ayah}.mp3`
    let uri = apiUrl
    const cacheKey = `${reciter}_${ayah}`
    const cached = await getCachedAudio(cacheKey)
    if (cached) {
      uri = cached
    } else {
      const downloaded = await getDownloadedAudio(`verset_${ayah}`)
      if (downloaded) uri = downloaded
      else cacheAudio(cacheKey, apiUrl) // remplissage en tâche de fond
    }
    if (session !== sessionRef.current) return

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, rate: rateRef.current, shouldCorrectPitch: true, volume: 1 },
        status => {
          if (session !== sessionRef.current) return
          if (status.didJustFinish) afterRecite(session)
        },
      )
      if (session !== sessionRef.current) {
        try {
          await sound.unloadAsync()
        } catch (e) { }
        return
      }
      soundRef.current = sound
    } catch (e) {
      // En cas d'échec de lecture, on passe à l'écoute quand même
      // pour ne pas bloquer le drill.
      afterRecite(session)
    }
  }

  // ---- Après la récitation : petite pause puis écoute ----
  async function afterRecite(session) {
    if (session !== sessionRef.current) return
    setPhase('prompt')
    await wait(settingsRef.current.promptDelayMs)
    if (session !== sessionRef.current) return
    await beginListening(session)
  }

  // ---- Phase d'écoute : détecteur de voix ----
  async function beginListening(session) {
    if (session !== sessionRef.current) return
    setPhase('listening')
    setMicLevel(0)

    await setRecordingMode()
    if (session !== sessionRef.current) return

    const detector = createVoiceDetector({
      sensitivityDb: settingsRef.current.sensitivityDb,
      silenceTimeoutMs: settingsRef.current.silenceTimeoutMs,
    })
    detectorRef.current = detector

    try {
      await detector.start({
        onSpeechStart: () => {
          if (session !== sessionRef.current) return
          setPhase('repeating')
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        },
        onSpeechEnd: () => onUserFinished(session),
        onLevel: level => {
          if (session === sessionRef.current) setMicLevel(level)
        },
      })
    } catch (e) {
      // Micro indisponible : on tente de valider la permission.
      const granted = await ensureMicPermission()
      if (!granted) {
        setPermissionDenied(true)
        stop()
      }
    }
  }

  // ---- L'utilisateur a fini de répéter : on avance ----
  async function onUserFinished(session) {
    if (session !== sessionRef.current) return
    detectorRef.current = null
    setMicLevel(0)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    )
    advanceCursor()
    await reciteCurrentVerse(session)
  }

  // Avance le curseur (répétition → verset → boucle du passage).
  function advanceCursor() {
    if (repRef.current < repetitions) {
      repRef.current += 1
    } else if (verseRef.current < endVerse) {
      verseRef.current += 1
      repRef.current = 1
    } else {
      // Fin du passage : on boucle depuis le début, indéfiniment.
      loopRef.current += 1
      setLoopCount(loopRef.current)
      verseRef.current = startVerse
      repRef.current = 1
    }
  }

  // ---- Commandes exposées à l'UI ----
  async function start() {
    // Nouvelle séance (non reprise) : les réglages utilisés deviennent
    // les valeurs par défaut de la prochaine séance.
    if (!resumedRef.current) persistDefaults()

    sessionRef.current += 1
    const session = sessionRef.current
    verseRef.current = startVerse
    repRef.current = 1
    loopRef.current = 0
    setLoopCount(0)
    setPermissionDenied(false)
    setStartedAt(Date.now())

    const granted = await ensureMicPermission()
    if (!granted) {
      setPermissionDenied(true)
      return
    }
    await reciteCurrentVerse(session)
  }

  async function stop() {
    sessionRef.current += 1 // invalide tout ce qui est en vol
    await stopDetector()
    await unloadCurrentSound()
    await setPlaybackMode()
    setPhase('idle')
    setMicLevel(0)
    setVerseText('')
    setStartedAt(null)
  }

  // Rejoue le verset courant (même répétition).
  async function replayVerse() {
    sessionRef.current += 1
    const session = sessionRef.current
    await stopDetector()
    await reciteCurrentVerse(session)
  }

  // Passe au verset suivant (ou boucle) sans attendre la répétition.
  async function skipVerse() {
    sessionRef.current += 1
    const session = sessionRef.current
    await stopDetector()
    if (verseRef.current < endVerse) {
      verseRef.current += 1
    } else {
      loopRef.current += 1
      setLoopCount(loopRef.current)
      verseRef.current = startVerse
    }
    repRef.current = 1
    await reciteCurrentVerse(session)
  }

  async function pause() {
    sessionRef.current += 1
    await stopDetector()
    await unloadCurrentSound()
    setPhase('paused')
    setMicLevel(0)
  }

  // Reprend au verset/répétition courant.
  async function resume() {
    sessionRef.current += 1
    const session = sessionRef.current
    await reciteCurrentVerse(session)
  }

  // Règle la vitesse. Met à jour l'UI + la ref (lue au prochain verset)
  // ET applique en direct à la récitation en cours.
  const applyRate = value => {
    rateRef.current = value
    setRate(value)
    soundRef.current?.setRateAsync?.(value, true).catch(() => {})
  }

  // Règle la sensibilité du micro. Met à jour l'UI + la ref (lue à la
  // prochaine écoute) ET, si une écoute est en cours, le détecteur en
  // direct — pour que l'ajustement soit immédiat quand le micro « reste
  // bloqué » à cause du bruit de fond.
  const setSensitivity = db => {
    settingsRef.current = { ...settingsRef.current, sensitivityDb: db }
    setSettings(s => ({ ...s, sensitivityDb: db }))
    detectorRef.current?.setSensitivity?.(db)
  }

  // ============================================================
  // Téléchargement hors ligne des séances enregistrées.
  // Réutilise le service `downloads` et le même nommage de fichiers
  // (`verset_<pos>` / `text_<pos>`) que le mode libre : la lecture du
  // drill retombe automatiquement sur les fichiers locaux.
  // ============================================================

  const applyDownloadState = next => {
    downloadStateRef.current = next
    setDownloadState(next)
    AsyncStorage.setItem(dlKey, JSON.stringify(next)).catch(() => {})
  }

  const updateVerseStatus = (sessionId, verseNumber, status) => {
    const prev = downloadStateRef.current
    applyDownloadState({
      ...prev,
      [sessionId]: {
        versets: { ...(prev[sessionId]?.versets || {}), [verseNumber]: status },
      },
    })
  }

  // Télécharge UN verset (audio + texte) et met à jour son statut.
  const downloadVerse = async (session, verseNumber) => {
    const sNumber = sourates[session.surahIndex]?.numero ?? 1
    const position = convertSelectVerset({ surahNumber: sNumber, selectedValue: verseNumber })
    updateVerseStatus(session.id, verseNumber, 'downloading')

    const urlAudio = `https://cdn.islamic.network/quran/audio/64/ar.${session.reciter}/${position}.mp3`
    const urlText = `http://api.alquran.cloud/v1/ayah/${position}`
    const audioUri = await downloadAudio(`verset_${position}`, urlAudio)
    const textUri = await downloadText(`text_${position}`, urlText)

    const ok = Boolean(audioUri && textUri)
    updateVerseStatus(session.id, verseNumber, ok ? 'done' : 'error')
    return ok
  }

  // Télécharge tous les versets d'une séance, séquentiellement. Une
  // erreur sur un verset n'arrête pas les suivants.
  const downloadSession = async session => {
    setDownloadingId(session.id)
    const versets = {}
    for (let i = session.startVerse; i <= session.endVerse; i++) versets[i] = 'pending'
    applyDownloadState({ ...downloadStateRef.current, [session.id]: { versets } })

    for (let i = session.startVerse; i <= session.endVerse; i++) {
      await downloadVerse(session, i)
    }
    setDownloadingId(null)
  }

  // Enregistre la config courante ET lance son téléchargement hors ligne.
  // Renvoie l'entrée créée (avec son id) pour la navigation.
  const saveSessionOffline = async () => {
    // Les réglages utilisés pour ce passage deviennent aussi les défauts.
    persistDefaults()
    const config = {
      surahIndex,
      startVerse,
      endVerse,
      reciter,
      repetitions: repetitionsRef.current,
      rate: rateRef.current,
      sensitivityDb: settingsRef.current.sensitivityDb,
    }
    const entry = await saveSession(userId, config)
    if (entry) downloadSession(entry) // en tâche de fond
    return entry
  }

  // Relance UNIQUEMENT le verset échoué d'une séance.
  const retryVerse = async (session, verseNumber) => {
    await downloadVerse(session, verseNumber)
  }

  // Supprime une séance : config + fichiers téléchargés + suivi.
  const removeSessionOffline = async session => {
    await deleteSession(userId, session.id)
    const sNumber = sourates[session.surahIndex]?.numero ?? 1
    for (let i = session.startVerse; i <= session.endVerse; i++) {
      const position = convertSelectVerset({ surahNumber: sNumber, selectedValue: i })
      await removeDownloadedAudio(`verset_${position}`)
      await removeDownloadedText(`text_${position}`)
    }
    const { [session.id]: _omit, ...rest } = downloadStateRef.current
    applyDownloadState(rest)
  }

  // Au montage / changement d'utilisateur : charge le suivi persisté (les
  // téléchargements interrompus 'pending'/'downloading' → 'error' pour
  // proposer un nouvel essai) et les réglages par défaut.
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(dlKey)
        const stored = raw ? JSON.parse(raw) : {}
        for (const sid of Object.keys(stored)) {
          const versets = stored[sid]?.versets || {}
          for (const v of Object.keys(versets)) {
            if (versets[v] === 'pending' || versets[v] === 'downloading') versets[v] = 'error'
          }
        }
        downloadStateRef.current = stored
        setDownloadState(stored)
      } catch (e) {
        downloadStateRef.current = {}
        setDownloadState({})
      }

      const defaults = await getDefaults(userId)
      if (defaults) {
        if (defaults.repetitions != null) {
          repetitionsRef.current = defaults.repetitions
          setRepetitionsState(defaults.repetitions)
        }
        if (defaults.rate != null) {
          rateRef.current = defaults.rate
          setRate(defaults.rate)
        }
        if (defaults.sensitivityDb != null) {
          settingsRef.current = { ...settingsRef.current, sensitivityDb: defaults.sensitivityDb }
          setSettings(s => ({ ...s, sensitivityDb: defaults.sensitivityDb }))
        }
      }
    }
    load()
  }, [userId])

  // Nettoyage au démontage du provider.
  useEffect(() => {
    return () => {
      sessionRef.current += 1
      stopDetector()
      unloadCurrentSound()
      setPlaybackMode()
    }
  }, [])

  return (
    <TeacherContext.Provider
      value={{
        // config
        surahIndex,
        surah,
        surahNumber,
        versesCount,
        startVerse,
        endVerse,
        repetitions,
        reciter,
        rate,
        settings,
        selectSurah,
        loadConfig,
        setStartVerse,
        setEndVerse,
        setRepetitions,
        setReciter,
        setRate: applyRate,
        setSettings,
        setSensitivity,
        // runtime
        phase,
        currentVerse,
        currentRepetition,
        loopCount,
        verseText,
        micLevel,
        permissionDenied,
        setPermissionDenied,
        startedAt,
        // commandes
        start,
        stop,
        pause,
        resume,
        replayVerse,
        skipVerse,
        // hors ligne (séances enregistrées)
        downloadState,
        downloadingId,
        saveSessionOffline,
        retryVerse,
        removeSessionOffline,
      }}
    >
      {children}
    </TeacherContext.Provider>
  )
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const useTeacher = () => useContext(TeacherContext)
