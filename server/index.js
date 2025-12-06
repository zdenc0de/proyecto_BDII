import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();

// ============================================
// CONFIGURACIÓN DE MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

let pool = null;

// ============================================
// UTILIDADES Y VALIDACIONES
// ============================================

// Middleware para verificar conexión activa
const verificarConexion = (req, res, next) => {
  if (!pool) {
    return res.status(401).json({ 
      success: false, 
      message: 'No hay conexión activa. Por favor, inicia sesión primero.' 
    });
  }
  next();
};

// Función para obtener cliente con search_path configurado
const getClient = async () => {
  try {
    const client = await pool.connect();
    // Configurar search_path para acceder a los esquemas correctos
    await client.query('SET search_path TO proyectofinal, dm_ventas, public');
    return client;
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    throw new Error('Error de conexión a la base de datos');
  }
};

// Función para validar parámetros de fecha
const validarFechas = (start, end) => {
  const fechaInicio = new Date(start);
  const fechaFin = new Date(end);
  
  if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
    return { valido: false, mensaje: 'Formato de fecha inválido' };
  }
  
  if (fechaInicio > fechaFin) {
    return { valido: false, mensaje: 'La fecha inicial no puede ser mayor a la fecha final' };
  }
  
  return { valido: true };
};

// Función para construir filtros dinámicos
const buildFilter = (start, end, productSku) => {
  let where = "WHERE t.fecha BETWEEN $1 AND $2";
  let params = [start || '2020-01-01', end || '2030-12-31'];

  if (productSku && productSku !== 'all') {
    where += " AND p.sku_original = $3";
    params.push(productSku);
  }
  return { where, params };
};

// Función para verificar si el datamart tiene datos
const verificarDatamart = async (client) => {
  try {
    const result = await client.query('SELECT COUNT(*) as count FROM dm_ventas.hechos_ventas');
    const count = parseInt(result.rows[0].count);
    return count > 0;
  } catch (error) {
    console.error('Error al verificar datamart:', error);
    return false;
  }
};

// ============================================
// ENDPOINT DE CONEXIÓN
// ============================================

app.post('/api/connect', async (req, res) => {
  const { user, password, host, port, database } = req.body;
  
  // Validación de parámetros
  if (!user || !password || !database) {
    return res.json({ 
      success: false, 
      message: 'Usuario, contraseña y base de datos son requeridos' 
    });
  }
  
  try {
    // Cerrar pool anterior si existe
    if (pool) {
      await pool.end();
    }
    
    // Crear nuevo pool de conexiones
    pool = new Pool({ 
      user, 
      password, 
      host: host || 'localhost', 
      port: port || 5432, 
      database,
      max: 20, // Máximo de conexiones
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    // Verificar conexión
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    console.log(`✓ Conexión exitosa a la base de datos: ${database}`);
    res.json({ success: true, message: 'Conexión establecida exitosamente' });
    
  } catch (err) {
    console.error('Error de conexión:', err.message);
    pool = null;
    res.json({ 
      success: false, 
      message: `Error de conexión: ${err.message}` 
    });
  }
});

// ============================================
// ENDPOINTS AUXILIARES
// ============================================

// Obtener lista simple de productos para dropdown
app.get('/api/list/products', verificarConexion, async (req, res) => {
  const client = await getClient();
  try {
    const query = `
      SELECT sku, nombre_producto
      FROM productos
      ORDER BY nombre_producto
      LIMIT 1000
    `;
    const result = await client.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar productos:', error);
    res.status(500).json({ error: 'Error al obtener lista de productos' });
  } finally {
    client.release();
  }
});

// Obtener lista de categorías para dropdown
app.get('/api/list/categories', verificarConexion, async (req, res) => {
  const client = await getClient();
  try {
    const query = `
      SELECT id_categoria, nombre_categoria
      FROM categoria
      ORDER BY nombre_categoria
    `;
    const result = await client.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar categorías:', error);
    res.status(500).json({ error: 'Error al obtener lista de categorías' });
  } finally {
    client.release();
  }
});

// ============================================
// ENDPOINTS ABCCR (PRODUCTOS)
// ============================================

// Consultar productos
app.get('/api/products', verificarConexion, async (req, res) => {
  const client = await getClient();
  try {
    const query = `
      SELECT 
        p.sku, 
        p.nombre_producto, 
        p.descripcion, 
        p.condicion, 
        c.nombre_categoria 
      FROM productos p 
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria 
      ORDER BY p.sku DESC 
      LIMIT 100
    `;
    const result = await client.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al consultar productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  } finally {
    client.release();
  }
});

// Crear producto (Alta)
app.post('/api/products', verificarConexion, async (req, res) => {
  const client = await getClient();
  try {
    const { nombre_producto, descripcion, condicion, id_categoria } = req.body;

    // Validaciones mejoradas
    if (!nombre_producto || nombre_producto.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El nombre del producto es requerido y no puede estar vacío'
      });
    }

    if (!condicion || condicion.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'La condición del producto es requerida'
      });
    }

    // Validar que la condición sea una de las permitidas
    const condicionesValidas = ['Nuevo', 'Usado', 'Reacondicionado'];
    if (!condicionesValidas.includes(condicion)) {
      return res.status(400).json({
        success: false,
        error: `La condición debe ser: ${condicionesValidas.join(', ')}`
      });
    }

    const query = `
      INSERT INTO productos (nombre_producto, descripcion, condicion, id_categoria)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await client.query(query, [
      nombre_producto.trim(),
      descripcion ? descripcion.trim() : null,
      condicion,
      id_categoria || null
    ]);

    res.json({
      success: true,
      message: 'Producto creado exitosamente',
      producto: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear producto:', error);

    // Mensajes de error específicos según el código de error de PostgreSQL
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un producto con esos datos'
      });
    }

    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: 'La categoría seleccionada no existe'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al crear producto. Por favor, intenta nuevamente'
    });
  } finally {
    client.release();
  }
});

// Actualizar producto (Cambio)
app.put('/api/products/:sku', verificarConexion, async (req, res) => {
  const client = await getClient();
  try {
    const { sku } = req.params;
    const { nombre_producto, descripcion, condicion, id_categoria } = req.body;

    // Validar SKU
    if (!sku || isNaN(sku)) {
      return res.status(400).json({
        success: false,
        error: 'SKU inválido'
      });
    }

    // Validaciones de campos
    if (nombre_producto !== undefined && nombre_producto.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El nombre del producto no puede estar vacío'
      });
    }

    if (condicion !== undefined) {
      const condicionesValidas = ['Nuevo', 'Usado', 'Reacondicionado'];
      if (!condicionesValidas.includes(condicion)) {
        return res.status(400).json({
          success: false,
          error: `La condición debe ser: ${condicionesValidas.join(', ')}`
        });
      }
    }

    const query = `
      UPDATE productos
      SET nombre_producto = COALESCE($1, nombre_producto),
          descripcion = COALESCE($2, descripcion),
          condicion = COALESCE($3, condicion),
          id_categoria = COALESCE($4, id_categoria),
          updated_at = NOW()
      WHERE sku = $5
      RETURNING *
    `;
    const result = await client.query(query, [
      nombre_producto ? nombre_producto.trim() : null,
      descripcion !== undefined ? (descripcion ? descripcion.trim() : null) : null,
      condicion,
      id_categoria !== undefined ? id_categoria : null,
      sku
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      producto: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: 'La categoría seleccionada no existe'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al actualizar producto. Por favor, intenta nuevamente'
    });
  } finally {
    client.release();
  }
});

// Eliminar producto (Baja)
app.delete('/api/products/:sku', verificarConexion, async (req, res) => {
  const client = await getClient();
  try {
    const { sku } = req.params;

    // Validar SKU
    if (!sku || isNaN(sku)) {
      return res.status(400).json({
        success: false,
        error: 'SKU inválido'
      });
    }

    const query = 'DELETE FROM productos WHERE sku = $1 RETURNING *';
    const result = await client.query(query, [sku]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente (Baja completada)'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);

    // Manejo específico de error de constraint (si tiene ventas asociadas)
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar el producto porque tiene ventas o registros asociados. Considere desactivarlo en lugar de eliminarlo.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al eliminar producto. Por favor, intenta nuevamente'
    });
  } finally {
    client.release();
  }
});

// ============================================
// ENDPOINTS DE REPORTES OLAP
// ============================================

// A. ROLLUP - Totales y Subtotales
app.get('/api/reports/rollup', verificarConexion, async (req, res) => {
  const client = await getClient();
  try {
    const { start, end, sku } = req.query;

    // Verificar que el datamart tenga datos
    const datamartOk = await verificarDatamart(client);
    if (!datamartOk) {
      return res.status(400).json({
        error: 'El datamart está vacío',
        message: 'Debe ejecutar el proceso ETL primero para cargar los datos en el datamart',
        needsETL: true
      });
    }

    // Validar fechas
    const validacion = validarFechas(start, end);
    if (!validacion.valido) {
      return res.status(400).json({ error: validacion.mensaje });
    }

    const { where, params } = buildFilter(start, end, sku);

    const query = `
      SELECT
        COALESCE(t.anio::text, 'TOTAL GLOBAL') as anio,
        COALESCE(p.categoria, 'TODAS CATEGORIAS') as categoria,
        COALESCE(p.nombre_producto, 'TODOS PRODUCTOS') as producto,
        SUM(h.monto_total)::numeric(14,2) as ventas,
        -- Columnas auxiliares para ordenamiento correcto
        t.anio as anio_original,
        p.categoria as categoria_original
      FROM dm_ventas.hechos_ventas h
      JOIN dm_ventas.dim_tiempo t ON h.id_tiempo = t.id_tiempo
      JOIN dm_ventas.dim_producto p ON h.id_producto = p.id_producto
      ${where}
      GROUP BY ROLLUP (t.anio, p.categoria, p.nombre_producto)
      ORDER BY
        t.anio DESC NULLS FIRST,        -- Totales globales primero
        p.categoria NULLS FIRST,         -- Luego subtotales por categoría
        p.nombre_producto NULLS FIRST,   -- Luego subtotales por producto
        ventas DESC                      -- Ordenar por ventas dentro de cada grupo
      LIMIT 500
    `;

    const result = await client.query(query, params);

    // Eliminar columnas auxiliares antes de enviar respuesta
    const cleanedRows = result.rows.map(({ anio_original, categoria_original, ...row }) => row);
    res.json(cleanedRows);

  } catch (error) {
    console.error('Error en reporte ROLLUP:', error);
    res.status(500).json({ error: 'Error al generar reporte ROLLUP' });
  } finally {
    client.release();
  }
});

// B. CUBE - Todas las combinaciones
app.get('/api/reports/cube', verificarConexion, async (req, res) => {
  const client = await getClient();
  try {
    const { start, end, sku } = req.query;

    // Verificar que el datamart tenga datos
    const datamartOk = await verificarDatamart(client);
    if (!datamartOk) {
      return res.status(400).json({
        error: 'El datamart está vacío',
        message: 'Debe ejecutar el proceso ETL primero para cargar los datos en el datamart',
        needsETL: true
      });
    }

    // Validar fechas
    const validacion = validarFechas(start, end);
    if (!validacion.valido) {
      return res.status(400).json({ error: validacion.mensaje });
    }

    let params = [start || '2020-01-01', end || '2030-12-31'];
    let skuFilter = (sku && sku !== 'all') ? 'AND p.sku_original = $3' : '';
    if (skuFilter) params.push(sku);

    const query = `
      SELECT
        COALESCE(t.anio::text, 'TODOS AÑOS') as anio,
        COALESCE(s.nombre_sucursal, 'TODAS SUCURSALES') as sucursal,
        SUM(h.monto_total)::numeric(14,2) as ventas,
        -- Columnas auxiliares para ordenamiento
        t.anio as anio_original,
        s.nombre_sucursal as sucursal_original,
        -- Identificador de nivel de agregación (0=Total, 1=Parcial, 2=Detalle)
        GROUPING(t.anio) + GROUPING(s.nombre_sucursal) as nivel_agregacion
      FROM dm_ventas.hechos_ventas h
      JOIN dm_ventas.dim_tiempo t ON h.id_tiempo = t.id_tiempo
      JOIN dm_ventas.dim_sucursal s ON h.id_sucursal = s.id_sucursal
      JOIN dm_ventas.dim_producto p ON h.id_producto = p.id_producto
      WHERE t.fecha BETWEEN $1 AND $2 ${skuFilter}
      GROUP BY CUBE (t.anio, s.nombre_sucursal)
      ORDER BY
        nivel_agregacion DESC,           -- Primero totales generales (nivel 2), luego parciales, luego detalles
        t.anio NULLS FIRST,              -- Años con NULL primero (subtotales)
        s.nombre_sucursal NULLS FIRST,   -- Sucursales con NULL primero (subtotales)
        ventas DESC                      -- Ordenar por ventas
      LIMIT 500
    `;

    const result = await client.query(query, params);

    // Eliminar columnas auxiliares antes de enviar respuesta
    const cleanedRows = result.rows.map(({ anio_original, sucursal_original, nivel_agregacion, ...row }) => row);
    res.json(cleanedRows);

  } catch (error) {
    console.error('Error en reporte CUBE:', error);
    res.status(500).json({ error: 'Error al generar reporte CUBE' });
  } finally {
    client.release();
  }
});

// C. RANK y DENSE_RANK - Rankings de productos
app.get('/api/reports/rank', verificarConexion, async (req, res) => {
  const client = await getClient();
  try {
    const { start, end, type } = req.query;

    // Verificar que el datamart tenga datos
    const datamartOk = await verificarDatamart(client);
    if (!datamartOk) {
      return res.status(400).json({
        error: 'El datamart está vacío',
        message: 'Debe ejecutar el proceso ETL primero para cargar los datos en el datamart',
        needsETL: true
      });
    }

    // Validar fechas
    const validacion = validarFechas(start, end);
    if (!validacion.valido) {
      return res.status(400).json({ error: validacion.mensaje });
    }

    const params = [start || '2020-01-01', end || '2030-12-31'];
    const func = type === 'dense' ? 'DENSE_RANK()' : 'RANK()';

    // SOLUCIÓN: Usar CTE (Common Table Expression) para separar la agregación de la función de ventana
    const query = `
      WITH ventas_agregadas AS (
        -- Paso 1: Primero agregamos los datos
        SELECT
          p.nombre_producto,
          SUM(h.cantidad_vendida)::int as unidades,
          SUM(h.monto_total)::numeric(14,2) as ventas_totales
        FROM dm_ventas.hechos_ventas h
        JOIN dm_ventas.dim_tiempo t ON h.id_tiempo = t.id_tiempo
        JOIN dm_ventas.dim_producto p ON h.id_producto = p.id_producto
        WHERE t.fecha BETWEEN $1 AND $2
        GROUP BY p.nombre_producto
      )
      -- Paso 2: Luego aplicamos la función de ventana sobre los datos agregados
      SELECT
        nombre_producto,
        unidades,
        ventas_totales,
        ${func} OVER (ORDER BY unidades DESC) as ranking
      FROM ventas_agregadas
      ORDER BY ranking, ventas_totales DESC
      LIMIT 50
    `;

    const result = await client.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error en reporte RANK:', error);
    res.status(500).json({ error: 'Error al generar reporte RANK' });
  } finally {
    client.release();
  }
});

// ============================================
// ENDPOINTS DE GESTIÓN DEL DATAMART (ETL)
// ============================================

// Verificar estado del datamart (contar registros)
app.get('/api/datamart/status', verificarConexion, async (req, res) => {
  const client = await getClient();
  try {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM dm_ventas.hechos_ventas) as hechos,
        (SELECT COUNT(*) FROM dm_ventas.dim_tiempo) as dim_tiempo,
        (SELECT COUNT(*) FROM dm_ventas.dim_producto) as dim_producto,
        (SELECT COUNT(*) FROM dm_ventas.dim_sucursal) as dim_sucursal,
        (SELECT COUNT(*) FROM venta) as ventas_transaccionales
    `;

    const result = await client.query(query);
    const counts = result.rows[0];

    // Determinar si el datamart está poblado
    const isPopulated = parseInt(counts.hechos) > 0;
    const needsRefresh = parseInt(counts.ventas_transaccionales) > 0 && parseInt(counts.hechos) === 0;

    res.json({
      success: true,
      status: {
        populated: isPopulated,
        needsRefresh: needsRefresh,
        counts: {
          hechos_ventas: parseInt(counts.hechos),
          dim_tiempo: parseInt(counts.dim_tiempo),
          dim_producto: parseInt(counts.dim_producto),
          dim_sucursal: parseInt(counts.dim_sucursal),
          ventas_transaccionales: parseInt(counts.ventas_transaccionales)
        }
      }
    });

  } catch (error) {
    console.error('Error al verificar estado del datamart:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar el estado del datamart'
    });
  } finally {
    client.release();
  }
});

// Ejecutar proceso ETL para poblar/refrescar el datamart
app.post('/api/datamart/etl', verificarConexion, async (req, res) => {
  const client = await getClient();
  try {
    console.log('Iniciando proceso ETL...');

    // Limpiar datamart existente (truncate)
    await client.query(`
      TRUNCATE TABLE dm_ventas.hechos_ventas,
                     dm_ventas.dim_tiempo,
                     dm_ventas.dim_producto,
                     dm_ventas.dim_sucursal
      RESTART IDENTITY CASCADE
    `);

    console.log('Datamart limpiado. Cargando dimensiones...');

    // Ejecutar el procedimiento ETL
    await client.query('CALL ejecutar_etl_ventas()');

    console.log('ETL completado exitosamente');

    // Obtener conteos finales
    const countQuery = `
      SELECT
        (SELECT COUNT(*) FROM dm_ventas.hechos_ventas) as hechos,
        (SELECT COUNT(*) FROM dm_ventas.dim_tiempo) as dim_tiempo,
        (SELECT COUNT(*) FROM dm_ventas.dim_producto) as dim_producto,
        (SELECT COUNT(*) FROM dm_ventas.dim_sucursal) as dim_sucursal
    `;

    const result = await client.query(countQuery);
    const counts = result.rows[0];

    res.json({
      success: true,
      message: 'Proceso ETL completado exitosamente',
      counts: {
        hechos_ventas: parseInt(counts.hechos),
        dim_tiempo: parseInt(counts.dim_tiempo),
        dim_producto: parseInt(counts.dim_producto),
        dim_sucursal: parseInt(counts.dim_sucursal)
      }
    });

  } catch (error) {
    console.error('Error en proceso ETL:', error);
    res.status(500).json({
      success: false,
      error: 'Error al ejecutar el proceso ETL: ' + error.message
    });
  } finally {
    client.release();
  }
});

// ============================================
// ENDPOINT DE GENERACIÓN XML
// ============================================

app.get('/api/xml/:idVenta', verificarConexion, async (req, res) => {
  const client = await getClient();
  try {
    const { idVenta } = req.params;
    
    // Validar que el ID sea numérico
    if (isNaN(idVenta)) {
      return res.status(400).json({ error: 'ID de venta inválido' });
    }
    
    const query = `
      SELECT XMLELEMENT(NAME "FacturaElectronica",
        XMLELEMENT(NAME "Folio", v.id_venta),
        XMLELEMENT(NAME "Fecha", v.fecha_hora),
        XMLELEMENT(NAME "Total", v.total_venta),
        XMLELEMENT(NAME "FormaPago", v.forma_pago),
        XMLELEMENT(NAME "Cliente", (
          SELECT c.razon_social 
          FROM clientes c 
          WHERE c.id_cliente = v.id_cliente
        )),
        XMLELEMENT(NAME "Items", (
          SELECT XMLAGG(
            XMLELEMENT(NAME "Producto", 
              XMLATTRIBUTES(dv.sku AS "sku"), 
              XMLFOREST(
                p.nombre_producto AS "descripcion",
                dv.cantidad AS "cantidad",
                dv.precio_unitario AS "precio",
                dv.subtotal AS "importe"
              )
            )
          )
          FROM detalles_venta dv
          JOIN productos p ON dv.sku = p.sku
          WHERE dv.id_venta = v.id_venta
        ))
      ) as xml_result
      FROM venta v 
      WHERE v.id_venta = $1
      LIMIT 1
    `;
    
    const result = await client.query(query, [idVenta]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Venta no encontrada',
        xml: '<Error>La venta especificada no existe en el sistema</Error>' 
      });
    }
    
    res.json({ 
      success: true,
      xml: result.rows[0].xml_result 
    });
    
  } catch (error) {
    console.error('Error al generar XML:', error);
    res.status(500).json({ 
      error: 'Error al generar XML de facturación',
      xml: '<Error>Error interno del servidor</Error>'
    });
  } finally {
    client.release();
  }
});

// ============================================
// ENDPOINT DE HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  const status = {
    status: 'online',
    timestamp: new Date().toISOString(),
    connected: pool !== null,
    uptime: process.uptime()
  };
  res.json(status);
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================

app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// ============================================
// INICIO DEL SERVIDOR
// ============================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Sistema de Ventas OLAP - Backend    ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`✓ Servidor activo en puerto ${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
  console.log('✓ Esperando conexiones...\n');
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n⚠ Cerrando servidor...');
  if (pool) {
    await pool.end();
    console.log('✓ Conexiones cerradas');
  }
  process.exit(0);
}); 