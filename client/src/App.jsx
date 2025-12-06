import { useState, useEffect } from 'react';
import {
  Search, Package, BarChart3, FileText, LogOut, TrendingUp,
  Calendar, Filter, Download, RefreshCw, AlertCircle, CheckCircle,
  Plus, Edit, Trash2, X, Save, Info
} from 'lucide-react';

// ============================================
// COMPONENTES DE UI REUTILIZABLES
// ============================================

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', disabled = false, icon: Icon, className = '' }) => {
  const variants = {
    primary: 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white hover:bg-gray-50 text-black border-2 border-green-600',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-orange-600 hover:bg-orange-700 text-white'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, className = '', min, max, step, pattern }) => {
  // Validación para campos numéricos
  const handleChange = (e) => {
    if (type === 'number') {
      const val = e.target.value;
      // Solo permitir números, punto decimal y signo negativo
      if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
        onChange(e);
      }
    } else if (type === 'text' && pattern) {
      // Si hay un patrón definido, validar
      onChange(e);
    } else {
      onChange(e);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="text-xs font-bold text-gray-600 uppercase mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        pattern={pattern}
        className="border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-black"
      />
    </div>
  );
};

const Select = ({ label, value, onChange, options, placeholder, required = false, className = '' }) => (
  <div className={`flex flex-col ${className}`}>
    {label && (
      <label className="text-xs font-bold text-gray-600 uppercase mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-black"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const Alert = ({ type = 'info', message, onClose }) => {
  const types = {
    success: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-800', icon: CheckCircle },
    error: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-800', icon: AlertCircle },
    info: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-800', icon: AlertCircle }
  };

  const style = types[type];
  const Icon = style.icon;

  return (
    <div className={`${style.bg} ${style.text} border-l-4 ${style.border} p-4 rounded-lg flex items-start gap-3 mb-4 animate-in fade-in slide-in-from-top-2`}>
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">{message}</div>
      {onClose && (
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
      )}
    </div>
  );
};

const LoadingSpinner = ({ message = 'Cargando...' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
    <p className="mt-4 text-black font-semibold">{message}</p>
  </div>
);

// ============================================
// NUEVO COMPONENTE: MODAL DE PRODUCTO (ALTA/CAMBIO)
// ============================================

const ProductModal = ({ isOpen, onClose, product, onSave, categories }) => {
  const [formData, setFormData] = useState({
    nombre_producto: '',
    descripcion: '',
    condicion: 'Nuevo',
    id_categoria: ''
  });

  // Cargar datos si estamos editando
  useEffect(() => {
    if (product) {
      setFormData({
        nombre_producto: product.nombre_producto,
        descripcion: product.descripcion || '',
        condicion: product.condicion || 'Nuevo',
        // Intentamos mapear la categoría por nombre si no tenemos el ID directo en la vista, 
        // o usamos el ID si está disponible.
        id_categoria: product.id_categoria || '' 
      });
    } else {
      // Limpiar form para alta nueva
      setFormData({ nombre_producto: '', descripcion: '', condicion: 'Nuevo', id_categoria: '' });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="bg-green-600 px-6 py-4 border-b-4 border-green-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {product ? <Edit size={20} className="text-white"/> : <Plus size={20} className="text-white"/>}
            {product ? 'Editar Producto' : 'Alta de Nuevo Producto'}
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body Modal */}
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-5">
          <Input 
            label="Nombre del Producto" 
            value={formData.nombre_producto} 
            onChange={e => setFormData({...formData, nombre_producto: e.target.value})}
            required
            placeholder="Ej. Laptop HP Pavilion"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Categoría"
              value={formData.id_categoria}
              onChange={e => setFormData({...formData, id_categoria: e.target.value})}
              required
              placeholder="Seleccionar..."
              options={categories.map(c => ({ value: c.id_categoria, label: c.nombre_categoria }))}
            />
            
            <Select 
              label="Condición"
              value={formData.condicion}
              onChange={e => setFormData({...formData, condicion: e.target.value})}
              required
              options={[
                { value: 'Nuevo', label: 'Nuevo' },
                { value: 'Usado', label: 'Usado' },
                { value: 'Reacondicionado', label: 'Reacondicionado' }
              ]}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-600 uppercase mb-1">Descripción</label>
            <textarea 
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[100px]"
              value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
              placeholder="Detalles del producto..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
            <Button variant="primary" type="submit" icon={Save}>Guardar Datos</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE FILTROS (REPORTES)
// ============================================

const FilterBar = ({ products, onFilter, loading, showAlert }) => {
  const [start, setStart] = useState('2025-01-01');
  const [end, setEnd] = useState('2026-12-31');
  const [sku, setSku] = useState('all');

  const handleFilter = () => {
    // Validar que las fechas no estén vacías
    if (!start || !end) {
      showAlert('error', 'Las fechas de inicio y fin son requeridas');
      return;
    }

    const fechaInicio = new Date(start);
    const fechaFin = new Date(end);

    // Validar que las fechas sean válidas
    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      showAlert('error', 'Las fechas ingresadas no son válidas');
      return;
    }

    // Validar que la fecha inicial no sea mayor a la fecha final
    if (fechaInicio > fechaFin) {
      showAlert('error', 'La fecha inicial no puede ser mayor a la fecha final');
      return;
    }

    onFilter(start, end, sku);
  };

  return (
    <Card className="p-5 mb-6 border-l-4 border-green-600 bg-white shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Filter size={20} className="text-green-700" />
        </div>
        <h3 className="font-bold text-black text-lg">Filtros de Análisis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input label="Fecha Inicio" type="date" value={start} onChange={e => setStart(e.target.value)} required />
        <Input label="Fecha Fin" type="date" value={end} onChange={e => setEnd(e.target.value)} required />

        <Select
          label="Producto"
          value={sku}
          onChange={e => setSku(e.target.value)}
          options={[
            { value: 'all', label: '-- Todos los Productos --' },
            ...products.map(p => ({ value: p.sku, label: p.nombre_producto }))
          ]}
        />

        <div className="flex items-end">
          <Button onClick={handleFilter} disabled={loading} icon={loading ? RefreshCw : BarChart3} className="w-full">
            {loading ? 'Analizando...' : 'Ejecutar Reporte'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// ============================================
// COMPONENTE DE TABLA GENÉRICA (SOLO PARA REPORTES)
// ============================================

const DataTable = ({ data, loading, emptyMessage = 'No hay datos disponibles' }) => {
  if (loading) return <LoadingSpinner message="Procesando datos..." />;

  if (!data || data.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-50" />
          <p className="italic">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  const headers = Object.keys(data[0]);

  // Función para detectar si es una fila de total/subtotal
  const esFilaTotal = (row) => {
    return Object.values(row).some(val =>
      typeof val === 'string' && (
        val.includes('TOTAL') ||
        val.includes('TODAS') ||
        val.includes('TODOS') ||
        val.includes('TODO')
      )
    );
  };

  // Función para contar cuántos "TODOS/TODAS" tiene (nivel de agregación)
  const nivelAgregacion = (row) => {
    let count = 0;
    Object.values(row).forEach(val => {
      if (typeof val === 'string' && (val.includes('TODAS') || val.includes('TODOS') || val.includes('TODO'))) {
        count++;
      }
    });
    return count;
  };

  // Función para formatear valores numéricos
  const formatearValor = (val, key) => {
    // Si es una columna de ventas, totales, montos, etc.
    if (key.toLowerCase().includes('venta') || key.toLowerCase().includes('total') || key.toLowerCase().includes('monto')) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num);
      }
    }

    // Si es un ranking, mostrar con badge
    if (key.toLowerCase() === 'ranking') {
      const rank = parseInt(val);
      if (!isNaN(rank)) {
        let colorClass = 'bg-gray-100 text-gray-700';
        if (rank === 1) colorClass = 'bg-green-600 text-white font-bold';
        else if (rank === 2) colorClass = 'bg-green-500 text-white font-bold';
        else if (rank === 3) colorClass = 'bg-green-400 text-white font-bold';
        else if (rank <= 10) colorClass = 'bg-green-100 text-green-700 font-semibold';

        return <span className={`px-3 py-1 rounded-full text-sm ${colorClass}`}>#{val}</span>;
      }
    }

    // Si es unidades
    if (key.toLowerCase() === 'unidades') {
      return <span className="font-semibold text-black">{val}</span>;
    }

    return val;
  };

  return (
    <Card className="overflow-hidden shadow-xl border-2 border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-gray-300">
          <thead className="bg-gradient-to-r from-green-600 to-green-700">
            <tr>
              {headers.map(key => (
                <th key={key} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">
                  {key.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, i) => {
              const esTotal = esFilaTotal(row);
              const nivel = nivelAgregacion(row);

              // Definir colores según el nivel de agregación
              let rowClass = 'hover:bg-gray-50 transition-colors';
              let textClass = 'text-gray-700';

              if (esTotal) {
                if (nivel >= 3) {
                  // Total global (máximo nivel)
                  rowClass = 'bg-green-600 hover:bg-green-700 font-bold border-y-4 border-green-700';
                  textClass = 'text-white text-base';
                } else if (nivel === 2) {
                  // Subtotal nivel 2
                  rowClass = 'bg-green-100 hover:bg-green-200 font-bold border-y-2 border-green-300';
                  textClass = 'text-green-900';
                } else if (nivel === 1) {
                  // Subtotal nivel 1
                  rowClass = 'bg-green-50 hover:bg-green-100 font-semibold';
                  textClass = 'text-green-800';
                }
              }

              return (
                <tr key={i} className={rowClass}>
                  {headers.map((key, j) => (
                    <td key={j} className={`px-6 py-3 text-sm ${textClass} whitespace-nowrap`}>
                      {row[key] !== null ? formatearValor(row[key], key) : '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-t-2 border-green-600 text-sm text-gray-700">
        <div className="flex justify-between items-center">
          <span>Total de registros: <span className="font-bold text-green-700 text-lg">{data.length}</span></span>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-600 rounded"></div> Total Global
            </span>
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div> Subtotales
            </span>
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div> Detalles
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function App() {
  const [creds, setCreds] = useState({ user: 'postgres', password: '', host: 'localhost', port: 5432, database: 'sistema_ventas' });
  const [conectado, setConectado] = useState(false);
  const [view, setView] = useState('abccr');
  const [reportType, setReportType] = useState('rollup');

  // Datos
  const [data, setData] = useState([]);
  const [productList, setProductList] = useState([]);
  const [categories, setCategories] = useState([]); // Lista de categorías para el modal

  // XML
  const [xmlId, setXmlId] = useState('');
  const [xmlContent, setXmlContent] = useState(null);

  // Estados UI
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // --- API HELPER ---
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // --- CONEXIÓN ---
  const conectar = async () => {
    // Validaciones robustas del formulario de login
    if (!creds.user || creds.user.trim() === '') {
      return showAlert('error', 'El usuario es requerido');
    }
    if (!creds.password || creds.password.trim() === '') {
      return showAlert('error', 'La contraseña es requerida');
    }
    if (!creds.database || creds.database.trim() === '') {
      return showAlert('error', 'El nombre de la base de datos es requerido');
    }
    if (!creds.host || creds.host.trim() === '') {
      return showAlert('error', 'El host es requerido');
    }
    if (!creds.port || creds.port < 1 || creds.port > 65535) {
      return showAlert('error', 'El puerto debe estar entre 1 y 65535');
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/connect', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds)
      });
      const result = await response.json();
      if (result.success) {
        setConectado(true);
        showAlert('success', 'Conexión establecida exitosamente');
        await cargarCatalogos();
        await cargarABCCR();
      } else {
        showAlert('error', `Error: ${result.message}`);
      }
    } catch (e) { showAlert('error', 'No se pudo conectar al servidor.'); }
    finally { setLoading(false); }
  };

  // Cargar listas auxiliares (Categorías y lista simple de productos para filtros)
  const cargarCatalogos = async () => {
    try {
      // Lista para filtros de reportes
      const rProd = await fetch('http://localhost:3001/api/list/products');
      setProductList(await rProd.json());

      // Lista de categorías para el modal de alta
      const rCat = await fetch('http://localhost:3001/api/list/categories');
      setCategories(await rCat.json());
    } catch (e) { console.error("Error cargando catálogos", e); }
  };

  // --- FUNCIONES ABCCR (CRUD) ---
  
  // Read (Consulta)
  const cargarABCCR = async () => {
    setLoading(true);
    setView('abccr');
    try {
      const r = await fetch('http://localhost:3001/api/products');
      setData(await r.json());
    } catch (e) { showAlert('error', 'Error al cargar catálogo'); }
    finally { setLoading(false); }
  };

  // Create & Update (Alta y Cambio)
  const handleSaveProduct = async (formData) => {
    try {
      const isEdit = !!editingProduct;
      const url = isEdit 
        ? `http://localhost:3001/api/products/${editingProduct.sku}`
        : 'http://localhost:3001/api/products';
      
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(formData)
      });
      const result = await res.json();

      if (result.success) {
        showAlert('success', isEdit ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
        setIsModalOpen(false);
        cargarABCCR(); // Recargar tabla
      } else {
        showAlert('error', result.error || 'Error al guardar');
      }
    } catch(e) { showAlert('error', 'Error de red al guardar'); }
  };

  // Delete (Baja)
  const handleDeleteProduct = async (sku) => {
    if(!window.confirm("¿Estás seguro de que deseas dar de BAJA este producto? Esta acción no se puede deshacer.")) return;
    
    try {
      const res = await fetch(`http://localhost:3001/api/products/${sku}`, { method: 'DELETE' });
      const result = await res.json();
      
      if(result.success) {
        showAlert('success', 'Producto eliminado (Baja exitosa)');
        cargarABCCR(); // Recargar tabla
      } else {
        showAlert('error', result.error || 'No se pudo eliminar el producto');
      }
    } catch(e) { showAlert('error', 'Error de red al eliminar'); }
  };

  // --- REPORTES ---
  const cargarReporte = async (start, end, sku) => {
    setLoading(true);
    try {
      let endpoint = 'rollup';
      if (reportType === 'cube') endpoint = 'cube';
      if (reportType === 'rank' || reportType === 'dense') endpoint = 'rank';
      const denseParam = reportType === 'dense' ? '&type=dense' : '';
      const url = `http://localhost:3001/api/reports/${endpoint}?start=${start}&end=${end}&sku=${sku}${denseParam}`;
      const r = await fetch(url);
      const result = await r.json();
      setData(result);
      showAlert('success', `Reporte ${reportType.toUpperCase()} generado`);
    } catch (e) { showAlert('error', 'Error al generar reporte'); }
    finally { setLoading(false); }
  };

  // --- XML ---
  const generarXML = async () => {
    // Validar que el ID no esté vacío
    if (!xmlId || xmlId.trim() === '') {
      return showAlert('error', 'El ID de venta es requerido');
    }

    // Validar que el ID sea numérico
    const idNumerico = parseInt(xmlId);
    if (isNaN(idNumerico) || idNumerico <= 0) {
      return showAlert('error', 'El ID de venta debe ser un número positivo');
    }

    setLoading(true);
    try {
      const r = await fetch(`http://localhost:3001/api/xml/${idNumerico}`);
      const d = await r.json();
      if (d.xml) {
        setXmlContent(d.xml);
        showAlert('success', 'XML generado exitosamente');
      } else {
        showAlert('error', d.error || 'Error al generar XML');
      }
    } catch (e) {
      showAlert('error', 'Error de red al generar XML');
    } finally {
      setLoading(false);
    }
  };

  const descargarXML = () => {
    if (!xmlContent) return;
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `factura-${xmlId}.xml`; a.click();
    URL.revokeObjectURL(url);
  };

  const cerrarSesion = () => {
    setConectado(false); setData([]); setProductList([]); setXmlContent(null);
    setCreds({ ...creds, password: '' });
  };

  // --- FILTRO LOCAL PARA LA TABLA ABCCR ---
  const dataFiltrada = data.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // --- RENDER LOGIN ---
  if (!conectado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-black">
        <Card className="p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-300 border-4 border-green-600">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <BarChart3 size={32} className="text-green-700" />
            </div>
            <h2 className="text-3xl font-bold text-black">Proyecto Final BDII</h2>
            <p className="text-gray-600 mt-2 font-semibold">Sistema de Análisis de Ventas</p>
            <p className="text-gray-500 text-sm mt-1">OLAP & Business Intelligence</p>
          </div>
          {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
          <div className="space-y-4">
            <Input
              label="Usuario"
              value={creds.user}
              onChange={e => setCreds({ ...creds, user: e.target.value })}
              required
              placeholder="postgres"
            />
            <Input
              label="Contraseña"
              type="password"
              value={creds.password}
              onChange={e => setCreds({ ...creds, password: e.target.value })}
              required
              placeholder="Ingresa tu contraseña"
            />
            <Input
              label="Base de Datos"
              value={creds.database}
              onChange={e => setCreds({ ...creds, database: e.target.value })}
              required
              placeholder="sistema_ventas"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Host"
                value={creds.host}
                onChange={e => setCreds({ ...creds, host: e.target.value })}
                required
                placeholder="localhost"
              />
              <Input
                label="Puerto"
                type="number"
                value={creds.port}
                onChange={e => setCreds({ ...creds, port: parseInt(e.target.value) || '' })}
                required
                min={1}
                max={65535}
                placeholder="5432"
              />
            </div>
            <Button onClick={conectar} disabled={loading} className="w-full mt-6">{loading ? 'Conectando...' : 'Iniciar Sesión'}</Button>
          </div>
        </Card>
      </div>
    );
  }

  // --- RENDER PRINCIPAL ---
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-black text-white shadow-2xl flex-shrink-0 border-r-4 border-green-600">
        <div className="p-6 border-b-2 border-green-600 bg-gradient-to-r from-black to-gray-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg"><TrendingUp size={24} /></div>
            <div>
              <h1 className="text-xl font-bold text-white">Proyecto Final BDII</h1>
              <p className="text-xs text-green-400">Panel de Control</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          <button onClick={cargarABCCR} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${view === 'abccr' ? 'bg-green-600 shadow-lg shadow-green-500/50' : 'hover:bg-gray-900 border border-gray-800'}`}>
            <Package size={20} /><div className="text-left"><div className="font-semibold">Gestión de Productos</div><div className="text-xs text-gray-400">ABCCR - Operaciones CRUD</div></div>
          </button>
          <div className="pt-4 pb-2 px-3 text-xs font-bold text-green-400 uppercase tracking-wider border-t border-gray-800 mt-3">Análisis de Datos</div>
          <button onClick={() => setView('reports')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${view === 'reports' ? 'bg-green-600 shadow-lg shadow-green-500/50' : 'hover:bg-gray-900 border border-gray-800'}`}>
            <BarChart3 size={20} /><div className="text-left"><div className="font-semibold">Datamarts OLAP</div><div className="text-xs text-gray-400">Análisis Multidimensional</div></div>
          </button>
          <button onClick={() => setView('xml')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${view === 'xml' ? 'bg-green-600 shadow-lg shadow-green-500/50' : 'hover:bg-gray-900 border border-gray-800'}`}>
            <FileText size={20} /><div className="text-left"><div className="font-semibold">Generación XML</div><div className="text-xs text-gray-400">Documentos Fiscales</div></div>
          </button>
        </nav>
        <div className="p-4 border-t-2 border-green-600 mt-auto">
          <Button onClick={cerrarSesion} variant="secondary" icon={LogOut} className="w-full">Cerrar Sesión</Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

          {/* VISTA ABCCR MEJORADA */}
          {view === 'abccr' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6 border-l-4 border-green-600 pl-4">
                <div>
                  <h1 className="text-3xl font-bold text-black">Proyecto Final BDII</h1>
                  <h2 className="text-xl font-semibold text-green-700 mt-1">Catálogo de Productos</h2>
                  <p className="text-gray-600">Gestión ABCCR: Altas, Bajas, Cambios, Consultas y Reportes</p>
                </div>
                <Button icon={Plus} onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="shadow-lg">
                  Nuevo Producto (Alta)
                </Button>
              </div>

              <Card className="p-4 mb-6 border-2 border-green-600 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Search size={20} className="text-green-700" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por SKU, nombre, categoría..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-1 outline-none text-black font-medium placeholder:text-gray-400"
                  />
                </div>
              </Card>

              {loading ? <LoadingSpinner /> : (
                <Card className="overflow-hidden shadow-xl border-2 border-gray-200">
                  <table className="min-w-full divide-y-2 divide-gray-300">
                    <thead className="bg-gradient-to-r from-green-600 to-green-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">SKU</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Producto</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Categoría</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Condición</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {dataFiltrada.map((p) => (
                        <tr key={p.sku} className="hover:bg-green-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-gray-600 font-bold">#{p.sku}</td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-black">{p.nombre_producto}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{p.descripcion}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="bg-green-100 px-3 py-1 rounded-lg text-xs font-bold uppercase text-green-800 border border-green-300">{p.nombre_categoria || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.condicion==='Nuevo'?'bg-green-600 text-white':'bg-amber-500 text-white'}`}>
                              {p.condicion}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors border-2 border-green-600" title="Editar (Cambio)">
                                <Edit size={18} />
                              </button>
                              <button onClick={() => handleDeleteProduct(p.sku)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors border-2 border-red-600" title="Eliminar (Baja)">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dataFiltrada.length === 0 && <div className="p-12 text-center text-gray-400">No se encontraron productos.</div>}
                </Card>
              )}
            </div>
          )}

          {/* VISTA REPORTES */}
          {view === 'reports' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6 border-l-4 border-green-600 pl-4">
                <h1 className="text-3xl font-bold text-black">Proyecto Final BDII</h1>
                <h2 className="text-xl font-semibold text-green-700 mt-1">Datamarts OLAP</h2>
                <p className="text-gray-600">Análisis Multidimensional: ROLLUP, CUBE, RANK y DENSE_RANK</p>
              </div>

              {/* Panel Explicativo según el tipo de reporte */}
              {reportType === 'rank' || reportType === 'dense' ? (
                <Card className="p-5 mb-6 bg-purple-50 border-l-4 border-purple-600">
                  <div className="flex items-start gap-3">
                    <Info size={24} className="text-purple-700 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold text-purple-900 mb-2">
                        {reportType === 'rank' ? 'RANK - Ranking con Saltos' : 'DENSE_RANK - Ranking Continuo'}
                      </h3>
                      <p className="text-sm text-purple-800 mb-3">
                        Este análisis muestra el <span className="font-bold">top de productos más vendidos</span> ordenados por número de unidades vendidas en el período seleccionado.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-purple-200 mb-3">
                        <div className="font-bold text-purple-900 text-sm mb-2">¿Cómo se calcula el ranking?</div>
                        <ul className="text-xs text-purple-800 space-y-1 list-disc list-inside">
                          <li>Se suman todas las <span className="font-semibold">unidades vendidas</span> de cada producto</li>
                          <li>Se ordenan de mayor a menor cantidad</li>
                          <li>Se asigna una posición (#1, #2, #3, etc.)</li>
                          <li>Los productos con las mismas unidades tienen el mismo ranking</li>
                        </ul>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white p-2 rounded border border-purple-200">
                          <div className="font-bold text-purple-900 mb-1">RANK (con saltos):</div>
                          <div className="font-mono text-purple-700">
                            #1, #2, #2, <span className="text-red-600 font-bold">#4</span> ← Salta el #3
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded border border-purple-200">
                          <div className="font-bold text-purple-900 mb-1">DENSE_RANK (continuo):</div>
                          <div className="font-mono text-purple-700">
                            #1, #2, #2, <span className="text-green-600 font-bold">#3</span> ← No salta
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : reportType === 'rollup' ? (
                <Card className="p-5 mb-6 bg-blue-50 border-l-4 border-blue-600">
                  <div className="flex items-start gap-3">
                    <Info size={24} className="text-blue-700 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 mb-2">ROLLUP - Subtotales Jerárquicos</h3>
                      <p className="text-sm text-blue-800 mb-3">
                        Genera <span className="font-bold">totales y subtotales</span> en múltiples niveles de agregación, desde el detalle hasta el total global.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-blue-200">
                        <div className="font-bold text-blue-900 text-sm mb-2">Jerarquía de Agregación:</div>
                        <div className="space-y-1 text-xs text-blue-800">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-600 rounded"></div>
                            <span><span className="font-bold">Nivel 1:</span> Total Global (suma de todo)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                            <span><span className="font-bold">Nivel 2:</span> Subtotales por Año</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
                            <span><span className="font-bold">Nivel 3:</span> Subtotales por Categoría (dentro de cada año)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                            <span><span className="font-bold">Nivel 4:</span> Detalle por Producto</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : reportType === 'cube' ? (
                <Card className="p-5 mb-6 bg-indigo-50 border-l-4 border-indigo-600">
                  <div className="flex items-start gap-3">
                    <Info size={24} className="text-indigo-700 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold text-indigo-900 mb-2">CUBE - Todas las Combinaciones</h3>
                      <p className="text-sm text-indigo-800 mb-3">
                        Genera <span className="font-bold">todas las combinaciones posibles</span> de las dimensiones seleccionadas (Año × Sucursal = 4 combinaciones).
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-indigo-200">
                        <div className="font-bold text-indigo-900 text-sm mb-2">Combinaciones Generadas:</div>
                        <div className="space-y-1 text-xs text-indigo-800">
                          <div>✅ Total General (todos los años, todas las sucursales)</div>
                          <div>✅ Total por Año (todas las sucursales)</div>
                          <div>✅ Total por Sucursal (todos los años)</div>
                          <div>✅ Detalle (año específico, sucursal específica)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : null}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { id: 'rollup', label: 'ROLLUP', desc: 'Subtotales Jerárquicos' },
                  { id: 'cube', label: 'CUBE', desc: 'Todas las Combinaciones' },
                  { id: 'rank', label: 'RANK', desc: 'Ranking con Saltos' },
                  { id: 'dense', label: 'DENSE_RANK', desc: 'Ranking Continuo' }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setReportType(tab.id)} className={`p-4 rounded-lg border-2 transition-all text-left shadow-md ${reportType === tab.id ? 'border-green-600 bg-green-50 shadow-green-500/50' : 'border-gray-300 hover:border-green-400 bg-white'}`}>
                    <div className="font-bold text-black">{tab.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{tab.desc}</div>
                  </button>
                ))}
              </div>
              <FilterBar products={productList} onFilter={cargarReporte} loading={loading} showAlert={showAlert} />
              <DataTable data={data} loading={loading} emptyMessage="Configura los filtros para visualizar el análisis." />
            </div>
          )}

          {/* VISTA XML */}
          {view === 'xml' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6 border-l-4 border-green-600 pl-4">
                <h1 className="text-3xl font-bold text-black">Proyecto Final BDII</h1>
                <h2 className="text-xl font-semibold text-green-700 mt-1">Generación de XML</h2>
                <p className="text-gray-600">Comprobantes Fiscales Digitales</p>
              </div>

              {/* Panel Informativo */}
              <Card className="p-5 mb-6 bg-amber-50 border-l-4 border-amber-600">
                <div className="flex items-start gap-3">
                  <Info size={24} className="text-amber-700 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 mb-2">Sobre los Documentos XML</h3>
                    <p className="text-sm text-amber-800 mb-3">
                      Los archivos XML generados son <span className="font-bold">comprobantes fiscales digitales</span> que contienen información estructurada de las transacciones de venta registradas en la base de datos.
                    </p>
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <div className="font-bold text-amber-900 text-sm mb-2">Estructura del Documento:</div>
                      <ul className="text-xs text-amber-800 space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-mono font-bold">&lt;Venta&gt;</span>
                          <span>Contenedor principal con el ID de la transacción</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-mono font-bold">&lt;Fecha&gt;</span>
                          <span>Timestamp de cuándo se realizó la venta</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 font-mono font-bold">&lt;Cliente&gt;</span>
                          <span>Información del cliente (nombre, contacto)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-mono font-bold">&lt;Productos&gt;</span>
                          <span>Lista de productos vendidos con cantidades y precios</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 font-mono font-bold">&lt;Total&gt;</span>
                          <span>Monto total de la transacción</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 mb-6 shadow-lg border-2 border-green-600">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <Input
                    label="ID de Venta"
                    type="number"
                    value={xmlId}
                    onChange={e => setXmlId(e.target.value)}
                    placeholder="Ej: 1050"
                    className="flex-1"
                    min={1}
                    required
                  />
                  <div className="flex gap-2">
                    <Button onClick={generarXML} disabled={loading} variant="warning" icon={FileText}>Generar XML</Button>
                    {xmlContent && <Button onClick={descargarXML} variant="success" icon={Download}>Descargar Archivo</Button>}
                  </div>
                </div>
              </Card>

              {loading && <LoadingSpinner message="Generando documento XML..." />}

              {xmlContent && !loading && (
                <div className="space-y-4">
                  {/* Metadata Panel */}
                  <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-green-700" />
                          <span className="text-sm font-bold text-green-900">Documento Generado</span>
                        </div>
                        <div className="h-6 w-px bg-green-300"></div>
                        <div className="text-sm text-green-800">
                          <span className="font-semibold">ID de Venta:</span> <span className="font-mono font-bold text-green-700">#{xmlId}</span>
                        </div>
                        <div className="h-6 w-px bg-green-300"></div>
                        <div className="text-sm text-green-800">
                          <span className="font-semibold">Tamaño:</span> <span className="font-mono">{xmlContent.length} caracteres</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-green-700">Válido</span>
                      </div>
                    </div>
                  </Card>

                  {/* XML Content with Syntax Highlighting */}
                  <Card className="overflow-hidden shadow-2xl border-4 border-green-600">
                    <div className="bg-gradient-to-r from-gray-900 to-black px-6 py-3 border-b-2 border-green-600 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="ml-3 text-white font-mono text-sm font-bold">factura-{xmlId}.xml</span>
                      </div>
                      <span className="text-green-400 text-xs font-mono">XML 1.0 • UTF-8</span>
                    </div>
                    <div className="bg-gray-900 p-6 overflow-x-auto">
                      <pre className="text-sm font-mono leading-relaxed">
                        <code dangerouslySetInnerHTML={{
                          __html: xmlContent
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/(&lt;\/?[^&gt;]+&gt;)/g, '<span class="text-green-400 font-bold">$1</span>')
                            .replace(/(&lt;!--.*?--&gt;)/g, '<span class="text-gray-500 italic">$1</span>')
                            .replace(/(&lt;\?xml.*?\?&gt;)/g, '<span class="text-purple-400 font-bold">$1</span>')
                            .replace(/(&lt;\/?)(\w+)/g, '$1<span class="text-blue-400">$2</span>')
                            .replace(/(\w+)=(&quot;[^&quot;]*&quot;)/g, '<span class="text-yellow-300">$1</span>=<span class="text-orange-400">$2</span>')
                            .split('\n')
                            .map((line, i) => `<span class="text-gray-600 select-none inline-block w-12 text-right pr-4">${i + 1}</span>${line}`)
                            .join('\n')
                        }} />
                      </pre>
                    </div>
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-3 border-t-2 border-green-600 text-sm text-gray-400 flex justify-between items-center">
                      <span>Formato: <span className="text-green-400 font-semibold">Extensible Markup Language</span></span>
                      <span>Listo para descargar y procesar</span>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAL GLOBAL */}
      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={editingProduct} onSave={handleSaveProduct} categories={categories} />
    </div>
  );
}

export default App;