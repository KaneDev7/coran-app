import React, { useContext, useState } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { View } from 'react-native'
import { InputRange } from './ui/InputRange'
import { StyleSheet } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import { secondary } from '../style/variables'

export default function VolumeInput() {
    const { volume, setVolume } = usePlayer()

    return (
        <View style={style.container}>
            <FontAwesome5 name="volume-down" size={15} color={secondary} />
            <InputRange
                value={volume}
                setValue={setVolume}
                min={0}
                max={1}
            />
            <FontAwesome5 name="volume-up" size={15} color={secondary} />

        </View>
    )
}


const style = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'center',
        gap : 10
    },

}) 