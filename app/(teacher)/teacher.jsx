import { useEffect, useMemo, useState } from 'react'
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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { primary } from '@/style/variables'
import { primary, secondary, secondary2, secondary3 } from '@/style/variables'
import { sourates } from '@/constants/sorats.list'
import { SurahCard } from '@/components/SurahCard'
import { StepHeader } from '@/components/teacher/StepHeader'
import { useTeacher } from '@/context/TeacherContext'
import { useAuth } from '@/context/AuthContext'
import { getSavedSessions, deleteSession } from '@/services/teacherStorage'

const normalize = value =>
  value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function TeacherSurahStep() {
  const { selectSurah, loadConfig } = useTeacher()
  const { user } = useAuth()

  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState([])

  useEffect(() => {
    getSavedSessions(user?.id).then(setSaved)
  }, [user?.id])

  const filtered = useMemo(() => {
    const q = normalize(query)
    if (!q) return sourates
    return sourates.filter(
      s => normalize(s.nom).includes(q) || String(s.numero) === q,
    )
  }, [query])

  const handleSelectSurah = index => {
    selectSurah(index)
    router.push('/passage')
  }

  const handleResume = config => {
    loadConfig(config)
    router.push('/session')
  }

  const handleDelete = async id => {
    await deleteSession(user?.id, id)
    setSaved(await getSavedSessions(user?.id))
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerWrap}>
          <View style={styles.homeRow}>
            <StepHeader
              title="Mode Professeur"
              subtitle="Étape 1 — Choisissez une sourate"
              step={1}
            />
            <Pressable
              style={styles.homeIconBtn}
              onPress={() => router.push('/')}
              hitSlop={10}
            >
              <MaterialCommunityIcons name="home-variant-outline" size={20} color={primary} />
            </Pressable>
          </View>

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
          ListHeaderComponent={
            saved.length > 0 && !query ? (
              <View style={styles.savedSection}>
                <Text style={styles.savedTitle}>Reprendre un passage</Text>
                {saved.map(s => (
                  <Pressable
                    key={s.id}
                    style={styles.savedCard}
                    onPress={() => handleResume(s)}
                  >
                    <MaterialCommunityIcons name="bookmark-check" size={22} color={primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.savedName}>
                        {sourates[s.surahIndex]?.nom}
                      </Text>
                      <Text style={styles.savedMeta}>
                        Versets {s.startVerse}-{s.endVerse} · {s.repetitions}× · {s.reciter}
                      </Text>
                    </View>
                    <Pressable onPress={() => handleDelete(s.id)} hitSlop={10}>
                      <Feather name="trash-2" size={18} color="#dc3545" />
                    </Pressable>
                  </Pressable>
                ))}
                <Text style={styles.savedTitle}>Toutes les sourates</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <SurahCard
              item={item}
              onPress={() => handleSelectSurah(item.numero - 1)}
            />
          )}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: secondary3 },
  headerWrap: { paddingHorizontal: 16, paddingTop: 8 },
  homeRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },
  homeIconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', marginTop: 20 },
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
  savedSection: { marginBottom: 4 },
  savedTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: primary,
    marginBottom: 8,
    marginTop: 4,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: secondary2,
  },
  savedName: { fontSize: 15, fontWeight: '600', color: primary },
  savedMeta: { fontSize: 12, color: secondary, marginTop: 2, textTransform: 'capitalize' },
})
