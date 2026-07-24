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
import { router, useLocalSearchParams } from 'expo-router'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { primary, secondary, secondary2, secondary3 } from '@/style/variables'
import { useAuth } from '@/context/AuthContext'

export default function ResetPassword() {
  const params = useLocalSearchParams()
  const email = String(params.email ?? '')
  const devCode = params.devCode
  const { resetPassword } = useAuth()

  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = code.length === 6 && newPassword.length >= 8 && !isSubmitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setError('')

    const result = await resetPassword(email, code, newPassword)
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error ?? 'Une erreur est survenue')
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <MaterialCommunityIcons name="check-circle-outline" size={64} color="#2e7d32" />
        <Text style={styles.successTitle}>Mot de passe réinitialisé</Text>
        <Text style={styles.subtitle}>
          Vous pouvez maintenant vous connecter avec votre nouveau mot de
          passe
        </Text>
        <Pressable style={styles.button} onPress={() => router.dismissAll()}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="lock-reset" size={40} color={primary} />
          </View>

          <Text style={styles.title}>Réinitialisation</Text>
          <Text style={styles.subtitle}>
            Entrez le code reçu sur{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <View style={styles.inputRow}>
            <Feather name="hash" size={18} color={secondary} />
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={v => {
                setCode(v.replace(/\D/g, '').slice(0, 6))
                setError('')
              }}
              placeholder="Code à 6 chiffres"
              placeholderTextColor={secondary2}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
          </View>

          <View style={styles.inputRow}>
            <Feather name="lock" size={18} color={secondary} />
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={v => {
                setNewPassword(v)
                setError('')
              }}
              placeholder="Nouveau mot de passe (8 min.)"
              placeholderTextColor={secondary2}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={secondary} />
            </Pressable>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* MOCK : visible tant que le SMTP n'est pas configuré. */}
          {devCode ? (
            <View style={styles.mockBox}>
              <MaterialCommunityIcons name="flask-outline" size={16} color={secondary} />
              <Text style={styles.mockText}>Mode test — code : {devCode}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Réinitialiser</Text>
            )}
          </Pressable>

          <Pressable style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.linkText}>Modifier l'email</Text>
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
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
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
    lineHeight: 20,
    marginBottom: 24,
  },
  emailText: {
    fontWeight: 'bold',
    color: primary,
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
  mockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: secondary2,
    borderStyle: 'dashed',
  },
  mockText: {
    fontSize: 13,
    color: secondary,
  },
  button: {
    backgroundColor: primary,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
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
