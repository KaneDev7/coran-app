import { useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { primary, secondary, secondary2, secondary3 } from '@/style/variables'
import { sourates } from '@/constants/sorats.list'
import { StepHeader } from '@/components/teacher/StepHeader'
import { useTeacher } from '@/context/TeacherContext'
import { useAuth } from '@/context/AuthContext'
import { getSavedSessions, deleteSession } from '@/services/teacherStorage'

// Séances enregistrées : reprendre en un tap un passage sauvegardé.
export default function TeacherSavedSessions() {
  const { loadConfig } = useTeacher()
  const { user } = useAuth()

  const [saved, setSaved] = useState([])

  // Recharge à chaque fois que l'écran reprend le focus (ex. retour
  // après suppression ou nouvel enregistrement).
  useFocusEffect(
    useCallback(() => {
      getSavedSessions(user?.id).then(setSaved)
    }, [user?.id]),
  )

  const handleResume = config => {
    loadConfig(config)
    router.push('/session')
  }

  const handleDelete = async id => {
    await deleteSession(user?.id, id)
    setSaved(await getSavedSessions(user?.id))
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerWrap}>
        <StepHeader title="Séances enregistrées" subtitle="Reprenez un passage sauvegardé" />
      </View>

      {saved.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="bookmark-outline" size={48} color={secondary2} />
          <Text style={styles.emptyTitle}>Aucune séance enregistrée</Text>
          <Text style={styles.emptyText}>
            Enregistrez un passage depuis les réglages d'une nouvelle séance
            pour le retrouver ici.
          </Text>
          <Pressable style={styles.newBtn} onPress={() => router.replace('/new')}>
            <Feather name="plus" size={18} color="#fff" />
            <Text style={styles.newBtnText}>Nouvelle séance</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => handleResume(item)}>
              <MaterialCommunityIcons name="bookmark-check" size={24} color={primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{sourates[item.surahIndex]?.nom}</Text>
                <Text style={styles.meta}>
                  Versets {item.startVerse}-{item.endVerse} · {item.repetitions}× · {item.reciter}
                </Text>
              </View>
              <Pressable onPress={() => handleDelete(item.id)} hitSlop={10}>
                <Feather name="trash-2" size={18} color="#dc3545" />
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: secondary3 },
  headerWrap: { paddingHorizontal: 16, paddingTop: 8 },
  list: { padding: 16, paddingBottom: 32 },
  card: {
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
  name: { fontSize: 15, fontWeight: '600', color: primary },
  meta: { fontSize: 12, color: secondary, marginTop: 2, textTransform: 'capitalize' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: primary, marginTop: 6 },
  emptyText: { fontSize: 13, color: secondary, textAlign: 'center', lineHeight: 19 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  newBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
})
