import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { primary, secondary, secondary3 } from '@/style/variables'
import { useAuth } from '@/context/AuthContext'
import { ModeCard } from '@/components/teacher/ModeCard'

// Page d'accueil (hors onglets) : choix entre les deux modes.
export default function Home() {
  const { user } = useAuth()
  const firstName = (user?.fullName || '').split(' ')[0]

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Assalamou aleykoum</Text>
          {firstName ? <Text style={styles.name}>{firstName}</Text> : null}
        </View>
        <Pressable
          style={styles.settingsBtn}
          onPress={() => router.push('/settings')}
          hitSlop={10}
        >
          <Feather name="settings" size={22} color={primary} />
        </Pressable>
      </View>

      <View style={styles.intro}>
        <Text style={styles.introTitle}>Comment souhaitez-vous étudier ?</Text>
        <Text style={styles.introSub}>Choisissez un mode pour commencer</Text>
      </View>

      <View style={styles.cards}>
        <ModeCard
          icon="headphones"
          title="Révision libre"
          subtitle="Écoutez et révisez les versets à votre rythme, hors ligne possible."
          colors={['#8C6A4C', '#4B2E2E']}
          onPress={() => router.push('/sourates')}
        />
        <ModeCard
          icon="school"
          title="Mode Professeur"
          subtitle="Le réciteur récite, vous répétez : détection vocale et répétitions guidées."
          colors={['#2e7d32', '#1b5e20']}
          onPress={() => router.push('/teacher')}
        />
        <ModeCard
          icon="brain"
          title="Apprendre avec l'IA"
          subtitle="Vous récitez, l'IA écoute et détecte les erreurs de prononciation."
          colors={['#321e8a', '#2d1e64']}
          badge="À venir"
          disabled
        />
      </View>

      <Text style={styles.footer}>Qu'Allah facilite votre apprentissage</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: secondary3, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  greeting: { fontSize: 14, color: secondary },
  name: { fontSize: 22, fontWeight: 'bold', color: primary },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  intro: { marginTop: 32, marginBottom: 20 },
  introTitle: { fontSize: 20, fontWeight: 'bold', color: primary },
  introSub: { fontSize: 14, color: secondary, marginTop: 4 },
  cards: { gap: 16 },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    color: secondary,
    fontSize: 13,
    marginBottom: 8,
  },
})
