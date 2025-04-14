const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

async function setupDatabase() {
  let connection

  try {
    // Crear conexión inicial sin seleccionar base de datos
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    })

    // Eliminar la base de datos si existe y crearla de nuevo
    await connection.query('DROP DATABASE IF EXISTS aquatrack')
    await connection.query('CREATE DATABASE aquatrack')
    await connection.query('USE aquatrack')

    // Crear tabla de usuarios
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol ENUM('admin', 'tecnico') NOT NULL DEFAULT 'tecnico',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de clientes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        direccion VARCHAR(200) NOT NULL,
        telefono VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de sucursales
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sucursales (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        direccion VARCHAR(200) NOT NULL,
        telefono VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        nif VARCHAR(20) NOT NULL UNIQUE,
        cliente_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
      )
    `)

    // Crear tabla de dispensadores
    await connection.query(`
      CREATE TABLE IF NOT EXISTS dispensadores (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sucursal_id INT NOT NULL,
        modelo VARCHAR(50) NOT NULL,
        numero_serie VARCHAR(50) UNIQUE NOT NULL,
        estado ENUM('activo', 'inactivo', 'mantenimiento') DEFAULT 'activo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE CASCADE
      )
    `)

    // Crear tabla de tecnicos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tecnicos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        telefono VARCHAR(20) NOT NULL,
        especialidad VARCHAR(100),
        estado ENUM('activo', 'inactivo', 'vacaciones') DEFAULT 'activo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de mantenimientos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS mantenimientos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        dispensador_id INT NOT NULL,
        tecnico_id INT NOT NULL,
        tipo ENUM('preventivo', 'correctivo', 'emergencia') NOT NULL,
        fecha_programada DATE NOT NULL,
        fecha_realizada DATE,
        estado ENUM('pendiente', 'en_proceso', 'completado', 'cancelado') DEFAULT 'pendiente',
        descripcion TEXT,
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (dispensador_id) REFERENCES dispensadores(id) ON DELETE CASCADE,
        FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE CASCADE
      )
    `)

    // Insertar datos de ejemplo
    // Crear cliente de ejemplo
    await connection.query(`
      INSERT INTO clientes (nombre, direccion, telefono, email) VALUES
      ('Supermercados Disco', 'Av. Principal 123', '21027413001', 'contacto@disco.com')
    `)

    // Obtener el ID del cliente creado
    const [clienteResult] = await connection.query('SELECT LAST_INSERT_ID() as id')
    const clienteId = clienteResult[0].id

    // Crear sucursales de ejemplo
    await connection.query(`
      INSERT INTO sucursales (nombre, direccion, telefono, email, nif, cliente_id) VALUES
      ('Disco Montevideo Shopping', 'Luis Alberto de Herrera 1290', '21027413002', 'mvdshopping@disco.com', 'RUT210274130017', ?),
      ('Disco Punta Carretas', 'Ellauri 350', '21027413003', 'puntacarretas@disco.com', 'RUT210274130018', ?)
    `, [clienteId, clienteId])

    // Crear el usuario administrador
    const adminData = {
      nombre: 'Admin',
      email: 'admin@aquatrack.com',
      password: 'admin123',
      rol: 'admin'
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10)
    await connection.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [adminData.nombre, adminData.email, hashedPassword, adminData.rol]
    )

    console.log('Base de datos reiniciada y datos de ejemplo creados exitosamente')
    console.log('Usuario administrador:')
    console.log('Email:', adminData.email)
    console.log('Contraseña:', adminData.password)

  } catch (error) {
    console.error('Error durante la configuración:', error)
  } finally {
    if (connection) {
      await connection.end()
    }
    process.exit(0)
  }
}

setupDatabase() 