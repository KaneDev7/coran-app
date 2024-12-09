import React, { useContext, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons';
import { windowWidth } from '../style'
import { primary } from '../style/variables';
import { GlobalContext } from '@/app/(tabs)/_layout'
import { router } from 'expo-router';
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
    currentIndex,
    isLoading,
    sound,
  } = useContext(GlobalContext)


  const handlePlyaSong = async () => {
    let toggleIcon = !isPlaying ? 'stop' : 'play'
    setIsFirstStart(false)
    setIsplaying(v => !v)
    setPlayPauseIcon(toggleIcon)
    setCurrentSlide(selectSartVerset)
    if (!isFirstStart) {
      if (isPlaying) {
        await sound.stopAsync()
      } else {
        playSound(startUrl)
      }
    } else {
      playSound(startUrl)
    }
  }

  const handleNext = async () => {
    const index = parseFloat(currentIndex) + 1
    router.push({ pathname: `/player/${index}`})
  }

  const handlePrev = async () => {
    const index = parseFloat(currentIndex) - 1
    router.push({ pathname: `/player/${index}`})
  }

  return (
    <View
      style={{
        pointerEvents:  isLoading && isPlaying? "none" : 'auto',
        opacity:  isLoading && isPlaying ? "0.5" : '1',
        ...style.controlConatiner
      }} >
      <FontAwesome5 onPress={handlePrev} name={'backward'} size={30} color={primary} />
      <FontAwesome5 onPress={handlePlyaSong} name={playPauseIcon} size={iconSize} color={primary} />
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