import React, { useContext, useState } from 'react'
import { GlobalContext } from '../app/(tabs)/_layout'
import { View } from 'react-native'
import { InputRange } from './ui/InputRange'

export default function VolumeInput() {
  const {volume, setVolume } = useContext(GlobalContext)

    return (
        <View style={{ flex: 1, flexDirection: 'row' ,width : 200 }}>
            <InputRange
                value={volume}
                setValue={setVolume}
                min={0}
                max={1}
            />
        </View>
    )
}
