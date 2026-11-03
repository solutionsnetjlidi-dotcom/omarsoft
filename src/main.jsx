import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { supabaseReady } from './lib/supabaseClient'
import './index.css'

function MissingConfig() {
  const box = { maxWidth: 560, margin: '12vh auto', padding: 28, background: '#fff', borderRadius: 16, fontFamily: 'system-ui,sans-serif', color: '#0f172a', lineHeight: 1.6 }
  return (
    <div style={{ minHeight: '100vh', background: '#0a1628', padding: 16 }}>
      <div style={box}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Configuration manquante</h1>
        <p>Les clés Supabase ne sont pas définies. Ajoutez ces deux variables :</p>
        <ul style={{ margin: '12px 0 12px 20px' }}>
          <li><code>VITE_SUPABASE_URL</code></li>
          <li><code>VITE_SUPABASE_ANON_KEY</code></li>
        </ul>
        <p><b>En local :</b> fichier <code>.env.local</code>. <b>Sur Vercel :</b> Settings, Environment Variables, puis Redeploy.</p>
        <p style={{ marginTop: 10, color: '#64748b', fontSize: 14 }}>Voir le guide d’installation, étape « Variables d’environnement ».</p>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{supabaseReady ? <App /> : <MissingConfig />}</React.StrictMode>
)
