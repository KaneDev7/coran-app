import React, { useContext } from 'react'
import { View, Text, TouchableNativeFeedback, StyleSheet, Pressable } from 'react-native'
import { useLibrary } from '@/context/LibraryContext'
import { useOffline } from '@/context/OfflineContext'
import { primary, secondary2, secondary3 } from '../style/variables'
import { Entypo } from '@expo/vector-icons';
import { Link, router } from 'expo-router';

export default function SourahSelect() {

    const { surahTextValue } = useLibrary()
    const { isOfflineMode } = useOffline()
    return (
        <Pressable
            onPress={() => router.push('/sourates')}
            // En mode hors ligne, le changement de sourate est verrouillé.
            disabled={isOfflineMode}
            style={[styles.container, isOfflineMode && styles.locked]}
        >
            <View style={styles.iconCircle}>
                <Entypo name={isOfflineMode ? 'lock' : 'open-book'} size={16} color={primary} />
            </View>
            <View style={styles.textBlock}>
                <Text style={styles.label}>Sourate</Text>
                <Text style={styles.text} numberOfLines={1}> {surahTextValue} </Text>
            </View>
            {!isOfflineMode && <Entypo name="chevron-small-right" size={22} color={primary} />}
        </Pressable>
    )
}

const styles = StyleSheet.create({

    container: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginTop: 12,
        borderRadius: 14,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: secondary2 + '40',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textBlock: {
        flex: 1,
    },
    label: {
        fontSize: 11,
        color: '#8C6A4C',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        color: primary,
        textTransform: 'capitalize'
    },
    locked: {
        opacity: 0.6
    }
});