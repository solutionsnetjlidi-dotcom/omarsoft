/**
 * OrbitSystem.jsx — v2 : clic sur icône → scroll vers service
 * Chaque carte orbite ouvre sa section en cliquant dessus :
 *   IT Support  → scroll vers #assistance (formulaire AnyDesk)
 *   Réseaux     → scroll vers #services   (onglet Service IT)
 *   Réparation  → scroll vers #services   (onglet Service IT)
 *   Formation   → scroll vers #services   (onglet Formation)
 *   Média       → scroll vers #services   (onglet Agence Média)
 *   Meta Ads    → scroll vers #services   (onglet Agence Média)
 */

import { useEffect, useRef, useState } from 'react'

/* ── Données des services ──────────────────────────── */
const SERVICES = [
  {
    label: 'IT Support',
    tooltip: 'Assistance à distance →',
    color: '#00b4d8',
    glowColor: 'rgba(0,180,216,0.65)',
    tab: 'service',
    scrollTo: 'assistance',                 // → formulaire AnyDesk
    style: { left: '50%', top: 'calc(50% - 180px)' },
    floatDelay: '0s', floatDuration: '2.8s',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    label: 'Réseaux',
    tooltip: 'Voir les services →',
    color: '#00b4d8',
    glowColor: 'rgba(0,180,216,0.65)',
    tab: 'service',
    scrollTo: 'services',
    style: { left: 'calc(50% + 156px)', top: 'calc(50% - 90px)' },
    floatDelay: '0.5s', floatDuration: '3.0s',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
        <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
        <line x1="12" y1="20" x2="12.01" y2="20"/>
      </svg>
    ),
  },
  {
    label: 'Réparation',
    tooltip: 'Voir les services →',
    color: '#c9a227',
    glowColor: 'rgba(201,162,39,0.65)',
    tab: 'service',
    scrollTo: 'services',
    style: { left: 'calc(50% + 156px)', top: 'calc(50% + 90px)' },
    floatDelay: '1.0s', floatDuration: '2.6s',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    label: 'Formation',
    tooltip: 'Voir les formations →',
    color: '#8b5cf6',
    glowColor: 'rgba(139,92,246,0.65)',
    tab: 'training',
    scrollTo: 'services',
    style: { left: '50%', top: 'calc(50% + 180px)' },
    floatDelay: '1.5s', floatDuration: '3.2s',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    label: 'Média',
    tooltip: 'Voir l\'agence média →',
    color: '#ec4899',
    glowColor: 'rgba(236,72,153,0.65)',
    tab: 'media',
    scrollTo: 'services',
    style: { left: 'calc(50% - 156px)', top: 'calc(50% + 90px)' },
    floatDelay: '2.0s', floatDuration: '2.9s',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
  },
  {
    label: 'Meta Ads',
    tooltip: 'Voir les campagnes →',
    color: '#00b4d8',
    glowColor: 'rgba(0,180,216,0.65)',
    tab: 'media',
    scrollTo: 'services',
    style: { left: 'calc(50% - 156px)', top: 'calc(50% - 90px)' },
    floatDelay: '2.5s', floatDuration: '3.1s',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
]

/* ── CSS injecté une seule fois ─────────────────────── */
const CSS = `
  @keyframes omarOrbit    { to { transform: rotate(360deg);  } }
  @keyframes omarCounter  { to { transform: rotate(-360deg); } }
  @keyframes omarFloat    { 0%,100%{ transform:translateY(0);    }
                            50%    { transform:translateY(-10px); } }
  @keyframes omarGoldSpin { to { transform: rotate(360deg);  } }
  @keyframes omarRingPulse{ 0%,100%{opacity:.25;} 50%{opacity:.6;} }
  @keyframes omarGlow     { 0%,100%{opacity:.6;  transform:translate(-50%,-50%) scale(1);   }
                            50%    {opacity:1;    transform:translate(-50%,-50%) scale(1.12);} }
  @keyframes omarBounce   { 0%   {transform:scale(1);}
                            35%  {transform:scale(1.35);}
                            65%  {transform:scale(0.92);}
                            100% {transform:scale(1);} }
  @keyframes omarRipple   { 0%  {transform:scale(0);   opacity:.7;}
                            100%{transform:scale(2.8); opacity:0; } }

  /* Pause orbit on hover of whole system */
  .omar-orbit-system:hover .omar-orbit-container,
  .omar-orbit-system:hover .omar-counter { animation-play-state:paused!important; }
  .omar-orbit-system:hover .omar-float   { animation-play-state:running!important; }

  /* Base card transitions */
  .omar-icon-card {
    transition: transform .35s cubic-bezier(.34,1.56,.64,1),
                box-shadow .3s ease, border-color .3s ease;
    cursor: pointer;
    user-select: none;
  }
  .omar-icon-card:hover  { transform: scale(1.22)!important; }
  .omar-icon-card:active { transform: scale(0.96)!important; }

  /* Bounce on click */
  .omar-icon-card.omar-bouncing { animation: omarBounce .42s cubic-bezier(.36,.07,.19,.97) forwards; }

  /* Shine sweep on hover */
  .omar-icon-card::before {
    content:''; position:absolute; inset:-50%;
    background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.09) 50%,transparent 70%);
    transform:translateX(-100%) rotate(25deg);
    transition:transform .5s ease; pointer-events:none;
  }
  .omar-icon-card:hover::before { transform:translateX(100%) rotate(25deg); }

  /* Ripple on click */
  .omar-ripple {
    position:absolute; inset:0; border-radius:20px;
    background:radial-gradient(circle,rgba(255,255,255,.18) 0%,transparent 60%);
    animation: omarRipple .55s ease-out forwards;
    pointer-events:none;
  }

  /* Tooltip */
  .omar-tooltip {
    position:absolute; bottom:calc(100% + 10px); left:50%;
    transform:translateX(-50%) translateY(4px) scale(.88);
    background:rgba(8,20,45,.97); border:1px solid rgba(0,180,216,.55);
    color:rgba(255,255,255,.92); font-size:10px; font-weight:700;
    padding:5px 11px; border-radius:10px;
    white-space:nowrap; opacity:0; pointer-events:none;
    transition:opacity .22s, transform .22s;
    z-index:100;
  }
  .omar-icon-card:hover .omar-tooltip {
    opacity:1; transform:translateX(-50%) translateY(0) scale(1);
  }

  @media (prefers-reduced-motion:reduce){
    .omar-orbit-container,.omar-counter,.omar-float,
    .omar-gold-ring,.omar-ring,.omar-glow{ animation:none!important; }
  }
`

export default function OrbitSystem() {
  const [bouncingIdx, setBouncingIdx] = useState(null)
  const [rippleIdx,   setRippleIdx]   = useState(null)

  /* Inject CSS once */
  useEffect(() => {
    if (!document.getElementById('omar-orbit-css')) {
      const tag = document.createElement('style')
      tag.id    = 'omar-orbit-css'
      tag.textContent = CSS
      document.head.appendChild(tag)
    }
  }, [])

  /* ── Click handler ─────────────────────────────── */
  function handleServiceClick(svc, idx) {
    /* 1. Visual bounce + ripple */
    setBouncingIdx(idx)
    setRippleIdx(idx)
    setTimeout(() => setBouncingIdx(null), 450)
    setTimeout(() => setRippleIdx(null),   580)

    /* 2. Dispatch tab-change event (ServicesAndTraining listens) */
    window.dispatchEvent(
      new CustomEvent('omarServiceTab', { detail: { tab: svc.tab } })
    )

    /* 3. Smooth scroll after short delay (tab renders first) */
    setTimeout(() => {
      const el = document.getElementById(svc.scrollTo)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  const SIZE = 520
  const HALF = SIZE / 2

  return (
    <div
      className="omar-orbit-system"
      style={{ position:'relative', width:SIZE, height:SIZE, flexShrink:0, margin:'0 auto' }}
    >
      {/* Ambient glow */}
      <div className="omar-glow" style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:160, height:160, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(0,180,216,.18) 0%,transparent 70%)',
        animation:'omarGlow 3s ease-in-out infinite',
        pointerEvents:'none', zIndex:19,
      }}/>

      {/* Outer dashed ring */}
      <div className="omar-ring" style={{
        position:'absolute',
        top:HALF-180, left:HALF-180, width:360, height:360,
        borderRadius:'50%', border:'1px dashed rgba(0,180,216,.22)',
        pointerEvents:'none',
        animation:'omarRingPulse 5s ease-in-out infinite',
      }}/>
      {/* Inner ring */}
      <div style={{
        position:'absolute',
        top:HALF-105, left:HALF-105, width:210, height:210,
        borderRadius:'50%', border:'1px dashed rgba(0,180,216,.14)',
        pointerEvents:'none',
        animation:'omarRingPulse 5s ease-in-out infinite 2.5s',
      }}/>

      {/* ── Center logo ─────────────────────────── */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)', zIndex:20,
      }}>
        <div className="omar-gold-ring" style={{
          width:116, height:116, borderRadius:'50%',
          background:'conic-gradient(#7a5c0e 0%,#c9a227 12%,#f5e088 22%,#e8c84a 30%,#c9a227 40%,#a07d1c 50%,#c9a227 60%,#f5e088 70%,#c9a227 80%,#7a5c0e 90%,#c9a227 100%)',
          display:'flex', alignItems:'center', justifyContent:'center',
          animation:'omarGoldSpin 5s linear infinite',
          boxShadow:'0 0 28px rgba(201,162,39,.50), 0 0 60px rgba(201,162,39,.20)',
        }}>
          <div style={{
            width:102, height:102, borderRadius:'50%',
            background:'radial-gradient(ellipse at 35% 35%,#122040 0%,#0a1628 60%)',
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            gap:4,
            animation:'omarGoldSpin 5s linear infinite reverse',
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"  stroke="#00b4d8" strokeWidth="1.4"/>
              <line   x1="3"  y1="12" x2="21" y2="12" stroke="#00b4d8" strokeWidth="1.2"/>
              <path   d="M12 3a14 14 0 0 1 3.5 9A14 14 0 0 1 12 21A14 14 0 0 1 8.5 12A14 14 0 0 1 12 3z" stroke="#00b4d8" strokeWidth="1.2"/>
              <polyline points="14 7 18 7 18 11"   stroke="#c9a227" strokeWidth="1.8"/>
              <line     x1="18" y1="7" x2="12.5" y2="12.5" stroke="#c9a227" strokeWidth="1.8"/>
            </svg>
            <div style={{ lineHeight:1, fontSize:15, fontWeight:900, letterSpacing:'.5px' }}>
              <span style={{ color:'#fff' }}>Omar</span>
              <span style={{ color:'#c9a227' }}>Soft</span>
            </div>
            <div style={{ fontSize:7, color:'rgba(0,180,216,.85)', letterSpacing:'1.5px', fontWeight:700 }}>
              JLIDI
            </div>
          </div>
        </div>
      </div>

      {/* ── Orbit container ─────────────────────── */}
      <div
        className="omar-orbit-container"
        style={{
          position:'absolute', inset:0,
          animation:'omarOrbit 22s linear infinite',
        }}
      >
        {SERVICES.map((svc, i) => (
          <div key={i} style={{
            position:'absolute',
            ...svc.style,
            marginLeft:-45, marginTop:-45,
            width:90, height:90,
          }}>
            {/* Counter-rotation */}
            <div className="omar-counter" style={{
              width:'100%', height:'100%',
              display:'flex', alignItems:'center', justifyContent:'center',
              animation:'omarCounter 22s linear infinite',
            }}>
              {/* Float */}
              <div style={{
                width:90, height:90,
                animation:`omarFloat ${svc.floatDuration} ease-in-out infinite ${svc.floatDelay}`,
              }}>
                {/* Clickable icon card */}
                <div
                  role="button"
                  aria-label={svc.label}
                  tabIndex={0}
                  className={`omar-icon-card${bouncingIdx === i ? ' omar-bouncing' : ''}`}
                  onClick={() => handleServiceClick(svc, i)}
                  onKeyDown={(e) => e.key === 'Enter' && handleServiceClick(svc, i)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 6px 32px ${svc.glowColor}`
                    e.currentTarget.style.borderColor = svc.color
                    e.currentTarget.style.background = 'rgba(13,32,68,.96)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = 'rgba(0,180,216,.22)'
                    e.currentTarget.style.background = 'rgba(10,24,50,.90)'
                  }}
                  style={{
                    width:90, height:90, borderRadius:20,
                    background:'rgba(10,24,50,.90)',
                    border:'1px solid rgba(0,180,216,.22)',
                    display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center',
                    gap:7,
                    backdropFilter:'blur(8px)',
                    WebkitBackdropFilter:'blur(8px)',
                    position:'relative', overflow:'hidden',
                    outline:'none',
                  }}
                >
                  {/* Ripple effect on click */}
                  {rippleIdx === i && (
                    <div className="omar-ripple" style={{ borderRadius:20 }} />
                  )}

                  {/* Tooltip */}
                  <div className="omar-tooltip">{svc.tooltip}</div>

                  {/* Icon */}
                  <div style={{ color: svc.color }}>{svc.icon}</div>

                  {/* Label */}
                  <span style={{
                    fontSize:10.5, fontWeight:700,
                    color:'rgba(255,255,255,.85)',
                    textAlign:'center', lineHeight:1.2, letterSpacing:'.2px',
                    pointerEvents:'none',
                  }}>
                    {svc.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
