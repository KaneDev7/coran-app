import * as FileSystem from 'expo-file-system/legacy'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

export async function downloadAudio (name: string, url: string) {
  const fileUri = `${FileSystem.documentDirectory}${name}.mp3` // Stockage permanent

  try {
    console.log(`📥 Téléchargement de ${url} vers ${fileUri}...`)

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {}
    )

    const { uri } = await downloadResumable.downloadAsync()

    // Stocker le chemin du fichier dans AsyncStorage
    await AsyncStorage.setItem(name, uri)
    console.log(`✅ Fichier téléchargé et stocké : ${uri}`)

    return uri
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement :', error)
    return null
  }
}

// 🔍 Récupère le chemin local du fichier en cache
export async function getDownloadedAudio (name: string): Promise<string | null> {
  try {
    const fileDirectory = Platform.OS === 'android' ? 'file://' : ''
    const fileUri = `${fileDirectory}${FileSystem.documentDirectory}${name}.mp3`
    const fileInfo = await FileSystem.getInfoAsync(fileUri)
    if (fileInfo.exists) {
      console.log(`📂 Fichier trouvé : ${fileUri}`)
      return fileUri
    } else {
      console.log(`⚠️ Fichier supprimé du stockage, nettoyage...`)
      await AsyncStorage.removeItem(name)
    }
    console.log(`❌ Aucun fichier trouvé pour : ${name}`)
    return null
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du fichier :', error)
    return null
  }
}

export async function removeDownloadedAudio (name: string) {
  const fileUri = `${FileSystem.documentDirectory}${name}.mp3`

  try {
    const fileDirectory = Platform.OS === 'android' ? 'file://' : ''
    const fileUri = `${fileDirectory}${FileSystem.documentDirectory}${name}.mp3`
    const fileInfo = await FileSystem.getInfoAsync(fileUri)

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri)
      await AsyncStorage.removeItem(name)
      console.log(`🗑️ Fichier supprimé : ${fileUri}`)
      return true
    } else {
      console.log(`⚠️ Aucun fichier trouvé pour : ${name}`)
      return false
    }
  } catch (error) {
    console.error('❌ Erreur lors de la suppression :', error)
    return false
  }
}

export async function clearAllAudioCache () {
  try {
    // Récupérer toutes les clés de AsyncStorage
    const keys = await AsyncStorage.getAllKeys()

    // Filtrer uniquement les clés des fichiers audio
    const audioKeys = keys.filter(key => key.startsWith('verset_'))

    // Supprimer chaque fichier audio
    const deletePromises = audioKeys.map(async key => {
      const fileUri = await AsyncStorage.getItem(key)
      if (fileUri) {
        // Supprimer le fichier physique
        const fileInfo = await FileSystem.getInfoAsync(fileUri)
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(fileUri)
        }
        // Supprimer la référence dans AsyncStorage
        await AsyncStorage.removeItem(key)
      }
    })

    await Promise.all(deletePromises)
    console.log(`🗑️ ${audioKeys.length} fichiers audio supprimés du cache`)
    return true
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage du cache audio:', error)
    return false
  }
}

// ----------- TEXT --------------
// 📥 Télécharge et stocke un fichier text

export async function downloadText (name: string, url: string) {
  const fileUri = `${FileSystem.documentDirectory}${name}.txt`

  try {
    const response = await fetch(url)
    const text = await response.text()

    await FileSystem.writeAsStringAsync(fileUri, text)
    await AsyncStorage.setItem(name, fileUri)

    console.log(`✅ Texte téléchargé : ${fileUri}`)
    return fileUri
  } catch (error) {
    console.error('❌ Erreur téléchargement texte :', error)
    return null
  }
}

export async function getDownloadedText (name: string): Promise<string | null> {
  const fileUri = await AsyncStorage.getItem(name)
  if (!fileUri) return null

  const fileInfo = await FileSystem.getInfoAsync(fileUri)
  return fileInfo.exists ? fileUri : null
}

export async function removeDownloadedText (name: string): Promise<boolean> {
  try {
   
    const fileDirectory = Platform.OS === 'android' ? 'file://' : ''
    const fileUri = `${fileDirectory}${FileSystem.documentDirectory}${name}.mp3`
    const fileInfo = await FileSystem.getInfoAsync(fileUri)
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri)
      await AsyncStorage.removeItem(name)
      console.log(`🗑️ Fichier texte supprimé : ${fileUri}`)
      return true
    } else {
      await AsyncStorage.removeItem(name)
      console.log(`⚠️ Fichier non trouvé sur le système, cache supprimé.`)
      return false
    }
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du texte :', error)
    return false
  }
}
