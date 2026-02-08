-- ===========================================================
-- Base de datos del sistema PracticumIA
-- Gestión de usuarios, prácticas, evaluaciones y documentos
-- ===========================================================

CREATE DATABASE IF NOT EXISTS practicumia_db;
USE practicumia_db;

-- ===========================================================
-- 1) Usuarios del sistema
-- ===========================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('estudiante', 'tutor_centro', 'tutor_empresa', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================================================
-- 2) Datos adicionales del estudiante
-- ===========================================================
CREATE TABLE IF NOT EXISTS estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    dni VARCHAR(20) NOT NULL,
    ciclo VARCHAR(100) NOT NULL,
    curso VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT unique_usuario_estudiante UNIQUE(usuario_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_estudiantes_usuario ON estudiantes(usuario_id);

-- ===========================================================
-- 3) Empresas colaboradoras
-- ===========================================================
CREATE TABLE IF NOT EXISTS empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    tutor_empresa VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE UNIQUE INDEX unique_empresas_email ON empresas(email);
CREATE INDEX idx_empresas_nombre ON empresas(nombre);

-- ===========================================================
-- 4) Prácticas asignadas a estudiantes
-- ===========================================================
CREATE TABLE IF NOT EXISTS practicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    empresa_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    horas_totales INT NOT NULL,
    estado ENUM('pendiente', 'en_curso', 'finalizada') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_practicas_estudiante ON practicas(estudiante_id);
CREATE INDEX idx_practicas_empresa ON practicas(empresa_id);

-- ===========================================================
-- 5) Evaluaciones realizadas por el tutor del centro
-- ===========================================================
CREATE TABLE IF NOT EXISTS evaluaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    practica_id INT NOT NULL,
    tutor_centro_id INT NOT NULL,
    progreso INT NOT NULL,
    comentario TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (practica_id) REFERENCES practicas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tutor_centro_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_eval_practica ON evaluaciones(practica_id);
CREATE INDEX idx_eval_tutor ON evaluaciones(tutor_centro_id);

-- ===========================================================
-- 6) Documentación asociada a las prácticas
-- ===========================================================
CREATE TABLE IF NOT EXISTS documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    practica_id INT NOT NULL,
    nombre_archivo VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (practica_id) REFERENCES practicas(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_docs_practica ON documentos(practica_id);

-- ===========================================================
-- 7) Registro de interacciones IA para seguimiento y mejora continua
-- ===========================================================
CREATE TABLE IF NOT EXISTS ia_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ia_usuario ON ia_logs(usuario_id);

