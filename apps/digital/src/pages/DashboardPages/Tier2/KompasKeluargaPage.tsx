// =============================================================
// Kompas Keluarga — section GROUND dari Family Journey Map.
// Tiga bagian yang berubah dinamis:
//   1. Arah Keluarga        (Family Direction — nilai & visi; berubah saat caregiver tanam/cabut nilai)
//   2. Konteks Hidup        (Family Life Context — tahap & situasi; berubah sesuai usia anak)
//   3. Kompas Perkembangan  (Development Compass — tahap umum per usia + pengamatan caregiver; tanpa skor)
// Ketiganya menghasilkan Fokus minggu ini (kegiatan relevan + pengetahuan) yang tampil di Irama Hari.
// Additive: memakai context yang sudah ada. STATUS: DRAFT copy — menunggu review Psikolog Fitri Effendy.
// =============================================================
import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sprout, Home, ArrowRight, Info, Check, History } from 'lucide-react';
import { useAnakAktif } from '../../../context/AnakContext';
import { useAkarStateSync } from '../../../features/akar-keluarga/state';
import type { NilaiAkar } from '../../../features/akar-keluarga/content';
import { BANDS, CONTOH_VISI } from '../../../features/akar-keluarga/content';
import { useChildProfile } from '../../../features/beranda-usia/useChildProfile';
import { promptsForAge } from '../../../features/rekah-journey/observation/observationPrompts';
import { useObservasiKompas } from '../../../hooks/useObservasiKompas';
import { useJejakPengamatan } from '../../../hooks/useJejakPengamatan';
import { useObservasiTeks } from '../../../hooks/useObservasiTeks';

// Ambang atas (bulan) tiap band, sejajar urutan BANDS di akar-keluarga/content.ts.
const AMBANG_BAND = [3, 6, 9, 12, 18, 24, 36, 48, 60, 72];

function bandDariUsia(usiaBulan: number | null) {
  if (usiaBulan === null) return null;
  const idx = AMBANG_BAND.findIndex(batas => usiaBulan < batas);
  const i = idx === -1 ? BANDS.length - 1 : idx;
  return BANDS[i] ?? null;
}

function waktuRelatif(iso: string): string {
  const selisih = Date.now() - new Date(iso).getTime();
  const hari = Math.floor(selisih / 86400000);
  if (hari <= 0) return 'hari ini';
  if (hari === 1) return 'kemarin';
  if (hari < 7) return `${hari} hari lalu`;
  const minggu = Math.floor(hari / 7);
  if (minggu === 1) return 'sepekan lalu';
  if (minggu < 5) return `${minggu} pekan lalu`;
  const bulan = Math.floor(hari / 30);
  if (bulan <= 1) return 'sebulan lalu';
  return `${bulan} bulan lalu`;
}

function kunciCatatan(id: string): string {
  return `rekah_catatan_kompas_${id}`;
}
function bacaCatatan(id: string): string {
  try {
    return window.localStorage.getItem(kunciCatatan(id)) ?? '';
  } catch {
    return '';
  }
}
export default function KompasKeluargaPage() {
  const { anak } = useAnakAktif();
  const [akarState] = useAkarStateSync(anak.id);
  const { profile, sapaan, usiaBulan } = useChildProfile();

  const nilai = akarState.nilai as NilaiAkar[];
  const visi = akarState.visi?.trim() ?? '';
  const band = useMemo(() => bandDariUsia(usiaBulan), [usiaBulan]);
  const nama = profile.namaAnak || sapaan.cap || 'si kecil';

  // Development Compass: tahap yang umum di usia ini + pengamatan caregiver.
  const prompts = useMemo(() => promptsForAge(usiaBulan), [usiaBulan]);
  const observasi = useObservasiKompas(anak.id);
  const jejak = useJejakPengamatan(anak.id, observasi.dipilih.join(','));
  const obsTeks = useObservasiTeks(anak.id);
  const [catatan, setCatatan] = useState<string>(() => bacaCatatan(anak.id));
  useEffect(() => { setCatatan(bacaCatatan(anak.id)); }, [anak.id]);
  const ubahCatatan = (v: string) => {
    setCatatan(v);
    try { window.localStorage.setItem(kunciCatatan(anak.id), v); } catch { /* abaikan */ }
  };
  const simpanCatatan = () => {
    if (catatan.trim().length < 3) return;
    obsTeks.tambah(catatan);
    ubahCatatan('');
  };
  const timeline = useMemo(() => {
    const arr: { key: string; waktu: string; kind: 'prompt' | 'teks'; label: string; sub: string; aktif?: boolean }[] = [];
    for (const e of jejak) {
      arr.push({
        key: 'p-' + e.idPrompt,
        waktu: e.firstSeen,
        kind: 'prompt',
        label: e.label,
        sub: `Mulai diperhatikan ${waktuRelatif(e.firstSeen)}${e.aktif ? ' · masih diamati' : ' · dulu diamati'}`,
        aktif: e.aktif,
      });
    }
    for (const n of obsTeks.daftar) {
      arr.push({ key: 't-' + n.pada, waktu: n.pada, kind: 'teks', label: n.teks, sub: waktuRelatif(n.pada) });
    }
    return arr.sort((a, b) => a.waktu.localeCompare(b.waktu));
  }, [jejak, obsTeks.daftar]);

  const usiaTeks = useMemo(() => {
    if (usiaBulan === null) return null;
    const th = Math.floor(usiaBulan / 12);
    const bl = usiaBulan % 12;
    if (th <= 0) return `${bl} bulan`;
    return bl === 0 ? `${th} tahun` : `${th} tahun ${bl} bulan`;
  }, [usiaBulan]);

  return (
    <div
      style={{ background: '#FCEBD7' }}
      className="-mx-5 sm:-mx-8 px-5 sm:px-[46px] pt-[34px] pb-14 min-h-screen"
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="mb-6">
        <p className="font-shantell text-rekah text-lg">kompas keluarga</p>
        <h1 className="mt-1 font-fredoka text-[26px] sm:text-[30px] font-semibold text-pekat leading-tight">
          Di mana keluarga kita sekarang?
        </h1>
        <p className="mt-2 max-w-[62ch] font-nunito text-[15px] text-pekat/70">
          Ruang untuk mengenali arah, konteks, dan tumbuh kembang {nama}. Ketiganya berubah seiring
          waktu &mdash; dan bersama menuntun apa yang paling relevan pekan ini.
        </p>
      </header>

      <div className="flex flex-col gap-5 max-w-[880px]">

        {/* ── 1. Arah Keluarga ─────────────────────────────── */}
        <section className="rounded-[24px] bg-white p-6 sm:p-7 shadow-[0_20px_46px_-36px_rgba(90,50,70,.5)] border border-rekah/10">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-rekah text-white">
              <Sprout aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-fredoka text-[20px] font-semibold text-pekat leading-none">Arah Keluarga</h2>
              <p className="mt-1 font-nunito text-[12px] font-bold uppercase tracking-wider text-pekat/40">
                Keluarga seperti apa yang ingin kita bangun?
              </p>
            </div>
          </div>

          {nilai.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {nilai.map(n => (
                <span key={n} className="rounded-full bg-rekah px-3.5 py-1.5 font-nunito text-[13px] font-bold text-white">
                  {n}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 font-nunito text-[14px] text-pekat/60">
              Belum ada nilai yang ditanam. Pilih beberapa nilai inti yang ingin keluarga rawat.
            </p>
          )}

          {visi ? (
            <p className="mt-4 rounded-[14px] border border-rekah/10 bg-fajar px-4 py-3 font-shantell text-[16px] text-pekat">
              &ldquo;{visi}&rdquo;
            </p>
          ) : (
            <p className="mt-4 rounded-[14px] border border-rekah/10 bg-fajar/60 px-4 py-3 font-nunito text-[14px] text-pekat/55">
              <span className="font-bold uppercase text-[10px] tracking-wider text-pekat/40">contoh visi</span><br />
              <span className="font-shantell text-[15px]">&ldquo;{CONTOH_VISI[0]}&rdquo;</span>
            </p>
          )}

          <Link
            to="/dashboard/tier2/bekal"
            className="mt-4 inline-flex items-center gap-1.5 font-nunito text-[14px] font-extrabold text-rekah no-underline hover:underline"
          >
            Tambah atau ubah nilai keluarga <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </section>

        {/* ── 2. Konteks Hidup Keluarga ────────────────────── */}
        <section className="rounded-[24px] bg-white p-6 sm:p-7 shadow-[0_20px_46px_-36px_rgba(90,50,70,.5)] border border-rekah/10">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-langit text-white">
              <Home aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-fredoka text-[20px] font-semibold text-pekat leading-none">Konteks Hidup Keluarga</h2>
              <p className="mt-1 font-nunito text-[12px] font-bold uppercase tracking-wider text-pekat/40">
                Kondisi keluarga kita sekarang seperti apa?
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="font-nunito text-[11px] font-extrabold uppercase tracking-wider text-pekat/40">Anak dalam fokus</p>
              <p className="mt-0.5 font-nunito text-[16px] font-bold text-pekat">
                {nama}{usiaTeks ? ` · ${usiaTeks}` : ''}
              </p>
            </div>
            {band && (
              <div>
                <p className="font-nunito text-[11px] font-extrabold uppercase tracking-wider text-pekat/40">Tahap usia</p>
                <p className="mt-0.5 font-nunito text-[16px] font-bold text-pekat">{band.judul} &middot; {band.usia}</p>
              </div>
            )}
            {band && (
              <div className="sm:col-span-2">
                <p className="font-nunito text-[11px] font-extrabold uppercase tracking-wider text-pekat/40">Fokus tahap</p>
                <p className="mt-0.5 font-nunito text-[15px] text-pekat/85">{band.nilaiInti}</p>
              </div>
            )}
          </div>
        </section>

        {/* ── 3. Kompas Perkembangan (tahap per usia + pengamatan) ── */}
        <section className="rounded-[24px] bg-white p-6 sm:p-7 shadow-[0_20px_46px_-36px_rgba(90,50,70,.5)] border border-rekah/10">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-daun text-white">
              <Compass aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-fredoka text-[20px] font-semibold text-pekat leading-none">Kompas Perkembangan</h2>
              <p className="mt-1 font-nunito text-[12px] font-bold uppercase tracking-wider text-pekat/40">
                Apa yang sedang terjadi pada anak?
              </p>
            </div>
          </div>

          <p className="mt-4 font-nunito text-[15px] text-pekat/80 max-w-[60ch]">
            Hal yang umum berkembang di usia {nama}{band ? ` (${band.usia})` : ''}. Tandai yang sedang Ibu
            amati &mdash; penjelasannya akan muncul. Ini bukan penilaian, hanya membaca ke mana {nama} tumbuh.
          </p>

          {prompts.length === 0 ? (
            <p className="mt-4 rounded-[16px] border border-rekah/10 bg-white/70 px-4 py-4 font-nunito text-[14px] text-pekat/60">
              Belum ada daftar tahap untuk usia ini. Ibu tetap bisa mengamati dengan cara sendiri.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              {prompts.map(p => {
                const aktif = observasi.has(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => observasi.toggle(p.id)}
                    aria-pressed={aktif}
                    className={
                      'text-left rounded-[15px] border px-4 py-3 transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daun ' +
                      (aktif ? 'border-daun/50 bg-daun/[0.08]' : 'border-rekah/10 bg-white hover:border-daun/30')
                    }
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={
                          'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ' +
                          (aktif ? 'border-daun bg-daun text-white' : 'border-pekat/25 text-transparent')
                        }
                      >
                        <Check aria-hidden className="h-3 w-3" />
                      </span>
                      <span className="font-nunito text-[14.5px] font-bold text-pekat">{p.label}</span>
                    </span>
                    {aktif && p.hint && (
                      <span className="mt-2 block pl-[30px] font-nunito text-[13px] leading-relaxed text-pekat/70">
                        {p.hint}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Tulis sendiri → simpan ke Jejak; kegiatan cocok muncul di Fokus */}
          <div className="mt-5 border-t border-rekah/10 pt-4">
            <label htmlFor="catatan-kompas" className="font-nunito text-[13px] font-bold text-pekat">
              Atau tulis sendiri yang kamu amati
            </label>
            <textarea
              id="catatan-kompas"
              value={catatan}
              onChange={e => ubahCatatan(e.target.value)}
              rows={2}
              placeholder={`Mis. ${nama} suka meraih benda dan berguling…`}
              className="mt-2 w-full resize-none rounded-[14px] border border-rekah/15 bg-white px-3.5 py-2.5 font-nunito text-[14px] text-pekat placeholder:text-pekat/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daun"
            />
            <button
              type="button"
              onClick={simpanCatatan}
              disabled={catatan.trim().length < 3}
              className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-[22px] bg-daun px-5 py-2.5 font-nunito text-[13px] font-extrabold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
            >
              Simpan ke jejak
            </button>
            <p className="mt-1.5 font-nunito text-[11.5px] text-pekat/45">
              Catatanmu masuk ke Jejak Perkembangan; kegiatan yang cocok akan muncul di Fokus minggu ini.
            </p>
          </div>

          <p className="mt-3 inline-flex items-center gap-1.5 font-nunito text-[12.5px] font-semibold text-pekat/45">
            <Info aria-hidden className="h-3.5 w-3.5" /> Tanpa skor, peringkat, atau perbandingan dengan anak lain.
          </p>
        </section>

        {/* ── Jejak perkembangan (kontinuitas lintas waktu) ── */}
        {timeline.length > 0 && (
          <section className="rounded-[24px] bg-white p-6 sm:p-7 shadow-[0_20px_46px_-36px_rgba(90,50,70,.5)] border border-rekah/10">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-daun text-white">
                <History aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-fredoka text-[20px] font-semibold text-pekat leading-none">Jejak perkembangan</h2>
                <p className="mt-1 font-nunito text-[12px] font-bold uppercase tracking-wider text-pekat/40">
                  Yang {nama} tunjukkan dari waktu ke waktu
                </p>
              </div>
            </div>

            <ol className="mt-5 flex flex-col gap-4 border-l-2 border-rekah/12 pl-5">
              {timeline.map(t => (
                <li key={t.key} className="relative">
                  <span
                    aria-hidden
                    className={
                      'absolute -left-[27px] top-0.5 h-3 w-3 rounded-full border-2 ' +
                      (t.kind === 'teks' ? 'border-rekah bg-rekah' : t.aktif ? 'border-daun bg-daun' : 'border-pekat/25 bg-white')
                    }
                  />
                  {t.kind === 'teks' ? (
                    <p className="font-nunito text-[14px] italic text-pekat">&ldquo;{t.label}&rdquo;</p>
                  ) : (
                    <p className="font-nunito text-[14px] font-bold text-pekat">{t.label}</p>
                  )}
                  <p className="mt-0.5 font-nunito text-[12.5px] text-pekat/55">{t.sub}</p>
                </li>
              ))}
            </ol>

            <p className="mt-4 font-nunito text-[12px] text-pekat/40">
              Bukan tonggak wajib — hanya jejak lembut arah tumbuh {nama}, sepekan demi sepekan.
            </p>
          </section>
        )}

        {/* ── Fokus minggu ini — turunan dari ketiga bagian di atas ── */}
        <section className="rounded-[24px] border border-rekah/20 bg-gradient-to-br from-fajar via-white to-white p-6 sm:p-7 shadow-[0_20px_46px_-34px_rgba(90,50,70,.5)]">
          <p className="font-shantell text-rekah text-[17px]">ketiganya menghasilkan</p>
          <h2 className="mt-0.5 font-fredoka text-[22px] font-semibold text-pekat">Fokus minggu ini</h2>
          <p className="mt-1 max-w-[60ch] font-nunito text-[14px] text-pekat/70">
            Dari arah keluarga, konteks usia {nama}, dan yang sedang Ibu amati, Rekah menyiapkan
            <b className="text-pekat/85"> kegiatan yang paling relevan untuk {nama}</b> dan
            <b className="text-pekat/85"> pengetahuan untuk Ibu</b> pekan ini &mdash; bukan sekadar daftar konten.
          </p>
          <Link
            to="/dashboard/tier2/irama-hari"
            className="mt-4 inline-flex items-center gap-2 rounded-[26px] bg-rekah px-6 py-3 min-h-[44px] font-nunito font-extrabold text-white no-underline shadow-[0_10px_20px_-10px_rgba(240,107,168,.8)]"
          >
            Lihat Fokus minggu ini di Irama Hari <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </section>

        <p className="text-center font-nunito text-[12.5px] font-semibold text-pekat/35 mt-2">
          Rekah mendampingi Buku KIA, bukan menggantikannya.
        </p>
      </div>
    </div>
  );
}
