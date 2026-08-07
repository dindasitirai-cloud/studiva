import React from 'react';

export interface FlowerMarkConfig {
  shape?:        'gerbera' | 'aster' | 'daisy' | 'cosmos' | 'scallop' | 'round' | 'poppy' | 'star' | 'bud';
  petalCount?:   number;
  petalW?:       number;
  petalLen?:     number;
  seed?:         number;
  jitter?:       number;
  spin?:         number;
  petalColors?:  string[];
  petalColor?:   string;
  budColor?:     string;
  budIndices?:   number[];
  double?:       boolean;
  innerColors?:  string[];
  centerColors?: string[];
  centerR?:      number;
}

interface Petal { d: string; fill: string; transform: string; }
interface Ring  { cx: number; cy: number; rx: number; ry: number; fill: string; }

const PRESETS: Record<string, { count: number; w: number; len: number }> = {
  gerbera: { count: 15, w: 6,  len: 44 }, aster:   { count: 18, w: 5,  len: 45 },
  daisy:   { count: 11, w: 10, len: 36 }, cosmos:  { count: 8,  w: 15, len: 40 },
  scallop: { count: 8,  w: 20, len: 30 }, round:   { count: 9,  w: 17, len: 29 },
  poppy:   { count: 6,  w: 23, len: 36 }, star:    { count: 10, w: 9,  len: 42 },
  bud:     { count: 5,  w: 15, len: 34 },
};

function mkRng(seed: number) {
  let t = (seed >>> 0) || 1;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pTear(w: number, l: number, a: number) {
  return `M0 0 C ${-w} ${-l*.3} ${-w*.55+a*w} ${-l*.93} 0 ${-l}`
       + ` C ${w*.55+a*w} ${-l*.93} ${w} ${-l*.3} 0 0 Z`;
}
function pCosmos(w: number, l: number, a: number) {
  return `M0 0 C ${-w} ${-.32*l} ${-w} ${-.78*l} ${-.42*w} ${-.96*l}`
       + ` C ${-.22*w} ${-1.05*l} ${-.05*w} ${-.85*l} 0 ${-.88*l}`
       + ` C ${.05*w} ${-.85*l} ${.22*w} ${-1.05*l} ${.42*w} ${-.96*l}`
       + ` C ${w} ${-.78*l} ${w} ${-.32*l} 0 0 Z`;
}
function pScallop(w: number, l: number, a: number) {
  return `M0 0 C ${-w} ${-.16*l} ${-w*(1+a*.1)} ${-.85*l} 0 ${-l}`
       + ` C ${w*(1-a*.1)} ${-.85*l} ${w} ${-.16*l} 0 0 Z`;
}
function pStar(w: number, l: number, a: number) {
  return `M0 0 L ${-w} ${-.48*l} L ${a*w*.35} ${-l} L ${w} ${-.48*l} Z`;
}
function genPetal(shape: string, w: number, l: number, a: number) {
  if (shape === 'cosmos') return pCosmos(w, l, a);
  if (shape === 'scallop' || shape === 'round' || shape === 'poppy') return pScallop(w, l, a);
  if (shape === 'star') return pStar(w, l, a);
  return pTear(w, l, a);
}

function buildFlower(p: FlowerMarkConfig): { petals: Petal[]; inner: Petal[]; rings: Ring[] } {
  const shape  = p.shape  ?? 'gerbera';
  const pr     = PRESETS[shape] ?? PRESETS.gerbera;
  const count  = p.petalCount ?? pr.count;
  const w      = p.petalW     ?? pr.w;
  const len    = p.petalLen   ?? pr.len;
  const seed   = p.seed       ?? 7;
  const jitter = p.jitter     !== undefined ? p.jitter : 0.24;
  const cols   = p.petalColors ?? [p.petalColor ?? '#F06BA8'];
  const budColor = p.budColor ?? '#C7D65C';
  const budIdx   = p.budIndices ?? null;
  const rand   = mkRng(seed);
  const spin   = p.spin !== undefined ? p.spin : (rand() * 44 - 22);

  const petals: Petal[] = [];
  for (let i = 0; i < count; i++) {
    const base = i * 360 / count + spin;
    if (budIdx && budIdx.indexOf(i) >= 0) {
      petals.push({ d: pTear(w * .6, len * .42, 0), fill: budColor, transform: `rotate(${base})` });
      continue;
    }
    const ang = base + (rand() * 2 - 1) * jitter * (360 / count);
    const L   = len * (1 + (rand() * 2 - 1) * jitter);
    const W   = w   * (1 + (rand() * 2 - 1) * jitter * .8);
    const a   = (rand() * 2 - 1) * .6;
    petals.push({ d: genPetal(shape, W, L, a), fill: cols[i % cols.length], transform: `rotate(${ang})` });
  }

  const inner: Petal[] = [];
  if (p.double) {
    const ic = p.innerColors ?? cols;
    for (let i = 0; i < count; i++) {
      const base = (i + 0.5) * 360 / count + spin;
      const ang  = base + (rand() * 2 - 1) * jitter * (360 / count);
      const L    = len * .58 * (1 + (rand() * 2 - 1) * jitter);
      const W    = w   * .82 * (1 + (rand() * 2 - 1) * jitter * .8);
      inner.push({ d: genPetal(shape, W, L, (rand() * 2 - 1) * .6), fill: ic[i % ic.length], transform: `rotate(${ang})` });
    }
  }

  const ringsC  = p.centerColors ?? ['#7A3F5E', '#F06BA8', '#FFB24D', '#FFE07A'];
  const centerR = p.centerR ?? 20;
  const ox = (rand() * 2 - 1) * 4, oy = (rand() * 2 - 1) * 4;
  const rings: Ring[] = ringsC.map((c, idx) => {
    const t = (ringsC.length - idx) / ringsC.length;
    return { cx: ox * idx * .6, cy: oy * idx * .6, rx: centerR * t, ry: centerR * t * (.86 + idx * .03), fill: c };
  });

  return { petals, inner, rings };
}

interface Props {
  cfg: FlowerMarkConfig;
  className?: string;
  style?: React.CSSProperties;
}

export default function FlowerMark({ cfg, className, style }: Props) {
  const { petals, inner, rings } = buildFlower(cfg);
  return (
    <svg
      viewBox="-100 -100 200 200"
      style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible', ...style }}
      className={className}
      aria-hidden
    >
      <g>
        {petals.map((p, i) => <path key={i}       d={p.d} fill={p.fill} transform={p.transform} />)}
        {inner.map( (p, i) => <path key={`i${i}`} d={p.d} fill={p.fill} transform={p.transform} />)}
        {rings.map( (r, i) => <ellipse key={i} cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} fill={r.fill} />)}
      </g>
    </svg>
  );
}
