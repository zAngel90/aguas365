const bcrypt = require('bcryptjs');
const db = require('../src/config/database');

async function resetAdminPassword() {
    try {
        const email = 'admin@aquatrack.com';
        const newPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query('UPDATE usuarios SET password = ? WHERE email = ?', [hashedPassword, email]);
        console.log('Contraseña de administrador restablecida exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        process.exit(1);
    }
}

resetAdminPassword(); 