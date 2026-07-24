import { useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import DropDownPicker from 'react-native-dropdown-picker'
import { Feather } from '@expo/vector-icons'
import { primary, secondary, secondary2, secondary3 } from '@/style/variables'
import { sourates } from '@/constants/sorats.list'
import { SurahCard } from '@/components/SurahCard'
import { StepHeader } from '@/components/teacher/StepHeader'
import { useTeacher } from '@/context/TeacherContext'

const normalize = (value: string) =>
  value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// Nouvelle séance : choix de la sourate ET de la plage de versets dans
// une seule interface. La sélection d'une sourate révèle un panneau en
// bas (versets + Continuer), sans changer d'écran.
export default function TeacherNewSession() {
  const {
    selectSurah,
    surah,
    surahIndex,
    versesCount,
    startVerse,
    endVerse,
    setStartVerse,
    setEndVerse,
  } = useTeacher()

  const [query, setQuery] = useState('')
  // Une sourate a-t-elle été choisie ? (révèle le panneau versets)
  const [picked, setPicked] = useState(false)
  const [openStart, setOpenStart] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)

  const filtered = useMemo(() => {
    const q = normalize(query)
    if (!q) return sourates
    return sourates.filter(
      s => normalize(s.nom).includes(q) || String(s.numero) === q,
    )
  }, [query])

  const verseItems = useMemo(
    () =>
      Array.from({ length: versesCount }).map((_, i) => ({
        label: `Verset ${i + 1}`,
        value: i + 1,
      })),
    [versesCount],
  )

  const verseSpan = endVerse - startVerse + 1

  const handleSelectSurah = (index: number) => {
    selectSurah(index)
    setPicked(true)
    setOpenStart(false)
    setOpenEnd(false)
  }

  const handleStart = (value: number) => {
    setStartVerse(value)
    if (value > endVerse) setEndVerse(value)
  }
  const handleEnd = (value: number) => {
    if (value < startVerse) setEndVerse(startVerse)
    else setEndVerse(value)
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerWrap}>
          <StepHeader
            title="Nouvelle séance"
            subtitle="Étape 1 — Sourate et versets"
            step={1}
            totalSteps={2}
          />

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
              <Feather name="x" size={18} color={secondary} onPress={() => setQuery('')} />
            )}
          </View>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => item.numero.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item }) => (
            <SurahCard
              item={item}
              selected={picked && surahIndex === item.numero - 1}
              onPress={() => handleSelectSurah(item.numero - 1)}
            />
          )}
        />

        {/* Panneau versets : apparaît une fois une sourate choisie */}
        {picked && (
          <View style={styles.footer}>
            <View style={styles.footerHead}>
              <Feather name="book-open" size={16} color={primary} />
              <Text style={styles.footerTitle} numberOfLines={1}>
                {surah?.nom}
              </Text>
              <Text style={styles.footerSpan}>
                {verseSpan} verset{verseSpan > 1 ? 's' : ''}
              </Text>
            </View>

            <View style={styles.pickers}>
              <View style={[styles.pickerBlock, { zIndex: 3000 }]}>
                <Text style={styles.pickerLabel}>Du verset</Text>
                <DropDownPicker
                  open={openStart}
                  setOpen={setOpenStart}
                  value={startVerse}
                  items={verseItems}
                  setValue={cb => handleStart(cb(startVerse))}
                  onSelectItem={item => handleStart(Number(item.value))}
                  maxHeight={220}
                  listMode="SCROLLVIEW"
                  dropDownDirection="TOP"
                  style={styles.dropdown}
                />
              </View>
              <View style={[styles.pickerBlock, { zIndex: 2000 }]}>
                <Text style={styles.pickerLabel}>Au verset</Text>
                <DropDownPicker
                  open={openEnd}
                  setOpen={setOpenEnd}
                  value={endVerse}
                  items={verseItems}
                  setValue={cb => handleEnd(cb(endVerse))}
                  onSelectItem={item => handleEnd(Number(item.value))}
                  maxHeight={220}
                  listMode="SCROLLVIEW"
                  dropDownDirection="TOP"
                  style={styles.dropdown}
                />
              </View>
            </View>

            <Pressable style={styles.continueBtn} onPress={() => router.push('/options')}>
              <Text style={styles.continueText}>Continuer</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: secondary3 },
  headerWrap: { paddingHorizontal: 16, paddingTop: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 4,
    paddingHorizontal: 12,
    height: 44,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  searchInput: { flex: 1, fontSize: 15, color: primary },
  list: { padding: 16, paddingBottom: 32 },
  footer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  footerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  footerTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: primary },
  footerSpan: {
    fontSize: 12,
    fontWeight: '600',
    color: secondary,
    backgroundColor: secondary3,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pickers: { flexDirection: 'row', gap: 12 },
  pickerBlock: { flex: 1, gap: 4 },
  pickerLabel: {
    fontSize: 11,
    color: secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdown: { borderColor: secondary2 },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: primary,
    borderRadius: 14,
    height: 52,
  },
  continueText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
})
