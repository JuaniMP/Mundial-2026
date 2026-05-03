# Runbooks

Procedimientos operativos paso-a-paso. Lo que harías a las 3am cuando algo se rompe.

Reglas:

- **Cada runbook resuelve un problema concreto.** Un runbook = un disparador.
- **Pasos atómicos**, ejecutables, con comandos copy-pasteables.
- **Pre-condiciones explícitas** (acceso a tal sistema, rol X, etc.).
- **Post-validación obligatoria** — cómo confirmas que el problema se fue.

## Catálogo

| Runbook | Disparador |
|---|---|
| _(pendientes hasta que tengamos prod)_ | — |

## Plantilla mínima

```markdown
# Runbook: <Disparador en una frase>

**Severidad típica:** P1 / P2 / P3
**Tiempo esperado:** N minutos
**Pre-requisitos:** acceso a X, rol Y

## Síntomas
- ...

## Diagnóstico
1. Verificar X (`comando`).
2. Si A → ir a paso 5. Si B → ir a paso 7.

## Mitigación
1. ...
2. ...

## Validación
- [ ] X funciona.
- [ ] Métrica Y < umbral.

## Post-mortem
- Crear incidente en `docs/incidents/YYYY-MM-DD-<slug>.md`.
```
