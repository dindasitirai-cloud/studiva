// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React from "react";
import { Flower2, Search, MessagesSquare } from "lucide-react";
import styles from "./TahunPertama.module.css";
import { useChildProfile } from "../../useChildProfile";
import { renderRichText } from "../../renderRichText";
import { HERO, STAGES, QUOTE, EVALUASI, DETEKSI, FOOTER_NOTE } from "./content";
import HeroIllustration from "./illustrations/HeroIllustration";
import StageIllustration from "./illustrations/StageIllustration";
import BloomNode from "./illustrations/BloomNode";

const EVAL_ICONS = {
  flower: Flower2,
  search: Search,
  message: MessagesSquare,
} as const;

function HeadlineWithAnak({ template, low }: { template: string; low: string }) {
  const [before, after] = template.split("{anak}");
  return (
    <>
      {before}
      <em style={{ fontStyle: "normal", color: "#F06BA8" }}>{low}</em>
      {after}
    </>
  );
}

export default function TahunPertama() {
  const { sapaan } = useChildProfile();
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <article className="bg-kanvas text-pekat">
      {isDev && (
        <div className="mx-auto max-w-[1020px] px-6 pt-3">
          <span className="inline-block rounded-full bg-[#FFF3D6] px-3 py-1 text-[12px] font-semibold text-[#8A6410]">
            DRAF · menunggu review Psikolog Fitri Effendy sebelum rilis
          </span>
        </div>
      )}

      {/* ==================== HERO ==================== */}
      <header className="relative overflow-hidden px-6 pb-10 pt-16">
        <div className="mx-auto max-w-[1020px]">
          {/* Brand row */}
          <div className="mb-12 flex items-center gap-2.5">
            <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
              <g fill="#F06BA8">
                <path d="M20 21 C14 15 15 7 20 4 C25 7 26 15 20 21Z" />
                <path d="M20 21 C27 17 34 19 35 24 C31 28 23 27 20 21Z" opacity=".85" />
                <path d="M20 21 C25 28 22 35 17 36 C13 32 15 25 20 21Z" opacity=".7" />
                <path d="M20 21 C13 25 6 22 5 17 C9 13 17 15 20 21Z" opacity=".55" />
                <path d="M20 21 C15 16 16 10 19 8 C22 11 22 17 20 21Z" fill="#F8B9D4" />
              </g>
            </svg>
            <span className="font-bricolage text-[22px] font-bold text-rekah">rekah</span>
          </div>

          {/* Hero grid */}
          <div
            className="grid items-center gap-12"
            style={{ gridTemplateColumns: "1.15fr 0.85fr" }}
          >
            <div>
              <span
                className="mb-[18px] inline-block px-4 py-1.5 text-[13px] font-semibold tracking-[0.04em] text-rose-deep"
                style={{ background: "#F8B9D4", borderRadius: "70% 70% 70% 4px" }}
              >
                {HERO.eyebrow}
              </span>

              <h1
                className="mb-[18px] font-bricolage font-bold text-pekat"
                style={{ fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.15 }}
              >
                <HeadlineWithAnak template={HERO.headline} low={sapaan.low} />
              </h1>

              <p className="mb-0 text-[18px] leading-relaxed text-[#8A7080]" style={{ maxWidth: "44ch" }}>
                {HERO.lead}
              </p>

              <p className="mt-5 font-fraunces text-[20px] italic text-rose-deep">
                {HERO.tagline}
              </p>

              <p className="mt-4 text-[14px] text-[#8A7080]" style={{ maxWidth: "46ch" }}>
                {HERO.note}
              </p>
            </div>

            <div
              className="bg-white p-5"
              style={{
                borderRadius: "70% 70% 70% 4px",
                boxShadow: "0 12px 40px rgba(224,82,107,.12)",
              }}
            >
              <HeroIllustration variant={sapaan.variant} />
            </div>
          </div>
        </div>
      </header>

      {/* ==================== JOURNEY ==================== */}
      <div className={`mx-auto max-w-[1020px] px-6 ${styles.journey}`}>
        {STAGES.map((stage) => (
          <div key={stage.id} className={styles.chapter}>
            {/* Illustration side */}
            <div className={styles.illoSide}>
              <div className={styles.illoCard}>
                <StageIllustration
                  type={stage.illustration}
                  variant={sapaan.variant}
                />
                <p
                  className="mt-2 text-center font-caveat text-[19px] text-rose-deep"
                >
                  {stage.captionText}
                </p>
              </div>
            </div>

            {/* Bloom node */}
            <div className={styles.bloomNode}>
              <BloomNode filled={stage.petalFilled} />
              <span className="font-caveat text-[18px] font-semibold text-rose-deep">
                kelopak {stage.petalFilled}
              </span>
            </div>

            {/* Text side */}
            <div className={`${styles.textSide} flex flex-col gap-3`}>
              <span
                className="inline-block self-start px-3.5 py-1.5 text-[13px] font-semibold tracking-[0.03em] text-white"
                style={{ background: "#F06BA8", borderRadius: "70% 70% 70% 4px" }}
              >
                {stage.ageLabel}
              </span>

              <h2 className="font-bricolage text-[26px] font-bold leading-tight text-pekat">
                {stage.title}
              </h2>

              <p className="text-[15px] leading-[1.75] text-[#8A7080]">
                {renderRichText(stage.story, sapaan)}
              </p>

              <details className="overflow-hidden rounded-[18px_18px_18px_4px] border-[1.5px] border-rose-soft bg-white">
                <summary className="flex cursor-pointer select-none list-none items-center gap-2 px-[18px] py-3.5 text-[15px] font-semibold text-rose-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah [&::-webkit-details-marker]:hidden">
                  <span>🌸 Yang bisa Ayah Bunda amati</span>
                  <span className="ml-auto text-[20px] transition-transform duration-200 [[open]_&]:rotate-45">+</span>
                </summary>
                <div className="grid gap-3 px-[18px] pb-[18px]">
                  {stage.domains.map((d) => (
                    <div key={d.label} className="text-[14.5px]">
                      <b className="mb-0.5 block text-[13px] font-bold uppercase tracking-[0.04em] text-pekat">
                        {d.label}
                      </b>
                      <span className="text-[#8A7080]">{d.detail}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== QUOTE ==================== */}
      <p
        className="mx-auto max-w-[26ch] px-6 py-14 text-center font-fraunces italic text-rose-deep"
        style={{ fontSize: "clamp(22px, 3.4vw, 30px)" }}
      >
        &ldquo;{QUOTE}&rdquo;
      </p>

      {/* ==================== EVALUASI ==================== */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[1020px]">
          <div
            className={`${styles.panelCard} rounded-[32px_32px_32px_6px] bg-white p-12`}
            style={{ boxShadow: "0 14px 44px rgba(61,43,46,.07)" }}
          >
            <span
              className="mb-4 inline-block px-4 py-1.5 text-[13px] font-semibold tracking-[0.04em] text-rose-deep"
              style={{ background: "#F8B9D4", borderRadius: "70% 70% 70% 4px" }}
            >
              {EVALUASI.eyebrow} 🎂
            </span>
            <h2 className="mb-2 font-bricolage text-[30px] font-bold text-pekat">
              {EVALUASI.title}
            </h2>
            <p className="mb-7 max-w-[60ch] text-[15px] leading-relaxed text-[#8A7080]">
              {renderRichText(EVALUASI.sub, sapaan)}
            </p>

            <div className="grid gap-[18px] sm:grid-cols-3">
              {EVALUASI.cards.map((card) => {
                const Icon = EVAL_ICONS[card.icon as keyof typeof EVAL_ICONS];
                return (
                  <div
                    key={card.title}
                    className="rounded-[22px_22px_22px_4px] bg-kanvas p-[22px] text-[14.5px]"
                  >
                    <div
                      className="mb-3 flex h-10 w-10 items-center justify-center text-rekah"
                      style={{
                        background: "#F8B9D4",
                        borderRadius: "70% 70% 70% 4px",
                      }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <b className="mb-1.5 block font-bricolage text-[16px] font-bold text-pekat">
                      {card.title}
                    </b>
                    <p className="text-[#8A7080]">{card.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DETEKSI DINI ==================== */}
      <section className="px-6 pb-16 pt-0">
        <div className="mx-auto max-w-[1020px]">
          <div
            className={`${styles.softPanel} rounded-[32px_32px_32px_6px] p-12`}
            style={{ background: "#F8B9D4" }}
          >
            <span
              className="mb-4 inline-block rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold tracking-[0.04em] text-rose-deep"
            >
              {DETEKSI.eyebrow}
            </span>
            <h2 className="mb-2 font-bricolage text-[30px] font-bold text-rose-deep">
              {DETEKSI.title}
            </h2>
            <p className="mb-5 max-w-[60ch] text-[15px] leading-relaxed text-[#8A7080]">
              {renderRichText(DETEKSI.sub, sapaan)}
            </p>

            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              {DETEKSI.flags.map((flag) => (
                <div
                  key={flag}
                  className="rounded-[16px_16px_16px_4px] bg-white/75 px-[18px] py-3.5 text-[14.5px] text-pekat"
                >
                  🌱 {flag}
                </div>
              ))}
            </div>

            <div
              className="rounded-[20px_20px_20px_4px] bg-white p-5 text-[15px] text-[#8A7080]"
              style={{ borderLeft: "4px solid #F06BA8" }}
            >
              <b className="mb-1 block font-caveat text-[20px] text-rose-deep">
                Catatan dari Rekah:
              </b>
              {DETEKSI.reassure}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="mt-6 border-t border-rose-soft px-6 pb-14 pt-10">
        <div className="mx-auto grid max-w-[1020px] gap-2.5">
          <span className="inline-block rounded-full bg-[#FFF3D6] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#8A6410]">
            DRAF · menunggu review Psikolog Fitri Effendy sebelum rilis
          </span>
          <p className="text-[13px] text-[#8A7080]">{FOOTER_NOTE}</p>
          <p className="text-[13px] text-[#8A7080]">Rekah. Mekar pada waktunya.</p>
        </div>
      </footer>
    </article>
  );
}
