import React, { useCallback, useContext } from 'react'
import { Text, StyleSheet, ScrollView } from 'react-native'
import { windowWidth } from '../style'
import { usePlayer } from '@/context/PlayerContext'
import { primary, secondary2, secondary3 } from '../style/variables'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function TextContainer() {
  const { coranText } = usePlayer()

  const [fontsLoaded, fontError] = useFonts({
    'Amiri-Quran': require('../assets/fonts/Amiri-Quran.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ScrollView
      style={style.textContainer}
      contentContainerStyle={style.textContent}
      onLayout={onLayoutRootView}
    >
      {coranText ? (
        <Text style={{ fontFamily: 'Amiri-Quran', ...style.text }}> {coranText} </Text>
      ) : (
        <Text style={style.placeholder}>
          Appuyez sur ▶ pour lancer l'écoute
        </Text>
      )}
    </ScrollView>
  )
}


const style = StyleSheet.create({
  textContainer: {
    alignSelf: 'stretch',
    height: windowWidth - 170,
  },
  textContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: {
    fontSize: 25,
    lineHeight: 50,
    textAlign: 'center',
    color : primary,
  },
  placeholder: {
    fontSize: 14,
    textAlign: 'center',
    color: secondary2,
  },

})