import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen, ClipboardList, HelpCircle, ChevronDown, Check,
} from 'lucide-react';
import LogoRekah from './LogoRekah';
import Kelopak from './Kelopak';
import { REKAH_COPY, REKAH_WA_NUMBER } from './rekahLandingCopy';

// ---------------------------------------------------------------------------
// Bloom-in: adds rekah-bloom class when section enters viewport (CSS-only anim)
// ---------------------------------------------------------------------------
function useSectionBloom<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.style.opacity = '0';
    el.style.transform = 'scale(0.92)';
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '';
          el.style.transform = '';
          el.style.animation = 'rekah-bloom-in 220ms ease-out both';
          obs.disconnect();
        }
      },
      { threshold: 0.07 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------
interface FormData {
  nama: string;
  wa: string;
  usia: string;
  nilai: string[];
  tantangan: string;
}
interface FormErrors {
  nama: string;
  wa: string;
  usia: string;
  nilai: string;
}

function buildWaText(f: FormData): string {
  return [
    'Halo Rekah! 🌸',
    `Nama: ${f.nama}`,
    `Usia si kecil: ${f.usia}`,
    `Nilai yang ingin ditanam: ${f.nilai.join(' & ')}`,
    f.tantangan ? `Tantangan saat ini: ${f.tantangan}` : '',
  ].filter(Boolean).join('\n');
}

function validate(f: FormData): FormErrors {
  const waPattern = /^(08|628)\d{8,11}$/;
  return {
    nama:  f.nama.trim()   ? '' : REKAH_COPY.formulir.validasiNama,
    wa:    waPattern.test(f.wa.replace(/\s+/g, '')) ? '' : REKAH_COPY.formulir.validasiWa,
    usia:  f.usia          ? '' : REKAH_COPY.formulir.validasiUsia,
    nilai: f.nilai.length === 2 ? '' : REKAH_COPY.formulir.validasiNilai,
  };
}

const MASALAH_ICON = { BookOpen, ClipboardList, HelpCircle };

// ---------------------------------------------------------------------------
// RekahLandingPage
// ---------------------------------------------------------------------------
export default function RekahLandingPage() {
  // Inject fonts + noindex per-route (CRA: no per-page <head> API)
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href =
      'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Fraunces:ital,wght@1,600&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap';
    document.head.appendChild(fontLink);

    // TODO: hapus noindex saat go-live publik
    const noindex = document.createElement('meta');
    noindex.name = 'robots';
    noindex.content = 'noindex';
    document.head.appendChild(noindex);

    return () => {
      document.head.removeChild(fontLink);
      document.head.removeChild(noindex);
    };
  }, []);

  // Form
  const [form, setForm] = useState<FormData>({ nama: '', wa: '', usia: '', nilai: [], tantangan: '' });
  const [errors, setErrors] = useState<FormErrors>({ nama: '', wa: '', usia: '', nilai: '' });
  const [nilaiMsg, setNilaiMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Section bloom refs
  const masalahRef  = useSectionBloom<HTMLElement>();
  const caraRef     = useSectionBloom<HTMLElement>();
  const formRef     = useSectionBloom<HTMLElement>();
  const kepRef      = useSectionBloom<HTMLElement>();
  const faqRef      = useSectionBloom<HTMLElement>();

  function handleNilai(label: string) {
    setNilaiMsg('');
    setForm(prev => {
      if (prev.nilai.includes(label)) return { ...prev, nilai: prev.nilai.filter(n => n !== label) };
      if (prev.nilai.length >= 2) { setNilaiMsg(REKAH_COPY.formulir.pesanNilaiPenuh); return prev; }
      return { ...prev, nilai: [...prev.nilai, label] };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    const url = `https://wa.me/${REKAH_WA_NUMBER}?text=${encodeURIComponent(buildWaText(form))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  }

  return (
    <>
      {/* Bloom keyframe — inline so it's scoped to this page */}
      <style>{`
        @keyframes rekah-bloom-in {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="bg-kanvas min-h-screen font-jakarta text-pekat">

        {/* ── 1. HERO ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-kanvas px-6 py-16 md:py-24 min-h-[88vh] flex flex-col justify-center">
          {/* Decorative petals */}
          <Kelopak
            aria-hidden
            rotate={90}
            className="absolute -top-20 -right-12 w-56 h-56 bg-fajar pointer-events-none"
          />
          <Kelopak
            aria-hidden
            rotate={270}
            className="absolute -bottom-24 -left-16 w-72 h-72 bg-fajar opacity-60 pointer-events-none"
          />

          <div className="relative z-10 mx-auto w-full max-w-xl text-center">
            <div className="flex justify-center mb-8">
              <LogoRekah size={44} withWordmark />
            </div>

            <h1 className="font-bricolage font-extrabold text-[2.6rem] md:text-[3.5rem] leading-[1.08] tracking-tight text-pekat mb-6 whitespace-pre-line">
              {REKAH_COPY.hero.h1}
            </h1>

            <p className="text-[1.05rem] text-pekat/70 leading-relaxed mb-9 max-w-md mx-auto">
              {REKAH_COPY.hero.body}
            </p>

            <a
              href="#akar-keluarga"
              className="inline-flex items-center justify-center px-9 py-4 rounded-full bg-rekah text-white font-bold text-[1.05rem] min-h-[52px] shadow-[0_2px_12px_rgba(224,82,107,0.3)] hover:bg-rekah-tua transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
            >
              {REKAH_COPY.hero.cta}
            </a>

            <p className="mt-5 text-sm font-semibold text-daun">
              {REKAH_COPY.hero.trust}
            </p>
          </div>
        </section>

        {/* ── 2. MASALAH ───────────────────────────────────────────── */}
        <section ref={masalahRef} className="bg-fajar px-6 py-16 md:py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-bricolage font-bold text-[1.9rem] md:text-[2.4rem] leading-tight text-center mb-11">
              {REKAH_COPY.masalah.h2}
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {REKAH_COPY.masalah.kartu.map(({ icon, teks }) => {
                const Icon = MASALAH_ICON[icon];
                return (
                  <div
                    key={icon}
                    className="rounded-[22px] bg-white p-6 shadow-[0_2px_12px_rgba(224,82,107,0.08)]"
                  >
                    <Icon className="w-7 h-7 text-rekah mb-3" aria-hidden="true" />
                    <p className="text-[0.95rem] leading-relaxed text-pekat/80">{teks}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 3. CARA KERJA ────────────────────────────────────────── */}
        <section ref={caraRef} className="bg-kanvas px-6 py-16 md:py-20">
          <div className="mx-auto max-w-xl">
            <h2 className="font-bricolage font-bold text-[1.9rem] md:text-[2.4rem] leading-tight text-center mb-11">
              {REKAH_COPY.cara.h2}
            </h2>

            <ol className="space-y-7">
              {REKAH_COPY.cara.langkah.map(({ n, judul, isi }) => (
                <li key={n} className="flex items-start gap-5">
                  {/* Petal step marker */}
                  <Kelopak
                    aria-hidden
                    className="flex-shrink-0 w-11 h-11 bg-rekah flex items-center justify-center"
                  >
                    <span className="font-bricolage font-extrabold text-white text-sm leading-none">{n}</span>
                  </Kelopak>
                  <div>
                    <h3 className="font-bricolage font-bold text-[1.05rem] text-pekat mb-1">{judul}</h3>
                    <p className="text-[0.95rem] text-pekat/70 leading-relaxed">{isi}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-12 text-center font-fraunces italic text-[1.25rem] text-rekah-tua">
              "{REKAH_COPY.cara.penutup}"
            </p>
          </div>
        </section>

        {/* ── 4. FORMULIR ──────────────────────────────────────────── */}
        <section
          id="akar-keluarga"
          ref={formRef}
          className="bg-pucuk px-6 py-16 md:py-20"
        >
          <div className="mx-auto max-w-lg">
            <h2 className="font-bricolage font-bold text-[2rem] text-center mb-2">
              {REKAH_COPY.formulir.judul}
            </h2>
            <p className="text-center text-pekat/65 text-[0.95rem] mb-10">
              {REKAH_COPY.formulir.subjudul}
            </p>

            {submitted ? (
              /* Success state */
              <div className="text-center py-10">
                <div className="flex justify-center mb-6">
                  <Kelopak className="w-20 h-20 bg-madu/25 flex items-center justify-center" rotate={180}>
                    <span className="text-[2.2rem]" role="img" aria-label="bunga">🌸</span>
                  </Kelopak>
                </div>
                <h3 className="font-bricolage font-bold text-[1.5rem] mb-3">
                  {REKAH_COPY.formulir.suksesJudul}
                </h3>
                <p className="text-pekat/70">{REKAH_COPY.formulir.suksesIsi}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">

                {/* Nama */}
                <div>
                  <label htmlFor="rk-nama" className="block text-sm font-semibold text-pekat mb-2">
                    {REKAH_COPY.formulir.labelNama} <span className="text-rekah" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="rk-nama"
                    type="text"
                    value={form.nama}
                    onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                    placeholder={REKAH_COPY.formulir.placeholderNama}
                    aria-required="true"
                    aria-invalid={!!errors.nama || undefined}
                    aria-describedby={errors.nama ? 'err-nama' : undefined}
                    className="w-full rounded-[14px] border border-daun/30 bg-white px-4 py-3.5 text-pekat placeholder:text-pekat/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:border-rekah transition-colors min-h-[52px]"
                  />
                  {errors.nama && <p id="err-nama" role="alert" className="mt-2 text-sm text-rekah-tua">{errors.nama}</p>}
                </div>

                {/* WhatsApp */}
                <div>
                  <label htmlFor="rk-wa" className="block text-sm font-semibold text-pekat mb-2">
                    {REKAH_COPY.formulir.labelWa} <span className="text-rekah" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="rk-wa"
                    type="tel"
                    value={form.wa}
                    onChange={e => setForm(f => ({ ...f, wa: e.target.value }))}
                    placeholder={REKAH_COPY.formulir.placeholderWa}
                    aria-required="true"
                    aria-invalid={!!errors.wa || undefined}
                    aria-describedby={errors.wa ? 'err-wa' : undefined}
                    className="w-full rounded-[14px] border border-daun/30 bg-white px-4 py-3.5 text-pekat placeholder:text-pekat/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:border-rekah transition-colors min-h-[52px]"
                  />
                  {errors.wa && <p id="err-wa" role="alert" className="mt-2 text-sm text-rekah-tua">{errors.wa}</p>}
                </div>

                {/* Usia pills */}
                <fieldset>
                  <legend className="text-sm font-semibold text-pekat mb-3">
                    {REKAH_COPY.formulir.labelUsia} <span className="text-rekah" aria-hidden="true">*</span>
                  </legend>
                  <div className="flex flex-wrap gap-2" role="group" aria-required="true">
                    {REKAH_COPY.formulir.usiaOpsi.map(opsi => {
                      const active = form.usia === opsi;
                      return (
                        <button
                          key={opsi}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, usia: opsi }))}
                          aria-pressed={active}
                          className={`px-4 py-2 rounded-full text-sm font-semibold min-h-[44px] border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
                            active
                              ? 'bg-rekah text-white border-rekah'
                              : 'bg-white text-pekat/70 border-daun/25 hover:border-rekah/40'
                          }`}
                        >
                          {opsi}
                        </button>
                      );
                    })}
                  </div>
                  {errors.usia && <p role="alert" className="mt-2 text-sm text-rekah-tua">{errors.usia}</p>}
                </fieldset>

                {/* Nilai kartu */}
                <fieldset>
                  <legend className="text-sm font-semibold text-pekat mb-3">
                    {REKAH_COPY.formulir.labelNilai} <span className="text-rekah" aria-hidden="true">*</span>
                  </legend>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {REKAH_COPY.formulir.nilaiOpsi.map(({ label, emoji }) => {
                      const active = form.nilai.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          role="checkbox"
                          aria-checked={active}
                          onClick={() => handleNilai(label)}
                          className={`relative flex flex-col items-center gap-1.5 rounded-[18px] border-2 p-4 text-sm font-semibold min-h-[80px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
                            active
                              ? 'border-rekah bg-mawar/30 text-rekah-tua'
                              : 'border-daun/20 bg-white text-pekat/65 hover:border-rekah/35'
                          }`}
                        >
                          {active && (
                            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rekah">
                              <Check className="w-3 h-3 text-white" aria-hidden="true" />
                            </span>
                          )}
                          <span className="text-2xl leading-none" aria-hidden="true">{emoji}</span>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {nilaiMsg && (
                    <p className="mt-2 text-sm text-rekah/80 font-medium" role="status">{nilaiMsg}</p>
                  )}
                  {errors.nilai && !nilaiMsg && (
                    <p role="alert" className="mt-2 text-sm text-rekah-tua">{errors.nilai}</p>
                  )}
                </fieldset>

                {/* Tantangan */}
                <div>
                  <label htmlFor="rk-tantangan" className="block text-sm font-semibold text-pekat mb-2">
                    {REKAH_COPY.formulir.labelTantangan}
                  </label>
                  <textarea
                    id="rk-tantangan"
                    value={form.tantangan}
                    onChange={e => setForm(f => ({ ...f, tantangan: e.target.value }))}
                    placeholder={REKAH_COPY.formulir.placeholderTantangan}
                    rows={3}
                    className="w-full rounded-[14px] border border-daun/30 bg-white px-4 py-3.5 text-pekat placeholder:text-pekat/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:border-rekah transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-rekah text-white font-bold text-[1.05rem] py-4 min-h-[54px] shadow-[0_2px_12px_rgba(224,82,107,0.25)] hover:bg-rekah-tua transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2"
                >
                  {REKAH_COPY.formulir.tombolKirim}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* ── 5. KEPERCAYAAN ───────────────────────────────────────── */}
        <section ref={kepRef} className="bg-kanvas px-6 py-16 md:py-20">
          <div className="mx-auto max-w-xl">
            <h2 className="font-bricolage font-bold text-[1.9rem] md:text-[2.4rem] leading-tight text-center mb-6">
              {REKAH_COPY.kepercayaan.h2}
            </h2>
            <p className="text-[0.97rem] text-pekat/70 leading-relaxed text-center mb-10">
              {REKAH_COPY.kepercayaan.isi}
            </p>

            {/* Curator card */}
            <div className="rounded-[22px] bg-fajar p-6 flex items-start gap-4 shadow-[0_2px_12px_rgba(224,82,107,0.08)]">
              {/* TODO: foto & bio final dari Raisha */}
              <div className="w-14 h-14 flex-shrink-0 rounded-full bg-mawar flex items-center justify-center" aria-hidden="true">
                <span className="font-bricolage font-bold text-rekah text-xl">F</span>
              </div>
              <div>
                <p className="font-bricolage font-bold text-pekat text-[1rem]">
                  {REKAH_COPY.kepercayaan.namaKurator}
                </p>
                <p className="text-sm text-pekat/65 mt-1 leading-relaxed">
                  {REKAH_COPY.kepercayaan.peranKurator}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. FAQ ───────────────────────────────────────────────── */}
        <section ref={faqRef} className="bg-fajar px-6 py-16 md:py-20">
          <div className="mx-auto max-w-xl">
            <h2 className="font-bricolage font-bold text-[1.8rem] text-center mb-8">
              Pertanyaan yang sering ditanyakan
            </h2>
            <div className="space-y-3">
              {REKAH_COPY.faq.map((item, i) => (
                <div
                  key={i}
                  className="rounded-[20px] bg-white overflow-hidden shadow-[0_2px_12px_rgba(224,82,107,0.06)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    className="w-full text-left px-6 py-5 font-semibold text-[0.95rem] text-pekat flex items-center justify-between gap-3 min-h-[60px] hover:bg-fajar/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rekah"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-rekah flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-[0.93rem] text-pekat/70 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. FOOTER ────────────────────────────────────────────── */}
        <footer className="bg-pekat px-6 py-12 text-center">
          <div className="flex justify-center mb-4">
            <LogoRekah size={36} withWordmark light />
          </div>
          <p className="text-sm text-kanvas/55 mb-6">{REKAH_COPY.footer.tagline}</p>
          <p className="text-xs text-kanvas/40 leading-relaxed">
            {REKAH_COPY.footer.atribusi}{' '}
            {/* TODO: URL domain sekolah */}
            <a
              href={REKAH_COPY.footer.urlSekolah}
              className="text-mawar hover:text-kanvas underline underline-offset-2 transition-colors"
            >
              {REKAH_COPY.footer.labelSekolah}
            </a>
          </p>
        </footer>

      </div>
    </>
  );
}
