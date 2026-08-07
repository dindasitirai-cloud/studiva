import React from 'react';
import KartuAnakAktif from './rail/KartuAnakAktif';
import KartuIramaHariIni from './rail/KartuIramaHariIni';
import KartuCuacaHati from './rail/KartuCuacaHati';
import KartuMomenTerakhir from './rail/KartuMomenTerakhir';
import KartuPanen from './rail/KartuPanen';
import KartuTransisiTahap from './rail/KartuTransisiTahap';

interface Props {
  usiaBulan: number;
  tampilTransisi: boolean;
}

export default function RailBeranda({ usiaBulan, tampilTransisi }: Props) {
  return (
    <aside
      aria-label="Ringkasan hari ini"
      className="flex flex-col gap-3 xl:sticky xl:top-[88px] xl:self-start xl:max-h-[calc(100vh-88px)] xl:overflow-y-auto"
    >
      <KartuAnakAktif />
      <KartuIramaHariIni />
      <KartuCuacaHati />
      <KartuMomenTerakhir />
      <KartuPanen />
      {tampilTransisi && <KartuTransisiTahap usiaBulan={usiaBulan} />}
    </aside>
  );
}
