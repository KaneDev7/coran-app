import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { primary, secondary } from '@/style/variables';

interface EmptyListProps {
  title: string
  desc: string
}

export const EmptyList = ({ title, desc }: EmptyListProps) => {
    return (
        <View style={styles.container}>
            <FontAwesome6 name="folder-open" size={64} color={secondary} style={{opacity: .5}} />
            <Text style={styles.title}> {title} </Text>
            <Text style={styles.description}>{desc}.</Text>
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
