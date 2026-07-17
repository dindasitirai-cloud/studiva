import React from 'react';
import { useJurnal } from '../context/JurnalContext';
import { ANAK_LIST, MONTHS_FULL, EntriJurnal } from '../data/mockJurnalData';
import BookCover from './BookCover';
import MonthDividers from './MonthDividers';
import StickerPicker from './StickerPicker';
import { AddEntryModal, RightPageContent } from './BookSpread';

// Left page content (inside .jp-left-face)
function LeftPageContent() {
  const { state, dispatch, activeEntries } = useJurnal();
  const { activeMonth, activeAnakId, customEntries, prefillTitle } = state;

  const userCreatedIds = React.useMemo(() => {
    const list = customEntries[activeAnakId]?.[activeMonth] ?? [];
    return new Set(list.map(e => e.id));
  }, [customEntries, activeAnakId, activeMonth]);

  const mid = Math.ceil(activeEntries.length / 2);
  const leftEntries = activeEntries.slice(0, mid);

  const containerRef = React.useRef<HTMLDivElement>(null);

  function handleDeleteEntry(id: string) {
    dispatch({ type: 'DELETE_ENTRY', anakId: activeAnakId, month: activeMonth, entryId: id });
  }

  const [showAdd, setShowAdd] = React.useState(false);

  React.useEffect(() => {
    if (prefillTitle) setShowAdd(true);
  }, [prefillTitle]);

  function handleSaveEntry(partial: Omit<EntriJurnal, 'id'>) {
    const id = `custom-${Date.now()}`;
    dispatch({ type: 'ADD_ENTRY', anakId: activeAnakId, month: activeMonth, entry: { ...partial, id } });
    dispatch({ type: 'CLEAR_PREFILL' });
    setShowAdd(false);
  }

  const year = new Date().getFullYear();
  const MONTHS_FULL_LOCAL = MONTHS_FULL;
  const TAB_ACTIVE_LOCAL = [
    '#df8fae','#e0b64f','#7aa5cf','#8bb56a','#a884c9','#f0876a',
    '#df8fae','#e0b64f','#7aa5cf','#8bb56a','#a884c9','#f0876a',
  ];

  return (
    <div
      ref={containerRef}
      className="jp-paper relative h-full overflow-y-auto"
      style={{
        padding: '26px 22px 20px',
        boxShadow: 'inset -14px 0 22px -16px rgba(50,60,95,.4)',
      }}
    >
      {/* Month header */}
      <span
        className="font-caveat mb-3 inline-block"
        style={{
          fontSize: 22,
          color: '#fff',
          background: TAB_ACTIVE_LOCAL[activeMonth] ?? '#f0876a',
          padding: '3px 16px',
          borderRadius: 999,
          transform: 'rotate(-1.5deg)',
          boxShadow: '0 4px 10px rgba(240,135,106,.3)',
          marginBottom: 14,
        }}
      >
        ✿ {MONTHS_FULL_LOCAL[activeMonth]} {year}
      </span>

      {leftEntries.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <span style={{ fontSize: 44 }}>📖</span>
          <p className="font-caveat" style={{ fontSize: 18, color: '#8b96b8', maxWidth: 200, lineHeight: 1.2 }}>
            Belum ada cerita. Yuk tulis kenangan pertama!
          </p>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="font-caveat cursor-pointer rounded-xl border-2 border-dashed border-[#93a0c6] bg-white/75 px-4 py-2 text-[#3a4a6b] transition hover:border-[#f0876a] hover:text-[#f0876a]"
            style={{ fontSize: 17 }}
          >
            ＋ Tulis Entri Baru
          </button>
        </div>
      ) : (
        <>
          {leftEntries.map(entry => {
            const isUserCreated = userCreatedIds.has(entry.id);
            return (
              <article key={entry.id} className="mb-4">
                <h3 className="font-caveat leading-tight" style={{ fontSize: 26, color: '#3a4a6b' }}>
                  {entry.title}
                </h3>
                <div className="font-hand mb-2" style={{ fontSize: 13, color: '#7c88ab' }}>
                  ✎ {entry.date}
                </div>
                <p className="font-hand" style={{ fontSize: 15, color: '#3a4a6b', lineHeight: '24px' }}>
                  {entry.segments.map((seg, i) =>
                    seg.highlight ? (
                      <span
                        key={i}
                        style={{
                          background:
                            seg.highlight === 'pink'
                              ? 'linear-gradient(transparent 62%, #f6bdd1 62% 92%, transparent 92%)'
                              : seg.highlight === 'yellow'
                              ? 'linear-gradient(transparent 62%, #f7d98b 62% 92%, transparent 92%)'
                              : 'linear-gradient(transparent 62%, #aad4f2 62% 92%, transparent 92%)',
                        }}
                      >
                        {seg.text}
                      </span>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    ),
                  )}
                </p>
                {entry.photo && (
                  <div
                    className="relative mx-auto my-3"
                    style={{
                      background: '#fff',
                      padding: '8px 8px 6px',
                      boxShadow: '0 6px 14px rgba(60,70,110,.22)',
                      width: 140,
                      transform: `rotate(${entry.photo.rotation}deg)`,
                    }}
                  >
                    <span
                      className="absolute -top-3 left-1/2 block rounded-sm"
                      style={{
                        width: 80,
                        height: 20,
                        opacity: 0.9,
                        background:
                          entry.photo.washiVariant === 'yellow'
                            ? 'repeating-linear-gradient(45deg,#f7d98b 0 8px,#fdf1cf 8px 16px)'
                            : 'repeating-linear-gradient(45deg,#f6bdd1 0 8px,#fde3ee 8px 16px)',
                        transform: 'translateX(-50%) rotate(-3deg)',
                      }}
                    />
                    <div
                      className="flex items-center justify-center"
                      style={{ height: 100, background: entry.photo.gradientBg, fontSize: 36 }}
                    >
                      {entry.photo.placeholderEmoji}
                    </div>
                    <p className="font-caveat mt-1 text-center" style={{ fontSize: 14, color: '#55618a' }}>
                      {entry.photo.caption}
                    </p>
                  </div>
                )}
                {isUserCreated && (
                  <button
                    type="button"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="mt-1 rounded bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-400 transition hover:bg-red-100"
                  >
                    Hapus entri
                  </button>
                )}
              </article>
            );
          })}
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="font-caveat mt-1 w-full cursor-pointer rounded-xl border-2 border-dashed border-[#93a0c6] bg-white/75 px-4 py-2 text-center text-[#3a4a6b] transition hover:border-[#f0876a] hover:text-[#f0876a]"
            style={{ fontSize: 18 }}
          >
            ＋ Tulis Entri Baru
          </button>
        </>
      )}

      {showAdd && (
        <AddEntryModal
          monthIndex={activeMonth}
          prefillTitle={prefillTitle}
          onSave={handleSaveEntry}
          onClose={() => { setShowAdd(false); dispatch({ type: 'CLEAR_PREFILL' }); }}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------

export default function BukuJurnal3D() {
  const { state, dispatch, activeEntries } = useJurnal();
  const { isBookOpen, activeMonth, activeAnakId, stickers, customEntries, prefillTitle } = state;

  const anak = ANAK_LIST.find(a => a.id === activeAnakId) ?? ANAK_LIST[0];

  const userCreatedIds = React.useMemo(() => {
    const list = customEntries[activeAnakId]?.[activeMonth] ?? [];
    return new Set(list.map(e => e.id));
  }, [customEntries, activeAnakId, activeMonth]);

  const allStickers = stickers[activeAnakId]?.[activeMonth] ?? [];
  const mid = Math.ceil(activeEntries.length / 2);
  const rightEntries = activeEntries.slice(mid);

  const rightPageRef = React.useRef<HTMLDivElement>(null);

  const [showStickerPicker, setShowStickerPicker] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);

  React.useEffect(() => {
    if (prefillTitle && isBookOpen) {
      setShowAddModal(true);
    }
  }, [prefillTitle, isBookOpen]);

  function openBook() {
    dispatch({ type: 'OPEN_BOOK' });
  }
  function closeBook() {
    dispatch({ type: 'CLOSE_BOOK' });
    setShowStickerPicker(false);
  }
  function handleMonthSelect(month: number) {
    dispatch({ type: 'SET_MONTH', month });
  }

  function handleMoveSticker(id: string, x: number, y: number) {
    dispatch({ type: 'MOVE_STICKER', anakId: activeAnakId, month: activeMonth, id, x, y });
  }
  function handleDeleteSticker(id: string) {
    dispatch({ type: 'DELETE_STICKER', anakId: activeAnakId, month: activeMonth, id });
  }
  function handleDeleteEntry(id: string) {
    dispatch({ type: 'DELETE_ENTRY', anakId: activeAnakId, month: activeMonth, entryId: id });
  }
  function handlePickSticker(emoji: string, bgColor: string) {
    const container = rightPageRef.current;
    const id = `st-${Date.now()}`;
    const x = container ? Math.random() * (container.offsetWidth - 60) : 40;
    const y = container ? Math.random() * (container.offsetHeight - 60) : 40;
    dispatch({ type: 'ADD_STICKER', anakId: activeAnakId, month: activeMonth, sticker: { id, emoji, bgColor, x, y } });
  }
  function handleSaveEntry(partial: Omit<EntriJurnal, 'id'>) {
    const id = `custom-${Date.now()}`;
    dispatch({ type: 'ADD_ENTRY', anakId: activeAnakId, month: activeMonth, entry: { ...partial, id } });
    dispatch({ type: 'CLEAR_PREFILL' });
    setShowAddModal(false);
  }

  const monthName = MONTHS_FULL[activeMonth];

  return (
    <div className="flex flex-col items-center">
      {/* Book scene */}
      <div style={{ overflow: 'visible', paddingBottom: 26 }}>
        <div className="jp-scene" style={{ minHeight: 'var(--jp-page-h, 560px)' }}>
          <div className={`jp-book3d${isBookOpen ? ' open' : ''}`}>

            {/* Right page (static base) */}
            <div
              ref={rightPageRef}
              className="jp-paper absolute"
              style={{
                inset: 0,
                borderRadius: '4px 14px 14px 4px',
                boxShadow: '0 18px 40px rgba(70,80,120,.28), inset 14px 0 22px -16px rgba(50,60,95,.4)',
                overflow: 'hidden',
                position: 'absolute',
              }}
            >
              {/* Paper edge */}
              <span
                style={{
                  position: 'absolute',
                  right: -6,
                  top: 8,
                  bottom: 8,
                  width: 6,
                  borderRadius: '0 6px 6px 0',
                  background: 'repeating-linear-gradient(0deg,#e5e9f4 0 3px,#cfd6ea 3px 4px)',
                }}
              />
              <RightPageContent
                entries={rightEntries}
                stickers={allStickers}
                monthIndex={activeMonth}
                onAddEntry={() => setShowAddModal(true)}
                onDeleteEntry={handleDeleteEntry}
                onMoveSticker={handleMoveSticker}
                onDeleteSticker={handleDeleteSticker}
                userCreatedIds={userCreatedIds}
              />
            </div>

            {/* Flip element: front = cover, back = left page */}
            <div className="jp-flip">
              {/* COVER FACE */}
              <BookCover anak={anak} onOpen={openBook} />

              {/* LEFT PAGE FACE */}
              <div className="jp-face jp-left-face">
                <LeftPageContent />
              </div>
            </div>

            {/* Month dividers */}
            <MonthDividers activeMonth={activeMonth} onSelect={handleMonthSelect} />
          </div>
        </div>
      </div>

      {/* Auto-open note */}
      {!isBookOpen && (
        <p className="font-caveat mt-2 text-center" style={{ fontSize: 19, color: '#a08d78' }}>
          buku terbuka otomatis di bulan <b>{monthName}</b> ✨
        </p>
      )}

      {/* Toolbar */}
      {isBookOpen && (
        <div className="jp-fade-in mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setShowStickerPicker(v => !v)}
            className="rounded-xl border-none bg-white px-4 py-2 text-[13px] font-bold shadow-sm transition hover:shadow-md"
          >
            🎨 Sticker
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="rounded-xl border-none bg-white px-4 py-2 text-[13px] font-bold shadow-sm transition hover:shadow-md"
          >
            ✏️ Tulis Entri
          </button>
          <button
            type="button"
            onClick={closeBook}
            className="rounded-xl border-none bg-white px-4 py-2 text-[13px] font-bold shadow-sm transition hover:shadow-md"
          >
            📕 Tutup Buku
          </button>
        </div>
      )}

      <StickerPicker open={showStickerPicker && isBookOpen} onPick={handlePickSticker} />

      {showAddModal && (
        <AddEntryModal
          monthIndex={activeMonth}
          prefillTitle={prefillTitle}
          onSave={handleSaveEntry}
          onClose={() => { setShowAddModal(false); dispatch({ type: 'CLEAR_PREFILL' }); }}
        />
      )}
    </div>
  );
}
