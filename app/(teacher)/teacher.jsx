import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { primary, secondary, secondary2, secondary3 } from '@/style/variables'
import { useAuth } from '@/context/AuthContext'
import { getSavedSessions } from '@/services/teacherStorage'

// Accueil du mode Professeur : deux choix — démarrer une nouvelle
// séance (configuration) ou reprendre une séance enregistrée.
export default function TeacherHome() {
  const { user } = useAuth()
  const [savedCount, setSavedCount] = useState(0)

  useFocusEffect(
    useCallback(() => {
      getSavedSessions(user?.id).then(list => setSavedCount(list.length))
    }, [user?.id]),
  )

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* En-tête */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/')} hitSlop={10} style={styles.iconBtn}>
          <MaterialCommunityIcons name="home-variant-outline" size={22} color={primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Mode Professeur</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.intro}>
        <Text style={styles.introTitle}>Que souhaitez-vous faire ?</Text>
        <Text style={styles.introSub}>
          Démarrez un nouveau drill ou reprenez un passage enregistré
        </Text>
      </View>

      <View style={styles.cards}>
        {/* Nouvelle séance */}
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push('/new')}
        >
          <View style={[styles.cardIcon, { backgroundColor: '#2e7d32' }]}>
            <MaterialCommunityIcons name="plus-circle-outline" size={30} color="#fff" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Nouvelle séance</Text>
            <Text style={styles.cardSub}>
              Choisissez une sourate, les versets et les réglages, puis lancez
              le drill guidé.
            </Text>
          </View>
          <Feather name="chevron-right" size={22} color={secondary} />
        </Pressable>

        {/* Séances enregistrées */}
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push('/saved')}
        >
          <View style={[styles.cardIcon, { backgroundColor: primary }]}>
            <MaterialCommunityIcons name="bookmark-multiple-outline" size={28} color="#fff" />
            {savedCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{savedCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Séances enregistrées</Text>
            <Text style={styles.cardSub}>
              {savedCount > 0
                ? `Reprenez l'un de vos ${savedCount} passage${savedCount > 1 ? 's' : ''} sauvegardé${savedCount > 1 ? 's' : ''}.`
                : 'Aucune séance enregistrée pour le moment.'}
            </Text>
          </View>
          <Feather name="chevron-right" size={22} color={secondary} />
        </Pressable>
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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: primary },
  intro: { marginTop: 28, marginBottom: 20 },
  introTitle: { fontSize: 20, fontWeight: 'bold', color: primary },
  introSub: { fontSize: 14, color: secondary, marginTop: 4 },
  cards: { gap: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  cardIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: '#dc3545',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: primary, marginBottom: 3 },
  cardSub: { fontSize: 13, color: secondary, lineHeight: 18 },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    color: secondary,
    fontSize: 13,
    marginBottom: 8,
  },
})
