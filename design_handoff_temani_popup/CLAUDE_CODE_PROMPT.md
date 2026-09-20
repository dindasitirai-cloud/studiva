# Prompt for Claude Code — implement the Temani day pop-up

Paste this into Claude Code from the root of the Rekah website repo, with the
`design_handoff_temani_popup/` folder available.

---

Implement the **day pop-up** for the already-built `Temani` page, from the design
handoff in `design_handoff_temani_popup/`.

Read first:
1. `design_handoff_temani_popup/README.md` — the full spec for the dialog.
2. `design_handoff_temani_popup/Temani.dc.html` — the reference prototype. The modal
   markup is at the end of the file inside `<sc-if value="{{ modalOpen }}">`; the
   state (`modal`, `alasanOpen`) is in the `Component` class at the bottom.

Scope: **only this dialog.** The Temani page is already implemented — the only change
to it is that clicking a journey card now opens this modal instead of navigating to
the full-page day view. Remove or bypass that old full-page route.

Rules:
- **Do not port the prototype's runtime** (`support.js`, `<dc-import>` / `<sc-for>` /
  `<sc-if>` / `{{ }}`). Build the dialog with this repo's own component and state
  patterns; use an existing modal/dialog primitive if the codebase has one.
- Reuse the Rekah tokens already added for the Temani page. Only add a token if the
  spec needs a value that is genuinely missing.
- **Copy is final and in Indonesian — do not rewrite or translate it.**
- **No flat or line icons.** The "LANGKAH MENEMANI" chip uses a leaf-colored dot, not
  the old puzzle emoji; arrows and chevrons are typographic (`←`, `›`, `⌄`, `×`).
- Reuse the botanical ornament component you already built — do not substitute an
  icon library.

Behavior to implement:
- Opens from a journey card; the journey title fills the uppercase eyebrow.
- Bind the day content (step text, script quote, rationale, current day / total days)
  to the journey's real data. The prototype's copy is seed content.
- `Saya akan coba` commits the day (mark the step accepted, refresh progress) then
  closes. `Nanti saja`, backdrop click, `Kembali` and `×` dismiss with no state
  change. If the commit endpoint does not exist yet, leave a clearly marked TODO.
- `Kenapa ini membantu?` is a disclosure, collapsed every time the dialog opens.
- Add `Esc` to close, a focus trap, page-scroll lock, `role="dialog"` +
  `aria-modal="true"` + `aria-labelledby`, and focus return to the originating card.
- Respect `prefers-reduced-motion` for the entrance, ornament sway and press
  animations.

Double-check after building:
- The dialog is a **centered, content-sized panel** (660px-class, `max-height:100%`
  with internal scroll) — not full screen, and not a page.
- The palette stripe sits flush on the panel's top edge and the ornament is clipped
  by the panel's rounded corner.

When done, show me the dialog open over the Temani page and list anything you stubbed.
