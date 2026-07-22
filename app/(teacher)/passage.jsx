import { useMemo, useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import DropDownPicker from 'react-native-dropdown-picker'
import { primary, secondary, secondary3 } from '@/style/variables'
import { StepHeader } from '@/components/teacher/StepHeader'
import { useTeacher } from '@/context/TeacherContext'

export default function TeacherPassageStep() {
  const {
    surah,
    versesCount,
    startVerse,
    endVerse,
    setStartVerse,
    setEndVerse,
  } = useTeacher()

  const [openStart, setOpenStart] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)

  const items = useMemo(
    () =>
      Array.from({ length: versesCount }).map((_, i) => ({
        label: `Verset ${i + 1}`,
        value: i + 1,
      })),
    [versesCount],
  )

  const verseSpan = endVerse - startVerse + 1

  const handleStart = value => {
    setStartVerse(value)
    if (value > endVerse) setEndVerse(value)
  }
  const handleEnd = value => {
    if (value < startVerse) setEndVerse(startVerse)
    else setEndVerse(value)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <StepHeader
          title={surah?.nom}
          subtitle="Étape 2 — Choisissez la plage de versets"
          step={2}
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

        <View style={styles.pickers}>
          <View style={[styles.pickerBlock, { zIndex: 3000 }]}>
            <Text style={styles.label}>Du verset</Text>
            <DropDownPicker
              open={openStart}
              setOpen={setOpenStart}
              value={startVerse}
              items={items}
              setValue={cb => handleStart(cb(startVerse))}
              onSelectItem={item => handleStart(item.value)}
              maxHeight={280}
              listMode="SCROLLVIEW"
              style={styles.dropdown}
            />
          </View>
          <View style={[styles.pickerBlock, { zIndex: 2000 }]}>
            <Text style={styles.label}>Au verset</Text>
            <DropDownPicker
              open={openEnd}
              setOpen={setOpenEnd}
              value={endVerse}
              items={items}
              setValue={cb => handleEnd(cb(endVerse))}
              onSelectItem={item => handleEnd(item.value)}
              maxHeight={280}
              listMode="SCROLLVIEW"
              style={styles.dropdown}
            />
          </View>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {verseSpan} verset{verseSpan > 1 ? 's' : ''} à réviser
          </Text>
        </View>

        <Pressable style={styles.button} onPress={() => router.push('/options')}>
          <Text style={styles.buttonText}>Continuer</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: secondary3 },
  content: { flex: 1, padding: 16 },
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
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: secondary,
    lineHeight: 18,
  },
  pickers: { flexDirection: 'row', gap: 16, marginTop: 12 },
  pickerBlock: { flex: 1, gap: 6 },
  label: {
    fontSize: 11,
    color: secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdown: { borderColor: '#DCC7A1' },
  summary: {
    marginTop: 24,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  summaryText: { color: primary, fontWeight: '600' },
  button: {
    marginTop: 'auto',
    backgroundColor: primary,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
})
