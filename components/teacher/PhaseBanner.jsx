import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

// Bannière d'état du drill : indique clairement à l'utilisateur ce
// qui se passe (écoute du réciteur / à lui de répéter / on l'écoute).
const CONFIG = {
  reciter: {
    label: 'Écoutez le réciteur',
    icon: 'account-voice',
    bg: '#4B2E2E',
  },
  prompt: {
    label: 'À vous de répéter…',
    icon: 'timer-sand',
    bg: '#8C6A4C',
  },
  listening: {
    label: 'Répétez maintenant',
    icon: 'microphone',
    bg: '#8C6A4C',
  },
  repeating: {
    label: 'Je vous écoute…',
    icon: 'waveform',
    bg: '#2e7d32',
  },
  paused: {
    label: 'En pause',
    icon: 'pause-circle',
    bg: '#9e9e9e',
  },
  idle: {
    label: 'Prêt',
    icon: 'play-circle',
    bg: '#4B2E2E',
  },
}

export function PhaseBanner({ phase }) {
  const c = CONFIG[phase] ?? CONFIG.idle
  const showSpinner = phase === 'reciter' || phase === 'prompt'

  return (
    <View style={[styles.banner, { backgroundColor: c.bg }]}>
      {showSpinner ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <MaterialCommunityIcons name={c.icon} size={20} color="#fff" />
      )}
      <Text style={styles.label}>{c.label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    alignSelf: 'center',
  },
  label: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
