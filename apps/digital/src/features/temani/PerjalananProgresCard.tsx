// Kartu "Progres perjalanan" untuk Beranda — desain design_handoff_beranda,
// menghitung "hari selesai" dari Kelola (sumber tunggal, seperti halaman Temani).
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnakAktif } from '../../context/AnakContext';
import { tanggalDariTimestampWIB } from '@studiva/shared';
import { getPilihanHarianRentang } from '../../lib/supabase/rekah';
import { TEMANI_JOURNEYS } from './temaniSeed';
import { Ornament } from './ornamen';

interface Progres { slug: string; hari: number; status: string; mulaiTanggal?: string; }

function rentangTanggal(awal: string, akhir: string): string[] {
  const out: string[] = [];
  const d = new Date(`${awal}T00:00:00Z`); const end = new Date(`${akhir}T00:00:00Z`); let g = 0;
  while (d.getTime() <= end.getTime() && g < 120) { out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); g++; }
  return out.length ? out : [akhir];
}
function tanggalPlus(awal: string, tambah: number): string {
  const d = new Date(`${awal}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + tambah); return d.toISOString().slice(0, 10);
}
function bacaProgres(idAnak: string): Progres | null {
  try { const raw = window.localStorage.getItem(`rekah_temani_${idAnak}`); return raw ? (JSON.parse(raw) as Progres) : null; } catch { return null; }
}

export default function PerjalananProgresCard() {
  const navigate = useNavigate();
  const { anak } = useAnakAktif();
  const idAnak = anak.id;
  const progres = bacaProgres(idAnak);
  const jAktif = progres && progres.status === 'aktif' ? (TEMANI_JOURNEYS.find(j => j.slug === progres.slug) ?? null) : null;
  const [selesai, setSelesai] = useState(0);
  const tanggalHariIni = tanggalDariTimestampWIB(new Date().toISOString());

  useEffect(() => {
    let batal = false;
    if (!jAktif || !progres) { setSelesai(0); return; }
    const mulai = progres.mulaiTanggal ?? tanggalHariIni;
    const tgls = rentangTanggal(mulai, tanggalPlus(mulai, jAktif.durasiHari - 1));
    getPilihanHarianRentang(idAnak, tgls).then(rows => {
      if (batal) return;
      const prefix = `temani-${jAktif.slug}-h`;
      const set = new Set<string>();
      for (const t of Object.keys(rows)) {
        const sel = (rows[t]?.diff as { selesai?: unknown } | null)?.selesai;
        if (Array.isArray(sel)) for (const id of sel) if (typeof id === 'string' && id.startsWith(prefix)) set.add(id);
      }
      setSelesai(set.size);
    }).catch(() => { /* abaikan */ });
    return () => { batal = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAnak, jAktif?.slug, progres?.mulaiTanggal, tanggalHariIni]);

  const hari = selesai;
  const total = jAktif?.durasiHari ?? 7;
  const pct = total ? Math.round((hari / total) * 100) : 0;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: 'linear-gradient(150deg,#FDF0F7 0%,#FBEAF4 52%,#F7E9FA 100%)', boxShadow: '0 22px 48px -40px rgba(90,50,70,.55)' }}>
      <div aria-hidden style={{ display: 'flex', height: 6 }}>
        <span style={{ flex: 2, background: '#F06BA8', display: 'block' }} />
        <span style={{ flex: 1, background: '#F8B9D4', display: 'block' }} />
        <span style={{ flex: 1.2, background: '#FFE29A', display: 'block' }} />
        <span style={{ flex: 1, background: '#C9B8F0', display: 'block' }} />
      </div>
      <span aria-hidden style={{ position: 'absolute', right: -6, bottom: -10, width: 104, height: 150, opacity: 0.32, pointerEvents: 'none', animation: 'sway 14s ease-in-out infinite', transformOrigin: 'bottom center' }}>
        <Ornament type="daisy" bloom="#F8B9D4" bloom2="#FFF1F7" center="#FFE29A" />
      </span>

      <div style={{ position: 'relative', padding: '22px 26px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 6, height: 26, borderRadius: 999, background: '#F06BA8', display: 'block' }} />
          <h2 style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 24, color: '#C6407F', margin: 0 }}>Progres perjalanan</h2>
        </div>
        {jAktif ? (
          <>
            <div style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 700, fontSize: 15.5, color: '#7A4A64', marginTop: 9 }}>{jAktif.judul}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
              <div aria-hidden style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                {Array.from({ length: total }).map((_, i) => (
                  <span key={i} style={{ width: i < hari ? 13 : 11, height: i < hari ? 13 : 11, borderRadius: '50%', background: i < hari ? '#F0479B' : '#F8C4DC', display: 'block' }} />
                ))}
              </div>
              <span style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 14.5, color: '#B4477F', background: '#FFF1F7', borderRadius: 999, padding: '5px 13px' }}>{hari} dari {total} hari selesai</span>
            </div>
            <div style={{ height: 9, borderRadius: 999, background: '#FBDDEC', marginTop: 16, overflow: 'hidden', maxWidth: 420 }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: '#F06BA8' }} />
            </div>
            <button type="button" onClick={() => navigate('/dashboard/tier2/temani')} style={{ display: 'inline-flex', alignItems: 'center', gap: 11, marginTop: 20, borderRadius: 999, padding: '15px 28px', cursor: 'pointer', border: 0, background: '#F0479B', boxShadow: '0 18px 32px -20px rgba(240,71,155,.95)' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFE29A', display: 'block' }} />
              <span style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 16, color: '#fff' }}>Lanjutkan</span>
              <span style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 16, color: '#fff', lineHeight: 1 }}>→</span>
            </button>
          </>
        ) : (
          <>
            <p style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 600, fontSize: 14, color: '#7A4A64', marginTop: 10, lineHeight: 1.5 }}>Belum ada perjalanan aktif. Pilih satu perjalanan untuk mulai ditemani, langkah demi langkah.</p>
            <button type="button" onClick={() => navigate('/dashboard/tier2/temani')} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 16, borderRadius: 999, padding: '13px 24px', cursor: 'pointer', border: 0, background: '#F0479B', boxShadow: '0 18px 32px -20px rgba(240,71,155,.95)' }}>
              <span style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 15, color: '#fff' }}>Buka Temani →</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
