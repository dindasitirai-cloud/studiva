// =============================================================
// useJejakPengamatan — KONTINUITAS: lini masa perkembangan anak.
// Membaca log append-only (tandai/lepas) lalu menurunkan, per tahap yang pernah
// diamati: kapan PERTAMA diperhatikan + apakah MASIH diamati.
// Sumber: Supabase (jejak_pengamatan_kompas) + cache/log localStorage.
// =============================================================
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getJejakPengamatan } from '../lib/supabase/rekah';
import { promptById } from '../features/rekah-journey/observation/observationPrompts';

type Aksi = 'tandai' | 'lepas';
interface Event { p: string; a: Aksi; t: string }

function kunci(idAnak: string): string {
  return `rekah_jejak_pengamatan_${idAnak}`;
}

function bacaLocal(idAnak: string): Event[] {
  try {
    const raw = window.localStorage.getItem(kunci(idAnak));
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (e): e is Event =>
        e && typeof e.p === 'string' && (e.a === 'tandai' || e.a === 'lepas') && typeof e.t === 'string',
    );
  } catch {
    return [];
  }
}

/** Dipanggil useObservasiKompas saat toggle — mencatat event ke log lokal. */
export function appendJejakLocal(idAnak: string, idPrompt: string, aksi: Aksi): void {
  try {
    const log = bacaLocal(idAnak);
    log.push({ p: idPrompt, a: aksi, t: new Date().toISOString() });
    // batasi ukuran cache
    const potong = log.length > 300 ? log.slice(log.length - 300) : log;
    window.localStorage.setItem(kunci(idAnak), JSON.stringify(potong));
  } catch {
    /* abaikan */
  }
}

export interface JejakEntry {
  idPrompt: string;
  label: string;
  domainOrArea: string;
  firstSeen: string; // ISO
  aktif: boolean;
}

function turunkan(events: Event[]): JejakEntry[] {
  const urut = [...events].sort((a, b) => a.t.localeCompare(b.t));
  const per = new Map<string, { firstTandai?: string; lastAksi?: Aksi }>();
  for (const e of urut) {
    const cur = per.get(e.p) ?? {};
    if (cur.firstTandai === undefined && e.a === 'tandai') cur.firstTandai = e.t;
    cur.lastAksi = e.a;
    per.set(e.p, cur);
  }
  const entries: JejakEntry[] = [];
  for (const [p, v] of per) {
    if (!v.firstTandai) continue;
    const prompt = promptById(p);
    if (!prompt) continue;
    entries.push({
      idPrompt: p,
      label: prompt.label,
      domainOrArea: prompt.domainOrArea,
      firstSeen: v.firstTandai,
      aktif: v.lastAksi === 'tandai',
    });
  }
  entries.sort((a, b) => a.firstSeen.localeCompare(b.firstSeen));
  return entries;
}

/** `nonce` opsional: ubah nilainya (mis. dari daftar pengamatan aktif) agar
 *  log lokal dibaca ulang setelah toggle di halaman yang sama. */
export function useJejakPengamatan(idAnak: string, nonce?: string): JejakEntry[] {
  const { supabaseUser } = useAuth();
  const [events, setEvents] = useState<Event[]>(() => bacaLocal(idAnak));

  useEffect(() => {
    let batal = false;
    setEvents(bacaLocal(idAnak));
    if (!supabaseUser || !idAnak) return;
    getJejakPengamatan(idAnak)
      .then(rows => {
        if (batal) return;
        const ev: Event[] = rows.map(r => ({ p: r.id_prompt, a: (r.aksi === 'lepas' ? 'lepas' : 'tandai'), t: r.pada }));
        setEvents(ev);
      })
      .catch(() => {
        /* tabel belum ada / offline → pakai log lokal */
      });
    return () => { batal = true; };
  }, [idAnak, supabaseUser, nonce]);

  return useMemo(() => turunkan(events), [events]);
}
