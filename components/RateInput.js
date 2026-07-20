import React, { useContext, useState } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { View } from 'react-native'
import { InputRange } from './ui/InputRange'
import { StyleSheet } from 'react-native'
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'
import { primary, secondary } from '../style/variables'


export default function RateInput() {
    const { rate, setRate } = usePlayer()

    return (
        <View style={style.container}>
            <MaterialCommunityIcons name="speedometer-slow" size={20} color={secondary} />

            <InputRange
                value={rate}
                setValue={setRate}
                min={0.6}
                max={1.4}
            />
            <MaterialCommunityIcons name="speedometer" size={20} color={secondary} />
            {/* <FontAwesome5 name="volume-up" size={15} color="black" /> */}

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