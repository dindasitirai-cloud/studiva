// =============================================================
// TinjauMingguKartu — kartu "Tinjau minggu ini" tab Perjalanan (Phase 23, design handoff).
// Satu kartu, tiga keadaan:
//   idle      → strip 7 hari + "Tinjau sekarang" / "Nanti"
//   meninjau  → 3 langkah, satu pertanyaan per layar (rasa → kegiatan → catatan)
//   selesai   → "Yang Rekah sesuaikan" (Batalkan/Urungkan per baris)
// Data & efek SAMA dengan Phase 21B (tinjauData): Pertahankan/Lebih ringan dijadwalkan
// ke hari yang sama minggu depan, semua bisa dibatalkan; catatan opsional → Jurnal;
// "Cukup berat" diarahkan ke Kehidupan Keluarga (bukan mesin peringan kedua).
// INVARIANT: tanpa skor/angka progres; reversible. Copy DRAFT → review Psikolog Fitri.
// =============================================================
import React, { useEffect, useRef, useState } from 'react';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';
import { getJurnalHariRentang, simpanJurnalHari } from '../../lib/supabase/rekah';
import { useCaraStore, SIAPA_LABEL, useParameterPenyesuaian, catatanPenyesuaianRingkas } from './kehidupanData';
import type { SiapaPengasuh } from './kehidupanData';
import { kumpulkanKegiatanMinggu, LABEL_KEPUTUSAN, LABEL_TIPE } from './tinjauData';
import type { Keputusan, Rasa, TinjauStore, KegiatanMinggu, KeputusanItem } from './tinjauData';
import { localISO, dariISO } from './rencanaData';

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const tglPendek = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${BULAN[(m || 1) - 1]}`; };
const tambahHari = (iso: string, n: number) => { const d = dariISO(iso); d.setDate(d.getDate() + n); return localISO(d); };

const OPSI_KEP: Keputusan[] = ['pertahankan', 'ringan', 'ganti', 'istirahat'];
const WARNA_TIPE: Record<KegiatanMinggu['tipe'], string> = { main: '#D2559A', buku: '#7B5BB8', lainnya: '#8A5A74' };
const GAYA_KEP: Record<Keputusan, { soft: string; ink: string }> = {
  pertahankan: { soft: '#EEF7EA', ink: '#5E8C3E' },
  ringan: { soft: '#E8F1FC', ink: '#4C7BC0' },
  ganti: { soft: '#F4EEFC', ink: '#7B5BB8' },
  istirahat: { soft: '#FFF6DC', ink: '#B07A1E' },
};

const Svg = ({ size, stroke, sw = 2.2, children }: { size: number; stroke: string; sw?: number; children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
);

const MOOD: { id: Rasa; label: string; ikon: React.ReactNode }[] = [
  { id: 'ringan', label: 'Ringan', ikon: <Svg size={34} stroke="#E0A23A" sw={2}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></Svg> },
  { id: 'pas', label: 'Pas', ikon: <Svg size={34} stroke="#7B9BC8" sw={2}><path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18Z" /></Svg> },
  { id: 'berat', label: 'Cukup berat', ikon: <Svg size={34} stroke="#7B5BB8" sw={2}><path d="M7 14h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 14Z" /><path d="M9 17.5 8 20M13 17.5l-1 2.5M17 17.5l-1 2.5" /></Svg> },
];

const kunciNanti = (idAnak: string, senin: string) => `rekah_tinjau_nanti_${idAnak}_${senin}`;

export default function TinjauMingguKartu({ idAnak, nama, hariIni, tinjau, onCeritakanBerat, onKeKeluarga, onKeBekal, onKeIrama }: {
  idAnak: string; nama: string; hariIni: string; tinjau: TinjauStore;
  onCeritakanBerat?: () => void; onKeKeluarga?: () => void; onKeBekal?: () => void; onKeIrama?: () => void;
}) {
  const { publishedActivities } = useLearningStrategies();
  const kegiatan = kumpulkanKegiatanMinggu(idAnak, hariIni);
  const sudah = tinjau.catatan;
  const senin = tinjau.minggu;
  const mingguISO = tambahHari(senin, 6);

  const [langkah, setLangkah] = useState<0 | 1 | 2 | 3>(0); // 0 = idle
  const [rasa, setRasa] = useState<Rasa | null>(null);
  const [pilihan, setPilihan] = useState<Record<string, Keputusan>>({});
  const [catatan, setCatatan] = useState('');
  const [keJurnal, setKeJurnal] = useState(true);
  const [nanti, setNanti] = useState<string | null>(() => { try { return localStorage.getItem(kunciNanti(idAnak, senin)); } catch { return null; } });
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const kepDari = (k: KegiatanMinggu): Keputusan => pilihan[k.kunci] ?? 'pertahankan';
  const versiRingan = (k: KegiatanMinggu): string | undefined => {
    if (k.tipe !== 'main') return undefined;
    const a = publishedActivities.find(x => x.judul.trim().toLowerCase() === k.judul.trim().toLowerCase());
    const v = a?.variasiMudah?.trim();
    return v ? `${k.judul} · versi ringan: ${v.length > 110 ? v.slice(0, 107) + '…' : v}` : undefined;
  };

  const pilihRasa = (r: Rasa) => {
    setRasa(r);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLangkah(2), 260);
  };

  const kirim = async () => {
    const tulisJurnal = keJurnal && catatan.trim().length > 0;
    tinjau.simpan({
      rasa,
      pilihan: kegiatan.map(k => ({ k, keputusan: kepDari(k), teksVersiRingan: kepDari(k) === 'ringan' ? versiRingan(k) : undefined })),
      catatan,
      jurnal: 'tidak',
    });
    setLangkah(0);
    if (tulisJurnal) {
      try {
        const ada = await getJurnalHariRentang(idAnak, [hariIni]);
        const lama = ada[hariIni];
        const blok = `Tinjau minggu: ${catatan.trim()}`;
        await simpanJurnalHari(idAnak, hariIni, { cerita: lama?.cerita ? `${lama.cerita}\n\n${blok}` : blok, foto: lama?.foto ?? [] });
        tinjau.setJurnal('tersimpan');
      } catch {
        tinjau.setJurnal('gagal');
      }
    }
  };

  // "Ubah jawaban": kembali ke langkah 1 dengan jawaban sebelumnya terisi.
  const ubahJawaban = () => {
    if (sudah) {
      setRasa(sudah.rasa);
      setPilihan(Object.fromEntries(sudah.keputusan.map(x => [x.kunci, x.keputusan])));
      setCatatan(sudah.catatan);
      setKeJurnal(false); // catatan lama sudah (mungkin) ada di Jurnal — jangan dobel
    }
    tinjau.ulang();
    setLangkah(1);
  };

  const tundaNanti = () => {
    try { localStorage.setItem(kunciNanti(idAnak, senin), hariIni); } catch { /* abaikan */ }
    setNanti(hariIni);
  };
  // Ditunda: tampil ringkas sampai hari Minggu (pengingat berikutnya).
  const ditunda = !sudah && langkah === 0 && !!nanti && (hariIni !== mingguISO || nanti === mingguISO);

  const kartu = (isi: React.ReactNode, extra?: React.CSSProperties) => (
    <section className="relative overflow-hidden rounded-[28px] border-[1.5px] border-[#F8D7E6] bg-white px-[26px] py-6" style={extra}>{isi}</section>
  );

  // ── Selesai ──
  if (sudah) {
    const param = <PenyesuaianKeluarga idAnak={idAnak} onKeKeluarga={onKeKeluarga} />;
    return kartu(
      <div className="jbp-pop">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-[54px] w-[54px] flex-none items-center justify-center rounded-[18px] bg-[#E6F4E8]"><Svg size={24} stroke="#4E8C5A" sw={2.6}><path d="m5 12 4.5 4.5L19 7" /></Svg></span>
          <div className="min-w-[200px] flex-1">
            <div className="font-fredoka text-[22px] font-bold text-pekat">Terima kasih sudah berhenti sejenak</div>
            <div className="mt-0.5 font-nunito text-[14px] font-semibold text-[#8A5A74]">Minggu depan sudah disesuaikan</div>
          </div>
          <button type="button" onClick={ubahJawaban} className="inline-flex min-h-[44px] items-center gap-1.5 font-nunito text-[13.5px] font-extrabold text-[#B48DA3] hover:text-[#8A5A74]">
            <Svg size={14} stroke="currentColor" sw={2.4}><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" /></Svg> Ubah jawaban
          </button>
        </div>

        {sudah.rasa === 'berat' && onCeritakanBerat && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[18px] bg-[#F4EEFC] px-4 py-3">
            <span className="min-w-[180px] flex-1 font-nunito text-[13.5px] font-bold leading-relaxed text-[#6B4E9E]">Minggu ini terasa berat. Ceritakan apa yang membuatnya berat, supaya Rekah menata langkah lebih ringan.</span>
            <button type="button" onClick={onCeritakanBerat} className="rounded-full bg-white px-3.5 py-2 font-nunito text-[13px] font-extrabold text-[#7B5BB8]">Ceritakan di Kehidupan Keluarga →</button>
          </div>
        )}
        {sudah.catatan && sudah.jurnal === 'gagal' && (
          <p className="mb-0 mt-3 font-nunito text-[12.5px] font-semibold text-[#B48DA3]">Catatanmu belum bisa disimpan ke Jurnal (perlu masuk akun). Catatan tetap tersimpan di tinjauan ini.</p>
        )}

        <div className="mb-2.5 mt-[22px] font-nunito text-[12px] font-extrabold tracking-[1.4px] text-[#B48DA3]">YANG REKAH SESUAIKAN</div>
        {sudah.keputusan.length === 0 ? (
          <div className="rounded-[20px] border-[1.5px] border-dashed border-[#F2DDE7] p-4 text-center font-nunito text-[14px] font-bold text-[#B48DA3]">Semua kegiatan berjalan seperti biasa</div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {sudah.keputusan.map(x => <BarisSesuaikan key={x.kunci} x={x} idAnak={idAnak} tinjau={tinjau} onKeBekal={onKeBekal} />)}
          </div>
        )}
        {param}
        {onKeIrama && sudah.keputusan.some(x => x.terjadwal && !x.dibatalkan) && (
          <button type="button" onClick={onKeIrama} className="mt-3 font-nunito text-[13.5px] font-extrabold text-rekah-tua hover:text-rekah">Lihat di Irama Keseharian →</button>
        )}
      </div>,
    );
  }

  // ── Ditunda ──
  if (ditunda) {
    return kartu(
      <div className="flex flex-wrap items-center gap-3">
        <Svg size={16} stroke="#D2559A"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 20a2 2 0 0 0 4 0" /></Svg>
        <span className="min-w-[180px] flex-1 font-nunito text-[14px] font-bold text-[#8A5A74]">Tinjau minggu ini diingatkan lagi hari Minggu, {tglPendek(mingguISO)}.</span>
        <button type="button" onClick={() => setLangkah(1)} className="min-h-[44px] rounded-full bg-[#FFF4F9] px-4 font-nunito text-[13.5px] font-extrabold text-rekah-tua">Tinjau sekarang</button>
      </div>,
      { paddingTop: 16, paddingBottom: 16 },
    );
  }

  // ── Idle ──
  if (langkah === 0) {
    const hariMinggu = Array.from({ length: 7 }, (_, i) => tambahHari(senin, i));
    return kartu(
      <div className="-mx-[26px] -my-6 px-[26px] py-6" style={{ background: 'linear-gradient(120deg,#FDE3EF,#EDE4FB)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-fredoka text-[22px] font-bold text-pekat">Tinjau minggu ini</div>
          <div className="flex items-center gap-[7px] rounded-full bg-white/70 px-3 py-1.5 font-nunito text-[13px] font-bold text-[#8A5A74]">
            <Svg size={15} stroke="#D2559A"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 20a2 2 0 0 0 4 0" /></Svg>
            Diingatkan Minggu, {tglPendek(mingguISO)}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="grid min-w-0 flex-[1_1_380px] grid-cols-7 gap-2">
            {hariMinggu.map((t, i) => {
              const kini = t === hariIni;
              return (
                <div key={t} className="flex flex-col items-center gap-1 rounded-[16px] py-2.5" style={{ background: kini ? '#F06BA8' : 'rgba(255,255,255,.7)', border: `1.5px solid ${kini ? '#F06BA8' : 'transparent'}` }}>
                  <span className="font-nunito text-[11.5px] font-extrabold" style={{ color: kini ? 'rgba(255,255,255,.85)' : '#B48DA3' }}>{HARI[i]}</span>
                  <span className="font-fredoka text-[18px] font-bold" style={{ color: kini ? '#fff' : '#6E3B57' }}>{Number(t.slice(8))}</span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-none gap-2">
            <button type="button" onClick={() => setLangkah(1)} className="min-h-[44px] rounded-full bg-rekah px-[22px] py-[13px] font-nunito text-[15px] font-extrabold text-white shadow-[0_10px_20px_-12px_#D2559A] transition hover:bg-[#D2559A]">Tinjau sekarang</button>
            <button type="button" onClick={tundaNanti} className="min-h-[44px] rounded-full bg-white px-[18px] py-[13px] font-nunito text-[15px] font-extrabold text-[#8A5A74]">Nanti</button>
          </div>
        </div>
      </div>,
    );
  }

  // ── Meninjau (3 langkah) ──
  return kartu(
    <div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Kembali" onClick={() => setLangkah(l => (l <= 1 ? 0 : ((l - 1) as 1 | 2)))}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#FFF4F9]">
          <Svg size={16} stroke="#D2559A" sw={2.6}><path d="m15 5-7 7 7 7" /></Svg>
        </button>
        <div className="grid flex-1 grid-cols-3 gap-1.5" aria-hidden>
          {[1, 2, 3].map(n => <span key={n} className="h-1.5 rounded-full" style={{ background: n <= langkah ? '#F06BA8' : '#F3E3EB' }} />)}
        </div>
        <div className="flex-none font-nunito text-[13px] font-extrabold text-[#B48DA3]">{langkah} / 3</div>
      </div>

      {langkah === 1 && (
        <div className="jbp-pop mt-[22px]">
          <div className="font-fredoka text-[24px] font-bold text-pekat">Minggu ini terasa…</div>
          <div role="radiogroup" aria-label="Minggu ini terasa" className="mt-4 grid grid-cols-3 gap-3">
            {MOOD.map(m => {
              const on = rasa === m.id;
              return (
                <button key={m.id} type="button" role="radio" aria-checked={on} onClick={() => pilihRasa(m.id)}
                  className="flex flex-col items-center gap-2.5 rounded-[22px] px-2.5 py-[22px]"
                  style={{ background: on ? '#FDE9F2' : '#FFFAF5', border: `2px solid ${on ? '#F06BA8' : '#F6E6EE'}` }}>
                  {m.ikon}
                  <span className="font-nunito text-[16px] font-extrabold text-pekat">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {langkah === 2 && (
        <div className="jbp-pop mt-[22px]">
          <div className="font-fredoka text-[24px] font-bold text-pekat">Minggu depan, kegiatan ini…</div>
          {kegiatan.length === 0 ? (
            <p className="mt-4 rounded-[20px] border-[1.5px] border-dashed border-[#F2DDE7] p-4 text-center font-nunito text-[14px] font-bold text-[#B48DA3]">
              Belum ada Ajak Main, Wawasan Tumbuh, atau kegiatan buatanmu di papan 7 hari terakhir.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {kegiatan.map(k => {
                const kp = kepDari(k);
                return (
                  <div key={k.kunci} className="rounded-[22px] border-[1.5px] border-[#F6E6EE] bg-[#FFFAF5] px-[18px] py-4">
                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <div className="font-nunito text-[16px] font-extrabold text-pekat">{k.judul}</div>
                      <div className="font-nunito text-[12.5px] font-bold" style={{ color: WARNA_TIPE[k.tipe] }}>{LABEL_TIPE[k.tipe]}</div>
                    </div>
                    <div role="radiogroup" aria-label={`Minggu depan, ${k.judul}`} className="mt-3 grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))' }}>
                      {OPSI_KEP.map(o => {
                        const on = kp === o;
                        return (
                          <button key={o} type="button" role="radio" aria-checked={on} onClick={() => setPilihan(p => ({ ...p, [k.kunci]: o }))}
                            className="min-h-[44px] rounded-[14px] px-2 py-2.5 text-center font-nunito text-[14px] font-extrabold"
                            style={{ background: on ? '#FDE9F2' : '#fff', color: on ? '#D2559A' : '#8A5A74', border: `1.5px solid ${on ? '#F06BA8' : '#F2DDE7'}` }}>
                            {LABEL_KEPUTUSAN[o]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={() => setLangkah(3)} className="min-h-[44px] rounded-full bg-rekah px-[22px] py-3 font-nunito text-[15px] font-extrabold text-white hover:bg-[#D2559A]">Lanjut</button>
          </div>
        </div>
      )}

      {langkah === 3 && (
        <div className="jbp-pop mt-[22px]">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <div className="font-fredoka text-[24px] font-bold text-pekat">Ada yang ingin diingat?</div>
            <div className="font-nunito text-[14px] font-bold text-[#B48DA3]">boleh dilewati</div>
          </div>
          <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={3} aria-label="Ada yang ingin diingat?"
            placeholder={`Misalnya: ${nama} tertawa lama sekali waktu memilih bajunya sendiri.`}
            className="mt-3.5 block w-full resize-y rounded-[20px] border-[1.5px] border-[#F2DDE7] bg-[#FFFCF6] px-[18px] py-4 font-shantell text-[16px] leading-normal text-pekat placeholder:text-pekat/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-rekah/40" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3.5">
            <button type="button" role="switch" aria-checked={keJurnal} onClick={() => setKeJurnal(v => !v)} className="flex min-h-[44px] items-center gap-2.5">
              <span className="relative block h-6 w-10 rounded-full transition-colors" style={{ background: keJurnal ? '#5E8C3E' : '#E3D6DD' }}>
                <span className="absolute top-[3px] block h-[18px] w-[18px] rounded-full bg-white transition-[left]" style={{ left: keJurnal ? 19 : 3 }} />
              </span>
              <span className="font-nunito text-[14px] font-bold text-[#8A5A74]">Simpan ke Jurnal juga</span>
            </button>
            <button type="button" onClick={() => { void kirim(); }}
              className="flex min-h-[44px] items-center gap-2 rounded-full bg-rekah px-[22px] py-[13px] font-nunito text-[15px] font-extrabold text-white shadow-[0_10px_20px_-12px_#D2559A] hover:bg-[#D2559A]">
              <Svg size={16} stroke="#fff" sw={2.4}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></Svg>
              Bawa ke minggu depan
            </button>
          </div>
        </div>
      )}
    </div>,
  );
}

// ─── Baris "Yang Rekah sesuaikan" ─────────────────────────────────────────────

function subBaris(x: KeputusanItem): string {
  if (x.dibatalkan) return 'Dibatalkan';
  if (x.keputusan === 'pertahankan') return x.terjadwal ? `Muncul lagi ${tglPendek(x.terjadwal.tanggal)}` : 'Muncul lagi minggu depan';
  if (x.keputusan === 'ringan') return x.terjadwal ? `Versi lebih singkat, ${tglPendek(x.terjadwal.tanggal)}` : 'Versi lebih singkat minggu depan';
  if (x.keputusan === 'ganti') return 'Pilih alternatif dengan kemampuan sama';
  return 'Tidak dijadwalkan minggu depan';
}

function BarisSesuaikan({ x, idAnak, tinjau, onKeBekal }: { x: KeputusanItem; idAnak: string; tinjau: TinjauStore; onKeBekal?: () => void }) {
  const g = GAYA_KEP[x.keputusan];
  const cara = useCaraStore(idAnak);
  const [pilihSiapa, setPilihSiapa] = useState(false);
  const [jadiCara, setJadiCara] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3.5 rounded-[20px] px-4 py-3.5" style={{ background: g.soft, opacity: x.dibatalkan ? 0.7 : 1 }}>
      <span className="flex-none rounded-full bg-white px-[11px] py-[5px] font-nunito text-[12.5px] font-extrabold" style={{ color: g.ink }}>{LABEL_KEPUTUSAN[x.keputusan]}</span>
      <div className="min-w-[180px] flex-1">
        <div className="font-nunito text-[15px] font-extrabold text-pekat" style={{ textDecoration: x.dibatalkan ? 'line-through' : 'none' }}>{x.judul}</div>
        <div className="font-nunito text-[13px] font-semibold text-[#8A5A74]">{subBaris(x)}</div>
        {pilihSiapa && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="font-nunito text-[12px] font-bold text-[#8A5A74]">Cara siapa?</span>
            {(Object.keys(SIAPA_LABEL) as SiapaPengasuh[]).map(s => (
              <button key={s} type="button" onClick={() => { cara.tambah(s, `Lanjutkan: ${x.judul}`, true); setJadiCara(true); setPilihSiapa(false); }}
                className="rounded-full bg-white px-2.5 py-1 font-nunito text-[12px] font-extrabold text-pekat">{SIAPA_LABEL[s]}</button>
            ))}
            <button type="button" onClick={() => setPilihSiapa(false)} className="px-1 font-nunito text-[12px] font-extrabold text-[#B48DA3]">Batal</button>
          </div>
        )}
      </div>
      {!x.dibatalkan && x.keputusan === 'pertahankan' && !pilihSiapa && (
        jadiCara
          ? <span className="font-nunito text-[13px] font-extrabold" style={{ color: g.ink }}>Tersimpan di Cara kita mengasuh</span>
          : <button type="button" onClick={() => setPilihSiapa(true)} className="font-nunito text-[13.5px] font-extrabold" style={{ color: g.ink }}>Jadikan cara kita mengasuh →</button>
      )}
      {!x.dibatalkan && x.keputusan === 'ganti' && onKeBekal && (
        <button type="button" onClick={onKeBekal} className="font-nunito text-[13.5px] font-extrabold" style={{ color: g.ink }}>Cari di Bekal →</button>
      )}
      <button type="button" onClick={() => (x.dibatalkan ? tinjau.urungkan(x.kunci) : tinjau.batalkan(x.kunci))}
        className="min-h-[36px] rounded-full bg-white px-2.5 py-1.5 font-nunito text-[13px] font-extrabold text-[#8A5A74]">
        {x.dibatalkan ? 'Urungkan' : 'Batalkan'}
      </button>
    </div>
  );
}

function PenyesuaianKeluarga({ idAnak, onKeKeluarga }: { idAnak: string; onKeKeluarga?: () => void }) {
  const param = useParameterPenyesuaian(idAnak);
  const ringkas = catatanPenyesuaianRingkas(param);
  if (!ringkas) return null;
  return (
    <div className="mt-3.5 flex flex-wrap items-center gap-2.5 rounded-[18px] bg-[#E8F1FC] px-4 py-3">
      <Svg size={16} stroke="#4C7BC0"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></Svg>
      <span className="min-w-[180px] flex-1 font-nunito text-[13.5px] font-bold text-[#4A6A96]">Langkah dibuat lebih ringan, mengikuti keadaan keluarga</span>
      {onKeKeluarga && <button type="button" onClick={onKeKeluarga} className="font-nunito text-[13.5px] font-extrabold text-[#4C7BC0]">Kehidupan Keluarga →</button>}
    </div>
  );
}
