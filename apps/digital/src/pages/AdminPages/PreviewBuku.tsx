import React, { useState } from 'react';
import { X, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import { KnowledgeCard, DOMAIN_MAP, AGE_RANGES } from '@studiva/shared';
import { CoverImage } from '../DashboardPages/Tier2/BookCarousel';
import { getBookColors, DOMAIN_CODE_LABEL } from '../DashboardPages/Tier2/bekalDomainTokens';
import { composeScientific } from '../../lib/composeScientific';

type Tab = 'sampul' | 'ringkasan' | 'ilmiah';

interface PreviewBukuProps {
  card: KnowledgeCard;
  onClose: () => void;
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: 'Nunito', fontWeight: 800, fontSize: 13,
        color: active ? '#6E3B57' : '#A98DA0',
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '9px 16px 13px',
        borderBottom: active ? '2.5px solid #6E3B57' : '2.5px solid transparent',
        marginBottom: -1.5,
        transition: 'color .15s',
      }}
    >
      {children}
    </button>
  );
}

export default function PreviewBuku({ card, onClose }: PreviewBukuProps) {
  const [tab, setTab] = useState<Tab>('sampul');
  const tokens = getBookColors(card.domain);
  const ageLabel = AGE_RANGES.find(a => a.key === card.ageKey)?.label ?? card.ageKey;
  const domainLabel = DOMAIN_CODE_LABEL[card.domain] ?? DOMAIN_MAP[card.domain]?.label ?? card.domain;
  const sci = composeScientific(card);
  const sciSections = sci.sections ?? [];
  const sciParagraphs = sci.paragraphs ?? [];
  const hasSci = sciSections.length > 0 || sciParagraphs.length > 0 || !!sci.title;
  const filteredSources = card.sources.filter(s => s.trim());

  function stopProp(e: React.MouseEvent) { e.stopPropagation(); }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(40,20,35,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        onClick={stopProp}
        style={{
          width: '100%', maxWidth: 680, maxHeight: '90vh',
          background: '#fff', borderRadius: 24,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 36px 90px -20px rgba(40,20,35,0.55)',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px 0', flexShrink: 0,
        }}>
          <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, color: '#6E3B57', margin: 0 }}>
            Preview Buku
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: '50%',
              border: '1.5px solid #EDD8EA', background: '#FAF5F9',
              cursor: 'pointer', color: '#6E3B57', flexShrink: 0,
            }}
          >
            <X style={{ width: 16, height: 16, strokeWidth: 2.5 }} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', gap: 0, padding: '12px 22px 0', flexShrink: 0,
          borderBottom: '1.5px solid #F0E7ED',
        }}>
          <TabBtn active={tab === 'sampul'}   onClick={() => setTab('sampul')}>Tampilan Rak</TabBtn>
          <TabBtn active={tab === 'ringkasan'} onClick={() => setTab('ringkasan')}>Ringkasan</TabBtn>
          <TabBtn active={tab === 'ilmiah'}   onClick={() => setTab('ilmiah')}>Detail Ilmiah</TabBtn>
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '26px 24px 32px' }}>

          {/* ─ TAB: Tampilan Rak ─ */}
          {tab === 'sampul' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              {/* 3-D book on shelf */}
              <div style={{ perspective: '900px', perspectiveOrigin: '50% 60%', marginBottom: 0 }}>
                <div style={{
                  position: 'relative', width: 200, height: 280,
                  transformStyle: 'preserve-3d',
                  transform: 'rotateY(-12deg) rotateX(2deg)',
                  boxShadow: '8px 10px 30px rgba(90,50,70,0.32)',
                  borderRadius: '3px 14px 14px 3px',
                  overflow: 'hidden',
                }}>
                  {/* Spine shadow */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 18,
                    background: 'rgba(0,0,0,0.28)', zIndex: 2,
                  }} />
                  <CoverImage card={card} />
                </div>
              </div>

              {/* Shelf bar */}
              <div style={{
                width: 260, height: 12, marginTop: -2,
                background: 'linear-gradient(to bottom, #C9A47E, #9A6A3A)',
                borderRadius: '0 0 6px 6px',
                boxShadow: '0 6px 18px rgba(120,80,40,0.35)',
                marginBottom: 24,
              }} />

              {/* Title + chips */}
              <div style={{ textAlign: 'center', maxWidth: 340 }}>
                <div style={{
                  fontFamily: 'Fredoka', fontWeight: 700, fontSize: 24, lineHeight: 1.2, color: '#6E3B57',
                }}>
                  {card.title || '(Judul belum diisi)'}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'Nunito', fontWeight: 800, fontSize: 12,
                    color: tokens.ink, background: tokens.soft,
                    padding: '5px 12px', borderRadius: 999,
                  }}>{ageLabel}</span>
                  <span style={{
                    fontFamily: 'Nunito', fontWeight: 800, fontSize: 12,
                    color: tokens.ink, background: '#fff',
                    border: `1.5px solid ${tokens.border}`,
                    padding: '4px 12px', borderRadius: 999,
                  }}>{domainLabel}</span>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  marginTop: 10, fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: '#A98DA0',
                }}>
                  <Clock style={{ width: 14, height: 14 }} />
                  {card.readMinutes} menit baca
                </div>
              </div>
            </div>
          )}

          {/* ─ TAB: Ringkasan ─ */}
          {tab === 'ringkasan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {card.isMedical && (
                <div style={{
                  background: '#FFF6E0', border: '1.5px solid #FADFA4', borderRadius: 14,
                  padding: '12px 16px', fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: '#B07D1B',
                }}>
                  Informasi ini bersifat edukatif dan tidak menggantikan saran dokter atau tenaga kesehatan profesional.
                </div>
              )}

              {!card.summary ? (
                <p style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 14, color: '#A98DA0' }}>
                  Konten ringkasan belum diisi.
                </p>
              ) : (
                <>
                  <div style={{ background: '#F8F3EA', borderRadius: 20, padding: '22px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Terjadi */}
                    <div>
                      <div style={{ display: 'inline-block', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: '#B07D1B', background: '#F6E6C4', padding: '4px 12px', borderRadius: 999 }}>
                        Yang biasa terjadi di usia ini
                      </div>
                      <p style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 15, lineHeight: 1.55, color: '#5C4A56', margin: '10px 0 0' }}>
                        {card.summary.terjadi || '(belum diisi)'}
                      </p>
                    </div>
                    {/* Penting */}
                    <div>
                      <div style={{ display: 'inline-block', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: '#5E8A34', background: '#E4F0D3', padding: '4px 12px', borderRadius: 999 }}>
                        Kenapa penting
                      </div>
                      <p style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 15, lineHeight: 1.55, color: '#5C4A56', margin: '10px 0 0' }}>
                        {card.summary.penting || '(belum diisi)'}
                      </p>
                    </div>
                    {/* Lakukan */}
                    {card.summary.lakukan.filter(s => s.trim()).length > 0 && (
                      <div>
                        <div style={{ display: 'inline-block', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: '#4A72D6', background: '#DEEAFB', padding: '4px 12px', borderRadius: 999 }}>
                          Yang bisa Anda lakukan
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                          {card.summary.lakukan.filter(s => s.trim()).map((text, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                              <span style={{
                                flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                                background: '#DEEAFB', color: '#4A72D6',
                                fontFamily: 'Nunito', fontWeight: 800, fontSize: 12,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>{i + 1}</span>
                              <span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 15, lineHeight: 1.5, color: '#5C4A56' }}>{text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Perhatian */}
                  {card.summary.perhatian && (
                    <div style={{ background: '#FDECEF', border: '1.5px solid #F4C6D0', borderRadius: 18, padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, color: '#C0435F' }}>
                        <AlertTriangle style={{ width: 16, height: 16, strokeWidth: 2 }} />
                        Perlu perhatian bila
                      </div>
                      <p style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 14.5, lineHeight: 1.5, color: '#B4566B', margin: '8px 0 0' }}>
                        {card.summary.perhatian}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Sources */}
              {filteredSources.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: '#A98DA0' }}>
                  <BookOpen style={{ width: 15, height: 15, flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Sumber:</strong> {filteredSources.join(' · ')}</span>
                </div>
              )}
            </div>
          )}

          {/* ─ TAB: Detail Ilmiah ─ */}
          {tab === 'ilmiah' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!hasSci ? (
                <p style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 14, color: '#A98DA0' }}>
                  Detail ilmiah belum diisi.
                </p>
              ) : (
                <>
                  {/* Title */}
                  {sci.title && (
                    <h2 style={{
                      fontFamily: 'Fredoka', fontWeight: 700, fontSize: 26,
                      lineHeight: 1.15, color: '#6E3B57', margin: 0,
                    }}>
                      {sci.title}
                    </h2>
                  )}

                  {/* Read time */}
                  {sci.readMinutes && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: '#A98DA0' }}>
                      <Clock style={{ width: 14, height: 14 }} /> {sci.readMinutes} menit baca
                    </div>
                  )}

                  {/* Sections */}
                  {sciSections.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {sciSections.map((sec, i) => (
                        <div key={i}>
                          {sec.judul && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                              <div style={{ flexShrink: 0, width: 5, height: 20, borderRadius: 3, background: tokens.ink }} />
                              <div style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 18, color: '#6E3B57' }}>
                                {sec.judul}
                              </div>
                            </div>
                          )}
                          <p style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 15, lineHeight: 1.62, color: '#5C4A56', margin: 0 }}>
                            {sec.isi}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fallback: flat paragraphs (old-format cards) */}
                  {sciSections.length === 0 && sciParagraphs.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {sciParagraphs.map((p, i) => (
                        <p key={i} style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 15, lineHeight: 1.62, color: '#5C4A56', margin: 0 }}>
                          {p}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* References */}
                  {filteredSources.length > 0 && (
                    <div style={{ marginTop: 8, borderTop: '1.5px solid #F0E7D8', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 17, color: '#6E3B57' }}>Referensi</div>
                      {filteredSources.map((src, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{
                            flexShrink: 0, width: 21, height: 21, borderRadius: 6,
                            background: '#F1E7D7', color: '#8A7280',
                            fontFamily: 'Nunito', fontWeight: 800, fontSize: 11,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>{i + 1}</span>
                          <span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, lineHeight: 1.5, color: '#8A7280' }}>
                            {src}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
