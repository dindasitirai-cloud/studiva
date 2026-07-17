import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Mail } from 'lucide-react';
import LogoRekah from './LogoRekah';

export default function Footer() {
  return (
    <footer className="w-full bg-pekat px-4 py-14 text-white/60 md:px-8">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <LogoRekah size={32} withWordmark light />
          </div>
          <p className="mb-4 text-[14px] leading-[1.7] text-white/55">
            Rekah — oleh Psikolog Fitri Effendy. Satu keluarga dengan Sekolah Studiva, Bukittinggi.
          </p>
          <p className="text-[13px] text-white/35 font-fraunces italic">Mekar pada waktunya.</p>
        </div>

        <div>
          <div className="mb-4 font-bricolage text-[16px] font-bold text-white">Perusahaan</div>
          <div className="flex flex-col gap-3">
            <Link to="/tentang" className="text-[14px] text-white/55 no-underline transition hover:text-mawar">
              Tentang Rekah
            </Link>
            <Link to="/kontak" className="text-[14px] text-white/55 no-underline transition hover:text-mawar">
              Kontak
            </Link>
            <Link to="/tentang" className="text-[14px] text-white/55 no-underline transition hover:text-mawar">
              Syarat &amp; Privasi
            </Link>
          </div>
        </div>

        <div>
          <div className="mb-4 font-bricolage text-[16px] font-bold text-white">Hubungi Kami</div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-[14px] text-white/55">
              <Phone className="h-4 w-4 text-madu shrink-0" strokeWidth={2} />
              +62 812-1147-0407
            </div>
            <a
              href="https://wa.me/6281211470407"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-[14px] text-white/55 no-underline transition hover:text-mawar"
            >
              <MessageCircle className="h-4 w-4 text-madu shrink-0" strokeWidth={2} />
              WhatsApp
            </a>
            <a
              href="mailto:info@studiva.id"
              className="flex items-center gap-2.5 text-[14px] text-white/55 no-underline transition hover:text-mawar"
            >
              <Mail className="h-4 w-4 text-madu shrink-0" strokeWidth={2} />
              info@studiva.id
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-[1200px] flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-[12px] text-white/35">
        <span>&copy; {new Date().getFullYear()} Rekah. Semua hak cipta dilindungi.</span>
        <span>Dibuat dengan kasih sayang untuk setiap keluarga Indonesia.</span>
      </div>
    </footer>
  );
}
