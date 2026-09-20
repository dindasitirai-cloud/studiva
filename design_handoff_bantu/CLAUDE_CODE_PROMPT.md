# Prompt for Claude Code — implement the Rekah "Bantu" page

Paste this into Claude Code from the root of the Rekah website repo, with the
`design_handoff_bantu/` folder available.

---

Implement the **Bantu** (support) page for the Rekah website from the design handoff
in `design_handoff_bantu/`.

Read first:
1. `design_handoff_bantu/README.md` — the full spec: page frame, tokens, every
   section, behavior, copy rules, accessibility notes.
2. `design_handoff_bantu/Bantu.dc.html` — the reference prototype. Read it for
   structure and exact values only.

Rules:
- **Do not port the prototype's runtime.** `support.js` and the `<x-dc>` /
  `<dc-import>` / `<sc-for>` / `<sc-if>` / `{{ }}` syntax are prototype-only. Build
  the page with this repo's own component patterns, routing, state and styling
  system.
- Reuse the existing app shell/sidebar if the repo already has one; just add the
  `Bantu` nav item and mark it active. Only build the sidebar from the spec if none
  exists.
- Map the prototype's inline styles onto the repo's styling approach and existing
  design tokens. If a token is missing, add it using the hex values in the README
  rather than hardcoding one-off colors in the component.
- **Copy is final and in Indonesian — do not rewrite or translate it.** The forum
  safety line and the counseling disclaimer are policy text; keep them verbatim.
- **No flat or line icons.** Category and status are carried by colored dots, stems
  and tick bars, exactly as specified.
- The botanical ornaments (`Botanical.dc.html`) and the logo bloom
  (`Flower.dc.html`) are generated SVG. Either reimplement them as a component or
  export static SVGs — do not substitute an icon library.
- Keep the text-contrast floor: no text lighter than `#8A5A74` on light grounds.
- Interactive elements must be real `button` / `a` with focus states; topic tiles get
  `aria-pressed`; ornaments get `aria-hidden`.
- Respect `prefers-reduced-motion` for the sway, fade-up, hover-lift and press
  animations.

Behavior to implement:
- Topic tiles: single-select, click again to clear. Wire selection to whatever
  guidance/route the codebase has; if there is none yet, leave it as local state with
  a clearly marked TODO.
- Forum toggle: shows/hides the "Isi forum" thread list; the button label flips
  between `Lihat isi forum selengkapnya` and `Tutup isi forum`.
- Seed the forum with the single thread in the README ("Tips bikin anak cepat tidur").
  If the repo has a forum data source, read from it and keep the seed as the empty-ish
  fallback.
- Leave `Tulis di forum`, `Konseling via WhatsApp`, `Laporkan` and the saved-guide
  `›` / `×` actions as clearly marked TODOs unless the backend for them already
  exists.

Layout requirements worth double-checking after you build:
- The peach page background fills the whole page surface, not just the viewport width.
- The "Tanya jawab bersama orang tua lain" panel is **full width**, below the
  two-column body — not inside the left column.
- The prompt card is the wide (420px-class) right item on the panel's first row; the
  sneak-peek card is the narrow fixed-width (264px-class) item on the second row with
  the toggle button beside it, stretched to the same height and the same 24px corner
  radius.
- The page should be responsive: treat the prototype's 1400px canvas as a max-width,
  and let the topic grid, panel rows and rail collapse gracefully on narrower
  viewports.

When done, show me the page and list anything you had to interpret or stub.
