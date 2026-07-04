import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Bookmark } from 'lucide-react';
import { useDashboardBasePath } from '../useDashboardBasePath';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import { useKnowledgeLibrary } from '../../../context/KnowledgeLibraryContext';
import {
  CARDS, AGE_RANGES, DOMAIN_MAP, AgeKey, DomainCode, KnowledgeCard,
} from './knowledgeCardData';

const ALL_DOMAIN = '__all__' as const;

// Shape returned by the API (snake_case, different from static CARDS camelCase)
interface ApiKnowledgeCard {
  id: number;
  slug: string;
  age_key: string;
  domain: string;
  title: string;
  photo_src: string | null;
  photo_alt: string | null;
  photo_credit: string | null;
  read_minutes: number;
  is_medical: boolean;
  terjadi: string;
  penting: string;
  lakukan: string[];
  perhatian: string;
  sci_title: string | null;
  sci_read_minutes: number | null;
  sci_paragraphs: string[];
  sources: string[];
}

/** Convert an API card into the local KnowledgeCard shape so existing components work unchanged. */
function apiToLocal(c: ApiKnowledgeCard): KnowledgeCard {
  return {
    id: c.slug,              // use slug as string id to match existing routing (/:cardId)
    ageKey: c.age_key as AgeKey,
    domain: c.domain as DomainCode,
    title: c.title,
    photo: {
      src: c.photo_src ?? `/images/rl/${c.slug}.jpg`,
      alt: c.photo_alt ?? c.title,
      credit: c.photo_credit ?? undefined,
    },
    readMinutes: c.read_minutes,
    isMedical: c.is_medical,
    summary: {
      terjadi: c.terjadi,
      penting: c.penting,
      lakukan: c.lakukan,
      perhatian: c.perhatian,
    },
    scientific: {
      title: c.sci_title ?? '',
      readMinutes: c.sci_read_minutes ?? 0,
      paragraphs: c.sci_paragraphs,
    },
    sources: c.sources,
  };
}

export default function KnowledgeGallery() {
  const navigate = useNavigate();
  const basePath = useDashboardBasePath();
  const { setSegments } = useAudioPlayer();

  const [selectedAge, setSelectedAge] = useState<AgeKey>('0-3m');
  const [selectedDomain, setSelectedDomain] = useState<DomainCode | typeof ALL_DOMAIN>(ALL_DOMAIN);

  // API cards — fetched on mount and merged with static fallback
  const [apiCards, setApiCards] = useState<KnowledgeCard[] | null>(null);

  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/knowledge-cards`)
      .then(r => r.json())
      .then((data: { cards?: ApiKnowledgeCard[] }) => {
        if (Array.isArray(data.cards) && data.cards.length > 0) {
          setApiCards(data.cards.map(apiToLocal));
        }
      })
      .catch(() => {
        // silently fall back to static CARDS
      });
  }, []);

  // Merge: replace static cards with API cards when API has them, otherwise keep static
  const allCards = useMemo<KnowledgeCard[]>(() => {
    if (!apiCards) return CARDS;
    // Build a set of slugs returned by the API so we can de-duplicate
    const apiSlugs = new Set(apiCards.map(c => c.id));
    // Keep static cards whose id (slug) is NOT returned by the API
    const staticOnly = CARDS.filter(c => !apiSlugs.has(c.id));
    return [...apiCards, ...staticOnly];
  }, [apiCards]);

  const filteredCards = useMemo(() => {
    return allCards.filter(c => {
      const ageMatch = c.ageKey === selectedAge;
      const domainMatch = selectedDomain === ALL_DOMAIN || c.domain === selectedDomain;
      return ageMatch && domainMatch;
    });
  }, [allCards, selectedAge, selectedDomain]);

  // Update audio playlist whenever filter changes
  useEffect(() => {
    const segs = filteredCards.flatMap(c => [
      { cardId: c.id, part: 'summary' as const },
      { cardId: c.id, part: 'scientific' as const },
    ]);
    setSegments(segs);
  }, [filteredCards, setSegments]);

  function handleCardClick(card: KnowledgeCard) {
    navigate(`${basePath}/knowledge/${card.id}`);
  }

  const ageRange = AGE_RANGES.find(a => a.key === selectedAge);

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-8 font-nunito-sans sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-baloo text-2xl font-extrabold text-stv-navy sm:text-3xl">
            Panduan Tumbuh Kembang
          </h1>
          <p className="mt-1 text-[15px] text-stv-body">
            Kartu pengetahuan tumbuh kembang anak usia 0–6 tahun, berbasis riset.
          </p>
        </div>

        {/* Age range pills — horizontally scrollable */}
        <div className="mb-5 -mx-4 px-4 sm:-mx-0 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {AGE_RANGES.map(ar => {
              const isActive = selectedAge === ar.key;
              return (
                <button
                  key={ar.key}
                  type="button"
                  onClick={() => setSelectedAge(ar.key)}
                  className="shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-bold transition"
                  style={isActive
                    ? { background: ar.fill, color: ar.ink, borderColor: ar.ink }
                    : { background: 'white', color: '#888', borderColor: '#E5E7EB' }
                  }
                >
                  {ar.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Domain filter chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedDomain(ALL_DOMAIN)}
            className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition ${
              selectedDomain === ALL_DOMAIN
                ? 'border-stv-navy bg-stv-navy text-white'
                : 'border-stv-border bg-white text-stv-body hover:border-stv-navy/40'
            }`}
          >
            Semua
          </button>
          {(Object.entries(DOMAIN_MAP) as [DomainCode, typeof DOMAIN_MAP[DomainCode]][]).map(([code, info]) => {
            const isActive = selectedDomain === code;
            const Icon = info.icon;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedDomain(code)}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition"
                style={isActive
                  ? { background: info.bg, color: info.fg, borderColor: info.fg }
                  : { background: 'white', color: '#888', borderColor: '#E5E7EB' }
                }
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                {info.label}
              </button>
            );
          })}
        </div>

        {/* Cards grid */}
        {filteredCards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stv-border bg-white py-16 text-center text-stv-muted">
            <p className="text-[15px] font-semibold">Belum ada kartu untuk filter ini.</p>
            <p className="mt-1 text-[13px]">Coba pilih rentang usia atau domain yang berbeda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCards.map(card => (
              <KnowledgeCardTileWrapper
                key={card.id}
                card={card}
                ageRange={ageRange}
                onClick={() => handleCardClick(card)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TileProps {
  card: KnowledgeCard;
  ageRange?: typeof AGE_RANGES[number];
  onClick: () => void;
  isRead?: boolean;
  isBookmarked?: boolean;
}

// Wrapper reads context so the tile stays a pure component
function KnowledgeCardTileWrapper(props: Omit<TileProps, 'isRead' | 'isBookmarked'>) {
  const { isRead, isBookmarked } = useKnowledgeLibrary();
  return (
    <KnowledgeCardTile
      {...props}
      isRead={isRead(props.card.id)}
      isBookmarked={isBookmarked(props.card.id)}
    />
  );
}

function KnowledgeCardTile({ card, ageRange, onClick, isRead, isBookmarked }: TileProps) {
  const domainInfo = DOMAIN_MAP[card.domain];
  const Icon = domainInfo.icon;
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-stv-border bg-white text-left shadow-[0_4px_16px_rgba(16,58,107,.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(16,58,107,.12)]"
    >
      {/* Image area — 16:10 ratio */}
      <div className="relative w-full overflow-hidden" style={{ paddingBottom: '62.5%' }}>
        {!imgError ? (
          <img
            src={card.photo.src}
            alt={card.photo.alt}
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: domainInfo.bg }}
          >
            <Icon
              className="h-12 w-12"
              style={{ color: domainInfo.fg, opacity: 0.35 }}
              strokeWidth={1.5}
            />
          </div>
        )}
        {/* Read / Bookmark badges */}
        <div className="absolute right-2 top-2 flex gap-1.5">
          {isRead && (
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-stv-green shadow">
              <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} />
              Dibaca
            </span>
          )}
          {isBookmarked && (
            <span className="flex items-center justify-center rounded-full bg-amber-400 p-1 shadow">
              <Bookmark className="h-3 w-3 text-white" fill="white" strokeWidth={0} />
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Domain badge */}
        <div className="flex items-center gap-1.5">
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ background: domainInfo.bg, color: domainInfo.fg }}
          >
            <Icon className="h-3 w-3" strokeWidth={2} />
            {domainInfo.label}
          </span>
        </div>

        {/* Title */}
        <p className="font-baloo text-[15px] font-bold leading-snug text-stv-navy">
          {card.title}
        </p>

        {/* Footer: age pill + read time */}
        <div className="mt-auto flex items-center justify-between pt-1">
          {ageRange && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{ background: ageRange.fill, color: ageRange.ink }}
            >
              {ageRange.label}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-stv-muted">
            <Clock className="h-3 w-3" strokeWidth={2} />
            {card.readMinutes} mnt
          </span>
        </div>
      </div>
    </button>
  );
}
