// ============================================================================
// ProfilAnakTier2 — halaman Profil Anak.
//
// Halaman ini membaca dari AnakContext, sumber data anak yang sama dengan
// yang ditulis wizard. Apa pun yang diisi di wizard langsung terlihat di sini.
//
// Tab lama warisan Studiva (Tipe Belajar, Perjalanan Pembelajaran, Jurnal
// Perkembangan) sudah dihapus. Isinya sekarang konsep Rekah: musim tumbuh,
// nilai yang ditanam di Taman Akar, dan pendamping.
//
// Tanggal lahir tetap terkunci. Koreksi lewat permohonan yang ditinjau admin,
// dan ditolak juga di level database oleh trigger tolak_ubah_tanggal_lahir.
// ============================================================================

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Edit2,
  Flower2,
  Lock,
  Plus,
  Send,
  Sprout,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useAnak, useAnakAktif, useFotoAnak } from '../../../context/AnakContext';
import { ajukanKoreksiTanggalLahir } from '../../../lib/supabase/rekah';
import { useAkarStateSync } from '../../../features/akar-keluarga/state';
import { BANDS, PENJELASAN_NILAI, type NilaiAkar } from '../../../features/akar-keluarga/content';
import {
  formatUsia,
  inisialAnak,
  pendampingKosong,
  sapaanPendamping,
  LABEL_JENIS_KELAMIN,
  LABEL_PERAN,
  MAKS_PENDAMPING,
  PERAN_PENDAMPING,
  SAPAAN_CADANGAN,
  type JenisKelamin,
  type Pendamping,
  type ProfilAnak,
} from '../../../types/anak';

const HARI_INI = new Date().toISOString().split('T')[0];

const GAYA_INPUT =
  'w-full rounded-xl border border-mawar bg-white px-4 py-2.5 text-[15px] text-pekat transition focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20';

function tanggalIndonesia(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  anak,
  ukuran = 72,
  onGanti,
}: {
  anak: ProfilAnak;
  ukuran?: number;
  onGanti?: (file: File) => void;
}) {
  const foto = useFotoAnak(anak.fotoPath);
  const inputRef = useRef<HTMLInputElement>(null);

  const isi = foto ? (
    <img src={foto} alt="" className="h-full w-full object-cover" />
  ) : (
    <span
      className="font-bricolage font-extrabold text-rekah"
      style={{ fontSize: Math.round(ukuran * 0.38) }}
    >
      {inisialAnak(anak.namaAnak)}
    </span>
  );

  const bingkai = (
    <span
      className="flex items-center justify-center overflow-hidden border-4 border-mawar bg-mawar"
      style={{ width: ukuran, height: ukuran, borderRadius: '70% 70% 70% 6px' }}
    >
      {isi}
    </span>
  );

  if (!onGanti) return bingkai;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={`Ganti foto ${anak.namaAnak}`}
        className="block transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
        style={{ borderRadius: '70% 70% 70% 6px' }}
      >
        {bingkai}
      </button>
      <span className="pointer-events-none absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-madu text-white shadow">
        <Camera className="h-3.5 w-3.5" aria-hidden />
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) onGanti(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ── Modal koreksi tanggal lahir ──────────────────────────────────────────────

function ModalKoreksiTanggal({
  idAnak,
  tanggalSekarang,
  onTutup,
}: {
  idAnak: string;
  tanggalSekarang: string;
  onTutup: () => void;
}) {
  const [tanggalBaru, setTanggalBaru] = useState('');
  const [alasan, setAlasan] = useState('');
  const [status, setStatus] = useState<'idle' | 'mengirim' | 'terkirim' | 'gagal'>('idle');

  async function kirim() {
    if (!tanggalBaru || !alasan.trim()) return;
    setStatus('mengirim');
    try {
      await ajukanKoreksiTanggalLahir(idAnak, tanggalBaru, alasan.trim());
      setStatus('terkirim');
    } catch {
      setStatus('gagal');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pekat/30 px-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-madu" aria-hidden />
            <h3 className="font-bricolage text-[17px] font-bold text-pekat">Permohonan koreksi</h3>
          </div>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-fajar text-pekat/50 transition hover:text-pekat"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {status === 'terkirim' ? (
          <div className="rounded-xl bg-mawar/30 px-4 py-5 text-center">
            <p className="font-semibold text-rekah-tua">Permohonan terkirim.</p>
            <p className="mt-1 text-[13px] text-pekat/65">
              Tim Rekah akan meninjau dan menghubungimu.
            </p>
            <button
              type="button"
              onClick={onTutup}
              className="mt-4 rounded-full bg-madu px-5 py-2 text-[14px] font-bold text-white transition hover:bg-rekah"
            >
              Tutup
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-[13px] text-pekat/65">
              Tanggal lahir tersimpan:{' '}
              <span className="font-semibold text-pekat">{tanggalIndonesia(tanggalSekarang)}</span>
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="pa-tanggal-baru" className="mb-1 block text-[13px] font-semibold text-pekat">
                  Tanggal yang benar
                </label>
                <input
                  id="pa-tanggal-baru"
                  type="date"
                  max={HARI_INI}
                  value={tanggalBaru}
                  onChange={e => setTanggalBaru(e.target.value)}
                  className={GAYA_INPUT}
                />
              </div>
              <div>
                <label htmlFor="pa-alasan" className="mb-1 block text-[13px] font-semibold text-pekat">
                  Alasan
                </label>
                <textarea
                  id="pa-alasan"
                  rows={3}
                  value={alasan}
                  onChange={e => setAlasan(e.target.value)}
                  placeholder="Ceritakan singkat kenapa perlu dikoreksi."
                  className={`${GAYA_INPUT} resize-none`}
                />
              </div>
              {status === 'gagal' && (
                <p role="alert" className="text-[12px] text-rekah">
                  Permohonan belum terkirim. Periksa koneksi lalu coba lagi.
                </p>
              )}
              <button
                type="button"
                onClick={kirim}
                disabled={status === 'mengirim' || !tanggalBaru || !alasan.trim()}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-madu px-5 font-bricolage text-[15px] font-bold text-white transition hover:bg-rekah disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" aria-hidden />
                {status === 'mengirim' ? 'Mengirim...' : 'Kirim permohonan'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Modal edit profil ────────────────────────────────────────────────────────

function ModalEditProfil({ anak, onTutup }: { anak: ProfilAnak; onTutup: () => void }) {
  const { perbaruiAnak } = useAnak();
  const [nama, setNama] = useState(anak.namaAnak);
  const [kelamin, setKelamin] = useState<JenisKelamin | null>(anak.jenisKelamin);
  const [pendamping, setPendamping] = useState<Pendamping[]>(
    anak.pendamping.length > 0 ? anak.pendamping : [pendampingKosong()],
  );
  const [galat, setGalat] = useState('');
  const [menyimpan, setMenyimpan] = useState(false);
  const [koreksiTerbuka, setKoreksiTerbuka] = useState(false);

  const pendampingPenuh = pendamping.length >= MAKS_PENDAMPING;

  function ubahPendamping(i: number, patch: Partial<Pendamping>) {
    setPendamping(prev => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  function hapusPendamping(i: number) {
    setPendamping(prev => {
      const sisa = prev.filter((_, idx) => idx !== i);
      return sisa.length > 0 ? sisa : [pendampingKosong()];
    });
  }

  async function simpan() {
    if (nama.trim().length < 2) {
      setGalat('Nama panggilan minimal 2 huruf.');
      return;
    }
    setGalat('');
    setMenyimpan(true);
    try {
      // Baris pendamping yang panggilannya kosong dibuang di AnakContext.
      await perbaruiAnak(anak.id, {
        namaAnak: nama.trim(),
        jenisKelamin: kelamin,
        pendamping,
      });
      onTutup();
    } catch {
      setGalat('Perubahan belum tersimpan. Coba lagi ya.');
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-pekat/30 px-4 py-8">
        <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-bricolage text-[19px] font-bold text-pekat">
              Ubah profil {anak.namaAnak}
            </h2>
            <button
              type="button"
              onClick={onTutup}
              aria-label="Tutup"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-fajar text-pekat/50 transition hover:text-pekat"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="pa-nama" className="mb-1 block text-[13px] font-semibold text-pekat">
                Nama panggilan
              </label>
              <input
                id="pa-nama"
                value={nama}
                onChange={e => setNama(e.target.value)}
                className={GAYA_INPUT}
              />
            </div>

            {/* Tanggal lahir terkunci */}
            <div>
              <span className="mb-1 block text-[13px] font-semibold text-pekat">Tanggal lahir</span>
              <div className="flex items-center gap-2 rounded-xl border border-mawar bg-fajar px-4 py-2.5">
                <Lock className="h-4 w-4 shrink-0 text-madu" aria-hidden />
                <span className="flex-1 text-[15px] text-pekat">
                  {tanggalIndonesia(anak.tanggalLahir)}
                </span>
                <button
                  type="button"
                  onClick={() => setKoreksiTerbuka(true)}
                  className="text-[12px] font-semibold text-rekah underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
                >
                  Butuh koreksi?
                </button>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-pekat/45">
                Tanggal lahir menentukan seluruh isi dashboard, jadi perubahannya ditinjau dulu.
              </p>
            </div>

            <fieldset>
              <legend className="mb-1.5 text-[13px] font-semibold text-pekat">Jenis kelamin</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(LABEL_JENIS_KELAMIN) as JenisKelamin[]).map(key => {
                  const dipilih = kelamin === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={dipilih}
                      onClick={() => setKelamin(dipilih ? null : key)}
                      className={`min-h-[42px] rounded-full border-2 px-4 text-[14px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
                        dipilih
                          ? 'border-rekah bg-rekah text-white'
                          : 'border-mawar/60 bg-white text-pekat hover:border-rekah/40'
                      }`}
                    >
                      {LABEL_JENIS_KELAMIN[key]}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Pendamping — boleh lebih dari satu */}
            <div>
              <span className="mb-1.5 block text-[13px] font-semibold text-pekat">Pendamping</span>
              <div className="flex flex-col gap-3">
                {pendamping.map((p, i) => (
                  <div key={i} className="rounded-xl border border-mawar/60 bg-fajar/50 p-3">
                    <div className="mb-2.5 flex items-start gap-2">
                      <input
                        value={p.panggilan}
                        maxLength={40}
                        onChange={e => ubahPendamping(i, { panggilan: e.target.value })}
                        placeholder="mis. Bunda"
                        aria-label={`Panggilan pendamping ${i + 1}`}
                        className={GAYA_INPUT}
                      />
                      {pendamping.length > 1 && (
                        <button
                          type="button"
                          onClick={() => hapusPendamping(i)}
                          aria-label={`Hapus ${p.panggilan || `pendamping ${i + 1}`}`}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-pekat/40 transition hover:bg-mawar hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PERAN_PENDAMPING.map(key => {
                        const dipilih = p.peran === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            aria-pressed={dipilih}
                            onClick={() => ubahPendamping(i, { peran: key })}
                            className={`min-h-[36px] rounded-full border-2 px-3 text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
                              dipilih
                                ? 'border-rekah bg-rekah text-white'
                                : 'border-mawar/60 bg-white text-pekat hover:border-rekah/40'
                            }`}
                          >
                            {LABEL_PERAN[key]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                disabled={pendampingPenuh}
                onClick={() => setPendamping(prev => [...prev, pendampingKosong()])}
                className="mt-2.5 flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-mawar text-[13px] font-semibold text-pekat/60 transition hover:border-rekah hover:text-rekah disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Tambah pendamping
              </button>
              {pendampingPenuh && (
                <p className="mt-1.5 text-[11px] text-pekat/50">
                  Maksimal enam pendamping per anak.
                </p>
              )}
            </div>
          </div>

          {galat && <p role="alert" className="mt-3 text-[13px] text-rekah">{galat}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onTutup}
              className="rounded-full border border-mawar px-5 py-2 text-[14px] font-semibold text-pekat/70 transition hover:bg-fajar"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={simpan}
              disabled={menyimpan}
              className="flex items-center gap-1.5 rounded-full bg-madu px-5 py-2 text-[14px] font-bold text-white transition hover:bg-rekah disabled:opacity-50"
            >
              <Check className="h-4 w-4" aria-hidden />
              {menyimpan ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>

      {koreksiTerbuka && (
        <ModalKoreksiTanggal
          idAnak={anak.id}
          tanggalSekarang={anak.tanggalLahir}
          onTutup={() => setKoreksiTerbuka(false)}
        />
      )}
    </>
  );
}

// ── Kartu ringkas ────────────────────────────────────────────────────────────

function Kartu({
  ikon: Ikon,
  judul,
  children,
}: {
  ikon: React.ElementType;
  judul: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
      <h3 className="mb-3 flex items-center gap-2 font-bricolage text-[15px] font-bold text-pekat">
        <Ikon className="h-4 w-4 text-rekah" aria-hidden />
        {judul}
      </h3>
      {children}
    </section>
  );
}

// ── Halaman ──────────────────────────────────────────────────────────────────

export default function ProfilAnakTier2() {
  const { daftarAnak, hapusAnak, lepasAnakAktif, gantiFoto, mintaTambahAnak } = useAnak();
  const { anak, usiaBulan, band, diLuarRentang } = useAnakAktif();
  const [akarState] = useAkarStateSync(anak.id);

  const [editTerbuka, setEditTerbuka] = useState(false);
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);
  const [galatFoto, setGalatFoto] = useState('');

  const nilaiDitanam = useMemo(
    () => (akarState.nilai as NilaiAkar[]).filter(n => n in PENJELASAN_NILAI),
    [akarState.nilai],
  );

  const musim = diLuarRentang
    ? { judul: 'Di luar rentang Rekah', usia: 'Kegiatan diambil dari musim terakhir' }
    : BANDS[band] ?? null;

  // Pesan galat unggah foto hilang sendiri supaya tidak menumpuk.
  useEffect(() => {
    if (!galatFoto) return;
    const id = setTimeout(() => setGalatFoto(''), 6000);
    return () => clearTimeout(id);
  }, [galatFoto]);

  async function tanganiGantiFoto(file: File) {
    setGalatFoto('');
    try {
      await gantiFoto(anak.id, file);
    } catch (e) {
      setGalatFoto(e instanceof Error ? e.message : 'Foto gagal diunggah.');
    }
  }

  async function tanganiHapus() {
    await hapusAnak(anak.id);
    setKonfirmasiHapus(false);
  }

  return (
    <div className="flex flex-col gap-5 py-6">
      {/* Judul halaman */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bricolage text-[22px] font-extrabold text-pekat">Profil Anak</h2>
          <p className="text-[13px] text-pekat/55">
            Semua isi Rekah mengikuti data di halaman ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Selalu tersedia, berapa pun jumlah anaknya. Sebelumnya menambah
              anak hanya bisa lewat layar Pilih Anak — yang dilewati ketika
              anaknya tepat satu, sehingga jalurnya buntu total. */}
          <button
            type="button"
            onClick={mintaTambahAnak}
            className="flex min-h-[38px] items-center gap-1.5 rounded-full border border-mawar bg-white px-4 text-[13px] font-semibold text-pekat/70 transition hover:border-rekah hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Tambah anak
          </button>

          {daftarAnak.length > 1 && (
            <button
              type="button"
              onClick={lepasAnakAktif}
              className="flex min-h-[38px] items-center gap-1.5 rounded-full border border-mawar bg-white px-4 text-[13px] font-semibold text-pekat/70 transition hover:border-rekah hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
            >
              <Users className="h-3.5 w-3.5" aria-hidden />
              Ganti anak
            </button>
          )}
        </div>
      </div>

      {/* Kartu identitas */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar anak={anak} ukuran={76} onGanti={tanganiGantiFoto} />
          <div>
            <h3 className="font-bricolage text-[20px] font-extrabold text-pekat">{anak.namaAnak}</h3>
            <p className="text-[14px] text-pekat/60">{formatUsia(usiaBulan)}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-pekat/45">
              <Lock className="h-3 w-3" aria-hidden />
              Lahir {tanggalIndonesia(anak.tanggalLahir)}
            </p>
            {anak.jenisKelamin && (
              <span className="mt-2 inline-block rounded-full bg-mawar px-2.5 py-0.5 text-[11px] font-semibold text-rekah-tua">
                {LABEL_JENIS_KELAMIN[anak.jenisKelamin]}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEditTerbuka(true)}
          className="flex min-h-[40px] shrink-0 items-center gap-1.5 self-start rounded-full border border-mawar px-4 text-[13px] font-semibold text-pekat/70 transition hover:bg-fajar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah sm:self-auto"
        >
          <Edit2 className="h-3.5 w-3.5" aria-hidden />
          Ubah profil
        </button>
      </div>

      {galatFoto && (
        <p role="alert" className="rounded-xl bg-mawar px-4 py-3 text-[13px] font-semibold text-rekah-tua">
          {galatFoto}
        </p>
      )}

      {/* Musim tumbuh */}
      <Kartu ikon={Sprout} judul="Musim tumbuh">
        {musim ? (
          <div className="rounded-xl bg-pucuk/50 px-4 py-4">
            <p className="font-bricolage text-[16px] font-bold text-pekat">{musim.judul}</p>
            <p className="mt-0.5 text-[13px] text-pekat/60">{musim.usia}</p>
            {!diLuarRentang && BANDS[band]?.nilaiInti && (
              <p className="mt-2 text-[13px] leading-relaxed text-pekat/70">
                Nilai inti musim ini: <strong className="text-pekat">{BANDS[band].nilaiInti}</strong>
              </p>
            )}
          </div>
        ) : (
          <p className="text-[14px] text-pekat/55">Musim tumbuh belum bisa ditentukan.</p>
        )}
        <p className="mt-3 text-[12px] leading-relaxed text-pekat/45">
          Musim berpindah sendiri seiring usia. Isi Bekal, Ajak Main, dan Wawasan Tumbuh mengikuti musim ini.
        </p>
      </Kartu>

      {/* Nilai di Taman Akar */}
      <Kartu ikon={Flower2} judul="Nilai di Taman Akar">
        {nilaiDitanam.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-mawar px-4 py-8 text-center">
            <p className="text-[14px] font-semibold text-pekat">Tanahnya sedang disiapkan</p>
            <p className="mt-1 text-[13px] leading-relaxed text-pekat/55">
              Nilai ditanam dari halaman Bekal, saat sebuah kartu nilai selesai dibaca.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {nilaiDitanam.map(nilai => (
              <div key={nilai} className="rounded-xl bg-fajar px-4 py-3">
                <p className="font-bricolage text-[14px] font-bold text-pekat">{nilai}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-pekat/60">
                  {PENJELASAN_NILAI[nilai].tagline}
                </p>
              </div>
            ))}
          </div>
        )}
      </Kartu>

      {/* Pendamping */}
      <Kartu ikon={Users} judul="Pendamping">
        {anak.pendamping.length === 0 ? (
          <p className="text-[14px] text-pekat/55">
            Belum diisi. Rekah akan menyapa dengan &ldquo;{SAPAAN_CADANGAN}&rdquo;.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {anak.pendamping.map((p, i) => (
                <div
                  key={`${p.panggilan}-${i}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-fajar px-4 py-2.5"
                >
                  <span className="text-[14px] font-semibold text-pekat">{p.panggilan}</span>
                  <span className="text-[12px] text-pekat/55">{LABEL_PERAN[p.peran]}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-pekat/45">
              Rekah menyapa dengan &ldquo;{sapaanPendamping(anak.pendamping)}&rdquo;.
            </p>
          </>
        )}
      </Kartu>

      {/* Hapus profil */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setKonfirmasiHapus(true)}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] text-pekat/45 transition hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          Hapus profil {anak.namaAnak}
        </button>
      </div>

      {editTerbuka && <ModalEditProfil anak={anak} onTutup={() => setEditTerbuka(false)} />}

      {konfirmasiHapus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pekat/30 px-4">
          <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-bricolage text-[17px] font-bold text-pekat">
              Hapus profil {anak.namaAnak}?
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-pekat/60">
              Nilai yang ditanam, catatan Irama Hari, dan riwayat kebun untuk profil ini ikut
              terhapus dan tidak bisa dikembalikan.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setKonfirmasiHapus(false)}
                className="rounded-full border border-mawar px-4 py-2 text-[13px] font-semibold text-pekat/60 transition hover:bg-fajar"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={tanganiHapus}
                className="rounded-full bg-rekah px-4 py-2 text-[13px] font-bold text-white transition hover:bg-rekah-tua"
              >
                Ya, hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
