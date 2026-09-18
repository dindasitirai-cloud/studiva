import React from 'react';
import BotanicalStem, { type BotanicalConfig } from '../../../components/BotanicalStem';

type PlantType = NonNullable<BotanicalConfig['type']>;

// Meniru helper plant() dari design_handoff_beranda: bloom/center dari argumen,
// warna daun/tangkai hijau tetap. Ornamen = dekoratif (aria-hidden).
export function plant(type: PlantType, o: { b?: string; b2?: string; c?: string } = {}): BotanicalConfig {
  return { type, bloom: o.b, bloom2: o.b2 ?? '#fff', center: o.c ?? '#6E3B57', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' };
}

export interface TanamanCfg { w: string; h: string; dur: string; op?: number; cfg: BotanicalConfig; }

export function Tanaman({ w, h, dur, op = 1, cfg, style }: TanamanCfg & { style?: React.CSSProperties }) {
  return (
    <div aria-hidden style={{ width: w, height: h, flex: 'none', opacity: op, animation: `sway ${dur} ease-in-out infinite`, transformOrigin: 'bottom center', ...style }}>
      <BotanicalStem cfg={cfg} />
    </div>
  );
}
