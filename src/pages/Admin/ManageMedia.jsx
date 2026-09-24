import { useEffect, useRef, useState } from 'react'
import { Upload, Trash2, Eye, EyeOff, Image as ImgIcon, Film, X, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import { supabase, uploadFile, deleteFile, extractStoragePath } from '../../lib/supabaseClient'
import { useLang } from '../../context/LanguageContext'
import AdminLayout from '../../components/AdminLayout'

const CATEGORIES = ['general', 'realisation', 'equipe', 'formation', 'evenement']

function UploadModal({ onSave, onClose, t }) {
  const fileRef = useRef()
  const [file,      setFile]     = useState(null)
  const [preview,   setPreview]  = useState(null)
  const [form,      setForm]     = useState({ title_fr: '', category: 'general', sort_order: 0 })
  const [progress,  setProgress] = useState(null)
  const [error,     setError]    = useState(null)

  function setF(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  function handleFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return
    setProgress('Téléversement en cours...')
    setError(null)
    try {
      const isVideo = file.type.startsWith('video/')
      const ext     = file.name.split('.').pop()
      const path    = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const bucket  = 'media-gallery'
      const url     = await uploadFile(bucket, path, file)

      await supabase.from('media_content').insert({
        title_fr:  form.title_fr,
        file_url:  url,
        file_type: isVideo ? 'video' : 'image',
        category:  form.category,
        sort_order: parseInt(form.sort_order) || 0,
        is_visible: true,
      })
      setProgress(null)
      onSave()
    } catch (err) {
      setProgress(null)
      setError(err.message || t('common.error'))
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-lg text-slate-900">{t('admin.media.upload')}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="relative border-2 border-dashed border-slate-200 hover:border-ocean rounded-2xl cursor-pointer transition-colors overflow-hidden"
          >
            {preview ? (
              <div className="aspect-video bg-slate-100">
                {file?.type.startsWith('video/') ? (
                  <video src={preview} className="w-full h-full object-contain" />
                ) : (
                  <img src={preview} alt="" className="w-full h-full object-contain p-2" />
                )}
              </div>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-slate-50 text-slate-400">
                <Upload size={28} className="opacity-60" />
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600">Cliquez pour sélectionner</p>
                  <p className="text-xs text-slate-400 mt-0.5">Images (JPG, PNG, WebP) ou Vidéos (MP4, WebM)</p>
                </div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />

          {/* Metadata */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('admin.media.title_fr')}</label>
            <input value={form.title_fr} onChange={(e) => setF('title_fr', e.target.value)} className={inputCls} placeholder="Titre du média (optionnel)" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('admin.media.category')}</label>
              <select value={form.category} onChange={(e) => setF('category', e.target.value)} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('admin.media.sortOrder')}</label>
              <input type="number" value={form.sort_order} onChange={(e) => setF('sort_order', e.target.value)} className={inputCls} />
            </div>
          </div>

          {progress && (
            <div className="flex items-center gap-2 bg-ocean/10 text-ocean px-4 py-3 rounded-xl text-sm">
              <div className="w-4 h-4 border-2 border-ocean border-t-transparent rounded-full animate-spin" />
              {progress}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={15} />{error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={!file || !!progress}
              className="flex-1 bg-ocean hover:bg-ocean-dark text-white font-bold py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
              <Upload size={16} />Téléverser
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ManageMedia() {
  const { t } = useLang()
  const [media,    setMedia]   = useState([])
  const [loading,  setLoading] = useState(true)
  const [modal,    setModal]   = useState(false)
  const [toast,    setToast]   = useState(null)
  const [filter,   setFilter]  = useState('all')

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('media_content').select('*').order('sort_order').order('created_at', { ascending: false })
    setMedia(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function showToast(msg, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function toggleVisibility(item) {
    await supabase.from('media_content').update({ is_visible: !item.is_visible }).eq('id', item.id)
    setMedia((prev) => prev.map((m) => m.id === item.id ? { ...m, is_visible: !m.is_visible } : m))
    showToast(t('common.success'))
  }

  async function deleteItem(item) {
    if (!window.confirm('Supprimer ce média ?')) return
    // Remove from storage
    const path = extractStoragePath(item.file_url, 'media-gallery')
    if (path) await deleteFile('media-gallery', path).catch(() => {})
    await supabase.from('media_content').delete().eq('id', item.id)
    setMedia((prev) => prev.filter((m) => m.id !== item.id))
    showToast(t('common.success'))
  }

  const filtered = filter === 'all' ? media : media.filter((m) => m.file_type === filter)

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-slate-900">{t('admin.media.title')}</h1>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 bg-ocean hover:bg-ocean-dark text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md">
            <Plus size={18} />{t('admin.media.upload')}
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all',   label: 'Tous' },
            { key: 'image', label: 'Images' },
            { key: 'video', label: 'Vidéos' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${filter === key ? 'bg-midnight text-white border-midnight' : 'bg-white text-slate-600 border-slate-200'}`}>
              {label}
              <span className="ml-1.5 text-xs opacity-60">
                ({key === 'all' ? media.length : media.filter((m) => m.file_type === key).length})
              </span>
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-square bg-slate-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-20 text-center">
            <ImgIcon size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400 text-sm">{t('common.noData')}</p>
            <button onClick={() => setModal(true)} className="mt-4 text-ocean text-sm font-medium hover:underline">
              + Téléverser votre premier fichier
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((item) => (
              <div key={item.id} className="group relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                {/* Preview */}
                {item.file_type === 'image' ? (
                  <img src={item.file_url} alt={item.title_fr || ''} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-midnight/80 gap-2">
                    <Film size={28} className="text-ocean" />
                    <span className="text-white text-xs font-medium">{item.title_fr || 'Vidéo'}</span>
                  </div>
                )}

                {/* Overlay controls */}
                <div className="absolute inset-0 bg-midnight/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <div className="flex gap-2">
                    <button onClick={() => toggleVisibility(item)} title="Visibilité"
                      className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
                      {item.is_visible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => deleteItem(item)} title="Supprimer"
                      className="w-8 h-8 rounded-lg bg-red-500/70 hover:bg-red-500 flex items-center justify-center text-white transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {item.title_fr && (
                    <p className="text-white text-[10px] font-medium text-center px-2 max-w-full truncate">
                      {item.title_fr}
                    </p>
                  )}
                </div>

                {/* Hidden badge */}
                {!item.is_visible && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-800/80 text-white text-[10px] font-semibold rounded-md">
                    Masqué
                  </div>
                )}

                {/* Type badge */}
                <div className="absolute top-2 right-2">
                  {item.file_type === 'video'
                    ? <div className="w-6 h-6 rounded-md bg-ocean/90 flex items-center justify-center"><Film size={11} className="text-white" /></div>
                    : <div className="w-6 h-6 rounded-md bg-midnight/70 flex items-center justify-center"><ImgIcon size={11} className="text-white" /></div>
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-slate-400 text-sm">{filtered.length} fichier(s)</p>
      </div>

      {modal && (
        <UploadModal
          onSave={() => { setModal(false); load(); showToast(t('common.success')) }}
          onClose={() => setModal(false)}
          t={t}
        />
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm ${toast.ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
          <CheckCircle2 size={17} />{toast.msg}
        </div>
      )}
    </AdminLayout>
  )
}
