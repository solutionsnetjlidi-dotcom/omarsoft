/**
 * currencyFormatter.js
 * ─────────────────────────────────────────────────────────
 * Règles d'affichage des prix selon la langue active :
 *
 *   FR → Double affichage TND + € : "2 800 TND (~840 €)"
 *   AR → Dinar uniquement          : "2 800 د.ت"
 *   EN → Dollar uniquement          : "$ 896"
 *
 * Taux de conversion par défaut (paramétrable via .env) :
 *   1 TND = EUR_RATE  (défaut : 0.30)
 *   1 TND = USD_RATE  (défaut : 0.32)
 */

const EUR_RATE = parseFloat(import.meta.env.VITE_EUR_RATE  || '0.30')
const USD_RATE = parseFloat(import.meta.env.VITE_USD_RATE  || '0.32')

/**
 * Formate un montant en TND selon la langue choisie.
 * @param {number} amountTND  - Montant en Dinars Tunisiens
 * @param {'fr'|'ar'|'en'} lang - Langue active
 * @param {number} [eurRate]  - Taux TND→EUR (override optionnel)
 * @param {number} [usdRate]  - Taux TND→USD (override optionnel)
 * @returns {string}
 */
export function formatPrice(amountTND, lang = 'fr', eurRate, usdRate) {
  if (amountTND == null || isNaN(amountTND)) return '—'

  const eur = amountTND * (eurRate ?? EUR_RATE)
  const usd = amountTND * (usdRate ?? USD_RATE)

  const tndFormatted = formatTND(amountTND)
  const eurFormatted = formatEUR(eur)
  const usdFormatted = formatUSD(usd)

  switch (lang) {
    case 'fr':
      return `${tndFormatted} (~${eurFormatted})`
    case 'ar':
      return `${formatTND_AR(amountTND)}`
    case 'en':
      return usdFormatted
    default:
      return tndFormatted
  }
}

/**
 * Affiche uniquement le montant TND (toutes langues).
 */
export function formatTND(amount) {
  if (amount == null || isNaN(amount)) return '—'
  return new Intl.NumberFormat('fr-TN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ' TND'
}

/**
 * Affiche le montant TND en script arabe.
 */
export function formatTND_AR(amount) {
  if (amount == null || isNaN(amount)) return '—'
  return new Intl.NumberFormat('ar-TN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ' د.ت'
}

/**
 * Affiche le montant en Euros.
 */
export function formatEUR(amount) {
  if (amount == null || isNaN(amount)) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Affiche le montant en Dollars US.
 */
export function formatUSD(amount) {
  if (amount == null || isNaN(amount)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Convertit un montant TND vers la devise affichée selon la langue.
 * Retourne { amount, symbol, label }.
 */
export function convertAmount(amountTND, lang = 'fr', eurRate, usdRate) {
  const eR = eurRate ?? EUR_RATE
  const uR = usdRate ?? USD_RATE
  switch (lang) {
    case 'ar':
      return { amount: amountTND, symbol: 'د.ت', label: 'TND' }
    case 'en':
      return { amount: amountTND * uR, symbol: '$', label: 'USD' }
    case 'fr':
    default:
      return { amount: amountTND, symbol: 'TND', label: 'TND' }
  }
}

/**
 * Calcule et formate la TVA.
 */
export function calcTax(subtotalTND, taxRate = 19) {
  const tax = subtotalTND * (taxRate / 100)
  return {
    tax,
    total: subtotalTND + tax,
  }
}

/**
 * Formate un montant pour affichage dans un document commercial
 * avec la devise sélectionnée.
 */
export function formatDocumentAmount(amountTND, currency = 'TND', eurRate, usdRate) {
  const eR = eurRate ?? EUR_RATE
  const uR = usdRate ?? USD_RATE
  switch (currency) {
    case 'EUR':
      return formatEUR(amountTND * eR)
    case 'USD':
      return formatUSD(amountTND * uR)
    case 'TND':
    default:
      return formatTND(amountTND)
  }
}
