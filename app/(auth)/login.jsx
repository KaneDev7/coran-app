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
} from 'react-native'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { primary, secondary, secondary2, secondary3 } from '@/style/variables'
import { useAuth } from '@/context/AuthContext'
import { isValidSenegalPhone, formatSenegalPhone } from '@/services/auth'

export default function Login() {
  const { requestCode } = useAuth()

  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)

  const digits = phone.replace(/\D/g, '')
  const isValid = isValidSenegalPhone(digits)

  const handleChangePhone = value => {
    setError('')
    setPhone(formatSenegalPhone(value))
  }

  const handleSendCode = async () => {
    if (!isValid || isSending) return
    setIsSending(true)
    setError('')

    const result = await requestCode(digits)
    setIsSending(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    router.push({
      pathname: '/verify',
      params: { phone: digits, mockCode: result.mockCode },
    })
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="book-open-variant" size={44} color={primary} />
        </View>

        <Text style={styles.title}>Assalamou aleykoum</Text>
        <Text style={styles.subtitle}>
          Connectez-vous avec votre numéro de téléphone pour écouter le Coran
        </Text>

        <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
          <View style={styles.prefixChip}>
            <Text style={styles.prefixFlag}>🇸🇳</Text>
            <Text style={styles.prefixText}>+221</Text>
          </View>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={handleChangePhone}
            placeholder="77 123 45 67"
            placeholderTextColor={secondary2}
            keyboardType="phone-pad"
            maxLength={12}
            autoFocus
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={[styles.button, (!isValid || isSending) && styles.buttonDisabled]}
          onPress={handleSendCode}
          disabled={!isValid || isSending}
        >
          {isSending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Recevoir le code</Text>
          )}
        </Pressable>

        <Text style={styles.hint}>
          Un code de vérification vous sera envoyé par SMS
        </Text>
      </View>
    </KeyboardAvoidingView>
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
    lineHeight: 20,
    marginBottom: 32,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: secondary2,
    paddingHorizontal: 12,
    height: 58,
    gap: 10,
  },
  inputRowError: {
    borderColor: '#dc3545',
  },
  prefixChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: secondary2,
  },
  prefixFlag: {
    fontSize: 18,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: primary,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: primary,
    letterSpacing: 1,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: primary,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 12,
    color: secondary,
    textAlign: 'center',
    marginTop: 16,
  },
})
