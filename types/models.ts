import type { ImageSourcePropType } from 'react-native'

// ============================================================
// Types de domaine partagés dans toute l'application.
// ============================================================

// ---- Coran ----
export interface Sourate {
  nom: string
  versets: number
  numero: number
  nomArabe: string
}

export interface Reciter {
  name: string
  title: string
  url: ImageSourcePropType
}

// ---- Authentification / utilisateur ----
export interface User {
  id: string
  fullName: string
  email: string
  premium: boolean
  premiumUntil: string | null
}

// Réponse générique du client HTTP (services/auth). Le corps JSON de
// l'API est étalé sur l'objet, d'où la signature d'index.
export interface ApiResult {
  success: boolean
  status: number
  error?: string
  sessionExpired?: boolean
  [key: string]: unknown
}

// ---- Mode Professeur ----
// Configuration d'une séance (persistée pour reprise / hors ligne).
export interface SavedSession {
  id: number
  createdAt?: string
  surahIndex: number
  startVerse: number
  endVerse: number
  reciter: string
  repetitions: number
  rate: number
  sensitivityDb?: number
}

// Configuration transmise à saveSession (sans id/createdAt générés).
export type SessionConfig = Omit<SavedSession, 'id' | 'createdAt'>

export type TeacherPhase =
  | 'idle'
  | 'reciter'
  | 'prompt'
  | 'listening'
  | 'repeating'
  | 'paused'

// ---- Téléchargement hors ligne (mode Révision libre) ----
// Passage téléchargé pour écoute hors connexion.
export interface Lesson {
  id: number
  selectSartVerset: number
  selectEndVerset: number
  surahNumber: number
  index: number
  reciter: string
}

export type DownloadStatus = 'pending' | 'downloading' | 'done' | 'error'
export type VerseStatusMap = Record<number, DownloadStatus>
export type DownloadState = Record<string, { versets: VerseStatusMap }>

// ---- Premium / abonnements ----
export interface Plan {
  code: string
  label: string
  priceFcfa: number
  period: string
  highlight: string | null
  recommended: boolean
}

export interface PaymentProvider {
  code: string
  label: string
  color: string
}
