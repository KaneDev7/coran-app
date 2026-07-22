import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { primary, secondary, secondary2, secondary3 } from '@/style/variables'
import { reciteurs } from '@/constants/reciteurs'
import { InputRange } from '@/components/ui/InputRange'
import { StepHeader } from '@/components/teacher/StepHeader'
import { useTeacher } from '@/context/TeacherContext'
import { useAuth } from '@/context/AuthContext'
import { saveSession } from '@/services/teacherStorage'

const MIN_REP = 1
const MAX_REP = 20

export default function TeacherOptionsStep() {
  const {
    surahIndex,
    surah,
    startVerse,
    endVerse,
    repetitions,
    setRepetitions,
    reciter,
    setReciter,
    rate,
    setRate,
  } = useTeacher()
  const { user } = useAuth()

  const [saved, setSaved] = useState(false)

  const changeRep = delta =>
    setRepetitions(r => Math.max(MIN_REP, Math.min(MAX_REP, r + delta)))

  const handleSave = async () => {
    await saveSession(user?.id, {
      surahIndex,
      startVerse,
      endVerse,
      reciter,
      repetitions,
      rate,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepHeader
          title="Réglages"
          subtitle={`${surah?.nom} · versets ${startVerse}-${endVerse}`}
          step={3}
        />

        {/* Répétitions par verset */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Répétitions par verset</Text>
          <Text style={styles.cardHint}>
            Combien de fois répéter chaque verset avant de passer au suivant
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

        {/* Réciteur */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Réciteur</Text>
          <FlatList
            data={reciteurs}
            keyExtractor={item => item.title}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
            renderItem={({ item }) => {
              const active = item.title === reciter
              const isDefault = item.title === 'aymanswoaid'
              return (
                <Pressable
                  style={[styles.reciterItem, !isDefault && styles.reciterItemDisabled]}
                  onPress={() => isDefault && setReciter(item.title)}
                  disabled={!isDefault}
                >
                  <View style={[styles.avatarRing, active && styles.avatarRingActive, !isDefault && styles.avatarRingGray]}>
                    <Image source={item.url} style={[styles.avatar, !isDefault && styles.avatarGray]} />
                  </View>
                  <Text style={[styles.reciterName, active && styles.reciterNameActive, !isDefault && styles.reciterNameGray]} numberOfLines={1}>
                    {item.name}
                  </Text>
                </Pressable>
              )
            }}
          />
        </View>

        {/* Vitesse */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vitesse de récitation</Text>
          <View style={styles.rateRow}>
            <MaterialCommunityIcons name="speedometer-slow" size={20} color={secondary} />
            <InputRange value={rate} setValue={setRate} min={0.75} max={1.25} />
            <MaterialCommunityIcons name="speedometer" size={20} color={secondary} />
          </View>
          <Text style={styles.rateValue}>{rate.toFixed(2)}×</Text>
        </View>

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <MaterialCommunityIcons
            name={saved ? 'check' : 'content-save-outline'}
            size={18}
            color={primary}
          />
          <Text style={styles.saveText}>
            {saved ? 'Passage enregistré' : 'Enregistrer ce passage'}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.startBtn} onPress={() => router.push('/session')}>
          <MaterialCommunityIcons name="play" size={22} color="#fff" />
          <Text style={styles.startText}>Démarrer la séance</Text>
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
  reciterItem: { alignItems: 'center', width: 68, gap: 4 },
  reciterItemDisabled: { opacity: 0.4 },
  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarRingActive: { borderColor: primary },
  avatarRingGray: { borderColor: secondary2 },
  avatar: { width: '100%', height: '100%', borderRadius: 28 },
  avatarGray: { opacity: 0.5 },
  reciterName: { fontSize: 11, color: secondary, textAlign: 'center' },
  reciterNameActive: { color: primary, fontWeight: 'bold' },
  reciterNameGray: { color: secondary2 },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  rateValue: { textAlign: 'center', color: primary, fontWeight: '600', marginTop: 4 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: secondary2,
  },
  saveText: { color: primary, fontWeight: '600' },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    backgroundColor: secondary3,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2e7d32',
    borderRadius: 14,
    height: 54,
  },
  startText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
})
