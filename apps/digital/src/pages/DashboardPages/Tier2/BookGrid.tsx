import React from 'react';
import { KnowledgeCard, AGE_RANGES, AgeKey, DomainCode, getCardContentStatus } from './knowledgeCardData';
import { getBookColors, DOMAIN_CODE_LABEL } from './bekalDomainTokens';
import { splitTitle } from './BookCarousel';
import BotanicalStem from '../../../components/BotanicalStem';

const ALL_DOMAIN = '__all__' as const;
type ViewTab = 'semua' | 'dibaca' | 'disimpan';

interface BookGridProps {
  cards: KnowledgeCard[];
  selectedAge: AgeKey;
  setSelectedAge: (age: AgeKey) => void;
  selectedDomain: DomainCode | typeof ALL_DOMAIN;
  setSelectedDomain: (d: DomainCode | typeof ALL_DOMAIN) => void;
  viewTab: ViewTab;
  setViewTab: (t: ViewTab) => void;
  isRead: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => void;
  onBookClick: (card: KnowledgeCard) => void;
  onJadwalkan?: (card: KnowledgeCard) => void;
  hideHeader?: boolean;
  hideAgeFilter?: boolean;
}

interface Book3DProps {
  card: KnowledgeCard;
  index: number;
  isRead: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent) => void;
  onClick: () => void;
  onJadwalkan?: (card: KnowledgeCard) => void;
}

function Book3D({ card, index: i, isRead: read, isBookmarked: bookmarked, onToggleBookmark, onClick, onJadwalkan }: Book3DProps) {
  const comingSoon = getCardContentStatus(card) === 'segera-hadir';
  const { soft, ink, blob, border, coverLo, spineHi, spineDark } = getBookColors(card.domain);
  const domainLabel = DOMAIN_CODE_LABEL[card.domain] ?? card.domain;
  const ageLabel = AGE_RANGES.find(a => a.key === card.ageKey)?.label ?? card.ageKey;
  const { pre, keyword, post } = splitTitle(card.title);
  const baseRotate = i % 2 === 0 ? 26 : 21;
  const baseTransform = `rotateY(${baseRotate}deg) translateY(-4px)`;

  return (
    <div style={{ perspective:1500, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end' }}>
      <div style={{ height: 392, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div
        onClick={comingSoon ? undefined : onClick}
        style={{
          position:'relative', width:280, height:344,
          cursor: comingSoon ? 'default' : 'pointer',
          transformStyle:'preserve-3d',
          transform: baseTransform,
          transition:'transform .45s cubic-bezier(.2,.7,.2,1)',
          opacity: comingSoon ? 0.65 : 1,
        }}
        onMouseEnter={e => { if (!comingSoon) (e.currentTarget as HTMLDivElement).style.transform = 'rotateY(0deg) translateY(-14px)'; }}
        onMouseLeave={e => { if (!comingSoon) (e.currentTarget as HTMLDivElement).style.transform = baseTransform; }}
        role={comingSoon ? undefined : 'button'}
        aria-disabled={comingSoon ? true : undefined}
      >
        {/* Ground shadow */}
        <div style={{ position:'absolute', left:'4%', bottom:-30, width:'94%', height:40, background:'rgba(90,50,70,.30)', filter:'blur(15px)', borderRadius:'50%' }} />

        {/* Pages (fore-edge right) */}
        <div style={{ position:'absolute', top:5, right:-21, width:42, height:334, transform:'rotateY(90deg)', background:'repeating-linear-gradient(to bottom,#F7F0E1 0 2px,#DCCBB0 2px 3.4px)', borderRadius:2 }} />

        {/* Spine (left) */}
        <div style={{ position:'absolute', top:0, left:-21, width:42, height:344, transform:'rotateY(90deg)', background:`linear-gradient(90deg,${spineHi},${ink} 32%,${spineDark})`, borderRadius:3 }}>
          <div style={{ position:'absolute', top:24, left:0, right:0, height:2, background:'rgba(255,255,255,.4)' }} />
          <div style={{ position:'absolute', bottom:24, left:0, right:0, height:2, background:'rgba(255,255,255,.4)' }} />
        </div>

        {/* Cover face */}
        <div style={{
          position:'absolute', inset:0, transform:'translateZ(21px)',
          borderRadius:'3px 16px 16px 3px', overflow:'hidden',
          border:`2px solid ${border}`,
          boxShadow:'inset 4px 0 0 rgba(0,0,0,.06), 0 20px 34px -26px rgba(90,50,70,.6)',
          background:`linear-gradient(135deg,${soft},${coverLo})`,
        }}>
          {/* Blobs */}
          <div style={{ position:'absolute', right:-36, bottom:-44, width:180, height:180, borderRadius:'50%', background:blob, opacity:.5 }} />
          <div style={{ position:'absolute', left:-24, top:28, width:100, height:100, borderRadius:'50%', background:blob, opacity:.32 }} />

          {/* Cover content */}
          <div style={{ position:'relative', zIndex:1, height:'100%', padding:'18px 18px 18px 22px', display:'flex', flexDirection:'column' }}>
            <div>
              <div style={{ fontFamily:'Nunito', fontWeight:800, fontSize:10, letterSpacing:.6, color:ink, textTransform:'uppercase' }}>{domainLabel}</div>
              <div style={{ fontFamily:'Nunito', fontWeight:700, fontSize:11, color:'#A98DA0', marginTop:2 }}>{ageLabel}</div>
            </div>
            <div style={{ flex:1, display:'flex', alignItems:'center' }}>
              <div style={{ fontFamily:'Fredoka', fontWeight:700, fontSize:24, lineHeight:1.1, color:'#6E3B57', textTransform:'uppercase', letterSpacing:-.3 }}>
                {pre && <>{pre}<br /></>}
                {keyword && (
                  <span style={{ backgroundImage:`linear-gradient(transparent 58%, ${blob} 58%)`, padding:'0 2px' }}>{keyword}</span>
                )}
                {post && <><br />{post}</>}
              </div>
            </div>
          </div>

          {/* Segera hadir badge */}
          {comingSoon && (
            <div style={{ position:'absolute', bottom:10, left:8, right:8, zIndex:10, borderRadius:999, background:'rgba(0,0,0,.48)', padding:'4px 8px', textAlign:'center', fontFamily:'Nunito', fontWeight:700, fontSize:10, color:'white' }}>
              Segera hadir
            </div>
          )}

          {/* Read indicator */}
          {!comingSoon && read && (
            <div style={{ position:'absolute', right:8, top:36, width:20, height:20, borderRadius:'50%', background:'#3FBF6A', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 6px rgba(63,191,106,.4)', zIndex:10 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* Ribbon bookmark */}
        {!comingSoon && (
          <div
            onClick={onToggleBookmark}
            style={{
              position:'absolute', top:0, right:30, width:24,
              height: bookmarked ? 104 : 58,
              background: bookmarked ? ink : border,
              clipPath:'polygon(0 0,100% 0,100% 100%,50% 74%,0 100%)',
              transition:'height .3s ease',
              zIndex:2, cursor:'pointer',
              boxShadow:'2px 3px 6px -3px rgba(0,0,0,.35)',
            }}
            role="button"
            aria-label={bookmarked ? 'Hapus bookmark' : 'Simpan bookmark'}
          />
        )}
      </div>
      </div>

      {/* Tombol jadwalkan */}
      {!comingSoon && onJadwalkan && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onJadwalkan(card); }}
          style={{
            marginTop: 10, width: '100%', maxWidth: 220,
            padding: '8px 0',
            background: '#F06BA8',
            color: '#fff', border: 'none', borderRadius: 999,
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 12, fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 150ms ease',
          }}
        >
          Jadwalkan baca buku ini
        </button>
      )}
    </div>
  );
}

export default function BookGrid({
  cards, selectedAge, setSelectedAge, selectedDomain, setSelectedDomain,
  viewTab, setViewTab, isRead, isBookmarked, toggleBookmark, onBookClick,
  onJadwalkan,
  hideHeader = false, hideAgeFilter = false,
}: BookGridProps) {
  const showAll = viewTab === 'semua' && selectedDomain === ALL_DOMAIN;
  const n = cards.length;

  return (
    <div>
      {/* Result line */}
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:20 }}>
        <span style={{ fontFamily:'Fredoka', fontWeight:600, fontSize:20, color:'#6E3B57' }}>
          {n} buku {showAll ? 'di rak' : 'ditemukan'}
        </span>
        <span style={{ fontFamily:'Nunito', fontWeight:800, fontSize:14, color:'#A98DA0' }}>Urut · Termuda</span>
      </div>

      {/* Book grid */}
      {cards.length === 0 ? (
        <div className="rounded-[24px] bg-white p-12 text-center shadow-[0_16px_34px_-26px_rgba(90,50,70,.5)]">
          <p className="font-shantell text-[24px] text-[#C7A9BE]">Belum ada buku di rak ini…</p>
          <p className="font-nunito text-[15px] text-[#A98DA0] mt-2">Coba ubah filter atau kata pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
          {cards.map((card, i) => (
            <Book3D
              key={card.id}
              card={card}
              index={i}
              isRead={isRead(card.id)}
              isBookmarked={isBookmarked(card.id)}
              onToggleBookmark={e => { e.stopPropagation(); toggleBookmark(card.id); }}
              onClick={() => onBookClick(card)}
              onJadwalkan={onJadwalkan}
            />
          ))}
        </div>
      )}

      {/* Footer botanical */}
      <div className="flex items-end justify-center gap-5 mt-10 opacity-90">
        <div style={{ width:56, height:90 }}>
          <BotanicalStem
            cfg={{ type:'fivepetal', bloom:'#F8B9D4', center:'#F06BA8' }}
          />
        </div>
        <span className="font-shantell text-[18px] text-[#C7A9BE] pb-2">mekar pada waktunya</span>
        <div style={{ width:48, height:78 }}>
          <BotanicalStem
            cfg={{ type:'bell', bloom:'#8FB8F7', bloom2:'#5F84E6' }}
          />
        </div>
      </div>
    </div>
  );
}
