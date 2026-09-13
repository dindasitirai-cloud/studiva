// Ornamen botani & bloom untuk halaman Temani (Phase 14T).
// Port dari design_handoff_temani (Botanical.dc.html & Flower.dc.html) menjadi
// komponen SVG React. Semua dekoratif → aria-hidden. Bukan icon library.
import React from 'react';

// ── Bloom (gerbera) — port Flower.dc.html ─────────────────────────────────────
function rng(seed: number): () => number {
  let t = (seed >>> 0) || 1;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function pTear(w: number, l: number, a: number): string {
  return `M0 0 C ${-w} ${-l * 0.3} ${-w * 0.55 + a * w} ${-l * 0.93} 0 ${-l} C ${w * 0.55 + a * w} ${-l * 0.93} ${w} ${-l * 0.3} 0 0 Z`;
}

export function Bloom({ petalColors, centerColors, seed }: { petalColors: string[]; centerColors: string[]; seed: number }) {
  const count = 15, w = 6, len = 44, jitter = 0.2;
  const rand = rng(seed);
  const spin = rand() * 44 - 22;
  const petals: { d: string; fill: string; t: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    const base = i * 360 / count + spin;
    const ang = base + (rand() * 2 - 1) * jitter * (360 / count);
    const L = len * (1 + (rand() * 2 - 1) * jitter);
    const W = w * (1 + (rand() * 2 - 1) * jitter * 0.8);
    const a = (rand() * 2 - 1) * 0.6;
    petals.push({ d: pTear(W, L, a), fill: petalColors[i % petalColors.length], t: ang });
  }
  const centerR = 20;
  const ox = (rand() * 2 - 1) * 4, oy = (rand() * 2 - 1) * 4;
  const rings = centerColors.map((c, idx) => {
    const tt = (centerColors.length - idx) / centerColors.length;
    return { cx: ox * idx * 0.6, cy: oy * idx * 0.6, rx: centerR * tt, ry: centerR * tt * (0.86 + idx * 0.03), fill: c };
  });
  return (
    <svg viewBox="-100 -100 200 200" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }} aria-hidden>
      <g>
        {petals.map((p, i) => <path key={`p${i}`} d={p.d} fill={p.fill} transform={`rotate(${p.t})`} />)}
        {rings.map((r, i) => <ellipse key={`r${i}`} cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} fill={r.fill} />)}
      </g>
    </svg>
  );
}

// ── Ornament (tanaman botani) — port Botanical.dc.html ────────────────────────
interface Path { d: string; fill: string; stroke: string; sw: number }
interface Dot { cx: number; cy: number; r: number; fill: string }

export function Ornament({ type, bloom = '#F06BA8', bloom2 = '#F8B9D4', center = '#6E3B57' }: {
  type: 'sprig' | 'tulip' | 'leaf' | 'daisy' | 'foliage' | 'bell'; bloom?: string; bloom2?: string; center?: string;
}) {
  const stem = '#8FB84A', stemDark = '#6F9E3F', leaf = '#A7C63E', leaf2 = '#8FB84A';
  const paths: Path[] = [];
  const dots: Dot[] = [];
  const S = (d: string, sw: number) => paths.push({ d, fill: 'none', stroke: stem, sw });
  const SD = (d: string, sw: number) => paths.push({ d, fill: 'none', stroke: stemDark, sw });
  const F = (d: string, fill: string) => paths.push({ d, fill, stroke: 'none', sw: 0 });

  if (type === 'tulip') {
    S('M50 149 C49 118 50 98 50 82', 7);
    F('M50 118 C31 118 21 100 25 84 C41 94 48 106 50 118 Z', leaf);
    F('M50 112 C69 112 81 96 77 80 C59 90 52 100 50 112 Z', leaf2);
    F('M36 80 C33 60 39 46 50 46 C61 46 67 60 64 80 C56 86 44 86 36 80 Z', bloom);
    F('M50 46 C56 46 61 56 62 70 C58 68 54 66 50 66 C50 58 50 52 50 46 Z', bloom2);
    F('M50 46 C44 46 39 56 38 70 C42 68 46 66 50 66 C50 58 50 52 50 46 Z', bloom);
  } else if (type === 'daisy') {
    S('M50 149 C49 120 50 100 50 86', 7);
    F('M50 122 C33 122 23 106 27 92 C43 102 49 111 50 122 Z', leaf);
    F('M50 130 C67 130 79 114 75 100 C57 110 52 119 50 130 Z', leaf2);
    const n = 8, R = 16;
    for (let i = 0; i < n; i += 1) { const a = Math.PI * 2 * i / n; dots.push({ cx: 50 + R * Math.cos(a), cy: 56 + R * Math.sin(a), r: 8.5, fill: bloom }); }
    dots.push({ cx: 50, cy: 56, r: 10, fill: center });
    dots.push({ cx: 50, cy: 56, r: 5, fill: bloom2 });
  } else if (type === 'bell') {
    S('M22 149 C40 140 52 122 44 100', 7);
    F('M30 138 C16 134 10 120 14 108 C26 116 30 128 30 138 Z', leaf);
    F('M40 118 C55 116 64 104 61 92 C49 100 44 110 40 118 Z', leaf2);
    F('M44 92 C33 92 30 106 34 116 C37 123 51 123 54 116 C58 106 55 92 44 92 Z', bloom);
    dots.push({ cx: 44, cy: 96, r: 5, fill: bloom2 });
  } else if (type === 'sprig') {
    S('M50 149 C50 122 50 98 50 74', 6);
    S('M50 100 C40 96 34 88 31 78', 5);
    S('M50 92 C60 88 66 80 69 70', 5);
    F('M50 116 C40 114 34 106 33 98 C42 102 48 109 50 116 Z', leaf);
    const cl: [number, number][] = [[50, 70], [31, 74], [69, 66]];
    cl.forEach(([bx, by]) => {
      for (let i = 0; i < 5; i += 1) { const a = Math.PI * 2 * i / 5; dots.push({ cx: bx + 6 * Math.cos(a), cy: by + 6 * Math.sin(a), r: 4, fill: bloom }); }
      dots.push({ cx: bx, cy: by, r: 2.6, fill: bloom2 });
    });
  } else if (type === 'leaf') {
    F('M50 150 C31 122 31 62 50 22 C69 62 69 122 50 150 Z', leaf);
    SD('M50 34 L50 140', 3);
  } else if (type === 'foliage') {
    SD('M50 149 C50 112 50 72 50 34', 5);
    const ys = [120, 104, 88, 72, 56];
    ys.forEach((y, i) => {
      const s = i % 2 ? 1 : -1;
      F(`M50 ${y} C${50 + s * 16} ${y - 2} ${50 + s * 20} ${y - 14} ${50 + s * 12} ${y - 18} C${50 + s * 6} ${y - 12} 50 ${y - 6} 50 ${y} Z`, i % 2 ? leaf2 : leaf);
    });
  }

  return (
    <svg viewBox="0 0 100 150" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }} aria-hidden>
      <g>
        {paths.map((p, i) => <path key={`p${i}`} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth={p.sw} strokeLinecap="round" strokeLinejoin="round" />)}
        {dots.map((c, i) => <circle key={`c${i}`} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} />)}
      </g>
    </svg>
  );
}
