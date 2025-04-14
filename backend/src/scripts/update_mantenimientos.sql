-- Actualizar la tabla mantenimientos para incluir los nuevos campos
ALTER TABLE mantenimientos
ADD COLUMN cliente_id INT NOT NULL AFTER id,
ADD COLUMN descripcion TEXT AFTER tipo,
ADD COLUMN problemas_detectados TEXT,
ADD COLUMN soluciones_aplicadas TEXT,
ADD COLUMN presupuesto DECIMAL(10,2) DEFAULT 0,
ADD FOREIGN KEY (cliente_id) REFERENCES clientes(id); 