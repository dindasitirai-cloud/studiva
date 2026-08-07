import React from 'react';

export interface BotanicalConfig {
  type?: 'tulip' | 'daisy' | 'bell' | 'fivepetal' | 'sprig' | 'leaf' | 'foliage' | 'star' | 'squiggle' | 'arch' | 'dot';
  bloom?: string;
  bloom2?: string;
  center?: string;
  stem?: string;
  stemDark?: string;
  leaf?: string;
  leaf2?: string;
}

interface SvgPath { d: string; fill: string; stroke: string; sw: number; }
interface SvgDot  { cx: number; cy: number; r: number; fill: string; }

function build(p: BotanicalConfig): { paths: SvgPath[]; dots: SvgDot[] } {
  const type     = p.type     ?? 'daisy';
  const bloom    = p.bloom    ?? '#F06BA8';
  const bloom2   = p.bloom2   ?? '#F8B9D4';
  const center   = p.center   ?? '#6E3B57';
  const stem     = p.stem     ?? '#6F9E3F';
  const stemDark = p.stemDark ?? '#4E6B2E';
  const leaf     = p.leaf     ?? '#A7C63E';
  const leaf2    = p.leaf2    ?? '#8FB84A';

  const paths: SvgPath[] = [];
  const dots:  SvgDot[]  = [];
  const S  = (d: string, sw: number): SvgPath => ({ d, fill: 'none', stroke: stem,     sw });
  const SD = (d: string, sw: number): SvgPath => ({ d, fill: 'none', stroke: stemDark, sw });
  const F  = (d: string, fill: string): SvgPath => ({ d, fill, stroke: 'none', sw: 0 });

  if (type === 'tulip') {
    paths.push(S('M50 149 C49 118 50 98 50 82', 7));
    paths.push(F('M50 118 C31 118 21 100 25 84 C41 94 48 106 50 118 Z', leaf));
    paths.push(F('M50 112 C69 112 81 96 77 80 C59 90 52 100 50 112 Z', leaf2));
    paths.push(F('M36 80 C33 60 39 46 50 46 C61 46 67 60 64 80 C56 86 44 86 36 80 Z', bloom));
    paths.push(F('M50 46 C56 46 61 56 62 70 C58 68 54 66 50 66 C50 58 50 52 50 46 Z', bloom2));
    paths.push(F('M50 46 C44 46 39 56 38 70 C42 68 46 66 50 66 C50 58 50 52 50 46 Z', bloom));
  } else if (type === 'daisy') {
    paths.push(S('M50 149 C49 120 50 100 50 86', 7));
    paths.push(F('M50 122 C33 122 23 106 27 92 C43 102 49 111 50 122 Z', leaf));
    paths.push(F('M50 130 C67 130 79 114 75 100 C57 110 52 119 50 130 Z', leaf2));
    const n = 8, R = 16;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      dots.push({ cx: 50 + R * Math.cos(a), cy: 56 + R * Math.sin(a), r: 8.5, fill: bloom });
    }
    dots.push({ cx: 50, cy: 56, r: 10, fill: center });
    dots.push({ cx: 50, cy: 56, r: 5,  fill: bloom2 });
  } else if (type === 'bell') {
    paths.push(S('M22 149 C40 140 52 122 44 100', 7));
    paths.push(F('M30 138 C16 134 10 120 14 108 C26 116 30 128 30 138 Z', leaf));
    paths.push(F('M40 118 C55 116 64 104 61 92 C49 100 44 110 40 118 Z', leaf2));
    paths.push(F('M44 92 C33 92 30 106 34 116 C37 123 51 123 54 116 C58 106 55 92 44 92 Z', bloom));
    dots.push({ cx: 44, cy: 96, r: 5, fill: bloom2 });
  } else if (type === 'fivepetal') {
    paths.push(S('M64 149 C60 126 48 116 42 104', 7));
    paths.push(F('M58 132 C43 132 34 118 38 106 C50 114 55 123 58 132 Z', leaf));
    const n = 5, R = 12;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.PI * 2 * i) / n;
      dots.push({ cx: 42 + R * Math.cos(a), cy: 96 + R * Math.sin(a), r: 9, fill: bloom });
    }
    dots.push({ cx: 42, cy: 96, r: 5.5, fill: center });
  } else if (type === 'sprig') {
    paths.push(S('M50 149 C50 122 50 98 50 74', 6));
    paths.push(S('M50 100 C40 96 34 88 31 78', 5));
    paths.push(S('M50 92 C60 88 66 80 69 70', 5));
    paths.push(F('M50 116 C40 114 34 106 33 98 C42 102 48 109 50 116 Z', leaf));
    const clusters: [number, number][] = [[50, 70], [31, 74], [69, 66]];
    clusters.forEach(([bx, by]) => {
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 * i) / 5;
        dots.push({ cx: bx + 6 * Math.cos(a), cy: by + 6 * Math.sin(a), r: 4, fill: bloom });
      }
      dots.push({ cx: bx, cy: by, r: 2.6, fill: bloom2 });
    });
  } else if (type === 'leaf') {
    paths.push(F('M50 150 C31 122 31 62 50 22 C69 62 69 122 50 150 Z', leaf));
    paths.push(SD('M50 34 L50 140', 3));
  } else if (type === 'foliage') {
    paths.push(SD('M50 149 C50 112 50 72 50 34', 5));
    [120, 104, 88, 72, 56].forEach((y, i) => {
      const s = i % 2 ? 1 : -1;
      paths.push(F(
        `M50 ${y} C${50 + s * 16} ${y - 2} ${50 + s * 20} ${y - 14} ${50 + s * 12} ${y - 18}` +
        ` C${50 + s * 6} ${y - 12} 50 ${y - 6} 50 ${y} Z`,
        i % 2 ? leaf2 : leaf,
      ));
    });
  } else if (type === 'star') {
    let d = '';
    const R = 40, r = 17, pts = 5, rot = -Math.PI / 2;
    for (let i = 0; i < pts * 2; i++) {
      const rad = i % 2 ? r : R;
      const a = (Math.PI / pts) * i + rot;
      const x = 50 + rad * Math.cos(a), y = 75 + rad * Math.sin(a);
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
    }
    paths.push(F(d + 'Z', bloom));
  } else if (type === 'squiggle') {
    paths.push({ d: 'M62 34 C34 30 34 58 54 64 C34 70 34 98 60 94', fill: 'none', stroke: bloom, sw: 11 });
  } else if (type === 'arch') {
    paths.push({ d: 'M30 96 C30 52 70 52 70 96', fill: 'none', stroke: bloom, sw: 13 });
  } else if (type === 'dot') {
    dots.push({ cx: 50, cy: 75, r: 22, fill: bloom });
  }

  return { paths, dots };
}

interface Props {
  cfg: BotanicalConfig;
  className?: string;
  style?: React.CSSProperties;
}

export default function BotanicalStem({ cfg, className, style }: Props) {
  const { paths, dots } = build(cfg);
  return (
    <svg
      viewBox="0 0 100 150"
      style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible', ...style }}
      className={className}
      aria-hidden
    >
      <g>
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill={p.fill}
            stroke={p.stroke || undefined}
            strokeWidth={p.sw || undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {dots.map((c, i) => (
          <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} />
        ))}
      </g>
    </svg>
  );
}
