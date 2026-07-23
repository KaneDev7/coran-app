import { Stack } from 'expo-router'
import { AuthProvider, useAuth } from '@/context/AuthContext'

// Aiguillage : connecté -> accueil (choix du mode) + onglets + professeur,
// sinon -> écrans d'authentification.
function RootNavigator() {
  const { user, isAuthLoading } = useAuth()

  // Le splash screen reste affiché tant que la session n'est pas lue.
  if (isAuthLoading) return null

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!user}>
        {/* Accueil (hors onglets) : landing à "/" */}
        <Stack.Screen name="index" />
        {/* Révision libre (app actuelle) */}
        <Stack.Screen name="(tabs)" />
        {/* Mode Professeur */}
        <Stack.Screen name="(teacher)" />
        {/* Paramètres (hors onglets, même niveau que l'accueil) */}
        <Stack.Screen name="settings" />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  )
}
