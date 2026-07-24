import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { storeReciter } from '@/services/storage'

interface ReciterContextValue {
  reciter: string
  setReciter: Dispatch<SetStateAction<string>>
  onSelectReciter: (value: string) => Promise<void>
}

// Domaine : réciteur sélectionné (persisté localement).
const ReciterContext = createContext<ReciterContextValue | null>(null)

export function ReciterProvider({ children }: { children: ReactNode }) {
  const [reciter, setReciter] = useState('aymanswoaid')

  const getReciter = async (): Promise<void> => {
    try {
      const value = (await AsyncStorage.getItem('reciter')) || 'aymanswoaid'
      if (value !== null) setReciter(value)
    } catch (e) {
      setReciter('aymanswoaid')
    }
  }

  const onSelectReciter = async (value: string): Promise<void> => {
    await storeReciter(value)
    setReciter(value)
  }

  useEffect(() => {
    getReciter()
  }, [])

  return (
    <ReciterContext.Provider value={{ reciter, setReciter, onSelectReciter }}>
      {children}
    </ReciterContext.Provider>
  )
}

export const useReciter = (): ReciterContextValue =>
  useContext(ReciterContext) as ReciterContextValue
