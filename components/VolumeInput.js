import React, { useContext, useState } from 'react'
import { GlobalContext } from '../app/(tabs)/_layout'
import { View } from 'react-native'
import { InputRange } from './ui/InputRange'
import { StyleSheet } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import { secondary } from '../style/variables'

export default function VolumeInput() {
    const { volume, setVolume } = useContext(GlobalContext)

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
        flex: 1,
        flexDirection: 'row',
        alignItems: "center",
        width: 210,
        gap : 10
    },

}) 