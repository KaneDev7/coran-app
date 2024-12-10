import React, { useContext, useState } from 'react'
import { View, StyleSheet, Text, Pressable } from 'react-native'
import { GlobalContext } from '../app/(tabs)/_layout'
import { primary, secondary2 } from '../style/variables';
import { Link, router } from 'expo-router';
import { Entypo } from '@expo/vector-icons';
import { windowWidth } from '../style';
import { ConfirmDialog, Dialog } from 'react-native-simple-dialogs';


export default function Rciter() {
    const {
        reciter,
        onSaveLeason,
    } = useContext(GlobalContext)

    const [dialogVisible, setDialogVisible] = useState(false)
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

            <Pressable onPress={() => setDialogVisible(true)}>
                <Entypo name="save" size={24} color="black" />
            </Pressable>

            <ConfirmDialog
                title="Confirmer"
                message="Voulez vous sauvgarder le cours ?"
                visible={dialogVisible}
                onTouchOutside={() => setDialogVisible(false)}
                positiveButton={{
                    title: "Sauvegarder",
                    onPress: () =>{
                        onSaveLeason()
                        setDialogVisible(false)
                        router.push({pathname : "/leasons"})
                    }
                }}
                negativeButton={{
                    title: "Annuler",
                    onPress: () => setDialogVisible(false)
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: windowWidth,
        flexDirection: "row",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
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

