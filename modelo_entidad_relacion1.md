# Documentación del Diagrama Entidad-Relación
## Sistema de Gestión de Compras, Ventas e Inventario

---

## 📋 Descripción de Tablas

### PERSONA
Tabla central que almacena información de todas las personas del sistema (clientes, empleados, proveedores).

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_persona | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único de persona |
| razon_social | VARCHAR(200) | NOT NULL | Razón social o nombre completo |
| rfc | VARCHAR(13) | NOT NULL, UNIQUE | Registro Federal de Contribuyentes |
| telefono | VARCHAR(20) | NULL | Número de teléfono |
| email | VARCHAR(100) | NOT NULL, UNIQUE | Correo electrónico |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de última actualización |

**Índices adicionales:**
- INDEX en `rfc`
- INDEX en `email`

---

### CLIENTE
Tabla que extiende la información de personas que son clientes.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_cliente | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único de cliente |
| id_persona | INT | FK, NOT NULL, UNIQUE | Referencia a PERSONA |

**Relaciones:**
- FK: `id_persona` → PERSONA(id_persona) ON DELETE CASCADE

---

### PROVEEDOR
Tabla que extiende la información de personas que son proveedores.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_proveedor | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único de proveedor |
| id_persona | INT | FK, NOT NULL, UNIQUE | Referencia a PERSONA |

**Relaciones:**
- FK: `id_persona` → PERSONA(id_persona) ON DELETE CASCADE

---

### PUESTO
Catálogo de puestos laborales disponibles en la organización.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_puesto | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único de puesto |
| nombre | VARCHAR(100) | NOT NULL, UNIQUE | Nombre del puesto |
| salario | DECIMAL(10,2) | NOT NULL, CHECK (salario > 0) | Salario del puesto |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

---

### PUESTO/EMPLEADO
Tabla intermedia que relaciona puestos con empleados (permite historial laboral).

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único |
| id_empleado | INT | FK, NOT NULL | Referencia a EMPLEADO |
| id_puesto | INT | FK, NOT NULL | Referencia a PUESTO |
| fecha_inicio | DATE | NOT NULL | Fecha de inicio en el puesto |
| fecha_fin | DATE | NULL | Fecha de fin en el puesto |
| activo | BOOLEAN | NOT NULL, DEFAULT TRUE | Indica si es el puesto actual |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `id_empleado` → EMPLEADO(id_empleado) ON DELETE CASCADE
- FK: `id_puesto` → PUESTO(id_puesto) ON DELETE RESTRICT

**Restricciones adicionales:**
- CHECK: `fecha_fin IS NULL OR fecha_fin >= fecha_inicio`
- UNIQUE: `(id_empleado, id_puesto, fecha_inicio)`

---

### EMPLEADO
Tabla que extiende la información de personas que son empleados.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_empleado | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único de empleado |
| id_persona | INT | FK, NOT NULL, UNIQUE | Referencia a PERSONA |
| apellido_paterno | VARCHAR(100) | NOT NULL | Apellido paterno |
| apellido_materno | VARCHAR(100) | NULL | Apellido materno |
| id_puesto | INT | FK, NOT NULL | Referencia al puesto actual |

**Relaciones:**
- FK: `id_persona` → PERSONA(id_persona) ON DELETE CASCADE
- FK: `id_puesto` → PUESTO(id_puesto) ON DELETE RESTRICT

---

### VENTA
Registro de operaciones de venta realizadas.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| folio_venta | VARCHAR(20) | PK, NOT NULL | Folio único de venta |
| id_cliente | INT | FK, NOT NULL | Referencia a CLIENTE |
| id_empleado | INT | FK, NOT NULL | Empleado que realizó la venta |
| fecha | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha y hora de la venta |
| id_sucursal | INT | FK, NOT NULL | Sucursal donde se realizó |
| subtotal_venta | DECIMAL(12,2) | NOT NULL, CHECK (subtotal_venta >= 0) | Subtotal de la venta |
| iva | DECIMAL(12,2) | NOT NULL, CHECK (iva >= 0) | IVA aplicado |
| total_venta | DECIMAL(12,2) | NOT NULL, CHECK (total_venta >= 0) | Total de la venta |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `id_cliente` → CLIENTE(id_cliente) ON DELETE RESTRICT
- FK: `id_empleado` → EMPLEADO(id_empleado) ON DELETE RESTRICT
- FK: `id_sucursal` → SUCURSAL(id_sucursal) ON DELETE RESTRICT

**Restricciones adicionales:**
- CHECK: `total_venta = subtotal_venta + iva`

---

### VENTA/PRODUCTO
Tabla intermedia que registra los productos vendidos en cada venta.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| item | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador de línea |
| folio_venta | VARCHAR(20) | FK, PK, NOT NULL | Referencia a VENTA |
| sku | VARCHAR(50) | FK, NOT NULL | Referencia a PRODUCTO |
| cantidad | INT | NOT NULL, CHECK (cantidad > 0) | Cantidad vendida |
| precio_unitario | DECIMAL(10,2) | NOT NULL, CHECK (precio_unitario >= 0) | Precio unitario al momento de venta |
| descuento | DECIMAL(10,2) | NOT NULL, DEFAULT 0, CHECK (descuento >= 0) | Descuento aplicado |
| subtotal | DECIMAL(12,2) | NOT NULL, CHECK (subtotal >= 0) | Subtotal de la línea |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `folio_venta` → VENTA(folio_venta) ON DELETE CASCADE
- FK: `sku` → PRODUCTO(sku) ON DELETE RESTRICT

**Restricciones adicionales:**
- CHECK: `subtotal = (precio_unitario * cantidad) - descuento`
- UNIQUE: `(folio_venta, sku)`

---

### FACTURA
Registro de facturas emitidas por ventas.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| folio_factura | VARCHAR(20) | PK, NOT NULL | Folio único de factura |
| folio_venta | VARCHAR(20) | FK, NOT NULL, UNIQUE | Referencia a VENTA |
| id_cliente | INT | FK, NOT NULL | Referencia a CLIENTE |
| id_sucursal | INT | FK, NOT NULL | Sucursal emisora |
| cantidad_productos | INT | NOT NULL, CHECK (cantidad_productos > 0) | Total de productos facturados |
| iva | DECIMAL(12,2) | NOT NULL, CHECK (iva >= 0) | IVA de la factura |
| subtotal_factura | DECIMAL(12,2) | NOT NULL, CHECK (subtotal_factura >= 0) | Subtotal de la factura |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `folio_venta` → VENTA(folio_venta) ON DELETE RESTRICT
- FK: `id_cliente` → CLIENTE(id_cliente) ON DELETE RESTRICT
- FK: `id_sucursal` → SUCURSAL(id_sucursal) ON DELETE RESTRICT

---

### COMPRA
Registro de operaciones de compra a proveedores.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| folio_compra | VARCHAR(20) | PK, NOT NULL | Folio único de compra |
| id_proveedor | INT | FK, NOT NULL | Referencia a PROVEEDOR |
| id_sucursal | INT | FK, NOT NULL | Sucursal que realiza la compra |
| forma_pago | VARCHAR(50) | NOT NULL | Forma de pago utilizada |
| fecha_compra | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha y hora de la compra |
| iva | DECIMAL(12,2) | NOT NULL, CHECK (iva >= 0) | IVA de la compra |
| total_compra | DECIMAL(12,2) | NOT NULL, CHECK (total_compra > 0) | Total de la compra |
| estado_de_compra | VARCHAR(20) | NOT NULL, DEFAULT 'PENDIENTE' | Estado actual de la compra |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `id_proveedor` → PROVEEDOR(id_proveedor) ON DELETE RESTRICT
- FK: `id_sucursal` → SUCURSAL(id_sucursal) ON DELETE RESTRICT

**Restricciones adicionales:**
- CHECK: `estado_de_compra IN ('PENDIENTE', 'RECIBIDA', 'CANCELADA')`

---

### COMPRA/PRODUCTO
Tabla intermedia que registra los productos comprados en cada compra.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| item | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador de línea |
| folio_compra | VARCHAR(20) | FK, PK, NOT NULL | Referencia a COMPRA |
| sku | VARCHAR(50) | FK, NOT NULL | Referencia a PRODUCTO |
| id_inventario | INT | FK, NULL | Referencia a INVENTARIO (al recibir) |
| costo_unitario | DECIMAL(10,2) | NOT NULL, CHECK (costo_unitario > 0) | Costo unitario de compra |
| cantidad | INT | NOT NULL, CHECK (cantidad > 0) | Cantidad comprada |
| subtotal | DECIMAL(12,2) | NOT NULL, CHECK (subtotal >= 0) | Subtotal de la línea |
| cantidad_recibida | INT | NOT NULL, DEFAULT 0, CHECK (cantidad_recibida >= 0) | Cantidad recibida |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

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

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_sucursal | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único de sucursal |
| rfc_encargado | VARCHAR(13) | NOT NULL | RFC del encargado |
| nombre | VARCHAR(100) | NOT NULL, UNIQUE | Nombre de la sucursal |
| direccion | VARCHAR(200) | NOT NULL | Dirección física |
| telefono | VARCHAR(20) | NULL | Teléfono de contacto |
| ciudad | VARCHAR(100) | NOT NULL | Ciudad |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

---

### INVENTARIO
Registro de existencias de productos por sucursal.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_inventario | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único |
| sku | VARCHAR(50) | FK, NOT NULL | Referencia a PRODUCTO |
| id_sucursal | INT | FK, NOT NULL | Referencia a SUCURSAL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `sku` → PRODUCTO(sku) ON DELETE RESTRICT
- FK: `id_sucursal` → SUCURSAL(id_sucursal) ON DELETE RESTRICT

**Restricciones adicionales:**
- UNIQUE: `(sku, id_sucursal)`

---

### STOCK
Registro de movimientos de stock en el inventario.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_stock | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único |
| id_inventario | INT | FK, NOT NULL | Referencia a INVENTARIO |
| sku | VARCHAR(50) | FK, NOT NULL | Referencia a PRODUCTO |
| cantidad | INT | NOT NULL, CHECK (cantidad >= 0) | Cantidad actual en stock |

**Relaciones:**
- FK: `id_inventario` → INVENTARIO(id_inventario) ON DELETE CASCADE
- FK: `sku` → PRODUCTO(sku) ON DELETE RESTRICT

**Restricciones adicionales:**
- UNIQUE: `(id_inventario, sku)`

---

### PRODUCTO
Catálogo de productos disponibles.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| sku | VARCHAR(50) | PK, NOT NULL | Código único de producto |
| id_categoria | INT | FK, NOT NULL | Referencia a CATEGORIA |
| nombre | VARCHAR(200) | NOT NULL | Nombre del producto |
| descripcion | TEXT | NULL | Descripción detallada |
| precio | DECIMAL(10,2) | NOT NULL, CHECK (precio >= 0) | Precio de venta |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

**Relaciones:**
- FK: `id_categoria` → CATEGORIA(id_categoria) ON DELETE RESTRICT

**Índices adicionales:**
- INDEX en `nombre`
- INDEX en `id_categoria`

---

### CATEGORIA
Catálogo de categorías de productos.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_categoria | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único de categoría |
| nombre | VARCHAR(100) | NOT NULL, UNIQUE | Nombre de la categoría |
| descripcion | TEXT | NULL | Descripción de la categoría |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de actualización |

---

## 🔄 Secuencia de Módulos

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

Para optimizar consultas frecuentes:

```sql
-- PERSONA
CREATE INDEX idx_persona_rfc ON PERSONA(rfc);
CREATE INDEX idx_persona_email ON PERSONA(email);

-- VENTA
CREATE INDEX idx_venta_fecha ON VENTA(fecha);
CREATE INDEX idx_venta_cliente ON VENTA(id_cliente);
CREATE INDEX idx_venta_sucursal ON VENTA(id_sucursal);

-- COMPRA
CREATE INDEX idx_compra_fecha ON COMPRA(fecha_compra);
CREATE INDEX idx_compra_proveedor ON COMPRA(id_proveedor);
CREATE INDEX idx_compra_estado ON COMPRA(estado_de_compra);

-- INVENTARIO
CREATE INDEX idx_inventario_sku ON INVENTARIO(sku);
CREATE INDEX idx_inventario_sucursal ON INVENTARIO(id_sucursal);

-- PRODUCTO
CREATE INDEX idx_producto_nombre ON PRODUCTO(nombre);
CREATE INDEX idx_producto_categoria ON PRODUCTO(id_categoria);
```

---

## 📝 Notas de Implementación

1. **Transacciones**: Las operaciones de VENTA y COMPRA deben ejecutarse dentro de transacciones para garantizar consistencia
2. **Triggers**: Considerar triggers para actualizar automáticamente STOCK en operaciones de venta
3. **Auditoría**: Los campos `created_at` y `updated_at` permiten auditoría de cambios
