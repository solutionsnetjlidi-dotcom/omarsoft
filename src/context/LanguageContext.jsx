import { createContext, useContext, useEffect, useState } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext(null)

const SUPPORTED_LANGS = ['fr', 'ar', 'en']
const DEFAULT_LANG    = 'fr'
const STORAGE_KEY     = 'omarsoft_lang'

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return SUPPORTED_LANGS.includes(saved) ? saved : DEFAULT_LANG
  })

  // Applique la direction et la langue HTML au changement
  useEffect(() => {
    const isRTL = lang === 'ar'
    document.documentElement.dir  = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
    document.body.style.fontFamily = isRTL
      ? '"Noto Kufi Arabic", "Noto Sans Arabic", sans-serif'
      : '"Inter", system-ui, sans-serif'
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  function setLang(newLang) {
    if (SUPPORTED_LANGS.includes(newLang)) {
      setLangState(newLang)
    }
  }

  /**
   * Retourne la traduction pour une clé "section.key"
   * Supporte la notation pointée : t('nav.home')
   */
  function t(key, vars = {}) {
    const keys   = key.split('.')
    let   result = translations[lang]
    for (const k of keys) {
      if (result == null) break
      result = result[k]
    }
    if (result == null) {
      // Fallback vers le français
      result = translations['fr']
      for (const k of keys) {
        if (result == null) break
        result = result[k]
      }
    }
    if (typeof result !== 'string') return key
    // Interpolation de variables : t('hello', { name: 'Omar' }) sur "Bonjour {{name}}"
    return result.replace(/\{\{(\w+)\}\}/g, (_, v) => vars[v] ?? `{{${v}}}`)
  }

  /**
   * Retourne le nom dans la bonne langue pour un objet multilangue.
   * Ex: getName({ name_fr: 'PC', name_ar: 'كمبيوتر', name_en: 'PC' })
   */
  function getName(obj) {
    if (!obj) return ''
    return obj[`name_${lang}`] || obj['name_fr'] || ''
  }

  function getDesc(obj) {
    if (!obj) return ''
    return obj[`description_${lang}`] || obj['description_fr'] || ''
  }

  const isRTL = lang === 'ar'

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, getName, getDesc, isRTL, SUPPORTED_LANGS }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>')
  return ctx
}
