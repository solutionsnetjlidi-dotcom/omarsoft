/**
 * OrbitSystem.jsx
 * ─────────────────────────────────────────────────────
 * Composant orbit animé pour OmarSoft – HeroSection
 * 6 services tournent autour du logo central :
 *   • Orbite 22s, contre-rotation (labels lisibles)
 *   • Flottaison staggerée par carte
 *   • Zoom + glow coloré au survol
 *   • Logo central : anneau or tournant + globe SVG
 *   • Pause de l'orbite au survol du système entier
 * ─────────────────────────────────────────────────────
 */

import { useEffect, useRef } from 'react'

/* ── Données des services ──────────────────────────── */
const SERVICES = [
  {
    label: 'IT Support',
    color: '#00b4d8',
    glowColor: 'rgba(0,180,216,0.55)',
    // top (270°) : left=50%, top=50%-180px
    style: { left: '50%', top: 'calc(50% - 180px)' },
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    floatDelay: '0s',
    floatDuration: '2.8s',
  },
  {
    label: 'Réseaux',
    color: '#00b4d8',
    glowColor: 'rgba(0,180,216,0.55)',
    // top-right (330°) : left=50%+180*cos(-30°)=+155.88, top=50%-90
    style: { left: 'calc(50% + 156px)', top: 'calc(50% - 90px)' },
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
        <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
        <line x1="12" y1="20" x2="12.01" y2="20"/>
      </svg>
    ),
    floatDelay: '0.5s',
    floatDuration: '3.0s',
  },
  {
    label: 'Réparation',
    color: '#c9a227',
    glowColor: 'rgba(201,162,39,0.55)',
    // bottom-right (30°) : left=+156, top=+90
    style: { left: 'calc(50% + 156px)', top: 'calc(50% + 90px)' },
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    floatDelay: '1.0s',
    floatDuration: '2.6s',
  },
  {
    label: 'Formation',
    color: '#8b5cf6',
    glowColor: 'rgba(139,92,246,0.55)',
    // bottom (90°) : left=50%, top=+180
    style: { left: '50%', top: 'calc(50% + 180px)' },
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    floatDelay: '1.5s',
    floatDuration: '3.2s',
  },
  {
    label: 'Média',
    color: '#ec4899',
    glowColor: 'rgba(236,72,153,0.55)',
    // bottom-left (150°) : left=-156, top=+90
    style: { left: 'calc(50% - 156px)', top: 'calc(50% + 90px)' },
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
    floatDelay: '2.0s',
    floatDuration: '2.9s',
  },
  {
    label: 'Meta Ads',
    color: '#00b4d8',
    glowColor: 'rgba(0,180,216,0.55)',
    // top-left (210°) : left=-156, top=-90
    style: { left: 'calc(50% - 156px)', top: 'calc(50% - 90px)' },
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
    floatDelay: '2.5s',
    floatDuration: '3.1s',
  },
]

/* ── Styles injectés une seule fois ──────────────────── */
const CSS = `
  @keyframes omarOrbit    { to { transform: rotate(360deg);  } }
  @keyframes omarCounter  { to { transform: rotate(-360deg); } }
  @keyframes omarFloat    { 0%,100% { transform: translateY(0);     }
                            50%     { transform: translateY(-10px);  } }
  @keyframes omarGoldSpin { to { transform: rotate(360deg);  } }
  @keyframes omarGoldRev  { to { transform: rotate(-360deg); } }
  @keyframes omarRingPulse{ 0%,100%{opacity:.25;} 50%{opacity:.6;} }
  @keyframes omarGlow     { 0%,100%{opacity:.6;transform:translate(-50%,-50%) scale(1);}
                            50%    {opacity:1;  transform:translate(-50%,-50%) scale(1.12);} }

  .omar-orbit-system:hover .omar-orbit-container,
  .omar-orbit-system:hover .omar-counter             { animation-play-state: paused !important; }
  .omar-orbit-system:hover .omar-float               { animation-play-state: running !important; }

  .omar-icon-card { transition: transform .35s cubic-bezier(.34,1.56,.64,1),
                                box-shadow .3s ease, border-color .3s ease; }
  .omar-icon-card:hover { transform: scale(1.22) !important; }

  /* Card shine on hover */
  .omar-icon-card::before {
    content:''; position:absolute; inset:-50%;
    background: linear-gradient(120deg,transparent 30%,rgba(255,255,255,.08) 50%,transparent 70%);
    transform: translateX(-100%) rotate(25deg);
    transition: transform .5s ease; pointer-events:none;
  }
  .omar-icon-card:hover::before { transform: translateX(100%) rotate(25deg); }

  @media (prefers-reduced-motion: reduce) {
    .omar-orbit-container, .omar-counter, .omar-float,
    .omar-gold-ring, .omar-gold-rev, .omar-ring, .omar-glow {
      animation: none !important;
    }
  }
`

export default function OrbitSystem() {
  const styleRef = useRef(null)

  useEffect(() => {
    if (!document.getElementById('omar-orbit-css')) {
      const tag = document.createElement('style')
      tag.id = 'omar-orbit-css'
      tag.textContent = CSS
      document.head.appendChild(tag)
    }
    return () => {} // keep css between remounts
  }, [])

  const SIZE = 520   // container px
  const HALF = SIZE / 2

  return (
    <div
      className="omar-orbit-system"
      style={{
        position: 'relative',
        width: SIZE,
        height: SIZE,
        flexShrink: 0,
        margin: '0 auto',
      }}
    >
      {/* ── Glow behind center ──────────────────── */}
      <div
        className="omar-glow"
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 160, height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(0,180,216,.18) 0%,transparent 70%)',
          animation: 'omarGlow 3s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 19,
        }}
      />

      {/* ── Dashed orbit ring ───────────────────── */}
      <div
        className="omar-ring"
        style={{
          position: 'absolute',
          top: HALF - 180, left: HALF - 180,
          width: 360, height: 360,
          borderRadius: '50%',
          border: '1px dashed rgba(0,180,216,.22)',
          pointerEvents: 'none',
          animation: 'omarRingPulse 5s ease-in-out infinite',
        }}
      />
      {/* Inner ring */}
      <div
        style={{
          position: 'absolute',
          top: HALF - 105, left: HALF - 105,
          width: 210, height: 210,
          borderRadius: '50%',
          border: '1px dashed rgba(0,180,216,.14)',
          pointerEvents: 'none',
          animation: 'omarRingPulse 5s ease-in-out infinite 2.5s',
        }}
      />

      {/* ── Center logo ─────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 20,
        }}
      >
        {/* Gold ring — rotates */}
        <div
          className="omar-gold-ring"
          style={{
            width: 116, height: 116,
            borderRadius: '50%',
            background: 'conic-gradient(#7a5c0e 0%,#c9a227 12%,#f5e088 22%,#e8c84a 30%,#c9a227 40%,#a07d1c 50%,#c9a227 60%,#f5e088 70%,#c9a227 80%,#7a5c0e 90%,#c9a227 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'omarGoldSpin 5s linear infinite',
            boxShadow: '0 0 28px rgba(201,162,39,.50), 0 0 60px rgba(201,162,39,.20)',
          }}
        >
          {/* Inner disc — counter-rotates */}
          <div
            className="omar-gold-rev"
            style={{
              width: 102, height: 102,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at 35% 35%, #122040 0%, #0a1628 60%)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 4,
              animation: 'omarGoldSpin 5s linear infinite reverse',
            }}
          >
            {/* Globe + arrow icon */}
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"  stroke="#00b4d8" strokeWidth="1.4"/>
              <line   x1="3"  y1="12" x2="21" y2="12" stroke="#00b4d8" strokeWidth="1.2"/>
              <path   d="M12 3a14 14 0 0 1 3.5 9A14 14 0 0 1 12 21A14 14 0 0 1 8.5 12A14 14 0 0 1 12 3z"
                      stroke="#00b4d8" strokeWidth="1.2"/>
              <polyline points="14 7 18 7 18 11" stroke="#c9a227" strokeWidth="1.8"/>
              <line   x1="18" y1="7" x2="12.5" y2="12.5" stroke="#c9a227" strokeWidth="1.8"/>
            </svg>

            <div style={{ lineHeight: 1, fontSize: 15, fontWeight: 900, letterSpacing: '.5px' }}>
              <span style={{ color: '#fff' }}>Omar</span>
              <span style={{ color: '#c9a227' }}>Soft</span>
            </div>
            <div style={{ fontSize: 7, color: 'rgba(0,180,216,.85)', letterSpacing: '1.5px', fontWeight: 700 }}>
              JLIDI
            </div>
          </div>
        </div>
      </div>

      {/* ── Orbit container (spins) ──────────────── */}
      <div
        className="omar-orbit-container"
        style={{
          position: 'absolute',
          inset: 0,
          animation: 'omarOrbit 22s linear infinite',
        }}
      >
        {SERVICES.map((svc, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...svc.style,
              marginLeft: -45,
              marginTop: -45,
              width: 90,
              height: 90,
            }}
          >
            {/* Counter-rotation */}
            <div
              className="omar-counter"
              style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'omarCounter 22s linear infinite',
              }}
            >
              {/* Float wrapper */}
              <div
                className="omar-float"
                style={{
                  width: 90, height: 90,
                  animation: `omarFloat ${svc.floatDuration} ease-in-out infinite ${svc.floatDelay}`,
                }}
              >
                {/* Icon card */}
                <div
                  className="omar-icon-card"
                  title={svc.label}
                  style={{
                    width: 90, height: 90,
                    borderRadius: 20,
                    background: 'rgba(10,24,50,.90)',
                    border: '1px solid rgba(0,180,216,.22)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 7,
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    position: 'relative',
                    overflow: 'hidden',
                    '--hover-glow': svc.glowColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 6px 32px ${svc.glowColor}`
                    e.currentTarget.style.borderColor = svc.color
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = 'rgba(0,180,216,.22)'
                  }}
                >
                  <div style={{ color: svc.color }}>{svc.icon}</div>
                  <span style={{
                    fontSize: 10.5, fontWeight: 700,
                    color: 'rgba(255,255,255,.85)',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    letterSpacing: '.2px',
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
