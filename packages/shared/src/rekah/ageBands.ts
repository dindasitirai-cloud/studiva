export type AgeBandId = '0-6' | '7-12' | '13-18' | '19-24' | '25-36';

export interface AgeBand {
  id: AgeBandId;
  label: string;
  minBulan: number;
  maxBulan: number;
  deskripsi: string;
}

export const AGE_BANDS: AgeBand[] = [
  {
    id: '0-6',
    label: '0–6 Bulan',
    minBulan: 0,
    maxBulan: 6,
    deskripsi: 'Fondasi kepercayaan. Bayi belajar bahwa dunia aman melalui respons pengasuh yang konsisten dan penuh kehangatan.',
  },
  {
    id: '7-12',
    label: '7–12 Bulan',
    minBulan: 7,
    maxBulan: 12,
    deskripsi: 'Eksplorasi aktif dimulai. Bayi merangkak, meniru, dan membangun pemahaman sebab-akibat pertama mereka.',
  },
  {
    id: '13-18',
    label: '13–18 Bulan',
    minBulan: 13,
    maxBulan: 18,
    deskripsi: 'Langkah pertama dan kata pertama. Batita mulai menegaskan dirinya dan membutuhkan batas yang penuh kasih.',
  },
  {
    id: '19-24',
    label: '19–24 Bulan',
    minBulan: 19,
    maxBulan: 24,
    deskripsi: 'Ledakan bahasa dan emosi. Batita bermain paralel, meniru peran, dan belajar mengelola frustrasi pertama.',
  },
  {
    id: '25-36',
    label: '25–36 Bulan',
    minBulan: 25,
    maxBulan: 36,
    deskripsi: 'Bermain bersama dan berpura-pura. Anak mulai bernegosiasi, berbagi, dan membangun persahabatan pertama mereka.',
  },
];

export function getAgeBand(bulan: number): AgeBand | undefined {
  return AGE_BANDS.find(b => bulan >= b.minBulan && bulan <= b.maxBulan);
}
