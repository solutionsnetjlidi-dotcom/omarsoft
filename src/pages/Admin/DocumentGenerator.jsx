import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Printer, Save, CheckCircle2, AlertCircle, FileText, Eye, X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useLang } from '../../context/LanguageContext'
import { formatDocumentAmount, calcTax } from '../../utils/currencyFormatter'
import { generateDocNumber, config } from '../../utils/config'
import AdminLayout from '../../components/AdminLayout'
import PrintDocument from '../../components/PrintDocument'

const DOC_TYPES   = ['quote', 'invoice', 'purchase_order', 'delivery_note']
const CURRENCIES  = ['TND', 'EUR', 'USD']
const LANGUAGES   = ['fr', 'ar', 'en']
const TAX_RATES   = [0, 7, 13, 19]

const EMPTY_ITEM  = { description: '', quantity: 1, unit_price_tnd: '', total_tnd: '' }

const EMPTY_DOC = {
  document_type:   'invoice',
  document_number: '',
  issued_date:     new Date().toISOString().slice(0, 10),
  due_date:        '',
  client_name:     '',
  client_address:  '',
  client_email:    '',
  client_phone:    '',
  client_tax_id:   '',
  items:           [{ ...EMPTY_ITEM }],
  tax_rate:        19,
  display_currency: 'TND',
  exchange_rate_eur: parseFloat(import.meta.env.VITE_EUR_RATE || '0.30'),
  exchange_rate_usd: parseFloat(import.meta.env.VITE_USD_RATE || '0.32'),
  language:        'fr',
  notes:           '',
  payment_terms:   'Paiement à 30 jours',
  status:          'draft',
}

function LineItemRow({ item, index, onChange, onRemove, currency, eurRate, usdRate, t }) {
  function set(field, value) {
    const next = { ...item, [field]: value }
    if (field === 'quantity' || field === 'unit_price_tnd') {
      const qty   = parseFloat(next.quantity)   || 0
      const price = parseFloat(next.unit_price_tnd) || 0
      next.total_tnd = (qty * price).toFixed(3)
    }
    onChange(index, next)
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ocean/40 focus:border-ocean'

  return (
    <tr className="group">
      <td className="px-3 py-2 text-center text-slate-400 text-sm w-8">{index + 1}</td>
      <td className="px-2 py-2">
        <input
          value={item.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder={t('admin.documents.description')}
          className={inputCls}
        />
      </td>
      <td className="px-2 py-2 w-20">
        <input
          type="number" min="1" step="1"
          value={item.quantity}
          onChange={(e) => set('quantity', e.target.value)}
          className={`${inputCls} text-center`}
        />
      </td>
      <td className="px-2 py-2 w-32">
        <input
          type="number" min="0" step="0.001"
          value={item.unit_price_tnd}
          onChange={(e) => set('unit_price_tnd', e.target.value)}
          placeholder="0.000"
          className={`${inputCls} text-right`}
        />
      </td>
      <td className="px-3 py-2 w-32 text-right font-semibold text-slate-800 text-sm">
        {formatDocumentAmount(parseFloat(item.total_tnd) || 0, currency, eurRate, usdRate)}
      </td>
      <td className="px-2 py-2 w-10">
        <button
          onClick={() => onRemove(index)}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all"
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  )
}

function PreviewModal({ doc, onClose }) {
  const printRef = useRef()

  function handlePrint() {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank', 'width=900,height=700')
    win.document.write(`
      <!DOCTYPE html>
      <html lang="${doc.language}" dir="${doc.language === 'ar' ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <title>${doc.document_number} – OMARSOFT</title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { background:#fff; font-family: ${doc.language === 'ar' ? '"Noto Kufi Arabic",Arial' : '"Inter",Arial'},sans-serif; }
          @page { size: A4 portrait; margin: 10mm 12mm; }
          @media print { button { display:none!important; } }
        </style>
      </head>
      <body>
        ${content}
        <div style="text-align:center;margin-top:20px;padding-bottom:16px;">
          <button onclick="window.print()" style="background:#00b4d8;color:#fff;border:none;padding:10px 28px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">
            🖨️ Imprimer / Exporter PDF
          </button>
        </div>
      </body>
      </html>
    `)
    win.document.close()
    win.focus()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-slate-900 px-6 py-3 flex-shrink-0">
        <div className="flex items-center gap-3 text-white">
          <FileText size={18} className="text-ocean" />
          <span className="font-bold">{doc.document_number}</span>
          <span className="text-white/40 text-sm">Aperçu avant impression</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-ocean hover:bg-ocean-dark text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <Printer size={15} />Imprimer / PDF
          </button>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Document preview (scrollable) */}
      <div className="flex-1 overflow-y-auto bg-slate-200 flex items-start justify-center py-8 px-4">
        <div className="shadow-2xl rounded-lg overflow-hidden" ref={printRef}>
          <PrintDocument
            docType={doc.document_type}
            docNumber={doc.document_number}
            issuedDate={doc.issued_date}
            dueDate={doc.due_date}
            client={{
              name:    doc.client_name,
              address: doc.client_address,
              email:   doc.client_email,
              phone:   doc.client_phone,
              taxId:   doc.client_tax_id,
            }}
            items={doc.items}
            taxRate={doc.tax_rate}
            currency={doc.display_currency}
            eurRate={doc.exchange_rate_eur}
            usdRate={doc.exchange_rate_usd}
            language={doc.language}
            notes={doc.notes}
            paymentTerms={doc.payment_terms}
          />
        </div>
      </div>
    </div>
  )
}

export default function DocumentGenerator() {
  const { t } = useLang()
  const [doc,      setDoc]      = useState({ ...EMPTY_DOC })
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState(null)
  const [preview,  setPreview]  = useState(false)
  const [docCount, setDocCount] = useState({})

  // Load document counts per type (for number generation)
  useEffect(() => {
    async function loadCounts() {
      const { data } = await supabase
        .from('invoices_and_quotes')
        .select('document_type')
      if (data) {
        const counts = {}
        data.forEach(({ document_type }) => {
          counts[document_type] = (counts[document_type] || 0) + 1
        })
        setDocCount(counts)
      }
    }
    loadCounts()
  }, [])

  // Re-generate document number when type changes
  useEffect(() => {
    const num = generateDocNumber(doc.document_type, docCount[doc.document_type] || 0)
    setDoc((d) => ({ ...d, document_number: num }))
  }, [doc.document_type, docCount])

  function setField(field, value) { setDoc((d) => ({ ...d, [field]: value })) }

  function setItem(index, item) {
    setDoc((d) => {
      const items = [...d.items]
      items[index] = item
      return { ...d, items }
    })
  }

  function addItem() {
    setDoc((d) => ({ ...d, items: [...d.items, { ...EMPTY_ITEM }] }))
  }

  function removeItem(index) {
    setDoc((d) => ({
      ...d,
      items: d.items.length > 1 ? d.items.filter((_, i) => i !== index) : d.items,
    }))
  }

  // Computed totals
  const subtotalTND  = doc.items.reduce((s, i) => s + (parseFloat(i.total_tnd) || 0), 0)
  const { tax: taxTND, total: totalTND } = calcTax(subtotalTND, doc.tax_rate)

  function fmt(amount) {
    return formatDocumentAmount(amount, doc.display_currency, doc.exchange_rate_eur, doc.exchange_rate_usd)
  }

  async function handleSave() {
    if (!doc.client_name) { setError('Le nom du client est requis.'); return }
    if (doc.items.every((i) => !i.description)) { setError(t('admin.documents.noItems')); return }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        document_type:    doc.document_type,
        document_number:  doc.document_number,
        client_name:      doc.client_name,
        client_address:   doc.client_address,
        client_email:     doc.client_email,
        client_phone:     doc.client_phone,
        client_tax_id:    doc.client_tax_id,
        items:            doc.items.filter((i) => i.description),
        subtotal_tnd:     subtotalTND,
        tax_rate:         doc.tax_rate,
        tax_amount_tnd:   taxTND,
        total_tnd:        totalTND,
        display_currency: doc.display_currency,
        exchange_rate_eur: doc.exchange_rate_eur,
        exchange_rate_usd: doc.exchange_rate_usd,
        language:         doc.language,
        notes:            doc.notes,
        payment_terms:    doc.payment_terms,
        status:           doc.status,
        issued_date:      doc.issued_date,
        due_date:         doc.due_date || null,
      }

      const existing = await supabase.from('invoices_and_quotes').select('id').eq('document_number', doc.document_number).maybeSingle()

      if (existing.data?.id) {
        await supabase.from('invoices_and_quotes').update(payload).eq('id', existing.data.id)
      } else {
        await supabase.from('invoices_and_quotes').insert(payload)
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3500)
      setDocCount((c) => ({ ...c, [doc.document_type]: (c[doc.document_type] || 0) + 1 }))
    } catch (err) {
      setError(err.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setDoc({ ...EMPTY_DOC })
    setError(null)
    setSaved(false)
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean bg-white'
  const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5'

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-slate-900">{t('admin.documents.title')}</h1>
          <div className="flex gap-2">
            <button onClick={resetForm} className="border border-slate-200 text-slate-600 font-semibold px-4 py-2 rounded-xl hover:bg-slate-50 text-sm">
              Nouveau document
            </button>
            <button
              onClick={() => {
                if (!doc.client_name) { setError("Renseignez d'abord le client."); return }
                setPreview(true)
              }}
              className="flex items-center gap-2 border border-ocean text-ocean font-semibold px-4 py-2 rounded-xl hover:bg-ocean/5 text-sm transition-colors"
            >
              <Eye size={15} />{t('admin.documents.preview')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-midnight hover:bg-midnight-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-60"
            >
              <Save size={15} />
              {saving ? t('common.loading') : t('admin.documents.save')}
            </button>
          </div>
        </div>

        {(error || saved) && (
          <div className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium ${saved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {saved ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {saved ? t('admin.documents.saved') : error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: FORM ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Document type + number + dates */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <h2 className="font-bold text-slate-900 text-sm">Type de document</h2>

              <div className="flex flex-wrap gap-2">
                {DOC_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setField('document_type', type)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${
                      doc.document_type === type
                        ? 'bg-midnight text-white border-midnight'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-midnight/40'
                    }`}
                  >
                    {t(`admin.documents.types.${type}`)}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>{t('admin.documents.docNumber')}</label>
                  <input value={doc.document_number} onChange={(e) => setField('document_number', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t('admin.documents.issuedDate')}</label>
                  <input type="date" value={doc.issued_date} onChange={(e) => setField('issued_date', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t('admin.documents.dueDate')}</label>
                  <input type="date" value={doc.due_date} onChange={(e) => setField('due_date', e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Language + Currency + Status + TVA */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className={labelCls}>Langue</label>
                  <select value={doc.language} onChange={(e) => setField('language', e.target.value)} className={inputCls}>
                    {LANGUAGES.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t('admin.documents.currency')}</label>
                  <select value={doc.display_currency} onChange={(e) => setField('display_currency', e.target.value)} className={inputCls}>
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>TVA %</label>
                  <select value={doc.tax_rate} onChange={(e) => setField('tax_rate', parseFloat(e.target.value))} className={inputCls}>
                    {TAX_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Statut</label>
                  <select value={doc.status} onChange={(e) => setField('status', e.target.value)} className={inputCls}>
                    {['draft','sent','accepted','paid','cancelled'].map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Client information */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <h2 className="font-bold text-slate-900 text-sm">{t('admin.documents.client')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelCls}>{t('admin.documents.clientName')} *</label>
                  <input required value={doc.client_name} onChange={(e) => setField('client_name', e.target.value)} className={inputCls} placeholder="Nom du client ou société" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>{t('admin.documents.clientAddress')}</label>
                  <input value={doc.client_address} onChange={(e) => setField('client_address', e.target.value)} className={inputCls} placeholder="Adresse complète" />
                </div>
                <div>
                  <label className={labelCls}>{t('admin.documents.clientEmail')}</label>
                  <input type="email" value={doc.client_email} onChange={(e) => setField('client_email', e.target.value)} className={inputCls} placeholder="client@email.com" />
                </div>
                <div>
                  <label className={labelCls}>{t('admin.documents.clientPhone')}</label>
                  <input value={doc.client_phone} onChange={(e) => setField('client_phone', e.target.value)} className={inputCls} placeholder="+216 XX XXX XXX" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>{t('admin.documents.clientTaxId')}</label>
                  <input value={doc.client_tax_id} onChange={(e) => setField('client_tax_id', e.target.value)} className={inputCls} placeholder="MF: XXXXXXX" />
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="font-bold text-slate-900 text-sm mb-4">{t('admin.documents.items')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 w-8">#</th>
                      <th className="text-left px-2 py-2 text-xs font-semibold text-slate-500">{t('admin.documents.description')}</th>
                      <th className="text-center px-2 py-2 text-xs font-semibold text-slate-500 w-20">{t('admin.documents.qty')}</th>
                      <th className="text-right px-2 py-2 text-xs font-semibold text-slate-500 w-32">{t('admin.documents.unitPrice')}</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 w-32">{t('admin.documents.total')}</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {doc.items.map((item, index) => (
                      <LineItemRow
                        key={index}
                        item={item}
                        index={index}
                        onChange={setItem}
                        onRemove={removeItem}
                        currency={doc.display_currency}
                        eurRate={doc.exchange_rate_eur}
                        usdRate={doc.exchange_rate_usd}
                        t={t}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={addItem}
                className="mt-4 flex items-center gap-2 text-ocean text-sm font-semibold hover:text-ocean-dark transition-colors"
              >
                <Plus size={16} />
                {t('admin.documents.addItem')}
              </button>
            </div>

            {/* Notes + Payment terms */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>{t('admin.documents.paymentTerms')}</label>
                  <input value={doc.payment_terms} onChange={(e) => setField('payment_terms', e.target.value)} className={inputCls} placeholder="Paiement à 30 jours" />
                </div>
                <div>
                  <label className={labelCls}>{t('admin.documents.notes')}</label>
                  <textarea
                    rows={3}
                    value={doc.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    className={`${inputCls} resize-none`}
                    placeholder="Notes, conditions particulières..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: TOTALS SUMMARY ── */}
          <div className="space-y-4">
            {/* Totals card */}
            <div className="bg-midnight text-white rounded-2xl p-6 sticky top-20">
              <h2 className="font-bold text-sm mb-5 text-white/70 uppercase tracking-wider">Récapitulatif</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">{t('admin.documents.subtotal')}</span>
                  <span className="font-semibold">{fmt(subtotalTND)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">{t('admin.documents.tax', { rate: doc.tax_rate })}</span>
                  <span className="font-semibold">{fmt(taxTND)}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="font-bold text-white">{t('admin.documents.grandTotal')}</span>
                  <span className="text-xl font-extrabold text-ocean">{fmt(totalTND)}</span>
                </div>
              </div>

              {/* Exchange rates (if not TND) */}
              {doc.display_currency !== 'TND' && (
                <div className="bg-white/5 rounded-xl p-3 mb-5 space-y-2">
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Taux de conversion</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-white/40 text-xs block mb-1">1 TND = EUR</label>
                      <input
                        type="number" step="0.001" min="0"
                        value={doc.exchange_rate_eur}
                        onChange={(e) => setField('exchange_rate_eur', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white/10 border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-ocean"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">1 TND = USD</label>
                      <input
                        type="number" step="0.001" min="0"
                        value={doc.exchange_rate_usd}
                        onChange={(e) => setField('exchange_rate_usd', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white/10 border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-ocean"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (!doc.client_name) { setError("Renseignez d'abord le client."); return }
                    setPreview(true)
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-ocean hover:bg-ocean-dark text-white font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  <Eye size={15} />{t('admin.documents.preview')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-60"
                >
                  <Save size={15} />
                  {saving ? t('common.loading') : t('admin.documents.save')}
                </button>
              </div>
            </div>

            {/* Quick info */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Infos document</h3>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="font-semibold text-slate-800">{t(`admin.documents.types.${doc.document_type}`)}</span>
                </div>
                <div className="flex justify-between">
                  <span>N°</span>
                  <span className="font-mono font-semibold text-ocean">{doc.document_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lignes</span>
                  <span className="font-semibold text-slate-800">{doc.items.filter((i) => i.description).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA</span>
                  <span className="font-semibold text-slate-800">{doc.tax_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Devise</span>
                  <span className="font-semibold text-slate-800">{doc.display_currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <PreviewModal doc={doc} onClose={() => setPreview(false)} />
      )}
    </AdminLayout>
  )
}