# Modelo Entidad-Relación — Sistema de Ventas

Este documento describe el modelo entidad-relación del sistema de ventas, enfocándose en la estructura de las tablas, sus relaciones y la organización lógica del modelo de datos.

## Índice

- [Visión General](#visión-general)
- [Entidades Principales](#entidades-principales)
  - [PERSONA](#persona)
  - [CLIENTE](#cliente)
  - [PROVEEDOR](#proveedor)
  - [PUESTO](#puesto)
  - [PUESTO/EMPLEADO](#puestoempleado)
  - [EMPLEADO](#empleado)
  - [VENTA](#venta)
  - [VENTA/PRODUCTO](#ventaproducto)
  - [FACTURA](#factura)
  - [COMPRA](#compra)
  - [COMPRA/PRODUCTO](#compraproducto)
  - [SUCURSAL](#sucursal)
  - [INVENTARIO](#inventario)
  - [STOCK](#stock)
  - [PRODUCTO](#producto)
  - [CATEGORIA](#categoria)
- [Organización por Módulos](#organización-por-módulos)
  - [Módulo de COMPRA](#módulo-de-compra)
  - [Módulo de INVENTARIO](#módulo-de-inventario)
  - [Módulo de VENTA](#módulo-de-venta)
- [Relaciones Entre Entidades](#relaciones-entre-entidades)
  - [Relaciones de Herencia](#relaciones-de-herencia-especialización)
  - [Relaciones del Módulo de Recursos Humanos](#relaciones-del-módulo-de-recursos-humanos)
  - [Relaciones del Módulo de Ventas](#relaciones-del-módulo-de-ventas)
  - [Relaciones del Módulo de Compras](#relaciones-del-módulo-de-compras)
  - [Relaciones del Módulo de Inventario](#relaciones-del-módulo-de-inventario)
  - [Relaciones del Catálogo de Productos](#relaciones-del-catálogo-de-productos)
  - [Diagrama de Dependencias Completo](#diagrama-de-dependencias-completo)
- [Restricciones de Integridad Adicionales](#restricciones-de-integridad-adicionales)
  - [Restricciones de Negocio](#restricciones-de-negocio)
  - [Reglas de Eliminación](#reglas-de-eliminación)
- [Índices Recomendados](#índices-recomendados)
- [Notas de Implementación](#notas-de-implementación)
- [Consideraciones de Diseño](#consideraciones-de-diseño)
  - [Escalabilidad](#escalabilidad)
  - [Flexibilidad](#flexibilidad)
  - [Integridad de Datos](#integridad-de-datos)
  - [Performance](#performance)
- [Diagramas de Apoyo](#diagramas-de-apoyo)

---

## Visión General

El modelo de datos está diseñado para gestionar un sistema completo de ventas y compras, con soporte para múltiples tiendas, control de inventario, facturación y seguimiento de transacciones. El diseño sigue principios de normalización y permite escalabilidad para operaciones comerciales de mediana y gran escala.

### Características Principales

- **Multi-tienda**: Soporte para múltiples ubicaciones de venta
- **Control de inventario**: Seguimiento en tiempo real por tienda y producto
- **Facturación integrada**: Generación de facturas vinculadas a ventas
- **Gestión de compras**: Control de adquisiciones y aplicación automática al inventario
- **Trazabilidad completa**: Auditoría de cambios con timestamps

---

## 📋 Entidades Principales

### PERSONA
Tabla central que almacena información de todas las personas del sistema (clientes, empleados, proveedores).

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| id_persona | PK, NOT NULL, AUTO_INCREMENT | Identificador único de persona |
| razon_social | NOT NULL | Razón social o nombre completo |
| rfc | NOT NULL, UNIQUE | Registro Federal de Contribuyentes |
| telefono | NULL | Número de teléfono |
| email | NOT NULL, UNIQUE | Correo electrónico |
| created_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de última actualización |

**Índices adicionales:**
- INDEX en `rfc`
- INDEX en `email`

---

### CLIENTE
Tabla que extiende la información de personas que son clientes.

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| id_cliente | PK, NOT NULL, AUTO_INCREMENT | Identificador único de cliente |
| id_persona | FK, NOT NULL, UNIQUE | Referencia a PERSONA |

**Relaciones:**
- FK: `id_persona` → PERSONA(id_persona) ON DELETE CASCADE

---

### PROVEEDOR
Tabla que extiende la información de personas que son proveedores.

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| id_proveedor | PK, NOT NULL, AUTO_INCREMENT | Identificador único de proveedor |
| id_persona | FK, NOT NULL, UNIQUE | Referencia a PERSONA |

**Relaciones:**
- FK: `id_persona` → PERSONA(id_persona) ON DELETE CASCADE

---

### PUESTO
Catálogo de puestos laborales disponibles en la organización.

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| id_puesto | PK, NOT NULL, AUTO_INCREMENT | Identificador único de puesto |
| nombre | NOT NULL, UNIQUE | Nombre del puesto |
| salario | NOT NULL, CHECK (salario > 0) | Salario del puesto |
| created_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

---

### PUESTO/EMPLEADO
Tabla intermedia que relaciona puestos con empleados (permite historial laboral).

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| id | PK, NOT NULL, AUTO_INCREMENT | Identificador único |
| id_empleado | FK, NOT NULL | Referencia a EMPLEADO |
| id_puesto | FK, NOT NULL | Referencia a PUESTO |
| fecha_inicio | NOT NULL | Fecha de inicio en el puesto |
| fecha_fin | NULL | Fecha de fin en el puesto |
| activo | NOT NULL, DEFAULT TRUE | Indica si es el puesto actual |
| created_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `id_empleado` → EMPLEADO(id_empleado) ON DELETE CASCADE
- FK: `id_puesto` → PUESTO(id_puesto) ON DELETE RESTRICT

**Restricciones adicionales:**
- CHECK: `fecha_fin IS NULL OR fecha_fin >= fecha_inicio`
- UNIQUE: `(id_empleado, id_puesto, fecha_inicio)`

---

### EMPLEADO
Tabla que extiende la información de personas que son empleados.

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| id_empleado | PK, NOT NULL, AUTO_INCREMENT | Identificador único de empleado |
| id_persona | FK, NOT NULL, UNIQUE | Referencia a PERSONA |
| apellido_paterno | NOT NULL | Apellido paterno |
| apellido_materno | NULL | Apellido materno |
| id_puesto | FK, NOT NULL | Referencia al puesto actual |

**Relaciones:**
- FK: `id_persona` → PERSONA(id_persona) ON DELETE CASCADE
- FK: `id_puesto` → PUESTO(id_puesto) ON DELETE RESTRICT

---

### VENTA
Registro de operaciones de venta realizadas.

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| folio_venta | PK, NOT NULL | Folio único de venta |
| id_cliente | FK, NOT NULL | Referencia a CLIENTE |
| id_empleado | FK, NOT NULL | Empleado que realizó la venta |
| fecha | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha y hora de la venta |
| id_sucursal | FK, NOT NULL | Sucursal donde se realizó |
| subtotal_venta | NOT NULL, CHECK (subtotal_venta >= 0) | Subtotal de la venta |
| iva | NOT NULL, CHECK (iva >= 0) | IVA aplicado |
| total_venta | NOT NULL, CHECK (total_venta >= 0) | Total de la venta |
| created_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `id_cliente` → CLIENTE(id_cliente) ON DELETE RESTRICT
- FK: `id_empleado` → EMPLEADO(id_empleado) ON DELETE RESTRICT
- FK: `id_sucursal` → SUCURSAL(id_sucursal) ON DELETE RESTRICT

**Restricciones adicionales:**
- CHECK: `total_venta = subtotal_venta + iva`

---

### VENTA/PRODUCTO
Tabla intermedia que registra los productos vendidos en cada venta.

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| item | PK, NOT NULL, AUTO_INCREMENT | Identificador de línea |
| folio_venta | FK, PK, NOT NULL | Referencia a VENTA |
| sku | FK, NOT NULL | Referencia a PRODUCTO |
| cantidad | NOT NULL, CHECK (cantidad > 0) | Cantidad vendida |
| precio_unitario | NOT NULL, CHECK (precio_unitario >= 0) | Precio unitario al momento de venta |
| descuento | NOT NULL, DEFAULT 0, CHECK (descuento >= 0) | Descuento aplicado |
| subtotal | NOT NULL, CHECK (subtotal >= 0) | Subtotal de la línea |
| updated_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `folio_venta` → VENTA(folio_venta) ON DELETE CASCADE
- FK: `sku` → PRODUCTO(sku) ON DELETE RESTRICT

**Restricciones adicionales:**
- CHECK: `subtotal = (precio_unitario * cantidad) - descuento`
- UNIQUE: `(folio_venta, sku)`

---

### FACTURA
Registro de facturas emitidas por ventas.

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| folio_factura | PK, NOT NULL | Folio único de factura |
| folio_venta | FK, NOT NULL, UNIQUE | Referencia a VENTA |
| id_cliente | FK, NOT NULL | Referencia a CLIENTE |
| id_sucursal | FK, NOT NULL | Sucursal emisora |
| cantidad_productos | NOT NULL, CHECK (cantidad_productos > 0) | Total de productos facturados |
| iva | NOT NULL, CHECK (iva >= 0) | IVA de la factura |
| subtotal_factura | NOT NULL, CHECK (subtotal_factura >= 0) | Subtotal de la factura |
| created_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `folio_venta` → VENTA(folio_venta) ON DELETE RESTRICT
- FK: `id_cliente` → CLIENTE(id_cliente) ON DELETE RESTRICT
- FK: `id_sucursal` → SUCURSAL(id_sucursal) ON DELETE RESTRICT

---

### COMPRA
Registro de operaciones de compra a proveedores.

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| folio_compra | PK, NOT NULL | Folio único de compra |
| id_proveedor | FK, NOT NULL | Referencia a PROVEEDOR |
| id_sucursal | FK, NOT NULL | Sucursal que realiza la compra |
| forma_pago | NOT NULL | Forma de pago utilizada |
| fecha_compra | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha y hora de la compra |
| iva | NOT NULL, CHECK (iva >= 0) | IVA de la compra |
| total_compra | NOT NULL, CHECK (total_compra > 0) | Total de la compra |
| estado_de_compra | NOT NULL, DEFAULT 'PENDIENTE' | Estado actual de la compra |
| created_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `id_proveedor` → PROVEEDOR(id_proveedor) ON DELETE RESTRICT
- FK: `id_sucursal` → SUCURSAL(id_sucursal) ON DELETE RESTRICT

**Restricciones adicionales:**
- CHECK: `estado_de_compra IN ('PENDIENTE', 'RECIBIDA', 'CANCELADA')`

---

### COMPRA/PRODUCTO
Tabla intermedia que registra los productos comprados en cada compra.

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| item | PK, NOT NULL, AUTO_INCREMENT | Identificador de línea |
| folio_compra | FK, PK, NOT NULL | Referencia a COMPRA |
| sku | FK, NOT NULL | Referencia a PRODUCTO |
| id_inventario | FK, NULL | Referencia a INVENTARIO (al recibir) |
| costo_unitario | NOT NULL, CHECK (costo_unitario > 0) | Costo unitario de compra |
| cantidad | NOT NULL, CHECK (cantidad > 0) | Cantidad comprada |
| subtotal | NOT NULL, CHECK (subtotal >= 0) | Subtotal de la línea |
| cantidad_recibida | NOT NULL, DEFAULT 0, CHECK (cantidad_recibida >= 0) | Cantidad recibida |
| updated_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `folio_compra` → COMPRA(folio_compra) ON DELETE CASCADE
- FK: `sku` → PRODUCTO(sku) ON DELETE RESTRICT
- FK: `id_inventario` → INVENTARIO(id_inventario) ON DELETE SET NULL

**Restricciones adicionales:**
- CHECK: `subtotal = costo_unitario * cantidad`
- CHECK: `cantidad_recibida <= cantidad`
- UNIQUE: `(folio_compra, sku)`

---

### SUCURSAL
Catálogo de sucursales de la organización.

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| id_sucursal | PK, NOT NULL, AUTO_INCREMENT | Identificador único de sucursal |
| rfc_encargado | NOT NULL | RFC del encargado |
| nombre | NOT NULL, UNIQUE | Nombre de la sucursal |
| direccion | NOT NULL | Dirección física |
| telefono | NULL | Teléfono de contacto |
| ciudad | NOT NULL | Ciudad |
| created_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

---

### INVENTARIO
Registro de existencias de productos por sucursal.

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| id_inventario | PK, NOT NULL, AUTO_INCREMENT | Identificador único |
| sku | FK, NOT NULL | Referencia a PRODUCTO |
| id_sucursal | FK, NOT NULL | Referencia a SUCURSAL |
| created_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `sku` → PRODUCTO(sku) ON DELETE RESTRICT
- FK: `id_sucursal` → SUCURSAL(id_sucursal) ON DELETE RESTRICT

**Restricciones adicionales:**
- UNIQUE: `(sku, id_sucursal)`

---

### STOCK
Registro de movimientos de stock en el inventario.

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| id_stock | PK, NOT NULL, AUTO_INCREMENT | Identificador único |
| id_inventario | FK, NOT NULL | Referencia a INVENTARIO |
| sku | FK, NOT NULL | Referencia a PRODUCTO |
| cantidad | NOT NULL, CHECK (cantidad >= 0) | Cantidad actual en stock |

**Relaciones:**
- FK: `id_inventario` → INVENTARIO(id_inventario) ON DELETE CASCADE
- FK: `sku` → PRODUCTO(sku) ON DELETE RESTRICT

**Restricciones adicionales:**
- UNIQUE: `(id_inventario, sku)`

---

### PRODUCTO
Catálogo de productos disponibles.

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| sku | PK, NOT NULL | Código único de producto |
| id_categoria | FK, NOT NULL | Referencia a CATEGORIA |
| nombre | NOT NULL | Nombre del producto |
| descripcion | NULL | Descripción detallada |
| precio | NOT NULL, CHECK (precio >= 0) | Precio de venta |
| created_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `id_categoria` → CATEGORIA(id_categoria) ON DELETE RESTRICT

**Índices adicionales:**
- INDEX en `nombre`
- INDEX en `id_categoria`

---

### CATEGORIA
Catálogo de categorías de productos.

| Campo | Restricciones | Descripción |
|-------|---------------|-------------|
| id_categoria | PK, NOT NULL, AUTO_INCREMENT | Identificador único de categoría |
| nombre | NOT NULL, UNIQUE | Nombre de la categoría |
| descripcion | NULL | Descripción de la categoría |
| created_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

---

## 🔄 Organización por Módulos

### Módulo de COMPRA

```
1. REGISTRO DE COMPRA
   ├─ Se crea un registro en COMPRA
   │  ├─ folio_compra (generado)
   │  ├─ id_proveedor (seleccionado)
   │  ├─ id_sucursal (sucursal destino)
   │  ├─ forma_pago
   │  ├─ fecha_compra (automática)
   │  └─ estado_de_compra = 'PENDIENTE'
   │
   └─ Se registran productos en COMPRA/PRODUCTO
      ├─ Por cada producto:
      │  ├─ sku
      │  ├─ cantidad solicitada
      │  ├─ costo_unitario
      │  ├─ subtotal (calculado)
      │  └─ cantidad_recibida = 0
      │
      └─ Se calcula total_compra e iva en COMPRA

2. RECEPCIÓN DE MERCANCÍA
   ├─ Se actualiza estado_de_compra = 'RECIBIDA'
   │
   └─ Por cada producto en COMPRA/PRODUCTO:
      ├─ Se verifica/crea registro en INVENTARIO
      │  ├─ Si no existe: se crea (sku, id_sucursal)
      │  └─ Si existe: se obtiene id_inventario
      │
      ├─ Se actualiza cantidad_recibida
      ├─ Se vincula id_inventario en COMPRA/PRODUCTO
      │
      └─ Se actualiza/crea STOCK
         ├─ Si existe: cantidad += cantidad_recibida
         └─ Si no existe: se crea nuevo registro

3. VALIDACIÓN FINAL
   └─ Se verifica que suma de subtotales = total_compra - iva
```

---

### Módulo de INVENTARIO

```
1. CONSULTA DE INVENTARIO
   ├─ Se obtienen registros de INVENTARIO
   │  └─ Filtrado por sucursal (opcional)
   │
   └─ Para cada inventario se consulta STOCK
      └─ Se muestra: sku, nombre producto, cantidad disponible

2. MOVIMIENTOS DE INVENTARIO
   ├─ ENTRADA (desde COMPRA)
   │  ├─ Origen: COMPRA/PRODUCTO al recibir mercancía
   │  ├─ Se verifica existencia en INVENTARIO
   │  └─ Se actualiza cantidad en STOCK
   │
   └─ SALIDA (desde VENTA)
      ├─ Origen: VENTA/PRODUCTO al registrar venta
      ├─ Se valida existencia en STOCK (cantidad >= cantidad_vendida)
      ├─ Se reduce cantidad en STOCK
      └─ Si cantidad < 0: ERROR (transacción se rechaza)

3. TRANSFERENCIAS ENTRE SUCURSALES (opcional)
   ├─ Sucursal origen:
   │  └─ Se reduce cantidad en STOCK
   │
   └─ Sucursal destino:
      ├─ Se verifica/crea INVENTARIO
      └─ Se aumenta cantidad en STOCK

4. ALERTAS DE STOCK
   └─ Se consulta STOCK con cantidad < umbral_mínimo
      └─ Se genera notificación/reporte
```

---

### Módulo de VENTA

```
1. REGISTRO DE VENTA
   ├─ Se crea registro en VENTA
   │  ├─ folio_venta (generado)
   │  ├─ id_cliente (seleccionado)
   │  ├─ id_empleado (usuario autenticado)
   │  ├─ id_sucursal (sucursal actual)
   │  └─ fecha (automática)
   │
   └─ Por cada producto vendido:
      ├─ VALIDACIÓN DE STOCK
      │  ├─ Se consulta STOCK para (sku, id_sucursal)
      │  ├─ Se verifica: cantidad_disponible >= cantidad_vendida
      │  └─ Si insuficiente: ERROR (venta no procede)
      │
      ├─ REGISTRO EN VENTA/PRODUCTO
      │  ├─ sku
      │  ├─ cantidad
      │  ├─ precio_unitario (precio actual de PRODUCTO)
      │  ├─ descuento (si aplica)
      │  └─ subtotal (calculado)
      │
      └─ ACTUALIZACIÓN DE STOCK
         └─ cantidad -= cantidad_vendida

2. CÁLCULO DE TOTALES
   ├─ subtotal_venta = Σ(subtotal de cada producto)
   ├─ iva = subtotal_venta * 0.16
   └─ total_venta = subtotal_venta + iva

3. EMISIÓN DE FACTURA (opcional)
   ├─ Se crea registro en FACTURA
   │  ├─ folio_factura (generado)
   │  ├─ folio_venta (vinculado)
   │  ├─ id_cliente
   │  ├─ id_sucursal
   │  ├─ cantidad_productos (total items)
   │  ├─ subtotal_factura
   │  └─ iva
   │
   └─ Relación 1:1 con VENTA (un folio_venta = una factura)

4. FINALIZACIÓN
   └─ Venta completada con inventario actualizado
```

---

## 🔗 Relaciones Entre Entidades

### Relaciones de Herencia (Especialización)

**PERSONA (Entidad Padre)**
```
PERSONA (1) ──┬──< CLIENTE (1)
              ├──< EMPLEADO (1)
              └──< PROVEEDOR (1)
```
- Una PERSONA puede ser CLIENTE, EMPLEADO o PROVEEDOR (o combinación)
- Relación 1:1 opcional entre PERSONA y cada especialización
- DELETE CASCADE: al eliminar PERSONA se eliminan sus especializaciones

---

### Relaciones del Módulo de Recursos Humanos

**EMPLEADO ↔ PUESTO**
```
EMPLEADO (N) ────< PUESTO/EMPLEADO (N) >──── PUESTO (1)
```
- Un EMPLEADO puede tener múltiples PUESTOS a lo largo del tiempo (N:N)
- Un PUESTO puede ser ocupado por múltiples EMPLEADOS (N:N)
- La tabla intermedia PUESTO/EMPLEADO registra el historial laboral
- Permite consultar puesto actual (`activo = TRUE`) e historial completo

---

### Relaciones del Módulo de Ventas

**VENTA - Relaciones principales**
```
CLIENTE (1) ────< VENTA (N)
EMPLEADO (1) ────< VENTA (N)
SUCURSAL (1) ────< VENTA (N)
VENTA (1) ────< VENTA/PRODUCTO (N) >──── PRODUCTO (1)
VENTA (1) ──── FACTURA (0..1)
```

- Un CLIENTE puede tener múltiples VENTAS (1:N)
- Un EMPLEADO puede realizar múltiples VENTAS (1:N)
- Una SUCURSAL puede procesar múltiples VENTAS (1:N)
- Una VENTA contiene múltiples PRODUCTOS mediante VENTA/PRODUCTO (N:N)
- Una VENTA puede tener opcionalmente una FACTURA (1:0..1)

**Flujo transaccional:**
1. VENTA → verifica STOCK disponible
2. VENTA/PRODUCTO → registra productos vendidos
3. STOCK → reduce cantidades
4. FACTURA (opcional) → documenta la venta

---

### Relaciones del Módulo de Compras

**COMPRA - Relaciones principales**
```
PROVEEDOR (1) ────< COMPRA (N)
SUCURSAL (1) ────< COMPRA (N)
COMPRA (1) ────< COMPRA/PRODUCTO (N) >──── PRODUCTO (1)
COMPRA/PRODUCTO (N) >──── INVENTARIO (0..1)
```

- Un PROVEEDOR puede tener múltiples COMPRAS (1:N)
- Una SUCURSAL puede realizar múltiples COMPRAS (1:N)
- Una COMPRA contiene múltiples PRODUCTOS mediante COMPRA/PRODUCTO (N:N)
- COMPRA/PRODUCTO se vincula con INVENTARIO al recibir mercancía (N:0..1)

**Flujo transaccional:**
1. COMPRA → registra orden de compra
2. COMPRA/PRODUCTO → detalla productos solicitados
3. Al recibir: COMPRA/PRODUCTO → INVENTARIO → STOCK (incrementa)

---

### Relaciones del Módulo de Inventario

**INVENTARIO - Relaciones principales**
```
SUCURSAL (1) ────< INVENTARIO (N) >──── PRODUCTO (1)
INVENTARIO (1) ────< STOCK (1)
INVENTARIO (1) <──── COMPRA/PRODUCTO (N)
PRODUCTO (1) ────< VENTA/PRODUCTO (N)
```

- Una SUCURSAL tiene múltiples registros de INVENTARIO (1:N)
- Un PRODUCTO puede estar en múltiples INVENTARIOS (diferentes sucursales) (1:N)
- Restricción UNIQUE: (sku, id_sucursal) → un producto aparece una vez por sucursal
- Cada INVENTARIO tiene un registro de STOCK (1:1)
- STOCK es actualizado por COMPRA/PRODUCTO (entradas) y VENTA/PRODUCTO (salidas)

**Integridad referencial:**
- No se puede eliminar un PRODUCTO si tiene movimientos en INVENTARIO
- No se puede eliminar una SUCURSAL si tiene INVENTARIO activo
- STOCK mantiene la cantidad física disponible en tiempo real

---

### Relaciones del Catálogo de Productos

**PRODUCTO ↔ CATEGORIA**
```
CATEGORIA (1) ────< PRODUCTO (N)
```

- Una CATEGORIA puede tener múltiples PRODUCTOS (1:N)
- Un PRODUCTO pertenece a una sola CATEGORIA (N:1)
- No se puede eliminar CATEGORIA si tiene PRODUCTOS asociados (RESTRICT)

---

### Diagrama de Dependencias Completo

```
                    PERSONA
                       |
        ┌──────────────┼──────────────┐
        │              │              │
    CLIENTE        EMPLEADO      PROVEEDOR
        │              │              │
        │         PUESTO/EMPLEADO     │
        │              │              │
        │            PUESTO           │
        │                             │
        └──────> VENTA <──────────────┘
                   │
                   ├──> VENTA/PRODUCTO ──> PRODUCTO ──> CATEGORIA
                   │         │                 │
                   │         └────> STOCK <────┤
                   │                   │       │
                   └──> FACTURA        │       │
                                       │       │
                   COMPRA <────────────┼───────┘
                     │                 │
                     └──> COMPRA/PRODUCTO
                              │
                              └──> INVENTARIO ──> SUCURSAL
                                       │
                                       └──> STOCK
```

---

## 📊 Restricciones de Integridad Adicionales

### Restricciones de Negocio

1. **Stock no negativo**: La cantidad en STOCK nunca puede ser negativa
2. **Venta con stock disponible**: No se puede vender más cantidad de la disponible
3. **Fechas coherentes**: `fecha_fin >= fecha_inicio` en PUESTO/EMPLEADO
4. **Totales consistentes**: `total = subtotal + iva` en VENTA y COMPRA
5. **Cantidad recibida**: `cantidad_recibida <= cantidad` en COMPRA/PRODUCTO
6. **Unicidad de factura**: Un `folio_venta` solo puede tener una FACTURA

### Reglas de Eliminación

- **CASCADE**: PERSONA → CLIENTE/EMPLEADO/PROVEEDOR
- **CASCADE**: VENTA → VENTA/PRODUCTO
- **CASCADE**: COMPRA → COMPRA/PRODUCTO
- **RESTRICT**: PRODUCTO (no se puede eliminar si tiene movimientos)
- **RESTRICT**: CATEGORIA (no se puede eliminar si tiene productos)
- **RESTRICT**: PROVEEDOR (no se puede eliminar si tiene compras)
- **RESTRICT**: CLIENTE (no se puede eliminar si tiene ventas)

---

## 🔍 Índices Recomendados

Para optimizar el rendimiento del sistema, se recomienda crear índices en los siguientes campos que son utilizados frecuentemente en consultas de búsqueda, filtrado y ordenamiento:

### Índices en PERSONA
- **RFC**: Facilita la búsqueda rápida de personas por su Registro Federal de Contribuyentes, campo utilizado frecuentemente en validaciones y consultas fiscales.
- **Email**: Optimiza las búsquedas por correo electrónico, especialmente útil en procesos de autenticación y comunicación con clientes.

### Índices en VENTA
- **Fecha**: Permite consultas eficientes de ventas por rangos de fechas, esencial para reportes diarios, mensuales y anuales.
- **ID Cliente**: Acelera la obtención del historial de compras de cada cliente.
- **ID Sucursal**: Optimiza los reportes de ventas por sucursal, útil para análisis de desempeño por ubicación.

### Índices en COMPRA
- **Fecha de compra**: Facilita la generación de reportes de compras por período, necesario para análisis de costos y planificación.
- **ID Proveedor**: Agiliza las consultas del historial de compras por proveedor, importante para evaluación de proveedores.
- **Estado de compra**: Optimiza la búsqueda de compras pendientes, recibidas o canceladas, crítico para el seguimiento de órdenes.

### Índices en INVENTARIO
- **SKU**: Acelera la búsqueda de inventario de productos específicos en todas las sucursales.
- **ID Sucursal**: Permite consultas rápidas de todo el inventario de una sucursal particular.

### Índices en PRODUCTO
- **Nombre**: Facilita las búsquedas de productos por nombre o búsquedas parciales (LIKE), mejorando la experiencia del usuario en el punto de venta.
- **ID Categoría**: Optimiza las consultas de productos por categoría, útil para navegación y filtrado de catálogos.

**Justificación técnica**: Estos índices mejoran significativamente el tiempo de respuesta en consultas frecuentes, especialmente cuando las tablas crecen en volumen. Los índices en claves foráneas también optimizan las operaciones JOIN entre tablas relacionadas, mientras que los índices en campos de fecha permiten ordenamientos y filtrados eficientes en reportes históricos.

---

## 📝 Notas de Implementación

1. **Transacciones**: Las operaciones de VENTA y COMPRA deben ejecutarse dentro de transacciones para garantizar consistencia
2. **Triggers**: Considerar triggers para actualizar automáticamente STOCK en operaciones de venta
3. **Auditoría**: Los campos `created_at` y `updated_at` permiten auditoría de cambios
4. **Estados**: COMPRA incluye gestión de estados (PENDIENTE, RECIBIDA, CANCELADA) para control del flujo
5. **Validaciones**: Implementar validaciones a nivel de aplicación además de las restricciones de base de datos
6. **Seguridad**: Los campos sensibles como RFC deben manejarse con cifrado o controles de acceso apropiados

---

## Consideraciones de Diseño

### Escalabilidad
- **Particionamiento**: La tabla `inventario` con clave compuesta permite distribución eficiente
- **Índices**: Claves foráneas indexadas automáticamente para consultas rápidas
- **Normalización**: Eliminación de redundancia manteniendo performance

### Flexibilidad
- **Campos opcionales**: Muchas relaciones permiten NULL para adaptabilidad
- **Extensibilidad**: Estructura preparada para nuevos módulos (devoluciones, promociones, etc.)
- **Multi-ubicación**: Diseño nativo para operaciones en múltiples tiendas

### Integridad de Datos
- **Totales calculados**: Subtotales y totales mantienen consistencia automática
- **Estados controlados**: Flujos de compra con estados bien definidos
- **Trazabilidad**: Timestamps automáticos en todas las tablas

### Performance
- **Claves surrogate**: IDs seriales para joins eficientes
- **Desnormalización controlada**: Totales precalculados para consultas frecuentes
- **Índices estratégicos**: Optimización para consultas comunes por fecha, cliente, producto

---

## Diagramas de Apoyo

Para visualizar este modelo:
1. **Diagrama ER completo**: Referencia visual del modelo entidad-relación
2. **Documentación detallada**: Este documento describe la estructura completa
3. **Scripts de implementación**: Archivos SQL para creación de tablas y restricciones

---

**Nota**: Este documento se enfoca en la estructura lógica del modelo. Para detalles de implementación como triggers, funciones y procedimientos, consulte la documentación técnica complementaria.
