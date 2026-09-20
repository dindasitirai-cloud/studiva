// =============================================================
// JadwalKeKelola — popup menjadwalkan item Bekal ke Kelola.
// Tanya: tanggal, slot (Pagi/Siang/Malam), dan "dalam kegiatan apa" (kegiatan
// yang ada pada tanggal+slot itu, atau kegiatan tersendiri). Menulis ke store
// hari (dayPlanData) sehingga muncul di panel Hari Ini (bila hari ini) atau
// Rencana Minggu (bila hari berikutnya). Copy DRAFT — review Fitri.
// =============================================================
import React, { useMemo, useState } from 'react';
import { X, CalendarCheck } from 'lucide-react';
import { targetKegList, jadwalkanKeHari } from './dayPlanData';
import type { Waktu } from './dayPlanData';

const SLOTS: { slot: Waktu; label: string; dot: string }[] = [
  { slot: 'pagi', label: 'Pagi', dot: '#F06BA8' },
  { slot: 'siang', label: 'Siang', dot: '#E9A93B' },
  { slot: 'malam', label: 'Malam', dot: '#8B6FD6' },
];

export default function JadwalKeKelola({ judul, tipe, idAnak, tanggalHariIni, onTutup }: {
  judul: string;
  tipe: 'main' | 'buku';
  idAnak: string;
  tanggalHariIni: string;
  onTutup: () => void;
}) {
  const [tanggal, setTanggal] = useState(tanggalHariIni);
  const [slot, setSlot] = useState<Waktu>('siang');
  const [kegKey, setKegKey] = useState<string>('');
  const [selesai, setSelesai] = useState(false);

  const kegList = useMemo(() => targetKegList(idAnak, tanggal, slot), [idAnak, tanggal, slot]);
  const landing = tanggal === tanggalHariIni ? 'panel Hari Ini' : 'Rencana Minggu';
  const accent = tipe === 'main' ? '#D2559A' : '#7A5CA6';
  const sumber = tipe === 'main' ? 'Ajak Main' : 'Wawasan Tumbuh';

  const konfirmasi = () => {
    const adaKeg = kegList.some(k => k.key === kegKey);
    jadwalkanKeHari(idAnak, tanggal, { slot, kegKey: adaKeg ? kegKey : null, tipe, teks: judul });
    setSelesai(true);
  };

  return (
    <div role="dialog" aria-label="Jadwalkan kegiatan" onClick={onTutup}
      style={{ position: 'fixed', inset: 0, zIndex: 95, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(110,59,87,.3)', backdropFilter: 'blur(3px)', padding: '24px 16px' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 420, boxShadow: '0 30px 60px -30px rgba(90,50,70,.5)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, padding: '16px 18px 12px', borderBottom: '1px solid rgba(110,59,87,.08)' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10.5, letterSpacing: '.6px', textTransform: 'uppercase', color: accent }}>Jadwalkan · {sumber}</div>
            <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 17, color: '#6E3B57', margin: '2px 0 0', lineHeight: 1.25 }}>{judul}</h3>
          </div>
          <button type="button" aria-label="Tutup" onClick={onTutup} style={{ flexShrink: 0, background: '#FBF3F8', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8A5A74' }}>
            <X style={{ width: 16, height: 16 }} strokeWidth={2.4} />
          </button>
        </div>

        {selesai ? (
          <div style={{ padding: '22px 20px 20px', textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', width: 48, height: 48, borderRadius: '50%', background: '#E4F3EB', color: '#3F7A4F', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <CalendarCheck style={{ width: 24, height: 24 }} strokeWidth={2} />
            </span>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 18, color: '#6E3B57' }}>Terjadwal!</div>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13.5, color: '#8A5A74', margin: '6px 0 16px', lineHeight: 1.5 }}>
              <b style={{ color: '#6E3B57' }}>{judul}</b> ditambahkan ke waktu <b style={{ color: '#6E3B57' }}>{SLOTS.find(s => s.slot === slot)?.label}</b> pada {tanggal}. Muncul di {landing}.
            </p>
            <button type="button" onClick={onTutup} style={{ borderRadius: 12, border: 'none', background: '#C6407F', color: '#fff', padding: '10px 22px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Selesai</button>
          </div>
        ) : (
          <div style={{ padding: '14px 18px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Tanggal */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, color: '#8A5A74' }}>Kapan (tanggal)</span>
              <input type="date" value={tanggal} min={tanggalHariIni} onChange={e => setTanggal(e.target.value || tanggalHariIni)}
                style={{ boxSizing: 'border-box', borderRadius: 12, border: '1.5px solid #E7CFDD', padding: '10px 12px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13.5, color: '#6E3B57', outline: 'none', background: '#FFFDFE' }} />
            </label>

            {/* Slot */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, color: '#8A5A74' }}>Waktu</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {SLOTS.map(s => {
                  const aktif = slot === s.slot;
                  return (
                    <button key={s.slot} type="button" onClick={() => { setSlot(s.slot); setKegKey(''); }}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, padding: '9px 0', cursor: 'pointer', border: aktif ? '2px solid #C6407F' : '1.5px solid #EBD6E2', background: aktif ? '#FBF3F8' : '#fff', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: aktif ? '#C6407F' : '#8A5A74' }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: s.dot, display: 'block' }} />{s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dalam kegiatan apa */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, color: '#8A5A74' }}>Dalam kegiatan apa</span>
              <select value={kegKey} onChange={e => setKegKey(e.target.value)}
                style={{ boxSizing: 'border-box', borderRadius: 12, border: '1.5px solid #E7CFDD', padding: '10px 12px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#6E3B57', background: '#FFFDFE', cursor: 'pointer' }}>
                <option value="">— Kegiatan tersendiri —</option>
                {kegList.map(k => <option key={k.key} value={k.key}>{k.nm}</option>)}
              </select>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11, color: '#B79AAC', lineHeight: 1.4 }}>
                Pilih kegiatan yang sudah ada (mis. Main bersama) agar jadi to-do di dalamnya, atau biarkan "kegiatan tersendiri".
              </span>
            </label>

            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <button type="button" onClick={konfirmasi} style={{ flex: 1, borderRadius: 12, border: 'none', background: '#C6407F', color: '#fff', padding: '11px 0', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}>Jadwalkan</button>
              <button type="button" onClick={onTutup} style={{ borderRadius: 12, border: '1.5px solid #EBD6E2', padding: '11px 16px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, color: '#8A5A74', background: 'none', cursor: 'pointer' }}>Batal</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
