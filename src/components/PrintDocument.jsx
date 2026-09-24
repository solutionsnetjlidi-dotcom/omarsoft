import { forwardRef } from 'react'
import { config } from '../utils/config'
import { formatDocumentAmount, calcTax } from '../utils/currencyFormatter'

const DOC_LABELS = {
  fr: {
    quote:          { title: 'DEVIS',            ref: 'N° Devis',    issued: "Date d'émission", due: "Validité jusqu'au" },
    invoice:        { title: 'FACTURE',          ref: 'N° Facture',  issued: "Date de facturation", due: "Date d'échéance" },
    purchase_order: { title: 'BON DE COMMANDE',  ref: 'N° BC',       issued: 'Date de commande', due: 'Livraison souhaitée' },
    delivery_note:  { title: 'BON DE LIVRAISON', ref: 'N° BL',       issued: 'Date de livraison', due: 'Réception prévue' },
  },
  ar: {
    quote:          { title: 'عرض سعر',    ref: 'رقم العرض',   issued: 'تاريخ الإصدار', due: 'صالح حتى' },
    invoice:        { title: 'فاتورة',     ref: 'رقم الفاتورة', issued: 'تاريخ الفوترة', due: 'تاريخ الاستحقاق' },
    purchase_order: { title: 'أمر الشراء', ref: 'رقم الأمر',   issued: 'تاريخ الأمر', due: 'التسليم المطلوب' },
    delivery_note:  { title: 'وصل تسليم', ref: 'رقم الوصل',   issued: 'تاريخ التسليم', due: 'استلام متوقع' },
  },
  en: {
    quote:          { title: 'QUOTATION',        ref: 'Quote No.',   issued: 'Issue date', due: 'Valid until' },
    invoice:        { title: 'INVOICE',          ref: 'Invoice No.', issued: 'Invoice date', due: 'Due date' },
    purchase_order: { title: 'PURCHASE ORDER',   ref: 'PO No.',      issued: 'Order date', due: 'Expected delivery' },
    delivery_note:  { title: 'DELIVERY NOTE',    ref: 'DN No.',      issued: 'Delivery date', due: 'Expected receipt' },
  },
}

const COL_LABELS = {
  fr: ['#', 'Désignation', 'Qté', 'Prix unit. HT', 'Total HT'],
  ar: ['#', 'البيان', 'الكمية', 'سعر الوحدة', 'المجموع'],
  en: ['#', 'Description', 'Qty', 'Unit price', 'Total'],
}

const PrintDocument = forwardRef(function PrintDocument(
  { docType = 'invoice', docNumber = 'FAC-2024-0001', issuedDate, dueDate,
    client = {}, items = [], taxRate = 19, currency = 'TND',
    eurRate = 0.30, usdRate = 0.32, language = 'fr', notes = '', paymentTerms = '' },
  ref
) {
  const labels = DOC_LABELS[language]?.[docType] ?? DOC_LABELS.fr[docType]
  const cols   = COL_LABELS[language] ?? COL_LABELS.fr
  const isRTL  = language === 'ar'
  const dir    = isRTL ? 'rtl' : 'ltr'

  const subtotalTND = items.reduce((s, i) => s + (parseFloat(i.total_tnd) || 0), 0)
  const { tax: taxAmountTND, total: totalTND } = calcTax(subtotalTND, taxRate)

  function fmt(a) { return formatDocumentAmount(a, currency, eurRate, usdRate) }

  function fmtDate(d) {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleDateString(
        language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-GB' : 'fr-FR',
        { day: '2-digit', month: 'long', year: 'numeric' }
      )
    } catch { return d }
  }

  return (
    <div ref={ref} dir={dir} id="print-root" style={{
      fontFamily: isRTL ? '"Noto Kufi Arabic","Noto Sans Arabic",Arial,sans-serif' : '"Inter",Arial,sans-serif',
      fontSize: '11px', color: '#1e293b', backgroundColor: '#fff',
      width: '210mm', minHeight: '297mm', margin: '0 auto',
      padding: '14mm 16mm', boxSizing: 'border-box', lineHeight: '1.5',
    }}>

      {/* ── HEADER avec vrai logo ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '16px' }}>
        {/* Company identity */}
        <div style={{ flex: 1 }}>
          {/* Logo réel + brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <img
              src="/logo.png"
              alt="OmarSoft"
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c9a227' }}
              onError={(e) => {
                e.target.style.display = 'none'
                const fallback = document.createElement('div')
                fallback.style.cssText = 'width:56px;height:56px;border-radius:50%;background:#0a1628;border:2px solid #c9a227;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#c9a227'
                fallback.textContent = 'O'
                e.target.parentNode.insertBefore(fallback, e.target)
              }}
            />
            <div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#0a1628', letterSpacing: '0.5px', lineHeight: 1 }}>
                <span>Omar</span><span style={{ color: '#c9a227' }}>Soft</span>
              </div>
              <div style={{ fontSize: '10px', color: '#1b6b7b', fontWeight: 600, letterSpacing: '0.5px', marginTop: '2px' }}>
                JLIDI NETWORK SOLUTIONS
              </div>
            </div>
          </div>
          <div style={{ fontSize: '10px', color: '#475569', lineHeight: '1.7' }}>
            <div style={{ fontWeight: 700, color: '#0a1628' }}>{config.company.nameFr}</div>
            <div>{config.company.address}</div>
            <div>Tél / WhatsApp : {config.phone}</div>
            <div>Email : {config.email}</div>
            <div>RC : {config.company.rc} &nbsp;|&nbsp; MF : {config.company.mf}</div>
          </div>
        </div>

        {/* Document type + number */}
        <div style={{ textAlign: isRTL ? 'left' : 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#0a1628', marginBottom: '8px' }}>
            {labels.title}
          </div>
          <table style={{ fontSize: '10px', marginLeft: isRTL ? 0 : 'auto' }}>
            <tbody>
              <tr>
                <td style={{ color: '#64748b', paddingRight: '12px', paddingBottom: '3px' }}>{labels.ref}</td>
                <td style={{ fontWeight: 700, color: '#c9a227' }}>{docNumber}</td>
              </tr>
              <tr>
                <td style={{ color: '#64748b', paddingRight: '12px', paddingBottom: '3px' }}>{labels.issued}</td>
                <td style={{ fontWeight: 600 }}>{fmtDate(issuedDate)}</td>
              </tr>
              {dueDate && (
                <tr>
                  <td style={{ color: '#64748b', paddingRight: '12px' }}>{labels.due}</td>
                  <td style={{ fontWeight: 600 }}>{fmtDate(dueDate)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SEPARATOR (or + marine comme la carte de visite) ── */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #0a1628, #c9a227, #00b4d8)', borderRadius: '2px', marginBottom: '20px' }} />

      {/* ── CLIENT INFO ── */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, color: '#c9a227', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
          {language === 'ar' ? 'معلومات العميل' : language === 'en' ? 'Bill To' : 'Facturé à'}
        </div>
        <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '2px' }}>{client.name || '—'}</div>
        {client.address && <div style={{ color: '#475569' }}>{client.address}</div>}
        {client.email   && <div style={{ color: '#475569' }}>{client.email}</div>}
        {client.phone   && <div style={{ color: '#475569' }}>{client.phone}</div>}
        {client.taxId   && <div style={{ color: '#475569', marginTop: '2px' }}>MF : {client.taxId}</div>}
      </div>

      {/* ── ITEMS TABLE ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ background: 'linear-gradient(90deg, #0a1628, #152647)' }}>
            {cols.map((col, i) => (
              <th key={i} style={{
                padding: '8px 10px', color: 'white', fontWeight: 700, fontSize: '9px',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                textAlign: i === 1 ? (isRTL ? 'right' : 'left') : 'center',
                borderBottom: '2px solid #c9a227',
              }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontStyle: 'italic' }}>Aucun article</td></tr>
          ) : items.map((item, idx) => (
            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
              <td style={{ padding: '7px 10px', textAlign: 'center', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>{idx + 1}</td>
              <td style={{ padding: '7px 10px', borderBottom: '1px solid #f1f5f9', fontWeight: 500 }}>{item.description || '—'}</td>
              <td style={{ padding: '7px 10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>{item.quantity || 1}</td>
              <td style={{ padding: '7px 10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>{fmt(parseFloat(item.unit_price_tnd) || 0)}</td>
              <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 700, borderBottom: '1px solid #f1f5f9', color: '#0a1628' }}>{fmt(parseFloat(item.total_tnd) || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── TOTALS ── */}
      <div style={{ display: 'flex', justifyContent: isRTL ? 'flex-start' : 'flex-end' }}>
        <table style={{ width: '240px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '5px 12px', color: '#64748b', fontSize: '10px' }}>
                {language === 'ar' ? 'المجموع بدون ضريبة' : language === 'en' ? 'Subtotal (excl. VAT)' : 'Sous-total HT'}
              </td>
              <td style={{ padding: '5px 12px', textAlign: 'right', fontWeight: 600 }}>{fmt(subtotalTND)}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 12px', color: '#64748b', fontSize: '10px' }}>
                {language === 'ar' ? `ضريبة (${taxRate}%)` : language === 'en' ? `VAT (${taxRate}%)` : `TVA (${taxRate}%)`}
              </td>
              <td style={{ padding: '5px 12px', textAlign: 'right', fontWeight: 600 }}>{fmt(taxAmountTND)}</td>
            </tr>
            <tr style={{ background: 'linear-gradient(90deg, #0a1628, #152647)' }}>
              <td style={{ padding: '9px 12px', color: 'white', fontWeight: 800, fontSize: '12px' }}>
                {language === 'ar' ? 'الإجمالي مع الضريبة' : language === 'en' ? 'Total (incl. VAT)' : 'Total TTC'}
              </td>
              <td style={{ padding: '9px 12px', textAlign: 'right', color: '#c9a227', fontWeight: 900, fontSize: '13px' }}>
                {fmt(totalTND)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── NOTES ── */}
      {(notes || paymentTerms) && (
        <div style={{ marginTop: '24px', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fefce8' }}>
          {paymentTerms && <p style={{ marginBottom: notes ? '6px' : 0, fontSize: '10px' }}><strong>Conditions de paiement :</strong> {paymentTerms}</p>}
          {notes && <p style={{ fontSize: '10px', color: '#475569', margin: 0 }}><strong>Notes :</strong> {notes}</p>}
        </div>
      )}

      {/* ── SIGNATURE AREAS ── */}
      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '40px' }}>
            {language === 'ar' ? 'توقيع العميل وختمه' : language === 'en' ? "Client's signature & stamp" : 'Signature et cachet du client'}
          </div>
          <div style={{ borderTop: '1px solid #c9a227', paddingTop: '4px', fontSize: '9px', color: '#94a3b8' }}>{client.name}</div>
        </div>
        <div style={{ flex: 1, textAlign: isRTL ? 'left' : 'right' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '40px' }}>
            {language === 'ar' ? 'توقيع المورّد وختمه' : language === 'en' ? "Supplier's signature & stamp" : 'Signature et cachet du fournisseur'}
          </div>
          <div style={{ borderTop: '1px solid #c9a227', paddingTop: '4px', fontSize: '9px', color: '#94a3b8' }}>Omar Jlidi – OmarSoft</div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ marginTop: '32px', paddingTop: '10px', borderTop: '3px solid', borderImage: 'linear-gradient(90deg, #0a1628, #c9a227, #00b4d8) 1', textAlign: 'center', fontSize: '8.5px', color: '#94a3b8' }}>
        {config.company.nameFr} | {config.company.address} | {config.phone} | {config.email}
        <br />RC : {config.company.rc} &nbsp;|&nbsp; MF : {config.company.mf} &nbsp;|&nbsp; Assujetti à la TVA au taux de {config.company.tva}%
      </div>
    </div>
  )
})

export default PrintDocument
