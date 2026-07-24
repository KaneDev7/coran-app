import { Text, StyleSheet, ScrollView } from 'react-native'
import { useFonts } from 'expo-font'
import { primary, secondary2 } from '@/style/variables'

interface VerseDisplayProps {
  text?: string
  placeholder?: string
}

// Affiche le texte arabe d'un verset (police Amiri-Quran).
// Présentationnel : reçoit le texte en prop (réutilisable partout).
export function VerseDisplay({ text, placeholder = '—' }: VerseDisplayProps) {
  const [fontsLoaded] = useFonts({
    'Amiri-Quran': require('../../assets/fonts/Amiri-Quran.ttf'),
  })

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {text ? (
        <Text
          style={[
            styles.text,
            fontsLoaded && { fontFamily: 'Amiri-Quran' },
          ]}
        >
          {text}
        </Text>
      ) : (
        <Text style={styles.placeholder}>{placeholder}</Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch' },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  text: {
    fontSize: 28,
    lineHeight: 56,
    textAlign: 'center',
    color: primary,
  },
  placeholder: { fontSize: 14, textAlign: 'center', color: secondary2 },
})
