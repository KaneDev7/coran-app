import { View, Text, Pressable, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { primary } from '@/style/variables'

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name']

interface ControlButtonProps {
  icon: IconName
  label: string
  onPress: () => void
  variant?: 'stop' | 'primary'
}

interface SessionControlsProps {
  paused: boolean
  onReplay: () => void
  onSkip: () => void
  onPauseResume: () => void
  onStop: () => void
}

// Contrôles manuels du drill (secours face aux limites du détecteur).
function ControlButton({ icon, label, onPress, variant }: ControlButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        variant === 'stop' && styles.btnStop,
        variant === 'primary' && styles.btnPrimary,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={variant === 'stop' || variant === 'primary' ? '#fff' : primary}
      />
      <Text
        style={[
          styles.label,
          (variant === 'stop' || variant === 'primary') && styles.labelLight,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

export function SessionControls({
  paused,
  onReplay,
  onSkip,
  onPauseResume,
  onStop,
}: SessionControlsProps) {
  return (
    <View style={styles.row}>
      <ControlButton icon="restart" label="Rejouer" onPress={onReplay} />
      <ControlButton
        icon={paused ? 'play' : 'pause'}
        label={paused ? 'Reprendre' : 'Pause'}
        onPress={onPauseResume}
        variant="primary"
      />
      <ControlButton icon="skip-next" label="Passer" onPress={onSkip} />
      <ControlButton icon="stop" label="Arrêter" onPress={onStop} variant="stop" />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 76,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  btnPrimary: { backgroundColor: primary },
  btnStop: { backgroundColor: '#dc3545' },
  pressed: { opacity: 0.85 },
  label: { fontSize: 12, fontWeight: '600', color: primary },
  labelLight: { color: '#fff' },
})
