import { View, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { primary, secondary2 } from '@/style/variables'

interface MicMeterProps {
  level?: number
  active?: boolean
  label?: string
}

// Mètre de niveau micro en direct : rassure l'utilisateur que le
// détecteur l'entend. `level` ∈ 0..1. `active` = phase d'écoute.
export function MicMeter({ level = 0, active = false, label }: MicMeterProps) {
  // 5 barres qui s'allument selon le niveau.
  const bars = [0.15, 0.35, 0.55, 0.75, 0.9]

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          active && styles.iconCircleActive,
          active && { transform: [{ scale: 1 + level * 0.25 }] },
        ]}
      >
        <MaterialCommunityIcons
          name={active ? 'microphone' : 'microphone-off'}
          size={26}
          color={active ? '#fff' : secondary2}
        />
      </View>
      <View style={styles.bars}>
        {bars.map((threshold, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { height: 8 + i * 5 },
              active && level >= threshold && styles.barOn,
            ]}
          />
        ))}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 10 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: { backgroundColor: primary },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 32 },
  bar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  barOn: { backgroundColor: primary },
  label: { fontSize: 12, color: secondary2 },
})
