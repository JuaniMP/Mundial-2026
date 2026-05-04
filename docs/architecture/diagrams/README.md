# Diagramas

Los 4 diagramas oficiales del proyecto viven aquí en formato `.drawio`. Se editan con [draw.io](https://app.diagrams.net) o con la extensión de VS Code.

## Catálogo

| #   | Archivo                                                    | Tipo                    | Qué muestra                                                                                                                                                       |
| --- | ---------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | [`DiagramaContexto.drawio`](DiagramaContexto.drawio)       | Contexto C4 nivel 1     | Sistema central + 11 actores: Aficionados, Operadores, Soporte, Compliance, Admin, Firebase/FCM, SendGrid, Splunk/ElasticSearch, API FIFA, Pasarela de pagos.     |
| 2   | [`DiagramaDePaquetes.drawio`](DiagramaDePaquetes.drawio)   | UML de paquetes (capas) | Arquitectura por capas: Presentación · Aplicación (RFs) · Dominios · Integraciones · Infra técnica · Utilidades. Numera los 26 RFs por módulo.                    |
| 3   | [`Modelo E-R.drawio`](Modelo%20E-R.drawio)                 | E-R clásico             | Entidades, atributos y relaciones del dominio (Usuario, Rol, Polla, Predicción, Partido, Estadio, Selección, Lámina, Álbum, Paquete, Intercambio, Entrada, etc.). |
| 4   | [`ModeloE-R-Extendido.drawio`](ModeloE-R-Extendido.drawio) | E-R extendido           | Versión enriquecida con cardinalidades, atributos compuestos y entidades débiles. Es el que alimenta `backend/src/main/resources/schema.sql`.                     |

## Cómo se generan los archivos físicos en este folder

Como las herramientas de archivo no copian binarios grandes, hay un paso manual. **Una sola vez**, ejecuta en PowerShell desde la raíz del repo:

```powershell
$src = "$env:APPDATA\Claude\local-agent-mode-sessions\7f979f65-2b7a-4ce1-8837-a12228a2f935\7283efba-3a9b-4ed1-abbf-ca972bb0690e\local_325eec8e-ae66-444a-a4c9-51ff638c0aec\uploads"
$dst = "docs\architecture\diagrams"
Copy-Item "$src\DiagramaContexto.drawio"     $dst -Force
Copy-Item "$src\DiagramaDePaquetes.drawio"   $dst -Force
Copy-Item "$src\Modelo E-R.drawio"           $dst -Force
Copy-Item "$src\ModeloE-R-Extendido.drawio"  $dst -Force
```

Si los uploads viven en otra ruta, cambia `$src` por la real (revisa la ruta donde Claude guardó los uploads del chat).

## ¿Por qué `.drawio` y no PNG?

- **Texto/XML diff-friendly:** los cambios se ven en pull requests.
- **Editables sin perder calidad:** abres, cambias una caja, guardas.
- **Live preview en GitHub:** GitHub renderiza `.drawio` automáticamente.
- **Exportable a PNG/SVG/PDF** desde el editor cuando hace falta para entregables.

## Convenciones

- Numeración consecutiva si agregas nuevos: `01-...drawio`, `02-...drawio` (no es obligatorio para los actuales por compatibilidad histórica).
- Usa **C4 nivel 1 (Contexto)** y **nivel 2 (Containers)** para visión sistema. Más bajo nivel solo si aporta — preferimos código limpio sobre over-documentation.
- Para diagramas de secuencia y flujo, también pueden ir en Mermaid embebido en `ARCHITECTURE.md` (texto, super diff-friendly).

## Diagramas embebidos en Markdown

Estos viven dentro de [`../ARCHITECTURE.md`](../ARCHITECTURE.md) como Mermaid:

- Contexto C4 nivel 1 (versión Mermaid del DiagramaContexto)
- Contenedores C4 nivel 2
- Modelo ER alto nivel
- Secuencia: predicción de partido
- Secuencia: apertura de pack del álbum

Si actualizas un diagrama .drawio significativo, **espeja el cambio** en su versión Mermaid del ARCHITECTURE para que el README siga siendo navegable sin abrir draw.io.
