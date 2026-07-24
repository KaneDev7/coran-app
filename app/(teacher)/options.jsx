import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { ConfirmDialog } from 'react-native-simple-dialogs'
import { primary, secondary, secondary2, secondary3 } from '@/style/variables'
import { reciteurs } from '@/constants/reciteurs'
import { InputRange } from '@/components/ui/InputRange'
import { StepHeader } from '@/components/teacher/StepHeader'
import { useTeacher } from '@/context/TeacherContext'
import {
  sensitivityLabel,
  MIN_SENSITIVITY_DB,
  MAX_SENSITIVITY_DB,
} from '@/services/voiceDetector'

const MIN_REP = 1
const MAX_REP = 20

// Sélection restreinte : les 3 premiers réciteurs + le tout dernier
// (4 au total), pour tenir sur une ligne sans défilement horizontal.
const DISPLAYED_RECITERS = [
  ...reciteurs.slice(0, 3),
  reciteurs[reciteurs.length - 1],
]

export default function TeacherOptionsStep() {
  const {
    surah,
    startVerse,
    endVerse,
    repetitions,
    setRepetitions,
    reciter,
    setReciter,
    rate,
    setRate,
    settings,
    setSensitivity,
    saveSessionOffline,
  } = useTeacher()

  // Modal de confirmation avant téléchargement hors ligne.
  const [confirmVisible, setConfirmVisible] = useState(false)

  const changeRep = delta =>
    setRepetitions(Math.max(MIN_REP, Math.min(MAX_REP, repetitions + delta)))

  // Enregistre + télécharge la séance pour un accès hors ligne, puis
  // redirige vers la liste des séances (où la progression s'affiche).
  const handleConfirmSave = async () => {
    setConfirmVisible(false)
    await saveSessionOffline()
    router.replace('/saved')
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepHeader
          title="Réglages"
          subtitle={`${surah?.nom} · versets ${startVerse}-${endVerse}`}
          step={2}
          totalSteps={2}
        />

        {/* Conseils pour une meilleure expérience */}
        <View style={styles.tipsCard}>
          <View style={styles.tipRow}>
            <MaterialCommunityIcons name="volume-mute" size={20} color={primary} />
            <Text style={styles.tipText}>Trouvez un endroit calme et sans trop de bruit fort</Text>
          </View>
          <View style={styles.tipRow}>
            <MaterialCommunityIcons name="microphone" size={20} color={primary} />
            <Text style={styles.tipText}>Testez votre micro avant de commencer</Text>
          </View>
        </View>

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
          <Text style={styles.cardHint}>
            La voix qui récite le verset avant que vous ne le répétiez
          </Text>
          <View style={styles.reciterRow}>
            {DISPLAYED_RECITERS.map(item => {
              const active = item.title === reciter
              return (
                <Pressable
                  key={item.title}
                  style={styles.reciterItem}
                  onPress={() => setReciter(item.title)}
                >
                  <View style={[styles.avatarRing, active && styles.avatarRingActive]}>
                    <Image source={item.url} style={styles.avatar} />
                  </View>
                  <Text style={[styles.reciterName, active && styles.reciterNameActive]} numberOfLines={1}>
                    {item.name}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Vitesse */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vitesse de récitation</Text>
          <Text style={styles.cardHint}>
            Ralentissez pour bien mémoriser, accélérez quand vous maîtrisez.
            Le ton de la voix ne change pas. Ajustable aussi en direct.
          </Text>
          <View style={styles.rateRow}>
            <MaterialCommunityIcons name="speedometer-slow" size={20} color={secondary} />
            <InputRange value={rate} setValue={setRate} min={0.75} max={1.25} />
            <MaterialCommunityIcons name="speedometer" size={20} color={secondary} />
          </View>
          <Text style={styles.rateValue}>{rate.toFixed(2)}×</Text>
        </View>

        {/* Sensibilité du micro */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sensibilité du micro</Text>
          <Text style={styles.cardHint}>
            Endroit bruyant ? Glissez vers la droite pour ignorer les bruits
            de fond. Réglable aussi en direct.
          </Text>
          <View style={styles.rateRow}>
            <MaterialCommunityIcons name="microphone-outline" size={20} color={secondary} />
            <InputRange
              value={settings.sensitivityDb}
              setValue={setSensitivity}
              min={MIN_SENSITIVITY_DB}
              max={MAX_SENSITIVITY_DB}
            />
            <MaterialCommunityIcons name="microphone" size={20} color={secondary} />
          </View>
          <Text style={styles.rateValue}>{sensitivityLabel(settings.sensitivityDb)}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {/* Enregistrer (hors ligne) — juste au-dessus de Démarrer */}
        <Pressable style={styles.saveBtn} onPress={() => setConfirmVisible(true)}>
          <MaterialCommunityIcons name="download-outline" size={20} color="#fff" />
          <Text style={styles.saveText}>Enregistrer ce passage (hors ligne)</Text>
        </Pressable>

        <Pressable style={styles.startBtn} onPress={() => router.push('/session')}>
          <MaterialCommunityIcons name="play" size={22} color="#fff" />
          <Text style={styles.startText}>Démarrer la séance</Text>
        </Pressable>
      </View>

      <ConfirmDialog
        title="Enregistrer hors ligne"
        message="Ce passage sera téléchargé (audio + texte de chaque verset) pour être accessible sans connexion. Vous suivrez la progression sur l'écran des séances enregistrées."
        visible={confirmVisible}
        onTouchOutside={() => setConfirmVisible(false)}
        positiveButton={{ title: 'Télécharger', onPress: handleConfirmSave }}
        negativeButton={{ title: 'Annuler', onPress: () => setConfirmVisible(false) }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: secondary3 },
  content: { padding: 16, paddingBottom: 24 },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipText: { flex: 1, fontSize: 13, color: secondary, lineHeight: 18 },
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
  reciterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  reciterItem: { alignItems: 'center', width: 68, gap: 4 },
  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarRingActive: { borderColor: primary },
  avatar: { width: '100%', height: '100%', borderRadius: 28 },
  reciterName: { fontSize: 11, color: secondary, textAlign: 'center' },
  reciterNameActive: { color: primary, fontWeight: 'bold' },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  rateValue: { textAlign: 'center', color: primary, fontWeight: '600', marginTop: 4 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: primary,
  },
  saveText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  footer: {
    padding: 16,
    gap: 10,
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
