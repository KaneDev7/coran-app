import { View, FlatList, StyleSheet } from 'react-native';
import { secondary3 } from '@/style/variables';
import { sourates } from '@/constants/sorats.list';
import { SourateItem } from '@/components/SourateItem';

export default function SouratesList() {
  return (
    <View style={styles.container}>
      <FlatList
        data={sourates}
        renderItem={({ item, index }) => (
          <SourateItem item={item} index={index} />
        )}
        keyExtractor={item => item.numero.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: secondary3,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
});