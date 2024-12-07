import React, { useContext } from 'react'
import { View, Text, TouchableNativeFeedback, StyleSheet, Pressable } from 'react-native'
import { GlobalContext } from '../app/(tabs)/_layout'
import { primary, secondary2, secondary3 } from '../style/variables'
import { Entypo } from '@expo/vector-icons';
import { Link, router } from 'expo-router';

export default function SourahSelect() {

    const {surahTextValue } = useContext(GlobalContext)
    return (
            <Pressable
            onPress={() => router.push('/')}
                style={styles.container}
            >
                <Text style={styles.text} > {surahTextValue} </Text>
                <Entypo name="select-arrows" size={15} color={primary} />
            </Pressable>
    )
}

const styles = StyleSheet.create({

    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        borderWidth: 1,
        borderColor: secondary2,
        padding: 5,
        marginVertical : 20
    },
    text: {
        fontSize: 20,
        color: primary,
        textTransform: 'capitalize'
    }
});