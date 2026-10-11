import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [open,  setOpen]  = useState(false)

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

  function buildWhatsAppMessage() {
    const lines = items.map(i => `• ${i.name} × ${i.qty} = ${(i.price_tnd * i.qty).toFixed(3)} TND`)
    return `🛒 *Demande de devis — OmarSoft*\n\n${lines.join('\n')}\n\n💰 *Total estimé : ${total.toFixed(3)} TND*\n\nMerci de confirmer disponibilité et prix définitifs.`
  }

  function saveForAdmin() {
    const docItems = items.map(i => ({
      description: i.name, quantity: i.qty,
      unit_price_tnd: i.price_tnd, total_tnd: i.price_tnd * i.qty,
    }))
    localStorage.setItem('omarsoft_cart_doc', JSON.stringify({ items: docItems, subtotal: total, timestamp: Date.now() }))
  }

  return (
    <CartContext.Provider value={{ items, open, count, total, setOpen, addItem, setQty, removeItem, clearCart, isInCart, buildWhatsAppMessage, saveForAdmin }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside <CartProvider>')
  return ctx
}
