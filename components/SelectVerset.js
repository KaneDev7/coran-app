import React, { useContext, useEffect, useState } from 'react'
import { View, StyleSheet,  Text } from 'react-native'
import SelectDropdown from 'react-native-select-dropdown'
import { sourates } from '../constants/sorats.list';
import { AntDesign } from '@expo/vector-icons';
import { GlobalContext } from '../app/(tabs)/_layout'
import { secondary, secondary3 } from '../style/variables';


export default function SelectVerset() {
    const {
        lastVersetOfSelectedSurah,
        setSelectSartVerset,
        setSelectEndVerset,
        currentIndex,
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

    return (
        <View style={styles.selectAyahContent} >
            <Text>Hello</Text>
            <SelectDropdown
                buttonStyle={styles.selectAyah}
                buttonTextStyle={styles.selectAyahText}
                defaultValue={versets ? versets.length - (sourates[currentIndex - 1]?.versets - 1) : 1}
                disabled={isPlaying}
                data={versets}
                defaultButtonText={1}
                renderDropdownIcon={() => {
                    <AntDesign name="down" size={24} color="black" />
                }}
                dropdownIconPosition='right'
                onSelect={(selectedItem, index) => {
                    setSelectSartVerset(selectedItem)
                    setCurrentSlide(index)
                }}
                buttonTextAfterSelection={(selectedItem, index) => selectedItem}
                rowTextForSelection={(item, index) => item}
            />

            <SelectDropdown
                buttonStyle={styles.selectAyah}
                buttonTextStyle={styles.selectAyahText}
                defaultValue={versets.length}
                disabled={isPlaying}
                data={versets}
                defaultButtonText={7}
                renderDropdownIcon={() => {
                    <AntDesign name="down" size={24} color="black" />
                }}
                dropdownIconPosition='right'
                onSelect={(selectedItem, index) => {
                    setSelectEndVerset(selectedItem)
                }}

                buttonTextAfterSelection={(selectedItem, index) => {
                    return selectedItem
                }}
                rowTextForSelection={(item, index) => {
                    return item
                }}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    selectAyahContent: {
        display: 'flex',
        flexDirection: "row",
        gap: 20,
        marginVertical: 3
    },
    selectAyah: {
        width: 65,
        height:50,
        fontSize : 10,
        borderRadius : '50%',
        backgroundColor : secondary3,
        borderWidth: 1,
        borderColor: secondary,
        color : 'white'
    },
    selectAyahText: {
        fontSize: 15
    }

});
