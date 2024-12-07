import { Dropdown } from 'react-native-element-dropdown';
import React, { useContext, useEffect, useState } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { GlobalContext } from '../app/(tabs)/_layout'

const DropdownComponent = () => {

    const {
        lastVersetOfSelectedSurah,
        setSelectSartVerset,
        setSelectEndVerset,
        selectEndVerset,
        currentSlide,
        setCurrentSlide,
        isPlaying,
    } = useContext(GlobalContext)

    const [versets, setVersets] = useState([])

    useEffect(() => {
        const versetsArray = []
        for (let index = 1; index <= lastVersetOfSelectedSurah; index++) {
            versetsArray.push(index)
        }
        setVersets(versetsArray)
        setSelectSartVerset(1)
        setSelectEndVerset(versetsArray.length)
    }, [lastVersetOfSelectedSurah])


    const renderItem = item => {
        return (
            <View style={styles.item}>
                <Text style={styles.textItem}>{item}</Text>
            </View>
        );
    };

    return (
        <View style={styles.selectAyahContent}>

            <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={versets}
                disable={isPlaying}
                maxHeight={300}
                placeholder={currentSlide}
                dropdownPosition='top'
                inverted={false}
                value={currentSlide}
                onChange={item => {
                    // setValue(item);
                    setSelectSartVerset(item)
                    setCurrentSlide(item)
                }}
                renderItem={renderItem}
            />
            <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={versets}
                disable={isPlaying}
                maxHeight={300}
                dropdownPosition='top'
                inverted={false}
                placeholder={selectEndVerset}
                value={selectEndVerset}
                onChange={item => {
                    setSelectEndVerset(item)
                }}
                renderItem={renderItem}
            />
        </View>

    );
};

export default DropdownComponent;

const styles = StyleSheet.create({
    selectAyahContent: {
        flex: 1,
        display: 'flex',
        flexDirection: "row",
        gap: 30
    },
    dropdown: {
        margin: 0,
        height: 50,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,

        elevation: 2,
    },
  
    item: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textItem: {
        flex: 1,
        fontSize: 20,
        textAlign: "center"
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },

});

