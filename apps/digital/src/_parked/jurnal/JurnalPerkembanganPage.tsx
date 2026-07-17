// PARKIR: diintegrasikan kembali sebagai fitur premium bersama Jejak Mekar (build 4)
import React, { useState } from 'react';
import { JurnalProvider, useJurnal } from './context/JurnalContext';
import { ANAK_LIST } from './data/mockJurnalData';
import BukuJurnal3D from './components/BukuJurnal3D';
import KalenderMomen from './components/KalenderMomen';
import PerjalananPencapaian from './components/PerjalananPencapaian';

type TabMode = 'jurnal' | 'kalender' | 'milestone';

function JurnalPageInner() {
  const { state, dispatch } = useJurnal();
  const { activeAnakId } = state;
  const [activeTab, setActiveTab] = useState<TabMode>('jurnal');

  const activeAnak = ANAK_LIST.find(a => a.id === activeAnakId) ?? ANAK_LIST[0];

  function handleGoToJurnal(prefillTitle: string) {
    dispatch({ type: 'SET_PREFILL', title: prefillTitle });
    dispatch({ type: 'OPEN_BOOK' });
    setActiveTab('jurnal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-2 sm:px-6">
      {/* Page header */}
      <header className="mb-5 text-center">
        <h1 className="font-caveat leading-none text-[#3a4a6b]" style={{ fontSize: 48 }}>
          Jurnal Perkembangan <span style={{ color: '#f0876a' }}>♥</span>
        </h1>
        <p className="font-hand mt-1 text-[18px] text-[#8a7f72]">
          Rekam setiap momen berharga dalam perjalanan tumbuh kembang si kecil
        </p>
      </header>

      {/* Child selector */}
      <div
        className="mb-4 flex flex-wrap justify-center gap-2"
        role="tablist"
        aria-label="Pilih anak"
      >
        {ANAK_LIST.map(anak => (
          <button
            key={anak.id}
            type="button"
            role="tab"
            aria-selected={activeAnakId === anak.id}
            onClick={() => {
              dispatch({ type: 'SET_ANAK', anakId: anak.id });
            }}
            className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-[14px] font-bold shadow-sm transition ${
              activeAnakId === anak.id
                ? 'border-[#f0876a] bg-[#fff4ef]'
                : 'border-transparent bg-white hover:border-[#f0876a]/40'
            }`}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-[15px]"
              style={{ background: anak.avatarBg }}
            >
              {anak.emoji}
            </span>
            {anak.name} · {anak.ageLabel}
          </button>
        ))}
        {/* TODO: Ambil daftar anak dari backend berdasarkan user yang login */}
      </div>

      {/* Tab switcher */}
      <nav className="mb-6 flex flex-wrap justify-center gap-2">
        {(
          [
            { key: 'jurnal' as TabMode, label: '📖 Buku Jurnal', activeColor: '#5b6c9e' },
            { key: 'kalender' as TabMode, label: '📅 Kalender Momen', activeColor: '#7c9161' },
            { key: 'milestone' as TabMode, label: '⭐ Perjalanan Pencapaian', activeColor: '#f0876a' },
          ] as const
        ).map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className="rounded-full border-none px-5 py-2.5 text-[14px] font-extrabold shadow-sm transition"
            style={
              activeTab === tab.key
                ? { background: tab.activeColor, color: '#fff' }
                : { background: '#fff', color: '#8a7f72' }
            }
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* MODE 1: Buku Jurnal */}
      {activeTab === 'jurnal' && (
        <section className="jp-fade-in">
          <BukuJurnal3D />
        </section>
      )}

      {/* MODE 2: Kalender Momen */}
      {activeTab === 'kalender' && (
        <section className="jp-fade-in">
          <KalenderMomen anakId={activeAnakId} />
        </section>
      )}

      {/* MODE 3: Perjalanan Pencapaian */}
      {activeTab === 'milestone' && (
        <section className="jp-fade-in">
          <PerjalananPencapaian
            anakId={activeAnakId}
            anakName={activeAnak.name}
            onGoToJurnal={handleGoToJurnal}
          />
        </section>
      )}
    </div>
  );
}

export default function JurnalPerkembanganPage() {
  return (
    <JurnalProvider>
      <JurnalPageInner />
    </JurnalProvider>
  );
}
