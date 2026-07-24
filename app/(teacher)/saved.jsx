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
import * as Progress from 'react-native-progress'
import { ConfirmDialog } from 'react-native-simple-dialogs'
import { primary, secondary, secondary2, secondary3 } from '@/style/variables'
import { sourates } from '@/constants/sorats.list'
import { StepHeader } from '@/components/teacher/StepHeader'
import { useTeacher } from '@/context/TeacherContext'
import { useAuth } from '@/context/AuthContext'
import { getSavedSessions } from '@/services/teacherStorage'

// Pastille de statut d'un verset : ✓ téléchargé, spinner en cours,
// horloge en attente, bouton « réessayer » si erreur.
function VerseChip({ verseNumber, status, onRetry }) {
  if (status === 'error') {
    return (
      <Pressable style={[styles.chip, styles.chipError]} onPress={onRetry}>
        <MaterialCommunityIcons name="refresh" size={12} color="#fff" />
        <Text style={styles.chipErrorText}>v-{verseNumber}</Text>
      </Pressable>
    )
  }
  const isActive = status === 'downloading'
  return (
    <View style={[styles.chip, status === 'done' && styles.chipDone]}>
      {isActive ? (
        <Progress.Circle size={11} indeterminate borderWidth={1.5} color={primary} />
      ) : status === 'done' ? (
        <MaterialCommunityIcons name="check" size={12} color="#2e7d32" />
      ) : (
        <MaterialCommunityIcons name="clock-outline" size={12} color={secondary} />
      )}
      <Text style={[styles.chipText, status === 'done' && styles.chipDoneText]}>
        v-{verseNumber}
      </Text>
    </View>
  )
}

function SessionCard({ item, onResume, onDelete, onEdit }) {
  const { downloadState, retryVerse } = useTeacher()

  const versets = downloadState[item.id]?.versets || null
  const entries = versets ? Object.entries(versets) : []
  const total = entries.length
  const done = entries.filter(([, s]) => s === 'done').length
  const errors = entries.filter(([, s]) => s === 'error').length
  const downloading = entries.some(([, s]) => s === 'downloading' || s === 'pending')
  const showProgress = versets && (downloading || errors > 0)

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Pressable style={styles.cardMain} onPress={() => onResume(item)}>
          <MaterialCommunityIcons name="bookmark-check" size={24} color={primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{sourates[item.surahIndex]?.nom}</Text>
            <Text style={styles.meta}>
              Versets {item.startVerse}-{item.endVerse} · {item.repetitions}× · {item.reciter}
            </Text>
            {versets && !showProgress && done === total && total > 0 && (
              <View style={styles.offlineTag}>
                <MaterialCommunityIcons name="check-circle" size={12} color="#2e7d32" />
                <Text style={styles.offlineTagText}>Disponible hors ligne</Text>
              </View>
            )}
          </View>
        </Pressable>
        <View style={styles.actions}>
          <Pressable onPress={() => onEdit(item)} hitSlop={8} style={styles.actionBtn}>
            <Feather name="edit-2" size={17} color={primary} />
          </Pressable>
          <Pressable onPress={() => onDelete(item)} hitSlop={8} style={styles.actionBtn}>
            <Feather name="trash-2" size={17} color="#dc3545" />
          </Pressable>
        </View>
      </View>

      {showProgress && (
        <View style={styles.downloadSection}>
          <Text style={[styles.downloadStatus, errors > 0 && !downloading && styles.downloadStatusError]}>
            {downloading
              ? `Téléchargement en cours… ${done}/${total}`
              : `${errors} verset${errors > 1 ? 's' : ''} en erreur — appuyez pour réessayer`}
          </Text>
          <Progress.Bar
            progress={total > 0 ? done / total : 0}
            width={null}
            height={5}
            color={errors > 0 && !downloading ? '#dc3545' : primary}
            unfilledColor="rgba(0,0,0,0.06)"
            borderWidth={0}
            style={{ marginVertical: 6 }}
          />
          <View style={styles.chipsRow}>
            {entries.map(([verseNumber, status]) => (
              <VerseChip
                key={verseNumber}
                verseNumber={verseNumber}
                status={status}
                onRetry={() => retryVerse(item, Number(verseNumber))}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

// Séances enregistrées : reprendre en un tap + suivi du téléchargement
// hors ligne (progression, statut par verset, reprise des échecs).
export default function TeacherSavedSessions() {
  const { loadConfig, removeSessionOffline } = useTeacher()
  const { user } = useAuth()

  const [saved, setSaved] = useState([])
  const [toDelete, setToDelete] = useState(null)

  const refresh = useCallback(() => {
    getSavedSessions(user?.id).then(setSaved)
  }, [user?.id])

  useFocusEffect(refresh)

  const handleResume = config => {
    loadConfig(config)
    router.push('/session')
  }

  const handleEdit = session => {
    router.push({ pathname: '/edit', params: { id: String(session.id) } })
  }

  const confirmDelete = async () => {
    const session = toDelete
    setToDelete(null)
    if (!session) return
    await removeSessionOffline(session)
    refresh()
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerWrap}>
        <StepHeader title="Séances enregistrées" subtitle="Reprenez un passage · disponible hors ligne" />
      </View>

      {saved.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="bookmark-outline" size={48} color={secondary2} />
          <Text style={styles.emptyTitle}>Aucune séance enregistrée</Text>
          <Text style={styles.emptyText}>
            Enregistrez un passage depuis les réglages d'une nouvelle séance
            pour le retrouver ici, accessible hors ligne.
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
            <SessionCard
              item={item}
              onResume={handleResume}
              onDelete={setToDelete}
              onEdit={handleEdit}
            />
          )}
        />
      )}

      <ConfirmDialog
        title="Supprimer la séance"
        message="La séance et ses versets téléchargés seront supprimés de cet appareil."
        visible={!!toDelete}
        onTouchOutside={() => setToDelete(null)}
        positiveButton={{ title: 'Supprimer', onPress: confirmDelete }}
        negativeButton={{ title: 'Annuler', onPress: () => setToDelete(null) }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: secondary3 },
  headerWrap: { paddingHorizontal: 16, paddingTop: 8 },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: secondary2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: secondary3,
  },
  name: { fontSize: 15, fontWeight: '600', color: primary },
  meta: { fontSize: 12, color: secondary, marginTop: 2, textTransform: 'capitalize' },
  offlineTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  offlineTagText: { fontSize: 11, color: '#2e7d32', fontWeight: '600' },
  downloadSection: { marginTop: 12 },
  downloadStatus: { fontSize: 12, color: primary, fontWeight: '600' },
  downloadStatusError: { color: '#dc3545' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  chipText: { fontSize: 11, color: secondary, fontWeight: '600' },
  chipDone: { backgroundColor: 'rgba(46,125,50,0.12)' },
  chipDoneText: { color: '#2e7d32' },
  chipError: { backgroundColor: '#dc3545' },
  chipErrorText: { fontSize: 11, color: '#fff', fontWeight: '600' },
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
