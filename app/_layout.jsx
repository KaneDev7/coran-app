import { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider, useAuth } from '@/context/AuthContext'

// Le splash reste affiché jusqu'à ce que la session soit lue. On le
// masque ICI (racine) et non dans les onglets : après connexion on
// atterrit sur l'accueil (hors onglets), qui n'aurait sinon jamais
// déclenché hideAsync → splash bloqué sur le logo.
SplashScreen.preventAutoHideAsync()

// Aiguillage : connecté -> accueil (choix du mode) + onglets + professeur,
// sinon -> écrans d'authentification.
function RootNavigator() {
  const { user, isAuthLoading } = useAuth()

  // Dès que la session est résolue (succès ou échec), on masque le splash.
  useEffect(() => {
    if (!isAuthLoading) SplashScreen.hideAsync().catch(() => {})
  }, [isAuthLoading])

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
