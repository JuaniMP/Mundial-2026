# Design Tokens

Single source of truth para colores, tipografía, espaciado y radios. Estos valores se reflejan 1:1 en `apps/web/tailwind.config.ts` y `apps/web/src/styles/globals.css`.

## Color tokens

### Brand

| Token                       | Hex       | Uso                                                     |
| --------------------------- | --------- | ------------------------------------------------------- |
| `--color-primary`           | `#004e34` | Verde México · CTAs, brand                              |
| `--color-primary-container` | `#006847` | Gradiente del primary                                   |
| `--color-on-primary`        | `#ffffff` | Texto sobre primary                                     |
| `--color-secondary`         | `#465f88` | Azul Profundo · datos analíticos, navegación secundaria |
| `--color-on-secondary`      | `#ffffff` | Texto sobre secondary                                   |
| `--color-tertiary`          | `#8b0700` | Rojo Canadá · live, alertas críticas                    |
| `--color-on-tertiary`       | `#ffffff` | Texto sobre tertiary                                    |

### Surface

| Token                               | Hex       | Uso                        |
| ----------------------------------- | --------- | -------------------------- |
| `--color-surface`                   | `#fbfbe2` | Background base ("Canvas") |
| `--color-surface-container-lowest`  | `#ffffff` | Cards crisp                |
| `--color-surface-container-low`     | `#f5f5d6` | Sectioning                 |
| `--color-surface-container`         | `#efefca` | Containers neutros         |
| `--color-surface-container-high`    | `#e9e9be` | Inputs filled              |
| `--color-surface-container-highest` | `#e3e3b2` | —                          |

### Foreground

| Token                        | Hex       | Uso                                  |
| ---------------------------- | --------- | ------------------------------------ |
| `--color-on-background`      | `#1b1d0e` | Texto principal (NO pure black)      |
| `--color-on-surface-variant` | `#46483a` | Texto secundario                     |
| `--color-outline`            | `#777867` | Outlines visibles                    |
| `--color-outline-variant`    | `#c7c8b3` | "Ghost border" (usar al 15% opacity) |

## Typography

| Token                | Familia           | Tamaño          | Line height | Tracking        |
| -------------------- | ----------------- | --------------- | ----------- | --------------- |
| `--font-display-lg`  | Plus Jakarta Sans | 4rem (64px)     | 1.05        | -2%             |
| `--font-display-md`  | Plus Jakarta Sans | 3rem (48px)     | 1.1         | -2%             |
| `--font-headline-lg` | Plus Jakarta Sans | 2.25rem (36px)  | 1.15        | -1%             |
| `--font-headline-md` | Plus Jakarta Sans | 1.75rem (28px)  | 1.2         | -1%             |
| `--font-body-lg`     | Inter             | 1.125rem (18px) | 1.6         | 0               |
| `--font-body-md`     | Inter             | 1rem (16px)     | 1.6         | 0               |
| `--font-label-md`    | Inter             | 0.875rem (14px) | 1.4         | +5% (uppercase) |
| `--font-label-sm`    | Inter             | 0.75rem (12px)  | 1.4         | +5% (uppercase) |

## Spacing

Escala 4-base (en `rem`):

| Token        | Valor   | px  |
| ------------ | ------- | --- |
| `--space-1`  | 0.25rem | 4   |
| `--space-2`  | 0.5rem  | 8   |
| `--space-3`  | 0.75rem | 12  |
| `--space-4`  | 1rem    | 16  |
| `--space-6`  | 1.5rem  | 24  |
| `--space-8`  | 2rem    | 32  |
| `--space-12` | 3rem    | 48  |
| `--space-16` | 4rem    | 64  |
| `--space-24` | 6rem    | 96  |

## Radius

| Token         | Valor          | Uso                         |
| ------------- | -------------- | --------------------------- |
| `--radius-sm` | 0.125rem (2px) | Chips de identidad nacional |
| `--radius-md` | 0.375rem (6px) | Botones                     |
| `--radius-lg` | 0.75rem (12px) | Cards                       |
| `--radius-xl` | 1rem (16px)    | Modales                     |

## Shadow

| Token               | Valor                                |
| ------------------- | ------------------------------------ |
| `--shadow-ambient`  | `0 8px 24px rgba(27, 29, 14, 0.06)`  |
| `--shadow-floating` | `0 16px 48px rgba(27, 29, 14, 0.10)` |

## Motion

| Token             | Valor                          |
| ----------------- | ------------------------------ |
| `--duration-fast` | 150ms                          |
| `--duration-base` | 200ms                          |
| `--duration-slow` | 350ms                          |
| `--ease-out`      | `cubic-bezier(0.2, 0, 0, 1)`   |
| `--ease-in-out`   | `cubic-bezier(0.4, 0, 0.2, 1)` |

## Cómo se consumen

```tsx
// 1) Vía Tailwind (recomendado)
<button className="bg-primary text-on-primary rounded-md px-6 py-3">CTA</button>

// 2) Vía CSS variables
<div style={{ background: 'var(--color-surface-container-low)' }}>...</div>

// 3) NUNCA hardcodear
<div className="bg-[#004e34]">...</div>  // ❌ NO
```
