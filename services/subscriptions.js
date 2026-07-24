import { authenticatedRequest } from './auth'

// ============================================================
// Client des abonnements premium (mobile money via passerelle DexPay).
//
// Flux d'achat :
//   1. checkout(plan, provider, phone) crée un abonnement "pending" et
//      initie le paiement — le backend renvoie une référence + une URL
//      de paiement éventuelle.
//   2. L'utilisateur valide le paiement sur son mobile money.
//   3. Le backend reçoit le webhook du fournisseur et active le premium.
//   4. Le mobile interroge getMySubscription() (polling) jusqu'à ce que
//      l'abonnement passe "active", puis rafraîchit le profil.
// ============================================================

export async function fetchPlans() {
  return authenticatedRequest('/subscriptions/plans', { method: 'GET' })
}

export async function checkout(plan, provider, phone) {
  return authenticatedRequest('/subscriptions/checkout', {
    method: 'POST',
    body: { plan, provider, phone },
  })
}

export async function fetchMySubscription() {
  return authenticatedRequest('/subscriptions/me', { method: 'GET' })
}
