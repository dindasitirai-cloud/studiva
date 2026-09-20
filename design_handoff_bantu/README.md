# Handoff: Halaman Bantu (Rekah)

## Overview
`Bantu` is the support page of the Rekah parenting app. Structure, top to bottom:

1. **Sidebar** (shared app shell, `Bantu` active).
2. **Hero** — gradient title block "Bantu" with the Kebun botanical row.
3. **Two-column body** — left: "Apa yang sedang terjadi?" topic picker; right rail:
   "Panduan tersimpan" + "Konseling online".
4. **Full-width forum panel** — "Tanya jawab bersama orang tua lain", the prompt
   card, a sneak-peek card + toggle, and the expandable "Isi forum" thread list.
5. **Footer quote** flanked by two botanical sprigs.

## About the Design Files
These files are **design references authored in HTML** — a working prototype of the
intended look and behavior, not production code to copy. Recreate the design in the
target codebase with its own component patterns, state layer, and styling approach.

The prototype uses a small in-house template runtime (`support.js`, the `<x-dc>` /
`<dc-import>` / `<sc-for>` / `<sc-if>` tags, `{{ }}` holes). **Do not port the
runtime** — read it only to understand structure. All styling is inline; map it onto
the codebase's styling system (CSS modules, Tailwind, tokens).

Files: `Bantu.dc.html` (the page), `Botanical.dc.html` (ornament SVG generator),
`Flower.dc.html` (logo bloom), `support.js` (runtime — reference only).

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, shadows, ornament placement
and interactions are final. The one thing to adapt: the **botanical ornaments**
(`Botanical`) are generated SVG in the prototype — reimplement as a component or
export static SVG assets.

## Tokens used on this page

Type:
- Display / page title / panel title: **Shantell Sans** 600–700
- Card titles, section headings: **Fredoka** 600
- Body, labels, buttons: **Nunito** 600–800

Color:
- Page background `#FCEBD7` (peach) — must paint the whole canvas, not just `body`
- Ink: `#6E3B57` (plum), body copy `#7A4A64`, secondary copy `#8A5A74`
  (do not go lighter than `#8A5A74` for text — contrast floor)
- Peony `#F06BA8`, peony dark `#C6407F`, peony ink `#B4477F`, peony tint `#FCE3EE` / `#FFF1F7`, dashed border `#F6A9CB`
- Lilac `#8B6FD6`, lilac dark `#7B58C9`, lilac ink `#5B3FAF`, lilac tint `#EFE9FD`, border `#E4D8FA`, pale `#C9B8F0`
- Butter `#FFE29A`, sky `#8FB8F7` / `#5F84E6` / `#DCEAFD`, leaf `#A7C63E` / `#8FB84A`, green CTA `#2FA86A`
- Topic accents: peony `#F06BA8`, lilac `#8B6FD6`, butter-dark `#E0A63A`, rose `#D2559A`,
  cornflower `#5F84E6`, leaf-dark `#6E9C4A`, terracotta `#E07A4A`, muted `#A98BA0` (Lainnya)

Shape & depth:
- Radii: hero `32px`, forum panel `30px`, topic panel `28px`, cards `24px`,
  topic tiles `20px`, rail items `18px`, pills `999px`
- Card shadow `0 18px 40px -34px rgba(90,50,70,.55)`; panel shadow
  `0 22px 48px -40px rgba(90,50,70,.55)`; CTA shadow `0 16px 30px -20px <cta color>`
- Hover lift: `translateY(-3px)` + `0 22px 44px -34px rgba(90,50,70,.55)`, 220ms
- Press: `scale(.97)`, 160ms
- **No flat/line icons anywhere.** Status and category are carried by colored dots
  (7–12px), 5–6px stems, and 6px tick bars.

## Page frame
Canvas `1400px` wide, `min-height:1240px`, background `#FCEBD7` on the root flex
container (so the surface fills the canvas, not only the viewport). Sidebar `250px`
fixed + main `flex:1`, padding `30px 38px 44px`.

### Sidebar
Same shell as Kelola. Nav order: `Beranda` · `Kelola` · `Irama Hari` · `Bekal` ·
`Ruang Teduh` · `Jurnal dan Galeri` · `Panen` · **`Bantu` (active)**; footer `Keluar`.
Active item: `background:#FCE3EE`, dot + label `#F06BA8`. Inactive: transparent,
`#6E3B57` at opacity `.8`.

### Hero
`border-radius:32px`, `overflow:hidden`,
`background:linear-gradient(120deg,#FBD9E9 0%,#F6DCF3 34%,#E6DDFB 62%,#DCEAFD 100%)`,
`box-shadow:0 26px 54px -40px rgba(90,50,70,.55)`, `margin-bottom:24px`.
1. **Palette stripe** `7px`, five blocks: `#F06BA8` [2] · `#F8B9D4` [1] ·
   `#FFE29A` [1.4] · `#C9B8F0` [1] · `#8FB8F7` [1.6].
2. **Kebun row** absolute `right:24px; bottom:0`, opacity `.75`, six plants
   (sprig lilac, tulip peony, leaf, daisy butter, foliage, bell sky), each swaying
   8–12s from `transform-origin:bottom center`.
3. Content padding `26px 34px 30px`: eyebrow pill "RUANG DUKUNGAN"
   (`rgba(255,255,255,.75)`, peony dot, `#B4477F`, 11.5px/1px tracking),
   `h1` "Bantu" Shantell 700 `52px` `#6E3B57`, then the subhead
   "Dukungan saat kamu membutuhkannya. Kami ada di sini." Nunito 600 `17px` `#7A4A64`.

## Body grid
`display:grid; grid-template-columns:minmax(0,1fr) 340px; gap:22px; align-items:start`.

### Left: "Apa yang sedang terjadi?"
Panel `background:linear-gradient(150deg,#F7E9FA,#FBEFF7 55%,#FDF3F8)`,
`border-radius:28px`, padding `24px 26px 26px`; a five-petal lilac ornament at
`right:-6px; top:10px`, opacity `.35`.
- Title Fredoka 600 `25px` `#C6407F`; sub Nunito 600 `14px` `#8A5A74`.
- **Context chips row**: label "REKAH TAHU" (`#B4477F`, 11px/1px) + chips
  `Rara · 1 bln` (peony tint) and `Fokus: Kasih Sayang` (lilac tint), each a dot + label.
- **Topic grid**: `repeat(3,minmax(0,1fr))`, gap `14px`. Each tile: white,
  `border-radius:20px`, padding `16px 16px 15px`, a `5×28px` accent stem + title
  Fredoka 600 `16.5px`, sub Nunito 600 `12.5px` `#8A5A74`.
  - Selected (single-select, click again to clear): `background:#FFF6FB`,
    `2px solid <accent>`, deeper shadow.
  - "Lainnya" tile: `rgba(255,255,255,.55)` + `2px dashed #E0C9DA`, no shadow.
  - Topics in order: Anak tantrum · Sulit tidur · Tidak mau makan · Memukul ·
    Konflik saudara · Konflik caregiver · Saya kehilangan sabar · Lainnya.

### Right rail (340px)
- **Panduan tersimpan** — pink dot + Fredoka 600 `18px` heading; white rows
  (`border-radius:18px`, padding `14px 16px`): `5×32px` accent stem, title Nunito 800
  `14.5px`, date Nunito 700 `12px` `#8A5A74`, then `›` (`#F06BA8`) and `×` (`#C6A6BA`).
- **Konseling online** — green dot + heading; card
  `linear-gradient(160deg,#F3EBFC,#FBF1F7)`, `border-radius:24px`, leaf sprig
  ornament bottom-right at opacity `.3`. Eyebrow "PENDAMPINGAN PERSONAL" `#7B58C9`;
  42px `#DDD0F6` avatar circle with initials `FE` in `#5B3FAF`; name Fredoka 600
  `17px`; specialty Nunito 700 `12.5px`; body `13.5px` `#7A4A64`; CTA pill
  `background:#2FA86A`, white label "Konseling via WhatsApp", pale-green dot;
  disclaimer `11.5px` `#8A5A74`.

## Full-width forum panel
Sits **below** the two-column grid, spanning the full main width (`margin-top:22px`,
column gap `22px` to the sections that follow).

Panel: `border-radius:30px`,
`background:linear-gradient(140deg,#EFE7FD 0%,#F7ECFA 48%,#FDEFF6 100%)`,
`box-shadow:0 24px 50px -40px rgba(90,50,70,.55)`, padding `0 0 24px`, inner
padding `22px 26px 0`. Top edge carries a `6px` five-block stripe
(`#8B6FD6` [1.6] · `#C9B8F0` [1] · `#F8B9D4` [1.2] · `#FFE29A` [.9] · `#8FB8F7` [1.3]).
A daisy ornament sits at `left:-10px; bottom:-8px`, `96×140`, opacity `.28`.

**Row 1** — `grid-template-columns:minmax(0,1fr) 420px; gap:24px; align-items:start`:
- Left: eyebrow pill "RUANG BERSAMA" (lilac dot, `#5B3FAF`), `h2` "Tanya jawab
  bersama orang tua lain" Shantell 700 `30px` `#5B3FAF`, body Nunito 600 `14px`
  `#7A4A64`, `max-width:52ch`.
- Right (420px): **prompt card** — `background:#FFF1F7`, `2.5px dashed #F6A9CB`,
  `border-radius:22px`, padding `18px 18px 20px`. Two tick bars (`26×6` peony,
  `14×6` butter), title "Ada yang ingin ditanyakan atau dibagikan?" Shantell 700
  `20px` `#B4477F`, sub Nunito 600 `13px` `#8A5A74`, then full-width CTA pill
  `background:#C6407F` with butter dot + "Tulis di forum".

**Row 2** — `display:flex; align-items:stretch; gap:16px; flex-wrap:wrap`:
- **Sneak-peek card**: fixed `width:264px`, white, `border-radius:24px`,
  `2px solid #E4D8FA`, `box-shadow:0 20px 42px -32px rgba(91,63,175,.6)`,
  padding `16px 18px 18px`. Tick row (`26×6 #8B6FD6`, `14×6 #F8B9D4`,
  `9×6 #FFE29A`), eyebrow "SNEAK-PEEK ISI FORUM" (`#5B3FAF`, 10.5px/1px), then one
  row per thread: `5×34px` accent stem + title Fredoka 600 `14.5px` + meta
  `{author · date} · {n} balasan` Nunito 700 `11.5px` `#8A5A74`.
- **Toggle button** beside it: white fill, `2.5px solid #8B6FD6`,
  `border-radius:24px` (matching the card, not a pill), `padding:14px 22px`,
  stretches to the card's height, lilac dot + label `#5B3FAF` Nunito 800 `13.5px`.
  Label: `Lihat isi forum selengkapnya` → `Tutup isi forum` when open.

**Isi forum** (rendered only when the toggle is open):
- Header row: lilac dot, "Isi forum" Fredoka 600 `19px`, count pill `{n} utas`
  (`#EFE9FD` / `#5B3FAF`).
- Thread cards use the **same styling as the sneak-peek card** (white,
  `border-radius:24px`, `2px solid #E4D8FA`, tick row, accent stem + title + meta),
  then body copy Nunito 600 `14px` `#7A4A64`, then a footer above a
  `1.5px dashed #F0DCE7` rule: accent dot + `{n} balasan` in the accent color, and
  `Laporkan` in `#8A5A74`.
- Seed content: **"Tips bikin anak cepat tidur"** — Orang tua · 12 Sep · 1 balasan —
  body "Bagaimana caranya biar anak bisa cepat tidur ya?" (lilac accent `#8B6FD6`).

## Footer quote
Centered row, gap `12px`: daisy sprig (26×40, opacity `.7`, swaying) + "Kamu tidak
sendiri. Setiap tantangan adalah kesempatan untuk tumbuh." Shantell 600 `16px`
`#B4477F` + tulip sprig.

## Behavior
- **Topic tiles**: single-select toggle; selection is local UI state only in the
  prototype. In production, selecting a topic should route to / load that topic's
  guidance.
- **Forum toggle**: shows/hides the thread list; label flips.
- **Not wired** (prototype stubs — hook up in production): `Tulis di forum`,
  `Konseling via WhatsApp` (number still being confirmed), `Laporkan`, the `›` / `×`
  actions on saved guides, sidebar nav, and the sidebar collapse chevron.
- Motion: cards lift on hover, all tappables press to `.97`, ornaments sway
  continuously; sections fade-up `14px` on mount. All motion respects
  `prefers-reduced-motion`.

## Props / variants exposed by the prototype
`showSidebar` (boolean, default true) and `showRail` (boolean, default true) — for
embedding the page body without the app shell.

## Copy rules
All Indonesian copy in the prototype is final — **do not rewrite**. Keep the
peer-forum safety line ("Ruang ini ditinjau tim agar tetap aman & saling
menghormati.") and the counseling disclaimer verbatim; both are policy-bearing.
`Bantu` is not a crisis service, and the disclaimer says so.

## Accessibility notes
- Text contrast floor is `#8A5A74` on light grounds; `#B79CAF` and `#A98BA0` were
  removed from text for this reason (still fine for a `×` glyph or a decorative dot).
- Interactive rows are `div`s in the prototype — in production use real
  `button` / `a` elements with focus rings, and give the topic tiles
  `aria-pressed`.
- Ornaments are decorative: `aria-hidden`, no alt text.
