import React, { useContext, useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons';
import { windowWidth } from '../style'
import { primary } from '../style/variables';
import { usePlayer } from '@/context/PlayerContext'
import { useLibrary } from '@/context/LibraryContext'
import { useOffline } from '@/context/OfflineContext'
import { router } from 'expo-router';
import { sourates } from '../constants/sorats.list';
const iconSize = 30

export default function Control() {

  const {
    playSound,
    startUrl,
    isPlaying,
    setIsFirstStart,
    setIsplaying,
    setPlayPauseIcon,
    playPauseIcon,
    isFirstStart,
    setIsPause,
    isLoading,
    initParams,
    sound,
  } = usePlayer()
  const { setCurrentSlide, selectSartVerset, currentIndex } = useLibrary()
  const { isOfflineMode } = useOffline()


  const handleStop = async () => {
    await initParams()
    setCurrentSlide(selectSartVerset)
  }

  const handlePlayAndPause = async () => {
    setIsFirstStart(false)

    if (!isFirstStart) {
      if (isPlaying) {
        // Pause : on synchronise l'état sur l'action réellement effectuée.
        if (sound) await sound.pauseAsync()
        setIsPause(true)
        setIsplaying(false)
        setPlayPauseIcon('play')
      } else {
        // Reprise
        if (sound) await sound.playAsync()
        setIsPause(false)
        setIsplaying(true)
        setPlayPauseIcon('pause')
      }
    } else {
      // Premier lancement : playSound est idempotent (protégé par un verrou),
      // un double-tap ne créera donc pas deux lectures.
      setIsPause(false)
      setIsplaying(true)
      setPlayPauseIcon('pause')
      playSound(startUrl)
    }
  }

  const handleNext = async () => {
    // En mode hors ligne, le changement de sourate est verrouillé.
    if (isOfflineMode) return
    const index = sourates.length - 1 > currentIndex ? parseFloat(currentIndex) + 1 : 0
    router.push({ pathname: `/player/${index}` })
  }

  const handlePrev = async () => {
    if (isOfflineMode) return
    const index = currentIndex > 0 ? parseFloat(currentIndex) - 1 : sourates.length - 1
    router.push({ pathname: `/player/${index}` })
  }

  return (
    <View
      style={{
        pointerEvents: isLoading && isPlaying ? "none" : 'auto',
        opacity: isLoading && isPlaying ? "0.5" : '1',
        ...style.controlConatiner
      }} >
      <Pressable
        style={[style.sideButton, isOfflineMode && style.sideButtonLocked]}
        onPress={handlePrev}
      >
        <FontAwesome5 name={'backward'} size={20} color={primary} />
      </Pressable>

      <Pressable style={style.playButton} onPress={handlePlayAndPause}>
        <FontAwesome5 name={playPauseIcon} size={26} color={'#fff'} style={playPauseIcon === 'play' ? { marginLeft: 4 } : null} />
      </Pressable>

      <Pressable style={style.sideButton} onPress={handleStop}>
        <FontAwesome5 name={"stop"} size={18} color={primary} />
      </Pressable>

      <Pressable
        style={[style.sideButton, isOfflineMode && style.sideButtonLocked]}
        onPress={handleNext}
      >
        <FontAwesome5 name={'forward'} size={20} color={primary} />
      </Pressable>
    </View>
  )
}


const style = StyleSheet.create({
  controlConatiner: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 26,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  sideButtonLocked: {
    opacity: 0.35,
  },
})