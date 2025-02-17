import { useFonts } from 'expo-font';
import { Stack, Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Feather from '@expo/vector-icons/Feather';

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { Platform, StyleSheet } from 'react-native';
import { createContext, useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { convertSelectVerset } from '@/helpers';
import { fetchCoranText } from '@/services/coranText';
import { sourates } from '@/constants/sorats.list';
import { primary, secondary } from '@/style/variables';
import { MaterialIcons } from '@expo/vector-icons';


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
  const [duration, setDuration] = useState(0)
  const [timeUpdate, setTimeUpdate] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [rate, setRate] = useState(1)
  const [lessonList, setlessonList] = useState([])
  const [connectionError, setConnectionError] = useState(false)
  const [reciter, setReciter] = useState("aymanswoaid")
  const [isPause, setIsPause] = useState(false)
  const [downloadProgressId, setDownloadProgressId] = useState("")

  console.log("downloadProgressId", downloadProgressId)
  const disabled = isPlaying || isPause

  let currentVerset = startPlayVerset
  const getLessons = async () => {
    try {
      const value = await AsyncStorage.getItem('lesson') || []
      if (value !== null) {
        // value previously stored
        setlessonList(JSON.parse(value))
      }
    } catch (e) {
      // error reading value
    }
  };

  const getReciter = async () => {
    try {
      const value = await AsyncStorage.getItem('reciter') || "aymanswoaid"
      if (value !== null) {
        // value previously stored
        setReciter(value)
      }
    } catch (e) {
      setReciter("aymanswoaid")
      // error reading value
    }
  };

  const storeLessons = async (value: string) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('lesson', jsonValue);

    } catch (e) {
      // saving error
    }
  };


  const storeReciter = async (value: string) => {
    try {
      await AsyncStorage.setItem('reciter', value);
    } catch (e) {
      return ""
      // saving error
    }
  };


  const onDeleteLesson = async (id) => {
    const lessonsFiltred = lessonList.filter(item => item.id !== id)
    await storeLessons(lessonsFiltred)
    setlessonList(lessonsFiltred)
  }

  const donloaadSaveLessons = async () => {
    for (let i = selectSartVerset; i < selectEndVerset; i++) {
      const versetNumberPositon = convertSelectVerset({ surahNumber, selectedValue: i });
  
      const nameAudio = `verset_${versetNumberPositon}`;
      const nameText = `text_${versetNumberPositon}`;
      const urlAudio = `https://cdn.islamic.network/quran/audio/64/ar.${reciter}/${versetNumberPositon}.mp3`;
      const urlText = `http://api.alquran.cloud/v1/ayah/${versetNumberPositon}`;
  
      await downloadAudio(nameAudio, urlAudio);
      await downloadText(nameText, urlText);
    }
    setDownloadProgressId("")
  };
  

  const onSaveLeason = async () => {
    setDownloadProgressId
    const lessonId = Date.now()
    setDownloadProgressId(lessonId)
    const updateLesson = [
      ...lessonList,
      {
        id: lessonId,
        selectSartVerset,
        selectEndVerset,
        surahNumber,
        index: currentIndex,
      }
    ]

    await storeLessons(updateLesson)
    donloaadSaveLessons()
    setlessonList(updateLesson)
  }

  const onSelectReciter = async (value) => {
    await storeReciter(value)
    setReciter(value)
  }

  async function loadSelectAudio(surahNumber, selectVerst) {
    const startPlayVersetUpdate = convertSelectVerset({ surahNumber, selectedValue: selectVerst.start })
    const endPlayVersetUpdate = convertSelectVerset({ surahNumber, selectedValue: selectVerst.end })

    setStartPlayVerset(startPlayVersetUpdate)
    setEndPlayVerset(endPlayVersetUpdate)
    setStartUrl(`https://cdn.islamic.network/quran/audio/64/ar.${reciter}/${startPlayVersetUpdate}.mp3`)
  }

  async function initParams() {
    if (sound) await sound.stopAsync()
    setSound(null)
    setIsFirstStart(true)
    setIsplaying(false)
    setIsLoading(false)
    setIsPause(false)
    setPlayPauseIcon('play')
    setCorantText('')
  }

  async function loadSelectLesson(item) {
    const { selectSartVerset, selectEndVerset, index, surahNumber } = item
    await initParams()
    loadSelectAudio(
      surahNumber,
      {
        start: selectSartVerset,
        end: selectEndVerset
      })
    setSelectSartVerset(selectSartVerset)
    setSelectEndVerset(selectEndVerset)
    setCurrentSlide(selectSartVerset)
    setSurahTextValue(sourates[index].nom)
    setSurahNumber(sourates[index].numero)
  }


  const loadNewSound = async (index) => {
    await initParams()
    setCurrentSlide(selectSartVerset)
    setSurahTextValue(sourates[index].nom)
    setSurahNumber(sourates[index].numero)
  }

  const initAudio = async (index) => {
    await loadNewSound(index)
    setCurrentIndex(index)
    setCurrentSlide(1)
    setLastVersetOfSelectedSurah(sourates[index]?.versets)
  }


  // ----------- AUDIO --------------
  // 📥 Télécharge et stocke un fichier audio
  
  async function downloadAudio(name: string, url: string) {
    const fileUri = `${FileSystem.documentDirectory}${name}.mp3`; // Stockage permanent
  
    try {
      console.log(`📥 Téléchargement de ${url} vers ${fileUri}...`);
  
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
      
      );
  
      const { uri } = await downloadResumable.downloadAsync();
      
      // Stocker le chemin du fichier dans AsyncStorage
      await AsyncStorage.setItem(name, uri);
      console.log(`✅ Fichier téléchargé et stocké : ${uri}`);
  
      return uri;
    } catch (error) {
      console.error("❌ Erreur lors du téléchargement :", error);
      return null;
    }
  }
  


  // 🔍 Récupère le chemin local du fichier en cache
  async function getDownloadedAudio(name: string): Promise<string | null> {
    try {
      const fileUri = await AsyncStorage.getItem(name);
  
      if (fileUri) {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          console.log(`📂 Fichier trouvé : ${fileUri}`);
          return fileUri;
        } else {
          console.log(`⚠️ Fichier supprimé du stockage, nettoyage...`);
          await AsyncStorage.removeItem(name);
          return null;
        }
      }
  
      console.log(`❌ Aucun fichier trouvé pour : ${name}`);
      return null;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du fichier :", error);
      return null;
    }
  }
  


  async function removeDownloadedAudio(name: string) {
    const fileUri = `${FileSystem.documentDirectory}${name}.mp3`;
  
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
  
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
        await AsyncStorage.removeItem(name);
        console.log(`🗑️ Fichier supprimé : ${fileUri}`);
        return true;
      } else {
        console.log(`⚠️ Aucun fichier trouvé pour : ${name}`);
        return false;
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression :", error);
      return false;
    }
  }
  
    // ----------- TEXT --------------
  // 📥 Télécharge et stocke un fichier text

  async function downloadText(name: string, url: string) {
    const fileUri = `${FileSystem.documentDirectory}${name}.txt`;
  
    try {
      const response = await fetch(url);
      const text = await response.text();
      
      await FileSystem.writeAsStringAsync(fileUri, text);
      await AsyncStorage.setItem(name, fileUri);
  
      console.log(`✅ Texte téléchargé : ${fileUri}`);
      return fileUri;
    } catch (error) {
      console.error("❌ Erreur téléchargement texte :", error);
      return null;
    }
  }  

  async function getDownloadedText(name: string): Promise<string | null> {
    const fileUri = await AsyncStorage.getItem(name);
    if (!fileUri) return null;
  
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo.exists ? fileUri : null;
  }

  async function removeDownloadedText(name: string): Promise<boolean> {
    try {
      const fileUri = await AsyncStorage.getItem(name);
      if (!fileUri) {
        console.log(`⚠️ Aucun fichier trouvé pour : ${name}`);
        return false;
      }
  
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
        await AsyncStorage.removeItem(name);
        console.log(`🗑️ Fichier texte supprimé : ${fileUri}`);
        return true;
      } else {
        await AsyncStorage.removeItem(name);
        console.log(`⚠️ Fichier non trouvé sur le système, cache supprimé.`);
        return false;
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du texte :", error);
      return false;
    }
  }

  
  async function getCoranText(number: number) {
    const localTextUri = await getDownloadedText(`text_${number}`);
    const textUrl = localTextUri ? localTextUri : `http://api.alquran.cloud/v1/ayah/${number}`;
  
    try {
      const response = await fetch(textUrl);
      const data = await response.json();
      
      setCorantText(data.data.text);
    } catch (error) {
      if (error.message === "Failed to fetch") {
        await downloadText(`text_${number}`, textUrl);
        setConnectionError(true);
      }
    }
  }

  async function onPlaybackStatusUpdate(status) {
    setTimeUpdate(status.positionMillis)
    setIsLoading(!status.isPlaying)

    if (status.didJustFinish) {
      setCurrentSlide(v => v >= selectEndVerset ? selectSartVerset : v + 1)

      //update currentVerset
      if (currentVerset >= endPlayVerset) {
        currentVerset = startPlayVerset - 1
      }
      currentVerset++


      const newUrl = `https://cdn.islamic.network/quran/audio/64/ar.${reciter}/${currentVerset}.mp3`
      playSound(newUrl)
    }
  };


  
  async function playSound(uri: string) {
    try {
      await getCoranText(currentVerset);
  
      const localUri = await getDownloadedAudio(`verset_${currentVerset}`);
      const soundUri = localUri ? localUri : uri;
  
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: soundUri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
  
      console.log("🔊 Son chargé :", sound);
      setDuration(status.durationMillis);
      setSound(sound);
    } catch (error) {
      setIsLoading(false);
      console.error("❌ Erreur lors de la lecture du son :", error);
    }
  }
  

  useEffect(() => {
    loadSelectAudio(
      surahNumber,
      {
        start: selectSartVerset,
        end: selectEndVerset
      })

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
    getReciter()
    // clearCache()
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
      setIsPause,
      isPause,
      setSound,
      volume,
      setVolume,
      initParams,
      loadNewSound,
      loadSelectLesson,
      initAudio,
      disabled,
      isLoading,
      setIsLoading,
      downloadProgressId,
      setRate,
      rate,
      onSelectReciter,
      onSaveLeason,
      onDeleteLesson,
      lessonList,
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
          name="lessons"
          options={{
            title: "Cours",
            tabBarIcon: ({ color, focused }) => <Entypo name="book" size={20} style={{ opacity: focused ? 1 : .4 }} color={secondary} />,
          }}
        />

        <Tabs.Screen
          name="player/[index]"
          options={{
            title: 'Ecouter',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => <MaterialIcons name="headset" size={20} style={{ opacity: focused ? 1 : .4 }} color={secondary} />
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