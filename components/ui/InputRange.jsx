import React, { useState } from 'react';
import { Slider } from '@miblanchard/react-native-slider';
import { AppRegistry, StyleSheet, View, Text } from 'react-native';

export const InputRange = ({ value, setValue = 0.2, max, min }) => {

    return (
        <View style={styles.container}>
            <Slider
                maximumValue={max}
                minimumValue={min}
                value={value}
                onValueChange={(newValue) => setValue(newValue[0])}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
    },
});

AppRegistry.registerComponent('InputRange', () => InputRange);
