// ============================================================
// Configuration centrale du modèle freemium.
//
// PRINCIPE : on ne verrouille jamais l'accès à la Parole (lecture,
// écoute de base). On monétise le CONFORT et la PÉDAGOGIE :
//   - le choix parmi tous les réciteurs,
//   - le téléchargement hors-ligne sans limite,
//   - les séances du Mode Professeur sans limite quotidienne,
//   - l'historique de progression complet (à venir).
//
// Ces valeurs sont volontairement regroupées ici pour être faciles à
// ajuster. À terme, elles seront pilotables côté serveur via une
// collection AppConfig (voir feuille de route) sans republier l'app.
// ============================================================

// Nombre de réciteurs accessibles gratuitement (les premiers de la liste).
export const FREE_RECITER_COUNT = 3

// Nombre de passages téléchargeables hors-ligne en compte gratuit.
export const FREE_DOWNLOAD_QUOTA = 5

// Nombre de séances (drills) du Mode Professeur par jour en gratuit.
export const FREE_DAILY_DRILLS = 3

// Nombre de jours d'historique de progression visibles en gratuit.
export const FREE_HISTORY_DAYS = 7

// Catalogue affiché dans le paywall. Doit rester aligné avec
// backend/src/subscriptions/plans.ts (source de vérité des prix).
export const PLANS = [
  {
    code: 'premium_yearly',
    label: 'Premium annuel',
    priceFcfa: 10000,
    period: 'an',
    highlight: '2 mois offerts',
    recommended: true,
  },
  {
    code: 'premium_monthly',
    label: 'Premium mensuel',
    priceFcfa: 1000,
    period: 'mois',
    highlight: null,
    recommended: false,
  },
]

// Fournisseurs mobile money proposés à l'utilisateur. La passerelle
// d'encaissement (DexPay) est branchée côté backend ; l'utilisateur, lui,
// choisit seulement le canal qu'il utilise.
export const PAYMENT_PROVIDERS = [
  { code: 'wave', label: 'Wave', color: '#1DC6F4' },
  { code: 'orange_money', label: 'Orange Money', color: '#FF6600' },
]

// Formatage FCFA lisible : 10000 -> "10 000 FCFA".
export function formatFcfa(amount) {
  return `${Number(amount).toLocaleString('fr-FR').replace(/ /g, ' ')} FCFA`
}
