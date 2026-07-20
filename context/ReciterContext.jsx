import { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { storeReciter } from '@/services/storage'

// Domaine : réciteur sélectionné (persisté localement).
const ReciterContext = createContext(null)

export function ReciterProvider({ children }) {
  const [reciter, setReciter] = useState('aymanswoaid')

  const getReciter = async () => {
    try {
      const value = (await AsyncStorage.getItem('reciter')) || 'aymanswoaid'
      if (value !== null) setReciter(value)
    } catch (e) {
      setReciter('aymanswoaid')
    }
  }

  const onSelectReciter = async value => {
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

export const useReciter = () => useContext(ReciterContext)
