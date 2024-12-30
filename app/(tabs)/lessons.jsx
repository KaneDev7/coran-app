import { View, FlatList, Text, StyleSheet, Pressable } from 'react-native'
import { primary, secondary, secondary3 } from '@/style/variables';
import { useContext, useState } from 'react';
import { GlobalContext } from './_layout';
import { router } from 'expo-router';
import { sourates } from '../../constants/sorats.list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ConfirmDialog, Dialog } from 'react-native-simple-dialogs';
import { ScrollView } from 'react-native-web';

const Item = ({ item, index }) => {
    const {
        isLoading,
        isPlaying,
        onDeleteLesson,
        loadSelectLesson,
    } = useContext(GlobalContext)

    const [dialogVisible, setDialogVisible] = useState(false)
    const handleSelcetlesson = async () => {
        router.push({ pathname: `player/l-${item.index}` })
        loadSelectLesson (item)
    }

    return <Pressable
        style={{ ...styles.touchableNative, pointerEvents: isLoading && isPlaying ? "none" : "auto" }}
        onPress={handleSelcetlesson}
    >
        <View style={styles.item} >
            <View style={styles.itemRight} >
                <Text style={styles.lesson} >
                    {`Cours: ${index + 1}`}
                </Text>
                <Text style={styles.suratText} >
                    {`${sourates[parseFloat(item.index)]?.nom} | [${item.selectSartVerset} - ${item.selectEndVerset} ]`}
                </Text>
            </View>
            <Pressable style={{ padding: 5 }} onPress={() => setDialogVisible(true)}>
                <MaterialCommunityIcons name="delete" size={24} color="#EF5143" />
            </Pressable>
            <ConfirmDialog
                title="Confirmer"
                message="Voulez vous vraiment supprimer ce cours ?"
                visible={dialogVisible}
                onTouchOutside={() => setDialogVisible(false)}
                positiveButton={{
                    title: "Suuprimer",
                    onPress: () => {
                        onDeleteLesson(item.id)
                        setDialogVisible(false)
                    }
                }}
                negativeButton={{
                    title: "Annuler",
                    onPress: () => setDialogVisible(false)
                }}
            />
        </View>
    </Pressable>

};

export default function lessons() {
    const { lessonList } = useContext(GlobalContext)

    return (
        <ScrollView style={styles.container} >
            <FlatList
                data={lessonList}
                renderItem={({ item, index }) => <Item index={index} item={item} />}
                keyExtractor={(item, index) => index}
            />
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        gap: 10,
        backgroundColor: secondary3,
    },
    touchableNative: {
        flex: 1
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        paddingHorizontal: 30,
        paddingVertical: 20,
        marginBottom: 20,
        color: primary,
    },
    suratText: {
        fontSize: 15,
        fontWeight: '600',
        color: primary
    },
    itemRight: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 30,
    },
    itemRightVerset: {
        width: 35,
        height: 35,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: secondary,
    },
    itemRightVersetText: {
        fontSize: 12
    },
    lesson: {
        fontWeight: "bold",
        color: primary,
        fontSize: 15
    },

});