# Componentes — guía rápida

Inventario inicial. Cada componente vive en `apps/web/src/components/ui/` y debe respetar [DESIGN.md](DESIGN.md) y [tokens.md](tokens.md).

## Inventario base

| Componente | Status | Archivo |
|---|---|---|
| `<Button>` | 📐 Spec | `apps/web/src/components/ui/Button.tsx` |
| `<Card>` | 📐 Spec | `apps/web/src/components/ui/Card.tsx` |
| `<Chip>` (national identity) | 📐 Spec | `apps/web/src/components/ui/Chip.tsx` |
| `<Input>` (filled) | 📐 Spec | `apps/web/src/components/ui/Input.tsx` |
| `<NavBar>` | 📐 Spec | `apps/web/src/components/layout/NavBar.tsx` |
| `<MomentumTracker>` | 📐 Spec | `apps/web/src/components/domain/MomentumTracker.tsx` |
| `<StadiumHeatmap>` | 🚧 TBD | `apps/web/src/components/domain/StadiumHeatmap.tsx` |
| `<StickerCard>` | 🚧 TBD | `apps/web/src/components/domain/StickerCard.tsx` |
| `<Leaderboard>` | 🚧 TBD | `apps/web/src/components/domain/Leaderboard.tsx` |

Status: 📐 Spec · 🚧 TBD · ✅ Done · 🐛 Bug

## Reglas

- Nada de bordes 1px (regla del design system).
- Variantes vía prop `variant`, no clases CSS arbitrarias.
- Cada componente expone sus props con TSDoc.
- Tests en `Componente.test.tsx` junto al archivo.
- Storybook story (cuando se agregue Storybook) en `Componente.stories.tsx`.
