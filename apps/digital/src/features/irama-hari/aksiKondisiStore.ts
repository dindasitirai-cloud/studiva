// Hook pembaca "Aksi per Kondisi" (Phase 28) untuk sisi caregiver.
// Membaca baris tayang dari Supabase sekali per mount, disaring per domain.
// Fallback aman: kosong saat offline/belum ada tabel → helper pakai default kode.
import { useEffect, useState } from 'react';
import { muatAksiKondisi } from '../../lib/supabase/aksiKondisi';
import type { AksiKondisiRow } from '../../lib/supabase/aksiKondisi';

let cache: AksiKondisiRow[] | null = null;
let inflight: Promise<AksiKondisiRow[] | null> | null = null;

export function useAksiKondisi(domain: string): AksiKondisiRow[] {
  const [rows, setRows] = useState<AksiKondisiRow[]>(cache ? cache.filter(r => r.domain === domain) : []);
  useEffect(() => {
    let batal = false;
    if (cache) { setRows(cache.filter(r => r.domain === domain)); return; }
    if (!inflight) inflight = muatAksiKondisi();
    inflight.then(r => { if (r) cache = r; if (!batal && r) setRows(r.filter(x => x.domain === domain)); }).catch(() => {});
    return () => { batal = true; };
  }, [domain]);
  return rows;
}
