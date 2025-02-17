import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { primary, secondary } from '@/style/variables';

export const EmptyList = ({ title }) => {
    return (
        <View style={styles.container}>
            <Feather name="book-open" size={64} color={secondary} style={{opacity: .5}} />
            <Text style={styles.title}>Aucun {title} trouvé</Text>
            <Text style={styles.description}>Vous pouvez commencer par ajouter un nouveau {title}.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: primary,
        marginTop: 16,
    },
    description: {
        fontSize: 16,
        color: secondary,
        marginTop: 8,
        textAlign: 'center',
    },
});
