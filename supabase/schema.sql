-- ================================================================
-- OMARSOFT – Jlidi Network Solutions
-- Schéma Supabase complet
-- ================================================================
-- INSTRUCTIONS:
-- 1. Allez dans votre projet Supabase > SQL Editor
-- 2. Collez ce script et exécutez-le
-- 3. Créez les buckets Storage : products-images, media-gallery, company-assets
-- ================================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────
-- TABLE : products (Catalogue matériel informatique)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_fr       TEXT NOT NULL,
    name_ar       TEXT,
    name_en       TEXT,
    description_fr TEXT,
    description_ar TEXT,
    description_en TEXT,
    price_tnd     DECIMAL(10,2) NOT NULL DEFAULT 0,
    category      TEXT NOT NULL DEFAULT 'general',
    image_url     TEXT,
    stock_quantity INTEGER DEFAULT 0,
    is_visible    BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────
-- TABLE : services (Prestations + Formations + Agence Média)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_fr       TEXT NOT NULL,
    name_ar       TEXT,
    name_en       TEXT,
    description_fr TEXT,
    description_ar TEXT,
    description_en TEXT,
    price_tnd     DECIMAL(10,2),
    price_type    TEXT DEFAULT 'fixed',   -- 'fixed' | 'per_hour' | 'custom' | 'free'
    icon_name     TEXT DEFAULT 'Wrench',  -- Nom de l'icône Lucide React
    category      TEXT DEFAULT 'service', -- 'service' | 'training' | 'media'
    duration      TEXT,
    features_fr   TEXT[],                 -- Liste des fonctionnalités (tableau)
    features_ar   TEXT[],
    features_en   TEXT[],
    is_visible    BOOLEAN DEFAULT true,
    sort_order    INTEGER DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────
-- TABLE : service_requests (Demandes clients)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_requests (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_type      TEXT NOT NULL, -- 'anydesk' | 'quote' | 'training' | 'contact'
    client_name       TEXT NOT NULL,
    client_email      TEXT,
    client_phone      TEXT,
    anydesk_id        TEXT,
    message           TEXT,
    requested_service TEXT,
    status            TEXT DEFAULT 'pending', -- 'pending' | 'in_progress' | 'completed' | 'cancelled'
    admin_notes       TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────
-- TABLE : invoices_and_quotes (Documents commerciaux)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices_and_quotes (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type     TEXT NOT NULL,  -- 'quote' | 'invoice' | 'purchase_order' | 'delivery_note'
    document_number   TEXT NOT NULL UNIQUE,
    client_name       TEXT NOT NULL,
    client_address    TEXT,
    client_email      TEXT,
    client_phone      TEXT,
    client_tax_id     TEXT,
    items             JSONB NOT NULL DEFAULT '[]',
    -- items format: [{ description, quantity, unit_price_tnd, total_tnd }]
    subtotal_tnd      DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate          DECIMAL(5,2) DEFAULT 19.00,
    tax_amount_tnd    DECIMAL(10,2) DEFAULT 0,
    total_tnd         DECIMAL(10,2) NOT NULL DEFAULT 0,
    display_currency  TEXT DEFAULT 'TND',       -- 'TND' | 'EUR' | 'USD'
    exchange_rate_eur DECIMAL(10,4) DEFAULT 0.30,
    exchange_rate_usd DECIMAL(10,4) DEFAULT 0.32,
    language          TEXT DEFAULT 'fr',        -- 'fr' | 'ar' | 'en'
    notes             TEXT,
    payment_terms     TEXT DEFAULT 'Paiement à 30 jours',
    status            TEXT DEFAULT 'draft', -- 'draft' | 'sent' | 'accepted' | 'paid' | 'cancelled'
    issued_date       DATE DEFAULT CURRENT_DATE,
    due_date          DATE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────
-- TABLE : media_content (Galerie photos/vidéos)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_content (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_fr      TEXT,
    title_ar      TEXT,
    title_en      TEXT,
    description_fr TEXT,
    file_url      TEXT NOT NULL,
    file_type     TEXT NOT NULL, -- 'image' | 'video'
    thumbnail_url TEXT,
    category      TEXT DEFAULT 'general',
    is_visible    BOOLEAN DEFAULT true,
    sort_order    INTEGER DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────
-- TABLE : company_settings (Paramètres de l'entreprise)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_settings (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key        TEXT UNIQUE NOT NULL,
    value      TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────
-- FUNCTION : auto-update updated_at
-- ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_requests_updated_at
    BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_invoices_updated_at
    BEFORE UPDATE ON invoices_and_quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────
-- FUNCTION : génération numéro de document
-- ────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS doc_number_seq START WITH 1001;

CREATE OR REPLACE FUNCTION generate_document_number(doc_type TEXT)
RETURNS TEXT AS $$
DECLARE
    prefix   TEXT;
    year_str TEXT;
    seq_val  BIGINT;
BEGIN
    year_str := TO_CHAR(NOW(), 'YYYY');
    prefix := CASE doc_type
        WHEN 'quote'          THEN 'DEV'
        WHEN 'invoice'        THEN 'FAC'
        WHEN 'purchase_order' THEN 'BC'
        WHEN 'delivery_note'  THEN 'BL'
        ELSE 'DOC'
    END;
    seq_val := nextval('doc_number_seq');
    RETURN prefix || '-' || year_str || '-' || LPAD(seq_val::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────
-- RLS – Row Level Security
-- ────────────────────────────────────────────────
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE services           ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_and_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_content      ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings   ENABLE ROW LEVEL SECURITY;

-- Public : lecture des éléments visibles
CREATE POLICY "public_read_visible_products" ON products
    FOR SELECT USING (is_visible = true);

CREATE POLICY "public_read_visible_services" ON services
    FOR SELECT USING (is_visible = true);

CREATE POLICY "public_read_visible_media" ON media_content
    FOR SELECT USING (is_visible = true);

CREATE POLICY "public_read_settings" ON company_settings
    FOR SELECT USING (true);

-- Public : peut soumettre une demande
CREATE POLICY "public_insert_requests" ON service_requests
    FOR INSERT WITH CHECK (true);

-- Admin (authenticated) : accès total
CREATE POLICY "admin_all_products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "admin_all_services" ON services
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "admin_all_requests" ON service_requests
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "admin_all_invoices" ON invoices_and_quotes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "admin_all_media" ON media_content
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "admin_all_settings" ON company_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────────
-- DONNÉES PAR DÉFAUT : Paramètres de l'entreprise
-- ────────────────────────────────────────────────
INSERT INTO company_settings (key, value) VALUES
    ('company_name',          'STE Jlidi Network Solutions'),
    ('company_brand',         'OMARSOFT'),
    ('company_name_ar',       'شركة جليدي للشبكات والحلول الرقمية'),
    ('company_tagline_fr',    'Votre partenaire IT & Multimédia à Djerba'),
    ('company_tagline_ar',    'شريكك الرقمي في جربة'),
    ('company_tagline_en',    'Your IT & Media Partner in Djerba'),
    ('company_address',       'Djerba Midoun, Médenine, Tunisie'),
    ('company_phone',         '+216 98 XXX XXX'),
    ('company_whatsapp',      '+21698XXXXXXX'),
    ('company_email',         'contact@omarsoft.tn'),
    ('company_rc',            'C20215152024'),
    ('company_mf',            '1877339 E/M'),
    ('exchange_rate_eur',     '0.30'),
    ('exchange_rate_usd',     '0.32'),
    ('tva_rate',              '19'),
    ('anydesk_id',            'XXXXXXXXX')
ON CONFLICT (key) DO NOTHING;

-- ────────────────────────────────────────────────
-- DONNÉES EXEMPLES : Produits
-- ────────────────────────────────────────────────
INSERT INTO products (name_fr, name_ar, name_en, description_fr, description_ar, description_en, price_tnd, category, stock_quantity, is_visible) VALUES
(
    'Ordinateur Portable Dell Inspiron 15',
    'لابتوب ديل إنسبيرون 15',
    'Dell Inspiron 15 Laptop',
    'Intel Core i5 12ème génération, 8 Go RAM, 512 Go SSD NVMe, Écran 15.6" FHD, Windows 11 Pro',
    'معالج إنتل كور آي5 الجيل الثاني عشر، 8 جيجابايت رام، 512 جيجابايت SSD، شاشة 15.6 بوصة FHD، ويندوز 11 برو',
    'Intel Core i5 12th Gen, 8GB RAM, 512GB NVMe SSD, 15.6" FHD Display, Windows 11 Pro',
    2800.00, 'ordinateurs', 5, true
),
(
    'Switch HP 24 Ports PoE+',
    'سويتش HP 24 منفذ PoE+',
    'HP 24-Port PoE+ Switch',
    'Switch réseau manageable 24 ports Gigabit PoE+ 370W, idéal vidéosurveillance IP et téléphonie VoIP',
    'سويتش شبكة 24 منفذ جيجابايت PoE+ مُدار بطاقة 370 واط، مثالي لكاميرات المراقبة IP والهاتف VoIP',
    '24-Port Gigabit managed PoE+ switch 370W, ideal for IP surveillance and VoIP',
    1200.00, 'reseaux', 3, true
),
(
    'Imprimante HP LaserJet Pro M404dn',
    'طابعة HP ليزرجيت برو M404dn',
    'HP LaserJet Pro M404dn Printer',
    'Imprimante laser monochrome réseau, 40 ppm, impression recto-verso automatique, compatible avec tous OS',
    'طابعة ليزر أبيض وأسود شبكية، 40 صفحة/دقيقة، طباعة وجهين تلقائية',
    'Monochrome network laser printer, 40 ppm, automatic duplex, compatible with all OS',
    650.00, 'imprimantes', 8, true
),
(
    'Caméra IP Hikvision 4MP',
    'كاميرا IP هيكفيجن 4 ميجابكسل',
    'Hikvision 4MP IP Camera',
    'Caméra dôme IP 4 Mégapixels H.265+, vision nocturne IR 30m, PoE, étanche IP67',
    'كاميرا قبة IP بدقة 4 ميجابكسل H.265+، رؤية ليلية IR 30 متر، PoE، مقاومة للماء IP67',
    '4MP H.265+ dome IP camera, 30m IR night vision, PoE, IP67 weatherproof',
    320.00, 'surveillance', 12, true
),
(
    'Routeur Wi-Fi 6 TP-Link AX3000',
    'راوتر Wi-Fi 6 TP-Link AX3000',
    'TP-Link AX3000 Wi-Fi 6 Router',
    'Routeur Wi-Fi 6 double bande AX3000, technologie OFDMA et MU-MIMO, couverture jusqu''à 230 m²',
    'راوتر Wi-Fi 6 ثنائي النطاق AX3000 بتقنية OFDMA و MU-MIMO، تغطية حتى 230 متر مربع',
    'AX3000 dual-band Wi-Fi 6 router, OFDMA & MU-MIMO technology, coverage up to 230 m²',
    450.00, 'reseaux', 6, true
),
(
    'SSD Samsung 870 EVO 1To',
    'قرص صلب SSD سامسونج 870 EVO 1 تيرابايت',
    'Samsung 870 EVO 1TB SSD',
    'Disque dur SSD SATA 2.5" 1 To, vitesse lecture 560 Mo/s, écriture 530 Mo/s, garantie 5 ans',
    'قرص صلب SSD سعة 1 تيرابايت، سرعة قراءة 560 ميجابايت/ثانية، كتابة 530 ميجابايت/ثانية، ضمان 5 سنوات',
    '1TB 2.5" SATA SSD, read 560 MB/s, write 530 MB/s, 5-year warranty',
    380.00, 'composants', 15, true
);

-- ────────────────────────────────────────────────
-- DONNÉES EXEMPLES : Services & Formations & Média
-- ────────────────────────────────────────────────
INSERT INTO services (name_fr, name_ar, name_en, description_fr, description_ar, description_en, price_tnd, price_type, icon_name, category, duration, features_fr, features_en, features_ar, is_visible, sort_order) VALUES
(
    'Diagnostic & Réparation PC',
    'تشخيص وإصلاح الكمبيوتر',
    'PC Diagnosis & Repair',
    'Diagnostic complet et réparation matérielle/logicielle pour PC fixes et portables. Remplacement de composants, réinstallation OS, nettoyage interne.',
    'تشخيص شامل وإصلاح الأعطال المادية والبرمجية لأجهزة الكمبيوتر المكتبية والمحمولة.',
    'Complete diagnosis and hardware/software repair for desktops and laptops.',
    80.00, 'fixed', 'Wrench', 'service', '1–4 heures',
    ARRAY['Diagnostic matériel complet', 'Réparation pannes matérielles', 'Réinstallation Windows', 'Nettoyage et optimisation', 'Récupération de données'],
    ARRAY['Full hardware diagnosis', 'Hardware failure repair', 'Windows reinstallation', 'Cleaning and optimization', 'Data recovery'],
    ARRAY['تشخيص الأجهزة', 'إصلاح الأعطال المادية', 'إعادة تثبيت ويندوز', 'التنظيف والتحسين', 'استرداد البيانات'],
    true, 1
),
(
    'Assistance à Distance',
    'دعم تقني عن بُعد',
    'Remote Technical Support',
    'Prise en main à distance via AnyDesk, RustDesk ou TeamViewer. Résolution rapide de problèmes logiciels, configuration, virus, lenteur.',
    'دعم تقني فوري عبر AnyDesk أو RustDesk أو TeamViewer لحل المشاكل البرمجية وإزالة الفيروسات.',
    'Remote desktop support via AnyDesk, RustDesk or TeamViewer for quick software issue resolution.',
    30.00, 'per_hour', 'Monitor', 'service', '30 min – 2h',
    ARRAY['Connexion sécurisée AnyDesk/TeamViewer', 'Suppression virus & malwares', 'Configuration logiciels', 'Support immédiat (pas de déplacement)', 'Rapport après intervention'],
    ARRAY['Secure AnyDesk/TeamViewer connection', 'Virus & malware removal', 'Software configuration', 'Immediate support (no travel)', 'Post-intervention report'],
    ARRAY['اتصال آمن عبر AnyDesk', 'إزالة الفيروسات والبرامج الضارة', 'إعداد البرامج', 'دعم فوري بدون تنقل', 'تقرير بعد التدخل'],
    true, 2
),
(
    'Installation Réseau Wi-Fi & Fibre',
    'تركيب شبكة Wi-Fi والألياف البصرية',
    'Wi-Fi & Fiber Network Installation',
    'Installation, câblage et configuration de réseaux Wi-Fi, LAN, fibre optique et systèmes de vidéosurveillance IP pour domiciles et entreprises.',
    'تركيب وتوصيل وإعداد شبكات Wi-Fi والكيبل والألياف البصرية وأنظمة المراقبة بالكاميرات للمنازل والشركات.',
    'Installation, cabling and configuration of Wi-Fi, LAN, fiber optic networks and IP surveillance for homes and businesses.',
    150.00, 'fixed', 'Wifi', 'service', 'Demi-journée',
    ARRAY['Audit réseau & recommandations', 'Câblage RJ45 / fibre optique', 'Configuration routeurs & switches', 'Installation caméras IP PoE', 'Test & certification du réseau'],
    ARRAY['Network audit & recommendations', 'RJ45 / fiber optic cabling', 'Router & switch configuration', 'PoE IP camera installation', 'Network testing & certification'],
    ARRAY['تدقيق الشبكة والتوصيات', 'توصيل كابلات RJ45 / ألياف بصرية', 'إعداد الراوترات والسويتش', 'تركيب كاميرات IP PoE', 'اختبار وتوثيق الشبكة'],
    true, 3
),
(
    'Formation Bureautique Word/Excel/Outlook',
    'تدريب على Office: Word وExcel وOutlook',
    'Office Suite Training: Word, Excel & Outlook',
    'Formation pratique et interactive sur Microsoft Word, Excel et Outlook pour débutants et intermédiaires. Sessions individuelles ou en groupe (max 8 personnes).',
    'تدريب عملي وتفاعلي على Microsoft Word وExcel وOutlook للمبتدئين والمتوسطين. جلسات فردية أو جماعية (حد أقصى 8 أشخاص).',
    'Hands-on interactive training on Microsoft Word, Excel and Outlook for beginners and intermediates. Individual or group sessions (max 8 people).',
    200.00, 'fixed', 'BookOpen', 'training', '8h (2 jours × 4h)',
    ARRAY['Word : mise en forme, tableaux, styles', 'Excel : formules, TCD, graphiques', 'Outlook : messagerie professionnelle', 'Exercices pratiques inclus', 'Support de cours PDF fourni'],
    ARRAY['Word: formatting, tables, styles', 'Excel: formulas, pivot tables, charts', 'Outlook: professional email management', 'Practical exercises included', 'PDF course materials provided'],
    ARRAY['Word: التنسيق والجداول والأنماط', 'Excel: الصيغ والجداول المحورية والرسوم البيانية', 'Outlook: إدارة البريد الاحترافي', 'تمارين عملية مشمولة', 'مواد الدورة PDF متوفرة'],
    true, 4
),
(
    'Création de Contenu & Montage Vidéo',
    'إنشاء محتوى ومونتاج فيديو احترافي',
    'Content Creation & Video Editing',
    'Production de contenus digitaux professionnels : photos produits, vidéos promotionnelles, Reels Instagram, TikTok, montage vidéo avec motion design.',
    'إنتاج محتوى رقمي احترافي: صور المنتجات والفيديوهات الترويجية وReels إنستغرام وتيك توك ومونتاج فيديو مع موشن ديزاين.',
    'Professional digital content production: product photos, promotional videos, Instagram Reels, TikTok, video editing with motion design.',
    350.00, 'fixed', 'Camera', 'media', 'Selon projet',
    ARRAY['Shooting photo & vidéo professionnel', 'Montage vidéo & color grading', 'Motion design & animations', 'Reels / TikTok / Stories optimisés', 'Livraison en 48–72h'],
    ARRAY['Professional photo & video shooting', 'Video editing & color grading', 'Motion design & animations', 'Optimized Reels / TikTok / Stories', '48–72h delivery'],
    ARRAY['تصوير احترافي للصور والفيديو', 'مونتاج الفيديو وتصحيح الألوان', 'موشن ديزاين وأنيميشن', 'Reels وTikTok وStories محسّنة', 'تسليم خلال 48-72 ساعة'],
    true, 5
),
(
    'Campagne Publicitaire Meta Ads',
    'حملة إعلانية على Meta (فيسبوك وإنستغرام)',
    'Meta Ads Campaign Management',
    'Création, gestion et optimisation de vos campagnes publicitaires Facebook & Instagram. Ciblage précis, A/B testing, rapports de performance hebdomadaires.',
    'إنشاء وإدارة وتحسين حملاتك الإعلانية على فيسبوك وإنستغرام. استهداف دقيق واختبار A/B وتقارير أداء أسبوعية.',
    'Creation, management and optimization of Facebook & Instagram ad campaigns. Precise targeting, A/B testing, weekly performance reports.',
    500.00, 'fixed', 'TrendingUp', 'media', 'Par mois',
    ARRAY['Audit de votre compte publicitaire', 'Création des visuels & copies', 'Ciblage avancé des audiences', 'Gestion et optimisation quotidienne', 'Rapport de performance hebdomadaire'],
    ARRAY['Ad account audit', 'Visual & copy creation', 'Advanced audience targeting', 'Daily management and optimization', 'Weekly performance report'],
    ARRAY['تدقيق حساب الإعلانات', 'إنشاء المرئيات والنصوص الإعلانية', 'استهداف متقدم للجماهير', 'إدارة وتحسين يومي', 'تقرير أداء أسبوعي'],
    true, 6
);

-- ────────────────────────────────────────────────
-- STORAGE BUCKETS (à créer dans Supabase Dashboard > Storage)
-- ────────────────────────────────────────────────
-- 1. products-images   → public bucket, max 5MB, images
-- 2. media-gallery     → public bucket, max 50MB, images + vidéos
-- 3. company-assets    → public bucket, max 10MB, logo, documents

-- Exemple de politique Storage (à configurer via Dashboard) :
-- INSERT INTO storage.policies (name, bucket_id, operation, definition) VALUES
-- ('public read products', 'products-images', 'SELECT', 'true'),
-- ('admin insert products', 'products-images', 'INSERT', '(auth.role() = ''authenticated'')');
