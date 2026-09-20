# Handoff: Pop-up "Hari ini cukup satu hal" (Temani → detail perjalanan)

## Scope
This handoff covers **only the pop-up** that opens when a journey card on the
`Temani` page is clicked (e.g. "Rutinitas Tidur yang Lebih Tenang"). The Temani page
itself is already implemented — nothing else on it changes except that the journey
cards now open this dialog instead of navigating to a full page.

**The previous full-page day view is replaced by this modal.** It is a centered
dialog over the dimmed page, sized to its content — not a full-screen takeover.

## About the Design Files
`Temani.dc.html` is a **design reference authored in HTML** — a working prototype,
not production code. The modal markup lives at the end of the file inside
`<sc-if value="{{ modalOpen }}">`; the logic (`modal`, `alasanOpen` state) is in the
`Component` class at the bottom.

The prototype uses an in-house template runtime (`support.js`, `<dc-import>` /
`<sc-for>` / `<sc-if>` / `{{ }}`). **Do not port the runtime.** All styling is
inline — map it onto the repo's styling system and existing Rekah tokens.
`Botanical.dc.html` is the ornament SVG generator (already handled in the previous
handoff — reuse whatever you built there).

## Fidelity
**High-fidelity.** Sizes, colors, radii and copy are final. Reuse the tokens already
in the codebase from the earlier Temani handoff.

## Dialog shell
- **Overlay**: `position:fixed; inset:0; z-index:60`, centered flex,
  `padding:40px 24px`.
- **Backdrop**: `rgba(90,46,71,.42)` + `backdrop-filter:blur(3px)`, fades in 220ms.
  Clicking it closes the dialog.
- **Panel**: `width:660px; max-width:100%; max-height:100%; overflow:auto`,
  `border-radius:32px`,
  `background:linear-gradient(160deg,#FFF6FB 0%,#FDEFF6 55%,#F7E9FA 100%)`,
  `box-shadow:0 40px 90px -40px rgba(90,50,70,.75)`.
  Enters with `opacity 0→1`, `translateY(18px)→0`, `scale(.97)→1` over 280ms
  `cubic-bezier(.2,.7,.2,1)`.
- **Palette stripe** across the top edge, `7px`, five blocks:
  `#F06BA8` [2] · `#F8B9D4` [1] · `#FFE29A` [1.4] · `#C9B8F0` [1] · `#8FB8F7` [1.6].
- **Ornament**: a lilac sprig at `right:-6px; bottom:-8px`, `96×140`, opacity `.26`,
  swaying 14s, `pointer-events:none`, clipped by the panel.
- **Content padding**: `22px 32px 30px`.

## Content, top to bottom
1. **Top bar** — space-between:
   - left: pill `rgba(255,255,255,.8)`, `padding:8px 15px`, `←` + "Kembali",
     Nunito 800 `13.5px` `#B4477F`;
   - right: `32px` circular `rgba(255,255,255,.8)` button with `×` `#B4477F`.
   Both close the dialog.
2. **Progress row** (margin-top `20px`, space-between, wraps):
   - seven day dots, gap `7px` — completed `13px` `#F0479B`, remaining `11px`
     `#F8C4DC` (day 1 of 7 → first dot filled);
   - pill "Hari 1 dari 7", `#FFF1F7` / `#B4477F`, Nunito 800 `13.5px`.
3. **Journey name** as an eyebrow: Nunito 800 `11.5px`, `1px` tracking, uppercase,
   `#8A5A74` (e.g. "RUTINITAS TIDUR YANG LEBIH TENANG").
4. **Title** "Hari ini cukup satu hal." — Shantell Sans 700 `34px` `#6E3B57`,
   `line-height:1.1`, `letter-spacing:-.5px`.
5. **Step card** — white, `border-radius:26px`, `2px solid #FBDDEC`,
   `box-shadow:0 20px 44px -34px rgba(90,50,70,.55)`, padding `22px 24px 24px`:
   - **Step text** with a `6×52px` peony stem at its left:
     "Beri jeda sebelum membantu — tunggu beberapa detik saat anak mencoba."
     Nunito 800 `19px` `#6E3B57`, `line-height:1.4`.
   - **Kind chip** "LANGKAH MENEMANI" — `background:#E4F2C4`, leaf dot `#6E9C4A`,
     label `#4A6E2E`, Nunito 800 `11.5px` / `1px` tracking. **No icon** — the dot
     replaces the puzzle emoji in the old design.
   - **Script bubble** — `background:#FBDDEC`, `border-radius:20px`,
     padding `18px 20px`, text `"Coba dulu ya, Ibu di sini menemani."`
     Shantell Sans 600 `19px` `#6E3B57`.
   - **"Kenapa ini membantu?"** — a disclosure row: `4px solid #C9B8F0` left rule,
     chevron `›` (rotates to `⌄` when open) `#8B6FD6`, label Nunito 800 `15px`
     `#7B58C9`. Clicking it expands a panel `background:#EFE9FD`,
     `border-radius:18px`, padding `16px 18px`, body Nunito 600 `14.5px` `#7A4A64`.
     Body copy in the prototype: "Jeda beberapa detik memberi anak ruang untuk
     mencoba sendiri. Anak belajar bahwa usahanya dipercaya, dan rasa mampu itu yang
     menumbuhkan kemandirian." — replace with the real per-step rationale from the
     content source.
6. **Primary CTA** "Saya akan coba" — full-width pill `background:#F0479B`,
   `padding:17px 28px`, butter dot `#FFE29A` + white label Nunito 800 `17px`,
   `box-shadow:0 20px 34px -20px rgba(240,71,155,.95)`.
7. **Reassurance line** "Besok kita lihat bagaimana responsnya." — centered,
   Nunito 700 `14px` `#8A5A74`.
8. **Secondary action** "Nanti saja" — centered, underlined, Nunito 800 `14px`
   `#B4477F`.

## Behavior
- Opens from a journey card click; the card passes the journey title, which fills the
  eyebrow. In the prototype the day content is static — bind it to the journey's
  current day.
- **Closes on**: backdrop click, `Kembali`, `×`, `Nanti saja`, and `Saya akan coba`.
  In production these must differ:
  - `Saya akan coba` → commit the day (mark the step accepted, advance/refresh
    progress), then close.
  - `Nanti saja` → dismiss with no state change.
  - Backdrop / `Kembali` / `×` → plain dismiss.
- Add `Esc` to close and a focus trap inside the dialog; lock page scroll while open.
- `Kenapa ini membantu?` toggles independently and resets to collapsed each time the
  dialog opens.
- Motion: all tappables press to `scale(.97)`, 160ms; ornament sways continuously.
  Respect `prefers-reduced-motion` for the entrance, sway and press animations.

## Accessibility
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the
  "Hari ini cukup satu hal." heading.
- Move focus to the dialog on open and return it to the originating journey card on
  close.
- The disclosure is a real `button` with `aria-expanded` / `aria-controls`.
- Day dots duplicate "Hari 1 dari 7" — mark them `aria-hidden` and let the text carry
  the state.
- Ornaments are decorative: `aria-hidden`.
- Text contrast floor `#8A5A74` on the light ground.

## Copy rules
All Indonesian copy is final — **do not rewrite or translate**. The per-day step,
script quote and rationale come from the journey content source; the frame copy
("Hari ini cukup satu hal.", "Saya akan coba", "Besok kita lihat bagaimana
responsnya.", "Nanti saja", "Kembali") is fixed.
