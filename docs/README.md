# Documentación — Mundial 2026

Esta carpeta es el cerebro del proyecto. Si tienes una pregunta, empieza aquí.

## Mapa

| Carpeta | Contenido |
|---|---|
| [`architecture/`](architecture/) | Visión técnica, ADRs, diagramas C4 |
| [`design-system/`](design-system/) | DESIGN.md, tokens, guías de componentes |
| [`product/`](product/) | Specs funcionales, user stories, checklists |
| [`runbooks/`](runbooks/) | Cómo operar en producción |
| [`design-source/`](design-source/) | Mockups HTML originales del Stitch (Figma export) |

## Cómo navegar

- **Soy nuevo en el proyecto** → [`product/spec.md`](product/spec.md) → [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) → [`design-system/DESIGN.md`](design-system/DESIGN.md).
- **Voy a abrir un PR grande** → revisa los [ADRs](architecture/adrs/) relevantes y [`CONTRIBUTING.md`](../CONTRIBUTING.md).
- **Voy a deployar** → [`runbooks/`](runbooks/).
- **Voy a tomar una decisión técnica importante** → copia [`architecture/adrs/0000-template.md`](architecture/adrs/0000-template.md).

## Reglas

- Doc desactualizada > sin doc. Si encuentras algo viejo, **arréglalo** o márcalo como `> ⚠️ Outdated as of YYYY-MM-DD`.
- Los Markdown se versionan junto al código que documentan.
- Los diagramas se hacen en Mermaid (texto, diff-friendly) cuando sea posible.
