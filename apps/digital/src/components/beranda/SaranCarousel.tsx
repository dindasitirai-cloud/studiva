import React, { useState, useEffect } from 'react';
import BotanicalStem from '../BotanicalStem';
import { SARAN_CAROUSEL } from '../../content/beranda-copy';
import type { SaranItem } from './types';

interface Props {
  slides: SaranItem[];
  onJadwalkanHariIni: (id: string) => void;
  onJadwalkanNanti: (id: string) => void;
  onAcakUlang: () => void;
}

const FLOWER_CONFIGS = [
  { type: 'daisy' as const,  bloom: '#F06BA8', bloom2: '#F8B9D4', center: '#6E3B57' },
  { type: 'tulip' as const,  bloom: '#C9B8F0', bloom2: '#F06BA8', center: '#6E3B57' },
  { type: 'bell'  as const,  bloom: '#FFE29A', bloom2: '#F06BA8', center: '#6E3B57' },
  { type: 'sprig' as const,  bloom: '#8FB8F7', bloom2: '#C9B8F0', center: '#6E3B57' },
];

export default function SaranCarousel({
  slides,
  onJadwalkanHariIni,
  onJadwalkanNanti,
  onAcakUlang,
}: Props) {
  const [slideAktif, setSlideAktif] = useState(0);

  useEffect(() => {
    setSlideAktif(0);
  }, [slides]);

  if (slides.length === 0) return null;

  const item = slides[slideAktif];
  const isAjakMain = item.jenis === 'ajak_main';
  const flowerCfg = FLOWER_CONFIGS[slideAktif % FLOWER_CONFIGS.length];

  function ke(idx: number) {
    setSlideAktif((idx + slides.length) % slides.length);
  }

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg,#FCE3EE 0%,#FFF2CE 100%)',
        borderRadius: 26,
        padding: '24px 26px',
        boxShadow: '0 20px 46px -36px rgba(90,50,70,.5)',
      }}
    >
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        {/* Botanical decoration */}
        <div
          style={{
            width: 70,
            height: 100,
            flexShrink: 0,
            animation: 'sway 8s ease-in-out infinite',
            transformOrigin: 'bottom center',
          }}
        >
          <BotanicalStem cfg={flowerCfg} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: '.6px',
              textTransform: 'uppercase',
              color: '#C88AAB',
              margin: 0,
            }}
          >
            {isAjakMain ? SARAN_CAROUSEL.labelAjakMain : SARAN_CAROUSEL.labelWawasanTumbuh}
          </p>

          <h2
            style={{
              fontFamily: 'Fredoka, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 22,
              color: '#6E3B57',
              margin: '5px 0 0',
              lineHeight: 1.2,
            }}
            role="region"
            aria-label={SARAN_CAROUSEL.ariaSlide(slideAktif, slides.length)}
          >
            {item.judul}
          </h2>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {[item.domain, item.nilai, item.durasi].filter(Boolean).map((tag, i) => (
              <span
                key={i}
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: 12,
                  color: '#6E3B57',
                  background: '#fff',
                  borderRadius: 999,
                  padding: '6px 13px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onJadwalkanHariIni(item.id)}
              style={{
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontWeight: 800,
                fontSize: 14,
                color: '#fff',
                background: '#F06BA8',
                border: 'none',
                borderRadius: 999,
                padding: '11px 22px',
                cursor: 'pointer',
                boxShadow: '0 12px 22px -12px rgba(240,107,168,.9)',
                minHeight: 44,
              }}
            >
              {isAjakMain ? SARAN_CAROUSEL.jadwalkanHariIni : SARAN_CAROUSEL.bacaSekarang}
            </button>

            <button
              type="button"
              onClick={onAcakUlang}
              aria-label={SARAN_CAROUSEL.ariaAcakUlang}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontWeight: 800,
                fontSize: 14,
                color: '#5F84E6',
                textDecoration: 'none',
              }}
            >
              {isAjakMain ? 'Cari lain →' : SARAN_CAROUSEL.simpanUntukNanti}
            </button>
          </div>
        </div>
      </div>

      {/* Carousel dots */}
      {slides.length > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            marginTop: 18,
          }}
          role="tablist"
        >
          {slides.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              type="button"
              aria-selected={i === slideAktif}
              aria-label={SARAN_CAROUSEL.ariaGoToSlide(i)}
              onClick={() => setSlideAktif(i)}
              style={{
                height: 7,
                width: i === slideAktif ? 24 : 7,
                borderRadius: 999,
                background: i === slideAktif ? '#F06BA8' : 'rgba(240,107,168,.3)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all .22s',
              }}
            />
          ))}

          <button
            type="button"
            onClick={() => ke(slideAktif - 1)}
            aria-label={SARAN_CAROUSEL.ariaSebelumnya}
            style={{
              position: 'absolute',
              left: 8,
              bottom: 14,
              background: 'none',
              border: 'none',
              padding: '4px 6px',
              cursor: 'pointer',
              color: '#D2559A',
              fontSize: 18,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => ke(slideAktif + 1)}
            aria-label={SARAN_CAROUSEL.ariaBerikutnya}
            style={{
              position: 'absolute',
              right: 8,
              bottom: 14,
              background: 'none',
              border: 'none',
              padding: '4px 6px',
              cursor: 'pointer',
              color: '#D2559A',
              fontSize: 18,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
