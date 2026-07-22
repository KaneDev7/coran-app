import { createContext, useContext, useEffect, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system/legacy'
import { convertSelectVerset } from '@/helpers'
import {
  downloadAudio,
  downloadText,
  removeDownloadedAudio,
  removeDownloadedText,
} from '@/services/downloads'
import { storeLessons } from '@/services/storage'
import { useLibrary } from './LibraryContext'
import { useReciter } from './ReciterContext'
import { useAuth } from './AuthContext'

// Domaine : sections téléchargées (leçons) et mode hors ligne.
//
// Les passages sont PROPRES À CHAQUE UTILISATEUR : les clés de stockage
// incluent l'id de l'utilisateur connecté (lesson_<id>, downloadState_<id>).
//
// Suivi de téléchargement par verset :
//   downloadState = { [lessonId]: { versets: { [numVerset]: statut } } }
//   statut ∈ 'pending' | 'downloading' | 'done' | 'error'
// L'état est persisté pour permettre de réessayer après un redémarrage.

// Anciennes clés globales (avant l'isolation par utilisateur) : leurs
// données sont migrées vers le premier utilisateur qui se connecte.
const LEGACY_LESSONS_KEY = 'lesson'
const LEGACY_DOWNLOAD_STATE_KEY = 'downloadState'
// Estimation prudente du poids d'un verset (audio + texte).
const ESTIMATED_BYTES_PER_VERSE = 2 * 1024 * 1024
// Marge de sécurité : on refuse de remplir le disque jusqu'au dernier octet.
const SAFETY_MARGIN_BYTES = 20 * 1024 * 1024

const OfflineContext = createContext(null)

export function OfflineProvider({ children }) {
  const { selectSartVerset, selectEndVerset, surahNumber, currentIndex } =
    useLibrary()
  const { reciter } = useReciter()
  const { user } = useAuth()

  // Clés de stockage propres à l'utilisateur connecté.
  const userId = user?.id ?? 'anonymous'
  const lessonsKey = `lesson_${userId}`
  const downloadStateKey = `downloadState_${userId}`

  const [lessonList, setlessonList] = useState([])
  const [downloadProgressId, setDownloadProgressId] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const [isOfflineMode, setIsOfflineMode] = useState(false)
  // Ref miroir : les callbacks audio sont des closures qui verraient
  // un state périmé.
  const isOfflineModeRef = useRef(false)
  const [offlineError, setOfflineError] = useState(false)
  // Passage actuellement chargé dans le lecteur (mode hors ligne).
  const [activeLessonId, setActiveLessonId] = useState(null)

  // Statut de téléchargement par leçon/verset (voir en-tête de fichier).
  const [downloadState, setDownloadState] = useState({})
  // Ref miroir pour construire des mises à jour cohérentes dans les
  // boucles async, avec persistance systématique.
  const downloadStateRef = useRef({})

  const applyDownloadState = next => {
    downloadStateRef.current = next
    setDownloadState(next)
    AsyncStorage.setItem(downloadStateKey, JSON.stringify(next)).catch(
      () => { }
    )
  }

  const updateVerseStatus = (lessonId, verseNumber, status) => {
    const prev = downloadStateRef.current
    applyDownloadState({
      ...prev,
      [lessonId]: {
        versets: {
          ...(prev[lessonId]?.versets || {}),
          [verseNumber]: status,
        },
      },
    })
  }

  const enableOfflineMode = (lessonId = null) => {
    isOfflineModeRef.current = true
    setIsOfflineMode(true)
    setActiveLessonId(lessonId)
  }

  const disableOfflineMode = () => {
    isOfflineModeRef.current = false
    setIsOfflineMode(false)
    setOfflineError(false)
    setActiveLessonId(null)
  }

  // Migration : les passages sauvegardés AVANT l'isolation par
  // utilisateur (clés globales) sont rattachés au premier utilisateur
  // qui se connecte, puis les clés globales sont retirées.
  const migrateLegacyData = async () => {
    try {
      const [legacyLessons, legacyState, userLessons] =
        await Promise.all([
          AsyncStorage.getItem(LEGACY_LESSONS_KEY),
          AsyncStorage.getItem(LEGACY_DOWNLOAD_STATE_KEY),
          AsyncStorage.getItem(lessonsKey),
        ])

      // On ne migre que si l'utilisateur n'a encore rien en propre.
      if (userLessons !== null || legacyLessons === null) return

      await AsyncStorage.setItem(lessonsKey, legacyLessons)
      if (legacyState !== null) {
        await AsyncStorage.setItem(downloadStateKey, legacyState)
      }
      await AsyncStorage.removeItem(LEGACY_LESSONS_KEY)
      await AsyncStorage.removeItem(LEGACY_DOWNLOAD_STATE_KEY)
    } catch (e) {
      // migration best-effort
    }
  }

  const getLessons = async () => {
    try {
      const value = (await AsyncStorage.getItem(lessonsKey)) || '[]'
      setlessonList(JSON.parse(value))
    } catch (e) {
      // error reading value
    }
  }

  // Recharge les statuts persistés. Les téléchargements interrompus par
  // une fermeture de l'app ('pending'/'downloading') deviennent 'error'
  // pour proposer un nouvel essai.
  const getDownloadState = async () => {
    try {
      const raw = await AsyncStorage.getItem(downloadStateKey)
      if (!raw) {
        downloadStateRef.current = {}
        setDownloadState({})
        return
      }
      const stored = JSON.parse(raw)
      for (const lessonId of Object.keys(stored)) {
        const versets = stored[lessonId]?.versets || {}
        for (const v of Object.keys(versets)) {
          if (versets[v] === 'pending' || versets[v] === 'downloading') {
            versets[v] = 'error'
          }
        }
      }
      downloadStateRef.current = stored
      setDownloadState(stored)
    } catch (e) {
      // état illisible : on repart de zéro
    }
  }

  // Vérifie l'espace disque AVANT de lancer un téléchargement.
  const hasEnoughFreeSpace = async verseCount => {
    try {
      const free = await FileSystem.getFreeDiskStorageAsync()
      return free > verseCount * ESTIMATED_BYTES_PER_VERSE + SAFETY_MARGIN_BYTES
    } catch (e) {
      // Si la vérification échoue, on ne bloque pas l'utilisateur.
      return true
    }
  }

  // Télécharge UN verset (audio + texte) et met à jour son statut.
  const downloadVerse = async (lesson, verseNumber, lessonReciter) => {
    const position = convertSelectVerset({
      surahNumber: lesson.surahNumber,
      selectedValue: verseNumber,
    })
    updateVerseStatus(lesson.id, verseNumber, 'downloading')

    const urlAudio = `https://cdn.islamic.network/quran/audio/64/ar.${lessonReciter}/${position}.mp3`
    const urlText = `http://api.alquran.cloud/v1/ayah/${position}`

    const audioUri = await downloadAudio(`verset_${position}`, urlAudio)
    const textUri = await downloadText(`text_${position}`, urlText)

    const ok = Boolean(audioUri && textUri)
    updateVerseStatus(lesson.id, verseNumber, ok ? 'done' : 'error')
    return ok
  }

  // Télécharge tous les versets d'une leçon, séquentiellement.
  // Une erreur sur un verset n'arrête pas les suivants.
  const downloadLesson = async lesson => {
    const lessonReciter = lesson.reciter || reciter
    setDownloadProgressId(lesson.id)

    // Initialise tous les versets à 'pending' pour un affichage immédiat.
    const versets = {}
    for (let i = lesson.selectSartVerset; i <= lesson.selectEndVerset; i++) {
      versets[i] = 'pending'
    }
    applyDownloadState({
      ...downloadStateRef.current,
      [lesson.id]: { versets },
    })

    for (let i = lesson.selectSartVerset; i <= lesson.selectEndVerset; i++) {
      await downloadVerse(lesson, i, lessonReciter)
    }
    setDownloadProgressId('')
  }

  // Relance UNIQUEMENT le verset qui a échoué.
  const retryVerset = async (lessonId, verseNumber) => {
    const lesson = lessonList.find(item => item.id === lessonId)
    if (!lesson) return
    await downloadVerse(lesson, verseNumber, lesson.reciter || reciter)
  }

  const onSaveLeason = async () => {
    const verseCount = selectEndVerset - selectSartVerset + 1

    // Garde-fou : espace disque.
    const enoughSpace = await hasEnoughFreeSpace(verseCount)
    if (!enoughSpace) {
      return {
        success: false,
        error:
          "Espace de stockage insuffisant pour télécharger ce passage. Libérez de l'espace puis réessayez.",
      }
    }

    const lessonId = Date.now()
    const newLesson = {
      id: lessonId,
      selectSartVerset,
      selectEndVerset,
      surahNumber,
      index: currentIndex,
      // Mémorisé pour que les reprises utilisent le MÊME réciteur.
      reciter,
    }

    const updateLesson = [...lessonList, newLesson]

    await storeLessons(lessonsKey, updateLesson)
    setlessonList(updateLesson)
    downloadLesson(newLesson)

    return { success: true }
  }

  const onDeleteLesson = async id => {
    setIsDeleting(true)
    const lessonsFiltred = lessonList.filter(item => item.id !== id)
    setlessonList(lessonsFiltred)
    await storeLessons(lessonsKey, lessonsFiltred)

    // Purge le suivi de téléchargement de cette leçon.
    const { [id]: _removed, ...rest } = downloadStateRef.current
    applyDownloadState(rest)

    const lesson = lessonList.find(item => item.id === id)
    if (!lesson) {
      setIsDeleting(false)
      return
    }

    const { selectSartVerset, selectEndVerset, surahNumber } = lesson

    for (let i = selectSartVerset; i <= selectEndVerset; i++) {
      const versetNumberPositon = convertSelectVerset({
        surahNumber,
        selectedValue: i,
      })
      const nameAudio = `verset_${versetNumberPositon}`
      const nameText = `text_${versetNumberPositon}`
      await removeDownloadedAudio(nameAudio)
      await removeDownloadedText(nameText)
    }
    setIsDeleting(false)
  }

  // Rechargé à chaque changement d'utilisateur connecté : chacun ne
  // voit que ses propres passages.
  useEffect(() => {
    const load = async () => {
      await migrateLegacyData()
      await getLessons()
      await getDownloadState()
    }
    load()
  }, [userId])

  return (
    <OfflineContext.Provider
      value={{
        lessonList,
        onSaveLeason,
        onDeleteLesson,
        downloadProgressId,
        isDeleting,
        setIsDeleting,
        downloadState,
        retryVerset,
        isOfflineMode,
        isOfflineModeRef,
        activeLessonId,
        enableOfflineMode,
        disableOfflineMode,
        offlineError,
        setOfflineError,
      }}
    >
      {children}
    </OfflineContext.Provider>
  )
}

export const useOffline = () => useContext(OfflineContext)
