import { useEffect, useRef, useState, type ComponentProps } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import { primary, secondary, secondary2, secondary3 } from '@/style/variables'
import { useAuth } from '@/context/AuthContext'
import {
  PLANS,
  PAYMENT_PROVIDERS,
  formatFcfa,
  FREE_RECITER_COUNT,
} from '@/constants/premium'
import { checkout, fetchMySubscription } from '@/services/subscriptions'

// Détails de paiement renvoyés par le backend (checkout).
interface PaymentInfo {
  paymentUrl?: string
  reference?: string
}

interface Benefit {
  icon: ComponentProps<typeof MaterialCommunityIcons>['name']
  text: string
}

// Avantages listés dans l'offre.
const BENEFITS: Benefit[] = [
  { icon: 'account-music', text: 'Tous les réciteurs (au lieu de ' + FREE_RECITER_COUNT + ')' },
  { icon: 'download', text: 'Téléchargements hors-ligne illimités' },
  { icon: 'school', text: 'Mode Professeur sans limite quotidienne' },
  { icon: 'chart-line', text: 'Historique de progression complet' },
]

const PHONE_REGEX = /^7[05678]\d{7}$/

export default function Premium() {
  const { user, isPremium, refreshUser } = useAuth()

  const [planCode, setPlanCode] = useState(PLANS[0].code)
  const [providerCode, setProviderCode] = useState(PAYMENT_PROVIDERS[0].code)
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('idle') // idle | initiating | pending | active | error
  const [message, setMessage] = useState('')
  const [payment, setPayment] = useState<PaymentInfo | null>(null)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = null
  }

  // Nettoyage du polling au démontage.
  useEffect(() => () => stopPolling(), [])

  const selectedPlan = PLANS.find(p => p.code === planCode)

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'))

  const startPayment = async () => {
    if (!PHONE_REGEX.test(phone)) {
      setStatus('error')
      setMessage('Entrez un numéro mobile sénégalais valide (ex. 77 123 45 67).')
      return
    }
    setStatus('initiating')
    setMessage('')

    const result = await checkout(planCode, providerCode, phone)
    if (!result.success) {
      setStatus('error')
      setMessage(result.error || "Impossible d'initier le paiement.")
      return
    }

    const paymentInfo = result.payment as PaymentInfo | undefined
    setPayment(paymentInfo ?? null)
    setStatus('pending')
    setMessage(
      'Validez le paiement sur votre téléphone, puis appuyez sur « J’ai payé ».',
    )
    // Ouvre le lien de paiement du fournisseur si présent.
    if (paymentInfo?.paymentUrl) {
      Linking.openURL(paymentInfo.paymentUrl).catch(() => {})
    }
    startPolling()
  }

  // Interroge le backend toutes les 4 s : dès que l'abonnement est actif,
  // on rafraîchit le profil et on affiche le succès.
  const startPolling = () => {
    stopPolling()
    pollRef.current = setInterval(checkStatus, 4000)
  }

  const checkStatus = async () => {
    const sub = await fetchMySubscription()
    if (sub?.success && (sub as unknown as { status?: string }).status === 'active') {
      stopPolling()
      await refreshUser()
      setStatus('active')
      setMessage('')
    }
  }

  // ---- Écran : déjà premium ----
  if (isPremium && status !== 'active') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header onBack={goBack} />
        <View style={styles.centered}>
          <View style={styles.crownCircle}>
            <MaterialCommunityIcons name="crown" size={40} color="#b8860b" />
          </View>
          <Text style={styles.successTitle}>Vous êtes Premium</Text>
          <Text style={styles.successSub}>
            {user?.premiumUntil
              ? `Votre accès est valable jusqu'au ${new Date(
                  user.premiumUntil,
                ).toLocaleDateString('fr-FR')}.`
              : 'Votre accès premium est actif.'}
          </Text>
          <Pressable style={styles.primaryBtn} onPress={goBack}>
            <Text style={styles.primaryBtnText}>Continuer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  // ---- Écran : paiement réussi ----
  if (status === 'active') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header onBack={goBack} />
        <View style={styles.centered}>
          <View style={[styles.crownCircle, { backgroundColor: '#e8f5e9' }]}>
            <MaterialCommunityIcons name="check-decagram" size={44} color="#2e7d32" />
          </View>
          <Text style={styles.successTitle}>Paiement confirmé</Text>
          <Text style={styles.successSub}>
            Votre compte est désormais Premium. Merci de soutenir l’application 🤲
          </Text>
          <Pressable style={styles.primaryBtn} onPress={goBack}>
            <Text style={styles.primaryBtnText}>Commencer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const isBusy = status === 'initiating'

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header onBack={goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Bandeau */}
        <View style={styles.hero}>
          <View style={styles.crownCircle}>
            <MaterialCommunityIcons name="crown" size={34} color="#b8860b" />
          </View>
          <Text style={styles.heroTitle}>Passez à Premium</Text>
          <Text style={styles.heroSub}>
            Débloquez tout le confort d’apprentissage. La lecture et l’écoute de
            base restent toujours gratuites.
          </Text>
        </View>

        {/* Avantages */}
        <View style={styles.benefits}>
          {BENEFITS.map(b => (
            <View key={b.text} style={styles.benefitRow}>
              <MaterialCommunityIcons name={b.icon} size={20} color={primary} />
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>

        {/* Choix du plan */}
        <Text style={styles.sectionLabel}>Choisissez une formule</Text>
        <View style={styles.plans}>
          {PLANS.map(plan => {
            const active = plan.code === planCode
            return (
              <Pressable
                key={plan.code}
                style={[styles.planCard, active && styles.planCardActive]}
                onPress={() => setPlanCode(plan.code)}
                disabled={status === 'pending'}
              >
                {plan.recommended && (
                  <View style={styles.recoBadge}>
                    <Text style={styles.recoBadgeText}>Recommandé</Text>
                  </View>
                )}
                <View style={styles.radioOuter}>
                  {active && <View style={styles.radioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planLabel}>{plan.label}</Text>
                  {plan.highlight && (
                    <Text style={styles.planHighlight}>{plan.highlight}</Text>
                  )}
                </View>
                <View style={styles.planPriceBox}>
                  <Text style={styles.planPrice}>{formatFcfa(plan.priceFcfa)}</Text>
                  <Text style={styles.planPeriod}>/ {plan.period}</Text>
                </View>
              </Pressable>
            )
          })}
        </View>

        {/* Choix du canal mobile money */}
        <Text style={styles.sectionLabel}>Payer avec</Text>
        <View style={styles.providers}>
          {PAYMENT_PROVIDERS.map(p => {
            const active = p.code === providerCode
            return (
              <Pressable
                key={p.code}
                style={[styles.providerCard, active && styles.providerCardActive]}
                onPress={() => setProviderCode(p.code)}
                disabled={status === 'pending'}
              >
                <View style={[styles.providerDot, { backgroundColor: p.color }]} />
                <Text style={styles.providerLabel}>{p.label}</Text>
                {active && (
                  <Feather name="check" size={16} color={primary} style={{ marginLeft: 'auto' }} />
                )}
              </Pressable>
            )
          })}
        </View>

        {/* Numéro */}
        <Text style={styles.sectionLabel}>Numéro à débiter</Text>
        <TextInput
          style={styles.phoneInput}
          placeholder="Ex. 771234567"
          placeholderTextColor={secondary2}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={t => setPhone(t.replace(/[^0-9]/g, ''))}
          maxLength={9}
          editable={status !== 'pending'}
        />

        {/* Message d'état / instructions */}
        {message ? (
          <View
            style={[
              styles.notice,
              status === 'error' ? styles.noticeError : styles.noticeInfo,
            ]}
          >
            <MaterialCommunityIcons
              name={status === 'error' ? 'alert-circle-outline' : 'information-outline'}
              size={18}
              color={status === 'error' ? '#c0392b' : primary}
            />
            <Text
              style={[
                styles.noticeText,
                status === 'error' && { color: '#c0392b' },
              ]}
            >
              {message}
            </Text>
          </View>
        ) : null}

        {/* Référence de paiement (phase en attente) */}
        {payment?.reference && status === 'pending' ? (
          <Text style={styles.reference}>Référence : {payment.reference}</Text>
        ) : null}

        {/* Action principale */}
        {status === 'pending' ? (
          <Pressable style={styles.primaryBtn} onPress={checkStatus}>
            <MaterialCommunityIcons name="refresh" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>J’ai payé · Vérifier</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.primaryBtn, isBusy && styles.primaryBtnDisabled]}
            onPress={startPayment}
            disabled={isBusy}
          >
            {isBusy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="crown-outline" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>
                  Payer {formatFcfa(selectedPlan?.priceFcfa ?? 0)}
                </Text>
              </>
            )}
          </Pressable>
        )}

        <Text style={styles.legal}>
          Paiement sécurisé par mobile money. Aucun renouvellement automatique :
          votre accès reste actif jusqu’à l’échéance, puis vous choisissez de
          renouveler.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
        <Feather name="arrow-left" size={22} color={primary} />
      </Pressable>
      <Text style={styles.headerTitle}>Premium</Text>
      <View style={{ width: 40 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: secondary3 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: primary },
  content: { padding: 16, paddingBottom: 48 },

  hero: { alignItems: 'center', marginBottom: 20 },
  crownCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff8e7',
    borderWidth: 1,
    borderColor: '#f0e2bb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: { fontSize: 22, fontWeight: 'bold', color: primary, marginBottom: 6 },
  heroSub: {
    fontSize: 14,
    color: secondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  benefits: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 22,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitText: { flex: 1, fontSize: 14, color: primary },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  plans: { gap: 10, marginBottom: 22 },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#eee5db',
    padding: 16,
  },
  planCardActive: { borderColor: primary, backgroundColor: '#fff' },
  recoBadge: {
    position: 'absolute',
    top: -9,
    right: 14,
    backgroundColor: '#b8860b',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  recoBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: primary,
  },
  planLabel: { fontSize: 15, fontWeight: '600', color: primary },
  planHighlight: { fontSize: 12, color: '#2e7d32', marginTop: 2, fontWeight: '600' },
  planPriceBox: { alignItems: 'flex-end' },
  planPrice: { fontSize: 15, fontWeight: 'bold', color: primary },
  planPeriod: { fontSize: 11, color: secondary },

  providers: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  providerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#eee5db',
    padding: 14,
  },
  providerCardActive: { borderColor: primary },
  providerDot: { width: 12, height: 12, borderRadius: 6 },
  providerLabel: { fontSize: 14, fontWeight: '600', color: primary },

  phoneInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#eee5db',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: primary,
    marginBottom: 18,
  },

  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  noticeInfo: { backgroundColor: '#f3ede4' },
  noticeError: { backgroundColor: '#fdecea' },
  noticeText: { flex: 1, fontSize: 13, color: primary, lineHeight: 18 },
  reference: {
    fontSize: 12,
    color: secondary,
    marginBottom: 14,
    textAlign: 'center',
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  legal: {
    fontSize: 11,
    color: secondary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 16,
    paddingHorizontal: 8,
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: primary,
    marginTop: 8,
  },
  successSub: {
    fontSize: 14,
    color: secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
})
