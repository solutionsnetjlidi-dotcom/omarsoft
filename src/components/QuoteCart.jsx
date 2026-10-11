import { X, ShoppingCart, Plus, Minus, Trash2, Send, FileText, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart }  from '../context/CartContext'
import { useLang }  from '../context/LanguageContext'
import { openWhatsApp } from '../utils/config'

const fmt = n => new Intl.NumberFormat('fr-TN',{minimumFractionDigits:3}).format(n) + ' TND'

export default function QuoteCart() {
  const { items, open, count, total, setOpen, setQty, removeItem, clearCart, buildWhatsAppMessage, saveForAdmin } = useCart()
  const { isRTL } = useLang()
  const navigate = useNavigate()
  const side = isRTL ? {left:'20px',right:'auto'} : {right:'20px',left:'auto'}

  return (
    <>
      {/* Floating button */}
      <div style={{position:'fixed',bottom:'88px',zIndex:9998,...side}}>
        <button onClick={()=>setOpen(!open)} aria-label="Panier devis"
          style={{
            width:'56px',height:'56px',borderRadius:'50%',
            background:'#0a1628',color:'#fff',border:'none',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 4px 20px rgba(10,22,40,.4)',
            transition:'transform .2s,box-shadow .2s',position:'relative',
          }}
          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.08)'}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)'}}>
          <ShoppingCart size={22}/>
          {count>0&&(
            <span style={{
              position:'absolute',top:'-4px',right:'-4px',
              width:'20px',height:'20px',borderRadius:'50%',
              background:'#c9a227',color:'#fff',
              fontSize:'10px',fontWeight:800,
              display:'flex',alignItems:'center',justifyContent:'center',
            }}>{count>9?'9+':count}</span>
          )}
        </button>
      </div>

      {/* Backdrop */}
      {open&&<div onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,zIndex:9997,background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)'}}/>}

      {/* Drawer */}
      <div style={{
        position:'fixed',top:0,height:'100%',zIndex:9999,
        width:'min(380px,100vw)',
        background:'#fff',boxShadow:'-8px 0 48px rgba(0,0,0,.18)',
        display:'flex',flexDirection:'column',
        transition:'transform .3s cubic-bezier(.4,0,.2,1)',
        ...(isRTL?{left:0,transform:open?'none':'translateX(-100%)'}:{right:0,transform:open?'none':'translateX(100%)'}),
      }}>
        {/* Header */}
        <div style={{background:'#0a1628',padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <ShoppingCart size={18} style={{color:'#c9a227'}}/>
            <div>
              <p style={{color:'#fff',fontWeight:700,fontSize:'14px',margin:0}}>Panier devis</p>
              <p style={{color:'rgba(255,255,255,.45)',fontSize:'12px',margin:0}}>{count} produit{count!==1?'s':''}</p>
            </div>
          </div>
          <button onClick={()=>setOpen(false)} style={{background:'rgba(255,255,255,.1)',border:'none',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',color:'rgba(255,255,255,.7)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <X size={16}/>
          </button>
        </div>

        {/* Items */}
        <div style={{flex:1,overflowY:'auto'}}>
          {items.length===0?(
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:'12px',color:'#94a3b8'}}>
              <ShoppingCart size={44} style={{opacity:.2}}/>
              <p style={{fontWeight:600,fontSize:'14px'}}>Panier vide</p>
              <p style={{fontSize:'12px',textAlign:'center',maxWidth:'200px',lineHeight:1.5}}>Ajoutez des produits depuis le catalogue pour générer un devis</p>
            </div>
          ):items.map(item=>(
            <div key={item.id} style={{display:'flex',gap:'12px',padding:'16px',borderBottom:'1px solid #f1f5f9'}}>
              <div style={{width:'52px',height:'52px',borderRadius:'12px',background:'#f8fafc',flexShrink:0,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {item.image_url?<img src={item.image_url} alt={item.name} style={{width:'100%',height:'100%',objectFit:'contain',padding:'4px'}}/>:<ShoppingCart size={18} style={{color:'#cbd5e1'}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontWeight:700,fontSize:'13px',color:'#0f172a',margin:'0 0 2px',lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{item.name}</p>
                <p style={{fontSize:'11px',color:'#94a3b8',margin:'0 0 8px'}}>{fmt(item.price_tnd)} / unité</p>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <button onClick={()=>setQty(item.id,item.qty-1)} style={{width:'26px',height:'26px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#475569'}}><Minus size={12}/></button>
                  <span style={{fontWeight:700,fontSize:'14px',minWidth:'20px',textAlign:'center'}}>{item.qty}</span>
                  <button onClick={()=>setQty(item.id,item.qty+1)} style={{width:'26px',height:'26px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#475569'}}><Plus size={12}/></button>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'8px',flexShrink:0}}>
                <span style={{fontWeight:800,fontSize:'13px',color:'#0a1628'}}>{fmt(item.price_tnd*item.qty)}</span>
                <button onClick={()=>removeItem(item.id)} style={{width:'26px',height:'26px',borderRadius:'8px',border:'none',background:'none',cursor:'pointer',color:'#cbd5e1',display:'flex',alignItems:'center',justifyContent:'center'}} onMouseEnter={e=>e.currentTarget.style.color='#ef4444'} onMouseLeave={e=>e.currentTarget.style.color='#cbd5e1'}><Trash2 size={13}/></button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length>0&&(
          <div style={{padding:'16px 20px',borderTop:'1px solid #f1f5f9',display:'flex',flexDirection:'column',gap:'10px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #f1f5f9'}}>
              <span style={{fontWeight:600,color:'#64748b',fontSize:'14px'}}>Total estimé</span>
              <span style={{fontWeight:900,fontSize:'20px',color:'#0a1628'}}>{fmt(total)}</span>
            </div>
            <p style={{fontSize:'11px',color:'#94a3b8',textAlign:'center',margin:0}}>* Prix indicatifs, sous réserve de disponibilité</p>
            <button onClick={()=>{openWhatsApp(buildWhatsAppMessage());setOpen(false)}}
              style={{background:'#25D366',color:'#fff',border:'none',borderRadius:'14px',padding:'13px',fontWeight:700,fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
              <Send size={16}/>Envoyer via WhatsApp
            </button>
            <button onClick={()=>{saveForAdmin();navigate('/admin/documents');setOpen(false)}}
              style={{background:'#fff',color:'#0a1628',border:'2px solid #0a1628',borderRadius:'14px',padding:'12px',fontWeight:700,fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
              <FileText size={16}/>Créer un devis officiel
            </button>
            <button onClick={clearCart} style={{background:'none',border:'none',color:'#94a3b8',fontSize:'12px',fontWeight:600,cursor:'pointer',padding:'4px'}}
              onMouseEnter={e=>e.currentTarget.style.color='#ef4444'} onMouseLeave={e=>e.currentTarget.style.color='#94a3b8'}>
              Vider le panier
            </button>
          </div>
        )}
      </div>
    </>
  )
}
