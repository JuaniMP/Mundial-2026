# Design Source — Stitch / Figma exports

Mockups HTML originales exportados de Stitch (Figma → HTML/Tailwind). **Son referencia, no se cargan en producción.** Sirven para verificar pixel-fidelity al implementar componentes en `apps/web/`.

## Mockups

| Pantalla | Carpeta |
|---|---|
| Dashboard *(Un Mundial para Todos)* | [`stitch_un_mundial_para_todos_experience/dashboard_un_mundial_para_todos/`](stitch_un_mundial_para_todos_experience/dashboard_un_mundial_para_todos/) |
| Stadium Experience | [`stitch_un_mundial_para_todos_experience/the_stadium_experience/`](stitch_un_mundial_para_todos_experience/the_stadium_experience/) |
| Stadium Detailed Heatmap | [`stitch_un_mundial_para_todos_experience/the_stadium_experience_detailed_heatmap/`](stitch_un_mundial_para_todos_experience/the_stadium_experience_detailed_heatmap/) |
| Album Digital 2026 | [`stitch_un_mundial_para_todos_experience/lbum_digital_2026/`](stitch_un_mundial_para_todos_experience/lbum_digital_2026/) |
| Superpolla Clasificación 1 | [`stitch_un_mundial_para_todos_experience/superpolla_clasificaci_n_1/`](stitch_un_mundial_para_todos_experience/superpolla_clasificaci_n_1/) |
| Superpolla Clasificación 2 | [`stitch_un_mundial_para_todos_experience/superpolla_clasificaci_n_2/`](stitch_un_mundial_para_todos_experience/superpolla_clasificaci_n_2/) |
| Horizon 26 | [`stitch_un_mundial_para_todos_experience/horizon_26/`](stitch_un_mundial_para_todos_experience/horizon_26/) — incluye DESIGN.md original |

Cada carpeta contiene:

- `code.html` — markup Tailwind exportado (**referencia visual, no se importa**).
- `screen.png` — screenshot del diseño en alta.

## Reglas

- **No** importar estos HTML directamente al app. Reimplementar como componentes React tipados que respeten [`docs/design-system/DESIGN.md`](../design-system/DESIGN.md).
- Si la implementación se desvía del mockup, documentar la razón en el PR.
- Estos archivos están marcados como `linguist-vendored` en `.gitattributes` para no contaminar el lenguaje detectado del repo.

## ¿Cómo regenerar?

Si vuelve a actualizarse en Stitch:

1. Exportar el zip nuevo.
2. Descomprimir aquí, sobreescribiendo.
3. Borrar el zip (no se versiona — `.gitignore` ya lo bloquea).
4. Actualizar este README si cambiaron pantallas.
