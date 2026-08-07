import React from "react";
import { useChildProfile } from "./useChildProfile";
import { resolveBand } from "./registry";
import BandSegera from "./BandSegera";
import BandDiluarRentang from "./BandDiluarRentang";

// Usia diambil dari AnakContext lewat useChildProfile. Tidak ada lagi props
// nama/tanggal lahir yang dioper berantai dari shell.
export default function BerandaUsia() {
  const { usiaBulan } = useChildProfile();
  const band = resolveBand(usiaBulan);

  if (!band) return <BandDiluarRentang />;

  if (band.status !== "aktif" || !band.Component) {
    return <BandSegera label={band.label} />;
  }

  const Konten = band.Component;
  return <Konten />;
}
