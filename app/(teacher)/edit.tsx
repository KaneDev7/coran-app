import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { primary, secondary, secondary2, secondary3 } from '@/style/variables'
import { sourates } from '@/constants/sorats.list'
import { InputRange } from '@/components/ui/InputRange'
import { StepHeader } from '@/components/teacher/StepHeader'
import { useAuth } from '@/context/AuthContext'
import { getSavedSessions, updateSession } from '@/services/teacherStorage'
import type { SavedSession } from '@/types/models'
import {
  sensitivityLabel,
  MIN_SENSITIVITY_DB,
  MAX_SENSITIVITY_DB,
  DEFAULT_SENSITIVITY_DB,
} from '@/services/voiceDetector'

const MIN_REP = 1
const MAX_REP = 20

// Modifier les paramètres d'une séance enregistrée (répétitions, vitesse,
// sensibilité). La sauvegarde écrase les anciennes valeurs.
export default function TeacherEditSession() {
  const { id } = useLocalSearchParams()
  const { user } = useAuth()

  const [session, setSession] = useState<SavedSession | null>(null)
  const [repetitions, setRepetitions] = useState(2)
  const [rate, setRate] = useState(1)
  const [sensitivityDb, setSensitivityDb] = useState(DEFAULT_SENSITIVITY_DB)

  useEffect(() => {
    getSavedSessions(user?.id).then(list => {
      const found = list.find(s => String(s.id) === String(id))
      if (found) {
        setSession(found)
        setRepetitions(found.repetitions ?? 2)
        setRate(found.rate ?? 1)
        setSensitivityDb(found.sensitivityDb ?? DEFAULT_SENSITIVITY_DB)
      }
    })
  }, [id, user?.id])

  const changeRep = (delta: number) =>
    setRepetitions(r => Math.max(MIN_REP, Math.min(MAX_REP, r + delta)))

  const handleSave = async () => {
    if (!session) return
    await updateSession(user?.id, session.id, { repetitions, rate, sensitivityDb })
    router.back()
  }

  const surahName = session ? sourates[session.surahIndex]?.nom : ''

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepHeader
          title="Modifier la séance"
          subtitle={session ? `${surahName} · versets ${session.startVerse}-${session.endVerse}` : ''}
        />

        {/* Répétitions par verset */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Répétitions par verset</Text>
          <Text style={styles.cardHint}>
            Nombre de fois où chaque verset est répété avant de passer au suivant
          </Text>
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => changeRep(-1)}
              disabled={repetitions <= MIN_REP}
            >
              <Feather name="minus" size={22} color={repetitions <= MIN_REP ? secondary2 : primary} />
            </Pressable>
            <Text style={styles.stepperValue}>{repetitions}</Text>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => changeRep(1)}
              disabled={repetitions >= MAX_REP}
            >
              <Feather name="plus" size={22} color={repetitions >= MAX_REP ? secondary2 : primary} />
            </Pressable>
          </View>
        </View>

        {/* Vitesse */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vitesse de récitation</Text>
          <Text style={styles.cardHint}>
            Ralentissez pour mémoriser, accélérez quand vous maîtrisez
          </Text>
          <View style={styles.row}>
            <MaterialCommunityIcons name="speedometer-slow" size={20} color={secondary} />
            <InputRange value={rate} setValue={setRate} min={0.75} max={1.25} />
            <MaterialCommunityIcons name="speedometer" size={20} color={secondary} />
          </View>
          <Text style={styles.value}>{rate.toFixed(2)}×</Text>
        </View>

        {/* Sensibilité du micro */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sensibilité du micro</Text>
          <Text style={styles.cardHint}>
            Endroit bruyant ? Glissez vers la droite pour ignorer les bruits de fond
          </Text>
          <View style={styles.row}>
            <MaterialCommunityIcons name="microphone-outline" size={20} color={secondary} />
            <InputRange
              value={sensitivityDb}
              setValue={setSensitivityDb}
              min={MIN_SENSITIVITY_DB}
              max={MAX_SENSITIVITY_DB}
            />
            <MaterialCommunityIcons name="microphone" size={20} color={secondary} />
          </View>
          <Text style={styles.value}>{sensitivityLabel(sensitivityDb)}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
        <Pressable
          style={[styles.saveBtn, !session && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!session}
        >
          <MaterialCommunityIcons name="content-save-outline" size={20} color="#fff" />
          <Text style={styles.saveText}>Enregistrer</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: secondary3 },
  content: { padding: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: primary },
  cardHint: { fontSize: 12, color: secondary, marginTop: 2, marginBottom: 8 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginTop: 6,
  },
  stepperBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: secondary3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontSize: 30, fontWeight: 'bold', color: primary, minWidth: 44, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  value: { textAlign: 'center', color: primary, fontWeight: '600', marginTop: 4 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    backgroundColor: secondary3,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: secondary2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: primary, fontSize: 15, fontWeight: '600' },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    backgroundColor: primary,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
})
