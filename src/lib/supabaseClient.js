import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/* false si les variables d'environnement manquent : main.jsx affiche alors
   un message d'aide au lieu d'une page blanche. */
export const supabaseReady = Boolean(supabaseUrl && supabaseKey)

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseKey || 'cle-manquante',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
)

/* Upload d'un fichier dans Supabase Storage → renvoie l'URL publique.
   Nécessite les règles d'accès Storage de supabase/schema.sql (section 6). */
export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw error
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return urlData.publicUrl
}

export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

/* Extrait le chemin du fichier depuis son URL publique (pour le supprimer) */
export function extractStoragePath(publicUrl, bucket) {
  if (!publicUrl) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = publicUrl.indexOf(marker)
  return idx !== -1 ? publicUrl.substring(idx + marker.length) : null
}
