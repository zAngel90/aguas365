const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const routes = require('./routes');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'https://aguas365.vercel.app', 'https://aguas365.lat'],
  credentials: false
}));

// JSON and URL-encoded parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File Upload middleware - DEBE IR DESPUÉS DE CORS Y ANTES DE LAS RUTAS
app.use(fileUpload({
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  useTempFiles: false,
  parseNested: true,
  debug: true
}));

// Log de todas las peticiones
app.use((req, res, next) => {
  console.log('Nueva petición:', {
    método: req.method,
    ruta: req.path,
    headers: req.headers,
    files: req.files ? Object.keys(req.files) : 'no files',
    body: req.body
  });
  next();
});

// Rutas
app.use('/api', routes);

// Manejador de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor',
    error: err.message 
  });
});

module.exports = app; 