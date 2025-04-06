import AsyncStorage from '@react-native-async-storage/async-storage'

export const  storeLessons = async (value: string) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem('lesson', jsonValue)
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


