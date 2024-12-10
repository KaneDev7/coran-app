import { useContext } from 'react';
import { View, FlatList, Text, StyleSheet, Pressable } from 'react-native'
import { sourates } from '@/constants/sorats.list';
import { GlobalContext } from './_layout';
import { primary, secondary, secondary3 } from '@/style/variables'
import { router } from 'expo-router';


type Sourate = {
  nom: string;
  versets: number;
  numero: number;
}

type ItemProps = {
  item: Sourate,
  index: number,

}

const Item = ({ item, index }: ItemProps) => {

  const { isLoading } = useContext(GlobalContext)
  return <Pressable
    style={{ ...styles.link, pointerEvents: isLoading ? "none" : "auto" }}
    onPress={() => router.push({ pathname: `/player/${index}` as any })}
  >
    <View style={styles.item} >
      <View style={styles.itemRight} >
        <View style={styles.itemRightVerset} >
          <Text style={styles.itemRightVersetText} > {item.numero} </Text>
        </View>
        <Text style={styles.suratText} > {item.nom} </Text>
      </View>
      <Text style={{ fontSize: 16 }}>  {item.versets} v </Text>
    </View>
  </Pressable>
};

export default function Sourates() {
  return (
    <View style={styles.container} >
      <FlatList
        data={sourates}
        renderItem={({ item, index }) => <Item index={index} item={item} />}
        keyExtractor={item => item.numero.toString()}
      />
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    display: 'flex',
    gap: 10,
    backgroundColor: secondary3,
  },
  link: {
    flex: 1
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    color: primary,
  },
  suratText: {
    fontSize: 23,
    fontWeight: '600',
    color: primary
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
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
  }

});