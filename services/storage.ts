import AsyncStorage from '@react-native-async-storage/async-storage'

// Les passages hors ligne sont propres à chaque utilisateur : la clé
// de stockage inclut son id (ex. "lesson_663f...").
export const storeLessons = async (storageKey: string, value: unknown) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(storageKey, jsonValue)
  } catch (e) {
    // saving error
  }
}

export const storeReciter = async (value: string) => {
  try {
    await AsyncStorage.setItem('reciter', value)
  } catch (e) {
    return ''
    // saving error
  }
}
