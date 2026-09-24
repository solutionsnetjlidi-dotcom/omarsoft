/**
 * config.js – Constantes réelles de l'entreprise et helpers de contact
 */

export const config = {
  whatsapp:  import.meta.env.VITE_COMPANY_WHATSAPP || '+21654421123',
  email:     import.meta.env.VITE_COMPANY_EMAIL    || 'solutionsnetjlidi@gmail.com',
  phone:     import.meta.env.VITE_COMPANY_PHONE    || '+216 54 421 123',
  anydeskId: import.meta.env.VITE_ANYDESK_ID       || 'XXXXXXXXX',
  company: {
    nameFr:  'STE Jlidi Network Solutions',
    nameAr:  'شركة جليدي للشبكات والحلول الرقمية',
    brand:   'OmarSoft',
    address: '4116 Djerba Midoun, Médenine, Tunisie',
    rc:      'C20215152024',
    mf:      '1877339 E/M',
    tva:     '19',
  },
}

export function openWhatsApp(message = '') {
  const number = config.whatsapp.replace(/\D/g, '')
  const url = message
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${number}`
  window.open(url, '_blank')
}

export function openEmail(subject = '', body = '') {
  const url = `mailto:${config.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = url
}

export function buildAnydeskMessage({ name, phone, anydeskId, description }) {
  return (
    `🖥️ Demande d'assistance à distance – OmarSoft\n` +
    `Nom : ${name}\nTéléphone : ${phone}\nID AnyDesk : ${anydeskId}\nProblème : ${description}`
  )
}

export function buildProductQuoteMessage({ productName, priceTND }) {
  return (
    `💻 Demande de devis – OmarSoft / Jlidi Network Solutions\n` +
    `Produit : ${productName}\nPrix affiché : ${priceTND} TND\n` +
    `Je souhaite avoir plus d'informations.`
  )
}

export function buildServiceMessage({ serviceName }) {
  return (
    `🔧 Demande de service – OmarSoft\n` +
    `Service : ${serviceName}\nJe souhaite obtenir plus d'informations et un rendez-vous.`
  )
}

export function generateDocNumber(type, existingCount = 0) {
  const prefixes = { quote: 'DEV', invoice: 'FAC', purchase_order: 'BC', delivery_note: 'BL' }
  const prefix = prefixes[type] || 'DOC'
  const year   = new Date().getFullYear()
  const seq    = String(existingCount + 1).padStart(4, '0')
  return `${prefix}-${year}-${seq}`
}
