# Proyecto Final — Bases de Datos II

![Sistema de Análisis de Ventas](https://github.com/user-attachments/assets/1207e249-903d-4e4d-8581-bf1b2b45937d)

**Profesor:** Pablo Salas Castillo • **Grupo:** CO02

Sistema integral de gestión y análisis de ventas con arquitectura OLTP/OLAP, desarrollado con React, Node.js y PostgreSQL. Implementa operaciones ABCCR, análisis multidimensional con ROLLUP/CUBE/RANK/DENSE_RANK, y generación de documentos XML.

---

## Tabla de Contenidos

- [Características](#-características)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Estructura de la Base de Datos](#-estructura-de-la-base-de-datos)
- [Uso del Sistema](#-uso-del-sistema)
- [Tecnologías](#-tecnologías)

---

## Características

### **Gestión de Productos (ABCCR)**
- **Alta**: Creación de nuevos productos con validación de campos
- **Baja**: Eliminación de productos con confirmación
- **Cambio**: Edición de información de productos existentes
- **Consulta**: Listado completo con búsqueda en tiempo real
- **Reportes**: Generación de análisis OLAP multidimensionales

### **Análisis OLAP (Datamart)**
- **ROLLUP**: Subtotales jerárquicos por año, categoría y producto
- **CUBE**: Todas las combinaciones posibles de dimensiones (año × sucursal)
- **RANK**: Ranking de productos con saltos en caso de empates
- **DENSE_RANK**: Ranking continuo sin saltos

### **Generación de XML**
- Comprobantes fiscales digitales por ID de venta
- Visualización con resaltado de sintaxis
- Descarga de archivos XML
- Metadata y validación en tiempo real

### **Validaciones Robustas**
- Validación de campos numéricos, fechas y texto
- Validación de rangos (fechas inicio/fin)
- Manejo de errores con mensajes específicos
- Prevención de inyecciones SQL

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTE (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   ABCCR      │  │  OLAP        │  │  XML         │  │
│  │   (CRUD)     │  │  Reports     │  │  Generator   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/JSON
                        ▼
┌─────────────────────────────────────────────────────────┐
│              SERVIDOR (Node.js/Express)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  API REST    │  │  Validación  │  │  XML Builder │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ SQL
                        ▼
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                  │
│                                                           │
│  ┌──────────────────────────────────────────┐            │
│  │          SISTEMA OLTP (Transaccional)     │            │
│  │  • Clientes                               │            │
│  │  • Productos                              │            │
│  │  • Ventas                                 │            │
│  │  • Sucursales                             │            │
│  └──────────────────────────────────────────┘            │
│                        │                                  │
│                        │ ETL Process                      │
│                        ▼                                  │
│  ┌──────────────────────────────────────────┐            │
│  │       DATAMART OLAP (Analítico)          │            │
│  │  • dim_tiempo                             │            │
│  │  • dim_producto                           │            │
│  │  • dim_sucursal                           │            │
│  │  • hechos_ventas (Fact Table)            │            │
│  └──────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

---

## Requisitos Previos

- **Node.js** v14 o superior
- **PostgreSQL** v12 o superior
- **npm** v6 o superior

---

## Instalación

### 1. Clonar el repositorio
```bash
git clone <url-repositorio>
cd proyecto_BDII
```

### 2. Configurar la Base de Datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE sistema_ventas;

# Ejecutar el script de inicialización
psql -U postgres -d sistema_ventas -f "Script de toda la base de satos.sql"
```

### 3. Instalar dependencias del servidor

```bash
cd server
npm install
```

**Dependencias instaladas:**
- `express` - Framework web
- `pg` - Driver PostgreSQL
- `cors` - Manejo de CORS
- `xml2js` - Generación de XML

### 4. Instalar dependencias del cliente

```bash
cd ../client
npm install
```

**Dependencias instaladas:**
- `react` - Librería UI
- `lucide-react` - Iconos
- `tailwindcss` - Framework CSS

### 5. Iniciar el sistema

**Terminal 1 - Servidor:**
```bash
cd server
node index.js
```
El servidor iniciará en `http://localhost:3001`

**Terminal 2 - Cliente:**
```bash
cd client
npm run dev
```
El cliente iniciará en `http://localhost:5173` (Vite) o `http://localhost:3000` (Create React App)

---

## Estructura de la Base de Datos

### **Esquema OLTP (Transaccional)**

```sql
-- Tablas principales
categorias_productos
productos
clientes
sucursales
ventas
detalle_ventas
```

### **Esquema OLAP (Datamart)**

```sql
-- Schema: dm_ventas
dim_tiempo        -- Dimensión temporal (fecha, año, mes, trimestre)
dim_producto      -- Dimensión de productos
dim_sucursal      -- Dimensión de sucursales
hechos_ventas     -- Tabla de hechos (métricas de ventas)
```

### **Proceso ETL**

La base de datos incluye un procedimiento almacenado para ejecutar el ETL:

```sql
CALL dm_ventas.ejecutar_etl_ventas();
```

Este proceso:
1. Limpia las tablas del datamart
2. Carga dimensiones (tiempo, producto, sucursal)
3. Carga la tabla de hechos con métricas agregadas
4. Retorna estadísticas de registros procesados

---

## Uso del Sistema

### **Conexión Inicial**

1. Abrir el navegador en la URL del cliente
2. Ingresar credenciales de PostgreSQL:
   - Usuario: `postgres`
   - Contraseña: (tu contraseña)
   - Base de datos: `sistema_ventas`
   - Host: `localhost`
   - Puerto: `5432`

### **Gestión de Productos (ABCCR)**

- **Crear producto**: Clic en "Nuevo Producto (Alta)"
- **Editar producto**: Clic en el ícono de editar (lápiz)
- **Eliminar producto**: Clic en el ícono de eliminar (papelera)
- **Buscar productos**: Usar la barra de búsqueda

### **Reportes OLAP**

1. Seleccionar el tipo de análisis (ROLLUP, CUBE, RANK, DENSE_RANK)
2. Configurar filtros:
   - Fecha Inicio
   - Fecha Fin
   - Producto (opcional)
3. Clic en "Ejecutar Reporte"

**Interpretación de resultados:**
- **Filas verdes oscuras**: Totales globales
- **Filas verdes claras**: Subtotales
- **Filas blancas**: Detalles
- **Rankings**: Los top 3 están resaltados en verde

### **Generación de XML**

1. Ir a la sección "Generación XML"
2. Ingresar un ID de venta válido
3. Clic en "Generar XML"
4. Visualizar el documento con resaltado de sintaxis
5. Descargar el archivo si es necesario

---

## Tecnologías

### **Frontend**
- React 18
- Tailwind CSS 3
- Lucide React (iconos)
- Vite (build tool)

### **Backend**
- Node.js
- Express.js
- pg (PostgreSQL driver)
- CORS

### **Base de Datos**
- PostgreSQL 12+
- Particionamiento por rangos
- Índices B-tree y BRIN
- Window Functions (RANK, DENSE_RANK)
- Grouping Sets (ROLLUP, CUBE)

### **Características Avanzadas de PostgreSQL**
- **Particionamiento**: Tabla `ventas` particionada por año
- **Índices Especializados**: BRIN para columnas temporales
- **Funciones de Ventana**: RANK(), DENSE_RANK(), ROW_NUMBER()
- **Grouping Sets**: ROLLUP, CUBE para análisis multidimensional
- **Procedimientos Almacenados**: ETL automatizado

---

## Estructura del Proyecto

```
proyecto_BDII/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── App.jsx        # Componente principal
│   │   └── ...
│   └── package.json
├── server/                 # Backend Node.js
│   ├── index.js           # Servidor Express
│   └── package.json
├── Script de toda la base de satos.sql  # Script completo de BD
└── README.md              # Este archivo
```

---

## Características Implementadas de la Rúbrica

- **Operaciones ABCCR** completas con validación
- **Generación de XML** con visualización mejorada
- **Validación de campos** (numéricos, fechas, texto)
- **ROLLUP** con subtotales jerárquicos
- **CUBE** con todas las combinaciones
- **RANK** con saltos en empates
- **DENSE_RANK** sin saltos
- **Datamart** con esquema estrella
- **Proceso ETL** implementado
- **Diseño profesional** con esquema de colores verde, blanco y negro

---

## Autor

**Proyecto Final - Bases de Datos II**
Profesor: Pablo Salas Castillo
Grupo: CO02

---

## Licencia

Este proyecto es parte de un trabajo académico para el curso de Bases de Datos II.
