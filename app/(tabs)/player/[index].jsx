import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import TextContainer from '@/components/TextContainer';
import Track from '@/components/Track';
import Rciter from '@/components/Rciter';
import Control from '@/components/Control';
import { useContext, useEffect } from 'react';
import { GlobalContext } from '../_layout';
import { sourates } from '@/constants/sorats.list';
import SourahSelect from '@/components/SourahSelect'
import { useLocalSearchParams } from 'expo-router';
import SelectVersetb from "../../../components/SelectVersetb"

export default function Player() {

    const { index } = useLocalSearchParams()

    const {
        setIsplaying,
        setCurrentSlide,
        selectSartVerset,
        setPlayPauseIcon,
        setSurahNumber,
        setCurrentIndex,
        setSound,
        sound,
        setLastVersetOfSelectedSurah,
        setSurahTextValue,
        setCorantText
    } = useContext(GlobalContext)


    useEffect(() => {
        const initAudio = async () => {
            if (sound) {
                await sound.stopAsync()
            }
            setSound(null)
            setIsplaying(false)
            setPlayPauseIcon('play')
            setCurrentSlide(selectSartVerset)
            setCurrentIndex(index)
            setSurahNumber(sourates[index].numero)
            setSurahTextValue(sourates[index].nom)
            setLastVersetOfSelectedSurah(sourates[index]?.versets)
            setCorantText('')
        }
        initAudio()
    }, [index])

    return (
        <View style={styles.container}>
            <Rciter />
            <TextContainer />
            <SourahSelect />
            <Track />
            {/* <SelectVerset /> */}
            <SelectVersetb />

            <View style={styles.container}>
                <Control />
            </View>
            <StatusBar style="auto" />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 10
    },
    surahContent: {
        marginVertical: 20
    },
    surahText: {
        fontSize: 25,
    }
});