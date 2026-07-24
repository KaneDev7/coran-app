import { Slider } from '@miblanchard/react-native-slider';
import { AppRegistry, StyleSheet, View } from 'react-native';
import { primary } from '../../style/variables';

interface InputRangeProps {
  value: number
  setValue: (value: number) => void
  max: number
  min: number
}

export const InputRange = ({ value, setValue, max, min }: InputRangeProps) => {

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
