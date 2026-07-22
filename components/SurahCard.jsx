import { View, Text, StyleSheet, Pressable } from 'react-native'
import { primary, secondary } from '@/style/variables'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

// Carte sourate présentationnelle, réutilisable (mode Professeur,
// et pourra remplacer le visuel de SourateItem).
export function SurahCard({ item, onPress, disabled }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.card}>
        <View style={styles.leftContent}>
          <View style={styles.numberCircle}>
            <Text style={styles.numberText}>{item.numero}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{item.nom}</Text>
            <Text style={styles.arabicTitle}>{item.nomArabe}</Text>
          </View>
        </View>

        <View style={styles.versetsContainer}>
          <MaterialCommunityIcons
            name="book-open-page-variant"
            size={20}
            color={secondary}
          />
          <Text style={styles.versetsText}>{item.versets} versets</Text>
        </View>
      </LinearGradient>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.6 },
  leftContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  numberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberText: { fontSize: 16, fontWeight: 'bold', color: primary },
  titleContainer: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', color: primary, marginBottom: 4 },
  arabicTitle: { fontSize: 20, color: secondary, textAlign: 'left' },
  versetsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  versetsText: {
    marginLeft: 6,
    fontSize: 14,
    color: secondary,
    fontWeight: '500',
  },
})
