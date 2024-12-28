import React, { useContext, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons';
import { windowWidth } from '../style'
import { primary } from '../style/variables';
import { GlobalContext } from '@/app/(tabs)/_layout'
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
    setCurrentSlide,
    selectSartVerset,
    isFirstStart,
    setIsPause,
    currentIndex,
    isLoading,
    initParams,
    sound,
  } = useContext(GlobalContext)


  const handleStop = async () => {
    await initParams()
    setCurrentSlide(selectSartVerset)
  }

  const handlePlayAndPause = async () => {
    let toggleIcon = !isPlaying ? 'pause' : 'play'
    setIsFirstStart(false)
    setIsplaying(v => !v)
    setPlayPauseIcon(toggleIcon)
    if (!isFirstStart) {
      if (isPlaying) {
        await sound.pauseAsync()
        setIsPause(true)
      } else {
        await sound.playAsync()
        setIsPause(false)
      }
    } else {
      setIsPause(false)
      playSound(startUrl)
    }
  }

  const handleNext = async () => {
    const index = sourates.length - 1 > currentIndex ? parseFloat(currentIndex) + 1 : 0
    router.push({ pathname: `/player/${index}` })
  }

  const handlePrev = async () => {
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
      <FontAwesome5 onPress={handlePrev} name={'backward'} size={30} color={primary} />
      <FontAwesome5 onPress={handlePlayAndPause} name={playPauseIcon} size={iconSize} color={primary} />
      <FontAwesome5 onPress={handleStop} name={"stop"} size={iconSize} color={primary} />
      <FontAwesome5 onPress={handleNext} name={'forward'} size={30} color={primary} />
    </View>
  )
}


const style = StyleSheet.create({
  controlConatiner: {
    width: windowWidth,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 50,
  }
})