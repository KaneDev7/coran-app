import { createContext, useContext, useState } from 'react'
import { sourates } from '@/constants/sorats.list'

// Domaine : navigation dans le Coran — sourate courante et
// sélection de la plage de versets à écouter.
const LibraryContext = createContext(null)

export function LibraryProvider({ children }) {
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

export const useLibrary = () => useContext(LibraryContext)
