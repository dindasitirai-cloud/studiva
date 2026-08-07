import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'REACT_APP_SUPABASE_URL dan REACT_APP_SUPABASE_ANON_KEY wajib diisi di .env. ' +
    'Lihat .env.example dan BACKEND_SETUP.md.',
  );
}

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    // Supabase menyimpan session (JWT + refresh token) di localStorage.
    // Ini BUKAN PII berbentuk plaintext — hanya JWT terenkripsi.
    // Yang dihapus dari sini adalah penyimpanan objek user dalam plaintext
    // (nama, email) yang sebelumnya ada di 'studiva_user'.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
