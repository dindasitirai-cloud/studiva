/**
 * Generator Paket Review Konten Rekah
 * Jalankan: pnpm review-pack
 *
 * Mengimpor data & copy langsung dari source TypeScript — tidak parsing teks.
 * Output: review-pack/paket-review-psikolog-fitri.md
 *         review-pack/paket-review-apoteker-raisha.md
 */

import * as fs from 'fs';
import * as path from 'path';

// ── Data ──────────────────────────────────────────────────────────────────────
import { NILAI_REKAH } from '../packages/shared/src/rekah/values';
import { AGE_BANDS } from '../packages/shared/src/rekah/ageBands';
import { ACTIVITY_MODULES } from '../packages/shared/src/rekah/activityModules';
import { WEEKLY_PLAN_TEMPLATES } from '../packages/shared/src/rekah/weeklyPlanTemplates';

// ── Copy ──────────────────────────────────────────────────────────────────────
import { REKAH_COPY } from '../apps/digital/src/features/rekah/rekahLandingCopy';
import { COPY as ONBOARDING_COPY, NILAI_COPY } from '../apps/digital/src/features/rekah-onboarding/rekahOnboardingCopy';
import { PLAN_COPY } from '../apps/digital/src/features/rekah-plan/rekahPlanCopy';
import { REFLEKSI_COPY } from '../apps/digital/src/features/rekah-plan/rekahRefleksiCopy';
import { JEJAK_COPY } from '../apps/digital/src/features/rekah-jejak/rekahJejakCopy';
import { MUSIM_COPY } from '../apps/digital/src/features/rekah-musim/rekahMusimCopy';
import { PRIVACY_COPY } from '../apps/digital/src/features/rekah-privacy/rekahPrivacyCopy';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TANGGAL = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

/** Render arbitrary value to markdown string. Functions are called with bracketed placeholders. */
function rv(val: unknown, _depth = 0): string {
  if (val === null || val === undefined) return '_(kosong)_';
  if (typeof val === 'string') return val.replace(/\n/g, ' ');
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'function') {
    const src = String(val);
    const paramMatch = src.match(/\(([^)]*)\)/);
    const params = (paramMatch?.[1] ?? '').split(',').map(p => p.trim()).filter(Boolean);
    const ph = params.map(p => `[${p.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'arg'}]`);
    try {
      return `_(fn)_ → ${String((val as Function)(...ph)).replace(/\n/g, ' ')}`;
    } catch {
      return `_(fn: ${params.join(', ')})_`;
    }
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return '_(array kosong)_';
    if (val.every(v => typeof v === 'string' || typeof v === 'number')) return val.join(' · ');
    return val.map(v => {
      if (typeof v === 'string') return `  - ${v}`;
      if (typeof v === 'object' && v !== null) {
        return Object.entries(v as Record<string, unknown>)
          .map(([k, vv]) => `  - **${k}**: ${rv(vv)}`)
          .join('\n');
      }
      return `  - ${String(v)}`;
    }).join('\n');
  }
  if (typeof val === 'object') {
    return '\n' + Object.entries(val as Record<string, unknown>)
      .map(([k, v]) => `  **${k}**: ${rv(v)}`)
      .join('\n');
  }
  return String(val);
}

/** Render a flat copy object (one level) as a markdown list. */
function renderCopyObj(obj: Record<string, unknown>, label: string): string {
  const lines = [`### ${label}\n`];
  for (const [key, val] of Object.entries(obj)) {
    const rendered = rv(val);
    if (rendered.startsWith('\n') || rendered.includes('\n')) {
      lines.push(`**\`${key}\`**:\n${rendered}\n`);
    } else {
      lines.push(`**\`${key}\`**: ${rendered}\n`);
    }
  }
  return lines.join('\n');
}

/** Render a deeply nested copy object (recursive) as a markdown section tree. */
function renderCopyNested(obj: Record<string, unknown>, heading: string, level = 3): string {
  const h = '#'.repeat(level);
  const lines = [`${h} ${heading}\n`];
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'object' && val !== null && !Array.isArray(val) && typeof val !== 'function') {
      lines.push(renderCopyNested(val as Record<string, unknown>, `${heading} › ${key}`, level + 1));
    } else {
      const rendered = rv(val);
      if (rendered.includes('\n')) {
        lines.push(`**\`${key}\`**:\n${rendered}\n`);
      } else {
        lines.push(`**\`${key}\`**: ${rendered}\n`);
      }
    }
  }
  return lines.join('\n');
}

// ── Psikolog Fitri Pack ───────────────────────────────────────────────────────

function generateFitriPack(): string {
  const sections: string[] = [];

  sections.push(`# Paket Review — Psikolog Fitri Effendy

**Dihasilkan:** ${TANGGAL}
**Status semua modul:** draft (belum rilis)
**Kata terlarang yang harus TIDAK MUNCUL:** normal · seharusnya · tertinggal · terlambat · rata-rata · streak · skor · peringkat · target · milestone (sebagai rapor)

> Dokumen ini dihasilkan otomatis dari source code — setiap perubahan di copy files akan tercermin saat skrip dijalankan ulang.

---

## Petunjuk Review

Untuk setiap teks di bawah, periksa:
1. **Tidak ada bahasa perbandingan** — tidak ada kata terlarang di atas
2. **Nada aman secara psikologis** — tidak menghakimi, tidak menimbulkan rasa bersalah
3. **Sesuai konteks budaya Indonesia** — bahasa dekat, tidak formal berlebihan
4. **Akurasi konten perkembangan** — kenapaIni, avoid, amati mencerminkan literatur yang tepat
5. **Nada sinyal lelah (⚠️ di bawah)** — area paling sensitif, review terlebih dahulu

Tandai setiap item: ✅ OK · ✏️ Perlu revisi (tulis catatan) · ❌ Ganti

---
`);

  // ── ⚠️ PRIORITAS TERTINGGI ─────────────────────────────────────────────────
  sections.push(`## ⚠️ PRIORITAS TERTINGGI — Sinyal Caregiver Lelah (Jejak Mekar)

> Area caregiver well-being — paling sensitif. Review ini sebelum bagian lain.
>
> **Konteks:** Kartu ini muncul di halaman Jejak Mekar jika \`moodCaregiver === 'lelah'\` mendominasi (>50% dari ≥5 entri refleksi).
>
> **DILARANG:** insight yang membandingkan keluarga lain, norma usia, atau "minggu terbaik/terburuk".

| Field | Teks |
|-------|------|
| \`sinyalLelahJudul\` | ${JEJAK_COPY.sinyalLelahJudul} |
| \`sinyalLelahBody\` | ${JEJAK_COPY.sinyalLelahBody} |
| \`sinyalLelahCTA\` | ${JEJAK_COPY.sinyalLelahCTA} |
| \`sinyalLelahToggleNote\` | ${JEJAK_COPY.sinyalLelahToggleNote} |

**Catatan Review Fitri:** ___________________________________________

---
`);

  // ── Bagian A: Copy & Bahasa ────────────────────────────────────────────────
  sections.push(`## Bagian A: Copy & Bahasa

`);

  // A1: Landing Page
  sections.push(`### A1. Landing Page (\`rekahLandingCopy.ts\`)

#### A1.1 Hero
| Field | Teks |
|-------|------|
| \`hero.h1\` | ${REKAH_COPY.hero.h1.replace(/\n/g, ' / ')} |
| \`hero.body\` | ${REKAH_COPY.hero.body} |
| \`hero.cta\` | ${REKAH_COPY.hero.cta} |
| \`hero.trust\` | ${REKAH_COPY.hero.trust} |

#### A1.2 Masalah
| # | Teks |
|---|------|
${REKAH_COPY.masalah.kartu.map((k, i) => `| ${i + 1} | ${k.teks} |`).join('\n')}

#### A1.3 Cara (Langkah)
${REKAH_COPY.cara.langkah.map(l => `- **${l.judul}:** ${l.isi}`).join('\n')}
- **Penutup:** ${REKAH_COPY.cara.penutup}

#### A1.4 Kepercayaan
- **Isi:** ${REKAH_COPY.kepercayaan.isi}
- **Nama kurator:** ${REKAH_COPY.kepercayaan.namaKurator}
- **Peran kurator:** ${REKAH_COPY.kepercayaan.peranKurator}

#### A1.5 FAQ
${REKAH_COPY.faq.map((f, i) => `**Q${i + 1}:** ${f.q}\n**A${i + 1}:** ${f.a}\n`).join('\n')}

`);

  // A2: Onboarding
  sections.push(`### A2. Onboarding (\`rekahOnboardingCopy.ts\`)

#### A2.1 Step 1 — Sambutan
| Field | Teks |
|-------|------|
| heading | ${ONBOARDING_COPY.step1.heading} |
| body | ${ONBOARDING_COPY.step1.body} |
| cta | ${ONBOARDING_COPY.step1.cta} |

#### A2.2 Step 2 — Profil Anak
| Field | Teks |
|-------|------|
| heading | ${ONBOARDING_COPY.step2.heading} |
| labelNama | ${ONBOARDING_COPY.step2.labelNama} |
| placeholderNama | ${ONBOARDING_COPY.step2.placeholderNama} |
| labelTanggal | ${ONBOARDING_COPY.step2.labelTanggal} |
| konfirmasiUsia | ${rv(ONBOARDING_COPY.step2.konfirmasiUsia)} |
| usiaLunak | ${rv(ONBOARDING_COPY.step2.usiaLunak)} |
| tanggalMasaDepan | ${ONBOARDING_COPY.step2.tanggalMasaDepan} |

#### A2.3 Step 3 — Tentang Si Kecil
| Field | Nilai |
|-------|-------|
| heading | ${ONBOARDING_COPY.step3.heading} |
| subheading | ${ONBOARDING_COPY.step3.subheading} |
| labelTemperamen | ${ONBOARDING_COPY.step3.labelTemperamen} |

**Temperamen options:**
${Object.entries(ONBOARDING_COPY.step3.temperamen).map(([k, v]) => `- **${k}** ${v.emoji}: ${v.label} — ${v.deskripsi}`).join('\n')}

| Field | Teks |
|-------|------|
| labelTantangan | ${ONBOARDING_COPY.step3.labelTantangan} |
| placeholderTantangan | ${ONBOARDING_COPY.step3.placeholderTantangan} |

#### A2.4 Step 4 — Tentang Caregiver
| Field | Teks |
|-------|------|
| heading | ${ONBOARDING_COPY.step4.heading} |
| labelNama | ${ONBOARDING_COPY.step4.labelNama} |
| placeholderNama | ${ONBOARDING_COPY.step4.placeholderNama} |
| labelEnergi | ${ONBOARDING_COPY.step4.labelEnergi} |
| energiNote | ${ONBOARDING_COPY.step4.energiNote} |

**Energi options:**
${Object.entries(ONBOARDING_COPY.step4.energi).map(([k, v]) => `- **${k}** ${v.emoji}: ${v.label} — ${v.deskripsi}`).join('\n')}

#### A2.5 Step 5 — Akar Keluarga
| Field | Teks |
|-------|------|
| heading | ${ONBOARDING_COPY.step5.heading} |
| subheading | ${ONBOARDING_COPY.step5.subheading} |
| warningDua | ${ONBOARDING_COPY.step5.warningDua} |
| cta | ${ONBOARDING_COPY.step5.cta} |

#### A2.6 Perayaan & Beranda
| Field | Teks |
|-------|------|
| celebration.heading | ${ONBOARDING_COPY.celebration.heading} |
| celebration.subheading | ${rv(ONBOARDING_COPY.celebration.subheading)} |
| celebration.cta | ${ONBOARDING_COPY.celebration.cta} |
| beranda.musimHeader | ${rv(ONBOARDING_COPY.beranda.musimHeader)} |
| beranda.langkahKecilJudul | ${ONBOARDING_COPY.beranda.langkahKecilJudul} |
| beranda.langkahKecilIsi | ${ONBOARDING_COPY.beranda.langkahKecilIsi} |

`);

  // A3: NILAI_COPY
  sections.push(`### A3. Deskripsi Singkat Nilai (\`NILAI_COPY\`)

| ID | Emoji | Deskripsi Singkat |
|----|-------|------------------|
${Object.entries(NILAI_COPY).map(([id, v]) => `| ${id} | ${v.emoji} | ${v.deskripsiSingkat} |`).join('\n')}

`);

  // A4: PLAN_COPY
  sections.push(`### A4. Rencana Pekan (\`rekahPlanCopy.ts\`)

| Field | Teks |
|-------|------|
| judulHalaman | ${PLAN_COPY.judulHalaman} |
| pekanLabel | ${rv(PLAN_COPY.pekanLabel)} |
| langkahCount | ${rv(PLAN_COPY.langkahCount)} |
| kenapaIniLabel | ${PLAN_COPY.kenapaIniLabel} |
| sumberLabel | ${PLAN_COPY.sumberLabel} |
| langkahSectionLabel | ${PLAN_COPY.langkahSectionLabel} |
| scriptLabel | ${PLAN_COPY.scriptLabel} |
| avoidLabel | ${PLAN_COPY.avoidLabel} |
| amatiLabel | ${PLAN_COPY.amatiLabel} |
| selesaiCTA | ${PLAN_COPY.selesaiCTA} |
| selesaiCelebration | ${PLAN_COPY.selesaiCelebration} |
| belumPasLabel | ${PLAN_COPY.belumPasLabel} |
| poolTipisNote | ${PLAN_COPY.poolTipisNote} |
| semuaSelesaiJudul | ${PLAN_COPY.semuaSelesaiJudul} |
| semuaSelesaiSub | ${PLAN_COPY.semuaSelesaiSub} |
| shareText | ${rv(PLAN_COPY.shareText)} |

`);

  // A5: REFLEKSI_COPY
  sections.push(`### A5. Refleksi & Cerita Hari Ini (\`rekahRefleksiCopy.ts\`)

| Field | Teks |
|-------|------|
| judulCerita | ${REFLEKSI_COPY.judulCerita} |
| sub | ${rv(REFLEKSI_COPY.sub)} |
| responsLabel | ${rv(REFLEKSI_COPY.responsLabel)} |

**responsOptions:**
${REFLEKSI_COPY.responsOptions.map(o => `- **${o.value}** ${o.emoji}: ${o.label}`).join('\n')}

| Field | Teks |
|-------|------|
| **responsPengantar** | ${REFLEKSI_COPY.responsPengantar} |
| **belumTertarikNote** | ${REFLEKSI_COPY.belumTertarikNote} |
| moodLabel | ${REFLEKSI_COPY.moodLabel} |
| moodSub | ${REFLEKSI_COPY.moodSub} |

**moodOptions:**
${REFLEKSI_COPY.moodOptions.map(o => `- **${o.value}** ${o.emoji}: ${o.label}`).join('\n')}

| Field | Teks |
|-------|------|
| catatanLabel | ${REFLEKSI_COPY.catatanLabel} |
| catatanPlaceholder | ${REFLEKSI_COPY.catatanPlaceholder} |
| simpanKeJurnalLabel | ${REFLEKSI_COPY.simpanKeJurnalLabel} |
| simpanCTA | ${REFLEKSI_COPY.simpanCTA} |

`);

  // A6: JEJAK_COPY (non-sinyal)
  sections.push(`### A6. Jejak Mekar — Copy Umum (\`rekahJejakCopy.ts\`)

_(Sinyal caregiver lelah sudah dibahas di ⚠️ PRIORITAS TERTINGGI di atas.)_

| Field | Teks |
|-------|------|
| judulHalaman | ${JEJAK_COPY.judulHalaman} |
| sub | ${JEJAK_COPY.sub} |
| bungaCaption | ${JEJAK_COPY.bungaCaption} |
| bungaLabel | ${rv(JEJAK_COPY.bungaLabel)} |
| momenJudul | ${JEJAK_COPY.momenJudul} |
| momenEmpty | ${JEJAK_COPY.momenEmpty} |
| statusMusim | ${rv(JEJAK_COPY.statusMusim)} |
| polaBelumCukup | ${JEJAK_COPY.polaBelumCukup} |
| polaResponDominan | ${rv(JEJAK_COPY.polaResponDominan)} |
| musimSebelumnyaLabel | ${JEJAK_COPY.musimSebelumnyaLabel} |
| musimSebelumnyaEmpty | ${JEJAK_COPY.musimSebelumnyaEmpty} |

`);

  // A7: MUSIM_COPY
  sections.push(`### A7. Penutup Musim (\`rekahMusimCopy.ts\`)

| Field | Teks |
|-------|------|
| triggerJudul | ${MUSIM_COPY.triggerJudul} |
| triggerSub | ${MUSIM_COPY.triggerSub} |
| triggerCTA | ${MUSIM_COPY.triggerCTA} |
| rangkumanJudul | ${rv(MUSIM_COPY.rangkumanJudul)} |
| rangkumanLangkahLabel | ${rv(MUSIM_COPY.rangkumanLangkahLabel)} |
| rangkumanMomenLabel | ${MUSIM_COPY.rangkumanMomenLabel} |
| rangkumanMomenEmpty | ${MUSIM_COPY.rangkumanMomenEmpty} |
| rangkumanCTA | ${MUSIM_COPY.rangkumanCTA} |
| refleksiJudul | ${MUSIM_COPY.refleksiJudul} |
| refleksiSub | ${MUSIM_COPY.refleksiSub} |
| refleksiPlaceholder | ${MUSIM_COPY.refleksiPlaceholder} |
| abadikanJurnalLabel | ${MUSIM_COPY.abadikanJurnalLabel} |
| refleksiCTA | ${MUSIM_COPY.refleksiCTA} |
| refleksiLewati | ${MUSIM_COPY.refleksiLewati} |
| pilihanJudul | ${MUSIM_COPY.pilihanJudul} |
| lanjutkanSama | ${MUSIM_COPY.lanjutkanSama} |
| lanjutkanSamaSub | ${MUSIM_COPY.lanjutkanSamaSub} |
| tanamanBaru | ${MUSIM_COPY.tanamanBaru} |
| tanamanBaruSub | ${MUSIM_COPY.tanamanBaruSub} |
| konfirmasiGantiNilai | ${MUSIM_COPY.konfirmasiGantiNilai} |
| musimBaruMulai | ${MUSIM_COPY.musimBaruMulai} |

`);

  // A8: PRIVACY_COPY
  sections.push(`### A8. Data & Privasi (\`rekahPrivacyCopy.ts\`)

| Field | Teks |
|-------|------|
| judulSeksi | ${PRIVACY_COPY.judulSeksi} |
| apaYangDisimpan | ${PRIVACY_COPY.apaYangDisimpan.replace(/\n/g, ' ')} |
| untukApa | ${PRIVACY_COPY.untukApa.replace(/\n/g, ' ')} |
| hak | ${PRIVACY_COPY.hak} |
| tombolHapus | ${PRIVACY_COPY.tombolHapus} |
| konfirmasiJudul | ${PRIVACY_COPY.konfirmasiJudul} |
| konfirmasiBody | ${rv(PRIVACY_COPY.konfirmasiBody)} |
| konfirmasiPlaceholder | ${rv(PRIVACY_COPY.konfirmasiPlaceholder)} |
| konfirmasiTombol | ${PRIVACY_COPY.konfirmasiTombol} |
| batalTombol | ${PRIVACY_COPY.batalTombol} |
| pesanBerhasil | ${PRIVACY_COPY.pesanBerhasil} |
| pesanGagal | ${PRIVACY_COPY.pesanGagal} |

---
`);

  // ── Bagian B: Nilai Fokus ──────────────────────────────────────────────────
  sections.push(`## Bagian B: Nilai Fokus (${NILAI_REKAH.length} nilai)

`);

  for (const nilai of NILAI_REKAH) {
    const copy = NILAI_COPY[nilai.id as keyof typeof NILAI_COPY];
    sections.push(`### B — ${copy?.emoji ?? ''} ${nilai.label} (\`${nilai.id}\`)

| Field | Teks |
|-------|------|
| Deskripsi panjang (values.ts) | ${nilai.deskripsi} |
| Deskripsi singkat (NILAI_COPY) | ${copy?.deskripsiSingkat ?? '—'} |
| Warna | \`${nilai.warna}\` |

**Catatan Review:** ___________________________________________

`);
  }

  sections.push('---\n');

  // ── Bagian C: Modul Aktivitas ──────────────────────────────────────────────
  sections.push(`## Bagian C: Modul Aktivitas (${ACTIVITY_MODULES.length} modul)

> 📌 = tidak ada \`sumberIds\` — perlu konfirmasi sumber atau penambahan referensi sebelum rilis.

`);

  const nilaiOrder = ['mandiri', 'empatik', 'percaya-diri', 'regulasi-emosi', 'komunikatif', 'sosial'] as const;

  for (const nilaiId of nilaiOrder) {
    const modul = ACTIVITY_MODULES.filter(m => m.nilaiUtama === nilaiId);
    const nilai = NILAI_REKAH.find(n => n.id === nilaiId)!;
    const copy = NILAI_COPY[nilaiId];

    sections.push(`### C — ${copy?.emoji ?? ''} ${nilai.label} (${modul.length} modul)

`);

    for (const m of modul) {
      const noSumber = !m.sumberIds || m.sumberIds.length === 0;
      const ageBandLabels = m.ageBands.map(id => AGE_BANDS.find(b => b.id === id)?.label ?? id).join(', ');
      const pendukung = m.nilaiPendukung?.join(', ') ?? '—';
      const sumberTeks = noSumber ? '📌 _(belum ada)_' : m.sumberIds!.join(', ');

      sections.push(`#### ${noSumber ? '📌 ' : ''}[\`${m.id}\`] ${m.judul}

| Meta | Nilai |
|------|-------|
| Status | \`${m.status}\` |
| Usia | ${ageBandLabels} |
| Durasi | ${m.durasiMenit} menit |
| Nilai utama | ${m.nilaiUtama} |
| Nilai pendukung | ${pendukung} |
| Sumber | ${sumberTeks} |

**Deskripsi:** ${m.deskripsi}

${m.kenapaIni ? `**Kenapa ini?** ${m.kenapaIni}\n` : ''}
${m.bahan ? `**Bahan:** ${m.bahan.join(', ')}\n` : ''}

**Langkah-langkah:**
${m.langkah.map((l, i) => `${i + 1}. ${l}`).join('\n')}

${m.script ? `**Script:** "${m.script}"\n` : ''}
${m.avoid ? `**Hindari:** ${m.avoid}\n` : ''}
${m.amati ? `**Amati:** ${m.amati}\n` : ''}
${m.tipAyahBunda ? `**Tip Ayah/Bunda:** ${m.tipAyahBunda}\n` : ''}

**Catatan Review Fitri:** ___________________________________________

`);
    }
  }

  sections.push('---\n');

  // ── Bagian D: Template Pekan ───────────────────────────────────────────────
  sections.push(`## Bagian D: Template Pekan (${WEEKLY_PLAN_TEMPLATES.length} template)

`);

  for (const t of WEEKLY_PLAN_TEMPLATES) {
    const ageBand = AGE_BANDS.find(b => b.id === t.ageBand);
    const nilaiLabel = NILAI_REKAH.find(n => n.id === t.nilaiTema)?.label ?? t.nilaiTema;
    const copy = NILAI_COPY[t.nilaiTema as keyof typeof NILAI_COPY];

    sections.push(`### [\`${t.id}\`] ${t.judul}

**Tema:** ${copy?.emoji ?? ''} ${nilaiLabel} × ${ageBand?.label ?? t.ageBand}

**Deskripsi:** ${t.deskripsi}

| Hari | Modul | Waktu | Catatan |
|------|-------|-------|---------|
${t.hari.map(h => {
  const mod = ACTIVITY_MODULES.find(m => m.id === h.activityModuleId);
  return `| ${h.hari} | ${mod?.judul ?? h.activityModuleId} | ${h.waktuDisarankan ?? '—'} | ${h.catatan ?? '—'} |`;
}).join('\n')}

**Catatan Review Fitri:** ___________________________________________

`);
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  sections.push(`---

## Checklist Sebelum Rilis

- [ ] Semua teks di Bagian A ditandai ✅
- [ ] Sinyal caregiver lelah (⚠️) sudah disetujui — teks dan logika
- [ ] Semua modul di Bagian C ditandai ✅ (atau catatan revisi diserahkan ke Raisha)
- [ ] Modul 📌 tanpa sumber sudah diisi atau didiskusikan
- [ ] Tidak ada kata terlarang: normal · seharusnya · tertinggal · terlambat · rata-rata · streak · skor · peringkat
- [ ] \`SHOW_DRAFT_CONTENT\` di \`planComposer.ts\` di-set ke \`false\`

_Paket ini dihasilkan dari ${ACTIVITY_MODULES.length} modul · ${WEEKLY_PLAN_TEMPLATES.length} template · ${NILAI_REKAH.length} nilai_
`);

  return sections.join('\n');
}

// ── Apoteker Raisha Pack ──────────────────────────────────────────────────────

const HEALTH_KEYWORDS = [
  'obat', 'vitamin', 'suplemen', 'dosis', 'alergi',
  'demam', 'MPASI', 'ASI', 'imunisasi', 'dokter',
];

function scanModuleForKeywords(m: typeof ACTIVITY_MODULES[number]): string[] {
  const textFields = [
    m.judul, m.deskripsi, m.kenapaIni ?? '',
    m.script ?? '', m.avoid ?? '', m.amati ?? '',
    m.tipAyahBunda ?? '', ...(m.langkah ?? []), ...(m.bahan ?? []),
  ].join(' ');

  // Word-boundary match to avoid false positives (e.g. "ASI" inside "eksplorasi")
  return HEALTH_KEYWORDS.filter(kw => new RegExp(`\\b${kw}\\b`, 'i').test(textFields));
}

function generateRaishaPack(): string {
  const sections: string[] = [];

  sections.push(`# Paket Review — Apoteker Raisha
**Dihasilkan:** ${TANGGAL}
**Tujuan:** Memastikan tidak ada konten kesehatan/medis yang keliru atau menyesatkan di modul Rekah sebelum rilis.

---

## Konteks

Dari komentar di \`activityModules.ts\`:

> "Modul dengan topik kesehatan/medis (SIDS, MPASI, imunisasi, dll.) **DILEWATI** — jalur review Apoteker/Dokter sebelum dimasukkan ke Rekah."

Dokumen ini memenuhi dua tujuan:
1. **Scan pasif** — memastikan ${ACTIVITY_MODULES.length} modul yang sudah ada tidak mengandung klaim medis yang tidak tepat
2. **Roadmap** — mendokumentasi topik kesehatan yang dilewati dan langkah agar bisa masuk ke Rekah

---

## 1. Scan Kata Kunci Kesehatan

Kata kunci yang dipindai: \`${HEALTH_KEYWORDS.join('` · `')}\`

`);

  const hits: Array<{ m: typeof ACTIVITY_MODULES[number]; kw: string[] }> = [];
  const clean: typeof ACTIVITY_MODULES = [];

  for (const m of ACTIVITY_MODULES) {
    const kw = scanModuleForKeywords(m);
    if (kw.length > 0) {
      hits.push({ m, kw });
    } else {
      clean.push(m);
    }
  }

  if (hits.length === 0) {
    sections.push(`### Hasil: 0 modul mengandung kata kunci kesehatan ✅

Semua ${ACTIVITY_MODULES.length} modul bersih dari kata kunci kesehatan yang dipindai.

`);
  } else {
    sections.push(`### Hasil: ${hits.length} modul mengandung kata kunci

`);
    for (const { m, kw } of hits) {
      const textFields = [
        m.judul, m.deskripsi, m.kenapaIni ?? '',
        m.script ?? '', m.avoid ?? '', m.amati ?? '',
        m.tipAyahBunda ?? '', ...(m.langkah ?? []), ...(m.bahan ?? []),
      ].join('\n');

      sections.push(`#### [\`${m.id}\`] ${m.judul}

**Kata kunci ditemukan:** \`${kw.join('`, `')}\`

**Status:** \`${m.status}\` | **Usia:** ${m.ageBands.join(', ')} | **Nilai:** ${m.nilaiUtama}

**Konteks kemunculan:**
\`\`\`
${textFields.split('\n').filter(l => kw.some(k => l.toLowerCase().includes(k.toLowerCase()))).slice(0, 5).join('\n')}
\`\`\`

**Rekomendasi Raisha:** ___________________________________________

`);
    }
  }

  // ── Topik yang dilewati ──────────────────────────────────────────────────
  sections.push(`---

## 2. Topik Kesehatan yang DILEWATI (Daftar Eksklusi)

Topik-topik ini secara eksplisit diidentifikasi sebagai memerlukan review Apoteker/Dokter.
Belum ada satu pun yang masuk ke modul Rekah saat ini.

| Topik | Risiko Utama | Status |
|-------|-------------|--------|
| Tidur aman (SIDS) | Saran posisi tidur yang salah dapat membahayakan bayi | ⏳ Menunggu review |
| ASI & menyusui | Misinformasi suplementasi, durasi, atau pemberhentian | ⏳ Menunggu review |
| MPASI (6+ bulan) | Tekstur, alergen, jadwal yang salah | ⏳ Menunggu review |
| Gigi & kebersihan mulut | Timing, teknik, pasta gigi fluor | ⏳ Menunggu review |
| Pertumbuhan & berat badan | Interpretasi grafik, underfeeding/overfeeding | ⏳ Menunggu review |
| Imunisasi | Jadwal, efek samping, mitos | ⏳ Menunggu review |
| Deteksi dini (Skrining perkembangan) | Penggunaan alat KPSP/M-CHAT yang tidak tepat | ⏳ Menunggu review |

---

## 3. Panduan Memasukkan Topik Kesehatan ke Rekah

Untuk setiap topik di atas, sebelum masuk ke Rekah:

1. **Draft konten** dibuat oleh tim Rekah berdasarkan panduan Kemenkes/AAP/WHO
2. **Review Apoteker Raisha** — periksa akurasi, kontraindikasi, bahasa aman
3. **Review Psikolog Fitri** — periksa framing psikologis dan bahasa tanpa tekanan
4. **Tandai** \`status: 'review'\` → setelah kedua review selesai → \`status: 'published'\`
5. Tambahkan \`sumberIds\` yang relevan (contoh: \`kemenkes-kia-kpsp\`, \`who-growth\`, \`aap-healthychildren\`)

---

## 4. Sumber Referensi yang Sudah Terdaftar di Modul

Sumber yang sudah muncul di \`sumberIds\` modul-modul aktif:

| ID Sumber | Muncul di (jumlah modul) |
|-----------|--------------------------|
${(() => {
  const sourceCount: Record<string, number> = {};
  for (const m of ACTIVITY_MODULES) {
    for (const s of m.sumberIds ?? []) {
      sourceCount[s] = (sourceCount[s] ?? 0) + 1;
    }
  }
  return Object.entries(sourceCount)
    .sort((a, b) => b[1] - a[1])
    .map(([s, n]) => `| \`${s}\` | ${n} modul |`)
    .join('\n');
})()}

_Modul tanpa sumber: ${ACTIVITY_MODULES.filter(m => !m.sumberIds || m.sumberIds.length === 0).length} dari ${ACTIVITY_MODULES.length}_

---

## 5. Checklist Sebelum Rilis

- [ ] Scan kata kunci di atas sudah diperiksa — semua konteks aman
- [ ] Tidak ada saran dosis, waktu pemberian obat, atau prosedur medis di modul
- [ ] Modul dengan \`avoid\` yang menyebut praktik medis sudah dikonfirmasi akurat
- [ ] Roadmap topik kesehatan (bagian 2) sudah dikomunikasikan ke Raisha dan Fitri
- [ ] Disclaimer yang tepat sudah ada di halaman yang relevan (FAQ landing: "Rekah bukan pengganti dokter atau psikolog")

_Paket ini dihasilkan dari ${ACTIVITY_MODULES.length} modul · scan: ${HEALTH_KEYWORDS.length} kata kunci · ${hits.length} hit_
`);

  return sections.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────

const OUT_DIR = path.resolve(__dirname, '../review-pack');

fs.mkdirSync(OUT_DIR, { recursive: true });

const fitriPath = path.join(OUT_DIR, 'paket-review-psikolog-fitri.md');
const raishaPath = path.join(OUT_DIR, 'paket-review-apoteker-raisha.md');

const fitriContent = generateFitriPack();
const raishaContent = generateRaishaPack();

fs.writeFileSync(fitriPath, fitriContent, 'utf8');
fs.writeFileSync(raishaPath, raishaContent, 'utf8');

// ── Verifikasi ────────────────────────────────────────────────────────────────
const fitriLines = fitriContent.split('\n').length;
const raishaLines = raishaContent.split('\n').length;
const moduleCount = ACTIVITY_MODULES.length;
const templateCount = WEEKLY_PLAN_TEMPLATES.length;
const nilaiCount = NILAI_REKAH.length;

// Verifikasi jumlah modul dalam output Fitri
const modulMatches = (fitriContent.match(/^####.*\[`am-/gm) ?? []).length;
const templateMatches = (fitriContent.match(/^###.*\[`wpt-/gm) ?? []).length;

console.log('\n✅ Review pack berhasil dibuat!\n');
console.log(`📄 ${fitriPath}`);
console.log(`   ${fitriLines} baris`);
console.log(`📄 ${raishaPath}`);
console.log(`   ${raishaLines} baris`);
console.log(`\n🔍 Verifikasi:`);
console.log(`   Modul dalam output  : ${modulMatches} / ${moduleCount} ${modulMatches === moduleCount ? '✅' : '❌'}`);
console.log(`   Template dalam output: ${templateMatches} / ${templateCount} ${templateMatches === templateCount ? '✅' : '❌'}`);
console.log(`   Nilai               : ${nilaiCount} nilai`);
console.log(`   Modul tanpa sumber  : ${ACTIVITY_MODULES.filter(m => !m.sumberIds || m.sumberIds.length === 0).length} (tandai 📌)`);
