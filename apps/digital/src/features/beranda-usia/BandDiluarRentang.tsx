import React from "react";

// TODO: tautkan ke halaman lengkapi profil anak saat navigasi profil tersedia

export default function BandDiluarRentang() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-6 py-16">
      <div
        className="max-w-sm rounded-[28px_28px_28px_6px] bg-white p-10 text-center"
        style={{ boxShadow: "0 14px 44px rgba(110,59,87,.07)" }}
      >
        <div
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center"
          style={{ borderRadius: "70% 70% 70% 4px", background: "#F8B9D4" }}
        >
          <svg width="26" height="26" viewBox="0 0 40 40" aria-hidden>
            <g fill="#F06BA8">
              <path d="M20 21 C14 15 15 7 20 4 C25 7 26 15 20 21Z" />
              <path d="M20 21 C27 17 34 19 35 24 C31 28 23 27 20 21Z" opacity=".85" />
              <path d="M20 21 C25 28 22 35 17 36 C13 32 15 25 20 21Z" opacity=".7" />
              <path d="M20 21 C13 25 6 22 5 17 C9 13 17 15 20 21Z" opacity=".55" />
            </g>
          </svg>
        </div>
        <h2 className="mb-3 font-bricolage text-[22px] font-bold text-pekat">
          Lengkapi profil si kecil
        </h2>
        <p className="text-[15px] leading-relaxed text-pekat/60">
          Isi tanggal lahir anak agar Rekah bisa menampilkan panduan yang pas dengan usianya.
          Panduan tersedia untuk usia 0 sampai 6 tahun.
        </p>
        <p className="mt-5 font-fraunces text-[17px] italic text-rekah/70">
          Mekar pada waktunya.
        </p>
      </div>
    </div>
  );
}
