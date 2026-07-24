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
} from 'react-native'
import { router } from 'expo-router'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { primary, secondary, secondary2, secondary3 } from '@/style/variables'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { login, resendCode } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = email.includes('@') && password.length > 0 && !isSubmitting

  const handleLogin = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setError('')

    const result = await login(email.trim(), password)
    setIsSubmitting(false)

    if (!result.success) {
      // Compte non activé : on renvoie un code et on amène l'utilisateur
      // directement sur l'écran de vérification.
      if (result.status === 403) {
        const resend = await resendCode(email.trim())
        router.push({
          pathname: '/verify',
          params: { email: email.trim(), devCode: resend.devCode as string },
        })
        return
      }
      setError(result.error ?? 'Une erreur est survenue')
    }
    // Si succès : la garde du layout racine bascule vers les onglets.
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="book-open-variant" size={44} color={primary} />
          </View>

          <Text style={styles.title}>Assalamou aleykoum</Text>
          <Text style={styles.subtitle}>Connectez-vous pour écouter le Coran</Text>

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
              placeholder="Mot de passe"
              placeholderTextColor={secondary2}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={secondary} />
            </Pressable>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={styles.forgotLink}
            onPress={() => router.push('/forgot')}
          >
            <Text style={styles.linkText}>Mot de passe oublié ?</Text>
          </Pressable>

          <Pressable
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Pas encore de compte ?</Text>
            <Pressable onPress={() => router.push('/register')}>
              <Text style={styles.linkTextBold}> Créer un compte</Text>
            </Pressable>
          </View>
        </View>
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
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: secondary,
    textAlign: 'center',
    marginBottom: 28,
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
    marginBottom: 4,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  linkText: {
    color: secondary,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  linkTextBold: {
    color: primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: primary,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
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
})
