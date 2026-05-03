CREATE DATABASE IF NOT EXISTS mundial_2026_hub;
USE mundial_2026_hub;

-- ==========================================
-- 0. LIMPIEZA DE TABLAS (DROP IF EXISTS)
-- ==========================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reportes_compliance;
DROP TABLE IF EXISTS reportes_interaccion_api;
DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS logs_transaccionales;
DROP TABLE IF EXISTS incidentes_soporte;
DROP TABLE IF EXISTS intercambios_laminas;
DROP TABLE IF EXISTS paquetes;
DROP TABLE IF EXISTS laminas_album;
DROP TABLE IF EXISTS laminas;
DROP TABLE IF EXISTS albumes;
DROP TABLE IF EXISTS predicciones;
DROP TABLE IF EXISTS participantes_pollas;
DROP TABLE IF EXISTS pollas;
DROP TABLE IF EXISTS entradas;
DROP TABLE IF EXISTS partidos;
DROP TABLE IF EXISTS jugadores;
DROP TABLE IF EXISTS selecciones;
DROP TABLE IF EXISTS estadios;
DROP TABLE IF EXISTS sedes;
DROP TABLE IF EXISTS aliados_comerciales;
DROP TABLE IF EXISTS agentes_soporte;
DROP TABLE IF EXISTS operadores;
DROP TABLE IF EXISTS aficionados;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS administradores;

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. GESTIÓN DE ROLES Y USUARIOS (CORE)
-- ==========================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE -- AFICIONADO, OPERADOR, SOPORTE, COMPLIANCE, ADMIN, ALIADO
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    zona_horaria VARCHAR(50) DEFAULT 'UTC',
    id_rol INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login DATETIME,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES roles(id)
);

-- ==========================================
-- 1.1 PERFILES ESPECÍFICOS (HERENCIA 1:1)
-- ==========================================
CREATE TABLE aficionados (
    id_usuario INT PRIMARY KEY,
    seleccion_favorita VARCHAR(50),
    album_completitud_pct FLOAT DEFAULT 0,
    num_intercambios_diarios INT DEFAULT 0, -- Se puede resetear cada 24h por lógica de negocio
    CONSTRAINT fk_aficionado_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE operadores (
    id_usuario INT PRIMARY KEY,
    permisos_masivos BOOLEAN DEFAULT FALSE,
    permisos_carga BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_operador_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE agentes_soporte (
    id_usuario INT PRIMARY KEY,
    nivel_acceso VARCHAR(50) NOT NULL, -- Ej: 'NIVEL_1', 'NIVEL_2', 'ESPECIALISTA'
    casos_asignados INT DEFAULT 0,
    CONSTRAINT fk_soporte_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE aliados_comerciales (
    id_usuario INT PRIMARY KEY,
    nombre_empresa VARCHAR(100) NOT NULL,
    tipo_servicio VARCHAR(100) NOT NULL, -- ej. API Pagos, API Deportes
    token_acceso VARCHAR(255) UNIQUE,
    estado_api VARCHAR(50) DEFAULT 'ACTIVO',
    CONSTRAINT fk_aliado_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE administradores (
    id_usuario INT PRIMARY KEY,
    superadmin BOOLEAN DEFAULT FALSE, -- Para distinguir si es el dueño del chuzo o un admin de menor nivel
    departamento VARCHAR(100), -- Ej: 'Tecnología', 'Gerencia General'
    requiere_mfa BOOLEAN DEFAULT TRUE, -- Obligar a que tengan autenticación de dos factores por seguridad
    fecha_ultimo_cambio_clave DATETIME, -- Control de seguridad extra para obligarlos a rotar clave
    CONSTRAINT fk_admin_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);
-- ==========================================
-- 2. INFRAESTRUCTURA Y GEOGRAFÍA
-- ==========================================
CREATE TABLE sedes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ciudad VARCHAR(100) NOT NULL,
    pais VARCHAR(50) NOT NULL 
);

CREATE TABLE estadios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    capacidad INT NOT NULL,
    id_sede INT NOT NULL,
    CONSTRAINT fk_estadio_sede FOREIGN KEY (id_sede) REFERENCES sedes(id)
);

-- ==========================================
-- 3. SELECCIONES, JUGADORES Y PARTIDOS
-- ==========================================
CREATE TABLE selecciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pais VARCHAR(100) NOT NULL UNIQUE,
    codigo_fifa CHAR(3) NOT NULL UNIQUE,
    confederacion VARCHAR(50) NOT NULL,
    grupo CHAR(1) NOT NULL, 
    historial TEXT,
    bandera_url VARCHAR(255)
);

CREATE TABLE jugadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    posicion VARCHAR(50) NOT NULL,
    dorsal INT,
    fecha_nacimiento DATE,
    nacionalidad VARCHAR(100),
    minutos_jugados INT DEFAULT 0,
    goles INT DEFAULT 0,
    foto_url VARCHAR(255),
    id_seleccion INT NOT NULL,
    CONSTRAINT fk_jugador_seleccion FOREIGN KEY (id_seleccion) REFERENCES selecciones(id)
);

CREATE TABLE partidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora DATETIME NOT NULL,
    ronda VARCHAR(50) NOT NULL,
    estado VARCHAR(50) DEFAULT 'PROGRAMADO', 
    marcador_local INT DEFAULT 0,
    marcador_visitante INT DEFAULT 0,
    id_estadio INT NOT NULL,
    id_seleccion_local INT NOT NULL,
    id_seleccion_visitante INT NOT NULL,
    CONSTRAINT fk_partido_estadio FOREIGN KEY (id_estadio) REFERENCES estadios(id),
    CONSTRAINT fk_seleccion_local FOREIGN KEY (id_seleccion_local) REFERENCES selecciones(id),
    CONSTRAINT fk_seleccion_visitante FOREIGN KEY (id_seleccion_visitante) REFERENCES selecciones(id)
);

-- ==========================================
-- 4. GESTIÓN DE ENTRADAS
-- ==========================================
CREATE TABLE entradas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_qr VARCHAR(255) NOT NULL UNIQUE,
    categoria VARCHAR(50) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(50) NOT NULL, 
    id_partido INT NOT NULL,
    id_usuario_comprador INT,
    CONSTRAINT fk_entrada_partido FOREIGN KEY (id_partido) REFERENCES partidos(id),
    CONSTRAINT fk_entrada_usuario FOREIGN KEY (id_usuario_comprador) REFERENCES usuarios(id)
);

-- ==========================================
-- 5. POLLAS FUTBOLERAS
-- ==========================================
CREATE TABLE pollas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo_acceso VARCHAR(20) NOT NULL UNIQUE,
    pozo_puntos INT DEFAULT 0,
    id_creador INT NOT NULL,
    CONSTRAINT fk_polla_creador FOREIGN KEY (id_creador) REFERENCES usuarios(id)
);

CREATE TABLE participantes_pollas (
    id_usuario INT NOT NULL,
    id_polla INT NOT NULL,
    puntos_acumulados INT DEFAULT 0,
    PRIMARY KEY (id_usuario, id_polla),
    CONSTRAINT fk_pp_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    CONSTRAINT fk_pp_polla FOREIGN KEY (id_polla) REFERENCES pollas(id)
);

CREATE TABLE predicciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    goles_local INT NOT NULL,
    goles_visitante INT NOT NULL,
    puntos_obtenidos INT DEFAULT 0,
    id_usuario INT NOT NULL,
    id_polla INT NOT NULL,
    id_partido INT NOT NULL,
    fecha_prediccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pred_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    CONSTRAINT fk_pred_polla FOREIGN KEY (id_polla) REFERENCES pollas(id),
    CONSTRAINT fk_pred_partido FOREIGN KEY (id_partido) REFERENCES partidos(id)
);

-- ==========================================
-- 6. ÁLBUM DIGITAL E INTERCAMBIOS
-- ==========================================
CREATE TABLE albumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    porcentaje_completado FLOAT DEFAULT 0,
    laminas_pegadas INT DEFAULT 0,
    CONSTRAINT fk_album_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE laminas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rareza VARCHAR(50) NOT NULL, 
    id_jugador INT NOT NULL,
    CONSTRAINT fk_lamina_jugador FOREIGN KEY (id_jugador) REFERENCES jugadores(id)
);

CREATE TABLE laminas_album (
    id_album INT NOT NULL,
    id_lamina INT NOT NULL,
    esta_pegada BOOLEAN DEFAULT FALSE,
    cantidad_repetidas INT DEFAULT 0,
    PRIMARY KEY (id_album, id_lamina),
    CONSTRAINT fk_la_album FOREIGN KEY (id_album) REFERENCES albumes(id),
    CONSTRAINT fk_la_lamina FOREIGN KEY (id_lamina) REFERENCES laminas(id)
);

CREATE TABLE paquetes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    estado VARCHAR(50) DEFAULT 'CERRADO',
    fecha_obtencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_paquete_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE intercambios_laminas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitante INT NOT NULL,
    id_receptor INT NOT NULL,
    id_lamina_ofrecida INT NOT NULL,
    id_lamina_solicitada INT NOT NULL,
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion DATETIME,
    CONSTRAINT fk_intercambio_solicitante FOREIGN KEY (id_solicitante) REFERENCES usuarios(id),
    CONSTRAINT fk_intercambio_receptor FOREIGN KEY (id_receptor) REFERENCES usuarios(id),
    CONSTRAINT fk_intercambio_ofrecida FOREIGN KEY (id_lamina_ofrecida) REFERENCES laminas(id),
    CONSTRAINT fk_intercambio_solicitada FOREIGN KEY (id_lamina_solicitada) REFERENCES laminas(id)
);

-- ==========================================
-- 7. SOPORTE, LOGS Y NOTIFICACIONES
-- ==========================================
CREATE TABLE incidentes_soporte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'ABIERTO', 
    prioridad VARCHAR(20),
    id_reportador INT NOT NULL, 
    id_agente_soporte INT, 
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_incidente_reportador FOREIGN KEY (id_reportador) REFERENCES usuarios(id),
    CONSTRAINT fk_incidente_agente FOREIGN KEY (id_agente_soporte) REFERENCES usuarios(id)
);

CREATE TABLE logs_transaccionales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accion VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalle TEXT,
    hash_integridad VARCHAR(255),
    nivel_riesgo VARCHAR(20), 
    verificado_compliance BOOLEAN DEFAULT FALSE,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_log_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensaje TEXT NOT NULL,
    canal VARCHAR(20) NOT NULL, 
    id_destinatario INT NOT NULL,
    id_emisor INT, 
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_noti_destinatario FOREIGN KEY (id_destinatario) REFERENCES usuarios(id),
    CONSTRAINT fk_noti_emisor FOREIGN KEY (id_emisor) REFERENCES usuarios(id)
);

-- ==========================================
-- 8. COMPLIANCE Y REPORTES ALIADOS
-- ==========================================
CREATE TABLE reportes_interaccion_api (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_aliado INT NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    peticiones_exitosas INT DEFAULT 0,
    peticiones_fallidas INT DEFAULT 0,
    fecha_corte DATE NOT NULL,
    -- Aquí ajustamos la foránea para que apunte a la nueva tabla de aliados que usa id_usuario
    CONSTRAINT fk_reporte_aliado FOREIGN KEY (id_aliado) REFERENCES aliados_comerciales(id_usuario)
);

CREATE TABLE reportes_compliance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_reporte VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ruta_archivo VARCHAR(255), 
    id_generador INT NOT NULL, 
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_compliance_generador FOREIGN KEY (id_generador) REFERENCES usuarios(id)
);