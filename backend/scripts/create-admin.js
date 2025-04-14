const bcrypt = require('bcryptjs')
const db = require('../src/config/database')

async function createAdmin() {
  try {
    // Datos del administrador
    const adminData = {
      nombre: 'Admin',
      email: 'admin@aquatrack.com',
      password: 'admin123',
      rol: 'admin'
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(adminData.password, 10)

    // Verificar si ya existe el usuario
    const [existingUsers] = await db.query('SELECT id FROM usuarios WHERE email = ?', [adminData.email])
    
    if (existingUsers.length > 0) {
      console.log('El usuario administrador ya existe')
      process.exit(0)
    }

    // Crear el usuario administrador
    await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [adminData.nombre, adminData.email, hashedPassword, adminData.rol]
    )

    console.log('Usuario administrador creado exitosamente')
    console.log('Email:', adminData.email)
    console.log('Contraseña:', adminData.password)
  } catch (error) {
    console.error('Error al crear usuario administrador:', error)
  } finally {
    process.exit(0)
  }
}

createAdmin() 