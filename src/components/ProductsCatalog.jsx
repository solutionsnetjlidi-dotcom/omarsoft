import { useEffect, useState } from 'react'
import { ShoppingCart, Search, Package, MessageCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useLang } from '../context/LanguageContext'
import { formatPrice } from '../utils/currencyFormatter'
import { openWhatsApp, buildProductQuoteMessage } from '../utils/config'

const CATEGORY_KEYS = ['ordinateurs', 'reseaux', 'imprimantes', 'surveillance', 'composants', 'accessoires']

function StockBadge({ qty, t }) {
  if (qty <= 0)  return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">{t('products.outOfStock')}</span>
  if (qty <= 3)  return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">{t('products.lowStock')}</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">✓ {t('products.inStock')}</span>
}

function ProductCard({ product, lang, t, getName }) {
  const name  = getName(product)
  const price = formatPrice(product.price_tnd, lang)

  function handleRequest() {
    const msg = buildProductQuoteMessage({ productName: name, priceTND: product.price_tnd })
    openWhatsApp(msg)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-ocean/30 hover:shadow-xl hover:shadow-ocean/5 transition-all duration-300 group overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={40} className="text-slate-300" />
          </div>
        )}
        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-midnight/80 text-white text-[10px] font-semibold rounded-lg backdrop-blur-sm">
          {t(`products.categories.${product.category}`) || product.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-ocean transition-colors">
            {name}
          </h3>
        </div>

        <StockBadge qty={product.stock_quantity} t={t} />

        <div className="mt-auto pt-3 border-t border-slate-100">
          <div className="mb-3">
            <div className="text-lg font-extrabold text-midnight leading-none">{price}</div>
          </div>
          <button
            onClick={handleRequest}
            disabled={product.stock_quantity <= 0}
            className="w-full flex items-center justify-center gap-2 bg-ocean hover:bg-ocean-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-xl transition-all hover:shadow-md hover:shadow-ocean/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            <MessageCircle size={15} />
            {t('products.requestQuote')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductsCatalog() {
  const { t, lang, getName } = useLang()
  const [products,   setProducts]  = useState([])
  const [loading,    setLoading]   = useState(true)
  const [error,      setError]     = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search,     setSearch]    = useState('')

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
      if (error) setError(error.message)
      else setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  // Determine visible categories from actual data
  const availableCategories = [...new Set(products.map((p) => p.category))]

  const filtered = products.filter((p) => {
    const matchCat    = activeCategory === 'all' || p.category === activeCategory
    const searchLower = search.toLowerCase()
    const matchSearch = !search || [
      p.name_fr, p.name_ar, p.name_en, p.description_fr
    ].some((v) => v?.toLowerCase().includes(searchLower))
    return matchCat && matchSearch
  })

  return (
    <section id="products" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-ocean font-semibold text-sm mb-3 uppercase tracking-wider">
            <ShoppingCart size={15} />
            {t('products.title')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-midnight mb-4">
            {t('products.subtitle')}
          </h2>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search')}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean bg-white"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
                activeCategory === 'all'
                  ? 'bg-midnight text-white border-midnight'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-midnight/30'
              }`}
            >
              {t('products.allCategories')}
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
                  activeCategory === cat
                    ? 'bg-midnight text-white border-midnight'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-midnight/30'
                }`}
              >
                {t(`products.categories.${cat}`) || cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 text-red-700 px-5 py-4 rounded-xl border border-red-200">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Package size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">{t('common.noData')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} t={t} getName={getName} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
