---
name: Nestor Gallery
description: A curated archive viewer for Nestor's Asset Delivery Network, comparing renders and service speed across platforms.
colors:
  warm-amber: "#c98a4b"
  accent-ink: "#1a1310"
  ink: "#ece8e3"
  ink-dim: "#9b958c"
  bg: "#0b0a09"
  bg-raised: "#141210"
  line: "#FFFFFF14"
typography:
  display:
    fontFamily: "Fraunces, serif"
    fontSize: "clamp(2.6rem, 5vw, 4rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Outfit, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Outfit, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.78rem"
    fontWeight: 500
    letterSpacing: "0.06em"
rounded:
  pill: "999px"
  lg: "14px"
  md: "12px"
  full: "50%"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "56px"
components:
  button-primary:
    backgroundColor: "{colors.warm-amber}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.pill}"
    padding: "9px 18px"
  pill-filter:
    backgroundColor: "transparent"
    textColor: "{colors.ink-dim}"
    rounded: "{rounded.pill}"
    padding: "7px 16px"
  pill-filter-active:
    backgroundColor: "{colors.warm-amber}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.pill}"
  input-search:
    backgroundColor: "{colors.bg-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "11px 16px 11px 38px"
  tile-gallery:
    backgroundColor: "{colors.bg-raised}"
    rounded: "{rounded.lg}"
---

# Design System: Nestor Gallery

## 1. Overview

**Creative North Star: "The Amber Archive"**

This system documents a curated archive, not a dashboard. Every render Nestor's delivery
network has produced lives behind a warm, low-lit interface: an off-black canvas, one amber
accent used sparingly, and an editorial display face (Fraunces) reserved for the single page
title. The bento gallery is the centerpiece; everything else (search, filters, the speed test
panel) is deliberately quiet so the renders stay the loudest thing on screen.

This explicitly rejects the generic SaaS dashboard look: no blue/purple gradient admin chrome, no
identical equal-sized card grids, no cream/beige "safe" body background, no gradient text, no
uppercase tracked eyebrows scattered above every section.

**Key Characteristics:**
- Off-black/off-white dual surface, never pure `#000` or pure `#fff`.
- One accent (Warm Amber) carries all emphasis; no secondary or tertiary color roles.
- Fraunces serif is reserved exclusively for the display headline; everything else is Outfit.
- Full-bleed media tiles with bottom gradient-scrim captions, not caption bars below thumbnails.
- Persistent, layered elevation: raised surfaces always carry a resting shadow, not just on hover.

## 2. Colors

The palette is restrained: one warm accent against a warm-neutral dark (and light) ground, never
a saturated multi-color system.

### Primary
- **Warm Amber** (`#c98a4b` dark / `#8f4f1f` light): the only accent in the system. Used for the
  active filter pill, the speed-test "Fastest" badge, the primary "Run speed test" button, focus
  rings, and text selection. Appears on roughly 5-10% of any given screen; its rarity is what
  makes it register as a signal rather than decoration. The light-mode value is deliberately
  darker than a literal hue-rotation of the dark accent: at `#a8632b` it read at 4.09:1 against
  the light ground and 4.26:1 against Accent Ink, both under the 4.5:1 AA floor; `#8f4f1f` clears
  both pairings (5.5:1+) without changing the dark-mode value or the hue family.
- **Accent Ink** (`#1a1310` dark / `#fbf3e9` light): the text color used only on top of Warm
  Amber fills, chosen per-theme for contrast rather than a fixed black/white.

### Neutral
- **Ground** (`#0b0a09` dark / `#f3efe8` light): the page background. Off-black, not pure black;
  off-white with a faint warm cast, not a cream/beige default.
- **Raised Surface** (`#141210` dark / `#ffffff` light): every panel, tile, input, and modal sits
  on this surface, one step lighter (dark mode) or fully white (light mode) than the ground.
- **Ink** (`#ece8e3` dark / `#1d1a17` light): primary text color.
- **Ink Dim** (`#9b958c` dark / `#6b655c` light): secondary text — eyebrow labels, platform tags,
  hint copy, inactive filter pills. Light-mode value darkened from an earlier `#756f66` (4.34:1
  against Ground, under the 4.5:1 AA floor) to `#6b655c` (5.03:1).
- **Line** (`rgba(255,255,255,0.08)` dark / `rgba(20,18,16,0.1)` light): the only border color in
  the system, used at one consistent low opacity everywhere a hairline is needed.
- **Line Strong** (`rgba(255,255,255,0.2)` dark / `rgba(20,18,16,0.22)` light): a stronger hairline
  used only for hover feedback on pills and the theme toggle, so the hover border stays visible in
  light mode instead of disappearing against a near-white surface.
- **Shimmer Mid** (`#221d17` dark / `#e8e2d6` light): the moving highlight band in the loading
  skeleton. Lighter than Raised Surface in dark mode, darker than it in light mode, since a single
  literal value can't sweep correctly in both directions.

### Named Rules
**The One Accent Rule.** Warm Amber is the only saturated color anywhere in the interface. If a
second color is ever needed, desaturate it into the neutral ramp before reaching for a new hue.

**The Dual Surface Rule.** Dark and light are both fully specified token sets, swapped via
`[data-theme='light']`, not a dark theme with light values bolted on as an afterthought. Every
token (`bg`, `bg-raised`, `line`, `ink`, `ink-dim`, `accent`, `accent-ink`, `shadow`, `overlay`)
has a confirmed value in both themes.

## 3. Typography

**Display Font:** Fraunces (serif)
**Body Font:** Outfit (sans), with system-UI fallbacks

**Character:** A single deliberate contrast pair: one serif moment for the page title, one
geometric-humanist sans for every interface element. The pairing reads as gallery-wall didactic
text, not a five-font marketing stack.

### Hierarchy
- **Display** (weight 500, `clamp(2.6rem, 5vw, 4rem)`, line-height 1.02, letter-spacing -0.01em):
  Fraunces. Used exactly once per page, the "The Gallery" headline. Never used for body copy or
  smaller UI text.
- **Body** (weight 400, 1rem, line-height 1.6): Outfit. Subtitle copy and lightbox metadata.
- **Label** (weight 500, 0.68-0.85rem, letter-spacing 0.04-0.16em, uppercase for eyebrow/platform
  tags): Outfit. Tile platform tags, the eyebrow, pill filters, perf-panel category labels.

### Named Rules
**The One Serif Rule.** Fraunces appears in exactly one place: the page `<h1>`. Every other text
element, including other headings like empty-state titles, uses Outfit. Serif is a signature
moment, not a typeface family in general rotation.

## 4. Elevation

This system uses **persistent layered elevation**, not a flat-by-default model: every raised
surface (gallery tile, the speed-test panel, the lightbox) carries a soft resting shadow at all
times, which deepens further on hover or focus as direct feedback. Depth is always present, not
something that only appears on interaction.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 10px 24px -18px var(--shadow-resting)`): the default state for
  tiles and panels. Faint, warm-tinted (never pure black), present at rest.
- **Lifted** (`box-shadow: 0 18px 36px -18px var(--shadow)`): hover/focus state for gallery tiles.
  Combined with `translateY(-3px)` and, on media, a `scale(1.04)` zoom.
- **Modal** (`box-shadow: 0 24px 60px -24px var(--shadow)`): the lightbox surface, which is always
  rendered "above" the page and should read as clearly elevated even though it has no hover state
  of its own.

### Named Rules
**The Always-Lit Rule.** Nothing on this surface is perfectly flat. If a component is a tile,
panel, or modal, it has a resting shadow before any interaction occurs; hover/focus deepen it,
they don't introduce it from nothing.

## 5. Components

Components are **quiet and considered**: minimal chrome, pill shapes for anything clickable that
isn't a tile, restrained single-pixel hairline borders, and the amber accent appearing only where
it signals state (active, fastest, focused) rather than as decoration.

### Buttons
- **Shape:** Pill (`border-radius: 999px`).
- **Primary** (`button-primary`): Warm Amber background, Accent Ink text, `9px 18px` padding.
  Used once per panel for the single primary action ("Run speed test").
- **Hover / Focus:** Primary buttons dim to 88% opacity on hover; all interactive elements get a
  2px Warm Amber `outline` with 2-3px offset on `:focus-visible`, never a default browser outline.
- **Disabled:** 50% opacity, `cursor: not-allowed`, no hover state.

### Pills / Filters
- **Style** (`pill-filter`): transparent background, single hairline border in `line`, Ink Dim
  text.
- **Active state** (`pill-filter-active`): fills with Warm Amber, text flips to Accent Ink. Used
  for the platform filter and the theme/service controls' visual language, never combined with a
  border once active.
- **Touch target:** `min-height: 44px` regardless of the visual text size; the pill stays compact
  horizontally but is never shorter than 44px tall. The theme toggle and lightbox close button
  follow the same 44×44px floor.

### Tiles (Signature Component)
The bento gallery tile is the system's most distinctive component: media fills the entire cell
edge-to-edge (`position: absolute; inset: 0`), with no separate thumbnail-plus-caption layout.
Metadata (asset ID, platform) sits in a bottom gradient scrim
(`linear-gradient(to top, rgba(0,0,0,0.65), transparent)`) so every cell, regardless of its bento
span (1×1, 1×2, 2×1, 2×2), stays a clean rectangle with no dead space below the image. Resting
elevation per the Always-Lit Rule; lifts and the media zooms 4% on hover.

### Inputs / Fields
- **Style:** Raised Surface background, single hairline border, pill radius, with a Hugeicons
  search glyph (`currentColor`) inset on the left rather than a placeholder icon font.
- **Focus:** Border shifts to Warm Amber with a soft `0 0 0 3px` amber-tinted glow, no layout
  shift.

### Modals
- **Lightbox:** Raised Surface background, hairline border, Modal-tier shadow, centered over a
  blurred dark scrim (`backdrop-filter: blur(6px)`). Close action is a circular icon button, never
  a bare text glyph.

## 6. Do's and Don'ts

### Do:
- **Do** keep Warm Amber to a single accent role; every other color stays in the neutral ramp.
- **Do** give every tile, panel, and modal a resting shadow per the Always-Lit Rule, even with no
  interaction.
- **Do** reserve Fraunces for the one page `<h1>`; everything else is Outfit.
- **Do** render media full-bleed in gallery tiles with a gradient-scrim caption, never a separate
  caption bar.
- **Do** use Hugeicons SVG icons (`@hugeicons/react` + `@hugeicons/core-free-icons`) for every
  icon need; never emoji or raw unicode glyphs (☀, ☽, ×, ▶) as interface icons.
- **Do** verify every text/background color pairing against both themes at 4.5:1 before shipping;
  a token that passes in dark mode can fail in light mode at the same nominal "dim" role.
- **Do** keep every real tap target (not decorative icons) at a 44×44px floor, even when the
  visual chrome is intentionally compact; grow the hit area with `min-height`/`min-width` rather
  than visually bloating the element if the two are in tension.

### Don't:
- **Don't** introduce a second saturated accent color; desaturate into the neutral ramp instead.
- **Don't** build a generic SaaS dashboard look: no blue/purple gradient admin chrome.
- **Don't** use identical equal-sized card grids; the bento span rhythm (2×2 feature cells among
  singles) is the deliberate alternative.
- **Don't** default to a cream/beige body background; the ground tokens are off-black/off-white
  with a controlled warm cast, not a "safe" pastel.
- **Don't** scatter uppercase tracked eyebrows above every section; the system uses exactly one
  eyebrow, above the page title.
- **Don't** use `border-left`/`border-right` colored stripes as an accent technique anywhere.
- **Don't** hardcode a literal color (a hex or `rgba()` value typed directly in CSS) anywhere a
  token already exists for that role; it silently breaks the theme it wasn't tested against. The
  skeleton shimmer, hover borders, and select-caret bugs found in `/impeccable audit` all had this
  one root cause.
