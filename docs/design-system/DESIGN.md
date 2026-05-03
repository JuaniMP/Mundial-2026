# Design System Document: High-End Editorial Strategy

> Sistema de diseño *"Diplomatic Gallery"* para la plataforma Mundial 2026.
> Tokens implementados en [`tokens.md`](tokens.md) y `apps/web/tailwind.config.ts`.

## 1. Overview & Creative North Star: "The Diplomatic Gallery"

This design system is built to transcend the standard "sports app" aesthetic. Instead of a cluttered grid of scores and stats, we are creating **The Diplomatic Gallery**.

The Creative North Star for this system is a fusion of premium international journalism and high-end architectural wayfinding. We treat the 2026 World Cup not just as a tournament, but as a prestigious global summit. The experience must feel "curated" rather than "populated." We achieve this through a "High-End Editorial" approach: utilizing extreme typographic scale, intentional asymmetry, and a tonal layering system that favors depth and breath over rigid borders and lines.

---

## 2. Color Strategy: Organic Depth

The palette is a sophisticated tri-national harmony anchored by an organic, cream-based foundation.

### The Foundation

- **Surface & Background (`#fbfbe2`):** Our "Canvas." A distinguished, organic cream that feels like premium heavy-stock paper. Warmer and more humanistic than sterile white.
- **The Tonal Hierarchy:** We utilize the `surface-container` tiers (Lowest to Highest) to define hierarchy. Importance is signaled by how "close" a surface feels to the user.

### The Accents

- **Primary (Verde México · `#004e34`):** Anchor color. High-priority actions and brand-defining moments.
- **Secondary (Azul Profundo · `#465f88`):** Analytical data, secondary navigation, "trusted" information.
- **Tertiary (Rojo Canadá · `#8b0700`):** Reserved for high-energy moments, live indicators, critical alerts.

### The "No-Line" Rule

**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be achieved through:

1. **Background Color Shifts** — placing a `surface-container-low` component on a `surface` background.
2. **Negative Space** — using the spacing scale to create "invisible" boundaries.
3. **Tonal Transitions** — subtle shifts between container tiers to imply a change in context.

### The Glass & Gradient Rule

To ensure the UI feels "Ultra-Modern," use Glassmorphism for floating elements (e.g., sticky headers, floating action buttons). Use `surface` colors with a 70-80% opacity and a `20px` backdrop-blur.

**Signature Texture:** For hero backgrounds or primary CTAs, utilize a subtle linear gradient from `primary` (`#004e34`) to `primary-container` (`#006847`) at a 135-degree angle.

---

## 3. Typography: Editorial Authority

We utilize a high-contrast type pairing to balance "Sporting Energy" with "Corporate Prestige."

- **Headlines (Plus Jakarta Sans):** Our "Voice." Bold, modern, expansive.
  - **Display-LG/MD:** Hero statements and major scores. Treat as graphic elements — tight tracking (-2%), overlap with images.
  - **Headline-LG/MD:** Section titles. Should command the page.
- **Data & Body (Inter):** Our "Intel." Highly legible, neutral sans-serif.
  - **Body-LG/MD:** All editorial content. Generous line-height (1.6).
  - **Label-MD/SM:** Technical data (match minutes, player stats). Uppercase with +5% letter-spacing for "technical-luxury."

---

## 4. Elevation & Depth: Tonal Layering

Depth is achieved through "Tonal Stacking" rather than traditional drop shadows.

- **The Layering Principle:**
  - Base: `surface`
  - Sectioning: `surface-container-low`
  - Interactive Cards: `surface-container-lowest` (soft "lift" against a darker section).
- **Ambient Shadows:** If an element must float (e.g., modal, floating nav), use ambient shadow.
  - **Color:** Tinted `on-surface` (e.g., `#1b1d0e` at 6% opacity).
  - **Blur:** High diffusion (≥24px).
- **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline-variant` at 15% opacity. Felt, not seen.

---

## 5. Component Guidelines

### Buttons (The "Jewel" Strategy)

- **Primary:** Solid `primary` (`#004e34`) with `on-primary` (`#ffffff`) text. Roundedness `md` (0.375rem). No border.
- **Secondary:** `surface-container-high` background with `on-secondary-container` text.
- **Tertiary:** Ghost. No background; text in `primary` with a `primary` icon.

### Cards & Lists (The "Breathable" Grid)

- **Rule:** Forbid divider lines.
- **Implementation:** Separate list items using 12px vertical whitespace. Subtle `surface-variant` hover (200ms).
- **Cards:** Use `surface-container-lowest` for cards to appear "crisp" against the organic cream.

### Inputs & Fields

- **Styling:** "Filled" using `surface-container-high`.
- **Focus State:** Instead of thick border, 2px bottom-accent in `primary`.

### Specialized Platform Components

- **Momentum Tracker:** Glass-morphic container using `surface-tint` at 10% opacity, heavy backdrop blur, displaying live match stats over photography.
- **National Identity Chips:** Three accent colors (`primary`, `secondary`, `tertiary`) with 0.125rem (sm) roundedness representing Mexico, USA, Canada in data viz.

---

## 6. Do's and Don'ts

### Do

- **Embrace Asymmetry** — align a headline left, supporting data in a 2/3 column right.
- **Use Oversized Imagery** — let stadium and player photography bleed off edges for scale.
- **Respect the Cream** — `#fbfbe2` background needs room to breathe. High-end is defined by what you don't put on the page.

### Don't

- **Don't use pure black** — use `on-background` (`#1b1d0e`). Softer, more premium.
- **Don't use 1px dividers** — breaks editorial flow, looks like a spreadsheet.
- **Don't use default "Card" shadows** — avoid the "fuzzy grey box." Tonal shifts first, shadows second.
- **Don't crowd the data** — match stats need ≥24px padding-block between rows.
