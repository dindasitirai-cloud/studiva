import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
    <footer className="w-full bg-navy text-white/80">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-4 py-16 sm:grid-cols-2 md:px-10 lg:grid-cols-5">
        <div>
          <h3 className="text-h3 font-bold text-white">STUDIVA</h3>
          <p className="mt-2 text-sm">Pendidikan inklusif untuk setiap anak</p>
          <p className="mt-2 text-sm">Led by Psikolog Fitri Effendy, S.Psi</p>
          <p className="mt-2 text-sm">📍 Jl. Mandiangin no. 65, Bukittinggi</p>
        </div>

        <div>
          <h4 className="font-semibold text-white">Products</h4>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <Link to="/#tier1" className="hover:text-gold">
                Tier 1: School
              </Link>
            </li>
            <li>
              <Link to="/#tier2" className="hover:text-gold">
                Tier 2: Digital
              </Link>
            </li>
            <li>
              <Link to="/community" className="hover:text-gold">
                Community
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Company</h4>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:text-gold">
                About
              </Link>
            </li>
            <li>
              <Link to="/about#contact" className="hover:text-gold">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gold">
                Terms &amp; Privacy
              </Link>
            </li>
            <li>
              <a href="mailto:info@studiva.id" className="hover:text-gold">
                Work With Us
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Connect</h4>
          <ul className="mt-2 space-y-2 text-sm">
            <li>📞 +62 812-1147-0407</li>
            <li>
              <a
                href="https://wa.me/6281211470407"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold"
              >
                💬 WhatsApp
              </a>
            </li>
            <li>
              <a href="mailto:info@studiva.id" className="hover:text-gold">
                📧 info@studiva.id
              </a>
            </li>
          </ul>
          <div className="mt-4 flex gap-3 text-lg">
            <a
              href="https://wa.me/6281211470407"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="hover:text-gold"
            >
              💬
            </a>
            <a href="mailto:info@studiva.id" aria-label="Email" className="hover:text-gold">
              📧
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white">Stay updated</h4>
          {subscribed ? (
            <p className="mt-3 text-sm text-success">Terima kasih sudah berlangganan!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="mt-3 flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email Anda"
                className="min-h-[44px] rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                className="min-h-[44px] rounded-md bg-gold px-4 py-2 text-sm font-bold text-navy transition hover:bg-[#FFC700]"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60 md:px-10">
        <p>
          &copy; {new Date().getFullYear()} Studiva. All rights reserved. &middot;{' '}
          <Link to="/about#contact" className="hover:text-gold">
            Contact
          </Link>{' '}
          &middot;{' '}
          <Link to="/about" className="hover:text-gold">
            Privacy
          </Link>{' '}
          &middot;{' '}
          <Link to="/about" className="hover:text-gold">
            Terms
          </Link>
        </p>
      </div>
    </footer>
  );
}
