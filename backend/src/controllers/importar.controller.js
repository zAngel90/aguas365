const XLSX = require('xlsx');
const { Cliente, Sucursal, Dispensador } = require('../models');

const importarExcel = async (req, res) => {
  try {
    console.log('Iniciando proceso de importación de Excel');
    console.log('Headers de la petición:', req.headers);
    
    if (!req.files || !req.files.excel) {
      console.log('No se encontró archivo en la petición:', req.files);
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const excelFile = req.files.excel;
    console.log('Archivo recibido:', {
      nombre: excelFile.name,
      tamaño: excelFile.size,
      tipo: excelFile.mimetype
    });

    // Leer el archivo Excel
    const workbook = XLSX.read(excelFile.data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Procesando ${data.length} filas del archivo Excel`);

    let totalClientes = 0;
    let totalSucursales = 0;
    let totalDispensadores = 0;

    for (const row of data) {
      // Crear o actualizar cliente
      const clienteData = {
        nombre: row.Cliente || 'No especificado',
        direccion: row.DireccionCliente || 'No especificado',
        telefono: row.TelefonoCliente || 'No especificado',
        email: row.EmailCliente || 'No especificado'
      };

      const [cliente] = await Cliente.findOrCreate({
        where: { nombre: clienteData.nombre },
        defaults: clienteData
      });

      // Crear o actualizar sucursal
      const sucursalData = {
        nombre: row.Sucursal || 'No especificado',
        direccion: row.DireccionSucursal || 'No especificado',
        telefono: row.TelefonoSucursal || 'No especificado',
        clienteId: cliente.id
      };

      const [sucursal] = await Sucursal.findOrCreate({
        where: { 
          nombre: sucursalData.nombre,
          clienteId: cliente.id
        },
        defaults: sucursalData
      });

      // Crear o actualizar dispensador
      const dispensadorData = {
        numero_serie: row.NumeroSerie || 'No especificado',
        marca: row.Marca || 'No especificado',
        modelo: row.Modelo || 'No especificado',
        tipo: row.Tipo || 'No especificado',
        estado: row.Estado || 'Activo',
        sucursalId: sucursal.id
      };

      const [dispensador] = await Dispensador.findOrCreate({
        where: { numero_serie: dispensadorData.numero_serie },
        defaults: dispensadorData
      });

      totalClientes++;
      totalSucursales++;
      totalDispensadores++;
    }

    console.log('Importación completada exitosamente');
    res.json({
      mensaje: 'Importación completada exitosamente',
      resumen: {
        clientes: totalClientes,
        sucursales: totalSucursales,
        dispensadores: totalDispensadores
      }
    });

  } catch (error) {
    console.error('Error durante la importación:', error);
    res.status(500).json({
      error: 'Error al procesar el archivo Excel',
      detalles: error.message
    });
  }
};

const detectarEstructura = async (req, res) => {
    try {
        console.log('Headers recibidos:', req.headers);
        console.log('Files recibidos:', req.files);
        console.log('Body recibido:', req.body);

        if (!req.files || Object.keys(req.files).length === 0) {
            console.log('No se encontraron archivos');
            return res.status(400).json({
                success: false,
                message: 'No se ha proporcionado ningún archivo'
            });
        }

        const archivo = req.files.file;
        console.log('Archivo encontrado:', {
            nombre: archivo?.name,
            tipo: archivo?.mimetype,
            tamaño: archivo?.size
        });

        if (!archivo || !archivo.name.match(/\.(xlsx|xls)$/)) {
            console.log('Archivo inválido o extensión incorrecta');
            return res.status(400).json({
                success: false,
                message: 'Archivo inválido. Debe ser un archivo Excel (.xlsx o .xls)'
            });
        }

        try {
            console.log('Intentando leer el archivo Excel...');
            const workbook = XLSX.read(archivo.data);
            console.log('Hojas encontradas:', workbook.SheetNames);

            const primeraHoja = workbook.Sheets[workbook.SheetNames[0]];
            const filas = XLSX.utils.sheet_to_json(primeraHoja, { 
                header: 1,
                raw: true
            }).slice(0, 33);

            console.log(`Filas procesadas: ${filas.length}`);

            if (filas.length === 0) {
                console.log('Archivo Excel vacío');
                return res.status(400).json({
                    success: false,
                    message: 'El archivo Excel está vacío'
                });
            }

            const encabezados = filas[0].map(h => h?.toString().trim() || '');
            console.log('Encabezados encontrados:', encabezados);

            const columnas = encabezados.map(nombre => ({
                nombre,
                tipo: 'texto'
            }));

            const respuesta = {
                success: true,
                data: {
                    columnas,
                    filas: filas.slice(1),
                    totalFilas: filas.length - 1
                }
            };

            console.log('Enviando respuesta exitosa');
            return res.json(respuesta);

        } catch (excelError) {
            console.error('Error al procesar Excel:', excelError);
            return res.status(400).json({
                success: false,
                message: `Error al leer el archivo Excel: ${excelError.message}`
            });
        }

    } catch (error) {
        console.error('Error general:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar el archivo',
            detalles: error.message
        });
    }
};

module.exports = {
  importarExcel,
  detectarEstructura
}; 