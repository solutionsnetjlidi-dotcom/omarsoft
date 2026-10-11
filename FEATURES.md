# 🚀 OmarSoft — 6 Nouvelles Fonctionnalités v2.0

## 📋 Fichiers à copier dans ton projet

### Nouveaux fichiers (à CRÉER)
```
src/components/WhatsAppFloat.jsx      → Bouton WhatsApp flottant
src/components/QuoteCart.jsx          → Panier devis slide-in
src/context/ThemeContext.jsx          → Dark / Light mode
src/context/CartContext.jsx           → Etat du panier
src/utils/notifications.js            → Alertes navigateur
```

### Fichiers mis à jour (à REMPLACER)
```
src/components/Navbar.jsx             → + Toggle dark mode + drapeaux
src/components/HeroSection.jsx        → + Grille mobile services
src/components/ProductsCatalog.jsx    → + Bouton "Ajouter au devis"
src/components/AdminLayout.jsx        → + Badge demandes + alertes
src/pages/Admin/Dashboard.jsx         → + Graphiques recharts
src/pages/Home.jsx                    → + WhatsAppFloat + QuoteCart
src/App.jsx                           → + ThemeProvider + CartProvider
tailwind.config.js                    → + darkMode: 'class'
package.json                          → + recharts ^2.12.0
```

---

## 🔧 Installation après copie des fichiers

```powershell
# Dans ton dossier projet
npm install

# Lance le dev server
npm run dev
```

---

## ✅ Récapitulatif des 6 fonctionnalités

### 💬 1. WhatsApp Float
- Bouton vert fixe bas-droite (bas-gauche en arabe RTL)
- 3 messages rapides : Assistance AnyDesk · Devis · Réparation
- Animation bounce · Masqué sur les pages /admin
- S'adapte à la langue active (FR/AR/EN)

### 📱 2. Orbit mobile
- Sur téléphone : grille 3×2 icônes émoji remplace l'orbit
- Clic → scroll vers la section + activation de l'onglet
- Même comportement que l'orbit desktop

### 🌙 3. Dark / Light mode
- Toggle dans la sidebar (icône 🌙/☀️)
- Persiste dans localStorage
- Suit la préférence système par défaut
- Tailwind `dark:` appliqué sur Produits + Hero

### 🛒 4. Panier devis
- Bouton ⚫ fixe bas-droite avec badge compteur doré
- Drawer slide-in : articles, quantités +/-, total TND
- "Envoyer via WhatsApp" → message formaté avec liste
- "Créer un devis officiel" → pré-remplit /admin/documents

### 📊 5. Dashboard charts (recharts)
- AreaChart demandes sur 7 jours (temps réel Supabase)
- BarChart produits par catégorie
- Stats cards avec indicateurs contextuels
- Auto-refresh sur nouvelle demande

### 🔔 6. Notifications admin
- Supabase Realtime → détecte les nouvelles demandes
- Notification navigateur (si permission accordée)
- Toast in-app si permission refusée
- Badge rouge sur "Demandes" dans la sidebar
- Bouton "Activer les alertes" dans la sidebar admin
