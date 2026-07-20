import React, { useContext, useState } from 'react'
import { View, StyleSheet, Text, Pressable } from 'react-native'
import { useReciter } from '@/context/ReciterContext'
import { useLibrary } from '@/context/LibraryContext'
import { useOffline } from '@/context/OfflineContext'
import { primary, secondary, secondary2 } from '../style/variables'
import { Link, router } from 'expo-router'
import { Entypo, MaterialIcons } from '@expo/vector-icons'
import { windowWidth } from '../style'
import { ConfirmDialog } from 'react-native-simple-dialogs'

export default function Rciter () {
  const { reciter } = useReciter()
  const { selectSartVerset, selectEndVerset, surahNumber } = useLibrary()
  const { lessonList, onSaveLeason, isOfflineMode } = useOffline()

  const [dialogVisible, setDialogVisible] = useState(false)
  const [alertVisible, setAlertVisible] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleSaveLesson = async () => {
    const isLessonExist = lessonList.find(
      item =>
        item.selectSartVerset === selectSartVerset &&
        item.selectEndVerset === selectEndVerset &&
        item.surahNumber === surahNumber
    )

    if (isLessonExist) {
        setAlertVisible(true)
        setDialogVisible(false)
        return
    }

    setDialogVisible(false)
    // Les garde-fous (espace disque...) sont vérifiés par onSaveLeason.
    const result = await onSaveLeason()
    if (!result.success) {
      setSaveError(result.error)
      return
    }
    router.push({ pathname: '/lessons' })
  }
  return (
    <View style={styles.container}>
      {/* En mode hors ligne, le changement de réciteur est verrouillé. */}
      {isOfflineMode ? (
        <View style={[styles.reciter, styles.locked]}>
          <MaterialIcons name='lock' size={14} color={primary} />
          <Text style={styles.reciterText}> {reciter} </Text>
        </View>
      ) : (
        <Link href='/reciteurs'>
          <View style={styles.reciter}>
            <MaterialIcons name='record-voice-over' size={16} color={primary} />
            <Text style={styles.reciterText}> {reciter} </Text>
            <Entypo name='chevron-small-down' size={18} color={primary} />
          </View>
        </Link>
      )}

      {/* Le téléchargement d'une section est inutile en mode hors ligne. */}
      <Pressable
        disabled={isOfflineMode}
        style={[styles.downloadButton, { opacity: isOfflineMode ? 0.4 : 1 }]}
        onPress={() => setDialogVisible(true)}
      >
        <MaterialIcons name='download-for-offline' size={26} color={primary} />
      </Pressable>

      <ConfirmDialog
        title='Confirmer'
        message='Voulez-vous télécharger ce passage ?'
        visible={dialogVisible}
        onTouchOutside={() => setDialogVisible(false)}
        positiveButton={{
          title: 'Télécharger',
          titleStyle: { color: primary },
          onPress:  () => handleSaveLesson()
        }}
        negativeButton={{
          title: 'Annuler',
          titleStyle: { color: primary },
          onPress: () => setDialogVisible(false)
        }}
      />
      <ConfirmDialog
        title='Impossible'
        message={`Ce passage est déjà téléchargé`}
        visible={alertVisible}
        onTouchOutside={() => setAlertVisible(false)}
        positiveButton={{
          title: 'Ok',
          onPress: () => {
            setAlertVisible(false)
          }
        }}
      />
      <ConfirmDialog
        title='Téléchargement impossible'
        message={saveError}
        visible={Boolean(saveError)}
        titleStyle={{ color: 'red' }}
        onTouchOutside={() => setSaveError('')}
        positiveButton={{
          title: 'Ok',
          onPress: () => setSaveError('')
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  reciter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  reciterText: {
    fontSize: 14,
    fontWeight: '600',
    color: primary,
    textTransform: 'capitalize'
  },
  downloadButton: {
    backgroundColor: '#fff',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  locked: {
    opacity: 0.6
  }
})
