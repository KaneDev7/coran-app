import { useRef, useState } from 'react'
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
import { router, useLocalSearchParams } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { primary, secondary, secondary2, secondary3 } from '@/style/variables'
import { useAuth } from '@/context/AuthContext'

const CODE_LENGTH = 6

export default function Verify() {
  const { email, devCode: initialDevCode } = useLocalSearchParams()
  const { confirmEmail, resendCode } = useAuth()

  const [code, setCode] = useState('')
  const [devCode, setDevCode] = useState(initialDevCode)
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const inputRef = useRef(null)

  const handleChangeCode = async value => {
    const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH)
    setCode(digits)
    setError('')

    // Vérification automatique dès que le code est complet.
    if (digits.length === CODE_LENGTH && !isVerifying) {
      setIsVerifying(true)
      const result = await confirmEmail(email, digits)
      setIsVerifying(false)

      if (!result.success) {
        setError(result.error)
        setCode('')
      }
      // Si succès : la garde du layout racine bascule vers les onglets.
    }
  }

  const handleResend = async () => {
    setError('')
    setCode('')
    const result = await resendCode(email)
    if (result.success) {
      if (result.devCode) setDevCode(result.devCode)
      setResendMessage('Nouveau code envoyé')
      setTimeout(() => setResendMessage(''), 3000)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="email-check-outline" size={40} color={primary} />
        </View>

        <Text style={styles.title}>Vérifiez votre email</Text>
        <Text style={styles.subtitle}>
          Entrez le code à 6 chiffres envoyé à{'\n'}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        {/* Un seul TextInput invisible pilote les 6 cases. */}
        <Pressable style={styles.codeRow} onPress={() => inputRef.current?.focus()}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.codeBox,
                i === code.length && styles.codeBoxActive,
                error ? styles.codeBoxError : null,
              ]}
            >
              <Text style={styles.codeDigit}>{code[i] || ''}</Text>
            </View>
          ))}
        </Pressable>
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={handleChangeCode}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          autoFocus
        />

        {isVerifying && <ActivityIndicator color={primary} style={styles.loader} />}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {resendMessage ? <Text style={styles.successText}>{resendMessage}</Text> : null}

        {/* MOCK : visible tant que le SMTP n'est pas configuré. */}
        {devCode ? (
          <View style={styles.mockBox}>
            <MaterialCommunityIcons name="flask-outline" size={16} color={secondary} />
            <Text style={styles.mockText}>Mode test — code : {devCode}</Text>
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.actionLink}>Retour</Text>
          </Pressable>
          <Pressable onPress={handleResend}>
            <Text style={styles.actionLink}>Renvoyer le code</Text>
          </Pressable>
        </View>
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
    width: 80,
    height: 80,
    borderRadius: 40,
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
    lineHeight: 22,
    marginBottom: 28,
  },
  emailText: {
    fontWeight: 'bold',
    color: primary,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  codeBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: secondary2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxActive: {
    borderColor: primary,
  },
  codeBoxError: {
    borderColor: '#dc3545',
  },
  codeDigit: {
    fontSize: 24,
    fontWeight: 'bold',
    color: primary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  loader: {
    marginTop: 16,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 13,
    marginTop: 14,
    textAlign: 'center',
  },
  successText: {
    color: '#28a745',
    fontSize: 13,
    marginTop: 14,
    textAlign: 'center',
  },
  mockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
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
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingHorizontal: 8,
  },
  actionLink: {
    color: primary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})
