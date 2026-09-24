import { useEffect, useRef, useState } from 'react'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Upload, X,
  Search, Package, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { supabase, uploadFile, deleteFile, extractStoragePath } from '../../lib/supabaseClient'
import { useLang } from '../../context/LanguageContext'
import { formatTND } from '../../utils/currencyFormatter'
import AdminLayout from '../../components/AdminLayout'

const CATEGORIES = ['ordinateurs','reseaux','imprimantes','surveillance','composants','accessoires']

const EMPTY_FORM = {
  name_fr: '', name_ar: '', name_en: '',
  description_fr: '', description_ar: '', description_en: '',
  price_tnd: '', category: 'ordinateurs', stock_quantity: 0,
  image_url: '', is_visible: true,
}

function ProductModal({ product, onSave, onClose, t }) {
  const [form,     setForm]    = useState(product || EMPTY_FORM)
  const [saving,   setSaving]  = useState(false)
  const [imgFile,  setImgFile] = useState(null)
  const [imgPreview, setImgPreview] = useState(product?.image_url || null)
  const [error,    setError]   = useState(null)
  const fileRef = useRef()

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })) }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImgFile(file)
    setImgPreview(URL.createObjectURL(file))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name_fr || !form.price_tnd) return
    setSaving(true)
    setError(null)
    try {
      let imageUrl = form.image_url

      // Upload new image if selected
      if (imgFile) {
        const ext  = imgFile.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        imageUrl = await uploadFile('products-images', path, imgFile)
      }

      const payload = {
        ...form,
        price_tnd:      parseFloat(form.price_tnd) || 0,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        image_url:      imageUrl,
      }

      if (product?.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
      }
      onSave()
    } catch (err) {
      setError(err.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean transition-colors'
  const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl my-4">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-lg text-slate-900">
            {product?.id ? t('admin.products.edit') : t('admin.products.add')}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Image upload */}
          <div>
            <label className={labelClass}>{t('admin.products.image')}</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative w-full h-36 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:border-ocean transition-colors flex items-center justify-center bg-slate-50 group"
            >
              {imgPreview ? (
                <img src={imgPreview} alt="preview" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center">
                  <Upload size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">{t('admin.products.dragDrop')}</p>
                </div>
              )}
              <div className="absolute inset-0 bg-ocean/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-ocean text-sm font-medium">{t('admin.products.changeImage')}</span>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>{t('admin.products.name_fr')} *</label>
              <input required value={form.name_fr} onChange={(e) => set('name_fr', e.target.value)} className={inputClass} placeholder="Nom en français" />
            </div>
            <div>
              <label className={labelClass}>{t('admin.products.name_ar')}</label>
              <input value={form.name_ar} onChange={(e) => set('name_ar', e.target.value)} className={`${inputClass} text-right`} dir="rtl" placeholder="الاسم بالعربية" />
            </div>
            <div>
              <label className={labelClass}>{t('admin.products.name_en')}</label>
              <input value={form.name_en} onChange={(e) => set('name_en', e.target.value)} className={inputClass} placeholder="Name in English" />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>{t('admin.products.desc_fr')}</label>
              <textarea rows={3} value={form.description_fr} onChange={(e) => set('description_fr', e.target.value)} className={`${inputClass} resize-none`} placeholder="Description FR" />
            </div>
            <div>
              <label className={labelClass}>{t('admin.products.desc_ar')}</label>
              <textarea rows={3} value={form.description_ar} onChange={(e) => set('description_ar', e.target.value)} className={`${inputClass} resize-none text-right`} dir="rtl" placeholder="وصف بالعربية" />
            </div>
            <div>
              <label className={labelClass}>{t('admin.products.desc_en')}</label>
              <textarea rows={3} value={form.description_en} onChange={(e) => set('description_en', e.target.value)} className={`${inputClass} resize-none`} placeholder="Description EN" />
            </div>
          </div>

          {/* Price / Category / Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>{t('admin.products.price')} (TND) *</label>
              <input
                required type="number" min="0" step="0.001"
                value={form.price_tnd}
                onChange={(e) => set('price_tnd', e.target.value)}
                className={inputClass} placeholder="0.000"
              />
            </div>
            <div>
              <label className={labelClass}>{t('admin.products.category')}</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{t(`products.categories.${c}`) || c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('admin.products.stock')}</label>
              <input
                type="number" min="0"
                value={form.stock_quantity}
                onChange={(e) => set('stock_quantity', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <button
              type="button"
              onClick={() => set('is_visible', !form.is_visible)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.is_visible ? 'bg-ocean' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_visible ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm font-medium text-slate-700">
              {form.is_visible ? t('common.visible') : t('common.hidden')}
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-ocean hover:bg-ocean-dark text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('common.loading')}</>
              ) : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ManageProducts() {
  const { t } = useLang()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [modal,    setModal]    = useState(null) // null | product object | 'new'
  const [toast,    setToast]    = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function showToast(msg, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function toggleVisibility(product) {
    const { error } = await supabase.from('products').update({ is_visible: !product.is_visible }).eq('id', product.id)
    if (!error) {
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_visible: !p.is_visible } : p))
      showToast(t('common.success'))
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(t('admin.products.confirmDelete'))) return
    // Delete image from storage if it's a Supabase URL
    if (product.image_url) {
      const path = extractStoragePath(product.image_url, 'products-images')
      if (path) await deleteFile('products-images', path).catch(() => {})
    }
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
      showToast(t('common.success'))
    }
  }

  function onSave() {
    setModal(null)
    load()
    showToast(t('common.success'))
  }

  const filtered = products.filter((p) => {
    const s = search.toLowerCase()
    return !s || [p.name_fr, p.name_ar, p.name_en].some((v) => v?.toLowerCase().includes(s))
  })

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-slate-900">{t('admin.products.title')}</h1>
          <button
            onClick={() => setModal(EMPTY_FORM)}
            className="flex items-center gap-2 bg-ocean hover:bg-ocean-dark text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-ocean/20"
          >
            <Plus size={18} />
            {t('admin.products.add')}
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Catégorie</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prix</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-5 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <Package size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-slate-400 text-sm">{t('common.noData')}</p>
                    </td>
                  </tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name_fr} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Package size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{p.name_fr}</p>
                          {p.name_ar && <p className="text-slate-400 text-xs" dir="rtl">{p.name_ar}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                        {t(`products.categories.${p.category}`) || p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 text-sm">
                      {formatTND(p.price_tnd)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${p.stock_quantity <= 0 ? 'text-red-500' : p.stock_quantity <= 3 ? 'text-amber-500' : 'text-emerald-600'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${p.is_visible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {p.is_visible ? t('common.visible') : t('common.hidden')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => toggleVisibility(p)}
                          title={p.is_visible ? t('common.deactivate') : t('common.activate')}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          {p.is_visible ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          onClick={() => setModal(p)}
                          title={t('common.edit')}
                          className="w-8 h-8 rounded-lg hover:bg-ocean/10 flex items-center justify-center text-slate-400 hover:text-ocean transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => deleteProduct(p)}
                          title={t('common.delete')}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-slate-400 text-sm">{filtered.length} produit(s) affiché(s)</p>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <ProductModal
          product={modal.id ? modal : null}
          onSave={onSave}
          onClose={() => setModal(null)}
          t={t}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm transition-all ${toast.ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
          <CheckCircle2 size={17} />
          {toast.msg}
        </div>
      )}
    </AdminLayout>
  )
}
