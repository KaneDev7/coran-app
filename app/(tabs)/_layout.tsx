import { useFonts } from 'expo-font';
import { Stack, Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Feather from '@expo/vector-icons/Feather';

import AsyncStorage from '@react-native-async-storage/async-storage';

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
import { primary, secondary } from '@/style/variables';

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
  const [duration, setDuration] = useState(0)
  const [timeUpdate, setTimeUpdate] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [rate, setRate] = useState(1)
  const [leasonList, setLeasonList] = useState([])
  const [connectionError, setConnectionError] = useState(false)

  let currentVerset = startPlayVerset

  const getLessons = async () => {
    try {
      const value = await AsyncStorage.getItem('lesson');
      if (value !== null) {
        // value previously stored
        setLeasonList(JSON.parse(value))
      }
    } catch (e) {
      // error reading value
    }
  };

  const storeLessons = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('lesson', jsonValue);
    } catch (e) {
      // saving error
    }
  };

  const onDeleteLesson = async (id) => {
    const lessonsFiltred = leasonList.filter(item => item.id !== id)
    await storeLessons(lessonsFiltred)
    setLeasonList(lessonsFiltred)
  }

  const onSaveLeason = async () => {
    const updateLesson = [
      ...leasonList,
      {
        id: Date.now(),
        selectSartVerset,
        selectEndVerset,
        surahNumber,
        index: currentIndex,
      }
    ]
    await storeLessons(updateLesson)
    setLeasonList(updateLesson)
  }

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
    }).catch(error => {
      if (error.message === "Failed to fetch")
        setConnectionError(true)
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
    if (sound) {
      sound.setVolumeAsync(volume)
    }
  }, [sound, volume]);

  useEffect(() => {
    if (sound) {
      sound.setRateAsync(rate, true)
    }
  }, [sound, rate]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);


  useEffect(() => {
    getLessons()
  }, [])

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
      volume,
      setVolume,
      isLoading,
      setIsLoading,
      setRate,
      rate,
      onSaveLeason,
      onDeleteLesson,
      leasonList,
      connectionError,
      setConnectionError,
      setReciter,
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

      <Tabs screenOptions={{ tabBarActiveTintColor: secondary }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Sourates',

            tabBarIcon: ({ color, focused }) => <Entypo name="list" size={20} style={{ opacity: focused ? 1 : .4 }} color={secondary} />,
          }}
        />

        <Tabs.Screen
          name="player/[index]"
          options={{
            title: 'Lecture',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => <Feather name="airplay" size={20} style={{ opacity: focused ? 1 : .4 }} color={secondary} />,
          }}
        />
        <Tabs.Screen
          name="leasons"
          options={{
            title: "Cours",
            tabBarIcon: ({ color, focused }) => <Entypo name="book" size={20} style={{ opacity: focused ? 1 : .4 }} color={secondary} />,

          }}
        />

        <Tabs.Screen
          name="reciteurs"
          options={{
            title: 'Réciteurs',
            tabBarIcon: ({ color, focused }) => <FontAwesome5 name="headset" size={20} style={{ opacity: focused ? 1 : .4 }} color={secondary} />,
          }}
        />

      </Tabs>
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