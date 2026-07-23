import { View, Text, Pressable, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { primary, secondary, secondary2 } from '@/style/variables'

// En-tête des étapes de l'assistant professeur : retour + titre +
// progression (points).
export function StepHeader({ title, subtitle, step, totalSteps = 3 }) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={22} color={primary} />
        </Pressable>
        {step ? (
          <View style={styles.dots}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i < step && styles.dotActive]}
              />
            ))}
          </View>
        ) : (
          <View style={{ width: 22 }} />
        )}
        <View style={{ width: 22 }} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 6, marginBottom: 12 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 22 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: secondary2,
  },
  dotActive: { backgroundColor: primary, width: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: primary },
  subtitle: { fontSize: 13, color: secondary },
})
