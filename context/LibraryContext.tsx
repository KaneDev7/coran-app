import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react'
import { sourates } from '@/constants/sorats.list'

interface LibraryContextValue {
  surahNumber: number
  currentIndex: number
  surahTextValue: string
  selectSartVerset: number
  selectEndVerset: number
  currentSlide: number
  firstVersetOfSelectedSurah: number
  lastVersetOfSelectedSurah: number
  setSurahNumber: Dispatch<SetStateAction<number>>
  setCurrentIndex: Dispatch<SetStateAction<number>>
  setSurahTextValue: Dispatch<SetStateAction<string>>
  setSelectSartVerset: Dispatch<SetStateAction<number>>
  setSelectEndVerset: Dispatch<SetStateAction<number>>
  setCurrentSlide: Dispatch<SetStateAction<number>>
  setFirstVersetOfSelectedSurah: Dispatch<SetStateAction<number>>
  setLastVersetOfSelectedSurah: Dispatch<SetStateAction<number>>
}

// Domaine : navigation dans le Coran — sourate courante et
// sélection de la plage de versets à écouter.
const LibraryContext = createContext<LibraryContextValue | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [surahNumber, setSurahNumber] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [surahTextValue, setSurahTextValue] = useState(sourates[0].nom)
  const [selectSartVerset, setSelectSartVerset] = useState(1)
  const [selectEndVerset, setSelectEndVerset] = useState(7)
  // Numéro du verset affiché pendant la lecture.
  const [currentSlide, setCurrentSlide] = useState(1)
  const [firstVersetOfSelectedSurah, setFirstVersetOfSelectedSurah] = useState(1)
  const [lastVersetOfSelectedSurah, setLastVersetOfSelectedSurah] = useState(7)

  return (
    <LibraryContext.Provider
      value={{
        surahNumber,
        currentIndex,
        surahTextValue,
        selectSartVerset,
        selectEndVerset,
        currentSlide,
        firstVersetOfSelectedSurah,
        lastVersetOfSelectedSurah,
        setSurahNumber,
        setCurrentIndex,
        setSurahTextValue,
        setSelectSartVerset,
        setSelectEndVerset,
        setCurrentSlide,
        setFirstVersetOfSelectedSurah,
        setLastVersetOfSelectedSurah,
      }}
    >
      {children}
    </LibraryContext.Provider>
  )
}

export const useLibrary = (): LibraryContextValue =>
  useContext(LibraryContext) as LibraryContextValue
