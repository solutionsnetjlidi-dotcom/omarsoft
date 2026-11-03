-- ================================================================
-- OMARSOFT – Jlidi Network Solutions
-- schema.sql — VERSION FINALE (peut être exécuté plusieurs fois sans risque)
--
-- Supabase > SQL Editor > New query > coller tout ce fichier > Run
--
-- Ce script :
--   1. crée les 6 tables (si elles n'existent pas)
--   2. crée les triggers et la fonction de numérotation des documents
--   3. active la sécurité (RLS) : le public LIT le catalogue, seul l'ADMIN écrit
--   4. crée les 3 buckets d'images + leurs règles d'accès (sinon l'upload échoue)
--   5. active le temps réel sur les demandes (notifications admin)
--   6. insère les paramètres de l'entreprise et des services SANS prix
--
-- ⚠️  ADMIN : modifiez la liste d'e-mails dans la fonction is_admin() ci-dessous
--     si l'adresse de connexion admin n'est pas solutionsnetjlidi@gmail.com.
-- ================================================================

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

-- ────────────────────────────────────────────────
-- INDEX (rapidité de l'affichage et du dashboard)
-- ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_visible_created ON products (is_visible, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_category_sort   ON services (category, sort_order);
CREATE INDEX IF NOT EXISTS idx_requests_status_created  ON service_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_visible_sort       ON media_content (is_visible, sort_order);

-- ────────────────────────────────────────────────
-- TRIGGERS updated_at (relançables)
-- ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_services_updated_at ON services;
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_requests_updated_at ON service_requests;
CREATE TRIGGER trg_requests_updated_at BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_invoices_updated_at ON invoices_and_quotes;
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices_and_quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────
-- NUMÉROTATION DES DOCUMENTS (DEV-2026-1001, FAC-2026-1002…)
-- ────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS doc_number_seq START WITH 1001;

CREATE OR REPLACE FUNCTION generate_document_number(doc_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    prefix   TEXT;
    seq_val  BIGINT;
BEGIN
    prefix := CASE doc_type
        WHEN 'quote'          THEN 'DEV'
        WHEN 'invoice'        THEN 'FAC'
        WHEN 'purchase_order' THEN 'BC'
        WHEN 'delivery_note'  THEN 'BL'
        ELSE 'DOC'
    END;
    seq_val := nextval('doc_number_seq');
    RETURN prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq_val::TEXT, 4, '0');
END;
$$;

REVOKE ALL ON FUNCTION generate_document_number(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION generate_document_number(TEXT) TO authenticated;

-- ────────────────────────────────────────────────
-- SÉCURITÉ : qui est administrateur ?
-- Seules les adresses listées ci-dessous peuvent écrire dans la base,
-- même si quelqu'un parvenait à créer un compte.
-- ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT COALESCE(
        lower(auth.jwt() ->> 'email') = ANY (ARRAY['solutionsnetjlidi@gmail.com']),   -- ← vos e-mails admin
        false
    );
$$;

-- ────────────────────────────────────────────────
-- RLS : on repart d'une base propre (supprime TOUTES les anciennes règles)
-- ────────────────────────────────────────────────
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE services            ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_and_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_content       ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings    ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN
        SELECT policyname, tablename FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('products','services','service_requests','invoices_and_quotes','media_content','company_settings')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Public : lecture de ce qui est visible
CREATE POLICY "public_read_products" ON products FOR SELECT TO anon, authenticated USING (is_visible = true);
CREATE POLICY "public_read_services" ON services FOR SELECT TO anon, authenticated USING (is_visible = true);
CREATE POLICY "public_read_media"    ON media_content FOR SELECT TO anon, authenticated USING (is_visible = true);
-- Public : uniquement les chiffres de la page d'accueil (stats_*), rien d'autre
CREATE POLICY "public_read_stats"    ON company_settings FOR SELECT TO anon, authenticated USING (key LIKE 'stats\_%');

-- Public : peut envoyer une demande (toujours en statut « pending »)
CREATE POLICY "public_insert_requests" ON service_requests FOR INSERT TO anon, authenticated
    WITH CHECK (
        status = 'pending'
        AND request_type IN ('anydesk','quote','training','contact')
        AND char_length(client_name) BETWEEN 1 AND 200
        AND char_length(COALESCE(message, '')) <= 5000
    );

-- Admin : accès complet (lecture, ajout, modification, suppression)
CREATE POLICY "admin_all_products"   ON products            FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_services"   ON services            FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_media"      ON media_content       FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_settings"   ON company_settings    FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_requests"   ON service_requests    FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_invoices"   ON invoices_and_quotes FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ────────────────────────────────────────────────
-- STORAGE : buckets d'images + règles d'accès
-- (sans ces règles, l'enregistrement d'un produit avec image échoue avec
--  « new row violates row-level security policy »)
-- ────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
    ('products-images', 'products-images', true,  5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
    ('media-gallery',   'media-gallery',   true, 52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']),
    ('company-assets',  'company-assets',  true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/svg+xml','application/pdf'])
ON CONFLICT (id) DO UPDATE
    SET public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "omarsoft_storage_read"   ON storage.objects;
DROP POLICY IF EXISTS "omarsoft_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "omarsoft_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "omarsoft_storage_delete" ON storage.objects;

CREATE POLICY "omarsoft_storage_read" ON storage.objects FOR SELECT TO public
    USING (bucket_id IN ('products-images','media-gallery','company-assets'));
CREATE POLICY "omarsoft_storage_insert" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN ('products-images','media-gallery','company-assets') AND public.is_admin());
CREATE POLICY "omarsoft_storage_update" ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id IN ('products-images','media-gallery','company-assets') AND public.is_admin())
    WITH CHECK (bucket_id IN ('products-images','media-gallery','company-assets') AND public.is_admin());
CREATE POLICY "omarsoft_storage_delete" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id IN ('products-images','media-gallery','company-assets') AND public.is_admin());

-- ────────────────────────────────────────────────
-- TEMPS RÉEL : notifications admin à chaque nouvelle demande
-- ────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                   WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'service_requests') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
    END IF;
END $$;

-- ────────────────────────────────────────────────
-- PARAMÈTRES DE L'ENTREPRISE (valeurs réelles, modifiables dans Admin > Paramètres)
-- ────────────────────────────────────────────────
INSERT INTO company_settings (key, value) VALUES
    ('company_name',      'STE Jlidi Network Solutions'),
    ('company_brand',     'OMARSOFT'),
    ('company_address',   '4116 Djerba Midoun, Médenine, Tunisie'),
    ('company_phone',     '+216 54 421 123'),
    ('company_whatsapp',  '+21654421123'),
    ('company_email',     'solutionsnetjlidi@gmail.com'),
    ('company_rc',        'C20215152024'),
    ('company_mf',        '1877339 E/M'),
    ('exchange_rate_eur', '0.30'),
    ('exchange_rate_usd', '0.32'),
    ('tva_rate',          '19')
ON CONFLICT (key) DO NOTHING;

-- Corrige les anciennes valeurs d'exemple de la version 2 (uniquement si elles n'ont pas été modifiées)
UPDATE company_settings SET value = '+216 54 421 123'             WHERE key = 'company_phone'    AND value LIKE '%XXX%';
UPDATE company_settings SET value = '+21654421123'                WHERE key = 'company_whatsapp' AND value LIKE '%XXX%';
UPDATE company_settings SET value = 'solutionsnetjlidi@gmail.com' WHERE key = 'company_email'    AND value = 'contact@omarsoft.tn';
UPDATE company_settings SET value = '4116 Djerba Midoun, Médenine, Tunisie' WHERE key = 'company_address' AND value = 'Djerba Midoun, Médenine, Tunisie';
DELETE FROM company_settings WHERE key = 'anydesk_id' AND value = 'XXXXXXXXX';

-- ────────────────────────────────────────────────
-- SERVICES DE DÉPART — sans prix (affichés « Sur devis »)
-- Insérés seulement si la table est vide. Modifiez-les dans Admin > Services.
-- ────────────────────────────────────────────────
INSERT INTO services (name_fr, name_ar, name_en, description_fr, description_ar, description_en,
                      price_tnd, price_type, icon_name, category, features_fr, features_ar, features_en, sort_order)
SELECT * FROM (VALUES
  ('Réparation et dépannage', 'إصلاح وصيانة', 'Repair and support',
   'Diagnostic et réparation de PC fixes et portables.', 'تشخيص وإصلاح الحواسيب المكتبية والمحمولة.', 'Diagnosis and repair of desktop and laptop computers.',
   NULL::numeric, 'custom', 'Wrench', 'service',
   ARRAY['Diagnostic','Réparation matériel et logiciel','PC fixes et portables'], ARRAY['تشخيص','إصلاح العتاد والبرمجيات','حواسيب مكتبية ومحمولة'], ARRAY['Diagnosis','Hardware and software repair','Desktops and laptops'], 1),
  ('Assistance à distance', 'مساعدة عن بعد', 'Remote assistance',
   'Prise en main de votre ordinateur à distance via AnyDesk.', 'التحكم في حاسوبك عن بعد عبر AnyDesk.', 'Remote access to your computer through AnyDesk.',
   NULL::numeric, 'custom', 'Monitor', 'service',
   ARRAY['Connexion via AnyDesk','Sans déplacement','Problèmes logiciels et configuration'], ARRAY['اتصال عبر AnyDesk','بدون تنقل','مشاكل البرمجيات والإعدادات'], ARRAY['Connection via AnyDesk','No travel needed','Software and configuration issues'], 2),
  ('Installation réseaux', 'تركيب الشبكات', 'Network setup',
   'Installation et configuration de réseaux Wi-Fi et locaux.', 'تركيب وإعداد شبكات الواي فاي والشبكات المحلية.', 'Installation and configuration of Wi-Fi and local networks.',
   NULL::numeric, 'custom', 'Wifi', 'service',
   ARRAY['Wi-Fi et réseau local','Câblage','Configuration des équipements'], ARRAY['واي فاي وشبكة محلية','تمديد الكابلات','إعداد التجهيزات'], ARRAY['Wi-Fi and local network','Cabling','Equipment configuration'], 3),
  ('Formation Word, Excel, Outlook', 'تكوين Word و Excel و Outlook', 'Word, Excel, Outlook training',
   'Formation pratique aux logiciels de bureautique.', 'تكوين تطبيقي على برامج المكتبية.', 'Hands-on training in office software.',
   NULL::numeric, 'custom', 'BookOpen', 'training',
   ARRAY['Word','Excel','Outlook'], ARRAY['Word','Excel','Outlook'], ARRAY['Word','Excel','Outlook'], 4),
  ('Création de contenu', 'إنتاج المحتوى', 'Content creation',
   'Photos, vidéos et montage pour vos réseaux sociaux.', 'صور وفيديوهات ومونتاج لشبكاتك الاجتماعية.', 'Photos, videos and editing for your social media.',
   NULL::numeric, 'custom', 'Camera', 'media',
   ARRAY['Photo et vidéo','Montage','Contenus pour les réseaux sociaux'], ARRAY['صور وفيديو','مونتاج','محتوى للشبكات الاجتماعية'], ARRAY['Photo and video','Editing','Social media content'], 5),
  ('Campagnes Meta Ads', 'حملات إعلانات ميتا', 'Meta Ads campaigns',
   'Publicités Facebook et Instagram pour développer votre activité.', 'إعلانات فيسبوك وإنستغرام لتطوير نشاطك.', 'Facebook and Instagram ads to grow your business.',
   NULL::numeric, 'custom', 'TrendingUp', 'media',
   ARRAY['Facebook et Instagram','Création des publicités','Suivi des résultats'], ARRAY['فيسبوك وإنستغرام','تصميم الإعلانات','متابعة النتائج'], ARRAY['Facebook and Instagram','Ad creation','Results tracking'], 6)
) AS v(name_fr, name_ar, name_en, description_fr, description_ar, description_en, price_tnd, price_type, icon_name, category, features_fr, features_ar, features_en, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM services);

-- ================================================================
-- FIN — Vérification : les 6 requêtes ci-dessous doivent s'exécuter sans erreur
-- ================================================================
-- SELECT count(*) FROM services;
-- SELECT public.is_admin();   -- renvoie false dans l'éditeur SQL (normal : pas de session)
