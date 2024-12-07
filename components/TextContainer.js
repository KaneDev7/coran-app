import React, { useCallback, useContext } from 'react'
import { Text, StyleSheet, ScrollView } from 'react-native'
import { windowWidth } from '../style'
import { GlobalContext } from '../app/(tabs)/_layout'
import { primary, secondary2, secondary3 } from '../style/variables'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function TextContainer() {
  const { coranText } = useContext(GlobalContext)

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
    <ScrollView style={style.textContainer} onLayout={onLayoutRootView}>
      <Text style={{fontFamily: 'Amiri-Quran' ,...style.text} }> {coranText} </Text>
    </ScrollView>
  )
}


const style = StyleSheet.create({
  textContainer: {
    width: windowWidth,
    height: windowWidth - 100,
    backgroundColor: secondary3,
    borderWidth: 3,
    borderColor: secondary2,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 10, 
    borderRadius: 10
  },
  text: {
    fontSize: 25,
    lineHeight: 60,
    textAlign: 'center',
    color : primary,
    paddingVertical :( windowWidth - 100) / 2,

  },
 
})