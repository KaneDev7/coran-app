import { Stack } from 'expo-router'
import { TeacherProvider } from '@/context/TeacherContext'

// Flux "Mode Professeur" : son propre provider (auto-contenu) + un
// Stack. Accueil (teacher) → nouvelle séance (new: sourate+versets →
// options) ou séances enregistrées (saved) → session.
export default function TeacherLayout() {
  return (
    <TeacherProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="teacher">
        <Stack.Screen name="teacher" />
        <Stack.Screen name="new" />
        <Stack.Screen name="saved" />
        <Stack.Screen name="edit" />
        <Stack.Screen name="options" />
        <Stack.Screen name="session" />
      </Stack>
    </TeacherProvider>
  )
}
