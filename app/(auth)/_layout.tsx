import { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'

export default function AuthLayout() {
  // Le splash est retenu par preventAutoHideAsync (layout des onglets) ;
  // quand on arrive ici sans être connecté, il faut le libérer.
  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="forgot" />
      <Stack.Screen name="reset" />
    </Stack>
  )
}
