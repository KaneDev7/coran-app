import { Pressable, View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'

// Grande carte de choix de mode sur la page d'accueil.
export function ModeCard({ icon, title, subtitle, colors, onPress, badge, disabled }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.wrapper,
        pressed && !disabled && styles.pressed,
        disabled && styles.wrapperDisabled,
      ]}
      onPress={!disabled ? onPress : undefined}
      disabled={disabled}
    >
      <LinearGradient
        colors={disabled ? ['#ccc', '#999'] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, disabled && styles.cardDisabled]}
      >
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={icon} size={34} color="#fff" />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.chevronContainer}>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : (
            <Feather name="chevron-right" size={24} color="rgba(255,255,255,0.9)" />
          )}
        </View>
      </LinearGradient>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  wrapperDisabled: { opacity: 0.6 },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 22,
    gap: 16,
  },
  cardDisabled: { opacity: 0.8 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 18 },
  chevronContainer: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#fff' },
})
