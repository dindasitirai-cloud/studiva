import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import { useKnowledgeLibrary } from '../../../context/KnowledgeLibraryContext';
import { useAnak } from '../../../context/AnakContext';
import { api } from '../../../api/client';
import {
  AgeKey, DomainCode, KnowledgeCard,
} from './knowledgeCardData';
import BookGrid from './BookGrid';
import BookCarousel from './BookCarousel';
import BookReader from './BookReader';
import { usiaDalamBulan } from '../../../types/anak';
import { BEKAL_DOMAIN_TOKENS, SEMUA_ICON_PATHS, DOMAIN_CODE_LABEL } from './bekalDomainTokens';
import BotanicalStem from '../../../components/BotanicalStem';
import FilterSubUsia, { resolveSubUsia, SUB_USIA_TO_AGE_KEY } from '../../../components/FilterSubUsia';
import type { IdSubUsia } from '../../../components/FilterSubUsia';

const ALL_DOMAIN = '__all__' as const;
type ViewTab = 'semua' | 'dibaca' | 'disimpan';
type View = 'grid' | 'carousel' | 'reader';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RETINT_REKAH = false;

// ── API card shape (snake_case) ──────────────────────────────────────────────

interface ApiKnowledgeCard {
  id: number; slug: string; age_key: string; domain: string; title: string;
  photo_src: string | null; photo_alt: string | null; photo_credit: string | null;
  read_minutes: number; is_medical: boolean; terjadi: string; penting: string;
  lakukan: string[]; perhatian: string; sci_title: string | null;
  sci_read_minutes: number | null; sci_paragraphs: string[];
  sci_sections?: Array<{ judul: string; isi: string }>;
  sources: string[];
}

function apiToLocal(c: ApiKnowledgeCard): KnowledgeCard {
  const sections = (c.sci_sections ?? []).filter(s => s.isi.trim());
  return {
    id: c.slug,
    ageKey: c.age_key as AgeKey,
    domain: c.domain as DomainCode,
    title: c.title,
    photo: { src: c.photo_src ?? `/images/rl/${c.slug}.jpg`, alt: c.photo_alt ?? c.title, credit: c.photo_credit ?? undefined },
    readMinutes: c.read_minutes,
    isMedical: c.is_medical,
    summary: { terjadi: c.terjadi, penting: c.penting, lakukan: c.lakukan, perhatian: c.perhatian },
    scientific: {
      title: c.sci_title ?? '',
      readMinutes: c.sci_read_minutes ?? 0,
      // Use structured sections when available (admin-published cards); fall back to flat paragraphs.
      sections: sections.length > 0 ? sections : undefined,
      paragraphs: sections.length === 0 ? c.sci_paragraphs : undefined,
    },
    sources: c.sources,
  };
}

// ── Age band mapping ─────────────────────────────────────────────────────────
// Maps child age in months → the set of ageKey tags to show in the gallery.
// Rules per product spec:
//   0-12 months  → show all  0-3m, 3-6m, 6-9m, 9-12m
//   >12-24 months → show 12-18m, 18-24m
//   >24-36 months → show 2-3y
//   >36-48 months → show 3-4y
//   >48-60 months → show 4-5y
//   >60 months    → show 5-6y

const AGE_BAND_KEYS: ReadonlyArray<{ maxMonths: number; keys: AgeKey[] }> = [
  { maxMonths: 12, keys: ['0-3m', '3-6m', '6-9m', '9-12m'] },
  { maxMonths: 24, keys: ['12-18m', '18-24m'] },
  { maxMonths: 36, keys: ['2-3y'] },
  { maxMonths: 48, keys: ['3-4y'] },
  { maxMonths: 60, keys: ['4-5y'] },
  { maxMonths: Infinity, keys: ['5-6y'] },
];

function childAgeToAllowedKeys(ageMonths: number): Set<AgeKey> {
  for (const band of AGE_BAND_KEYS) {
    if (ageMonths <= band.maxMonths) return new Set(band.keys);
  }
  return new Set(['5-6y'] as AgeKey[]);
}

// Returns the first (youngest) ageKey in the band — used for carousel fallback.
function childAgeToAgeKey(ageMonths: number): AgeKey {
  for (const band of AGE_BAND_KEYS) {
    if (ageMonths <= band.maxMonths) return band.keys[0];
  }
  return '5-6y';
}

// ── Domain codes in order ────────────────────────────────────────────────────
const DOMAIN_KEYS = Object.keys(BEKAL_DOMAIN_TOKENS) as DomainCode[];

// ── Main component ───────────────────────────────────────────────────────────

interface PropsKnowledgeGallery {
  defaultAgeMonths?: number;
  onJadwalkanBuku?: (card: KnowledgeCard) => void;
  /** Tampilkan hero band (judul "Wawasan Tumbuh" + sub). Default true.
   *  Di-set false saat dipakai di dalam tab Bekal agar tidak dobel judul. */
  tampilkanHero?: boolean;
}

export default function KnowledgeGallery({ defaultAgeMonths, onJadwalkanBuku, tampilkanHero = true }: PropsKnowledgeGallery = {}) {
  const { setSegments } = useAudioPlayer();
  const { isBookmarked, toggleBookmark, publishedCards } = useKnowledgeLibrary();
  // Anak aktif dari AnakContext, sumber tunggal data anak. Komponen ini juga
  // dipakai di dalam Bekal dengan defaultAgeMonths, jadi anak aktif boleh null.
  const { anakAktif } = useAnak();

  // View state machine
  const [view, setView]                   = useState<View>('grid');
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [viewTab, setViewTab]             = useState<ViewTab>('semua');
  const [selectedAge, setSelectedAge]     = useState<AgeKey>(() =>
    defaultAgeMonths != null ? childAgeToAgeKey(defaultAgeMonths) : '0-3m'
  );
  const [selectedDomain, setSelectedDomain] = useState<DomainCode | typeof ALL_DOMAIN>(ALL_DOMAIN);
  const [q, setQ]                         = useState('');

  const usiaAnakAktif = anakAktif ? usiaDalamBulan(anakAktif.tanggalLahir) : null;

  // Sub tahap filter (hanya aktif bila anak 0-1 tahun)
  const usiaBulanAnak = usiaAnakAktif ?? defaultAgeMonths ?? 0;
  const isYearOneGallery = usiaBulanAnak < 12;
  const [subUsiaGallery, setSubUsiaGallery] = useState<IdSubUsia>(
    () => resolveSubUsia(usiaBulanAnak),
  );
  useEffect(() => {
    if (usiaAnakAktif !== null) {
      setSelectedAge(childAgeToAgeKey(usiaAnakAktif));
    }
  }, [anakAktif?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Active age band: the full set of ageKeys to display for the child's age.
  const activeAgeKeys = useMemo(
    () => childAgeToAllowedKeys(usiaBulanAnak),
    [usiaBulanAnak],
  );

  // API cards (merge with static)
  const [apiCards, setApiCards] = useState<KnowledgeCard[] | null>(null);
  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    fetch(`${API_URL}/api/knowledge-cards`)
      .then(r => r.json())
      .then((data: { cards?: ApiKnowledgeCard[] }) => {
        if (Array.isArray(data.cards) && data.cards.length > 0)
          setApiCards(data.cards.map(apiToLocal));
      })
      .catch(() => {});
  }, []);

  // Merge: API cards take priority; fall back to published managed cards
  const allCards = useMemo<KnowledgeCard[]>(() => {
    if (!apiCards) return publishedCards;
    const apiSlugs = new Set(apiCards.map(c => c.id));
    return [...apiCards, ...publishedCards.filter(c => !apiSlugs.has(c.id))];
  }, [apiCards, publishedCards]);

  // API-backed "sudah dibaca" state
  const [apiReadIds, setApiReadIds] = useState<Set<string>>(new Set());
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get('/knowledge-cards/reads')
      .then(r => setApiReadIds(new Set((r.data as { cardIds: string[] }).cardIds)))
      .catch(() => {});
  }, []);

  const isRead = useCallback((id: string) => apiReadIds.has(id) || localReadIds.has(id), [apiReadIds, localReadIds]);

  const toggleRead = useCallback(async (cardId: string) => {
    const wasRead = isRead(cardId);
    setLocalReadIds(prev => {
      const s = new Set(prev);
      wasRead ? s.delete(cardId) : s.add(cardId);
      return s;
    });
    setApiReadIds(prev => {
      const s = new Set(prev);
      wasRead ? s.delete(cardId) : s.add(cardId);
      return s;
    });
    try {
      await api.post('/knowledge-cards/reads', { cardId });
    } catch {
      setLocalReadIds(prev => {
        const s = new Set(prev);
        wasRead ? s.add(cardId) : s.delete(cardId);
        return s;
      });
    }
  }, [isRead]);

  // Filtered cards for grid (includes search q)
  const filteredCards = useMemo(() => {
    const qLow = q.trim().toLowerCase();
    return allCards.filter(c => {
      const domainMatch = selectedDomain === ALL_DOMAIN || c.domain === selectedDomain;
      const qMatch = !qLow || c.title.toLowerCase().includes(qLow)
        || (DOMAIN_CODE_LABEL[c.domain] ?? '').toLowerCase().includes(qLow)
        || c.ageKey.toLowerCase().includes(qLow);

      if (viewTab === 'dibaca')   return isRead(c.id) && domainMatch && qMatch;
      if (viewTab === 'disimpan') return isBookmarked(c.id) && domainMatch && qMatch;

      const ageMatch = isYearOneGallery
        ? c.ageKey === SUB_USIA_TO_AGE_KEY[subUsiaGallery]
        : activeAgeKeys.has(c.ageKey);
      return ageMatch && domainMatch && qMatch;
    });
  }, [allCards, activeAgeKeys, selectedDomain, viewTab, isRead, isBookmarked, q, isYearOneGallery, subUsiaGallery]);

  // Update audio playlist
  useEffect(() => {
    const segs = filteredCards.flatMap(c => [
      { cardId: c.id, part: 'summary' as const },
      { cardId: c.id, part: 'scientific' as const },
    ]);
    setSegments(segs);
  }, [filteredCards, setSegments]);

  const selectedCard = allCards.find(c => c.id === selectedId) ?? null;

  // Count badges
  const readCount      = allCards.filter(c => isRead(c.id)).length;
  const savedCount     = allCards.filter(c => isBookmarked(c.id)).length;
  const semuaCount    = filteredCards.length;

  // Navigation handlers
  function handleBookClick(card: KnowledgeCard) {
    setSelectedId(card.id);
    setView('carousel');
  }

  function handleOpenBook(card: KnowledgeCard) {
    setSelectedId(card.id);
    setView('reader');
  }

  function handleBackToGrid() {
    setView('grid');
    setSelectedId(null);
  }

  // ── Render ──

  if (view === 'reader' && selectedCard) {
    const carouselCards = filteredCards.length > 0 ? filteredCards : allCards.filter(c => activeAgeKeys.has(c.ageKey));
    const idx = carouselCards.findIndex(c => c.id === selectedCard.id);
    const prevCard = idx > 0 ? carouselCards[idx - 1] : null;
    const nextCard = idx < carouselCards.length - 1 ? carouselCards[idx + 1] : null;
    return (
      <BookReader
        key={selectedCard.id}
        card={selectedCard}
        isRead={isRead(selectedCard.id)}
        onToggleRead={() => toggleRead(selectedCard.id)}
        onClose={handleBackToGrid}
        prevCard={prevCard}
        nextCard={nextCard}
        onNavigate={(c) => { setSelectedId(c.id); setView('carousel'); }}
        onNavigateInReader={(c) => setSelectedId(c.id)}
      />
    );
  }

  if (view === 'carousel') {
    return (
      <BookCarousel
        cards={filteredCards.length > 0 ? filteredCards : allCards.filter(c => activeAgeKeys.has(c.ageKey))}
        selectedId={selectedId ?? filteredCards[0]?.id ?? allCards[0]?.id ?? ''}
        onSelect={setSelectedId}
        onOpen={handleOpenBook}
        onBack={handleBackToGrid}
      />
    );
  }

  // ── Grid view ──

  return (
    <div className="flex flex-col gap-0">
      {/* Hero band — hanya untuk halaman mandiri; di dalam tab Bekal disembunyikan */}
      {tampilkanHero ? (
        <div style={{
          position:'relative', background:'#FCE3EE', borderRadius:30, marginTop:20,
          padding:'36px 44px', overflow:'hidden', display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          {/* Botanical deco top-right */}
          <div className="animate-sway" style={{ position:'absolute', top:-14, right:360, width:84, height:134, pointerEvents:'none' }}>
            <BotanicalStem cfg={{ type:'tulip', bloom:'#F06BA8', bloom2:'#F8B9D4', center:'#6E3B57' }} />
          </div>
          {/* Botanical deco bottom-right */}
          <div className="animate-sway2" style={{ position:'absolute', bottom:-20, right:452, width:66, height:108, pointerEvents:'none' }}>
            <BotanicalStem cfg={{ type:'daisy', bloom:'#5F84E6', bloom2:'#8FB8F7', center:'#FFE29A' }} />
          </div>

          {/* Left text */}
          <div style={{ position:'relative', zIndex:1 }}>
            <div className="font-nunito font-[800] text-[13px] tracking-[1px] text-rekah" style={{ textTransform:'uppercase' }}>
              BEKAL
            </div>
            <h1 className="font-fredoka font-bold text-pekat" style={{ fontSize:56, lineHeight:.95, letterSpacing:-1, marginTop:10 }}>
              Wawasan Tumbuh
            </h1>
            <div className="font-shantell text-[22px] text-rekah" style={{ marginTop:8 }}>
              Perpustakaan tumbuh kembang untuk memahami anak sesuai tahap perkembangannya.
            </div>
          </div>

          {/* Right search */}
          <div style={{ position:'relative', zIndex:1, flexShrink:0, width:340 }}>
            <div style={{
              display:'flex', alignItems:'center', gap:10,
              background:'white', borderRadius:999, padding:'14px 22px',
              boxShadow:'0 8px 24px -12px rgba(110,59,87,.18)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A98DA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Cari buku, topik, usia…"
                style={{
                  border:'none', outline:'none', background:'transparent',
                  fontFamily:'Nunito', fontWeight:700, fontSize:15, color:'#6E3B57',
                  flex:1, minWidth:0,
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Tanpa hero — sisakan kolom pencarian saja agar fungsinya tetap ada */
        <div style={{ marginTop:4, width:'100%', maxWidth:340 }}>
          <div style={{
            display:'flex', alignItems:'center', gap:10,
            background:'white', border:'2px solid #F3E2EC', borderRadius:999, padding:'12px 20px',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F06BA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Cari buku, topik, usia…"
              style={{
                border:'none', outline:'none', background:'transparent',
                fontFamily:'Nunito', fontWeight:700, fontSize:15, color:'#6E3B57',
                flex:1, minWidth:0,
              }}
            />
          </div>
        </div>
      )}

      {/* Status pills */}
      <div style={{ display:'flex', gap:14, marginTop:28, flexWrap:'wrap' }}>
        {([
          { id:'semua'    as ViewTab, label:'Semua Buku',    count: semuaCount },
          { id:'dibaca'   as ViewTab, label:'Sudah Dibaca',  count: readCount  },
          { id:'disimpan' as ViewTab, label:'Disimpan',      count: savedCount },
        ]).map(tab => {
          const active = viewTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setViewTab(tab.id)}
              style={{
                display:'inline-flex', alignItems:'center', gap:8,
                borderRadius:999, border:`1.5px solid ${active ? '#6E3B57' : '#F2E4D2'}`,
                background: active ? '#6E3B57' : 'white',
                color: active ? 'white' : '#6E3B57',
                fontFamily:'Nunito', fontWeight:800, fontSize:15,
                padding:'10px 20px',
                cursor:'pointer',
                boxShadow: active ? '0 12px 24px -16px rgba(110,59,87,.9)' : 'none',
                transition:'all .2s ease',
              }}
            >
              {tab.label}
              <span style={{
                borderRadius:999, padding:'2px 8px',
                fontFamily:'Nunito', fontWeight:800, fontSize:12,
                background: active ? 'rgba(255,255,255,.22)' : '#FCE3EE',
                color: active ? 'white' : '#F06BA8',
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Domain chips */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:16 }}>
        {/* Semua */}
        <button
          type="button"
          onClick={() => setSelectedDomain(ALL_DOMAIN)}
          style={{
            display:'inline-flex', alignItems:'center', gap:7,
            borderRadius:999, border:`1.5px solid ${selectedDomain === ALL_DOMAIN ? '#6E3B57' : '#F2E4D2'}`,
            background: selectedDomain === ALL_DOMAIN ? '#6E3B57' : 'white',
            color: selectedDomain === ALL_DOMAIN ? 'white' : '#6E3B57',
            fontFamily:'Nunito', fontWeight:700, fontSize:14,
            padding:'9px 18px', cursor:'pointer', transition:'all .2s ease',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {SEMUA_ICON_PATHS.map((d, idx) => <path key={idx} d={d} />)}
          </svg>
          Semua
        </button>

        {DOMAIN_KEYS.map(code => {
          const tok = BEKAL_DOMAIN_TOKENS[code];
          const active = selectedDomain === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setSelectedDomain(code)}
              style={{
                display:'inline-flex', alignItems:'center', gap:7,
                borderRadius:999,
                border:`1.5px solid ${active ? tok.ink : tok.border}`,
                background: active ? tok.ink : 'white',
                color: active ? 'white' : '#6E3B57',
                fontFamily:'Nunito', fontWeight:700, fontSize:14,
                padding:'9px 18px', cursor:'pointer', transition:'all .2s ease',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke={active ? 'white' : tok.ink}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {tok.iconPaths.map((d, idx) => <path key={idx} d={d} />)}
              </svg>
              {DOMAIN_CODE_LABEL[code]}
            </button>
          );
        })}
      </div>

      {/* Filter sub tahap (hanya muncul untuk anak 0-1 tahun) */}
      {isYearOneGallery && viewTab === 'semua' && (
        <div style={{ marginTop: 16 }}>
          <FilterSubUsia nilai={subUsiaGallery} onPilih={setSubUsiaGallery} />
        </div>
      )}

      {/* BookGrid — result line + 3D shelf + footer */}
      <div style={{ marginTop:28 }}>
        <BookGrid
          cards={filteredCards}
          selectedAge={selectedAge}
          setSelectedAge={setSelectedAge}
          selectedDomain={selectedDomain}
          setSelectedDomain={setSelectedDomain}
          viewTab={viewTab}
          setViewTab={setViewTab}
          isRead={isRead}
          isBookmarked={isBookmarked}
          toggleBookmark={toggleBookmark}
          onBookClick={handleBookClick}
          onJadwalkan={onJadwalkanBuku}
          hideHeader={true}
          hideAgeFilter={true}
        />
      </div>
    </div>
  );
}
