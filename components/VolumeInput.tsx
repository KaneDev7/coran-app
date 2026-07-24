import React from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { View, Text, StyleSheet } from 'react-native'
import { InputRange } from './ui/InputRange'
import { FontAwesome5 } from '@expo/vector-icons'
import { primary, secondary } from '../style/variables'

export default function VolumeInput() {
    const { volume, setVolume } = usePlayer()

    return (
        <View style={style.wrapper}>
            <Text style={style.label}>Volume</Text>
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
        </View>
    )
}

const style = StyleSheet.create({
    wrapper: {
        gap: 2,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: primary,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
})
