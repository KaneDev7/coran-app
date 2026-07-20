import { Stack } from 'expo-router'
import { AuthProvider, useAuth } from '@/context/AuthContext'

// Aiguillage : connecté -> onglets de l'application,
// sinon -> écrans d'authentification.
function RootNavigator() {
  const { user, isAuthLoading } = useAuth()

  // Le splash screen reste affiché tant que la session n'est pas lue.
  if (isAuthLoading) return null

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" />
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
