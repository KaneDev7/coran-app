import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import TabBarBackground from '@/components/ui/TabBarBackground';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { Platform, StyleSheet } from 'react-native';
import { createContext, useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { convertSelectVerset } from '@/helpers';
import { getCoranText } from '@/services/coranText';
import { sourates } from '@/constants/sorats.list';

export const GlobalContext = createContext()

export default function RootLayout() {

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [lastVersetOfSelectedSurah, setLastVersetOfSelectedSurah] = useState(7);
  const [firstVersetOfSelectedSurah, setFirstVersetOfSelectedSurah] = useState(1);
  const [startUrl, setStartUrl] = useState('')
  const [sound, setSound] = useState();
  const [surahNumber, setSurahNumber] = useState(0)
  const [selectSartVerset, setSelectSartVerset] = useState(1)
  const [selectEndVerset, setSelectEndVerset] = useState(7)
  const [startPlayVerset, setStartPlayVerset] = useState(1)
  const [endPlayVerset, setEndPlayVerset] = useState(7)
  const [coranText, setCorantText] = useState('')
  const [isPlaying, setIsplaying] = useState(false)
  const [playPauseIcon, setPlayPauseIcon] = useState('play')
  const [isFirstStart, setIsFirstStart] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(selectSartVerset)
  const [surahTextValue, setSurahTextValue] = useState(sourates[0].nom)
  const [reciter, setReciter] = useState('aymanswoaid')
  const [rate, setRate] = useState(1)
  const [duration, setDuration] = useState(0)
  const [timeUpdate, setTimeUpdate] = useState(0)

  let currentVerset = startPlayVerset

  function onPlaybackStatusUpdate(status) {
    setTimeUpdate(status.positionMillis)
    setIsLoading(!status.isPlaying)

    if (status.didJustFinish) {
      //update slide
      setCurrentSlide(v => v >= selectEndVerset ? selectSartVerset : v + 1)

      //update currentVerset
      if (currentVerset >= endPlayVerset) {
        currentVerset = startPlayVerset - 1
      }
      currentVerset++

      getCoranText(currentVerset).then(text => {
        setCorantText(text)
      })
      playSound(`https://cdn.islamic.network/quran/audio/64/ar.${reciter}/${currentVerset}.mp3`)
    }
  };


  async function playSound(url) {
    getCoranText(currentVerset).then(text => {
      setCorantText(text)
    })

    const { sound, status } = await Audio.Sound.createAsync(
      { uri: url },
      {
        shouldPlay: true,
      },
      onPlaybackStatusUpdate,
    );
    setDuration(status.durationMillis)
    setSound(sound)
  }

  useEffect(() => {
    const startPlayVersetUpdate = convertSelectVerset({ surahNumber, selectedValue: selectSartVerset })
    const endPlayVersetUpdate = convertSelectVerset({ surahNumber, selectedValue: selectEndVerset })

    setStartPlayVerset(startPlayVersetUpdate)
    setEndPlayVerset(endPlayVersetUpdate)
    setStartUrl(`https://cdn.islamic.network/quran/audio/64/ar.${reciter}/${startPlayVersetUpdate}.mp3`)

  }, [selectSartVerset, selectEndVerset, surahNumber, reciter]);


  useEffect(() => {
    sound ? async () => {
      console.log('Unloading Sound');
      await sound.unloadAsync();
    } : undefined;
  }, [sound]);


  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GlobalContext.Provider value={{
      setFirstVersetOfSelectedSurah,
      setLastVersetOfSelectedSurah,
      setSurahNumber,
      setCurrentIndex,
      setCurrentSlide,
      duration,
      timeUpdate,
      setIsplaying,
      setPlayPauseIcon,
      setIsFirstStart,
      setSurahTextValue,
      setCorantText,
      setSelectSartVerset,
      setSelectEndVerset,
      playSound,
      setSound,
      isLoading,
      setIsLoading,
      setRate,
      setReciter,
      rate,
      sound,
      reciter,
      coranText,
      startUrl,
      isPlaying,
      playPauseIcon,
      isFirstStart,
      currentIndex,
      currentSlide,
      surahTextValue,
      selectSartVerset,
      selectEndVerset,
      firstVersetOfSelectedSurah,
      lastVersetOfSelectedSurah
    }}>

      <Stack
        screenOptions={{
          headerShown: false,
          // tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}>

      </Stack>


      <StatusBar style="auto" />
    </GlobalContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  surahContent: {
    marginVertical: 20
  },
  surahText: {
    fontSize: 25,
  }
});