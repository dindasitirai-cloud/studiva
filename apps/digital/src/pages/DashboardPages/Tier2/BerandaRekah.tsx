// TODO: digantikan onboarding Akar Keluarga (build 2)
import React from 'react';
import LogoRekah from '../../../components/LogoRekah';
import Kelopak from '../../../components/Kelopak';

export default function BerandaRekah() {
  return (
    <div className="relative flex min-h-[calc(100vh-72px)] flex-col items-center justify-center overflow-hidden bg-kanvas px-6 py-16 text-center">
      {/* Decorative petals */}
      <Kelopak
        aria-hidden
        rotate={90}
        className="absolute -right-16 -top-16 h-56 w-56 bg-fajar pointer-events-none"
      />
      <Kelopak
        aria-hidden
        rotate={270}
        className="absolute -bottom-20 -left-20 h-72 w-72 bg-fajar opacity-50 pointer-events-none"
      />

      <div className="relative z-10 max-w-sm">
        <div className="flex justify-center mb-8">
          <LogoRekah size={52} withWordmark />
        </div>

        <p className="font-bricolage font-bold text-[1.6rem] text-pekat leading-snug mb-4">
          Rekah sedang mekar 🌱
        </p>
        <p className="text-pekat/60 text-[1rem] leading-relaxed">
          Fitur pertamamu segera hadir.
        </p>
      </div>
    </div>
  );
}
