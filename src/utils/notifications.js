export async function requestPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const p = await Notification.requestPermission()
  return p === 'granted'
}

export const canNotify = () =>
  'Notification' in window && Notification.permission === 'granted'

export function notify(title, body, options = {}) {
  if (!canNotify()) return null
  const n = new Notification(title, { body, icon:'/logo.png', badge:'/logo.png', ...options })
  setTimeout(() => n.close(), 6000)
  return n
}

export function notifyNewRequest(req) {
  const labels = { anydesk:'🖥️ Assistance à distance', quote:'📋 Demande de devis', training:'📚 Formation', contact:'✉️ Contact' }
  return notify(
    labels[req.request_type] || '🔔 Nouvelle demande',
    `${req.client_name}${req.client_phone ? ' · ' + req.client_phone : ''}`,
    { tag: `req-${req.id}`, requireInteraction: true }
  )
}

export function createToast(message, type = 'info') {
  const colors = {
    info:    '#0a1628', success: '#065f46',
    warning: '#92400e', error:   '#7f1d1d', request: '#0a1628',
  }
  const icons = { info:'ℹ️', success:'✅', warning:'⚠️', error:'❌', request:'🔔' }
  const el = document.createElement('div')
  el.style.cssText = `
    position:fixed;top:20px;right:20px;z-index:99999;
    background:${colors[type]||colors.info};border-radius:14px;
    color:#fff;padding:14px 18px;font-family:Inter,sans-serif;
    font-size:14px;font-weight:600;max-width:320px;
    box-shadow:0 8px 32px rgba(0,0,0,.35);
    display:flex;align-items:flex-start;gap:10px;line-height:1.4;
    animation:toast-in .3s cubic-bezier(.34,1.56,.64,1);
  `
  el.innerHTML = `
    <style>
      @keyframes toast-in  {from{opacity:0;transform:translateY(-14px) scale(.9)}to{opacity:1;transform:none}}
      @keyframes toast-out {from{opacity:1}to{opacity:0;transform:translateY(-8px)}}
    </style>
    <span style="font-size:18px;flex-shrink:0">${icons[type]||'ℹ️'}</span>
    <span>${message}</span>
  `
  document.body.appendChild(el)
  setTimeout(() => {
    el.style.animation = 'toast-out .3s ease forwards'
    setTimeout(() => el.remove(), 320)
  }, 4500)
}
