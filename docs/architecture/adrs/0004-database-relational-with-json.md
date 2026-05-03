# ADR-0004: Base de datos — MySQL relacional + JSON payload para tipos heterogéneos

**Status:** Accepted
**Date:** 2026-05-02
**Deciders:** Tech Lead, Arquitecto, DBA

## Context

El módulo de **transacciones** del usuario (compra de packs, recompensas, registros de gasto, deudas, transferencias) tiene un núcleo común (`id`, `user_id`, `type`, `amount`, `currency`, `occurred_at`, `status`) y atributos específicos por tipo. La pregunta abierta: ¿una tabla "fat" con muchos NULLs, una tabla por tipo, o un documento Mongo con shape libre?

El dominio es **financiero**: ACID es no-negociable, los reportes agregados (totales por mes, balance, leaderboard) son frecuentes, y la auditoría es regulatoria.

## Decision

**MySQL 8 como base relacional única, con tabla `transactions` que combina columnas comunes + columna `payload JSON` para los atributos específicos del tipo.** Atributos del payload con alta frecuencia de query se *promueven* a columnas reales con índices conforme aparecen.

No usar MongoDB como almacén primario. Sí permitido como cache de lectura desnormalizada o event log analítico, pero la fuente de verdad es relacional.

## Options Considered

### Option A — Single Table Inheritance (tabla fat con NULLs)

**Pros:** Una sola tabla; queries simples.
**Cons:** Esquema explota a 30+ columnas; muchos NULLs; reglas tipo "deuda obliga `acreedor_id`" no se pueden expresar con CHECK simples; índices caros.

### Option B — Class Table Inheritance (tabla base + subtabla por tipo)

**Pros:** Cada tipo respeta sus propias constraints (NOT NULL, FK); reportes rápidos sobre `transactions`.
**Cons:** Detalle = join al subtipo; agregar tipo = migración; ORM verboso.

### Option C — Híbrido: tabla base + columna `JSON payload` *(Decisión)*

**Pros:** ACID, FKs, joins y reportes preservados; flexibilidad documental contenida en `payload`; índices funcionales sobre claves del JSON cuando hace falta; agregar tipos = solo código (validación con JSON Schema en la app).
**Cons:** Validación del payload vive en la aplicación (Bean Validation + JSON Schema); querys agregadas sobre claves del JSON menos óptimas que sobre columnas — por eso se *promueven* las claves "calientes" a columnas reales con migración.

### Option D — MongoDB como almacén primario

**Pros:** Schema-flexible nativo, sharding sencillo.
**Cons:** Sin FKs reales, ACID multi-doc costoso, conciliación contable y reportes son más laboriosos. No para dominio financiero como fuente de verdad.

## Trade-off Analysis

El nudo es **flexibilidad de esquema vs integridad transaccional**. Como es dinero, integridad y reportes ganan. Entre las opciones relacionales, la híbrida (C) captura lo mejor de ambos mundos.

NULLs masivos pierden integridad y los reportes se complican. Tabla por tipo es correcta pero ceremoniosa. Híbrido es lo que usan ledgers modernos (Stripe, Plaid).

Sobre la pregunta original *"¿NULLs o documento libre?"*: ninguna pura. El híbrido es la respuesta práctica.

## Consequences

**Más fácil:**
- Agregar tipos sin migrar esquema.
- Reportes y conciliaciones con SQL clásico.
- Auditoría con `transaction_events` append-only.
- Double-entry contable con `INSERT` atómicos.

**Más difícil:**
- Validación del `payload`: requiere JSON Schema por tipo y disciplina.
- Promoción de claves del payload a columnas reales cuando se vuelven calientes (trabajo recurrente, planificable).

**Revisitar:**
- Si llegamos a >50K tps sostenidos en write, evaluar partitioning por mes/usuario o ledger dedicado tipo TigerBeetle.
- Si surge una vista analítica masiva, replicar a un warehouse (Snowflake/BigQuery).

## Esquema base

```sql
CREATE TABLE transactions (
  id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT       NOT NULL,
  account_id      BIGINT       NULL,
  type            VARCHAR(32)  NOT NULL,
  amount          DECIMAL(19,4) NOT NULL,
  currency        CHAR(3)      NOT NULL,
  occurred_at     DATETIME(6)  NOT NULL,
  status          VARCHAR(16)  NOT NULL DEFAULT 'POSTED',
  payload         JSON         NULL,
  created_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version         INT          NOT NULL DEFAULT 0,
  CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users (id),
  INDEX idx_tx_user_time (user_id, occurred_at DESC),
  INDEX idx_tx_type (type),
  CONSTRAINT chk_tx_amount CHECK (amount >= 0)
) ENGINE=InnoDB;

-- Índice funcional sobre clave caliente del payload (ejemplo: categoría):
-- ALTER TABLE transactions ADD INDEX idx_tx_categoria ((CAST(payload->>'$.categoria_id' AS UNSIGNED)));
```

## Action Items

1. [ ] Crear migración Flyway `V1__create_transactions.sql`.
2. [ ] Definir JSON Schema por cada `type` en `apps/api/src/main/resources/schemas/`.
3. [ ] Implementar validador de payload en `TransactionService` con `networknt/json-schema-validator`.
4. [ ] Crear tabla `transaction_events` append-only para auditoría.
5. [ ] Documentar política de promoción payload → columna en `docs/runbooks/transactions-schema-evolution.md`.
