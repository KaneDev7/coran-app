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

export default function ForgotPassword() {
  const { forgotPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = email.includes('@') && !isSubmitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setError('')

    const result = await forgotPassword(email.trim())
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error ?? 'Une erreur est survenue')
      return
    }

    router.push({
      pathname: '/reset',
      params: { email: email.trim(), devCode: result.devCode as string },
    })
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="lock-question" size={40} color={primary} />
          </View>

          <Text style={styles.title}>Mot de passe oublié</Text>
          <Text style={styles.subtitle}>
            Entrez votre email : nous vous enverrons un code de
            réinitialisation
          </Text>

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
              autoFocus
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Envoyer le code</Text>
            )}
          </Pressable>

          <Pressable style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.linkText}>Retour à la connexion</Text>
          </Pressable>
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
    lineHeight: 19,
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
    marginBottom: 14,
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
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backLink: {
    alignSelf: 'center',
    marginTop: 22,
  },
  linkText: {
    color: primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
})
