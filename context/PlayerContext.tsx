import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react'
import {
  Audio,
  InterruptionModeIOS,
  InterruptionModeAndroid,
  type AVPlaybackStatus,
} from 'expo-av'
import { convertSelectVerset } from '@/helpers'
import { sourates } from '@/constants/sorats.list'
import type { Lesson } from '@/types/models'
import {
  downloadText,
  getDownloadedAudio,
  getDownloadedText,
} from '@/services/downloads'
import {
  CACHE_MAX_VERSE_SPAN,
  getCachedAudio,
  cacheAudio,
  getCachedText,
  cacheText,
  clearPlaybackCache,
} from '@/services/cache'
import { useReciter } from './ReciterContext'
import { useLibrary } from './LibraryContext'
import { useOffline } from './OfflineContext'

interface PlayerContextValue {
  sound: Audio.Sound | null
  setSound: Dispatch<SetStateAction<Audio.Sound | null>>
  playSound: (uri: string) => Promise<void>
  initParams: () => Promise<void>
  initAudio: (index: number) => Promise<void>
  loadNewSound: (index: number) => Promise<void>
  loadSelectLesson: (item: Lesson) => Promise<void>
  exitOfflineMode: () => Promise<void>
  startUrl: string
  coranText: string
  setCorantText: Dispatch<SetStateAction<string>>
  isPlaying: boolean
  setIsplaying: Dispatch<SetStateAction<boolean>>
  isPause: boolean
  setIsPause: Dispatch<SetStateAction<boolean>>
  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>
  isFirstStart: boolean
  setIsFirstStart: Dispatch<SetStateAction<boolean>>
  playPauseIcon: string
  setPlayPauseIcon: Dispatch<SetStateAction<string>>
  duration: number
  timeUpdate: number
  volume: number
  setVolume: Dispatch<SetStateAction<number>>
  rate: number
  setRate: Dispatch<SetStateAction<number>>
  connectionError: boolean
  setConnectionError: Dispatch<SetStateAction<boolean>>
  disabled: boolean
}

// Domaine : moteur de lecture audio.
// Consomme ReciterContext (URL API), LibraryContext (plage de versets)
// et OfflineContext (source locale vs API).
const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { reciter } = useReciter()
  const {
    surahNumber,
    setSurahNumber,
    setCurrentIndex,
    setSurahTextValue,
    selectSartVerset,
    setSelectSartVerset,
    selectEndVerset,
    setSelectEndVerset,
    setCurrentSlide,
    setLastVersetOfSelectedSurah,
  } = useLibrary()
  const { isOfflineModeRef, enableOfflineMode, disableOfflineMode, setOfflineError } =
    useOffline()

  const [startUrl, setStartUrl] = useState('')
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [startPlayVerset, setStartPlayVerset] = useState(1)
  const [endPlayVerset, setEndPlayVerset] = useState(7)
  const [coranText, setCorantText] = useState('')
  const [isPlaying, setIsplaying] = useState(false)
  const [playPauseIcon, setPlayPauseIcon] = useState('play')
  const [isFirstStart, setIsFirstStart] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [duration, setDuration] = useState(0)
  const [timeUpdate, setTimeUpdate] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [rate, setRate] = useState(1)
  const [connectionError, setConnectionError] = useState(false)
  const [isPause, setIsPause] = useState(false)

  // Référence toujours à jour du son courant (le state `sound` est
  // asynchrone et ne peut pas être utilisé de façon fiable dans les
  // closures).
  const soundRef = useRef<Audio.Sound | null>(null)
  // Verrou d'idempotence : vrai tant qu'un audio est en cours de
  // chargement. Empêche deux lectures simultanées.
  const isBusyRef = useRef(false)
  // Jeton de session de lecture : incrémenté à chaque réinitialisation
  // (changement de passage, de sourate, stop...). Toute opération audio
  // en vol compare son jeton et S'ABANDONNE s'il a changé — c'est ce qui
  // empêche l'ancien passage de continuer après sélection d'un nouveau.
  const playbackSessionRef = useRef(0)

  const disabled = isPlaying || isPause

  let currentVerset = startPlayVerset

  async function loadSelectAudio(
    surahNumber: number,
    selectVerst: { start: number; end: number },
  ) {
    const startPlayVersetUpdate = convertSelectVerset({
      surahNumber,
      selectedValue: selectVerst.start,
    })
    const endPlayVersetUpdate = convertSelectVerset({
      surahNumber,
      selectedValue: selectVerst.end,
    })

    setStartPlayVerset(startPlayVersetUpdate)
    setEndPlayVerset(endPlayVersetUpdate)
    setStartUrl(
      `https://cdn.islamic.network/quran/audio/64/ar.${reciter}/${startPlayVersetUpdate}.mp3`
    )
  }

  // Décharge complètement le son courant (stop + unload) et détache son
  // callback pour qu'aucun statut périmé ne relance une lecture.
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

  async function initParams() {
    // Invalide immédiatement toute opération audio en vol (chargement,
    // enchaînement de verset...) avant de nettoyer.
    playbackSessionRef.current += 1
    await unloadCurrentSound()
    setSound(null)
    setIsFirstStart(true)
    setIsplaying(false)
    setIsLoading(false)
    setIsPause(false)
    setPlayPauseIcon('play')
    setCorantText('')
    setDuration(0)
    setTimeUpdate(0)
  }

  // Point d'entrée UNIQUE du mode hors ligne : sélection d'une section
  // sauvegardée depuis la page hors ligne.
  async function loadSelectLesson(item: Lesson) {
    const { selectSartVerset, selectEndVerset, index, surahNumber } = item
    await initParams()
    // L'id permet d'afficher l'indicateur "en écoute" sur le passage.
    enableOfflineMode(item.id)
    loadSelectAudio(surahNumber, {
      start: selectSartVerset,
      end: selectEndVerset,
    })
    setSelectSartVerset(selectSartVerset)
    setSelectEndVerset(selectEndVerset)
    setCurrentSlide(selectSartVerset)
    setSurahTextValue(sourates[index].nom)
    setSurahNumber(sourates[index].numero)
  }

  // Sortie explicite du mode hors ligne (bouton "Quitter" du bandeau).
  async function exitOfflineMode() {
    await initParams()
    disableOfflineMode()
  }

  const loadNewSound = async (index: number) => {
    await initParams()
    setCurrentSlide(selectSartVerset)
    setSurahTextValue(sourates[index].nom)
    setSurahNumber(sourates[index].numero)
  }

  const initAudio = async (index: number) => {
    // Choisir une sourate depuis la liste fait sortir du mode hors ligne.
    disableOfflineMode()
    await loadNewSound(index)
    setCurrentIndex(index)
    setCurrentSlide(1)
    setLastVersetOfSelectedSurah(sourates[index]?.versets ?? 7)
  }

  // Cache activé seulement si la boucle du passage est assez courte
  // pour que le gain soit réel (voir CACHE_MAX_VERSE_SPAN).
  const isCachingEnabled = () =>
    endPlayVerset - startPlayVerset + 1 <= CACHE_MAX_VERSE_SPAN

  async function getCoranText(number: number) {
    // Boucle de passage : texte déjà en cache mémoire → affichage
    // instantané, zéro appel réseau.
    if (!isOfflineModeRef.current && isCachingEnabled()) {
      const cached = getCachedText(`text_${number}`)
      if (cached !== null) {
        setCorantText(cached)
        return
      }
    }

    const localTextUri = await getDownloadedText(`text_${number}`)

    // Mode hors ligne : uniquement le fichier local, jamais d'appel API.
    if (isOfflineModeRef.current && !localTextUri) {
      setCorantText('')
      return
    }

    const textUrl = localTextUri
      ? localTextUri
      : `http://api.alquran.cloud/v1/ayah/${number}`

    try {
      const response = await fetch(textUrl)
      const data = await response.json()

      setCorantText(data.data.text)
      if (!isOfflineModeRef.current && isCachingEnabled()) {
        cacheText(`text_${number}`, data.data.text)
      }
    } catch (error) {
      // Hors ligne, une erreur de lecture du texte ne doit ni déclencher
      // un appel réseau ni afficher l'alerte de connexion.
      if (isOfflineModeRef.current) return
      if (error instanceof Error && error.message === 'Failed to fetch') {
        await downloadText(`text_${number}`, textUrl)
        setConnectionError(true)
      }
    }
  }

  async function onPlaybackStatusUpdate(status: AVPlaybackStatus, session: number) {
    // Statut d'un son appartenant à une session invalidée (autre passage
    // sélectionné entre-temps) : on l'ignore totalement.
    if (session !== playbackSessionRef.current) return
    if (!status.isLoaded) return

    setTimeUpdate(status.positionMillis)
    setIsLoading(!status.isPlaying)

    if (status.didJustFinish) {
      setCurrentSlide(v => (v >= selectEndVerset ? selectSartVerset : v + 1))

      //update currentVerset
      if (currentVerset >= endPlayVerset) {
        currentVerset = startPlayVerset - 1
      }
      currentVerset++
      const newUrl = `https://cdn.islamic.network/quran/audio/64/ar.${reciter}/${currentVerset}.mp3`
      playSound(newUrl)
    }
  }

  async function playSound(uri: string) {
    // Idempotence : si un audio est déjà en cours de chargement, on
    // ignore ce nouvel appel pour éviter deux lectures simultanées.
    if (isBusyRef.current) {
      return
    }
    isBusyRef.current = true
    // Jeton capturé au départ : si une réinitialisation survient pendant
    // un await, on abandonne au point de contrôle suivant.
    const session = playbackSessionRef.current
    setIsLoading(true)

    try {
      // On garantit qu'aucun audio précédent n'est encore chargé/en
      // cours avant d'en lancer un nouveau.
      await unloadCurrentSound()
      if (session !== playbackSessionRef.current) return

      await getCoranText(currentVerset)
      if (session !== playbackSessionRef.current) return

      // Isolation stricte des sources audio :
      //  - hors ligne : fichier local obligatoire, aucun repli vers l'API ;
      //  - en ligne : API, avec cache de boucle (la clé inclut le
      //    réciteur, donc aucun mélange de voix possible).
      let soundUri = uri
      if (isOfflineModeRef.current) {
        const localUri = await getDownloadedAudio(`verset_${currentVerset}`)
        if (session !== playbackSessionRef.current) return
        if (!localUri) {
          // Fichier manquant : arrêt propre + information de l'utilisateur.
          await initParams()
          setOfflineError(true)
          return
        }
        soundUri = localUri
      } else if (isCachingEnabled()) {
        const cacheKey = `${reciter}_${currentVerset}`
        const cachedUri = await getCachedAudio(cacheKey)
        if (session !== playbackSessionRef.current) return
        if (cachedUri) {
          // Tour de boucle suivant : lecture locale, instantanée.
          soundUri = cachedUri
        } else {
          // Premier tour : on joue depuis l'API (latence normale) et on
          // remplit le cache en arrière-plan pour les tours suivants.
          cacheAudio(cacheKey, uri)
        }
      }

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: soundUri },
        { shouldPlay: true, volume, rate },
        s => onPlaybackStatusUpdate(s, session)
      )

      if (session !== playbackSessionRef.current) {
        // Un autre passage a été sélectionné pendant le chargement :
        // on jette ce son immédiatement, il ne doit jamais être audible.
        try {
          newSound.setOnPlaybackStatusUpdate(null)
          await newSound.stopAsync()
          await newSound.unloadAsync()
        } catch (e) { }
        return
      }

      soundRef.current = newSound
      setDuration(status.isLoaded ? status.durationMillis ?? 0 : 0)
      setSound(newSound)
    } catch (error) {
      setIsLoading(false)
      console.error('❌ Erreur lors de la lecture du son :', error)
    } finally {
      isBusyRef.current = false
    }
  }

  // Configure la session audio pour la lecture en arrière-plan :
  // l'audio continue quand l'app passe en fond ou que l'écran s'éteint,
  // et joue même si l'iPhone est en mode silencieux.
  const configureAudioMode = async () => {
    try {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })
    } catch (error) {
      console.error('❌ Erreur configuration du mode audio :', error)
    }
  }

  useEffect(() => {
    // Le passage/sourate/réciteur change : le cache de boucle devient
    // caduc, on le vide pour garder une durée de vie cohérente.
    clearPlaybackCache()
    loadSelectAudio(surahNumber, {
      start: selectSartVerset,
      end: selectEndVerset,
    })
  }, [selectSartVerset, selectEndVerset, surahNumber, reciter])

  // Au démontage, on décharge le son courant pour éviter les fuites
  // mémoire et un audio qui continuerait de jouer.
  useEffect(() => {
    return () => {
      unloadCurrentSound()
      clearPlaybackCache()
    }
  }, [])

  useEffect(() => {
    if (sound) {
      sound.setVolumeAsync(volume)
    }
  }, [sound, volume])

  useEffect(() => {
    if (sound) {
      sound.setRateAsync(rate, true)
    }
  }, [sound, rate])

  useEffect(() => {
    configureAudioMode()
  }, [])

  return (
    <PlayerContext.Provider
      value={{
        sound,
        setSound,
        playSound,
        initParams,
        initAudio,
        loadNewSound,
        loadSelectLesson,
        exitOfflineMode,
        startUrl,
        coranText,
        setCorantText,
        isPlaying,
        setIsplaying,
        isPause,
        setIsPause,
        isLoading,
        setIsLoading,
        isFirstStart,
        setIsFirstStart,
        playPauseIcon,
        setPlayPauseIcon,
        duration,
        timeUpdate,
        volume,
        setVolume,
        rate,
        setRate,
        connectionError,
        setConnectionError,
        disabled,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = (): PlayerContextValue =>
  useContext(PlayerContext) as PlayerContextValue
