import React, { useContext } from 'react'
import { View, StyleSheet, Text, Pressable } from 'react-native'
import { GlobalContext } from '../app/(tabs)/_layout'
import { primary, secondary, secondary2 } from '../style/variables';
import { Link } from 'expo-router';
import { Entypo } from '@expo/vector-icons';
import { windowWidth } from '../style';


export default function Rciter() {

    const {
        reciter,
        onSaveLeason,
    } = useContext(GlobalContext)


    return (
        <View style={styles.container} >
            <Link href="/reciteurs">
                <View
                    style={styles.reciter}
                >
                    <Text style={styles.reciterText} > {reciter} </Text>
                    <Entypo name="select-arrows" size={15} color={primary} />
                </View>
            </Link>

            <Pressable
            onPress={onSaveLeason}
            >
                <Entypo name="save" size={24} color="black" />
            </Pressable>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        width : windowWidth,
        flexDirection : "row",
        display : "flex",
        justifyContent : "space-between",
        alignItems : "center"
    },
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

