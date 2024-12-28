import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import TextContainer from '@/components/TextContainer';
import Track from '@/components/Track';
import TopBar from '@/components/TopBar';
import Control from '@/components/Control';
import { useContext, useEffect } from 'react';
import { GlobalContext } from '../_layout';
import SourahSelect from '@/components/SourahSelect'
import { useLocalSearchParams } from 'expo-router';
import SelectVerset from "@/components/SelectVerset"
// import SelectVerset from "../../../components/SelectVerset"

import VolumeInput from "@/components/VolumeInput"
import RateInput from "@/components/RateInput"
import { ConfirmDialog } from 'react-native-simple-dialogs';

export default function Player() {

    const { index } = useLocalSearchParams()

    const {
        setIsplaying,
        setPlayPauseIcon,
        setCurrentIndex,
        initAudio,
        connectionError,
        setConnectionError
    } = useContext(GlobalContext)


    useEffect(() => {
        const isLesson = index?.includes('l')
        const currentIndex = isLesson ?
            parseFloat(index.split("-")[1]) :
            index === undefined ? 0 : index
        if (!isLesson) {
            initAudio(currentIndex)
        } else{
            setCurrentIndex(currentIndex)
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
            <SelectVerset />
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