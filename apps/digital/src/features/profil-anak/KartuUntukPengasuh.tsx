// =============================================================
// KartuUntukPengasuh — modal "Kartu untuk yang menjaga" (Phase 33 v1,
// tampilan mengikuti design_handoff_profil_anak 2026-10-22).
// Kiri: chip bagian yang dibagikan + tombol kirim. Kanan: pratinjau langsung.
// Logika isi tetap di isiKartuPengasuh.ts; data kontak di kontakDarurat.ts.
// Tanpa tautan publik, tanpa akun pengasuh, tanpa tabel baru.
// =============================================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Image as IkonGambar, Lock, MessageCircle, Plus, Trash2, X } from 'lucide-react';
import { COPY_PROFIL, COPY_REDESIGN } from './profil-anak-copy';
import {
  URUTAN_BAGIAN, PILIHAN_AWAL, bangunSemuaBagian, bangunIsiKartu, bangunTeksKartuPengasuh, gambarKartu, tanggalPendekID,
  type KunciBagian, type InputKartu,
} from './isiKartuPengasuh';
import { MAKS_KONTAK, nomorValid, type KontakDaruratStore } from './kontakDarurat';

const GAYA_INPUT =
  'w-full rounded-xl border border-[#F2DDE7] bg-white px-3 py-2 font-nunito text-[14px] text-pekat focus:border-rekah focus:outline-none focus:ring-2 focus:ring-rekah/20';

const GAYA_POP = `
@keyframes paPop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.pa-pop{animation:paPop .28s cubic-bezier(.2,.7,.2,1) both}
@media (prefers-reduced-motion: reduce){.pa-pop{animation:none}}
`;

export function ModalKartuPengasuh({ idAnak, nama, usiaTeks, input, kontakStore, onIsiAlergi, onTutup }: {
  idAnak: string;
  nama: string;
  usiaTeks: string;
  input: InputKartu;
  kontakStore: KontakDaruratStore;
  /** Bagian alergi kosong → tutup modal & buka laci di pertanyaan alergi. */
  onIsiAlergi: () => void;
  onTutup: () => void;
}) {
  const C = COPY_PROFIL.kartu;
  const R = COPY_REDESIGN;
  const [dipilih, setDipilih] = useState<Record<KunciBagian, boolean>>(PILIHAN_AWAL);
  const [status, setStatus] = useState('');
  const [ubahKontak, setUbahKontak] = useState(false);
  const tutupRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    tutupRef.current?.focus();
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onTutup(); };
    window.addEventListener('keydown', h);
    const lama = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = lama; };
  }, [onTutup]);

  const semua = useMemo(() => bangunSemuaBagian(input), [input]);
  const isi = useMemo(() => bangunIsiKartu(input, dipilih), [input, dipilih]);
  const tanggal = tanggalPendekID();
  const teks = useMemo(() => bangunTeksKartuPengasuh(isi, nama, usiaTeks, tanggal), [isi, nama, usiaTeks, tanggal]);

  const kosong = (k: KunciBagian) => (semua.find(b => b.kunci === k)?.baris.length ?? 0) === 0;
  /** Bagian yang punya formulir isian sendiri. "Saat rewel" & "Makan" diisi lewat laci juga, tapi
   *  hanya alergi yang punya jalan pintas; sisanya ditandai kosong saja. */
  function ketukOpsi(k: KunciBagian) {
    if (kosong(k)) {
      if (k === 'alergi') { onIsiAlergi(); return; }
      if (k === 'darurat' || k === 'khusus') { setUbahKontak(true); return; }
    }
    setDipilih(d => ({ ...d, [k]: !d[k] }));
  }

  function kirimWa() {
    window.open(`https://wa.me/?text=${encodeURIComponent(teks)}`, '_blank', 'noopener,noreferrer');
  }
  async function salin() {
    try { await navigator.clipboard.writeText(teks); setStatus(C.disalin); } catch { setStatus(C.tidakBisaSalin); }
  }
  async function simpanGambar() {
    const cv = await gambarKartu(isi, `${nama} · ${usiaTeks}`, C.pratinjauKepala, C.kaki(tanggal));
    if (!cv) { setStatus(C.gambarTidakBisa); return; }
    cv.toBlob(blob => {
      if (!blob) { setStatus(C.gambarTidakBisa); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kartu-pengasuh-${nama.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setStatus(C.gambarTersimpan);
    }, 'image/png');
  }

  const nonaktif = isi.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5" style={{ background: 'rgba(110,59,87,.32)' }} onClick={onTutup}>
      <style>{GAYA_POP}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-kartu-judul"
        onClick={e => e.stopPropagation()}
        className="pa-pop w-full max-w-[820px] overflow-auto rounded-[28px] bg-[#FFF1C9] p-6"
        style={{ maxHeight: 'calc(100vh - 40px)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="modal-kartu-judul" className="font-fredoka text-[24px] font-bold text-pekat">{R.bannerJudul(nama)}</h2>
            <p className="mt-0.5 font-nunito text-[14px] font-bold text-[#9A6F86]">{R.modalSub}</p>
          </div>
          <button ref={tutupRef} type="button" onClick={onTutup} aria-label={R.modalTutup}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white text-pekat transition hover:bg-[#FFF4F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
            <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
          </button>
        </div>

        <div className="mt-[18px] grid items-start gap-[18px]" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))' }}>
          {/* Kiri — pilih & kirim */}
          <div className="flex min-w-0 flex-col gap-3.5">
            <p className="font-nunito text-[12px] font-extrabold tracking-[1.2px] text-[#9A7A2C]">{R.modalDibagikan}</p>
            <div className="flex flex-wrap gap-2">
              {URUTAN_BAGIAN.map(k => {
                const on = dipilih[k];
                const perluIsi = kosong(k);
                return (
                  <button key={k} type="button" aria-pressed={on} onClick={() => ketukOpsi(k)}
                    className={`flex items-center gap-[7px] rounded-full border-[1.5px] px-3.5 py-[9px] font-nunito text-[14px] font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-1 ${on ? 'border-[#D2559A] bg-[#D2559A] text-white' : 'border-[#F2DDE7] bg-white text-pekat hover:border-rekah'}`}>
                    {on && <Check className="h-[13px] w-[13px]" strokeWidth={3.4} aria-hidden />}
                    {k === 'khusus' && !on && <Lock className="h-3 w-3" aria-hidden />}
                    {R.opsi[k]}
                    {perluIsi && <span className={`text-[12px] ${on ? 'text-white/85' : 'text-[#D2559A]'}`}>{R.modalIsiDulu}</span>}
                  </button>
                );
              })}
            </div>

            {ubahKontak && <FormKontak idAnak={idAnak} nama={nama} store={kontakStore} onTutup={() => setUbahKontak(false)} />}
            {!ubahKontak && (
              <button type="button" onClick={() => setUbahKontak(true)}
                className="self-start font-nunito text-[13px] font-extrabold text-[#D2559A] hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
                {COPY_PROFIL.kontak.ubah}
              </button>
            )}

            <div className="mt-1 flex flex-col gap-2">
              <button type="button" onClick={kirimWa} disabled={nonaktif}
                className="flex items-center justify-center gap-2 rounded-full bg-rekah px-[18px] py-[13px] font-nunito text-[15px] font-extrabold text-white transition hover:bg-[#D2559A] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2">
                <MessageCircle className="h-4 w-4" strokeWidth={2.3} aria-hidden /> {C.kirimWa}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={simpanGambar} disabled={nonaktif}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-white p-[11px] font-nunito text-[14px] font-extrabold text-pekat transition hover:bg-[#FFF4F9] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
                  <IkonGambar className="h-4 w-4" aria-hidden /> Simpan gambar
                </button>
                <button type="button" onClick={salin} disabled={nonaktif}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-white p-[11px] font-nunito text-[14px] font-extrabold text-pekat transition hover:bg-[#FFF4F9] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
                  <Copy className="h-4 w-4" aria-hidden /> {C.salin}
                </button>
              </div>
            </div>
            <p role="status" className="min-h-[1.2em] font-nunito text-[12.5px] font-bold text-pekat">{status}</p>
            <p className="flex items-center gap-1.5 font-nunito text-[12.5px] font-bold text-[#9A7A2C]">
              <Lock className="h-[13px] w-[13px] flex-none" strokeWidth={2.4} aria-hidden /> {R.modalPrivasi(nama)}
            </p>
          </div>

          {/* Kanan — pratinjau langsung */}
          <div aria-label="Pratinjau kartu" className="min-w-0 overflow-hidden rounded-[22px] bg-white" style={{ boxShadow: '0 16px 30px -22px #9A7A2C' }}>
            <div className="bg-[#F8C9DE] px-[18px] py-3.5">
              <p className="font-nunito text-[12.5px] font-bold text-[#9A4F78]">{C.pratinjauKepala}</p>
              <p className="font-fredoka text-[20px] font-bold text-pekat">{nama} · {usiaTeks}</p>
            </div>
            <div className="flex flex-col gap-3 px-[18px] py-3.5">
              {isi.map(b => {
                const alert = b.kunci === 'alergi' && b.tegas;
                const [utama, ...catatan] = alert ? b.baris : [b.baris.join(', ')];
                return (
                  <div key={b.kunci} className={alert ? 'rounded-[14px] bg-[#FFEDEF] px-3.5 py-3' : ''}>
                    <p className={`font-nunito text-[11px] font-extrabold tracking-[1.1px] ${alert ? 'text-[#C8404F]' : 'text-[#B48DA3]'}`}>{R.pratinjauLabel[b.kunci]}</p>
                    {b.kunci === 'darurat'
                      ? b.baris.map((x, i) => <p key={i} className="mt-0.5 font-nunito text-[14px] font-extrabold text-pekat">{x}</p>)
                      : <p className="mt-0.5 font-nunito text-[14px] font-extrabold text-pekat">{utama}</p>}
                    {catatan.map((x, i) => <p key={i} className="mt-1 font-nunito text-[12.5px] font-semibold leading-snug text-[#9A6F86]">{x}</p>)}
                  </div>
                );
              })}
              <p className="font-nunito text-[11.5px] font-bold text-[#B48DA3]">{C.kaki(tanggal)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormKontak({ idAnak, nama, store, onTutup }: { idAnak: string; nama: string; store: KontakDaruratStore; onTutup: () => void }) {
  const K = COPY_PROFIL.kontak;
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4">
      {store.kontak.map((k, i) => {
        const salah = k.nomor.trim().length > 0 && !nomorValid(k.nomor);
        return (
          <div key={k.id} className="grid gap-2 rounded-xl bg-fajar/60 p-3 sm:grid-cols-[1fr_1fr_1.3fr_auto] sm:items-start">
            <div>
              <label htmlFor={`kd-nama-${k.id}`} className="mb-0.5 block font-nunito text-[11.5px] font-bold text-pekat/70">{K.nama}</label>
              <input id={`kd-nama-${k.id}`} value={k.nama} maxLength={40} placeholder={K.phNama} onChange={e => store.ubah(k.id, { nama: e.target.value })} className={GAYA_INPUT} />
            </div>
            <div>
              <label htmlFor={`kd-hub-${k.id}`} className="mb-0.5 block font-nunito text-[11.5px] font-bold text-pekat/70">{K.hubungan}</label>
              <input id={`kd-hub-${k.id}`} value={k.hubungan} maxLength={30} placeholder={K.phHubungan} onChange={e => store.ubah(k.id, { hubungan: e.target.value })} className={GAYA_INPUT} />
            </div>
            <div>
              <label htmlFor={`kd-no-${k.id}`} className="mb-0.5 block font-nunito text-[11.5px] font-bold text-pekat/70">{K.nomor}</label>
              <input id={`kd-no-${k.id}`} value={k.nomor} inputMode="tel" maxLength={24} placeholder={K.phNomor} aria-invalid={salah} aria-describedby={salah ? `kd-no-err-${k.id}` : undefined}
                onChange={e => store.ubah(k.id, { nomor: e.target.value })} className={GAYA_INPUT} />
              {salah && <p id={`kd-no-err-${k.id}`} className="mt-0.5 font-nunito text-[11.5px] font-bold text-rekah-tua">{K.nomorTidakValid}</p>}
            </div>
            <button type="button" onClick={() => store.hapus(k.id)} aria-label={K.hapus(k.nama || `${i + 1}`)}
              className="flex h-9 w-9 items-center justify-center self-end rounded-full text-pekat/45 transition hover:bg-mawar hover:text-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        );
      })}
      {store.kontak.length < MAKS_KONTAK ? (
        <button type="button" onClick={store.tambah}
          className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-mawar font-nunito text-[13px] font-bold text-pekat/65 transition hover:border-rekah hover:text-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
          <Plus className="h-4 w-4" aria-hidden /> {K.tambah}
        </button>
      ) : (
        <p className="font-nunito text-[11.5px] text-ink-soft">{K.maks}</p>
      )}
      <div>
        <label htmlFor="kd-faskes" className="mb-0.5 block font-nunito text-[11.5px] font-bold text-pekat/70">{K.faskes}</label>
        <input id="kd-faskes" value={store.faskes} maxLength={60} placeholder={K.phFaskes} onChange={e => store.setFaskes(e.target.value)} className={GAYA_INPUT} />
      </div>
      <div>
        <label htmlFor={`kd-khusus-${idAnak}`} className="mb-0.5 flex items-center gap-1 font-nunito text-[11.5px] font-bold text-pekat/70">
          <Lock className="h-3 w-3" aria-hidden /> {K.catatanKhusus(nama)}
        </label>
        <textarea id={`kd-khusus-${idAnak}`} rows={2} maxLength={240} value={store.catatanKhusus(idAnak)} placeholder={K.phCatatanKhusus}
          onChange={e => store.setCatatanKhusus(idAnak, e.target.value)} className={`${GAYA_INPUT} resize-none`} />
      </div>
      <button type="button" onClick={onTutup}
        className="self-end rounded-full border border-mawar bg-white px-4 py-2 font-nunito text-[13px] font-extrabold text-pekat transition hover:bg-fajar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
        {K.tutup}
      </button>
    </div>
  );
}
