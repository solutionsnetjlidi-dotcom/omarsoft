-- ================================================================
-- OPTIONNEL — À exécuter UNE SEULE FOIS, et seulement si vous voulez
-- supprimer les données d'EXEMPLE de la version 2 (produits et services
-- avec des prix fictifs). ⚠️ Cela supprime TOUS les produits et services.
-- Si vous avez déjà saisi de vrais produits, NE PAS l'exécuter :
-- supprimez plutôt les exemples un par un dans Admin > Produits / Services.
-- ================================================================
DELETE FROM products;
DELETE FROM services;
-- Puis relancez schema.sql pour recréer les 6 services de départ sans prix.
