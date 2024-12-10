import { View, FlatList, Text, StyleSheet, Pressable } from 'react-native'
import { primary, secondary, secondary3 } from '@/style/variables';
import { useContext } from 'react';
import { GlobalContext } from './_layout';
import { router } from 'expo-router';
import { sourates } from '../../constants/sorats.list';
import { AntDesign } from '@expo/vector-icons';

const Item = ({ item, index }) => {
    const {
        reciter,
        isPlaying,
        setIsplaying,
        setSelectSartVerset,
        setSelectEndVerset,
        setPlayPauseIcon,
        sound,
        setCorantText
    } = useContext(GlobalContext)

    const currentIndex = parseFloat(index)

    const handleSelcetLeason = async () => {
        if (isPlaying) {
            await sound.stopAsync()
        }
        router.push({ pathname: `player/l-${item.index}` })
        setIsplaying(false)
        setSelectSartVerset(item.selectSartVerset)
        setSelectEndVerset(item.selectEndVerset)
        setPlayPauseIcon('play')
        // setCurrentSlide(item.selectSartVerset)
        setCorantText('')
    }

    return <Pressable
        style={styles.touchableNative}
        onPress={handleSelcetLeason}
    >
        <View style={styles.item} >
            <View style={styles.itemRight} >
                <Text style={styles.leason} >
                    {`Cours: ${index + 1}`}
                </Text>
                <Text style={styles.suratText} >
                    {`${sourates[parseFloat(item.index)]?.nom} | [${item.selectSartVerset} - ${item.selectEndVerset} ]`}
                </Text>
            </View>
            <Text>
                <AntDesign name="delete" size={20} color="red" />
            </Text>
        </View>
    </Pressable>

};

export default function Leasons() {
    const { leasonList } = useContext(GlobalContext)
    console.log('leasonList', leasonList)

    return (
        <View style={styles.container} >
            <FlatList
                data={leasonList}
                renderItem={({ item, index }) => <Item index={index} item={item} />}
                keyExtractor={item => item.numero}
            />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
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
    leason: {
        fontWeight: "bold",
        color: primary,
        fontSize: 15
    },

});