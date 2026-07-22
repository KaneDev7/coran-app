import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import * as Haptics from 'expo-haptics'
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av'
import { convertSelectVerset } from '@/helpers'
import { sourates } from '@/constants/sorats.list'
import { getDownloadedAudio, getDownloadedText } from '@/services/downloads'
import { getCachedAudio, cacheAudio, getCachedText, cacheText } from '@/services/cache'
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
  // ---- Configuration (renseignée par l'assistant en 3 étapes) ----
  const [surahIndex, setSurahIndex] = useState(0)
  const [startVerse, setStartVerse] = useState(1)
  const [endVerse, setEndVerse] = useState(7)
  const [repetitions, setRepetitions] = useState(3)
  const [reciter, setReciter] = useState('aymanswoaid')
  const [rate, setRate] = useState(1)
  const [settings, setSettings] = useState({
    sensitivityDb: DEFAULT_SENSITIVITY_DB,
    silenceTimeoutMs: DEFAULT_SILENCE_TIMEOUT_MS,
    promptDelayMs: PROMPT_DELAY_MS,
  })

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

  // Le mode Professeur n'autorise que Ayman Swoaid comme réciteur (les
  // autres sont grisés dans l'UI) : pas de chargement du réciteur
  // persisté par le mode Révision libre, sous peine de désaligner la
  // présélection avec ce qui est affiché comme actif.

  // ---- Sélection depuis l'assistant ----
  const selectSurah = index => {
    setSurahIndex(index)
    setStartVerse(1)
    setEndVerse(sourates[index]?.versets ?? 1)
  }

  // Charge une configuration complète (reprise d'un passage sauvegardé).
  const loadConfig = config => {
    setSurahIndex(config.surahIndex)
    setStartVerse(config.startVerse)
    setEndVerse(config.endVerse)
    setReciter(config.reciter)
    setRepetitions(config.repetitions)
    setRate(config.rate ?? 1)
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
        { shouldPlay: true, rate, shouldCorrectPitch: true, volume: 1 },
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
    await wait(settings.promptDelayMs)
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
      sensitivityDb: settings.sensitivityDb,
      silenceTimeoutMs: settings.silenceTimeoutMs,
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
        setRate,
        setSettings,
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
