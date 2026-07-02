import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Mail } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    // No mailing-list service is wired up yet - this just confirms the intent
    // locally rather than pretending to integrate with one we don't have.
    setSubscribed(true);
    setEmail('');
  }

  return (
    <footer className="w-full bg-stv-navy-dark px-4 py-[72px] font-nunito-sans text-white/[.66] md:px-8 md:pb-9">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr_1.3fr]">
        <div>
          <div className="mb-[18px] font-baloo text-[26px] font-extrabold tracking-wide text-white">STUDIVA</div>
          <p className="mb-[18px] text-[15px] leading-[1.7] text-white/[.66]">
            Pendidikan inklusif untuk setiap anak. Led by Psikolog Fitri Effendy
          </p>
          <div className="flex items-start gap-[9px] text-[15px] text-white/[.66]">
            <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-stv-yellow" strokeWidth={2} />
            <span>Jl. Mandiangin no. 65, Bukittinggi</span>
          </div>
        </div>

        <div>
          <div className="mb-[18px] font-baloo text-[18px] font-bold text-white">Products</div>
          <div className="flex flex-col gap-[13px]">
            <Link to="/#tier1" className="text-[15px] text-white/[.66] no-underline transition hover:text-stv-yellow">
              Tier 1: School
            </Link>
            <Link to="/#tier2" className="text-[15px] text-white/[.66] no-underline transition hover:text-stv-yellow">
              Tier 2: Digital
            </Link>
            <Link to="/community" className="text-[15px] text-white/[.66] no-underline transition hover:text-stv-yellow">
              Community
            </Link>
          </div>
        </div>

        <div>
          <div className="mb-[18px] font-baloo text-[18px] font-bold text-white">Perusahaan</div>
          <div className="flex flex-col gap-[13px]">
            <Link to="/tentang" className="text-[15px] text-white/[.66] no-underline transition hover:text-stv-yellow">
              Tentang Kami
            </Link>
            <Link to="/kontak" className="text-[15px] text-white/[.66] no-underline transition hover:text-stv-yellow">
              Kontak
            </Link>
            <Link to="/tentang" className="text-[15px] text-white/[.66] no-underline transition hover:text-stv-yellow">
              Syarat &amp; Privasi
            </Link>
            <a
              href="mailto:halo@studiva.id"
              className="text-[15px] text-white/[.66] no-underline transition hover:text-stv-yellow"
            >
              Bergabung Bersama Kami
            </a>
          </div>
        </div>

        <div>
          <div className="mb-[18px] font-baloo text-[18px] font-bold text-white">Connect</div>
          <div className="flex flex-col gap-[13px]">
            <div className="flex items-center gap-[9px] text-[15px] text-white/[.66]">
              <Phone className="h-4 w-4 text-stv-yellow" strokeWidth={2} />
              +62 812-1147-0407
            </div>
            <a
              href="https://wa.me/6281211470407"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-[9px] text-[15px] text-white/[.66] no-underline transition hover:text-stv-yellow"
            >
              <MessageCircle className="h-4 w-4 text-stv-yellow" strokeWidth={2} />
              WhatsApp
            </a>
            <a
              href="mailto:info@studiva.id"
              className="flex items-center gap-[9px] text-[15px] text-white/[.66] no-underline transition hover:text-stv-yellow"
            >
              <Mail className="h-4 w-4 text-stv-yellow" strokeWidth={2} />
              info@studiva.id
            </a>
          </div>
        </div>

        <div>
          <div className="mb-[18px] font-baloo text-[18px] font-bold text-white">Stay updated</div>
          {subscribed ? (
            <p className="text-[15px] text-stv-yellow">Terima kasih sudah berlangganan!</p>
          ) : (
            <>
              <p className="mb-4 text-[15px] leading-[1.6] text-white/60">
                Tips parenting inklusif langsung ke inbox Anda.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email Anda"
                  className="min-h-[48px] rounded-[14px] border-[1.5px] border-white/[.18] bg-white/[.08] px-4 py-[14px] text-[15px] text-white placeholder:text-white/50 focus:border-stv-yellow focus:outline-none"
                />
                <button
                  type="submit"
                  className="min-h-[48px] rounded-[14px] bg-stv-yellow px-4 py-[14px] font-baloo font-bold text-stv-navy transition hover:bg-stv-yellow-hover"
                >
                  Subscribe
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1200px] flex-wrap justify-between gap-3 border-t border-white/[.12] pt-7 text-sm text-white/50">
        <span>&copy; 2026 Studiva. Rumah Belajar Istimewa.</span>
        <span>Dibuat dengan kasih sayang untuk setiap anak.</span>
      </div>
    </footer>
  );
}
