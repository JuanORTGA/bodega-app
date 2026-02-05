// src/components/Inventario.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, BarChart3, 
  Download, Upload, RefreshCw, AlertTriangle, Package,
  DollarSign, TrendingUp, Layers, Calendar, MapPin,
  Users, ShoppingCart, Database, Settings, Printer,
  CheckCircle, XCircle, ChevronLeft, ChevronRight,
  ArrowUpDown, MoreVertical, Tag, Percent, Hash,
  BarChart, PieChart, LineChart, Bell, FileText,
  Grid, List, Columns, DownloadCloud, UploadCloud,
  Shield, Target, Zap, Clock, Star
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import './Inventario.css';


const Inventario = () => {
  // ==================== ESTADOS PRINCIPALES ====================
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tasaBCV, setTasaBCV] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ==================== ESTADOS DE FILTROS ====================
  const [filtros, setFiltros] = useState({
    search: '',
    categoria: 'todas',
    stockMin: '',
    stockMax: '',
    precioMin: '',
    precioMax: '',
    estado: 'todos',
    ordenarPor: 'nombre',
    ordenDireccion: 'asc'
  });
  
  // ==================== ESTADOS DE INTERFAZ ====================
  const [vista, setVista] = useState('grid'); // 'grid', 'table', 'compact'
  const [productoEditando, setProductoEditando] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  
  // ==================== ESTADOS DE PAGINACIÓN ====================
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(12);
  
  // ==================== ESTADOS DE NOTIFICACIONES ====================
  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    mensaje: '',
    tipo: 'success'
  });
  
  // ==================== CARGAR DATOS INICIALES ====================
  useEffect(() => {
    cargarDatosIniciales();
    cargarTasaBCV();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      // Cargar productos
      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (productosError) throw productosError;
      setProductos(productosData || []);
      
      // Cargar categorías
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre');
      
      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);
      
    } catch (err) {
      setError('Error al cargar los datos: ' + err.message);
      mostrarNotificacion('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarTasaBCV = async () => {
    try {
      // Primero intentamos cargar la última tasa guardada
      const { data: tasaData, error: tasaError } = await supabase
        .from('tasa_cambio')
        .select('tasa_bs_usd')
        .order('fecha', { ascending: false })
        .limit(1);
      
      if (!tasaError && tasaData && tasaData.length > 0) {
        setTasaBCV(tasaData[0].tasa_bs_usd);
      } else {
        // Si no hay tasa guardada, usar un valor por defecto
        setTasaBCV(36.50);
      }
    } catch (err) {
      console.error('Error cargando tasa BCV:', err);
    }
  };

  // ==================== FILTRADO DE PRODUCTOS ====================
  const productosFiltrados = useMemo(() => {
    let filtrados = [...productos];
    
    // Filtro por búsqueda
    if (filtros.search) {
      const termino = filtros.search.toLowerCase();
      filtrados = filtrados.filter(p =>
        p.nombre?.toLowerCase().includes(termino) ||
        p.descripcion?.toLowerCase().includes(termino) ||
        p.sku?.toLowerCase().includes(termino)
      );
    }
    
    // Filtro por categoría
    if (filtros.categoria !== 'todas') {
      filtrados = filtrados.filter(p => p.id_categoria === parseInt(filtros.categoria));
    }
    
    // Filtro por stock mínimo
    if (filtros.stockMin) {
      filtrados = filtrados.filter(p => p.stock >= parseInt(filtros.stockMin));
    }
    
    // Filtro por stock máximo
    if (filtros.stockMax) {
      filtrados = filtrados.filter(p => p.stock <= parseInt(filtros.stockMax));
    }
    
    // Filtro por precio mínimo (USD)
    if (filtros.precioMin) {
      filtrados = filtrados.filter(p => p.precio_usd >= parseFloat(filtros.precioMin));
    }
    
    // Filtro por precio máximo (USD)
    if (filtros.precioMax) {
      filtrados = filtrados.filter(p => p.precio_usd <= parseFloat(filtros.precioMax));
    }
    
    // Filtro por estado
    if (filtros.estado === 'activos') {
      filtrados = filtrados.filter(p => p.activo === true);
    } else if (filtros.estado === 'inactivos') {
      filtrados = filtrados.filter(p => p.activo === false);
    } else if (filtros.estado === 'agotados') {
      filtrados = filtrados.filter(p => p.stock === 0);
    } else if (filtros.estado === 'bajo-stock') {
      filtrados = filtrados.filter(p => p.stock <= 10 && p.stock > 0);
    }
    
    // Ordenamiento
    filtrados.sort((a, b) => {
      let aVal = a[filtros.ordenarPor] || '';
      let bVal = b[filtros.ordenarPor] || '';
      
      if (filtros.ordenarPor === 'nombre' || filtros.ordenarPor === 'descripcion') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return filtros.ordenDireccion === 'asc' ? -1 : 1;
      if (aVal > bVal) return filtros.ordenDireccion === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtrados;
  }, [productos, filtros]);

  // ==================== CÁLCULOS Y ESTADÍSTICAS ====================
  const estadisticas = useMemo(() => {
    const totalProductos = productos.length;
    const productosActivos = productos.filter(p => p.activo).length;
    const productosAgotados = productos.filter(p => p.stock === 0).length;
    const productosBajoStock = productos.filter(p => p.stock <= 10 && p.stock > 0).length;
    
    const valorTotalUSD = productos.reduce((sum, p) => sum + (p.precio_usd * p.stock), 0);
    const valorTotalBS = valorTotalUSD * tasaBCV;
    
    const inversionTotalUSD = productos.reduce((sum, p) => sum + (p.costo_usd || p.precio_usd * 0.7) * p.stock, 0);
    const inversionTotalBS = inversionTotalUSD * tasaBCV;
    
    const gananciaPotencialUSD = valorTotalUSD - inversionTotalUSD;
    const gananciaPotencialBS = gananciaPotencialUSD * tasaBCV;
    
    const margenPromedio = productos.length > 0 
      ? (gananciaPotencialUSD / inversionTotalUSD) * 100 
      : 0;
    
    // Distribución por categoría
    const distribucionCategorias = categorias.map(categoria => {
      const productosCategoria = productos.filter(p => p.id_categoria === categoria.id);
      const valorCategoria = productosCategoria.reduce((sum, p) => sum + (p.precio_usd * p.stock), 0);
      return {
        ...categoria,
        cantidad: productosCategoria.length,
        valor: valorCategoria,
        porcentaje: totalProductos > 0 ? (productosCategoria.length / totalProductos) * 100 : 0
      };
    }).filter(c => c.cantidad > 0);
    
    // Productos más valiosos
    const productosValiosos = [...productos]
      .sort((a, b) => (b.precio_usd * b.stock) - (a.precio_usd * a.stock))
      .slice(0, 5)
      .map(p => ({
        ...p,
        valorTotal: p.precio_usd * p.stock
      }));
    
    // Productos que necesitan atención
    const productosAtencion = productos
      .filter(p => p.stock === 0 || p.stock <= 5)
      .slice(0, 5);
    
    return {
      totalProductos,
      productosActivos,
      productosAgotados,
      productosBajoStock,
      valorTotalUSD,
      valorTotalBS,
      inversionTotalUSD,
      inversionTotalBS,
      gananciaPotencialUSD,
      gananciaPotencialBS,
      margenPromedio,
      distribucionCategorias,
      productosValiosos,
      productosAtencion
    };
  }, [productos, categorias, tasaBCV]);

  // ==================== PAGINACIÓN ====================
  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceFin);

  // ==================== FUNCIONES CRUD ====================
  const guardarProducto = async (producto) => {
    try {
      if (producto.id) {
        // Actualizar producto existente
        const { error } = await supabase
          .from('productos')
          .update(producto)
          .eq('id', producto.id);
        
        if (error) throw error;
        mostrarNotificacion('Producto actualizado exitosamente', 'success');
      } else {
        // Crear nuevo producto
        const { error } = await supabase
          .from('productos')
          .insert([producto]);
        
        if (error) throw error;
        mostrarNotificacion('Producto creado exitosamente', 'success');
      }
      
      await cargarDatosIniciales();
      setMostrarFormulario(false);
      setProductoEditando(null);
      
    } catch (err) {
      mostrarNotificacion('Error al guardar el producto: ' + err.message, 'error');
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      mostrarNotificacion('Producto eliminado exitosamente', 'success');
      await cargarDatosIniciales();
      setProductoSeleccionado(null);
      
    } catch (err) {
      mostrarNotificacion('Error al eliminar el producto', 'error');
    }
  };

  const actualizarStock = async (id, nuevoStock) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ stock: nuevoStock })
        .eq('id', id);
      
      if (error) throw error;
      
      await cargarDatosIniciales();
      mostrarNotificacion('Stock actualizado', 'success');
      
    } catch (err) {
      mostrarNotificacion('Error al actualizar stock', 'error');
    }
  };

  const actualizarTasaBCV = async (nuevaTasa) => {
    try {
      const { error } = await supabase
        .from('tasa_cambio')
        .insert([{ tasa_bs_usd: nuevaTasa, fuente: 'Manual' }]);
      
      if (error) throw error;
      
      setTasaBCV(nuevaTasa);
      mostrarNotificacion('Tasa BCV actualizada', 'success');
      
    } catch (err) {
      mostrarNotificacion('Error al actualizar tasa', 'error');
    }
  };

  // ==================== FUNCIONES DE INTERFAZ ====================
  const mostrarNotificacion = (mensaje, tipo = 'info') => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => {
      setNotificacion({ mostrar: false, mensaje: '', tipo: 'info' });
    }, 3000);
  };

  const limpiarFiltros = () => {
    setFiltros({
      search: '',
      categoria: 'todas',
      stockMin: '',
      stockMax: '',
      precioMin: '',
      precioMax: '',
      estado: 'todos',
      ordenarPor: 'nombre',
      ordenDireccion: 'asc'
    });
    mostrarNotificacion('Filtros limpiados', 'info');
  };

  const toggleSeleccionarProducto = (id) => {
    setProductosSeleccionados(prev =>
      prev.includes(id)
        ? prev.filter(productoId => productoId !== id)
        : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    if (productosSeleccionados.length === productosPaginados.length) {
      setProductosSeleccionados([]);
    } else {
      setProductosSeleccionados(productosPaginados.map(p => p.id));
    }
  };

  const exportarDatos = () => {
    const datosExportar = productosFiltrados.map(p => ({
      Nombre: p.nombre,
      SKU: p.sku || '',
      Descripción: p.descripcion || '',
      Categoría: categorias.find(c => c.id === p.id_categoria)?.nombre || '',
      'Precio USD': p.precio_usd,
      'Precio BS': (p.precio_usd * tasaBCV).toFixed(2),
      Stock: p.stock,
      'Valor Total USD': (p.precio_usd * p.stock).toFixed(2),
      'Valor Total BS': ((p.precio_usd * p.stock) * tasaBCV).toFixed(2),
      Estado: p.activo ? 'Activo' : 'Inactivo'
    }));

    const csv = convertirACSV(datosExportar);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    mostrarNotificacion('Datos exportados exitosamente', 'success');
  };

  const convertirACSV = (array) => {
    const headers = Object.keys(array[0] || {});
    const rows = array.map(obj => 
      headers.map(header => `"${obj[header] || ''}"`).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  // ==================== RENDERIZADO ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={cargarDatosIniciales}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Notificación */}
      {notificacion.mostrar && (
        <div className={`fixed top-4 right-4 z-50 animate-slideIn ${
          notificacion.tipo === 'success' ? 'bg-green-500' :
          notificacion.tipo === 'error' ? 'bg-red-500' :
          'bg-blue-500'
        } text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3`}>
          {notificacion.tipo === 'success' && <CheckCircle size={20} />}
          {notificacion.tipo === 'error' && <XCircle size={20} />}
          <span>{notificacion.mensaje}</span>
          <button
            onClick={() => setNotificacion({ mostrar: false, mensaje: '', tipo: 'info' })}
            className="ml-4 hover:opacity-80"
          >
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <Package className="text-white" />
                <span>Gestión de Inventario</span>
              </h1>
              <p className="text-blue-100 mt-2">
                Control total de productos, stock y valores
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Nuevo Producto</span>
              </button>
              
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center space-x-2"
              >
                <Filter size={20} />
                <span>Filtros</span>
              </button>
              
              <button
                onClick={exportarDatos}
                className="bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download size={20} />
                <span>Exportar</span>
              </button>
            </div>
          </div>
          
          {/* Tasa BCV */}
          <div className="mt-6 bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 inline-block">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="text-yellow-300" />
                <span className="font-semibold">Tasa BCV:</span>
                <span className="text-2xl font-bold">Bs. {tasaBCV.toFixed(2)}</span>
              </div>
              
              <button
                onClick={() => {
                  const nuevaTasa = prompt('Ingresa nueva tasa BCV:', tasaBCV);
                  if (nuevaTasa && !isNaN(nuevaTasa)) {
                    actualizarTasaBCV(parseFloat(nuevaTasa));
                  }
                }}
                className="text-blue-100 hover:text-white text-sm underline"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Estadísticas Rápidas */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tarjeta 1: Productos Totales */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold">Productos Totales</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{estadisticas.totalProductos}</p>
                <p className="text-green-600 text-sm mt-1">
                  {estadisticas.productosActivos} activos
                </p>
              </div>
              <Package className="text-blue-500" size={32} />
            </div>
          </div>

          {/* Tarjeta 2: Valor Total */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold">Valor Total</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  ${estadisticas.valorTotalUSD.toFixed(2)}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Bs. {estadisticas.valorTotalBS.toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-green-500" size={32} />
            </div>
          </div>

          {/* Tarjeta 3: Stock Crítico */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold">Stock Crítico</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {estadisticas.productosAgotados + estadisticas.productosBajoStock}
                </p>
                <p className="text-red-600 text-sm mt-1">
                  {estadisticas.productosAgotados} agotados
                </p>
              </div>
              <AlertTriangle className="text-red-500" size={32} />
            </div>
          </div>

          {/* Tarjeta 4: Ganancia Potencial */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold">Ganancia Potencial</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  ${estadisticas.gananciaPotencialUSD.toFixed(2)}
                </p>
                <p className="text-purple-600 text-sm mt-1">
                  {estadisticas.margenPromedio.toFixed(1)}% margen
                </p>
              </div>
              <TrendingUp className="text-purple-500" size={32} />
            </div>
          </div>
        </div>

        {/* Filtros Avanzados */}
        {mostrarFiltros && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <Filter size={24} />
                <span>Filtros Avanzados</span>
              </h3>
              <button
                onClick={limpiarFiltros}
                className="text-gray-500 hover:text-gray-700 text-sm font-semibold"
              >
                Limpiar filtros
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buscar producto
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={filtros.search}
                    onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                    placeholder="Nombre, SKU, descripción..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={filtros.categoria}
                  onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todas">Todas las categorías</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                  <option value="agotados">Agotados</option>
                  <option value="bajo-stock">Bajo stock</option>
                </select>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ordenar por
                </label>
                <div className="flex space-x-2">
                  <select
                    value={filtros.ordenarPor}
                    onChange={(e) => setFiltros({ ...filtros, ordenarPor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="nombre">Nombre</option>
                    <option value="precio_usd">Precio</option>
                    <option value="stock">Stock</option>
                    <option value="created_at">Fecha</option>
                  </select>
                  <button
                    onClick={() => setFiltros({ 
                      ...filtros, 
                      ordenDireccion: filtros.ordenDireccion === 'asc' ? 'desc' : 'asc' 
                    })}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowUpDown size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filtros adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Rango de stock */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rango de Stock
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={filtros.stockMin}
                    onChange={(e) => setFiltros({ ...filtros, stockMin: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={filtros.stockMax}
                    onChange={(e) => setFiltros({ ...filtros, stockMax: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Rango de precio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rango de Precio (USD)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Mín"
                    value={filtros.precioMin}
                    onChange={(e) => setFiltros({ ...filtros, precioMin: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Máx"
                    value={filtros.precioMax}
                    onChange={(e) => setFiltros({ ...filtros, precioMax: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Resultados */}
              <div className="flex items-end">
                <div className="bg-blue-50 p-4 rounded-lg w-full">
                  <p className="text-sm text-gray-600">Productos encontrados:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {productosFiltrados.length}
                    <span className="text-sm text-gray-500 ml-2">
                      de {productos.length} totales
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controles de Vista */}
        <div className="mt-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-lg shadow p-1 flex">
              <button
                onClick={() => setVista('grid')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  vista === 'grid' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setVista('table')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  vista === 'table' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setVista('compact')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  vista === 'compact' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Columns size={20} />
              </button>
            </div>

            {productosSeleccionados.length > 0 && (
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-blue-700 font-semibold">
                  {productosSeleccionados.length} seleccionados
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={itemsPorPagina}
              onChange={(e) => setItemsPorPagina(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={6}>6 por página</option>
              <option value={12}>12 por página</option>
              <option value={24}>24 por página</option>
              <option value={50}>50 por página</option>
            </select>

            <button
              onClick={cargarDatosIniciales}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw size={20} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Lista de Productos */}
        <div className="mt-6">
          {vista === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productosPaginados.map(producto => {
                const categoria = categorias.find(c => c.id === producto.id_categoria);
                const precioBS = producto.precio_usd * tasaBCV;
                const valorTotalUSD = producto.precio_usd * producto.stock;
                const valorTotalBS = valorTotalUSD * tasaBCV;
                
                return (
                  <div
                    key={producto.id}
                    className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
                      productosSeleccionados.includes(producto.id) ? 'ring-2 ring-blue-500' : ''
                    } ${
                      producto.stock === 0 ? 'border-l-4 border-red-500' :
                      producto.stock <= 5 ? 'border-l-4 border-yellow-500' :
                      'border-l-4 border-green-500'
                    }`}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <input
                              type="checkbox"
                              checked={productosSeleccionados.includes(producto.id)}
                              onChange={() => toggleSeleccionarProducto(producto.id)}
                              className="rounded text-blue-500"
                            />
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              producto.stock === 0 ? 'bg-red-100 text-red-800' :
                              producto.stock <= 5 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {producto.stock} unidades
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 truncate">
                            {producto.nombre}
                          </h3>
                          {producto.sku && (
                            <p className="text-sm text-gray-500 mt-1">SKU: {producto.sku}</p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setProductoSeleccionado(producto);
                            setMostrarDetalles(true);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical size={20} />
                        </button>
                      </div>

                      {/* Categoría */}
                      {categoria && (
                        <div className="mb-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {categoria.nombre}
                          </span>
                        </div>
                      )}

                      {/* Precios */}
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Precio USD:</span>
                          <span className="text-xl font-bold text-gray-800">
                            ${producto.precio_usd.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Precio BS:</span>
                          <span className="text-lg font-semibold text-gray-700">
                            Bs. {precioBS.toFixed(2)}
                          </span>
                        </div>
                        <div className="pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Valor total:</span>
                            <div className="text-right">
                              <div className="font-bold text-gray-800">
                                ${valorTotalUSD.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Bs. {valorTotalBS.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Descripción */}
                      {producto.descripcion && (
                        <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                          {producto.descripcion}
                        </p>
                      )}

                      {/* Acciones */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const nuevoStock = prompt(
                              'Nuevo stock para ' + producto.nombre + ':',
                              producto.stock
                            );
                            if (nuevoStock !== null && !isNaN(nuevoStock)) {
                              actualizarStock(producto.id, parseInt(nuevoStock));
                            }
                          }}
                          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                        >
                          Ajustar Stock
                        </button>
                        <button
                          onClick={() => {
                            setProductoEditando(producto);
                            setMostrarFormulario(true);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => eliminarProducto(producto.id)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-red-50 text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : vista === 'table' ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={productosSeleccionados.length === productosPaginados.length}
                          onChange={seleccionarTodos}
                          className="rounded text-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Producto
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Categoría
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Precio USD
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Precio BS
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Valor Total
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {productosPaginados.map(producto => {
                      const categoria = categorias.find(c => c.id === producto.id_categoria);
                      const precioBS = producto.precio_usd * tasaBCV;
                      const valorTotalUSD = producto.precio_usd * producto.stock;
                      const valorTotalBS = valorTotalUSD * tasaBCV;
                      
                      return (
                        <tr key={producto.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={productosSeleccionados.includes(producto.id)}
                              onChange={() => toggleSeleccionarProducto(producto.id)}
                              className="rounded text-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-800">
                                {producto.nombre}
                              </div>
                              {producto.sku && (
                                <div className="text-sm text-gray-500">SKU: {producto.sku}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {categoria ? (
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {categoria.nombre}
                              </span>
                            ) : (
                              <span className="text-gray-400">Sin categoría</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-800">
                              ${producto.precio_usd.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-700">
                              Bs. {precioBS.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <span className={`font-semibold ${
                                producto.stock === 0 ? 'text-red-600' :
                                producto.stock <= 5 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {producto.stock}
                              </span>
                              <button
                                onClick={() => {
                                  const nuevoStock = prompt('Nuevo stock:', producto.stock);
                                  if (nuevoStock !== null && !isNaN(nuevoStock)) {
                                    actualizarStock(producto.id, parseInt(nuevoStock));
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Ajustar
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-bold text-gray-800">
                                ${valorTotalUSD.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Bs. {valorTotalBS.toFixed(2)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              producto.activo
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {producto.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setProductoSeleccionado(producto);
                                  setMostrarDetalles(true);
                                }}
                                className="p-2 text-gray-600 hover:text-gray-800"
                                title="Ver detalles"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setProductoEditando(producto);
                                  setMostrarFormulario(true);
                                }}
                                className="p-2 text-blue-600 hover:text-blue-800"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => eliminarProducto(producto.id)}
                                className="p-2 text-red-600 hover:text-red-800"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Vista compacta
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {productosPaginados.map(producto => {
                  const categoria = categorias.find(c => c.id === producto.id_categoria);
                  const precioBS = producto.precio_usd * tasaBCV;
                  
                  return (
                    <div
                      key={producto.id}
                      className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={productosSeleccionados.includes(producto.id)}
                          onChange={() => toggleSeleccionarProducto(producto.id)}
                          className="rounded text-blue-500"
                        />
                        <div>
                          <div className="font-semibold text-gray-800">
                            {producto.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {categoria?.nombre || 'Sin categoría'} • Stock: {producto.stock}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="font-bold text-gray-800">
                            ${producto.precio_usd.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Bs. {precioBS.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const nuevoStock = prompt('Nuevo stock:', producto.stock);
                              if (nuevoStock !== null && !isNaN(nuevoStock)) {
                                actualizarStock(producto.id, parseInt(nuevoStock));
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Ajustar stock"
                          >
                            <RefreshCw size={16} />
                          </button>
                          <button
                            onClick={() => eliminarProducto(producto.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Paginación */}
          {productosFiltrados.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-gray-600">
                Mostrando {indiceInicio + 1} - {Math.min(indiceFin, productosFiltrados.length)} de {productosFiltrados.length} productos
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  let pagina;
                  if (totalPaginas <= 5) {
                    pagina = i + 1;
                  } else if (paginaActual <= 3) {
                    pagina = i + 1;
                  } else if (paginaActual >= totalPaginas - 2) {
                    pagina = totalPaginas - 4 + i;
                  } else {
                    pagina = paginaActual - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pagina}
                      onClick={() => setPaginaActual(pagina)}
                      className={`w-10 h-10 rounded-lg ${
                        paginaActual === pagina
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pagina}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {productosFiltrados.length === 0 && (
            <div className="mt-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Package className="text-gray-400" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-600 mb-6">
                {filtros.search || filtros.categoria !== 'todas' || filtros.estado !== 'todos'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza agregando tu primer producto'}
              </p>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors inline-flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Agregar Producto</span>
              </button>
            </div>
          )}
        </div>

        {/* Productos que Necesitan Atención */}
        {estadisticas.productosAtencion.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <AlertTriangle className="text-yellow-500" />
                  <span>Productos que Necesitan Atención</span>
                </h3>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                  {estadisticas.productosAtencion.length} productos
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {estadisticas.productosAtencion.map(producto => {
                  const categoria = categorias.find(c => c.id === producto.id_categoria);
                  
                  return (
                    <div
                      key={producto.id}
                      className={`p-4 rounded-lg border ${
                        producto.stock === 0
                          ? 'border-red-200 bg-red-50'
                          : 'border-yellow-200 bg-yellow-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {producto.nombre}
                          </h4>
                          {categoria && (
                            <p className="text-sm text-gray-600 mt-1">
                              {categoria.nombre}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          producto.stock === 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {producto.stock === 0 ? 'AGOTADO' : 'STOCK BAJO'}
                        </span>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-800">
                            {producto.stock}
                          </div>
                          <div className="text-sm text-gray-600">unidades</div>
                        </div>
                        
                        <button
                          onClick={() => {
                            const nuevoStock = prompt(
                              'Reabastecer ' + producto.nombre + ':',
                              producto.stock + 10
                            );
                            if (nuevoStock !== null && !isNaN(nuevoStock)) {
                              actualizarStock(producto.id, parseInt(nuevoStock));
                            }
                          }}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                        >
                          Reabastecer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Formulario de Producto */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    setProductoEditando(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <ProductoForm
                producto={productoEditando}
                categorias={categorias}
                tasaBCV={tasaBCV}
                onSave={guardarProducto}
                onCancel={() => {
                  setMostrarFormulario(false);
                  setProductoEditando(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Producto */}
      {mostrarDetalles && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {productoSeleccionado.nombre}
                  </h2>
                  {productoSeleccionado.sku && (
                    <p className="text-gray-600 mt-1">SKU: {productoSeleccionado.sku}</p>
                  )}
                </div>
                <button
                  onClick={() => setMostrarDetalles(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información General */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600">
                      Descripción
                    </label>
                    <p className="mt-1 text-gray-800">
                      {productoSeleccionado.descripcion || 'Sin descripción'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-600">
                      Categoría
                    </label>
                    <p className="mt-1">
                      {categorias.find(c => c.id === productoSeleccionado.id_categoria)?.nombre || 'Sin categoría'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-600">
                      Estado
                    </label>
                    <span className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      productoSeleccionado.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {productoSeleccionado.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                {/* Información Financiera */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600">
                        Precio USD
                      </label>
                      <p className="mt-1 text-2xl font-bold text-gray-800">
                        ${productoSeleccionado.precio_usd.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600">
                        Precio BS
                      </label>
                      <p className="mt-1 text-xl font-bold text-gray-800">
                        Bs. {(productoSeleccionado.precio_usd * tasaBCV).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-600">
                      Stock Actual
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                      <span className={`text-3xl font-bold ${
                        productoSeleccionado.stock === 0 ? 'text-red-600' :
                        productoSeleccionado.stock <= 5 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {productoSeleccionado.stock}
                      </span>
                      <span className="text-gray-600">unidades</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-600">
                      Valor Total
                    </label>
                    <div className="mt-1">
                      <p className="text-xl font-bold text-gray-800">
                        ${(productoSeleccionado.precio_usd * productoSeleccionado.stock).toFixed(2)}
                      </p>
                      <p className="text-gray-600">
                        Bs. {((productoSeleccionado.precio_usd * productoSeleccionado.stock) * tasaBCV).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Fecha de creación */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Creado el: {new Date(productoSeleccionado.created_at).toLocaleDateString()}
                </p>
              </div>
              
              {/* Acciones */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setMostrarDetalles(false);
                    setProductoEditando(productoSeleccionado);
                    setMostrarFormulario(true);
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  Editar Producto
                </button>
                <button
                  onClick={() => {
                    setMostrarDetalles(false);
                    eliminarProducto(productoSeleccionado.id);
                  }}
                  className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 bg-white border-t">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <p className="text-gray-600">
                Sistema de Gestión de Inventario © {new Date().getFullYear()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total productos: {productos.length} • Valor total: ${estadisticas.valorTotalUSD.toFixed(2)}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <button
                onClick={cargarDatosIniciales}
                className="text-gray-600 hover:text-gray-800 flex items-center space-x-2"
              >
                <RefreshCw size={16} />
                <span>Actualizar</span>
              </button>
              
              <button
                onClick={exportarDatos}
                className="text-gray-600 hover:text-gray-800 flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Componente del Formulario de Producto
const ProductoForm = ({ producto, categorias, tasaBCV, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: producto?.nombre || '',
    descripcion: producto?.descripcion || '',
    sku: producto?.sku || '',
    precio_usd: producto?.precio_usd || '',
    stock: producto?.stock || '',
    id_categoria: producto?.id_categoria || '',
    activo: producto?.activo !== undefined ? producto.activo : true,
    imagen_url: producto?.imagen_url || ''
  });

  const [imagen, setImagen] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    try {
      // Subir imagen si existe
      let imagenUrl = formData.imagen_url;
      if (imagen) {
        const fileName = `${Date.now()}_${imagen.name}`;
        const { data, error } = await supabase.storage
          .from('productos')
          .upload(fileName, imagen);
        
        if (!error) {
          const { data: urlData } = supabase.storage
            .from('productos')
            .getPublicUrl(fileName);
          imagenUrl = urlData.publicUrl;
        }
      }
      
      // Preparar datos para guardar
      const datosProducto = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        sku: formData.sku,
        precio_usd: parseFloat(formData.precio_usd),
        stock: parseInt(formData.stock),
        id_categoria: formData.id_categoria ? parseInt(formData.id_categoria) : null,
        activo: formData.activo,
        imagen_url: imagenUrl
      };
      
      if (producto?.id) {
        datosProducto.id = producto.id;
      }
      
      await onSave(datosProducto);
      
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  const precioBS = formData.precio_usd ? (parseFloat(formData.precio_usd) * tasaBCV).toFixed(2) : '0.00';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre del Producto */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre del Producto *
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: Arroz Premium"
          />
        </div>
        
        {/* SKU */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            SKU (Código)
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: ARROZ-001"
          />
        </div>
        
        {/* Precio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Precio (USD) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              required
              min="0"
              value={formData.precio_usd}
              onChange={(e) => setFormData({ ...formData, precio_usd: e.target.value })}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Equivalente: Bs. {precioBS} (Tasa: {tasaBCV.toFixed(2)})
          </p>
        </div>
        
        {/* Stock */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Stock Disponible *
          </label>
          <input
            type="number"
            required
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>
        
        {/* Categoría */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Categoría
          </label>
          <select
            value={formData.id_categoria}
            onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccionar categoría</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>
        
        {/* Estado */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Estado del Producto
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData.activo}
                onChange={() => setFormData({ ...formData, activo: true })}
                className="text-blue-500"
              />
              <span className="ml-2">Activo</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={!formData.activo}
                onChange={() => setFormData({ ...formData, activo: false })}
                className="text-blue-500"
              />
              <span className="ml-2">Inactivo</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Descripción */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Descripción detallada del producto..."
        />
      </div>
      
      {/* Imagen */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Imagen del Producto
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
            className="flex-1"
          />
          {formData.imagen_url && (
            <div className="w-16 h-16 rounded-lg overflow-hidden border">
              <img
                src={formData.imagen_url}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Botones */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={cargando}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={cargando}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50 flex items-center space-x-2"
        >
          {cargando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <span>{producto ? 'Actualizar Producto' : 'Crear Producto'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

// Estilos CSS adicionales
const styles = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Agregar estilos al documento
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Inventario;