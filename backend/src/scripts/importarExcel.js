const XLSX = require('xlsx');
const path = require('path');
const { Cliente, Sucursal, Dispensador } = require('../models');

// Función para generar un email válido
function generateValidEmail(name, type = 'cliente') {
    // Tomar solo las primeras 20 caracteres del nombre
    const shortName = name.toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .substring(0, 20);
    return `${shortName}_${Date.now()}@noemail.com`;
}

async function importarExcel() {
    try {
        console.log('Iniciando importación...');
        
        // Leer el archivo Excel
        const archivoPath = path.join(__dirname, '../../uploads/RAP.xlsx');
        const workbook = XLSX.readFile(archivoPath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Comenzar desde la fila 205
        const startIndex = 204; // 205 - 1 porque los arrays empiezan en 0
        console.log(`Procesando ${data.length - startIndex} filas, comenzando desde la fila 205...`);

        let totalClientes = 0;
        let clientesExistentes = 0;
        let totalSucursales = 0;
        let sucursalesExistentes = 0;
        let totalDispensadores = 0;
        let dispensadoresExistentes = 0;

        // Obtener todos los clientes existentes
        const clientesActuales = await Cliente.findAll();
        console.log(`Clientes existentes en la base de datos: ${clientesActuales.length}`);
        
        // Crear un mapa de clientes existentes para búsqueda rápida
        const clientesMap = new Map(clientesActuales.map(c => [c.nombre.toLowerCase(), c]));

        // Procesar cada fila desde el índice de inicio
        for (let i = startIndex; i < data.length; i++) {
            const row = data[i];
            console.log(`\nProcesando fila ${i + 1}:`);
            
            const nombreCliente = String(row.Nombre || '').trim();
            
            // Verificar si el cliente ya existe
            const clienteExistente = clientesMap.get(nombreCliente.toLowerCase());
            
            let cliente;
            if (clienteExistente) {
                cliente = clienteExistente;
                console.log(`Cliente existente: ${cliente.nombre}`);
                clientesExistentes++;
            } else {
                // Generar un email válido para el cliente
                const defaultEmail = generateValidEmail(nombreCliente);
                
                // Crear nuevo cliente
                [cliente] = await Cliente.findOrCreate({
                    where: { nombre: nombreCliente || 'No especificado' },
                    defaults: {
                        direccion: row.Dirección || 'No especificado',
                        telefono: row['Teléfono de Contacto'] || 'No especificado',
                        email: defaultEmail
                    }
                });
                console.log(`Nuevo cliente creado: ${cliente.nombre}`);
                totalClientes++;
            }

            const nombreSucursal = String(row.SUCURSAL || '').trim();
            
            // Verificar si la sucursal ya existe para este cliente
            const sucursalExistente = await Sucursal.findOne({
                where: {
                    nombre: nombreSucursal,
                    cliente_id: cliente.id
                }
            });

            let sucursal;
            if (sucursalExistente) {
                sucursal = sucursalExistente;
                console.log(`Sucursal existente: ${sucursal.nombre} (Cliente: ${cliente.nombre})`);
                sucursalesExistentes++;
            } else {
                // Generar un email válido para la sucursal
                const sucursalEmail = generateValidEmail(nombreSucursal, 'sucursal');

                // Crear nueva sucursal
                [sucursal] = await Sucursal.findOrCreate({
                    where: { 
                        nombre: nombreSucursal || 'Principal',
                        cliente_id: cliente.id
                    },
                    defaults: {
                        direccion: row.Dirección || 'No especificado',
                        telefono: row['Teléfono de Contacto'] || 'No especificado',
                        email: sucursalEmail,
                        nif: `NIF-${Date.now()}`
                    }
                });
                console.log(`Nueva sucursal creada: ${sucursal.nombre} (Cliente: ${cliente.nombre})`);
                totalSucursales++;
            }

            const numeroSerie = String(row.Nro || '').trim();
            
            // Verificar si el dispensador ya existe
            const dispensadorExistente = await Dispensador.findOne({
                where: {
                    numero_serie: numeroSerie,
                    sucursal_id: sucursal.id
                }
            });

            let dispensador;
            if (dispensadorExistente) {
                dispensador = dispensadorExistente;
                console.log(`Dispensador existente: ${dispensador.numero_serie} (Sucursal: ${sucursal.nombre})`);
                dispensadoresExistentes++;
            } else {
                // Crear nuevo dispensador
                [dispensador] = await Dispensador.findOrCreate({
                    where: { 
                        numero_serie: numeroSerie || `DISP-${Date.now()}`,
                        sucursal_id: sucursal.id
                    },
                    defaults: {
                        modelo: String(row.MODELO || 'No especificado'),
                        fecha_instalacion: new Date(),
                        estado: 'activo',
                        sector: String(row.TIPO || 'No especificado'),
                        ultimo_mantenimiento: row['ULTIMO SERVICIO'] ? new Date(row['ULTIMO SERVICIO']) : null,
                        proximo_mantenimiento: row['PROX MANT'] ? new Date(row['PROX MANT']) : null
                    }
                });
                console.log(`Nuevo dispensador creado: ${dispensador.numero_serie} (Sucursal: ${sucursal.nombre})`);
                totalDispensadores++;
            }
        }

        console.log('\nResumen de la importación:');
        console.log(`- Clientes nuevos: ${totalClientes}`);
        console.log(`- Clientes existentes: ${clientesExistentes}`);
        console.log(`- Sucursales nuevas: ${totalSucursales}`);
        console.log(`- Sucursales existentes: ${sucursalesExistentes}`);
        console.log(`- Dispensadores nuevos: ${totalDispensadores}`);
        console.log(`- Dispensadores existentes: ${dispensadoresExistentes}`);

    } catch (error) {
        console.error('Error durante la importación:', error);
        console.error('Detalles del error:', error.message);
        if (error.parent) {
            console.error('Error de base de datos:', error.parent.message);
        }
    }
}

// Ejecutar la importación
importarExcel(); 