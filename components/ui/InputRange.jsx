import React, { useState } from 'react';
import { Slider } from '@miblanchard/react-native-slider';
import { AppRegistry, StyleSheet, View, Text } from 'react-native';
import { primary } from '../../style/variables';

export const InputRange = ({ value, setValue = 0.2, max, min }) => {

    return (
        <View style={styles.container}>
            <Slider
                maximumValue={max}
                minimumValue={min}
                value={value}
                animateTransitions={true}
                thumbTintColor={primary}
                thumbStyle={{width : 20, height: 20}}
                thumbTouchSize={{width : 30, height: 30}}
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
