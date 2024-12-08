import React, { useContext, useState } from 'react'
import { GlobalContext } from '../app/(tabs)/_layout'
import { View } from 'react-native'
import { InputRange } from './ui/InputRange'


export default function RateInput() {
  const {rate, setRate } = useContext(GlobalContext)

    return (
        <View style={{ flex: 1, flexDirection: 'row' ,width : 200 }}>
            <InputRange
                value={rate}
                setValue={setRate}
                min={0.6}
                max={1.4}
            />
        </View>
    )
}
