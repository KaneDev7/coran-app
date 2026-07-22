import { Stack } from 'expo-router'
import { TeacherProvider } from '@/context/TeacherContext'

// Flux "Mode Professeur" : son propre provider (auto-contenu) + un
// Stack pour l'assistant (sourate → passage → options → session).
export default function TeacherLayout() {
  return (
    <TeacherProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="teacher">
        <Stack.Screen name="teacher" />
        <Stack.Screen name="passage" />
        <Stack.Screen name="options" />
        <Stack.Screen name="session" />
      </Stack>
    </TeacherProvider>
  )
}
