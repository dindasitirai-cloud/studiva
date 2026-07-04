import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Clock, BookOpen, FlaskConical, AlertTriangle, Stethoscope,
} from 'lucide-react';
import { useDashboardBasePath } from '../useDashboardBasePath';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import {
  CARDS, AGE_RANGES, DOMAIN_MAP, SUMMARY_LABEL_STYLES,
} from './knowledgeCardData';
import AudioPlayerWidget from './AudioPlayerWidget';

export default function KnowledgeCardSummary() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const basePath = useDashboardBasePath();
  const { segments, setCurrentIndex, registerNavigate } = useAudioPlayer();

  const card = CARDS.find(c => c.id === cardId);
  const [imgError, setImgError] = useState(false);

  // Register navigation callback so audio player can drive page navigation
  useEffect(() => {
    registerNavigate((cId, part) => {
      if (part === 'summary') {
        navigate(`${basePath}/knowledge/${cId}`);
      } else {
        navigate(`${basePath}/knowledge/${cId}/ilmiah`);
      }
    });
  }, [registerNavigate, navigate, basePath]);

  // Sync context index to this card's summary segment
  useEffect(() => {
    if (!cardId || segments.length === 0) return;
    const idx = segments.findIndex(s => s.cardId === cardId && s.part === 'summary');
    if (idx !== -1) setCurrentIndex(idx);
  }, [cardId, segments, setCurrentIndex]);

  if (!card) {
    return (
      <div className="flex min-h-screen items-center justify-center font-nunito-sans text-stv-muted">
        Kartu tidak ditemukan.
      </div>
    );
  }

  const ageRange = AGE_RANGES.find(a => a.key === card.ageKey);
  const domainInfo = DOMAIN_MAP[card.domain];
  const DomainIcon = domainInfo.icon;

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-8 font-nunito-sans sm:px-6">
      <div className="mx-auto max-w-[680px]">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(`${basePath}/knowledge`)}
          className="mb-5 flex items-center gap-2 text-[13px] font-semibold text-stv-muted hover:text-stv-navy"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Kembali ke galeri
        </button>

        {/* Hero image */}
        <div className="mb-5 overflow-hidden rounded-2xl" style={{ aspectRatio: '16/10' }}>
          {!imgError ? (
            <img
              src={card.photo.src}
              alt={card.photo.alt}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: domainInfo.bg }}
            >
              <DomainIcon
                className="h-16 w-16"
                style={{ color: domainInfo.fg, opacity: 0.3 }}
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>

        {/* Badges row */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {ageRange && (
            <span
              className="rounded-full px-3 py-1 text-[12px] font-bold"
              style={{ background: ageRange.fill, color: ageRange.ink }}
            >
              {ageRange.label}
            </span>
          )}
          <span
            className="flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-bold"
            style={{ background: domainInfo.bg, color: domainInfo.fg }}
          >
            <DomainIcon className="h-3.5 w-3.5" strokeWidth={2} />
            {domainInfo.label}
          </span>
          {card.isMedical && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[12px] font-bold text-amber-700">
              <Stethoscope className="h-3.5 w-3.5" strokeWidth={2} />
              Butuh validasi medis
            </span>
          )}
        </div>

        {/* Title + read time */}
        <h1 className="mb-1 font-baloo text-2xl font-extrabold leading-snug text-stv-navy">
          {card.title}
        </h1>
        <p className="mb-4 flex items-center gap-1.5 text-[13px] text-stv-muted">
          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
          {card.readMinutes} menit baca
        </p>

        {/* Audio player */}
        <div className="mb-6">
          <AudioPlayerWidget />
        </div>

        {/* Medical disclaimer */}
        {card.isMedical && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-800">
            Informasi ini bersifat edukatif dan tidak menggantikan saran dokter atau tenaga kesehatan profesional. Selalu konsultasikan kondisi anak Anda dengan dokter.
          </div>
        )}

        {/* Summary content */}
        <div className="space-y-5 rounded-2xl border border-stv-border bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
          {/* Yang terjadi */}
          <section>
            <span
              className="mb-2 inline-block rounded-full px-3 py-1 text-[12px] font-bold"
              style={{
                background: SUMMARY_LABEL_STYLES.terjadi.bg,
                color: SUMMARY_LABEL_STYLES.terjadi.fg,
              }}
            >
              {SUMMARY_LABEL_STYLES.terjadi.text}
            </span>
            <p className="text-[15px] leading-relaxed text-stv-body">{card.summary.terjadi}</p>
          </section>

          <hr className="border-stv-border" />

          {/* Kenapa penting */}
          <section>
            <span
              className="mb-2 inline-block rounded-full px-3 py-1 text-[12px] font-bold"
              style={{
                background: SUMMARY_LABEL_STYLES.penting.bg,
                color: SUMMARY_LABEL_STYLES.penting.fg,
              }}
            >
              {SUMMARY_LABEL_STYLES.penting.text}
            </span>
            <p className="text-[15px] leading-relaxed text-stv-body">{card.summary.penting}</p>
          </section>

          <hr className="border-stv-border" />

          {/* Yang bisa dilakukan */}
          <section>
            <span
              className="mb-2 inline-block rounded-full px-3 py-1 text-[12px] font-bold"
              style={{
                background: SUMMARY_LABEL_STYLES.lakukan.bg,
                color: SUMMARY_LABEL_STYLES.lakukan.fg,
              }}
            >
              {SUMMARY_LABEL_STYLES.lakukan.text}
            </span>
            <ul className="mt-2 space-y-2">
              {card.summary.lakukan.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[15px] text-stv-body">
                  <span
                    className="mt-0.5 h-5 w-5 shrink-0 rounded-full text-center text-[11px] font-bold leading-5"
                    style={{ background: SUMMARY_LABEL_STYLES.lakukan.bg, color: SUMMARY_LABEL_STYLES.lakukan.fg }}
                  >
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Perhatian block */}
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" strokeWidth={2} />
            <span className="text-[13px] font-bold text-red-700">Perlu perhatian bila</span>
          </div>
          <p className="text-[14px] leading-relaxed text-red-800">{card.summary.perhatian}</p>
        </div>

        {/* Scientific detail CTA */}
        <button
          type="button"
          onClick={() => navigate(`${basePath}/knowledge/${card.id}/ilmiah`)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[14px] font-bold text-amber-700 transition hover:bg-amber-100"
        >
          <FlaskConical className="h-4 w-4" strokeWidth={2} />
          Detail ilmiah terkait ini
        </button>

        {/* Sources */}
        {card.sources.length > 0 && (
          <div className="mt-6 flex items-start gap-2 text-[12px] text-stv-muted">
            <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <div>
              <span className="font-semibold">Sumber: </span>
              {card.sources.join(' · ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
