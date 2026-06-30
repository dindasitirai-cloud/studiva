import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CircleCheck, Package, ListChecks, Lightbulb, Bookmark, BookmarkCheck, Puzzle, X } from 'lucide-react';
import { getStrategyById } from './strategyData';
import { useDashboardTier2 } from '../../../context/DashboardTier2Context';
import ChildPicker from './ChildPicker';

function StartDoingModal({ strategyId, onClose }: { strategyId: string; onClose: () => void }) {
  const { children, saveStrategy, unsaveStrategy, isStrategySavedByChild } = useDashboardTier2();
  const taggedChildIds = children.filter(c => isStrategySavedByChild(c.id, strategyId)).map(c => c.id);

  React.useEffect(() => {
    if (children.length === 1 && !isStrategySavedByChild(children[0].id, strategyId)) {
      saveStrategy(children[0].id, strategyId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stv-navy/30 px-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">Tandai Sudah Dilakukan</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>

        {children.length === 0 ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-stv-muted">
            Tambahkan{' '}
            <Link to="/dashboard/tier2/profil-anak" className="font-semibold text-amber-600 underline">
              profil anak
            </Link>{' '}
            agar aktivitas ini tercatat di Perjalanan Pembelajaran.
          </p>
        ) : children.length === 1 ? (
          <div className="flex items-center gap-2 rounded-xl bg-stv-green-tint px-4 py-3 text-[13px] font-semibold text-stv-green">
            <CircleCheck className="h-4 w-4 shrink-0" />
            Tercatat di Perjalanan Pembelajaran {children[0].name}.
          </div>
        ) : (
          <ChildPicker
            children={children}
            taggedIds={taggedChildIds}
            onToggle={(childId, isCurrentlyTagged) =>
              isCurrentlyTagged ? unsaveStrategy(childId, strategyId) : saveStrategy(childId, strategyId)
            }
            label="Catat strategi ini sudah dilakukan untuk anak:"
          />
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-amber-500 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-amber-600"
        >
          Selesai
        </button>
      </div>
    </div>
  );
}

export default function StrategyDetailTier2() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isStrategySavedByAnyChild } = useDashboardTier2();
  const [modalOpen, setModalOpen] = useState(false);

  const strategy = id ? getStrategyById(id) : undefined;
  const isSaved = strategy ? isStrategySavedByAnyChild(strategy.id) : false;

  if (!strategy) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 text-center shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <Puzzle className="h-10 w-10 text-amber-300" strokeWidth={1.5} />
        <h2 className="font-baloo text-[20px] font-bold text-stv-navy">Strategi tidak ditemukan</h2>
        <Link
          to="/dashboard/tier2/strategies"
          className="rounded-full bg-amber-500 px-5 py-2 text-[14px] font-bold text-white no-underline transition hover:bg-amber-600"
        >
          Kembali ke Learning Strategies
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[680px]">
      <button
        type="button"
        onClick={() => navigate('/dashboard/tier2/strategies')}
        className="mb-5 flex items-center gap-1.5 text-[14px] font-semibold text-stv-muted transition hover:text-amber-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Learning Strategies
      </button>

      <article className="rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:p-9">
        {/* Meta */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[12px] font-bold text-amber-700">{strategy.activityType}</span>
          <span className="rounded-full bg-stv-border px-2.5 py-0.5 text-[12px] font-semibold text-stv-muted">{strategy.ageGroup}</span>
          <span className="flex items-center gap-1 text-[13px] text-stv-muted">
            <Clock className="h-3.5 w-3.5" />
            {strategy.duration}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-baloo text-[26px] font-extrabold leading-[1.25] text-stv-navy sm:text-[30px]">
          {strategy.title}
        </h1>
        <p className="mt-3 text-[16px] italic leading-[1.6] text-stv-quote">{strategy.summary}</p>

        {/* Materials */}
        <div className="mt-7 border-t border-amber-100 pt-6">
          <h3 className="mb-3 flex items-center gap-2 font-baloo text-[17px] font-bold text-stv-navy">
            <Package className="h-5 w-5 text-amber-600" />
            Bahan/Alat yang Dibutuhkan
          </h3>
          <ul className="flex flex-col gap-1.5">
            {strategy.materials.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-[15px] text-stv-body">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 font-baloo text-[17px] font-bold text-stv-navy">
            <ListChecks className="h-5 w-5 text-amber-600" />
            Langkah-Langkah
          </h3>
          <ol className="flex flex-col gap-3">
            {strategy.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[12px] font-bold text-amber-700">
                  {i + 1}
                </span>
                <span className="text-[15px] leading-[1.6] text-stv-body">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Tip */}
        <div className="mt-6 flex items-start gap-3 rounded-xl bg-stv-sky-tint p-4">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-stv-sky-stroke" />
          <p className="text-[14px] leading-[1.6] text-stv-navy">{strategy.tip}</p>
        </div>

        {/* Action button - at the bottom, after the parent has read everything */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`mt-7 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-bold text-white transition ${
            isSaved ? 'bg-stv-green hover:bg-stv-green/90' : 'bg-amber-500 hover:bg-amber-600'
          }`}
        >
          {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          Sudah Dilakukan
        </button>
      </article>

      {modalOpen && <StartDoingModal strategyId={strategy.id} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
