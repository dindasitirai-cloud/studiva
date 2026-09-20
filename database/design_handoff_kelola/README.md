# Handoff: Halaman Kelola (Rekah)

## Overview
`Kelola` is the family control-center page of the Rekah parenting app. It is where a
parent shapes the day rather than merely logs it: a **hero** that states where they
are, a **tab row** for the five planning modes, a **three-column board** (Pagi /
Siang / Malam) of activity cards with good-habit checklists, and a **right rail**
of supporting context (situational habits, Pita Kebiasaan, Konteks Keluarga, Untuk
Dikelola).

The Rekah metaphor holds throughout: values are flowers. Any habit that plants a
value carries that value's flower plus a colored chip naming it.

## About the Design Files
The files in this bundle are **design references authored in HTML** — a working
prototype of the intended look and behavior. They are **not** production code to
copy. Recreate this design in the target codebase using its own component patterns,
state layer, and styling approach.

The prototype uses a small in-house template runtime (`support.js`, the `<x-dc>` /
`<dc-import>` / `<sc-for>` / `<sc-if>` tags, `{{ }}` holes). **Do not port the
runtime** — read it only to understand structure. All styling in the prototype is
inline; map it onto the codebase's styling system (CSS modules, Tailwind, tokens).

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, shadows, ornament placement
and interactions are final. The two things to adapt are the **value flowers**
(`BungaNilai`) and the **botanical ornaments** (`Botanical`): both are generated
SVG in the prototype — reimplement as components or export as static SVG assets.

## Page Frame

Prototype canvas: `1400px` wide, `min-height 1180px`, page background `#FCEBD7`.
Treat the width as fluid/max-width in production, not a fixed 1400px.

Layout: `display:flex` — sidebar (`250px`, fixed) + main (`flex:1`,
padding `30px 38px 44px`).

### Sidebar
- `background:#fff`, padding `24px 18px`, `box-shadow:22px 0 60px -50px rgba(90,50,70,.6)`.
- Brand row: 32px swaying flower + wordmark `rekah` in Fredoka 700 `25px`,
  color `#F06BA8`, `letter-spacing:-.5px`; collapse chevron `‹` in a 28px
  `#FCE3EE` circle, `#F06BA8`.
- Nav items: `padding:11px 13px`, `border-radius:16px`, `gap:13px`; an **8px color
  dot** (no line icons) + label in Nunito 700 `16px`.
  - Active (`Kelola`): `background:#FCE3EE`, dot & label `#F06BA8`, opacity 1.
  - Inactive: transparent, `#6E3B57` at opacity `.8`.
- Items in order: `Beranda` · `Kelola` · `Irama Hari` · `Bekal` · `Ruang Teduh` ·
  `Jurnal dan Galeri` · `Panen`.
- Footer: 1px divider `rgba(110,59,87,.1)`, then `Keluar` (dot at opacity `.35`,
  label at `.6`).

### Hero (title block)
One rounded block, `border-radius:32px`, `overflow:hidden`,
`box-shadow:0 26px 54px -40px rgba(90,50,70,.55)`, `margin-bottom:24px`,
`background:linear-gradient(120deg,#FBD9E9 0%,#F6DCF3 34%,#E6DDFB 62%,#DCEAFD 100%)`.

1. **Palette stripe** — a `7px` flex row of five blocks (flex ratios in brackets):
   `#F06BA8` [2] · `#F8B9D4` [1] · `#FFE29A` [1.4] · `#C9B8F0` [1] · `#8FB8F7` [1.6].
2. **Kebun ornament** — absolutely positioned `right:22px; bottom:0`, a flex row of
   six small flat botanical plants, `gap:6px`, group `opacity:.75`,
   `pointer-events:none`, each swaying (see Ornaments).
3. **Content** (`padding:26px 34px 0`):
   - Eyebrow pill: `background:rgba(255,255,255,.75)`, `border-radius:999px`,
     `padding:6px 14px`; 8px `#F06BA8` dot + `PUSAT KENDALI KELUARGA` in Nunito 800
     `11.5px`, `letter-spacing:1px`, uppercase, color `#B4477F`.
   - `h1` `Kelola` — Shantell Sans 700 `52px`, `#6E3B57`, `letter-spacing:-1px`,
     `line-height:.98`.
   - Subtitle `Wujudkan langkah kecil, untuk perubahan besar.` — Nunito 600 `17px`,
     `#7A4A64`.
   - **Tab row** — flex wrap, `gap:8px`, `margin-top:22px`, `padding-bottom:22px`,
     sitting directly on the gradient (no white tray).
     - Pill: `padding:11px 20px`, `border-radius:999px`.
     - Active: `background:#C6407F`, label `#fff` Nunito 800 `15px`,
       `box-shadow:0 14px 28px -18px rgba(198,64,127,.9)`.
     - Inactive: `background:#fff`, label `#8A5A74` Nunito 700 `15px`,
       `box-shadow:0 12px 26px -24px rgba(90,50,70,.7)`.
     - Tabs: `Hari Ini` (default active) · `Rencana Minggu` ·
       `Kehidupan Keluarga` · `Inbox` · `Perjalanan`.

### Board
`display:grid`, `grid-template-columns:1fr 1fr 1fr 320px`, `gap:18px`,
`align-items:start` — three time columns + the right rail.

#### Time column (Pagi / Siang / Malam)
- Panel: `background:<col.soft>`, `border-radius:28px`, `padding:16px 14px 18px`,
  vertical flex `gap:14px`.
- Header: a **12px color dot** + `h2` in Fredoka 600 `21px`, `#6E3B57`.
- Column tokens: `Pagi` dot `#F06BA8` / soft `#FDEAF3`;
  `Siang` dot `#E9A93B` / soft `#FDF2DC`; `Malam` dot `#8B6FD6` / soft `#F0EBFB`.
- Column footer: dashed add-row — `border:1.8px dashed #F4B4D2`,
  `border-radius:20px`, `padding:14px`, Nunito 800 `14px`, `#D2559A`,
  `background:rgba(255,255,255,.45)` → `#fff` on hover. Copy `+ tambah kegiatan`.

#### Activity card
`background:#fff`, `border-radius:22px`, `padding:16px 16px 14px`,
`box-shadow:0 18px 40px -34px rgba(90,50,70,.55)`.
- **Head** (flex, `gap:12px`): a **5×34px rounded accent bar** in the card's ink
  color (replaces the former square icon), then title in Fredoka 600 `17px`
  `#6E3B57` and time in Nunito 700 `13px` `#B79AAC`.
  Ink colors used: butter-amber `#E0A63A`, cornflower `#5F84E6`,
  lilac `#8B6FD6`, peony `#D2559A`.
- **Habit list** (only when the card has items):
  - Divider `1.5px dashed #F0DCE7`, then list label in Nunito 800 `11px`,
    `letter-spacing:.7px`, uppercase — default color `#5F84E6`
    (copy `Kebiasaan baik yang bisa dilakukan`); the play card uses `Ajak main`
    in `#D2559A`.
  - Item row: flex, `gap:10px`.
    - **Checkbox** `22px`, `border-radius:7px`.
      Unchecked `background:#fff`, `border:2px solid #E7CFDD`.
      Checked `background:#F06BA8`, `border:2px solid #F06BA8`, white check
      (inline path, stroke-width `3.4`, round caps).
    - **Value flower** `21px` — `BungaNilai` for the value the habit plants
      (only when the habit plants a value).
    - Label Nunito 700 `14px`, `line-height:1.35`, `#6E3B57`; when checked
      `#8A5A74` + `line-through`.
    - **Value chip** below the label (`margin-top:5px`): Nunito 800 `11.5px`,
      `border-radius:999px`, `padding:3px 10px`. Colors follow the value's flower:
      `Kasih Sayang` bg `#EFE9FD` / ink `#5B3FAF`;
      `Kemandirian` bg `#FFF2CE` / ink `#8A5A10`;
      other sources (e.g. `dari Bekal Ajak Main`) bg `#F3EEF1` / ink `#8A5A74`.
    - **Delete affordance**: a plain `×` glyph, Nunito 800 `15px`, `#B79AAC`
      (no trash icon).
  - **Card footer**: dashed add-row `1.5px dashed #EBD6E2`, `border-radius:14px`,
    `padding:10px`, Nunito 700 `13px`, `#B79AAC`; hover
    `border-color:#F4B4D2; color:#D2559A; background:#FFF7FB`.
    Copy `+ tambah to-do list`.

### Right rail (320px)
Vertical flex, `gap:16px`. All cards `border-radius:22px`,
`box-shadow:0 18px 40px -34px rgba(90,50,70,.55)`, no icons in the headings.

1. **Kebiasaan situasional** — white. `h3` Fredoka 600 `18px` `#6E3B57`;
   body Nunito 600 `13.5px` `#8A5A74`; empty-state box `background:#FBF3F8`,
   `border-radius:14px`, `padding:11px 13px`, Nunito 700 `13px` `#8A5A74`.
2. **Pita Kebiasaan** — `background:linear-gradient(160deg,#FFF6FA 0%,#fff 60%)`,
   `h3` in `#D2559A`. Two-column grid `gap:12px` of value tiles:
   `background:<soft>`, `border-radius:18px`, `padding:14px 10px`, centered;
   a **52px** value flower (swaying), name Nunito 800 `13px` `#6E3B57`, stage
   Nunito 700 `11.5px` `#B79AAC`.
   Tiles: `Kasih Sayang` / `Tumbuh` / soft `#F5F0FF` / flower state `mekar`;
   `Kemandirian` / `Kuncup` / soft `#FFF7DF` / flower state `istirahat`.
   → **Stage ↔ flower state mapping: `Tumbuh` → `mekar`, `Kuncup` → `istirahat`.**
3. **Konteks Keluarga** — white; heading row with a `Kelola` link
   (Nunito 800 `13px`, `#F06BA8`). Rows: a **10px color dot** + title
   Nunito 800 `14.5px` `#6E3B57` + sub Nunito 600 `12.5px` `#B79AAC`.
   Rows: `Rara · 1 bln` / `Tumbuh & kembang` (dot `#D2559A`); `Fokus` /
   `Kasih Sayang · Kemandirian` (dot `#6E9C4A`); `Caregiver & Rumah` /
   `Lengkapi di Kehidupan Keluarga →` (dot `#5F84E6`).
4. **Untuk Dikelola** — see below.

### Untuk Dikelola (deliberately a different material)
This card is the page's inbox of raw items still awaiting a decision, so it reads as
a **note board** rather than a finished card — distinct, but quieter than the hero.

- Card: `background:#fff`, **`border:2.5px dotted #F06BA8`**, `border-radius:22px`,
  `padding:16px 18px 18px`, `box-shadow:0 16px 36px -34px rgba(90,50,70,.5)`.
- Heading row (`align-items:baseline`): `h3 Untuk Dikelola` Fredoka 600 `18px`
  `#6E3B57`; right link `Lihat semua` Nunito 800 `13px` `#F06BA8`.
- **Progress bar**: `7px` track `border-radius:999px`, `background:#DCEAFD`
  (sky muda); fill `background:#5F84E6` (cornflower), width = percent done.
  Counter to the right: `<done>/<total>` Nunito 800 `12px` `#3F6FD8`.
- **Task slips**: `padding:11px 13px`, `border-radius:14px`, `gap:8px` between.
  - Open: `background:#FDF7FB`, `box-shadow:0 10px 22px -20px rgba(90,50,70,.8)`,
    opacity 1, label `#6E3B57`; checkbox 20px circle `#fff` with
    `2px solid #C9D8F5`.
  - Done: `background:#FBF3F8`, no shadow, `opacity:.72`, label `#A98BA0` +
    `line-through`; checkbox `#5F84E6` filled with white check.
  - Hover: `transform:translateX(2px)`.
- **Add row**: `1.5px dotted #F4B4D2`, `border-radius:14px`, `padding:10px`,
  Nunito 700 `13px` `#8A5A74`, hover `background:#FBF3F8`. Copy `+ tambah catatan`.
- Footnote Nunito 600 `12px` `#A98BA0`:
  `Contoh — akan terisi dari Inbox & Kehidupan Keluarga.`

## Interactions & Behavior
- **Tab pills** — single-select; `Hari Ini` is the default. In the prototype the
  board content does not change per tab; in production each tab loads its own view.
- **Habit checkbox** — toggles done; label goes muted + struck through.
- **Untuk Dikelola slip** — the whole slip is the hit target. Toggling updates the
  progress bar and counter, dims the slip, and **re-sorts done items to the bottom**
  (stable within each group).
- **Hover lift** — every card: `transform:translateY(-3px)` and
  `box-shadow:0 22px 44px -34px rgba(90,50,70,.55)`,
  transition `.22s cubic-bezier(.2,.7,.2,1)`.
- **Tap feedback** — pills, checkboxes, add-rows: `transform:scale(.96)` on
  `:active`, transition `.16s`.
- **Entrance** — cards fade up:
  `@keyframes fadeUp{from{opacity:0;translateY(14px)}to{opacity:1;translateY(0)}}`,
  `.5s cubic-bezier(.2,.7,.2,1)`; hero first, then board (small stagger).
- **Idle sway** — brand flower, Pita tiles, and kebun plants:
  `@keyframes sway{0%,100%{rotate(-3deg)}50%{rotate(3deg)}}`; durations `6s`–`12s`
  so nothing moves in lockstep.
- **Reduced motion** — `@media (prefers-reduced-motion: reduce)` disables the
  entrance animation (`animation:none; opacity:1`); sway should be gated too.

## State Management
Prototype state:
- `tab: string` — active tab label; default `'Hari Ini'`.
- `done: { [habitId]: boolean }` — habit checkboxes (`a1`–`a3`, `b1`–`b2`,
  `c1`–`c3` in the sample data). Production: back it with the day's habit
  completions for the selected child.
- `tugas: { [index]: boolean }` — Untuk Dikelola items. Production: back it with
  the real Inbox / Kehidupan Keluarga task records; keep the sort-done-to-bottom
  behavior client-side.
- Derived per render: `tugasCount` (`"<done>/<total>"`), `tugasPct` (rounded %),
  chip colors, checkbox colors, slip styling.

## Components to build

### `BungaNilai` — value flower
Canonical Rekah value flower, ported from the locked `svg-bunga/` asset set
("Keluarga 12 Bunga Nilai", arah 1a).
- `viewBox="-74 -74 148 148"`, `overflow:visible`, fills its slot 100%.
- Props: `value` (`kasih-sayang` | `kemandirian` — extend to the full 12),
  `state` (`mekar` | `istirahat`).
- Geometry: `n` identical petal paths rotated evenly (`360/n * i`) around origin,
  then two concentric center circles.
  - `kasih-sayang`: heart petal ×5, fill `#C9B8F0`;
    centers r`15` `#FFE29A`, r`7.5` `#FFF3E6`.
  - `kemandirian`: pointed petal ×6, fill `#FFE29A`;
    centers r`11` `#F06BA8`, r`5.3` `#FFF3E6`.
- `istirahat` (resting) = petals `opacity .5`, centers `opacity .62`.
  **Never render a wilted or broken flower.**
- Exact petal path data is in `BungaNilai.dc.html`; the full 12-value SVG set is in
  the project's `svg-bunga/` folder and is the source of truth.

### `Botanical` — flat kebun ornament
Flat, stroke+fill plant illustrations on a `0 0 100 150` viewBox, no outlines around
fills. Types available: `tulip`, `daisy`, `bell`, `fivepetal`, `sprig`, `leaf`,
`foliage`, plus abstract `star`, `squiggle`, `arch`, `dot`.
Config: `{ type, bloom, bloom2, center, stem, stemDark, leaf, leaf2 }`.

**Hero kebun row** (the only ornament instance on this page), left → right:
| type | size | sway | bloom / bloom2 |
|---|---|---|---|
| `sprig` | 34×50 | 8s | `#C9B8F0` / `#EFE9FD` |
| `tulip` | 42×64 | 11s | `#F06BA8` / `#F8B9D4` |
| `leaf` | 30×44 | 9s | — (foliage greens) |
| `daisy` | 46×70 | 12s | `#FFE29A` / `#FFF3E6`, center `#F06BA8` |
| `foliage` | 32×52 | 10s | — |
| `bell` | 38×58 | 9.5s | `#8FB8F7` / `#DCEAFD` |

Shared greens for every plant: `stem #8FB84A`, `stemDark #6F9E3F`,
`leaf #A7C63E`, `leaf2 #8FB84A`.

## Design Tokens

### Rekah palette (Langit Peony)
Pink `#F06BA8` · Peony `#F8B9D4` · Deep peony `#D2559A` · Tab active `#C6407F` ·
Sky `#8FB8F7` · Sky muda `#DCEAFD` · Cornflower `#5F84E6` · Lilac `#C9B8F0` ·
Butter `#FFE29A` · Cream `#FFF3E6` · Plum ink `#6E3B57` ·
Muted plum `#8A5A74` / `#A98BA0` / `#B79AAC` · Page background `#FCEBD7`.

Soft surfaces: `#FDEAF3` · `#FDF2DC` · `#F0EBFB` · `#FBF3F8` · `#FDF7FB` ·
`#FCE3EE` · `#EFE9FD` · `#FFF2CE` · `#E4EFFD`.

### Typography (Google Fonts)
- **Shantell Sans** 700 — the page title only (`Kelola`, 52px).
- **Fredoka** 600/700 — wordmark, column headings, card titles, rail headings.
- **Nunito** 600/700/800 — all body copy, labels, chips, counters.

### Radii / shadows
Hero `32px` · column panel `28px` · card `22px` · tile `18px` · inner box `14px` ·
pill `999px`.
Card shadow `0 18px 40px -34px rgba(90,50,70,.55)`;
hero `0 26px 54px -40px rgba(90,50,70,.55)`;
sidebar `22px 0 60px -50px rgba(90,50,70,.6)`;
hover `0 22px 44px -34px rgba(90,50,70,.55)`.

### Link colors
`a` → `#5F84E6` (Nunito 800), `a:hover` → `#F06BA8`.

### Component props (tweakable)
- `showSidebar` — boolean, default true.
- `showRail` — boolean, default true.
- `showTrash` — boolean, default true (the `×` on habit rows).

## Copy (verbatim, Indonesian — do not rewrite)
- Eyebrow: `PUSAT KENDALI KELUARGA` · Title: `Kelola`
- Subtitle: `Wujudkan langkah kecil, untuk perubahan besar.`
- Tabs: `Hari Ini` · `Rencana Minggu` · `Kehidupan Keluarga` · `Inbox` · `Perjalanan`
- Columns: `Pagi` · `Siang` · `Malam`
- Activity cards: `Bangun tidur 06:30` · `Sarapan 07:30` · `Mandi pagi 08:30` ·
  `Main bersama 10:00` · `Makan siang 12:00` · `Tidur siang 13:00` ·
  `Makan malam 18:00` · `Beres-beres 18:45` · `Rutinitas sebelum tidur 19:30`
- Habits: `Sapa hangat & kontak mata` · `Cuci tangan sebelum makan` ·
  `Coba pakai baju sendiri` · `Tumpuk balok warna` · `Makan sendiri` ·
  `Sikat gigi sendiri` · `Cerita & doa` · `Baca buku bersama`
- List labels: `Kebiasaan baik yang bisa dilakukan` · `Ajak main`
- Value chips: `Kasih Sayang` · `Kemandirian` · `dari Bekal Ajak Main` ·
  `dari Bekal Wawasan Tumbuh`
- Add rows: `+ tambah to-do list` · `+ tambah kegiatan` · `+ tambah catatan`
- Rail: `Kebiasaan situasional` / `Muncul saat momennya datang — centang kalau sempat.`
  / `Belum ada yang cocok dengan nilai fokus.`
- Rail: `Pita Kebiasaan` / `Kebiasaan yang dicentang menumbuhkan bunganya.` /
  `Tumbuh` · `Kuncup`
- Rail: `Konteks Keluarga` / `Kelola` / `Rara · 1 bln` /
  `Tumbuh & kembang` / `Fokus` / `Kasih Sayang · Kemandirian` /
  `Caregiver & Rumah` / `Lengkapi di Kehidupan Keluarga →`
- Rail: `Untuk Dikelola` / `Lihat semua` /
  `Contoh — akan terisi dari Inbox & Kehidupan Keluarga.`
- Sidebar: `rekah` · `Beranda` · `Kelola` · `Irama Hari` · `Bekal` ·
  `Ruang Teduh` · `Jurnal dan Galeri` · `Panen` · `Keluar`

## Design decisions worth preserving
1. **No flat line icons anywhere.** They were removed deliberately. Meaning is
   carried by color dots, accent bars, colored chips, and the value flowers. The
   only inline SVGs left are the checkmarks and the illustrations.
2. **The hero is the only loud surface.** Gradient + palette stripe + 52px script
   title. Everything below is white/soft panels so the page reads as one system.
3. **`Untuk Dikelola` differs by material, not by volume** — white with a dotted
   pink edge, note-slip rows, a cornflower progress bar. It signals "unsorted input"
   without competing with the hero.
4. **Value chips inherit their flower's colors** — the chip is a text echo of the
   flower beside it, so color mapping must stay in sync with `BungaNilai`.
5. **One ornament instance only.** The kebun row sits at the hero's bottom-right,
   clipped by the hero, at `.75` opacity. Earlier explorations added a second garden
   band below the board; it was removed as too much. Do not reintroduce it.

## Files
- `Kelola.dc.html` — the page prototype (template + logic; open in a browser).
- `BungaNilai.dc.html` — canonical value-flower renderer.
- `Botanical.dc.html` — flat botanical ornament generator (all types).
- `Flower.dc.html` — decorative flower used by the sidebar wordmark.
- `support.js` — prototype runtime. **Reference only; do not port.**

## Suggested prompt for Claude Code
> Implement the Kelola page in this codebase from `design_handoff_kelola/README.md`.
> Read `Kelola.dc.html` for exact structure and values, but write idiomatic
> components for this project — do not copy the `<x-dc>` runtime or its inline
> styles verbatim; map them to our styling system. Build `BungaNilai` and
> `Botanical` as real components (or export static SVGs). Keep all Indonesian copy
> verbatim. Wire habit checkboxes and the Untuk Dikelola list to our data layer,
> keeping the done-sorts-to-bottom behavior and the progress bar. Respect
> `prefers-reduced-motion`.
