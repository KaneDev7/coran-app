import { useMemo, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { secondary, secondary2, secondary3 } from '@/style/variables';
import { sourates } from '@/constants/sorats.list';
import { SourateItem } from '@/components/SourateItem';

// Supprime les accents pour une recherche tolérante ("Al-Ma'ida" ≈ "maida").
const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export default function SouratesList() {
  const [query, setQuery] = useState('');

  // Recherche par nom ou par numéro.
  const filteredSourates = useMemo(() => {
    const q = normalize(query);
    if (!q) return sourates;
    return sourates.filter(
      s => normalize(s.nom).includes(q) || String(s.numero) === q,
    );
  }, [query]);

  return (
    // Un tap n'importe où en dehors d'un élément interactif ferme le
    // clavier de recherche.
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Feather name="search" size={18} color={secondary} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher une sourate…"
          placeholderTextColor={secondary2}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Feather
            name="x"
            size={18}
            color={secondary}
            onPress={() => setQuery('')}
          />
        )}
      </View>
      <FlatList
        data={filteredSourates}
        renderItem={({ item }) => (
          // L'index de navigation doit rester celui de la liste COMPLÈTE,
          // pas celui de la liste filtrée.
          <SourateItem item={item} index={item.numero - 1} />
        )}
        keyExtractor={item => item.numero.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: secondary3,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    height: 44,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#4B2E2E',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
});
