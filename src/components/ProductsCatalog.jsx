import { useEffect, useState } from 'react'
import { ShoppingCart, Search, Package, MessageCircle, AlertCircle, Check } from 'lucide-react'
import { supabase }    from '../lib/supabaseClient'
import { useLang }     from '../context/LanguageContext'
import { useCart }     from '../context/CartContext'
import { formatPrice } from '../utils/currencyFormatter'
import { openWhatsApp, buildProductQuoteMessage } from '../utils/config'

function StockBadge({ qty, t }) {
  if (qty<=0) return <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded-full">{t('products.outOfStock')}</span>
  if (qty<=3) return <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">{t('products.lowStock')}</span>
  return <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">✓ {t('products.inStock')}</span>
}

function ProductCard({ product, lang, t, getName }) {
  const { addItem, isInCart } = useCart()
  const name   = getName(product)
  const price  = formatPrice(product.price_tnd, lang)
  const inCart = isInCart(product.id)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-ocean/30 hover:shadow-xl hover:shadow-ocean/5 transition-all duration-300 group overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
        {product.image_url
          ? <img src={product.image_url} alt={name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
          : <div className="w-full h-full flex items-center justify-center"><Package size={40} className="text-slate-300"/></div>
        }
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-midnight/80 text-white text-[10px] font-semibold rounded-lg backdrop-blur-sm">
          {t(`products.categories.${product.category}`) || product.category}
        </span>
        {inCart && (
          <span className="absolute top-3 right-3 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
            <Check size={14} className="text-white"/>
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-ocean transition-colors">{name}</h3>
        <StockBadge qty={product.stock_quantity} t={t}/>

        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
          <div className="text-lg font-extrabold text-midnight dark:text-white leading-none">{price}</div>
          <div className="flex gap-2">
            <button
              onClick={()=>addItem(product)}
              disabled={product.stock_quantity<=0}
              className={`flex-1 flex items-center justify-center gap-1.5 font-semibold text-xs py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                inCart ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-midnight hover:bg-midnight-700 text-white hover:-translate-y-0.5'
              }`}
            >
              {inCart ? <><Check size={13}/>Ajouté</> : <><ShoppingCart size={13}/>Devis</>}
            </button>
            <button
              onClick={()=>openWhatsApp(buildProductQuoteMessage({productName:name, priceTND:product.price_tnd}))}
              disabled={product.stock_quantity<=0}
              className="w-10 flex items-center justify-center rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all disabled:opacity-40 hover:-translate-y-0.5"
              title="WhatsApp"
            >
              <MessageCircle size={15}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsCatalog() {
  const { t, lang, getName } = useLang()
  const [products,       setProducts]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search,         setSearch]         = useState('')

  useEffect(()=>{
    async function load() {
      setLoading(true)
      const {data,error} = await supabase.from('products').select('*').eq('is_visible',true).order('created_at',{ascending:false})
      if(error) setError(error.message)
      else setProducts(data||[])
      setLoading(false)
    }
    load()
  },[])

  const categories = [...new Set(products.map(p=>p.category))]
  const filtered = products.filter(p=>{
    const matchCat = activeCategory==='all' || p.category===activeCategory
    const s = search.toLowerCase()
    const matchSearch = !s || [p.name_fr,p.name_ar,p.name_en].some(v=>v?.toLowerCase().includes(s))
    return matchCat && matchSearch
  })

  const btnBase = 'px-4 py-2 text-sm font-semibold rounded-xl border transition-all'
  const btnActive = 'bg-midnight dark:bg-white text-white dark:text-midnight border-midnight dark:border-white'
  const btnInactive = 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-midnight/40'

  return (
    <section id="products" className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-ocean font-semibold text-sm mb-3 uppercase tracking-wider">
            <ShoppingCart size={15}/>{t('products.title')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-midnight dark:text-white mb-4">{t('products.subtitle')}</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('common.search')}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean/30 bg-white dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"/>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={()=>setActiveCategory('all')} className={`${btnBase} ${activeCategory==='all'?btnActive:btnInactive}`}>{t('products.allCategories')}</button>
            {categories.map(cat=>(
              <button key={cat} onClick={()=>setActiveCategory(cat)} className={`${btnBase} ${activeCategory===cat?btnActive:btnInactive}`}>
                {t(`products.categories.${cat}`)||cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({length:8}).map((_,i)=>(
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700"/>
                <div className="p-4 space-y-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"/><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl"/></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 text-red-700 px-5 py-4 rounded-xl border border-red-200">
            <AlertCircle size={18}/><span className="text-sm">{error}</span>
          </div>
        ) : filtered.length===0 ? (
          <div className="text-center py-20 text-slate-400">
            <Package size={40} className="mx-auto mb-3 opacity-40"/><p>{t('common.noData')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(p=><ProductCard key={p.id} product={p} lang={lang} t={t} getName={getName}/>)}
          </div>
        )}
      </div>
    </section>
  )
}
