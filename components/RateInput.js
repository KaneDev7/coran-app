import React from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { View, Text, StyleSheet } from 'react-native'
import { InputRange } from './ui/InputRange'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { primary, secondary } from '../style/variables'

export default function RateInput() {
    const { rate, setRate } = usePlayer()

    return (
        <View style={style.wrapper}>
            <View style={style.labelRow}>
                <Text style={style.label}>Vitesse de lecture</Text>
                <Text style={style.value}>{rate.toFixed(2)}×</Text>
            </View>
            <View style={style.container}>
                <MaterialCommunityIcons name="speedometer-slow" size={20} color={secondary} />
                <InputRange
                    value={rate}
                    setValue={setRate}
                    min={0.6}
                    max={1.4}
                />
                <MaterialCommunityIcons name="speedometer" size={20} color={secondary} />
            </View>
        </View>
    )
}

const style = StyleSheet.create({
    wrapper: {
        gap: 2,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: primary,
    },
    value: {
        fontSize: 13,
        fontWeight: '600',
        color: secondary,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
})
