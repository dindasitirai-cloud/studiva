import React, { useRef } from 'react';
import { EntriJurnal, StickerData, MONTHS_FULL, TAB_ACTIVE } from '../data/mockJurnalData';
import EntriJurnalCard from './EntriJurnalCard';
import StickerLayer from './StickerLayer';

interface PageProps {
  entries: EntriJurnal[];
  stickers: StickerData[];
  monthIndex: number;
  showMonthHeader?: boolean;
  onAddEntry: () => void;
  onDeleteEntry: (id: string) => void;
  onMoveSticker: (id: string, x: number, y: number) => void;
  onDeleteSticker: (id: string) => void;
  userCreatedIds: Set<string>;
  isLeft?: boolean;
}

function PageContent({
  entries, stickers, monthIndex, showMonthHeader,
  onAddEntry, onDeleteEntry, onMoveSticker, onDeleteSticker,
  userCreatedIds, isLeft,
}: PageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const year = new Date().getFullYear();

  return (
    <div
      ref={containerRef}
      className="jp-paper relative h-full overflow-y-auto"
      style={{
        padding: '26px 22px 20px',
        boxShadow: isLeft
          ? 'inset -14px 0 22px -16px rgba(50,60,95,.4)'
          : '0 18px 40px rgba(70,80,120,.28), inset 14px 0 22px -16px rgba(50,60,95,.4)',
      }}
    >
      {showMonthHeader && (
        <span
          className="font-caveat mb-3 inline-block"
          style={{
            fontSize: 22,
            color: '#fff',
            background: TAB_ACTIVE[monthIndex] ?? '#f0876a',
            padding: '3px 16px',
            borderRadius: 999,
            transform: 'rotate(-1.5deg)',
            boxShadow: '0 4px 10px rgba(240,135,106,.3)',
            display: 'inline-block',
            marginBottom: 14,
          }}
        >
          ✿ {MONTHS_FULL[monthIndex]} {year}
        </span>
      )}

      {entries.length === 0 && !showMonthHeader && (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <span style={{ fontSize: 52 }}>📖</span>
          <p className="font-caveat" style={{ fontSize: 22, color: '#8b96b8', maxWidth: 200, lineHeight: 1.2 }}>
            Belum ada cerita di bulan {MONTHS_FULL[monthIndex]}. Yuk mulai tulis kenangan pertama!
          </p>
          <button
            type="button"
            onClick={onAddEntry}
            className="font-caveat mt-2 block cursor-pointer rounded-xl border-2 border-dashed border-[#93a0c6] bg-white/75 px-5 py-2 text-[#3a4a6b] transition hover:border-[#f0876a] hover:text-[#f0876a]"
            style={{ fontSize: 20 }}
          >
            ＋ Tulis Entri Baru
          </button>
        </div>
      )}

      {entries.length === 0 && showMonthHeader && (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <span style={{ fontSize: 44 }}>📖</span>
          <p className="font-caveat" style={{ fontSize: 20, color: '#8b96b8', maxWidth: 200, lineHeight: 1.2 }}>
            Belum ada cerita di bulan ini.
          </p>
          <button
            type="button"
            onClick={onAddEntry}
            className="font-caveat cursor-pointer rounded-xl border-2 border-dashed border-[#93a0c6] bg-white/75 px-5 py-2 text-[#3a4a6b] transition hover:border-[#f0876a] hover:text-[#f0876a]"
            style={{ fontSize: 18 }}
          >
            ＋ Tulis Entri Baru
          </button>
        </div>
      )}

      {entries.map(entry => (
        <EntriJurnalCard
          key={entry.id}
          entry={entry}
          isUserCreated={userCreatedIds.has(entry.id)}
          onDelete={onDeleteEntry}
        />
      ))}

      {entries.length > 0 && (
        <button
          type="button"
          onClick={onAddEntry}
          className="font-caveat mt-2 block w-full cursor-pointer rounded-xl border-2 border-dashed border-[#93a0c6] bg-white/75 px-5 py-2 text-center text-[#3a4a6b] transition hover:border-[#f0876a] hover:text-[#f0876a]"
          style={{ fontSize: 20 }}
        >
          ＋ Tulis Entri Baru
        </button>
      )}

      <StickerLayer
        stickers={stickers}
        containerRef={containerRef}
        onMove={onMoveSticker}
        onDelete={onDeleteSticker}
      />
    </div>
  );
}

// ----------------------------------------------------------------

interface AddEntryModalProps {
  monthIndex: number;
  prefillTitle: string | null;
  onSave: (entry: Omit<EntriJurnal, 'id'>) => void;
  onClose: () => void;
}

export function AddEntryModal({ monthIndex, prefillTitle, onSave, onClose }: AddEntryModalProps) {
  const [title, setTitle] = React.useState(prefillTitle ?? '');
  const [body, setBody] = React.useState('');
  const year = new Date().getFullYear();
  const today = new Date();
  const dateLabel = `${today.getDate()} ${MONTHS_FULL[today.getMonth()]} ${today.getFullYear()}`;

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      date: dateLabel,
      segments: [{ text: body.trim() || '(belum ada isi)' }],
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-[#fffdfb] p-6 shadow-2xl">
        <h3 className="font-caveat mb-1 text-[#7c9161]" style={{ fontSize: 30 }}>
          Entri Baru ✍️
        </h3>
        <p className="font-hand mb-4 text-sm text-[#a89a8c]">
          {dateLabel} — {MONTHS_FULL[monthIndex]} {year}
        </p>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Judul cerita…"
          className="font-hand mb-3 w-full rounded-xl border border-[#ecdccf] px-4 py-2 text-[17px] text-[#4a4238] focus:border-[#7c9161] focus:outline-none"
        />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Ceritakan momen berharga hari ini…"
          rows={5}
          className="font-hand mb-4 w-full rounded-xl border border-[#ecdccf] px-4 py-2 text-[16px] text-[#4a4238] focus:border-[#7c9161] focus:outline-none"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#f2e9e0] px-5 py-2 text-[13px] font-bold text-[#8a7f72] transition hover:bg-[#ece0d5]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-[#7c9161] px-5 py-2 text-[13px] font-bold text-white transition hover:bg-[#6a7e51]"
          >
            Simpan Entri
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------

interface BookSpreadProps {
  entries: EntriJurnal[];
  stickers: StickerData[];
  monthIndex: number;
  onAddEntry: (entry: Omit<EntriJurnal, 'id'>) => void;
  onDeleteEntry: (id: string) => void;
  onMoveSticker: (id: string, x: number, y: number) => void;
  onDeleteSticker: (id: string) => void;
  prefillTitle: string | null;
  onClearPrefill: () => void;
  userCreatedIds: Set<string>;
}

export default function BookSpread({
  entries, stickers, monthIndex,
  onAddEntry, onDeleteEntry,
  onMoveSticker, onDeleteSticker,
  prefillTitle, onClearPrefill,
  userCreatedIds,
}: BookSpreadProps) {
  const [showAddModal, setShowAddModal] = React.useState(false);

  // Open add modal immediately if there's a prefill
  React.useEffect(() => {
    if (prefillTitle) {
      setShowAddModal(true);
    }
  }, [prefillTitle]);

  const mid = Math.ceil(entries.length / 2);
  const leftEntries = entries.slice(0, mid);

  function handleSaveEntry(partial: Omit<EntriJurnal, 'id'>) {
    const id = `custom-${Date.now()}`;
    onAddEntry({ ...partial, id } as EntriJurnal);
    onClearPrefill();
  }

  function handleOpenAdd() {
    setShowAddModal(true);
  }

  function handleCloseModal() {
    setShowAddModal(false);
    onClearPrefill();
  }

  return (
    <>
      {/* Left page */}
      <PageContent
        entries={leftEntries}
        stickers={stickers.filter((_, i) => i % 2 === 0)}
        monthIndex={monthIndex}
        showMonthHeader
        onAddEntry={handleOpenAdd}
        onDeleteEntry={onDeleteEntry}
        onMoveSticker={onMoveSticker}
        onDeleteSticker={onDeleteSticker}
        userCreatedIds={userCreatedIds}
        isLeft
      />

      {/* Right page (rendered separately in BukuJurnal3D as rightPage) */}
      {/* This component is split — left is rendered inside .jp-left-face, right inside .rightPage */}
      {/* We export a separate RightPageContent for clarity */}

      {showAddModal && (
        <AddEntryModal
          monthIndex={monthIndex}
          prefillTitle={prefillTitle}
          onSave={handleSaveEntry}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

// Separate right page content (used directly in BukuJurnal3D)
interface RightPageContentProps {
  entries: EntriJurnal[];
  stickers: StickerData[];
  monthIndex: number;
  onAddEntry: () => void;
  onDeleteEntry: (id: string) => void;
  onMoveSticker: (id: string, x: number, y: number) => void;
  onDeleteSticker: (id: string) => void;
  userCreatedIds: Set<string>;
}

export function RightPageContent({
  entries, stickers, monthIndex,
  onAddEntry, onDeleteEntry,
  onMoveSticker, onDeleteSticker,
  userCreatedIds,
}: RightPageContentProps) {
  return (
    <PageContent
      entries={entries}
      stickers={stickers.filter((_, i) => i % 2 === 1)}
      monthIndex={monthIndex}
      onAddEntry={onAddEntry}
      onDeleteEntry={onDeleteEntry}
      onMoveSticker={onMoveSticker}
      onDeleteSticker={onDeleteSticker}
      userCreatedIds={userCreatedIds}
      isLeft={false}
    />
  );
}
