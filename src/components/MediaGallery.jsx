import { useEffect, useState } from 'react'
import { X, Play, Image as ImageIcon, Film, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useLang } from '../context/LanguageContext'

function GalleryItem({ item, onClick, getName }) {
  const isVideo = item.file_type === 'video'
  return (
    <button
      onClick={() => onClick(item)}
      className="group relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 hover:border-ocean/40 hover:shadow-lg hover:shadow-ocean/10 transition-all duration-300"
    >
      {item.thumbnail_url || (item.file_type === 'image' && item.file_url) ? (
        <img
          src={item.thumbnail_url || item.file_url}
          alt={getName(item) || ''}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-midnight/10 to-ocean/10">
          {isVideo ? <Film size={32} className="text-ocean opacity-60" /> : <ImageIcon size={32} className="text-slate-400" />}
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-midnight/0 group-hover:bg-midnight/40 transition-all duration-300 flex items-center justify-center">
        {isVideo && (
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play size={20} className="text-white ml-0.5" />
          </div>
        )}
        {!isVideo && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold bg-midnight/60 backdrop-blur-sm px-3 py-1.5 rounded-lg max-w-[80%] text-center line-clamp-2">
            {getName(item)}
          </div>
        )}
      </div>

      {/* Type badge */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {isVideo ? (
          <span className="px-2 py-0.5 bg-ocean text-white text-[10px] font-semibold rounded-lg">VIDEO</span>
        ) : (
          <span className="px-2 py-0.5 bg-midnight/70 text-white text-[10px] font-semibold rounded-lg backdrop-blur-sm">IMG</span>
        )}
      </div>
    </button>
  )
}

function Lightbox({ item, onClose, getName }) {
  const isVideo = item.file_type === 'video'

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
      >
        <X size={20} />
      </button>

      <div
        className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            src={item.file_url}
            controls
            autoPlay
            className="max-h-[75vh] w-full rounded-xl"
          />
        ) : (
          <img
            src={item.file_url}
            alt={getName(item) || ''}
            className="max-h-[75vh] w-auto rounded-xl object-contain"
          />
        )}
        {getName(item) && (
          <p className="mt-4 text-white/70 text-sm text-center">{getName(item)}</p>
        )}
      </div>
    </div>
  )
}

export default function MediaGallery() {
  const { t, getName } = useLang()
  const [media,       setMedia]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [filter,      setFilter]      = useState('all')
  const [lightbox,    setLightbox]    = useState(null)

  useEffect(() => {
    async function fetchMedia() {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true })
      if (error) setError(error.message)
      else setMedia(data || [])
      setLoading(false)
    }
    fetchMedia()
  }, [])

  const filtered = filter === 'all'
    ? media
    : media.filter((m) => m.file_type === filter)

  return (
    <section id="media" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-ocean font-semibold text-sm mb-3 uppercase tracking-wider">
            <Film size={15} />
            {t('media.title')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-midnight mb-4">
            {t('media.subtitle')}
          </h2>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 justify-center mb-8">
          {[
            { key: 'all',   label: t('media.all')    },
            { key: 'image', label: t('media.photos')  },
            { key: 'video', label: t('media.videos')  },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 py-2 text-sm font-semibold rounded-xl border transition-all ${
                filter === key
                  ? 'bg-midnight text-white border-midnight'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-midnight/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 text-red-700 px-5 py-4 rounded-xl">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <ImageIcon size={40} className="mx-auto mb-3 opacity-40" />
            <p>{t('common.noData')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <GalleryItem
                key={item.id}
                item={item}
                onClick={setLightbox}
                getName={getName}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          item={lightbox}
          onClose={() => setLightbox(null)}
          getName={getName}
        />
      )}
    </section>
  )
}
