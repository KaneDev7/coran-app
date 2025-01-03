import { View, FlatList, Text, StyleSheet, Image, Pressable } from 'react-native'
import { primary, secondary, secondary3 } from '@/style/variables';
import { reciteurs } from "../../constants/reciteurs";
import { useContext } from 'react';
import { GlobalContext } from './_layout';
import { AntDesign } from '@expo/vector-icons';
import { ScrollView } from 'react-native-web';
import { router } from 'expo-router';

const Item = ({ item, index }) => {
  const {
    reciter,
    isPlaying,
    setCurrentSlide,
    selectSartVerset,
    initParams,
    onSelectReciter,
    isLoading,
  } = useContext(GlobalContext)

  const isActive = reciter === item.title
  const iconNmae = isActive ? 'checkcircle' : 'checkcircleo'

  const handleSelcetRicter = async () => {
    onSelectReciter(item.title)
    await initParams()
    setCurrentSlide(selectSartVerset)
  }

  return <Pressable
    style={{ ...styles.touchableNative, pointerEvents:( isLoading && isPlaying) || isActive ? "none" : "auto" }}
    onPress={handleSelcetRicter}
  >
    <View style={styles.item} >
      <View style={styles.itemRight} >
        <View style={styles.itemRightVerset} >
          <Image
            style={styles.image}
            source={item.url}
          />
        </View>
        <Text style={styles.suratText} > {item.name} </Text>
      </View>
      {
      }
      <AntDesign name={iconNmae} size={20} color={secondary} />
    </View>
  </Pressable>

};

export default function Reciteurs() {
  return (
    <ScrollView style={styles.container} >
      <FlatList
        data={reciteurs}
        renderItem={({ item, index }) => <Item index={index} item={item} />}
        keyExtractor={(item, index) => index}
      />
    </ScrollView>
  )
}


const styles = StyleSheet.create({
  container: {
    display: 'flex',
    gap: 10,
    backgroundColor: secondary3,
  },
  touchableNative: {
    flex: 1
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 20,
    marginBottom: 20,
    color: primary,
  },
  suratText: {
    fontSize: 20,
    fontWeight: '600',
    color: primary
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 30,
  },
  itemRightVerset: {
    width: 35,
    height: 35,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: secondary,
  },
  itemRightVersetText: {
    fontSize: 15
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: '50%'
  }

});