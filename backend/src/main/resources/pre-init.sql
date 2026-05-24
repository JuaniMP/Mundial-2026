-- Pre-Hibernate cleanup: drops tables whose schema changed and need to be
-- recreated by Hibernate ddl-auto=update from scratch.
-- This file runs BEFORE Hibernate DDL (spring.sql.init runs first).
-- Tables listed here MUST have JPA entities so Hibernate recreates them.

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS entradas;
DROP TABLE IF EXISTS partidos;
DROP TABLE IF EXISTS jugadores;
DROP TABLE IF EXISTS selecciones;
DROP TABLE IF EXISTS estadios;
DROP TABLE IF EXISTS sedes;
DROP TABLE IF EXISTS reportes_interaccion_api;
DROP TABLE IF EXISTS aliados_comerciales;
SET FOREIGN_KEY_CHECKS = 1;
