import React, { useContext } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { GlobalContext } from '../app/(tabs)/_layout'
import { primary, secondary, secondary2 } from '../style/variables';
import { Link } from 'expo-router';
import { Entypo } from '@expo/vector-icons';


export default function Rciter() {
    const { reciter} = useContext(GlobalContext)
    return (
        <Link href="/reciteurs">
            <View
                style={styles.reciter}
            >
                <Text style={styles.reciterText} > {reciter} </Text>
                <Entypo name="select-arrows" size={15} color={primary} />
            </View>
        </Link>
    )
}

const styles = StyleSheet.create({
    reciter: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        borderWidth: 1,
        borderColor: secondary2,
        padding: 5,
    },
    reciterText: {
        fontSize: 15,
        color: primary,
        textTransform: 'capitalize'
    }

});

