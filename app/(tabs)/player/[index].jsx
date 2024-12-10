import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import TextContainer from '@/components/TextContainer';
import Track from '@/components/Track';
import Rciter from '@/components/Rciter';
import TopBar from '@/components/TopBar';
import Control from '@/components/Control';
import { useContext, useEffect } from 'react';
import { GlobalContext } from '../_layout';
import { sourates } from '@/constants/sorats.list';
import SourahSelect from '@/components/SourahSelect'
import { useLocalSearchParams } from 'expo-router';
import SelectVersetb from "@/components/SelectVersetb"
// import SelectVerset from "../../../components/SelectVerset"

import VolumeInput from "@/components/VolumeInput"
import RateInput from "@/components/RateInput"
import { ConfirmDialog } from 'react-native-simple-dialogs';

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
        setCorantText,
        connectionError,
        setConnectionError
    } = useContext(GlobalContext)


    useEffect(() => {
        const isLeason = index?.includes('l')
        const currentIndex = isLeason ?
            parseFloat(index.split("-")[1]) :
            index === undefined ? 0 : index

        const initAudio = async () => {
            if (sound) {
                await sound.stopAsync()
            }
            setSound(null)
            setIsplaying(false)
            setPlayPauseIcon('play')
            setCurrentSlide(selectSartVerset)
            setCurrentIndex(currentIndex)
            setSurahNumber(sourates[currentIndex].numero)
            setSurahTextValue(sourates[currentIndex].nom)
            setLastVersetOfSelectedSurah(sourates[currentIndex]?.versets)
            setCorantText('')
        }

        // load selected leason
        const loadSelectedLeson = async () => {
            if (sound) {
                await sound.stopAsync()
            }
            setSound(null)
            setIsplaying(false)
            setPlayPauseIcon('play')
            setCurrentSlide(selectSartVerset)
            // setCurrentIndex(currentIndex)
            setSurahNumber(sourates[currentIndex].numero)
            setSurahTextValue(sourates[currentIndex].nom)
            // setLastVersetOfSelectedSurah(sourates[currentIndex]?.versets)
            setCorantText('')
        }
        if (isLeason) {
            loadSelectedLeson()
        } else {
            initAudio()
        }
    }, [index])

    return (
        <View style={styles.container}>
            {/* <Rciter /> */}
            <TopBar />
            <TextContainer />
            <SourahSelect />
            <Track />
            <RateInput />
            <SelectVersetb />
            <VolumeInput />
            <View style={styles.container}>
                <Control />
            </View>
            <StatusBar style="auto" />
            <ConfirmDialog
                title="Error de connection"
                message="Vérifier votre connection internet"
                visible={connectionError}
                titleStyle={{ color: "red" }}
                onTouchOutside={() => {
                    setIsplaying(false)
                    setConnectionError(false)
                    setPlayPauseIcon('play')
                }}
                positiveButton={{
                    title: "OK",
                    onPress: () => {
                        setIsplaying(false)
                        setConnectionError(false)
                        setPlayPauseIcon('play')
                    }
                }}
            />
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