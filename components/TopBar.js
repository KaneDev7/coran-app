import React, { useContext, useState } from 'react'
import { View, StyleSheet, Text, Pressable } from 'react-native'
import { GlobalContext } from '../app/(tabs)/_layout'
import { primary, secondary, secondary2 } from '../style/variables'
import { Link, router } from 'expo-router'
import { Entypo, MaterialIcons } from '@expo/vector-icons'
import { windowWidth } from '../style'
import { ConfirmDialog } from 'react-native-simple-dialogs'

export default function Rciter () {
  const {
    reciter,
    selectSartVerset,
    selectEndVerset,
    lessonList,
    onSaveLeason,
    surahNumber
  } = useContext(GlobalContext)

  const [dialogVisible, setDialogVisible] = useState(false)
  const [alertVisible, setAlertVisible] = useState(false)

  const handleSaveLesson = () => {
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
    onSaveLeason()
    setDialogVisible(false)
    router.push({ pathname: '/lessons' })
  }
  return (
    <View style={styles.container}>
      <Link href='/reciteurs'>
        <View style={styles.reciter}>
          <Text style={styles.reciterText}> {reciter} </Text>
          <Entypo name='select-arrows' size={15} color={primary} />
        </View>
      </Link>

      <Pressable onPress={() => setDialogVisible(true)}>
        {/* <Entypo name="save" size={24} color="black" /> */}
        <MaterialIcons name='download-for-offline' size={30} color={primary} />
      </Pressable>

      <ConfirmDialog
        title='Confirmer'
        message='Voulez vous telecchargez la section ?'
        visible={dialogVisible}
        onTouchOutside={() => setDialogVisible(false)}
        positiveButton={{
          title: 'Telecharcher',
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
        message={`Ce cours existe déjà`}
        visible={alertVisible}
        onTouchOutside={() => setAlertVisible(false)}
        positiveButton={{
          title: 'Ok',
          onPress: () => {
            setAlertVisible(false)
          }
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: windowWidth,
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  reciter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    // borderColor: secondary2,
    padding: 5,
    borderRadius: 5
  },
  reciterText: {
    fontSize: 15,
    color: primary,
    textTransform: 'capitalize'
  }
})
