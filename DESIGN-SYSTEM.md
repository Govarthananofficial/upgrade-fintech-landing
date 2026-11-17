# Upgrade – Design System

Source of truth: the `:root` tokens at the top of `css/style.css`. Nothing below the token layer uses a one-off colour, size, radius or duration.

## 1. Tokens

### Type scale (1.2 on phones → 1.333 "perfect fourth" on desktop, fluid 360–1440px)
| Token | Size | Role |
|---|---|---|
| `--text-xs` | 12px | Chart ticks, tooltip |
| `--text-sm` | 14px | Pills, meta, footer mail |
| `--text-base` | 16px | Body, buttons, nav |
| `--text-md` | 17 → 20px | Lead paragraph (`.t-lead`) |
| `--text-lg` | 19 → 21px | Accordion titles |
| `--text-xl` | 22 → 28px | Card sub-heads (`.t-h4`) |
| `--text-2xl` | 26 → 38px | Bento headings (`.t-h3`) |
| `--text-3xl` | 32 → 50px | Section titles (`.t-h2`) |
| `--text-4xl` | 38 → 67px | Hero (`.t-display`) |

Line heights: display 1.04, tight 1.15, snug 1.3, body 1.65. Tracking: display −.005em, caps .06em.
Families: **Archivo** ExtraBold at 104–106% width (display, stands in for Integral CF) · **Lexend** (card heads, chart numerals) · **Poppins** (body).
Roles: `.t-display .t-h2 .t-h3 .t-h4 .t-lead .t-body .t-meta`. The hero is `min-height: 100svh`.

### Spacing (4/8 base)
`--space-1…10` = 4 · 8 · 12 · 16 · 24 · 32 · 40 · 56 · 80 · 120. Section rhythm: `--section-y` (72 → 120px).

### Colour
| Token | Value | Use |
|---|---|---|
| `--green` / `--green-hover` | #00b512 / #009c10 | Primary action |
| `--green-deep` | #04684c | Brand surfaces, focus ring, rail |
| `--teal-dark` `--teal-mid` `--navy` | #004852 · #2d907a · #001229 | Dark surfaces |
| `--lime` | #e2ff54 | **The one accent** – hero keyword, one app card, focus on dark |
| `--text` `--text-muted` | #161919 · #5b5959 | Text (muted = 7:1 on white) |
| `--surface` `--line` | #f6f9f8 · #eaecf0 | Panels, borders |

### Radius · elevation · motion
`--r-sm 12` `--r-md 16` `--r-lg 20` `--r-pill` · `--shadow-1` (rest/hover small) `--shadow-2` (hover lift) · `--dur-fast 150` `--dur-base 250` `--dur-slow 400` · `--ease-out cubic-bezier(.2,.8,.2,1)` · `--tap 44px` (min target).

## 2. Components

### Button `.cta` (`--solid` | `--outline`)
Label + circle, 52px high. Solid = primary (one per viewport); outline = secondary.
| State | Behaviour |
|---|---|
| Hover | Fill sweeps in from the left; arrow rotates; circle follows the cursor magnetically (fine pointers) |
| Focus-visible | 3px outline (lime on dark, deep green on light) |
| Active | Label scales to .98 |
Keyboard: native `<a>`/`<button>`. Don't: stack two solid buttons in one view.

### Pill `.pill`
Non-interactive label – no hover state on purpose, so it never looks clickable.

### Card `.bcard / .tcard / .acc__item` (+ `.spot`)
Hover: lifts via the individual `translate` property (so it composes with GSAP's `transform`), shadow-2, cursor-following spotlight, inner imagery scales via `scale`. Whole card is the target where it navigates.

### Accordion `.acc`
Buttons with `aria-pressed`; hover, focus or click activates. Moves the green rail, highlights the month, re-bounces the chart. Content is always visible (no hidden essentials).

### Nav `.site-nav`
Sticky, glass after 60px scroll, 44px targets, animated underline, hamburger below `lg`. Skip link first in tab order.

## 3. Motion map (GSAP + ScrollTrigger)
| Where | Effect | Driver |
|---|---|---|
| Page | Lime progress bar | scrub, whole page |
| Hero | Word-by-word title, staged phone/cards; copy fades up, visual/grid parallax | load + scrub |
| Hero | Mouse parallax on cards (fine pointers, ≥992px) | `quickTo` |
| All `h2` | Masked word reveal | ScrollTrigger |
| Cards/blocks | Directional reveal, siblings stagger | `ScrollTrigger.batch` |
| About | Chart bars grow, $ counter, panel parallax | trigger + scrub |
| Features / Trust / Services | Layers move against each other | scrub |
| Services | Balance counts up | trigger |
| CTA | Box scales in, phones rise | scrub + trigger |
| Showcase blocks | 3D tilt | `quickTo` on mousemove |
All motion lives inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`; hover-only effects inside `(hover: hover) and (pointer: fine)`.

## 4. UX-law audit (after this pass)
| # | Law | Status | What was done |
|---|---|---|---|
| 1 | Aesthetic-usability | Pass | Token layer; every interactive element has hover, focus, active |
| 2 | Hick | Pass | 5 nav items, one solid CTA per viewport |
| 3 | Fitts | Pass | Sticky nav, 44px targets (nav, footer links, social), 52px buttons, back-to-top |
| 4 | Jakob | Pass | Logo top-left, hamburger on mobile, footer conventions |
| 5 | Miller | Pass | Footer links chunked into nav / social / legal |
| 6 | Doherty | Pass | 150–400ms transitions, nothing blocks input, reduced-motion respected |
| 7 | Proximity | Pass | Intra-group spacing 8–16, inter-group 40–120 |
| 8 | Similarity | Pass | Pills never hover; all CTAs share one pattern |
| 9 | Common region | Pass | Cards only where grouping carries meaning |
| 10 | Hierarchy | Pass | One dominant element per viewport (hero headline, then section titles) |
| 11 | Progressive disclosure | N/A | Single-page marketing, no hidden essentials |
| 12 | Recognition | Pass | Text labels on all CTAs; back-to-top has `aria-label` |
| 13 | Von Restorff | Pass | Lime = the one accent in the hero; green reserved for actions |
| 14 | Peak-end | Pass | Strong CTA block as the closing beat, then footer |
| 15 | Goal-gradient | Pass | Scroll progress bar |
| 16 | Serial position | Pass | Value prop first, final CTA last |
| 17 | Tesler | N/A | No forms yet |
| 18 | Postel | N/A | No inputs yet |
| 19 | Occam | Pass | No extra sections or copy added |
| 20 | Feedback | Pass | Hover, focus, active feedback everywhere; counters and bars respond to scroll |

Accessibility extras: skip link, `:focus-visible` rings, muted text raised to 7:1, light-grey card text no longer faded with opacity.

## 5. Open items
- Replace Lexend with the licensed Integral CF / Helvetica Neue Extended if available.
- Copy from the Figma is placeholder-grade ("medications…", "Glose is the ultimate reading", reversed email). Needs real copy.
- Nav labels follow the design (product names) but link to page sections; point them at real product pages when they exist.
