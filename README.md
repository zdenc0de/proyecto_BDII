# Sistema de Ventas - Modelo de Base de Datos

Sistema completo de gestión de ventas, compras e inventario diseñado para operaciones multi-tienda con control de stock en tiempo real y facturación integrada.

---

## 📋 Características Principales

- ✅ **Multi-tienda**: Gestión de múltiples sucursales
- 📦 **Control de inventario**: Seguimiento en tiempo real por ubicación
- 💰 **Ventas y facturación**: Proceso completo de venta con generación de facturas
- 🛒 **Gestión de compras**: Control de adquisiciones y recepción de mercancía
- 👥 **Gestión de personal**: Registro de empleados y asignación de puestos
- 📊 **Trazabilidad completa**: Auditoría con timestamps automáticos

---

## 🗂️ Estructura del Sistema

### Módulos Principales

```
┌─────────────────────────────────────────────────────┐
│                   PERSONA                           │
│           (Clientes, Empleados, Proveedores)        │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    COMPRAS          VENTAS          INVENTARIO
        │                │                │
   Proveedores      Clientes         Sucursales
   Productos        Facturación      Stock
   Recepción        Empleados        Productos
```

---

## 📊 Entidades del Sistema

### Gestión de Personas
- **PERSONA**: Tabla central para todos los actores
- **CLIENTE**: Compradores del sistema
- **EMPLEADO**: Personal de la empresa
- **PROVEEDOR**: Suministradores de productos
- **PUESTO**: Catálogo de puestos laborales

### Módulo de Ventas
- **VENTA**: Registro de transacciones de venta
- **VENTA/PRODUCTO**: Detalle de productos vendidos
- **FACTURA**: Documentos fiscales de ventas

### Módulo de Compras
- **COMPRA**: Órdenes de compra a proveedores
- **COMPRA/PRODUCTO**: Detalle de productos comprados

### Módulo de Inventario
- **INVENTARIO**: Control de productos por sucursal
- **STOCK**: Cantidades disponibles en tiempo real
- **PRODUCTO**: Catálogo de productos
- **CATEGORIA**: Clasificación de productos
- **SUCURSAL**: Ubicaciones de venta

---

## 🔄 Flujo de Procesos

### Proceso de Compra
```
1. Registro de compra → Estado: PENDIENTE
2. Recepción de mercancía → Actualiza INVENTARIO
3. Actualización de STOCK → Estado: RECIBIDA
```

### Proceso de Venta
```
1. Verificación de STOCK disponible
2. Registro de VENTA y productos
3. Descuento de STOCK automático
4. Generación de FACTURA (opcional)
```

### Control de Inventario
```
├─ ENTRADA: Desde compras recibidas
├─ SALIDA: Desde ventas realizadas
├─ TRANSFERENCIAS: Entre sucursales
└─ ALERTAS: Stock mínimo
```

---

## 🔗 Relaciones Clave

### Herencia (Especialización)
```
PERSONA
   ├── CLIENTE
   ├── EMPLEADO
   └── PROVEEDOR
```

### Relaciones Principales
- `VENTA` conecta: CLIENTE + EMPLEADO + SUCURSAL + PRODUCTOS
- `COMPRA` conecta: PROVEEDOR + SUCURSAL + PRODUCTOS
- `INVENTARIO` conecta: SUCURSAL + PRODUCTO + STOCK
- `STOCK` es actualizado por: COMPRAS (entrada) + VENTAS (salida)

---

## 🛡️ Restricciones de Integridad

### Validaciones de Negocio
✅ Stock nunca negativo  
✅ No se puede vender más de lo disponible  
✅ Totales consistentes: `total = subtotal + iva`  
✅ Cantidad recibida ≤ cantidad solicitada  
✅ Una venta = máximo una factura  

### Reglas de Eliminación
- **CASCADE**: Al eliminar PERSONA se eliminan sus especializaciones
- **CASCADE**: Al eliminar VENTA/COMPRA se eliminan sus detalles
- **RESTRICT**: No se puede eliminar PRODUCTO con movimientos activos
- **RESTRICT**: No se puede eliminar CLIENTE/PROVEEDOR con transacciones

---

## ⚡ Optimización y Performance

### Índices Estratégicos
Los siguientes campos están indexados para consultas eficientes:

**PERSONA**: RFC, Email  
**VENTA**: Fecha, Cliente, Sucursal  
**COMPRA**: Fecha, Proveedor, Estado  
**INVENTARIO**: SKU, Sucursal  
**PRODUCTO**: Nombre, Categoría  

### Mejores Prácticas
- ✅ Transacciones ACID para VENTAS y COMPRAS
- ✅ Triggers automáticos para actualización de STOCK
- ✅ Auditoría con `created_at` y `updated_at`
- ✅ Validaciones a nivel de BD y aplicación

---

## 📁 Documentación Completa

Para información detallada sobre:
- Estructura completa de tablas y restricciones
- Diagramas de flujo por módulo
- Especificaciones técnicas de implementación
- Ejemplos de consultas SQL

Consulta: **[Documentación Técnica Completa](./docs/modelo_entidad_relacion.md)**

---

## 🚀 Casos de Uso

### Venta en Punto de Venta
1. Empleado registra venta para cliente
2. Sistema valida stock disponible en sucursal
3. Descuenta inventario automáticamente
4. Genera factura si es requerida

### Recepción de Mercancía
1. Se registra orden de compra (PENDIENTE)
2. Al recibir mercancía, cambia a RECIBIDA
3. Inventario se actualiza automáticamente
4. Stock queda disponible para ventas

### Consulta de Inventario
1. Ver stock actual por sucursal
2. Identificar productos con stock bajo
3. Generar alertas de reabastecimiento
4. Planificar transferencias entre sucursales

---

## 🏗️ Escalabilidad

El diseño soporta:
- ✅ Múltiples sucursales (multi-tienda)
- ✅ Miles de productos en catálogo
- ✅ Alto volumen de transacciones diarias
- ✅ Extensión a nuevos módulos (devoluciones, promociones, etc.)
- ✅ Integración con sistemas externos

---

**Última actualización**: Diciembre 2024  
**Versión del modelo**: 1.0
