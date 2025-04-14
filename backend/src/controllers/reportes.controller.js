const db = require('../config/database')
const nodemailer = require('nodemailer')
require('dotenv').config()

console.log('Configurando nodemailer con:', {
  email: process.env.EMAIL_USER,
  hasPassword: !!process.env.EMAIL_APP_PASSWORD
})

// Validar variables de entorno necesarias
if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  console.error('ERROR: Las variables de entorno EMAIL_USER y EMAIL_APP_PASSWORD son requeridas')
}

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  debug: true,
  logger: true
})

// Verificar la configuración del transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('Error en la configuración del servidor de correo:', error)
  } else {
    console.log('Servidor de correo listo para enviar mensajes')
  }
})

const reportesController = {
  getMantenimientosPendientes: async (req, res) => {
    try {
      const [results] = await db.query(`
        SELECT 
          DATE_FORMAT(fecha_programada, '%Y-%m') as mes,
          COUNT(*) as cantidad
        FROM mantenimientos
        WHERE estado = 'pendiente'
        GROUP BY mes
        ORDER BY mes DESC
        LIMIT 6
      `)
      
      res.json({ data: results })
    } catch (error) {
      console.error('Error al obtener mantenimientos pendientes:', error)
      res.status(500).json({ message: 'Error al obtener mantenimientos pendientes' })
    }
  },

  getDispensadoresPorCliente: async (req, res) => {
    try {
      const [results] = await db.query(`
        SELECT 
          c.nombre as cliente,
          COUNT(DISTINCT CASE 
            WHEN d.cliente_id IS NOT NULL THEN d.id
            WHEN d.sucursal_id IS NOT NULL THEN d.id
          END) as cantidad
        FROM clientes c
        LEFT JOIN (
          SELECT id, cliente_id, NULL as sucursal_id FROM dispensadores WHERE cliente_id IS NOT NULL
          UNION ALL
          SELECT d.id, s.cliente_id, d.sucursal_id 
          FROM dispensadores d
          JOIN sucursales s ON d.sucursal_id = s.id
        ) d ON c.id = d.cliente_id
        GROUP BY c.id, c.nombre
        ORDER BY cantidad DESC
      `)
      
      res.json({ data: results })
    } catch (error) {
      console.error('Error al obtener dispensadores por cliente:', error)
      res.status(500).json({ message: 'Error al obtener dispensadores por cliente' })
    }
  },

  sendReport: async (req, res) => {
    try {
      const { clienteId, email, subject, message } = req.body

      console.log('Intentando enviar correo a:', email)

      if (!email || !subject || !message) {
        console.log('Faltan campos requeridos:', { email, subject, hasMessage: !!message })
        return res.status(400).json({ 
          success: false,
          message: 'El email, asunto y mensaje son requeridos' 
        })
      }

      // Configuración del correo
      const mailOptions = {
        from: {
          name: 'Aguas 365',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: `Aguas 365 - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://i.postimg.cc/15X3txx1/Captura-de-pantalla-2025-04-10-211230.png" 
                   alt="Aguas 365 Logo" 
                   style="max-width: 200px; height: auto;"
              >
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
              <h2 style="color: #2c3e50; margin-bottom: 20px; text-align: center;">Reporte de Aguas 365</h2>
              <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                ${message}
              </div>
              <hr style="border: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px; text-align: center;">
                Este es un correo automático enviado desde el sistema de Aguas 365.<br>
                Por favor no responda a este correo.
              </p>
            </div>
          </div>
        `,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      }

      console.log('Enviando correo con opciones:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        from: mailOptions.from
      })

      // Enviar el correo
      const info = await transporter.sendMail(mailOptions)
      console.log('Correo enviado exitosamente:', info.messageId)

      res.json({ 
        success: true,
        message: 'Reporte enviado correctamente',
        messageId: info.messageId
      })
    } catch (error) {
      console.error('Error detallado al enviar el reporte:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        command: error.command
      })
      
      res.status(500).json({ 
        success: false,
        message: 'Error al enviar el reporte',
        error: error.message 
      })
    }
  }
}

module.exports = reportesController 