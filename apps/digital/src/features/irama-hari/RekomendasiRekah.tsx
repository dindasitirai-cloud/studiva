import React, { useState } from 'react';
import { Sparkles, Heart, BookOpen, ChevronRight, X, Info } from 'lucide-react';
import { useKehidupanStore } from './kehidupanData';
import type { TagPenyesuaian } from './kehidupanData';
import JadwalkanKegiatanModal from '../beranda/komponen/JadwalkanKegiatanModal';

// =============================================================
// RekomendasiRekah — saran Temani & Bekal yang menyesuaikan keadaan keluarga.
// Dipakai di "Untukmu hari ini" (tab Kehidupan Keluarga) & Beranda (Fondasi).
// Difilter berdasarkan tag konteks yang sedang aktif; fallback ke umum.
// STATUS COPY: DRAFT — menunggu tinjauan Psikolog Fitri Effendy.
// =============================================================

type Src = 'temani' | 'bekal';
const SRC: Record<Src, { soft: string; ink: string; label: string; cta: string }> = {
  temani: { soft: '#FCE3EE', ink: '#D2559A', label: 'TEMANI', cta: 'Jadwalkan' },
  bekal: { soft: '#E4EFFD', ink: '#5F84E6', label: 'BEKAL', cta: 'Baca' },
};
interface RekItem { src: Src; tag: TagPenyesuaian; title: string; meta: string; desc: string; why: string; to: string }
const REK_ITEMS: RekItem[] = [
  { src: 'temani', tag: 'tidur', title: 'Ritual tenang sebelum tidur', meta: 'malam', desc: 'Redupkan lampu, satu lagu, satu cerita.', why: 'Karena tidur malam sedang terganggu.', to: '/dashboard/tier2/temani' },
  { src: 'bekal', tag: 'tidur', title: 'Tidur yang berubah di usia ini', meta: '3 mnt', desc: 'Menjawab kondisi tidur yang kamu catat.', why: 'Karena tidur malam sedang terganggu.', to: '/dashboard/tier2/bekal' },
  { src: 'temani', tag: 'kembali_kerja', title: '15 menit main tanpa layar', meta: 'sore', desc: 'Menambah waktu bersama yang berarti.', why: 'Karena waktu bersama sedang berubah.', to: '/dashboard/tier2/temani' },
  { src: 'bekal', tag: 'kembali_kerja', title: 'Kenapa waktu bersama itu penting', meta: '4 mnt', desc: 'Kualitas lebih berarti daripada durasi.', why: 'Karena waktu bersama sedang berubah.', to: '/dashboard/tier2/bekal' },
  { src: 'temani', tag: 'energi_caregiver', title: 'Jeda singkat untukmu', meta: 'kapan saja', desc: 'Satu kegiatan menenangkan 5 menit.', why: 'Karena energimu sedang terbatas.', to: '/dashboard/tier2/temani' },
  { src: 'bekal', tag: 'energi_caregiver', title: 'Mengisi ulang energi pengasuh', meta: '3 mnt', desc: 'Merawat diri bukan egois.', why: 'Karena energimu sedang terbatas.', to: '/dashboard/tier2/bekal' },
  { src: 'temani', tag: 'kurang_nyaman', title: 'Dekat & menenangkan', meta: 'kapan saja', desc: 'Pelukan, suara lembut, aktivitas ringan.', why: 'Karena anak sedang kurang nyaman.', to: '/dashboard/tier2/temani' },
  { src: 'bekal', tag: 'kurang_nyaman', title: 'Menemani anak yang kurang nyaman', meta: '3 mnt', desc: 'Rasa aman dulu sebelum yang lain.', why: 'Karena anak sedang kurang nyaman.', to: '/dashboard/tier2/bekal' },
  { src: 'temani', tag: 'transisi', title: 'Aba-aba sebelum pindah kegiatan', meta: 'siang', desc: 'Beri "dua menit lagi" agar lebih mulus.', why: 'Karena perpindahan kegiatan sedang sulit.', to: '/dashboard/tier2/temani' },
  { src: 'bekal', tag: 'transisi', title: 'Transisi yang lebih mulus', meta: '2 mnt', desc: 'Pilihan kecil menumbuhkan rasa kendali.', why: 'Karena perpindahan kegiatan sedang sulit.', to: '/dashboard/tier2/bekal' },
  { src: 'temani', tag: 'perubahan_ritme', title: 'Jaga satu ritual tetap', meta: 'malam', desc: 'Satu hal yang sama jadi jangkar.', why: 'Karena ritme keluarga sedang berubah.', to: '/dashboard/tier2/temani' },
  { src: 'bekal', tag: 'perubahan_ritme', title: 'Saat ritme keluarga berubah', meta: '3 mnt', desc: 'Menjaga rasa aman di tengah perubahan.', why: 'Karena ritme keluarga sedang berubah.', to: '/dashboard/tier2/bekal' },
];

export default function RekomendasiRekah({ idAnak, aktif, onBuka }: { idAnak: string; aktif?: readonly { tag: TagPenyesuaian }[]; onBuka?: (to: string) => void }) {
  const store = useKehidupanStore(idAnak);
  const sumberAktif = aktif ?? store.aktif;
  const activeTags = new Set(sumberAktif.map(k => k.tag));
  const cocok = REK_ITEMS.filter(it => activeTags.has(it.tag));
  const pool = cocok.length > 0 ? cocok : REK_ITEMS;
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNama, setModalNama] = useState('');

  const visible = pool.filter(it => !dismissed.has(it.title));
  const idx = visible.length ? ((active % visible.length) + visible.length) % visible.length : 0;
  const it = visible[idx] ?? null;
  const s = it ? SRC[it.src] : SRC.temani;

  const dismiss = () => { if (!it) return; setDismissed(prev => new Set(prev).add(it.title)); setActive(0); };
  const next = () => { if (visible.length) setActive(a => a + 1); };
  const jadwalkan = (judul: string) => { setModalNama(judul); setModalOpen(true); };

  return (
    <div style={{ background: '#fff', border: '1px solid #F6E6EE', borderRadius: 20, padding: '16px 16px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10.5, letterSpacing: '1px', textTransform: 'uppercase', color: '#D2559A' }}>Rekomendasi dari Rekah</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 9.5, color: '#7B5BB8', background: '#EFE9FB', borderRadius: 999, padding: '2px 8px' }}><Sparkles size={11} strokeWidth={2.2} /> AI</span>
      </div>
      <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: '#8A5A74', margin: '4px 0 0', lineHeight: 1.45 }}>
        {cocok.length > 0 ? 'Menyesuaikan yang sedang berubah di keluargamu.' : 'Saran lembut untuk hari ini.'}
      </p>

      {it ? (
        <div style={{ marginTop: 12 }}>
          <div style={{ background: s.soft, borderRadius: 16, padding: '14px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, background: '#fff', display: 'grid', placeItems: 'center' }}>
                {it.src === 'temani' ? <Heart size={17} strokeWidth={2} color={s.ink} /> : <BookOpen size={17} strokeWidth={2} color={s.ink} />}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10.5, letterSpacing: '.6px', color: s.ink }}>{s.label} · {it.meta}</span>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11, color: '#8A5A74' }}>{idx + 1} dari {visible.length}</span>
              </div>
            </div>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 16, color: '#6E3B57', margin: '10px 0 2px' }}>{it.title}</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12.5, color: '#7d6b73', lineHeight: 1.45 }}>{it.desc}</div>
            <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginTop: 10, background: 'rgba(255,255,255,.6)', borderRadius: 10, padding: '8px 10px' }}>
              <Info size={13} strokeWidth={2.4} color={s.ink} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, color: '#6E3B57', lineHeight: 1.4 }}>{it.why}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="button" onClick={() => (it.src === 'temani' ? jadwalkan(it.title) : onBuka?.(it.to))}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: s.ink, color: '#fff', border: 'none', borderRadius: 999, padding: '8px 15px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>
                {s.cta} <ChevronRight size={14} strokeWidth={2.8} />
              </button>
              <button type="button" onClick={dismiss} aria-label="Tidak sekarang" title="Tidak sekarang"
                style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1.5px solid #F2DDE7', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={16} strokeWidth={2.6} color="#B0708E" /></button>
              <button type="button" onClick={next} aria-label="Lihat lainnya" title="Lihat lainnya"
                style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1.5px solid #F2DDE7', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><ChevronRight size={16} strokeWidth={2.6} color="#8A5A74" /></button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 10 }}>
            {visible.map((v, vi) => (<span key={v.title} style={{ display: 'block', height: 6, width: vi === idx ? 18 : 6, borderRadius: 999, background: vi === idx ? '#F06BA8' : '#F4CFE0', transition: 'width .2s' }} />))}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 12, background: '#FFFAF5', border: '1px dashed #F2DDE7', borderRadius: 16, padding: '18px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 14, color: '#6E3B57' }}>Sudah semua untuk sekarang</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12, color: '#8A5A74', marginTop: 2 }}>Rekomendasi lain bisa kamu lihat kapan saja.</div>
        </div>
      )}

      <JadwalkanKegiatanModal open={modalOpen} namaKegiatan={modalNama} onClose={() => setModalOpen(false)} onSimpan={() => setModalOpen(false)} />
    </div>
  );
}
