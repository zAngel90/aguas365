-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS aquatrack;
USE aquatrack;

-- Tabla de Clientes
CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Dispensadores
CREATE TABLE dispensadores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    numero_serie VARCHAR(50) UNIQUE NOT NULL,
    fecha_instalacion DATE NOT NULL,
    estado ENUM('activo', 'inactivo', 'mantenimiento') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Tabla de Mantenimientos
CREATE TABLE mantenimientos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dispensador_id INT NOT NULL,
    tipo ENUM('preventivo', 'correctivo', 'instalacion') NOT NULL,
    fecha_programada DATE NOT NULL,
    fecha_realizado DATE,
    estado ENUM('pendiente', 'en_progreso', 'completado', 'cancelado') DEFAULT 'pendiente',
    observaciones TEXT,
    tecnico_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dispensador_id) REFERENCES dispensadores(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE CASCADE
);

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'tecnico') NOT NULL DEFAULT 'tecnico',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Técnicos
CREATE TABLE tecnicos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    direccion TEXT NOT NULL,
    disponibilidad ENUM('disponible', 'ocupado', 'vacaciones') NOT NULL DEFAULT 'disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_cliente_email ON clientes(email);
CREATE INDEX idx_dispensador_cliente ON dispensadores(cliente_id);
CREATE INDEX idx_mantenimiento_dispensador ON mantenimientos(dispensador_id);
CREATE INDEX idx_mantenimiento_fecha ON mantenimientos(fecha_programada);
CREATE INDEX idx_mantenimiento_tecnico ON mantenimientos(tecnico_id);
CREATE INDEX idx_tecnico_usuario ON tecnicos(usuario_id); 