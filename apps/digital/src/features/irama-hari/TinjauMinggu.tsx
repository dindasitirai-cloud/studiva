// =============================================================
// TinjauMinggu + YangRekahSesuaikan — bagian P2 tab Perjalanan (Phase 21).
// - TinjauMinggu: ritual ketuk mingguan → keputusan per kegiatan menulis ke
//   Irama Keseharian minggu depan (lewat tinjauData). "Cukup berat" diarahkan ke
//   Kehidupan Keluarga (bukan mesin peringan kedua). Catatan opsional → Jurnal.
// - YangRekahSesuaikan: log keputusan tinjauan (berbasis refleksi orang tua),
//   bisa Batalkan/Urungkan; pengaruh Kehidupan Keluarga hanya disebut satu baris.
// INVARIANT: tanpa skor/angka progres; reversible; tanpa emoji. Copy DRAFT → Fitri.
// =============================================================
import React, { useState } from 'react';
import {
  Eye, Sun, Cloud, CloudRain, Heart, CalendarDays, Undo2, X, ChevronRight, Check, SlidersHorizontal,
  Feather, RefreshCw, Moon, Search, Users2, NotebookPen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';
import { getJurnalHariRentang, simpanJurnalHari } from '../../lib/supabase/rekah';
import { useCaraStore, SIAPA_LABEL, useParameterPenyesuaian, catatanPenyesuaianRingkas } from './kehidupanData';
import type { SiapaPengasuh } from './kehidupanData';
import { kumpulkanKegiatanMinggu, LABEL_KEPUTUSAN, LABEL_TIPE } from './tinjauData';
import type { Keputusan, Rasa, TinjauStore, KegiatanMinggu, KeputusanItem } from './tinjauData';

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
function tglPendek(iso: string): string { const [, m, d] = iso.split('-').map(Number); return `${d} ${BULAN[(m || 1) - 1]}`; }

const OPSI_RASA: { id: Rasa; ikon: LucideIcon; label: string }[] = [
  { id: 'ringan', ikon: Sun, label: 'Ringan' },
  { id: 'pas', ikon: Cloud, label: 'Pas' },
  { id: 'berat', ikon: CloudRain, label: 'Cukup berat' },
];
const OPSI_KEP: Keputusan[] = ['pertahankan', 'ringan', 'ganti', 'istirahat'];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 font-nunito text-[12.5px] font-bold transition ' +
        (on ? 'border-rekah bg-rekah text-white' : 'border-rekah/25 bg-white text-pekat hover:border-rekah/50')}>
      {children}
    </button>
  );
}

function NoPertanyaan({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2 font-nunito text-[13.5px] font-extrabold text-pekat">
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-fajar text-[11px] font-black text-rekah-tua">{n}</span>
      {children}
    </div>
  );
}

// ─── Tinjau Minggu ────────────────────────────────────────────────────────────

export function TinjauMinggu({ idAnak, nama, hariIni, hariMinggu, tinjau, onCeritakanBerat, onKeIrama }: {
  idAnak: string; nama: string; hariIni: string; hariMinggu: boolean; tinjau: TinjauStore;
  onCeritakanBerat?: () => void; onKeIrama?: () => void;
}) {
  const { publishedActivities } = useLearningStrategies();
  // Dibaca ulang tiap render (7 baca localStorage, ringan) agar selalu segar setelah tinjauan disimpan/diubah.
  const kegiatan = kumpulkanKegiatanMinggu(idAnak, hariIni);
  const sudah = tinjau.catatan;

  const [buka, setBuka] = useState<boolean>(hariMinggu);
  const [rasa, setRasa] = useState<Rasa | null>(null);
  const [pilihan, setPilihan] = useState<Record<string, Keputusan>>({});
  const [catatan, setCatatan] = useState('');
  const [keJurnal, setKeJurnal] = useState(true);

  const kepDari = (k: KegiatanMinggu): Keputusan => pilihan[k.kunci] ?? (k.selesai ? 'pertahankan' : 'istirahat');
  const versiRingan = (k: KegiatanMinggu): string | undefined => {
    if (k.tipe !== 'main') return undefined;
    const a = publishedActivities.find(x => x.judul.trim().toLowerCase() === k.judul.trim().toLowerCase());
    const v = a?.variasiMudah?.trim();
    return v ? `${k.judul} · versi ringan: ${v.length > 110 ? v.slice(0, 107) + '…' : v}` : undefined;
  };

  const kirim = async () => {
    const tulisJurnal = keJurnal && catatan.trim().length > 0;
    tinjau.simpan({
      rasa,
      pilihan: kegiatan.map(k => ({ k, keputusan: kepDari(k), teksVersiRingan: kepDari(k) === 'ringan' ? versiRingan(k) : undefined })),
      catatan,
      jurnal: 'tidak',
    });
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

  // ── Sudah ditinjau minggu ini ──
  if (sudah) {
    const terjadwal = sudah.keputusan.filter(x => x.terjadwal && !x.dibatalkan);
    return (
      <section className="rounded-[20px] border border-pekat/10 bg-white px-5 py-[18px]">
        <div className="mb-3 flex items-start gap-3">
          <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[12px] bg-[#E4F3EB] text-daun"><Check size={18} strokeWidth={2.4} /></span>
          <div>
            <h3 className="m-0 font-fredoka text-[17px] font-semibold text-pekat">Terima kasih sudah berhenti sejenak</h3>
            <p className="mt-0.5 font-nunito text-[12.5px] font-semibold leading-relaxed text-pekat/60">
              Tinjauan minggu ini tersimpan. {terjadwal.length > 0 ? 'Langkah yang kamu pilih sudah masuk ke Irama Keseharian minggu depan.' : 'Tidak ada langkah yang dijadwalkan ulang, dan itu tidak apa-apa.'}
            </p>
          </div>
        </div>

        {sudah.rasa === 'berat' && (
          <div className="mb-3 flex flex-wrap items-center gap-3 rounded-[16px] border border-[#D9C7E8] bg-[#F7F2FF] px-4 py-3">
            <Heart size={18} strokeWidth={2} className="flex-shrink-0 text-[#7A5CA6]" />
            <span className="min-w-[180px] flex-1 font-nunito text-[13px] font-semibold leading-relaxed text-pekat">
              Minggu ini terasa berat. Mau ceritakan apa yang membuatnya berat? Rekah akan menata langkah agar lebih ringan.
            </span>
            {onCeritakanBerat && (
              <button type="button" onClick={onCeritakanBerat} className="rounded-full border border-[#D9C7E8] bg-white px-3.5 py-2 font-nunito text-[12.5px] font-extrabold text-[#7A5CA6]">
                Ceritakan di Kehidupan Keluarga
              </button>
            )}
          </div>
        )}

        {sudah.catatan && (
          <p className="mb-3 rounded-[14px] bg-kanvas px-3.5 py-2.5 font-shantell text-[13.5px] text-pekat">
            “{sudah.catatan}”
            <span className="mt-1 block font-nunito text-[11px] font-bold text-pekat/50">
              {sudah.jurnal === 'tersimpan' ? 'Tersimpan juga di Buku perjalanan (Jurnal).' : sudah.jurnal === 'gagal' ? 'Belum bisa disimpan ke Jurnal (perlu masuk akun). Catatan tetap ada di sini.' : 'Tersimpan di tinjauan ini.'}
            </span>
          </p>
        )}

        <div className="flex flex-wrap gap-3.5">
          {onKeIrama && terjadwal.length > 0 && (
            <button type="button" onClick={onKeIrama} className="inline-flex items-center gap-1 font-nunito text-[12.5px] font-extrabold text-rekah-tua hover:underline">
              Lihat di Irama Keseharian <ChevronRight size={14} strokeWidth={2.4} />
            </button>
          )}
          <button type="button" onClick={() => { tinjau.ulang(); setBuka(true); }} className="inline-flex items-center gap-1 font-nunito text-[12.5px] font-extrabold text-pekat/55 hover:underline">
            <Undo2 size={14} strokeWidth={2.2} /> Ubah jawaban
          </button>
        </div>
      </section>
    );
  }

  // ── Belum ditinjau: ringkas ──
  if (!buka) {
    return (
      <section className="rounded-[20px] border border-pekat/10 bg-white px-5 py-[18px]">
        <div className="mb-3 flex items-start gap-3">
          <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[12px] bg-[#FCE4EE] text-rekah-tua"><Eye size={18} strokeWidth={2} /></span>
          <div>
            <h3 className="m-0 font-fredoka text-[17px] font-semibold text-pekat">Tinjau minggu ini</h3>
            <p className="mt-0.5 font-nunito text-[12.5px] font-semibold leading-relaxed text-pekat/60">Tinjauan mingguan paling pas di hari Minggu. Kalau mau, kamu bisa membukanya lebih awal.</p>
          </div>
        </div>
        <button type="button" onClick={() => setBuka(true)} className="inline-flex items-center gap-2 rounded-full border border-rekah/35 bg-white px-[18px] py-2.5 font-nunito text-[13px] font-extrabold text-rekah-tua">
          Buka tinjauan sekarang <ChevronRight size={15} strokeWidth={2.4} />
        </button>
      </section>
    );
  }

  // ── Form tinjauan ──
  return (
    <section className="rounded-[20px] border-[1.5px] border-rekah/35 bg-gradient-to-b from-[#FFF6FA] to-white px-5 py-[18px]">
      <div className="flex items-start gap-3">
        <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[12px] bg-[#FCE4EE] text-rekah-tua"><Eye size={18} strokeWidth={2} /></span>
        <div>
          <h3 className="m-0 font-fredoka text-[17px] font-semibold text-pekat">Tinjau minggu ini</h3>
          <p className="mt-0.5 font-nunito text-[12.5px] font-semibold leading-relaxed text-pekat/60">7 hari terakhir · cukup beberapa ketukan. Tidak ada jawaban yang salah.</p>
        </div>
      </div>

      <div className="mt-4">
        <NoPertanyaan n={1}>Minggu ini terasa…</NoPertanyaan>
        <div className="flex flex-wrap gap-2">
          {OPSI_RASA.map(o => <Chip key={o.id} on={rasa === o.id} onClick={() => setRasa(o.id)}><o.ikon size={15} strokeWidth={2} />{o.label}</Chip>)}
        </div>
        {rasa === 'berat' && (
          <p className="mt-2.5 flex items-start gap-2 font-shantell text-[13px] font-semibold text-daun">
            <Heart size={15} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
            Terima kasih sudah jujur. Setelah ini kamu bisa menceritakan apa yang membuatnya berat, supaya Rekah menata langkah lebih ringan.
          </p>
        )}
      </div>

      <div className="mt-4">
        <NoPertanyaan n={2}>Untuk minggu depan, bagaimana dengan kegiatan ini?</NoPertanyaan>
        {kegiatan.length === 0 ? (
          <p className="rounded-[14px] border-[1.5px] border-dashed border-rekah/25 bg-[#FFFBFD] px-3.5 py-3 font-nunito text-[12.5px] font-semibold leading-relaxed text-pekat/60">
            Belum ada kegiatan dari Bekal atau buatanmu di papan 7 hari terakhir. Kebiasaan Baik tidak ikut ditinjau karena memang berulang setiap hari.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {kegiatan.map(k => {
              const kp = kepDari(k); const vr = kp === 'ringan' ? versiRingan(k) : undefined;
              return (
                <div key={k.kunci} className="rounded-[14px] border border-pekat/[0.08] bg-[#FFFBF7] px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="min-w-[170px] flex-1">
                      <b className="block font-nunito text-[13px] font-extrabold text-pekat">{k.judul}</b>
                      <small className="font-nunito text-[11.5px] font-semibold text-pekat/55">
                        {LABEL_TIPE[k.tipe]} · {k.selesai ? 'sudah dicoba' : 'belum sempat'} · terakhir {tglPendek(k.tanggal)}
                      </small>
                    </div>
                    <div className="flex flex-wrap rounded-full bg-pucuk p-[3px]">
                      {OPSI_KEP.map(o => (
                        <button key={o} type="button" onClick={() => setPilihan(p => ({ ...p, [k.kunci]: o }))} aria-pressed={kp === o}
                          className={'rounded-full px-2.5 py-1.5 font-nunito text-[11.5px] font-extrabold ' + (kp === o ? 'bg-white text-rekah-tua shadow-[0_2px_6px_-2px_rgba(110,59,87,.3)]' : 'text-pekat/60')}>
                          {LABEL_KEPUTUSAN[o]}
                        </button>
                      ))}
                    </div>
                  </div>
                  {kp === 'ringan' && (
                    <p className="mb-0 mt-1.5 font-nunito text-[11.5px] font-semibold text-pekat/60">
                      {vr ? vr.split(' · ')[1] : 'Akan dijadwalkan dengan catatan "versi lebih ringan" — perpendek durasi dan ikuti tempo si kecil.'}
                    </p>
                  )}
                  {kp === 'ganti' && <p className="mb-0 mt-1.5 font-nunito text-[11.5px] font-semibold text-pekat/60">Tidak dijadwalkan ulang. Kamu bisa mencari cara lain di Bekal.</p>}
                </div>
              );
            })}
          </div>
        )}
        <p className="mb-0 mt-2 font-nunito text-[11px] font-semibold text-pekat/45">Pertahankan & Lebih ringan akan muncul di hari yang sama minggu depan. Semua bisa dibatalkan.</p>
      </div>

      <div className="mt-4">
        <NoPertanyaan n={3}>Catatan untuk dirimu <span className="font-semibold text-pekat/45">(boleh dilewati)</span></NoPertanyaan>
        <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={2}
          placeholder={`Misalnya: ${nama} tertawa lama sekali waktu memilih bajunya sendiri.`}
          className="w-full resize-y rounded-[14px] border border-rekah/25 bg-white px-3 py-2.5 font-nunito text-[13px] text-pekat placeholder:text-pekat/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah" />
        <label className="mt-1.5 flex items-center gap-2 font-nunito text-[12px] font-bold text-pekat/60">
          <input type="checkbox" checked={keJurnal} onChange={e => setKeJurnal(e.target.checked)} /> Simpan juga ke Buku perjalanan (Jurnal)
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <button type="button" onClick={kirim} className="inline-flex items-center gap-2 rounded-full bg-rekah px-[18px] py-2.5 font-nunito text-[13px] font-extrabold text-white">
          <CalendarDays size={16} strokeWidth={2.2} /> Bawa ke minggu depan
        </button>
        {!hariMinggu && (
          <button type="button" onClick={() => setBuka(false)} className="rounded-full border border-rekah/35 bg-white px-[18px] py-2.5 font-nunito text-[13px] font-extrabold text-rekah-tua">Nanti saja</button>
        )}
      </div>
    </section>
  );
}

// ─── Yang Rekah sesuaikan ─────────────────────────────────────────────────────

const GAYA_KEP: Record<Exclude<Keputusan, 'istirahat'>, { ikon: LucideIcon; bg: string; ink: string }> = {
  pertahankan: { ikon: RefreshCw, bg: '#E4F3EB', ink: '#3F7A4F' },
  ringan: { ikon: Feather, bg: '#FFF3D6', ink: '#B98900' },
  ganti: { ikon: Search, bg: '#F1EAFB', ink: '#7A5CA6' },
};

function judulBaris(x: KeputusanItem): string {
  if (x.keputusan === 'pertahankan') return `"${x.judul}" dilanjutkan minggu depan`;
  if (x.keputusan === 'ringan') return `"${x.judul}" dibuat lebih ringan`;
  return `"${x.judul}" dicoba dengan cara lain`;
}
function alasanBaris(x: KeputusanItem): string {
  if (x.dibatalkan) return 'Dibatalkan. Langkah kembali seperti semula.';
  if (x.keputusan === 'ganti') return 'Kamu memilih ganti cara saat tinjauan. Cari alternatif dengan kemampuan yang sama di Bekal.';
  const tgl = x.terjadwal ? tglPendek(x.terjadwal.tanggal) : '';
  return x.keputusan === 'ringan'
    ? `Dijadwalkan ${tgl} dalam versi lebih ringan, sesuai pilihanmu saat tinjauan.`
    : `Dijadwalkan lagi ${tgl}, sesuai pilihanmu saat tinjauan.`;
}

export function YangRekahSesuaikan({ idAnak, tinjau, onKeKeluarga, onKeBekal }: {
  idAnak: string; tinjau: TinjauStore; onKeKeluarga?: () => void; onKeBekal?: () => void;
}) {
  const cara = useCaraStore(idAnak);
  const param = useParameterPenyesuaian(idAnak);
  const catatanKel = catatanPenyesuaianRingkas(param);
  const [pilihSiapa, setPilihSiapa] = useState<string | null>(null);
  const [jadiCara, setJadiCara] = useState<Set<string>>(new Set());

  const daftar = (tinjau.catatan?.keputusan ?? []).filter(x => x.keputusan !== 'istirahat');

  return (
    <section className="rounded-[20px] border border-pekat/10 bg-white px-5 py-[18px]">
      <div className="mb-3.5 flex items-start gap-3">
        <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[12px] bg-[#EAF2FF] text-[#4A78C2]"><SlidersHorizontal size={18} strokeWidth={2} /></span>
        <div>
          <h3 className="m-0 font-fredoka text-[17px] font-semibold text-pekat">Yang Rekah sesuaikan</h3>
          <p className="mt-0.5 font-nunito text-[12.5px] font-semibold leading-relaxed text-pekat/60">Dari jawabanmu saat tinjauan. Semua bisa dibatalkan.</p>
        </div>
      </div>

      {daftar.length === 0 ? (
        <div className="rounded-[16px] border-[1.5px] border-dashed border-rekah/30 bg-[#FFFBFD] px-4 py-3.5 text-center">
          <b className="block font-nunito text-[13px] font-extrabold text-pekat">Belum ada penyesuaian minggu ini</b>
          <p className="mb-0 mt-1 font-nunito text-[12.5px] font-semibold text-pekat/60">Penyesuaian akan muncul di sini setelah kamu meninjau minggu ini.</p>
        </div>
      ) : (
        <div>
          {daftar.map((x, i) => {
            const g = GAYA_KEP[x.keputusan as Exclude<Keputusan, 'istirahat'>];
            const sudahCara = jadiCara.has(x.kunci);
            return (
              <div key={x.kunci} className={'flex flex-wrap items-start gap-3 py-3 ' + (i < daftar.length - 1 ? 'border-b border-dotted border-pekat/15' : '')}>
                <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[11px]" style={{ background: g.bg, color: g.ink }}><g.ikon size={17} strokeWidth={2} /></span>
                <div className="min-w-[180px] flex-1">
                  <b className={'block font-nunito text-[13.5px] font-extrabold leading-snug ' + (x.dibatalkan ? 'text-pekat/45 line-through' : 'text-pekat')}>{judulBaris(x)}</b>
                  <p className="mb-0 mt-0.5 font-nunito text-[12px] font-semibold leading-relaxed text-pekat/60">{alasanBaris(x)}</p>
                  {x.keputusan === 'pertahankan' && !x.dibatalkan && (
                    sudahCara ? (
                      <span className="mt-1.5 inline-flex items-center gap-1 font-nunito text-[11.5px] font-extrabold text-daun"><Check size={13} strokeWidth={2.6} /> Tersimpan di Cara kita mengasuh</span>
                    ) : pilihSiapa === x.kunci ? (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="font-nunito text-[11.5px] font-bold text-pekat/55">Cara siapa?</span>
                        {(Object.keys(SIAPA_LABEL) as SiapaPengasuh[]).map(s => (
                          <button key={s} type="button" onClick={() => { cara.tambah(s, `Lanjutkan: ${x.judul}`, true); setJadiCara(p => new Set(p).add(x.kunci)); setPilihSiapa(null); }}
                            className="rounded-full border border-rekah/25 bg-white px-2.5 py-1 font-nunito text-[11.5px] font-extrabold text-pekat">{SIAPA_LABEL[s]}</button>
                        ))}
                        <button type="button" onClick={() => setPilihSiapa(null)} aria-label="Tutup" className="p-1 text-pekat/45"><X size={13} /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setPilihSiapa(x.kunci)} className="mt-1.5 inline-flex items-center gap-1 font-nunito text-[11.5px] font-extrabold text-[#7A5CA6] hover:underline">
                        <Users2 size={13} strokeWidth={2.2} /> Jadikan cara kita mengasuh
                      </button>
                    )
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="whitespace-nowrap rounded-full px-2.5 py-0.5 font-nunito text-[10.5px] font-extrabold" style={{ background: g.bg, color: g.ink }}>{LABEL_KEPUTUSAN[x.keputusan]}</span>
                  {x.dibatalkan ? (
                    <button type="button" onClick={() => tinjau.urungkan(x.kunci)} className="inline-flex items-center gap-1 font-nunito text-[12px] font-extrabold text-rekah-tua hover:underline"><Undo2 size={13} /> Urungkan</button>
                  ) : x.keputusan === 'ganti' ? (
                    <span className="flex gap-3">
                      {onKeBekal && <button type="button" onClick={onKeBekal} className="inline-flex items-center gap-1 font-nunito text-[12px] font-extrabold text-rekah-tua hover:underline">Cari di Bekal <ChevronRight size={13} /></button>}
                      <button type="button" onClick={() => tinjau.batalkan(x.kunci)} className="inline-flex items-center gap-1 font-nunito text-[12px] font-extrabold text-pekat/55 hover:underline"><X size={13} /> Batalkan</button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => tinjau.batalkan(x.kunci)} className="inline-flex items-center gap-1 font-nunito text-[12px] font-extrabold text-rekah-tua hover:underline"><X size={13} /> Batalkan</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {catatanKel && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[14px] bg-[#EAF2FF] px-3.5 py-2.5 font-nunito text-[12px] font-semibold text-pekat/70">
          <Moon size={15} strokeWidth={2} className="flex-shrink-0 text-[#4A78C2]" />
          <span className="min-w-[160px] flex-1">Langkah minggu ini juga {catatanKel}, mengikuti keadaan keluarga.</span>
          {onKeKeluarga && <button type="button" onClick={onKeKeluarga} className="inline-flex items-center gap-1 font-extrabold text-[#4A78C2] hover:underline">Lihat Kehidupan Keluarga <ChevronRight size={13} /></button>}
        </div>
      )}

      <div className="mt-3"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1EAFB] px-2.5 py-1 font-nunito text-[10.5px] font-extrabold text-[#7A5CA6]"><NotebookPen size={12} strokeWidth={2.2} /> Disusun Rekah dari jawabanmu</span></div>
    </section>
  );
}
