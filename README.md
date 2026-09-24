# OMARSOFT – Jlidi Network Solutions
### Site web officiel + Back-Office Admin
**Stack :** React (Vite) · Tailwind CSS · Supabase · Vercel

---

## 🚀 Démarrage rapide

### 1. Prérequis
- Node.js 18+
- Un projet Supabase gratuit → [supabase.com](https://supabase.com)
- Un compte Vercel (déploiement) → [vercel.com](https://vercel.com)

### 2. Installation locale

```bash
# Cloner ou extraire le projet
cd omarsoft-website

# Installer les dépendances
npm install

# Copier le fichier de config
cp .env.example .env.local
```

Ouvrez `.env.local` et remplissez vos valeurs :

```env
VITE_SUPABASE_URL=https://XXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
VITE_COMPANY_WHATSAPP=+21698XXXXXXX
VITE_COMPANY_EMAIL=contact@omarsoft.tn
VITE_COMPANY_PHONE=+216 98 XXX XXX
VITE_ANYDESK_ID=XXXXXXXXX
VITE_EUR_RATE=0.30
VITE_USD_RATE=0.32
```

### 3. Configurer Supabase

**a) Créer les tables**
- Allez dans votre projet Supabase → **SQL Editor**
- Collez et exécutez le contenu de `supabase/schema.sql`

**b) Créer les buckets Storage**
- Allez dans **Storage** → **New bucket**
- Créez ces 3 buckets (tous en **Public**) :
  - `products-images` (max 5 MB)
  - `media-gallery` (max 50 MB)
  - `company-assets` (max 10 MB)

**c) Créer le compte administrateur**
- Allez dans **Authentication** → **Users** → **Invite user**
- Entrez votre email admin
- Définissez un mot de passe depuis le lien reçu par email
- Ce compte sera utilisé pour accéder à `/admin`

### 4. Lancer en développement

```bash
npm run dev
# → http://localhost:3000
```

---

## 📁 Structure du projet

```
omarsoft-website/
├── supabase/
│   └── schema.sql              ← Schéma BDD complet
├── src/
│   ├── App.jsx                 ← Routage principal
│   ├── main.jsx                ← Point d'entrée React
│   ├── index.css               ← Styles globaux + print
│   ├── lib/
│   │   └── supabaseClient.js   ← Client Supabase + helpers storage
│   ├── utils/
│   │   ├── currencyFormatter.js ← Formatage multi-devises
│   │   └── config.js           ← Constantes + helpers WhatsApp/email
│   ├── context/
│   │   ├── AuthContext.jsx     ← Authentification Supabase
│   │   └── LanguageContext.jsx ← Langue active + t() + RTL
│   ├── i18n/
│   │   └── translations.js     ← Dictionnaire FR / AR / EN
│   ├── components/
│   │   ├── Navbar.jsx          ← Navigation publique trilingue
│   │   ├── HeroSection.jsx     ← Hero avec stats animées
│   │   ├── ProductsCatalog.jsx ← Catalogue produits + filtres
│   │   ├── ServicesAndTraining.jsx ← Services + formulaire AnyDesk
│   │   ├── MediaGallery.jsx    ← Galerie photos/vidéos + lightbox
│   │   ├── Footer.jsx          ← Pied de page + formulaire de contact
│   │   ├── AdminLayout.jsx     ← Sidebar admin partagée
│   │   ├── PrintDocument.jsx   ← Template A4 imprimable
│   │   └── PrivateRoute.jsx    ← Protection des routes admin
│   └── pages/
│       ├── Home.jsx            ← Page publique (assemble les sections)
│       └── Admin/
│           ├── Login.jsx       ← Page de connexion admin
│           ├── Dashboard.jsx   ← Tableau de bord + stats
│           ├── ManageProducts.jsx ← CRUD produits + upload images
│           ├── ManageServices.jsx ← CRUD services/formations/média
│           ├── ManageMedia.jsx    ← Upload et gestion galerie
│           ├── DocumentGenerator.jsx ← Générateur devis/factures
│           ├── ManageRequests.jsx ← Gestion demandes clients
│           └── Settings.jsx    ← Paramètres entreprise
└── README.md
```

---

## 🌍 Multilingue & Devises

| Langue | Direction | Devise affichée |
|--------|-----------|-----------------|
| 🇫🇷 Français | LTR | TND + € en double (ex: `2 800 TND (~840 €)`) |
| 🇸🇦 Arabe   | **RTL** | Dinar uniquement (ex: `2 800 د.ت`) |
| 🇬🇧 Anglais | LTR | Dollar US (ex: `$ 896`) |

Les prix en base de données sont **toujours stockés en TND**.
La conversion est calculée à la volée via les taux dans `.env` ou dans **Paramètres** (admin).

---

## 📄 Génération de documents

Accessible via **Admin → Documents** :

| Type | Préfixe | Exemple |
|------|---------|---------|
| Devis | `DEV` | `DEV-2024-0001` |
| Facture | `FAC` | `FAC-2024-0001` |
| Bon de commande | `BC` | `BC-2024-0001` |
| Bon de livraison | `BL` | `BL-2024-0001` |

**Flux de création :**
1. Choisir le type de document
2. Renseigner les infos client
3. Ajouter les lignes articles/services
4. Sélectionner la devise d'affichage et le taux TVA
5. **Aperçu** → impression directe ou **Exporter en PDF** (via `Ctrl+P` → Enregistrer en PDF)
6. **Enregistrer** → sauvegarde dans Supabase

---

## 🔐 Accès Admin

| URL | Description |
|-----|-------------|
| `/` | Site public |
| `/admin/login` | Connexion Back-Office |
| `/admin` | Tableau de bord |
| `/admin/products` | Gestion produits |
| `/admin/services` | Gestion services & formations |
| `/admin/media` | Galerie médias |
| `/admin/documents` | Générateur de documents |
| `/admin/requests` | Demandes clients |
| `/admin/settings` | Paramètres entreprise |

---

## 🚀 Déploiement sur Vercel

### Option A – Via l'interface Vercel (recommandé)

1. **Push sur GitHub** :
   ```bash
   git init && git add . && git commit -m "initial"
   git remote add origin https://github.com/VOTRE_USER/omarsoft-website.git
   git push -u origin main
   ```
2. Sur [vercel.com](https://vercel.com) → **New Project** → Importez le dépôt
3. Framework : **Vite** (détecté automatiquement)
4. Ajoutez les **Environment Variables** (mêmes que `.env.local`)
5. **Deploy** 🎉

### Option B – Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🛠️ Personnalisation rapide

### Changer les couleurs
Éditez `tailwind.config.js` → section `colors` :
```js
ocean: {
  DEFAULT: '#00b4d8',   // ← Couleur principale (liens, boutons)
},
amber: {
  brand: '#f5a623',     // ← Couleur des boutons CTA
},
midnight: {
  DEFAULT: '#0d0d2b',   // ← Fond sombre (hero, sidebar)
},
```

### Remplacer le logo
Dans `src/components/Navbar.jsx` et `src/components/PrintDocument.jsx`,
remplacez le bloc SVG/texte par :
```jsx
<img src="/logo.png" alt="OMARSOFT" className="h-10" />
```
Placez `logo.png` dans le dossier `/public`.

### Ajouter un logo sur les documents imprimables
Dans `src/components/PrintDocument.jsx`, remplacez le bloc « Logo / Brand » par :
```jsx
<img
  src="/logo.png"
  alt="OMARSOFT"
  style={{ height: '50px', objectFit: 'contain' }}
/>
```

### Modifier les taux de TVA disponibles
Dans `src/pages/Admin/DocumentGenerator.jsx` :
```js
const TAX_RATES = [0, 7, 13, 19]   // ← ajoutez vos taux ici
```

---

## 📦 Tables Supabase créées

| Table | Description |
|-------|-------------|
| `products` | Catalogue matériel (prix, stock, images, visibilité) |
| `services` | Services, formations et agence média |
| `service_requests` | Demandes AnyDesk, devis, formations, contact |
| `invoices_and_quotes` | Tous les documents commerciaux générés |
| `media_content` | Galerie photos et vidéos |
| `company_settings` | Paramètres de l'entreprise (clé-valeur) |

---

## 🔒 Sécurité (RLS)

- **Lecture publique** : uniquement les éléments `is_visible = true`
- **Écriture** : réservée aux utilisateurs authentifiés (admin uniquement)
- **Demandes clients** : insertion publique autorisée (formulaires du site)
- **Stockage** : images lisibles publiquement, upload réservé à l'admin

---

## 📞 Support

**Omar Jlidi — OMARSOFT**
- WhatsApp : configuré dans `.env.local`
- Email : configuré dans `.env.local`
- Adresse : Djerba Midoun, Médenine, Tunisie
- RC : C20215152024 · MF : 1877339 E/M
