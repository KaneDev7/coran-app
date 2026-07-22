import { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { ConfirmDialog } from 'react-native-simple-dialogs'
import { primary, secondary, secondary3 } from '@/style/variables'
import { formatTime } from '@/helpers'
import { VerseDisplay } from '@/components/teacher/VerseDisplay'
import { PhaseBanner } from '@/components/teacher/PhaseBanner'
import { MicMeter } from '@/components/teacher/MicMeter'
import { SessionControls } from '@/components/teacher/SessionControls'
import { InputRange } from '@/components/ui/InputRange'
import { useTeacher } from '@/context/TeacherContext'

export default function TeacherSession() {
  const {
    surah,
    startVerse,
    endVerse,
    repetitions,
    rate,
    setRate,
    phase,
    currentVerse,
    currentRepetition,
    loopCount,
    verseText,
    micLevel,
    permissionDenied,
    setPermissionDenied,
    startedAt,
    start,
    stop,
    pause,
    resume,
    replayVerse,
    skipVerse,
  } = useTeacher()

  const [elapsed, setElapsed] = useState(0)
  const startedRef = useRef(false)

  // Démarre le drill à l'ouverture ; arrête tout à la fermeture.
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true
      start()
    }
    return () => {
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Chronomètre de la séance.
  useEffect(() => {
    if (!startedAt) {
      setElapsed(0)
      return
    }
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000)
    return () => clearInterval(id)
  }, [startedAt])

  const handleStop = () => {
    stop()
    router.replace('/')
  }

  const isPaused = phase === 'paused'
  const listening = phase === 'listening' || phase === 'repeating'

  // Progression dans le passage.
  const totalVerses = endVerse - startVerse + 1
  const versePosition = Math.min(
    Math.max(currentVerse - startVerse + 1, 1),
    totalVerses,
  )

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* En-tête : quitter + titre + chrono */}
      <View style={styles.header}>
        <Pressable onPress={handleStop} hitSlop={10} style={styles.iconBtn}>
          <Feather name="x" size={22} color={primary} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.surahName}>{surah?.nom}</Text>
          <Text style={styles.timer}>{formatTime(elapsed)}</Text>
        </View>
        <View style={styles.loopBadge}>
          <MaterialCommunityIcons name="repeat" size={13} color={secondary} />
          <Text style={styles.loopText}>{loopCount}</Text>
        </View>
      </View>

      {/* Progression : verset X/Y et répétition n/N */}
      <View style={styles.progressRow}>
        <View style={styles.progressPill}>
          <Text style={styles.progressLabel}>Verset</Text>
          <Text style={styles.progressValue}>
            {versePosition}/{totalVerses}
          </Text>
        </View>
        <View style={styles.progressPill}>
          <Text style={styles.progressLabel}>Répétition</Text>
          <Text style={styles.progressValue}>
            {currentRepetition}/{repetitions}
          </Text>
        </View>
      </View>

      <PhaseBanner phase={phase} />

      {/* Texte du verset */}
      <View style={styles.verseCard}>
        <VerseDisplay text={verseText} placeholder="Chargement…" />
      </View>

      {/* Mètre micro */}
      <View style={styles.micZone}>
        <MicMeter
          level={micLevel}
          active={listening}
          label={
            phase === 'repeating'
              ? 'Je vous écoute'
              : phase === 'listening'
                ? 'Répétez maintenant'
                : ' '
          }
        />
      </View>

      {/* Contrôle de vitesse */}
      <View style={styles.rateControl}>
        <MaterialCommunityIcons name="speedometer-slow" size={18} color={secondary} />
        <InputRange value={rate} setValue={setRate} min={0.75} max={1.25} />
        <MaterialCommunityIcons name="speedometer" size={18} color={secondary} />
        <Text style={styles.rateValue}>{rate.toFixed(2)}×</Text>
      </View>

      {/* Contrôles manuels */}
      <View style={styles.controls}>
        <SessionControls
          paused={isPaused}
          onReplay={replayVerse}
          onSkip={skipVerse}
          onPauseResume={isPaused ? resume : pause}
          onStop={handleStop}
        />
      </View>

      <ConfirmDialog
        title="Micro nécessaire"
        message="Le mode Professeur a besoin du micro pour détecter votre récitation. Autorisez l'accès au micro dans les réglages de votre téléphone."
        visible={permissionDenied}
        onTouchOutside={() => setPermissionDenied(false)}
        positiveButton={{
          title: 'Retour',
          onPress: () => {
            setPermissionDenied(false)
            handleStop()
          },
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: secondary3,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahName: { fontSize: 16, fontWeight: 'bold', color: primary },
  timer: { fontSize: 12, color: secondary },
  loopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  loopText: { fontSize: 13, fontWeight: 'bold', color: secondary },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 14,
    marginBottom: 12,
  },
  progressPill: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  progressLabel: {
    fontSize: 10,
    color: secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressValue: { fontSize: 18, fontWeight: 'bold', color: primary },
  verseCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginTop: 12,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  micZone: { alignItems: 'center', marginVertical: 16 },
  rateControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  rateValue: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: primary,
  },
  controls: { marginBottom: 8 },
})
