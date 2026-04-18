-- 1. TABLAS INDEPENDIENTES (Sin llaves foráneas)

CREATE TABLE rol (
    idrol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE cliente (
    idcliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20)
);

CREATE TABLE mesa (
    idmesa SERIAL PRIMARY KEY,
    numeromesa INT UNIQUE NOT NULL,
    capacidad INT DEFAULT 4,
    estado VARCHAR(20) DEFAULT 'disponible'
);

CREATE TABLE categoria (
    idcategoria SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- 2. TABLAS DE PRIMER NIVEL DE DEPENDENCIA

CREATE TABLE usuarios (
    idusuarios SERIAL PRIMARY KEY,
    idrol INT REFERENCES rol(idrol),
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) NOT NULL,
    contrasena VARCHAR(50) NOT NULL, 
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE producto (
    idproducto SERIAL PRIMARY KEY,
    idcategoria INT REFERENCES categoria(idcategoria),
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    unidad_medida VARCHAR(20),
    stock_minimo NUMERIC(10,2) DEFAULT 0, 
    cantidad NUMERIC(10,2) DEFAULT 0,
    fecha_vencimiento DATE,
    tipo_producto VARCHAR(50), 
    es_perecedero BOOLEAN DEFAULT TRUE,
    activo BOOLEAN DEFAULT TRUE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLAS DE SEGUNDO NIVEL DE DEPENDENCIA

CREATE TABLE inventario (
    idinventario SERIAL PRIMARY KEY,
    idproducto INT REFERENCES producto(idproducto),
    stock INT NOT NULL DEFAULT 0,
    fechaactualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orden (
    idorden SERIAL PRIMARY KEY,
    idmesa INT REFERENCES mesa(idmesa),
    idusuarios INT REFERENCES usuarios(idusuarios),
    idcliente INT REFERENCES cliente(idcliente),
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLAS DE TERCER NIVEL DE DEPENDENCIA

CREATE TABLE detalleorden (
    iddetalle SERIAL PRIMARY KEY,
    idorden INT REFERENCES orden(idorden) ON DELETE CASCADE,
    idproducto INT REFERENCES producto(idproducto),
    cantidad INT NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    nota VARCHAR(255)
);

CREATE TABLE venta (
    idventa SERIAL PRIMARY KEY,
    idorden INT REFERENCES orden(idorden),
    total DECIMAL(10,2) NOT NULL,
    metodopago VARCHAR(50),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLAS DEL MÓDULO CAJA Y PAGOS

CREATE TABLE caja (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(idusuarios),
    monto_inicial NUMERIC(15,2) NOT NULL,
    fecha_apertura TIMESTAMP DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'ABIERTA',
    fecha_cierre TIMESTAMP,
    monto_final_real NUMERIC(15,2),
    saldo_teorico NUMERIC(15,2),
    diferencia NUMERIC(15,2)
);

CREATE TABLE caja_movimientos (
    id SERIAL PRIMARY KEY,
    caja_id INT REFERENCES caja(id),
    tipo VARCHAR(20) NOT NULL,
    monto NUMERIC(15,2) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    referencia VARCHAR(100),
    fecha TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    orden_id INT REFERENCES orden(idorden),
    metodo_pago VARCHAR(50) NOT NULL,
    monto NUMERIC(15,2) NOT NULL,
    monto_recibido NUMERIC(15,2),
    cambio NUMERIC(15,2),
    usuario_id INT REFERENCES usuarios(idusuarios),
    fecha_pago TIMESTAMP DEFAULT NOW()
);

-- 6. INSERCIÓN DE DATOS BÁSICOS

-- Roles por defecto
INSERT INTO rol (idrol, nombre) VALUES (1, 'Administrador') ON CONFLICT DO NOTHING;
INSERT INTO rol (idrol, nombre) VALUES (2, 'Cajero') ON CONFLICT DO NOTHING;
INSERT INTO rol (idrol, nombre) VALUES (3, 'Mesero') ON CONFLICT DO NOTHING;
INSERT INTO rol (idrol, nombre) VALUES (4, 'Cocinero') ON CONFLICT DO NOTHING;

-- Usuario administrador por defecto (la contraseña deberás cambiarla/encriptarla más adelante si implementaste hash)
INSERT INTO usuarios (idusuarios, idrol, nombre, apellido, correo, usuario, contrasena, activo, fecha) 
VALUES (1, 1, 'Admin', 'Admin', 'admin@example.com', 'admin', '1234', true, NOW()) 
ON CONFLICT DO NOTHING;

-- Cliente por defecto para mostrador
INSERT INTO cliente (idcliente, nombre, telefono) 
VALUES (1, 'Cliente Mostrador', '0000000') ON CONFLICT DO NOTHING;

-- Mesas iniciales 1 a 20 recomendadas
INSERT INTO mesa (idmesa, numeromesa) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
(6, 6), (7, 7), (8, 8), (9, 9), (10, 10),
(11, 11), (12, 12), (13, 13), (14, 14), (15, 15),
(16, 16), (17, 17), (18, 18), (19, 19), (20, 20)
ON CONFLICT DO NOTHING;

-- Reiniciar secuencias por si se necesitan insertar automáticamente después
SELECT setval('rol_idrol_seq', (SELECT MAX(idrol) FROM rol));
SELECT setval('usuarios_idusuarios_seq', (SELECT MAX(idusuarios) FROM usuarios));
SELECT setval('cliente_idcliente_seq', (SELECT MAX(idcliente) FROM cliente));
SELECT setval('mesa_idmesa_seq', (SELECT MAX(idmesa) FROM mesa));
