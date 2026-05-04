# Design System Document: High-End Editorial Strategy

## 1. Overview & Creative North Star: "The Diplomatic Gallery"

This design system is built to transcend the standard "sports app" aesthetic. Instead of a cluttered grid of scores and stats, we are creating **The Diplomatic Gallery**.

The Creative North Star for this system is a fusion of premium international journalism and high-end architectural wayfinding. We treat the 2026 World Cup not just as a tournament, but as a prestigious global summit. The experience must feel "curated" rather than "populated." We achieve this through a "High-End Editorial" approach: utilizing extreme typographic scale, intentional asymmetry, and a tonal layering system that favors depth and breath over rigid borders and lines.

---

## 2. Color Strategy: Organic Depth

The palette is a sophisticated tri-national harmony anchored by an organic, cream-based foundation.

### The Foundation

- **Surface & Background (`#fbfbe2`):** This is our "Canvas." It is a distinguished, organic cream that feels like premium heavy-stock paper. It provides a warmer, more humanistic feel than sterile white.
- **The Tonal Hierarchy:** We utilize the `surface-container` tiers (Lowest to Highest) to define hierarchy. Importance is signaled by how "close" a surface feels to the user.

### The Accents

- **Primary (Verde México - `#004e34`):** Our anchor color. Used for high-priority actions and brand-defining moments.
- **Secondary (Azul Profundo - `#465f88`):** Used for analytical data, secondary navigation, and "trusted" information.
- **Tertiary (Rojo Canadá - `#8b0700`):** Reserved for high-energy moments, live indicators, and critical alerts.

### The "No-Line" Rule

**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be achieved through:

1.  **Background Color Shifts:** Placing a `surface-container-low` component on a `surface` background.
2.  **Negative Space:** Using the spacing scale to create "invisible" boundaries.
3.  **Tonal Transitions:** Subtle shifts between container tiers to imply a change in context.

### The Glass & Gradient Rule

To ensure the UI feels "Ultra-Modern," use Glassmorphism for floating elements (e.g., sticky headers, floating action buttons). Use `surface` colors with a 70-80% opacity and a `20px` backdrop-blur.
**Signature Texture:** For hero backgrounds or primary CTAs, utilize a subtle linear gradient from `primary` (`#004e34`) to `primary-container` (`#006847`) at a 135-degree angle. This adds "soul" and prevents the flat-corporate look.

---

## 3. Typography: Editorial Authority

We utilize a high-contrast type pairing to balance "Sporting Energy" with "Corporate Prestige."

- **Headlines (Plus Jakarta Sans):** Our "Voice." This typeface is bold, modern, and expansive.
  - **Display-LG/MD:** Use for hero statements and major scores. Treat these as graphic elements—don't be afraid of tight tracking (-2%) or overlapping images.
  - **Headline-LG/MD:** Used for section titles. These should command the page.
- **Data & Body (Inter):** Our "Intel." A highly legible, neutral sans-serif.
  - **Body-LG/MD:** Used for all editorial content. Maintain a generous line-height (1.6) to ensure the "Premium" feel.
  - **Label-MD/SM:** Used for technical data (match minutes, player stats). Use uppercase with increased letter-spacing (+5%) for a "technical-luxury" look.

---

## 4. Elevation & Depth: Tonal Layering

Depth in this design system is achieved through "Tonal Stacking" rather than traditional drop shadows.

- **The Layering Principle:**
  - Base: `surface`
  - Sectioning: `surface-container-low`
  - Interactive Cards: `surface-container-lowest` (to create a soft "lift" against a darker section).
- **Ambient Shadows:** If an element must float (e.g., a modal or a floating nav), use an ambient shadow.
  - **Color:** Use a tinted version of `on-surface` (e.g., `#1b1d0e` at 6% opacity).
  - **Blur:** High diffusion (minimum 24px blur).
- **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Component Guidelines

### Buttons (The "Jewel" Strategy)

- **Primary:** Solid `primary` (`#004e34`) with `on-primary` (`#ffffff`) text. Roundedness: `md` (`0.375rem`). No border.
- **Secondary:** `surface-container-high` background with `on-secondary-container` text. This feels integrated into the page.
- **Tertiary:** Ghost style. No background; text in `primary` with a `primary` icon.

### Cards & Lists (The "Breathable" Grid)

- **Rule:** Forbid divider lines.
- **Implementation:** Separate list items using `12px` of vertical whitespace. Use a subtle `surface-variant` hover state that fades in smoothly (200ms).
- **Cards:** Use `surface-container-lowest` for cards to make them appear "crisp" against the organic cream background.

### Inputs & Fields

- **Styling:** Use a "filled" style using `surface-container-high`.
- **Focus State:** Instead of a thick border, use a 2px bottom-accent in `primary`.

### Specialized Platform Components

- **Momentum Tracker:** A glass-morphic container using `surface-tint` at 10% opacity with a heavy backdrop blur to display live match statistics over photography.
- **National Identity Chips:** Use the three accent colors (`primary`, `secondary`, `tertiary`) with `0.125rem` (sm) roundedness to represent Mexico, USA, and Canada respectively in data visualizations.

---

## 6. Do's and Don'ts

### Do:

- **Embrace Asymmetry:** Align a headline to the left but place the supporting data in a 2/3 column to the right.
- **Use Oversized Imagery:** Let photography of stadiums and players bleed off the edge of the screen to create a sense of scale.
- **Respect the Cream:** Ensure the `#fbfbe2` background has enough "room to breathe." High-end design is defined by what you _don't_ put on the page.

### Don't:

- **Don't use pure black:** Use `on-background` (`#1b1d0e`) for text. It is softer and more premium.
- **Don't use 1px dividers:** It breaks the editorial flow and makes the platform look like a spreadsheet.
- **Don't use default "Card" shadows:** Avoid the "fuzzy grey box" look. Use tonal shifts first, shadows second.
- **Don't crowd the data:** If showing match stats, increase the padding-block to at least `24px` between rows.
