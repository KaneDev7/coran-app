import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import TextContainer from '@/components/TextContainer';
import Track from '@/components/Track';
import TopBar from '@/components/TopBar';
import Control from '@/components/Control';
import { useEffect } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { useLibrary } from '@/context/LibraryContext';
import { useOffline } from '@/context/OfflineContext';
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
        initAudio,
        connectionError,
        setConnectionError,
        exitOfflineMode,
    } = usePlayer()
    const {
        setCurrentIndex,
        currentSlide,
        selectSartVerset,
        selectEndVerset,
    } = useLibrary()
    const { isOfflineMode, offlineError, setOfflineError } = useOffline()


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
        // SafeAreaView : la page a headerShown:false, il faut donc gérer
        // soi-même la zone de la barre de statut / encoche.
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Bandeau d'information : mode hors ligne actif */}
            {isOfflineMode && (
                <View style={styles.offlineBanner}>
                    <MaterialIcons name="cloud-off" size={18} color="#fff" />
                    <View style={styles.offlineTextContainer}>
                        <Text style={styles.offlineTitle}>Mode hors ligne</Text>
                        <Text style={styles.offlineDesc}>
                            Lecture des versets téléchargés. Réciteur, sourate et
                            versets sont verrouillés.
                        </Text>
                    </View>
                    <Pressable
                        style={styles.offlineExitButton}
                        onPress={exitOfflineMode}
                        hitSlop={8}
                    >
                        <Text style={styles.offlineExitText}>Quitter</Text>
                    </Pressable>
                </View>
            )}

            {/* En-tête : réciteur + téléchargement */}
            <TopBar />

            {/* Sélection de la sourate */}
            <SourahSelect />

            {/* Carte du verset : compteur + texte */}
            <View style={styles.verseCard}>
                <View style={styles.verseBadge}>
                    <Text style={styles.verseBadgeText}>
                        Verset {currentSlide} → {selectEndVerset}
                    </Text>
                </View>
                <TextContainer />
            </View>

            {/* Progression */}
            <Track />

            {/* Plage de versets à écouter */}
            <SelectVerset />

            {/* Réglages de lecture */}
            <View style={styles.slidersCard}>
                <RateInput />
                <VolumeInput />
            </View>

            {/* Contrôles principaux */}
            <View style={styles.controlZone}>
                <Control />
            </View>
            <StatusBar style="auto" />
            <ConfirmDialog
                title="Fichier introuvable"
                message="Ce verset n'est plus disponible hors ligne. La lecture a été arrêtée."
                visible={offlineError}
                titleStyle={{ color: "red" }}
                onTouchOutside={() => setOfflineError(false)}
                positiveButton={{
                    title: "OK",
                    onPress: () => setOfflineError(false)
                }}
            />
            <ConfirmDialog
                title="Erreur de resau"
                message="Vérifier votre connexion internet"
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
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4EFEA',
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 14,
    },
    verseCard: {
        alignSelf: 'stretch',
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingTop: 12,
        paddingBottom: 4,
        paddingHorizontal: 6,
        marginTop: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        alignItems: 'center',
    },
    verseBadge: {
        backgroundColor: '#F4EFEA',
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 14,
        marginBottom: 4,
    },
    verseBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8C6A4C',
    },
    slidersCard: {
        alignSelf: 'stretch',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginTop: 10,
        gap: 4,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    controlZone: {
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'center',
        paddingBottom: 10,
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e67e22',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 10,
        marginBottom: 6,
        gap: 10,
        alignSelf: 'stretch',
    },
    offlineTextContainer: {
        flex: 1,
    },
    offlineTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    offlineDesc: {
        color: '#fff',
        fontSize: 11,
        opacity: 0.9,
    },
    offlineExitButton: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    offlineExitText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    surahContent: {
        marginVertical: 20
    },
    surahText: {
        fontSize: 25,
    }
});