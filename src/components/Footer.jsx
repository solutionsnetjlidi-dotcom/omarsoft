import { useState } from 'react'
import { Monitor, Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2 } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { supabase } from '../lib/supabaseClient'
import { openWhatsApp, config } from '../utils/config'

const QUICK_LINKS = ['products', 'services', 'training', 'media']

function ContactForm({ t }) {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', message: '' })
  const [saving,  setSaving]  = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState(null)

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.message) return
    setSaving(true)
    setError(null)
    try {
      await supabase.from('service_requests').insert({
        request_type: 'contact',
        client_name:  form.name,
        client_email: form.email,
        client_phone: form.phone,
        message:      form.message,
      })
      setSent(true)
    } catch (err) {
      setError(t('contact.error'))
    } finally {
      setSaving(false)
    }
  }

  if (sent) {
    return (
      <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-5 py-4">
        <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
        <p className="text-emerald-300 font-medium text-sm">{t('contact.sent')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder={t('contact.namePlaceholder') + ' *'}
          className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/40 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-ocean"
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder={t('contact.emailPlaceholder')}
          className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/40 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-ocean"
        />
      </div>
      <input
        value={form.phone}
        onChange={(e) => set('phone', e.target.value)}
        placeholder={t('contact.phonePlaceholder')}
        className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/40 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-ocean"
      />
      <textarea
        required
        rows={3}
        value={form.message}
        onChange={(e) => set('message', e.target.value)}
        placeholder={t('contact.messagePlaceholder') + ' *'}
        className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/40 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-ocean resize-none"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-ocean hover:bg-ocean-dark text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60"
      >
        <Send size={15} />
        {saving ? t('contact.sending') : t('contact.send')}
      </button>
    </form>
  )
}

export default function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  function scrollTo(id) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <footer id="contact" className="bg-midnight text-white">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand + About */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-ocean flex items-center justify-center flex-shrink-0">
                <Monitor size={20} className="text-white" />
              </div>
              <div>
                <div className="font-extrabold text-lg leading-none">
                  <span className="text-white">OMAR</span>
                  <span className="text-ocean">SOFT</span>
                </div>
                <div className="text-white/40 text-[9px] tracking-widest mt-0.5">JLIDI NETWORK SOLUTIONS</div>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => openWhatsApp()}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
              >
                <MessageCircle size={13} />
                WhatsApp
              </button>
              <a
                href={`mailto:${config.email}`}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white/80 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <Mail size={13} />
                Email
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{t('footer.services')}</h4>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link}>
                  <button
                    onClick={() => scrollTo(link)}
                    className="text-white/50 hover:text-ocean text-sm transition-colors"
                  >
                    {t(`nav.${link}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{t('contact.title')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/60">
                <MapPin size={14} className="text-ocean mt-0.5 flex-shrink-0" />
                {config.company.address}
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Phone size={14} className="text-ocean flex-shrink-0" />
                <a href={`tel:${config.phone}`} className="hover:text-white transition-colors">
                  {config.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Mail size={14} className="text-ocean flex-shrink-0" />
                <a href={`mailto:${config.email}`} className="hover:text-white transition-colors">
                  {config.email}
                </a>
              </li>
            </ul>

            {/* Legal */}
            <div className="mt-5 pt-4 border-t border-white/10 space-y-1">
              <p className="text-white/30 text-xs">
                <span className="text-white/50 font-medium">{t('footer.rc')} :</span> {config.company.rc}
              </p>
              <p className="text-white/30 text-xs">
                <span className="text-white/50 font-medium">{t('footer.mf')} :</span> {config.company.mf}
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{t('contact.sendMessage')}</h4>
            <ContactForm t={t} />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/30 text-xs">
            {t('footer.rights', { year })}
          </p>
          <p className="text-white/30 text-xs">{t('footer.madeIn')}</p>
        </div>
      </div>
    </footer>
  )
}
