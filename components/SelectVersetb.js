import { Dropdown } from 'react-native-element-dropdown';
import React, { useContext, useEffect, useState } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { GlobalContext } from '../app/(tabs)/_layout'
import DropDownPicker from 'react-native-dropdown-picker';
import { windowWidth } from '../style';
import { ConfirmDialog } from 'react-native-simple-dialogs';


const DropdownComponent = () => {

    const {
        lastVersetOfSelectedSurah,
        setSelectSartVerset,
        setSelectEndVerset,
        selectEndVerset,
        selectSartVerset,
        currentSlide,
        setCurrentSlide,
        isPlaying,
    } = useContext(GlobalContext)

    const [versets, setVersets] = useState([])
    const [openSelectStartVerset, setOpenSelectStartVerset] = useState(false);
    const [openSelectEndtVerset, setOpenSelectEndtVerset] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false)

    useEffect(() => {
        const versetsArray = []
        for (let index = 1; index <= lastVersetOfSelectedSurah; index++) {
            versetsArray.push({ label: `v-${index}`, value: index })
        }
        setVersets(versetsArray)
        setSelectSartVerset(1)
        setSelectEndVerset(versetsArray.length)
    }, [lastVersetOfSelectedSurah])

    return (
        <View style={styles.selectAyahContent}>
            <DropDownPicker
                open={openSelectStartVerset}
                setOpen={setOpenSelectStartVerset}
                items={versets}
                disabled={isPlaying}
                placeholder={currentSlide}
                // value={currentSlide}
                disabledStyle={true}
                containerStyle={{ width: windowWidth / 4, opacity: isPlaying ? .6 : 1 }}
                textStyle={{ fontSize: 17 }}
                onSelectItem={item => {
                    if (item.value > selectEndVerset) {
                        setSelectSartVerset(item.value)
                        return setDialogVisible(true)
                    }
                    setSelectSartVerset(item.value)
                    setCurrentSlide(item.value)
                }}
            />
            <DropDownPicker
                open={openSelectEndtVerset}
                setOpen={setOpenSelectEndtVerset}
                items={versets}
                disabled={isPlaying}
                placeholder={selectEndVerset}
                textStyle={{ fontSize: 17 }}
                // value={selectEndVerset}
                containerStyle={{ width: windowWidth / 4, opacity: isPlaying ? .6 : 1 }}
                onSelectItem={item => {
                    if (item.value < selectSartVerset) {
                        setSelectEndVerset(selectSartVerset)
                        return setDialogVisible(true)
                    }
                    setSelectEndVerset(item.value)
                }}
            />

            <ConfirmDialog
                title="Impossible"
                message={`le verset de debut doit etre inférieur au verset de fin`}
                visible={dialogVisible}
                onTouchOutside={() => setDialogVisible(false)}
                positiveButton={{
                    title: "Ok",
                    onPress: () => {
                        setDialogVisible(false)
                    }
                }}

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
        gap: 30,

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

