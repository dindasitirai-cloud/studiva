import React, { useState } from 'react';
import { useKehidupanStore } from '../../irama-hari/kehidupanData';
import type { BidangKehidupan, TagPenyesuaian, KonteksKehidupan } from '../../irama-hari/kehidupanData';
import { NILAI } from '../../akar-keluarga/content';
import RekomendasiRekah from '../../irama-hari/RekomendasiRekah';

// =============================================================
// Beranda — kartu Fondasi/Rekomendasi (sekunder, di samping Rencana hari ini)
// STATUS COPY: DRAFT — menunggu review Psikolog Fitri Effendy.
// Result = desain "Satu fokus" (handoff opsi 4a): satu rekomendasi/waktu,
// Jalankan/Baca · Sudah · Nanti · titik progres. Cover & wizard (pengguna
// baru) mengikuti tema yang sama. Tidak ada skor/level; AI selalu dilabeli.
// =============================================================

interface Props {
  idAnak: string;
  namaAnak: string;
  usiaTeks: string;
  nilaiFokus: string[];
  onTanam: (n: string) => void;
  onCabut: (n: string) => void;
  onBuka: (to: string) => void;
}

type Opsi = { judul: string; bidang: BidangKehidupan; tag: TagPenyesuaian; grup: 'anak' | 'pengasuh' | 'rumah' };
const OPSI: Opsi[] = [
  { judul: 'Susah tidur malam', bidang: 'anak', tag: 'tidur', grup: 'anak' },
  { judul: 'Lebih rewel', bidang: 'anak', tag: 'kurang_nyaman', grup: 'anak' },
  { judul: 'Lagi lengket', bidang: 'anak', tag: 'transisi', grup: 'anak' },
  { judul: 'Susah makan', bidang: 'anak', tag: 'kurang_nyaman', grup: 'anak' },
  { judul: 'Penuh energi', bidang: 'anak', tag: 'perubahan_ritme', grup: 'anak' },
  { judul: 'Kembali kerja', bidang: 'caregiver', tag: 'kembali_kerja', grup: 'pengasuh' },
  { judul: 'Lagi lelah / butuh jeda', bidang: 'caregiver', tag: 'energi_caregiver', grup: 'pengasuh' },
  { judul: 'Pengasuh baru / berganti', bidang: 'caregiver', tag: 'perubahan_ritme', grup: 'pengasuh' },
  { judul: 'Waktu bersama berkurang', bidang: 'caregiver', tag: 'kembali_kerja', grup: 'pengasuh' },
  { judul: 'Ada adik baru', bidang: 'peristiwa', tag: 'perubahan_ritme', grup: 'rumah' },
  { judul: 'Bepergian / mudik', bidang: 'peristiwa', tag: 'perubahan_ritme', grup: 'rumah' },
  { judul: 'Ritme harian berubah', bidang: 'rumah', tag: 'perubahan_ritme', grup: 'rumah' },
  { judul: 'Mulai daycare', bidang: 'rumah', tag: 'transisi', grup: 'rumah' },
];
const GRUP: { key: 'anak' | 'pengasuh' | 'rumah'; label: string; dot: string }[] = [
  { key: 'anak', label: 'Tentang anak', dot: '#F0479B' },
  { key: 'pengasuh', label: 'Tentang pengasuh', dot: '#5F84E6' },
  { key: 'rumah', label: 'Rumah & peristiwa', dot: '#6FA867' },
];
const NILAI_WARNA: Record<string, string> = {
  'Kemandirian': '#6FA867', 'Empati': '#5F84E6', 'Cinta Ilmu': '#E0A63A', 'Keberanian': '#F0479B',
  'Syukur': '#7B58C9', 'Sabar': '#6FA867', 'Kasih Sayang': '#E0637E', 'Kejujuran': '#5F84E6',
  'Tanggung Jawab': '#C6407F', 'Kesederhanaan': '#8FB84A', 'Berbagi': '#E0A63A', 'Hormat pada Sesama': '#7B58C9',
};
const warnaNilai = (n: string) => NILAI_WARNA[n] || '#C6407F';

const Cek = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6" /></svg>);


export default function FondasiRekomendasi({ idAnak, namaAnak, usiaTeks, nilaiFokus, onTanam, onCabut, onBuka }: Props) {
  const store = useKehidupanStore(idAnak);
  const adaFondasi = store.aktif.length > 0 || nilaiFokus.length > 0;

  const [view, setView] = useState<'cover' | 'wizard' | 'result'>(adaFondasi ? 'result' : 'cover');
  const [baru, setBaru] = useState(!adaFondasi);
  const [step, setStep] = useState<1 | 2>(1);
  const [selKond, setSelKond] = useState<Set<string>>(new Set());
  const [selNilai, setSelNilai] = useState<Set<string>>(new Set());

  const seed = () => { setSelKond(new Set(store.aktif.map(it => it.judul))); setSelNilai(new Set(nilaiFokus)); };
  const bukaWizard = (seedIt: boolean) => { if (seedIt) seed(); else { setSelKond(new Set()); setSelNilai(new Set()); } setStep(1); setView('wizard'); };

  const toggleKond = (j: string) => setSelKond(prev => { const n = new Set(prev); n.has(j) ? n.delete(j) : n.add(j); return n; });
  const toggleNilai = (v: string) => setSelNilai(prev => { const n = new Set(prev); if (n.has(v)) n.delete(v); else { if (n.size >= 3) return prev; n.add(v); } return n; });

  const simpanFondasi = () => {
    let items: KonteksKehidupan[] = store.semua.map(it => {
      const dipilih = selKond.has(it.judul);
      if (dipilih) return it.status === 'tenang' ? { ...it, status: 'aktif' as const } : it;
      return it.status !== 'tenang' ? { ...it, status: 'tenang' as const } : it;
    });
    OPSI.forEach(o => {
      if (selKond.has(o.judul) && !items.some(it => it.judul === o.judul)) {
        items = [{ id: `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, bidang: o.bidang, judul: o.judul, sejak: 'beberapa_minggu', tag: o.tag, status: 'aktif', dibuat: new Date().toISOString() }, ...items];
      }
    });
    store.ganti(items);
    selNilai.forEach(n => { if (!nilaiFokus.includes(n)) onTanam(n); });
    nilaiFokus.forEach(n => { if (!selNilai.has(n)) onCabut(n); });
    setBaru(false); setView('result');
  };

  const kondChips = store.aktif;

  return (
    <div className="frk">
      <style>{frkCSS}</style>
      <div className="frk-card">
        {view !== 'result' && (
          <>
            <div className="frk-accent" style={{ background: 'linear-gradient(90deg,#F0479B,#C9B8F0)' }} />
            <svg className="frk-petal" width="26" height="26" viewBox="0 0 30 30" fill="none" aria-hidden="true">
              <circle cx="15" cy="7" r="4.5" fill="#F8B9D4" /><circle cx="23" cy="15" r="4.5" fill="#FFE29A" /><circle cx="7" cy="15" r="4.5" fill="#C9B8F0" /><circle cx="15" cy="15" r="3" fill="#F0479B" />
            </svg>
          </>
        )}

        {/* COVER */}
        {view === 'cover' && (
          <div className="frk-cover">
            <div className="frk-illus"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" /></svg></div>
            <div className="frk-eyebrow">Fondasi hari ini</div>
            <h3 className="frk-h">Mulai dari keadaan keluargamu</h3>
            <p className="frk-p">Ceritakan sebentar apa yang sedang terjadi di rumah dan nilai yang ingin kamu tanam. Dari sini Rekah menyusun saran harian untuk {namaAnak}.</p>
            <div className="frk-steps">
              <div className="frk-cstep"><span className="frk-no">1</span><div><div className="frk-ct">Ceritakan yang berubah</div><div className="frk-cs">Tidur, energi, ritme</div></div></div>
              <div className="frk-cstep"><span className="frk-no">2</span><div><div className="frk-ct">Pilih nilai yang ditanam</div><div className="frk-cs">Arah keluarga</div></div></div>
              <div className="frk-cstep"><span className="frk-no">✿</span><div><div className="frk-ct">Dapat saran menyesuaikan</div><div className="frk-cs">Dari Bekal & Temani</div></div></div>
            </div>
            <button type="button" className="frk-pbtn" onClick={() => bukaWizard(false)}>Mulai
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <div className="frk-tiny">Sekitar 1 menit · bisa diubah kapan saja</div>
          </div>
        )}

        {/* WIZARD */}
        {view === 'wizard' && (
          <div className="frk-wz">
            <div className="frk-wztop">
              <button type="button" className="frk-back" aria-label="Kembali" disabled={step === 1} onClick={() => setStep(1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <div className="frk-bar"><i style={{ width: step === 1 ? '50%' : '100%' }} /></div>
              <button type="button" className="frk-skip" onClick={() => (baru ? setView('cover') : setView('result'))}>{baru ? 'Lewati' : 'Batal'}</button>
            </div>
            <div className="frk-wzscroll">
              {step === 1 ? (
                <>
                  <div className="frk-steplbl">Langkah 1 dari 2</div>
                  <div className="frk-q">Apa yang sedang berubah?</div>
                  <div className="frk-sub">Boleh lebih dari satu.</div>
                  <div className="frk-age"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg> {namaAnak} · {usiaTeks} <span className="frk-auto">— otomatis</span></div>
                  {GRUP.map(g => (
                    <div className="frk-group" key={g.key}>
                      <div className="frk-glabel"><span className="frk-gd" style={{ background: g.dot }} /> {g.label}</div>
                      <div className="frk-chips">
                        {OPSI.filter(o => o.grup === g.key).map(o => {
                          const on = selKond.has(o.judul);
                          return (
                            <button type="button" key={o.judul} className={'frk-chip' + (on ? ' on' : '')} onClick={() => toggleKond(o.judul)}>
                              <span className="frk-ck"><Cek /></span>{o.judul}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="frk-cnt">{selKond.size ? `${selKond.size} hal dipilih` : 'Belum ada yang dipilih — boleh dilewati.'}</div>
                </>
              ) : (
                <>
                  <div className="frk-steplbl">Langkah 2 dari 2</div>
                  <div className="frk-q">Nilai yang ingin ditanam?</div>
                  <div className="frk-sub">Pilih sampai 3.</div>
                  <div className="frk-ngrid">
                    {NILAI.map(n => {
                      const on = selNilai.has(n);
                      return (
                        <button type="button" key={n} className={'frk-ncard' + (on ? ' on' : '')} onClick={() => toggleNilai(n)}>
                          <span className="frk-nd" style={{ background: warnaNilai(n) }} />
                          <div className="frk-nt">{n}</div>
                          <span className="frk-tick"><Cek /></span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="frk-cnt">{selNilai.size} dari 3 nilai dipilih</div>
                </>
              )}
            </div>
            <div className="frk-wzfoot">
              {step === 1 ? (
                <button type="button" className="frk-pbtn" onClick={() => setStep(2)}>Lanjut ke Arah
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>
              ) : (
                <button type="button" className="frk-pbtn" onClick={simpanFondasi}>Simpan & lihat saran
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6" /></svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULT — Satu fokus (handoff 4a) */}
        {view === 'result' && (
          <div className="frk-result">
            <div style={{ padding: '20px 20px 0' }}>
              <div className="frk-fondasihead">
                <span className="frk-fondasilbl">Fondasi hari ini</span>
                <button type="button" className="frk-perbarui" onClick={() => bukaWizard(true)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D2559A" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></svg>
                  Perbarui
                </button>
              </div>
              <div className="frk-fchips">
                {kondChips.length === 0 && nilaiFokus.length === 0 && (<span className="frk-bchip quiet">Sedang tenang</span>)}
                {kondChips.map(k => (<span className="frk-bchip" key={k.id}><span className="frk-bdot" />{k.judul}</span>))}
                {nilaiFokus.map(n => (<span className="frk-bchip" key={n}><span className="frk-bdot" />{n}</span>))}
              </div>
            </div>
            <div style={{ padding: '14px 16px 4px' }}>
              <RekomendasiRekah idAnak={idAnak} onBuka={onBuka} />
            </div>
            <div style={{ flex: 1 }} />
            <div className="frk-foot2">
              <button type="button" className="frk-bantu" onClick={() => onBuka('/dashboard/tier2/bantu')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A97A14" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20Z" /></svg>
                <span>Terasa berat? <strong>Rekah di Bantu</strong>.</span>
              </button>
              <button type="button" className="frk-semua" onClick={() => onBuka('/dashboard/tier2/kelola')}>Semua ›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const frkCSS = `
.frk{--pink:#F0479B;--pinkdeep:#C6407F;--pinktua:#D2559A;--plum:#6E3B57;--muted:#8A5A74;--ungu:#7B58C9;--lilac:#C9B8F0;--soft:#FBDDEC;font-family:'Nunito',system-ui,sans-serif;height:100%}
.frk *{box-sizing:border-box}
.frk-card{position:relative;overflow:hidden;background:#fff;border-radius:30px;box-shadow:0 30px 60px -40px rgba(110,59,87,.55);display:flex;flex-direction:column;height:100%}
.frk-accent{position:absolute;left:0;right:0;top:0;height:4px;z-index:3}
.frk-petal{position:absolute;top:12px;left:14px;z-index:0;opacity:.6;pointer-events:none}
.frk-card>*:not(.frk-accent):not(.frk-petal){position:relative;z-index:1}
.frk-eyebrow{font-family:'Fredoka',sans-serif;font-weight:800;font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:var(--pinktua)}
.frk-h{font-family:'Fredoka',sans-serif;font-weight:600;font-size:18px;color:var(--plum);margin:5px 0 0}
.frk-p{font-size:12px;color:var(--muted);margin:8px 0 0;line-height:1.5}
.frk-pbtn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;border:none;border-radius:13px;padding:12px;cursor:pointer;background:var(--pink);box-shadow:0 16px 28px -20px rgba(240,71,155,.95);color:#fff;font-family:'Nunito';font-weight:800;font-size:13.5px}
/* cover */
.frk-cover{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:22px;flex:1;min-height:0}
.frk-illus{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 36% 30%,#FDE7F1,#F6DCEA);color:var(--pink)}
.frk-illus svg{width:32px;height:32px}
.frk-cover .frk-eyebrow{margin-top:13px}
.frk-steps{display:flex;flex-direction:column;gap:7px;margin:15px 0 0;width:100%;text-align:left}
.frk-cstep{display:flex;align-items:center;gap:10px;background:#FFFBF2;border:1px solid #F0E0D2;border-radius:12px;padding:9px 12px}
.frk-no{width:23px;height:23px;flex:none;border-radius:50%;background:#FDE9F2;color:var(--pinkdeep);display:grid;place-items:center;font-family:'Fredoka';font-weight:800;font-size:11.5px}
.frk-ct{font-weight:800;font-size:12px;color:var(--plum)}
.frk-cs{font-size:10.5px;color:var(--muted)}
.frk-cover .frk-pbtn{margin-top:16px}
.frk-tiny{margin-top:9px;font-size:10.5px;color:var(--muted)}
/* wizard */
.frk-wz{display:flex;flex-direction:column;flex:1;min-height:0}
.frk-wztop{display:flex;align-items:center;gap:10px;padding:15px 16px 0}
.frk-back{width:28px;height:28px;border-radius:50%;border:1px solid #F0E0D2;background:#fff;display:grid;place-items:center;cursor:pointer;color:var(--plum);flex:none}
.frk-back:disabled{opacity:.35;cursor:default}
.frk-bar{flex:1;height:7px;border-radius:999px;background:#F2E6EE;overflow:hidden}
.frk-bar>i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--ungu),var(--pink));transition:width .35s ease}
.frk-skip{border:none;background:none;color:var(--ungu);font-weight:800;font-size:11.5px;cursor:pointer}
.frk-wzscroll{flex:1;min-height:0;overflow-y:auto;padding:0 16px 4px}
.frk-wzscroll::-webkit-scrollbar{width:7px}.frk-wzscroll::-webkit-scrollbar-thumb{background:#EAD1E0;border-radius:999px}
.frk-steplbl{text-align:center;font-family:'Fredoka';font-weight:800;font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:var(--ungu);margin-top:11px}
.frk-q{text-align:center;font-family:'Fredoka';font-weight:600;font-size:17px;color:var(--plum);margin-top:4px}
.frk-sub{text-align:center;font-size:11.5px;color:var(--muted);margin-top:5px}
.frk-age{display:flex;align-items:center;justify-content:center;gap:6px;margin:10px auto 0;width:max-content;background:#F6ECF2;border-radius:999px;padding:5px 12px;font-weight:800;font-size:11px;color:var(--plum)}
.frk-age svg{width:12px;height:12px;color:var(--pinktua)}
.frk-auto{font-weight:700;font-size:9.5px;color:var(--muted)}
.frk-group{margin-top:12px}
.frk-glabel{display:flex;align-items:center;gap:6px;font-family:'Fredoka';font-weight:800;font-size:9.5px;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin:0 2px 7px}
.frk-gd{width:6px;height:6px;border-radius:50%}
.frk-chips{display:flex;flex-wrap:wrap;gap:6px}
.frk-chip{display:inline-flex;align-items:center;gap:6px;border:1.5px solid #EFDFEA;background:#fff;border-radius:999px;padding:6px 11px;font-weight:700;font-size:11.5px;color:var(--plum);cursor:pointer;transition:.15s;font-family:'Nunito'}
.frk-chip:hover{border-color:var(--lilac)}
.frk-ck{width:14px;height:14px;border-radius:50%;border:1.5px solid #D9C7D4;display:grid;place-items:center;flex:none;color:#fff}
.frk-ck svg{width:8px;height:8px;opacity:0}
.frk-chip.on{border-color:var(--pink);background:#FDEFF6;color:var(--pinkdeep)}
.frk-chip.on .frk-ck{background:var(--pink);border-color:var(--pink)}
.frk-chip.on .frk-ck svg{opacity:1}
.frk-ngrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px}
.frk-ncard{position:relative;border:2px solid #EFDFEA;border-radius:14px;padding:11px 10px;cursor:pointer;background:#fff;transition:.15s;text-align:left;font-family:'Nunito'}
.frk-ncard:hover{border-color:var(--lilac)}
.frk-nd{width:20px;height:20px;border-radius:6px;display:block}
.frk-nt{font-family:'Fredoka';font-weight:600;font-size:12.5px;color:var(--plum);margin-top:8px}
.frk-tick{position:absolute;top:8px;right:8px;width:17px;height:17px;border-radius:50%;background:var(--pink);display:grid;place-items:center;opacity:0;transform:scale(.6);transition:.15s;color:#fff}
.frk-tick svg{width:10px;height:10px}
.frk-ncard.on{border-color:var(--pink);background:#FDEFF6}
.frk-ncard.on .frk-tick{opacity:1;transform:scale(1)}
.frk-cnt{text-align:center;font-size:10.5px;color:var(--muted);margin-top:9px}
.frk-wzfoot{padding:11px 16px 15px;border-top:1px solid #F3E7EF;background:#fff}
/* result — satu fokus */
.frk-result{display:flex;flex-direction:column;flex:1;min-height:0}
.frk-empty{padding:24px 20px;text-align:center}
.frk-eyebrow2{font-family:'Nunito';font-weight:800;font-size:11px;letter-spacing:1.2px;color:#D2559A}
.frk-aipill{display:flex;align-items:center;gap:5px;background:#EDE7FC;border-radius:999px;padding:4px 10px;font-family:'Nunito';font-weight:800;font-size:11px;color:#7B63C9}
.frk-title{font-family:'Fredoka',sans-serif;font-weight:600;font-size:24px;line-height:1.15;color:#6E3B57;margin-top:6px}
.frk-fondasihead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:11px}
.frk-fondasilbl{font-family:'Fredoka',sans-serif;font-weight:800;font-size:10px;letter-spacing:.6px;text-transform:uppercase;color:#9A6A12}
.frk-fchips{display:flex;flex-wrap:nowrap;gap:8px;overflow-x:auto;min-width:0;margin-top:8px;padding-bottom:2px;scrollbar-width:thin}
.frk-fchips::-webkit-scrollbar{height:6px}.frk-fchips::-webkit-scrollbar-thumb{background:#EAD9A8;border-radius:999px}
.frk-bchip{display:flex;align-items:center;gap:6px;background:#FFF3D6;border-radius:999px;padding:5px 11px 5px 9px;white-space:nowrap;flex:none;font-family:'Nunito';font-weight:700;font-size:11.5px;color:#7A5A1A}
.frk-bchip .frk-bdot{width:6px;height:6px;border-radius:50%;background:#E6A93A;display:block}
.frk-bchip.quiet{color:#8A5A74;background:#F3EFE6}
.frk-bchip.quiet .frk-bdot{background:#C9B2BE}
.frk-perbarui{flex:none;display:flex;align-items:center;gap:4px;padding:5px 4px;border:none;background:none;cursor:pointer;font-family:'Nunito';font-weight:800;font-size:11.5px;color:#D2559A}
.frk-hero{position:relative;overflow:hidden;border-radius:26px;padding:18px 18px 16px;transition:background .25s ease}
.frk-htile{width:40px;height:40px;flex:none;border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:center}
.frk-htitle{font-family:'Fredoka',sans-serif;font-weight:600;font-size:22px;line-height:1.2;color:#6E3B57;margin-top:14px;max-width:290px}
.frk-hdesc{font-family:'Nunito',sans-serif;font-weight:600;font-size:13px;line-height:1.45;color:#8A5A74;margin-top:5px}
.frk-whybox{display:flex;align-items:flex-start;gap:7px;margin-top:12px;background:rgba(255,255,255,.7);border-radius:12px;padding:8px 10px}
.frk-whybox span{font-family:'Nunito',sans-serif;font-weight:700;font-size:12px;line-height:1.4;color:#6E3B57}
.frk-cta{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:#F06BA8;border:none;border-radius:999px;padding:12px;cursor:pointer;box-shadow:0 12px 22px -14px rgba(240,107,168,.9);font-family:'Nunito';font-weight:800;font-size:14px;color:#fff}
.frk-round{flex:none;width:46px;height:46px;border-radius:50%;background:#fff;border:1px solid #F5EDF2;display:flex;align-items:center;justify-content:center;cursor:pointer}
.frk-dots{display:flex;align-items:center;justify-content:center;gap:5px;margin-top:12px}
.frk-foot2{border-top:1.5px solid #F5EDF2;padding:12px 16px 14px;display:flex;align-items:center;gap:10px}
.frk-bantu{flex:1;min-width:0;display:flex;align-items:center;gap:8px;background:#FFF3D6;border:none;border-radius:14px;padding:9px 12px;cursor:pointer;text-align:left}
.frk-bantu span{font-family:'Nunito',sans-serif;font-weight:600;font-size:12.5px;color:#7A5A1A}
.frk-bantu strong{font-weight:800;color:#8A5E10;text-decoration:underline;text-underline-offset:2px}
.frk-semua{flex:none;white-space:nowrap;border:none;background:none;font-family:'Nunito',sans-serif;font-weight:800;font-size:13px;color:#D2559A;cursor:pointer}
.frk-cta,.frk-round,.frk-perbarui,.frk-semua,.frk-bantu{transition:transform .16s cubic-bezier(.2,.7,.2,1)}
.frk-cta:active,.frk-round:active,.frk-perbarui:active,.frk-semua:active,.frk-bantu:active{transform:scale(.97)}
@media(prefers-reduced-motion:reduce){.frk-hero,.frk-bar>i{transition:none}}
`;
