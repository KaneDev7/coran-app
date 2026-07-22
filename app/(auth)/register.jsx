import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { primary, secondary, secondary2, secondary3 } from '@/style/variables'
import { useAuth } from '@/context/AuthContext'

export default function Register() {
  const { register } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit =
    fullName.trim().length >= 2 &&
    email.includes('@') &&
    password.length >= 8 &&
    confirmPassword.length >= 8 &&
    !isSubmitting

  const handleRegister = async () => {
    if (!canSubmit) return
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await register(fullName.trim(), email.trim(), password)
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    // Compte créé : vérification de l'email pour activer.
    router.push({
      pathname: '/verify',
      params: { email: email.trim(), devCode: result.devCode },
    })
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="account-plus-outline" size={40} color={primary} />
          </View>

          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Un code de vérification vous sera envoyé par email
          </Text>

          <View style={styles.inputRow}>
            <Feather name="user" size={18} color={secondary} />
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={v => {
                setFullName(v)
                setError('')
              }}
              placeholder="Nom complet"
              placeholderTextColor={secondary2}
              autoComplete="name"
            />
          </View>

          <View style={styles.inputRow}>
            <Feather name="mail" size={18} color={secondary} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={v => {
                setEmail(v)
                setError('')
              }}
              placeholder="Adresse email"
              placeholderTextColor={secondary2}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputRow}>
            <Feather name="lock" size={18} color={secondary} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={v => {
                setPassword(v)
                setError('')
              }}
              placeholder="Mot de passe (8 caractères min.)"
              placeholderTextColor={secondary2}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={secondary} />
            </Pressable>
          </View>

          <View style={styles.inputRow}>
            <Feather name="lock" size={18} color={secondary} />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={v => {
                setConfirmPassword(v)
                setError('')
              }}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor={secondary2}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Déjà un compte ?</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.linkTextBold}> Se connecter</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: secondary3,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: secondary2,
    paddingHorizontal: 14,
    height: 54,
    gap: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: primary,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    backgroundColor: primary,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  footerText: {
    color: secondary,
    fontSize: 14,
  },
  linkTextBold: {
    color: primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
})
