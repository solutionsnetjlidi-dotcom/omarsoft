import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('omarsoft_cart') || '[]') } catch { return [] }
  })
  const [open,  setOpen]  = useState(false)

  // Le panier survit à un rechargement de la page
  useEffect(() => { try { localStorage.setItem('omarsoft_cart', JSON.stringify(items)) } catch { /* stockage indisponible */ } }, [items])

  const addItem = useCallback((product) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, {
        id: product.id, name: product.name_fr || product.name_en || 'Produit',
        name_ar: product.name_ar, name_en: product.name_en,
        price_tnd: product.price_tnd, image_url: product.image_url, qty: 1,
      }]
    })
    setOpen(true)
  }, [])

  const setQty = useCallback((id, qty) => {
    if (qty <= 0) setItems(prev => prev.filter(i => i.id !== id))
    else setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }, [])

  const removeItem  = useCallback((id)  => setItems(prev => prev.filter(i => i.id !== id)), [])
  const clearCart   = useCallback(()    => setItems([]), [])
  const isInCart    = useCallback((id)  => items.some(i => i.id === id), [items])
  const count       = items.reduce((s, i) => s + i.qty, 0)
  const total       = items.reduce((s, i) => s + i.price_tnd * i.qty, 0)

  const lineOf = (i) => `• ${i.name} × ${i.qty} = ${(i.price_tnd * i.qty).toFixed(3)} TND`

  /* Texte brut enregistré dans « Admin > Demandes » */
  function buildRequestText() {
    return `${items.map(lineOf).join('\n')}\nTotal estimé : ${total.toFixed(3)} TND`
  }

  /* Message WhatsApp (mise en forme WhatsApp : *gras*) */
  function buildWhatsAppMessage(name = '', phone = '') {
    const who = name ? `Nom : ${name}${phone ? `\nTéléphone : ${phone}` : ''}\n\n` : ''
    return `*Demande de devis — OmarSoft*\n\n${who}${items.map(lineOf).join('\n')}\n\n*Total estimé : ${total.toFixed(3)} TND*\n\nMerci de confirmer la disponibilité et les prix définitifs.`
  }

  return (
    <CartContext.Provider value={{ items, open, count, total, setOpen, addItem, setQty, removeItem, clearCart, isInCart, buildWhatsAppMessage, buildRequestText }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside <CartProvider>')
  return ctx
}
