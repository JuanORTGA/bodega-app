import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import './EncargosDetalle.css';

const EncargosDetalle = () => {
  const { 
    encargos, 
    addEncargo, 
    updateEncargoStatus, 
    products, 
    suppliers,
    exchangeRate,
    convertToVES,
    deleteProduct,
    updateProduct,
    uploadImage
  } = useData();
  
  // Estados principales
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroProveedor, setFiltroProveedor] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(null);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [mostrarDetalles, setMostrarDetalles] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [orden, setOrden] = useState('fecha_desc');
  
  // Estado para nuevo encargo
  const [nuevoEncargo, setNuevoEncargo] = useState({
    proveedor_id: '',
    proveedor_nombre: '',
    productos: [],
    total: 0,
    total_ves: 0,
    entrega_estimada: '',
    notas: '',
    archivos: []
  });
  
  // Estados para modal de confirmación
  const [modalConfirmacion, setModalConfirmacion] = useState({
    abierto: false,
    tipo: '',
    encargoId: null,
    titulo: '',
    mensaje: ''
  });
  
  // Estados para carga de archivos
  const [cargandoArchivos, setCargandoArchivos] = useState(false);
  const [archivosPreview, setArchivosPreview] = useState([]);
  
  // Cargar fechas por defecto
  useEffect(() => {
    const hoy = new Date();
    const mesPasado = new Date();
    mesPasado.setMonth(mesPasado.getMonth() - 1);
    
    setFechaInicio(mesPasado.toISOString().split('T')[0]);
    setFechaFin(hoy.toISOString().split('T')[0]);
  }, []);
  
  // Filtrar encargos
  const encargosFiltrados = useMemo(() => {
    let filtrados = [...encargos];
    
    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      filtrados = filtrados.filter(o => o.estado === filtroEstado);
    }
    
    // Filtrar por proveedor
    if (filtroProveedor !== 'todos') {
      filtrados = filtrados.filter(o => o.proveedor_id === filtroProveedor || o.proveedor === filtroProveedor);
    }
    
    // Filtrar por búsqueda
    if (busqueda) {
      const termino = busqueda.toLowerCase();
      filtrados = filtrados.filter(o => 
        o.proveedor?.toLowerCase().includes(termino) ||
        o.productos?.toLowerCase().includes(termino) ||
        o.notas?.toLowerCase().includes(termino) ||
        o.id?.toString().includes(termino)
      );
    }
    
    // Filtrar por fecha
    if (fechaInicio && fechaFin) {
      filtrados = filtrados.filter(o => {
        const fechaEncargo = new Date(o.fecha_creacion || o.created_at);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59);
        
        return fechaEncargo >= inicio && fechaEncargo <= fin;
      });
    }
    
    // Ordenar
    filtrados.sort((a, b) => {
      const fechaA = new Date(a.fecha_creacion || a.created_at);
      const fechaB = new Date(b.fecha_creacion || b.created_at);
      
      switch(orden) {
        case 'fecha_asc':
          return fechaA - fechaB;
        case 'total_desc':
          return (b.total || 0) - (a.total || 0);
        case 'total_asc':
          return (a.total || 0) - (b.total || 0);
        case 'proveedor':
          return (a.proveedor || '').localeCompare(b.proveedor || '');
        default: // fecha_desc
          return fechaB - fechaA;
      }
    });
    
    return filtrados;
  }, [encargos, filtroEstado, filtroProveedor, busqueda, fechaInicio, fechaFin, orden]);
  
  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    const hoy = new Date();
    const proximaSemana = new Date();
    proximaSemana.setDate(proximaSemana.getDate() + 7);
    
    return {
      totalEncargos: encargos.length,
      totalPendiente: encargos
        .filter(o => o.estado === 'Pendiente')
        .reduce((sum, o) => sum + (o.total || 0), 0),
      totalEnTransito: encargos
        .filter(o => o.estado === 'En tránsito')
        .reduce((sum, o) => sum + (o.total || 0), 0),
      totalRecibido: encargos
        .filter(o => o.estado === 'Recibido')
        .reduce((sum, o) => sum + (o.total || 0), 0),
      encargosProximos: encargos.filter(o => {
        if (o.estado === 'Recibido') return false;
        const fechaEntrega = new Date(o.entrega_estimada);
        return fechaEntrega <= proximaSemana && fechaEntrega >= hoy;
      }).length,
      encargosAtrasados: encargos.filter(o => {
        if (o.estado === 'Recibido') return false;
        const fechaEntrega = new Date(o.entrega_estimada);
        return fechaEntrega < hoy;
      }).length,
      promedioTotal: encargos.length > 0 
        ? encargos.reduce((sum, o) => sum + (o.total || 0), 0) / encargos.length 
        : 0
    };
  }, [encargos]);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoEncargo({
      ...nuevoEncargo,
      [name]: value
    });
    
    // Si cambia proveedor_id, actualizar nombre
    if (name === 'proveedor_id' && value !== '') {
      const proveedor = suppliers.find(p => p.id === value);
      if (proveedor) {
        setNuevoEncargo(prev => ({
          ...prev,
          proveedor_nombre: proveedor.nombre
        }));
      }
    }
  };
  
  // Agregar producto al encargo
  const agregarProducto = (producto) => {
    const productoExistente = productosSeleccionados.find(p => p.id === producto.id);
    
    if (productoExistente) {
      setProductosSeleccionados(prev =>
        prev.map(p =>
          p.id === producto.id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        )
      );
    } else {
      setProductosSeleccionados(prev => [
        ...prev,
        {
          ...producto,
          cantidad: 1,
          precio_unitario: producto.precio_usd || 0,
          subtotal: producto.precio_usd || 0
        }
      ]);
    }
    
    // Actualizar total
    actualizarTotal();
  };
  
  // Actualizar cantidad de producto
  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      setProductosSeleccionados(prev =>
        prev.filter(p => p.id !== productoId)
      );
    } else {
      setProductosSeleccionados(prev =>
        prev.map(p =>
          p.id === productoId
            ? {
                ...p,
                cantidad: nuevaCantidad,
                subtotal: (p.precio_unitario || 0) * nuevaCantidad
              }
            : p
        )
      );
    }
    
    actualizarTotal();
  };
  
  // Actualizar total del encargo
  const actualizarTotal = () => {
    const total = productosSeleccionados.reduce((sum, p) => sum + (p.subtotal || 0), 0);
    setNuevoEncargo(prev => ({
      ...prev,
      total: total,
      total_ves: convertToVES(total)
    }));
  };
  
  // Manejar carga de archivos
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setCargandoArchivos(true);
    
    try {
      const uploadedFiles = [];
      
      for (const file of files) {
        // Subir a Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `encargos/${fileName}`;
        
        const { data, error } = await uploadImage(file, filePath);
        
        if (error) throw error;
        
        uploadedFiles.push({
          nombre: file.name,
          url: data.publicUrl || data,
          tipo: file.type,
          tamaño: file.size
        });
      }
      
      setNuevoEncargo(prev => ({
        ...prev,
        archivos: [...prev.archivos, ...uploadedFiles]
      }));
      
      setArchivosPreview(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('Error subiendo archivos:', error);
      alert('Error al subir archivos');
    } finally {
      setCargandoArchivos(false);
    }
  };
  
  // Enviar encargo
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (productosSeleccionados.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }
    
    const encargoData = {
      ...nuevoEncargo,
      productos: productosSeleccionados.map(p => ({
        id: p.id,
        nombre: p.nombre,
        cantidad: p.cantidad,
        precio_unitario: p.precio_unitario,
        subtotal: p.subtotal
      })),
      estado: 'Pendiente'
    };
    
    try {
      await addEncargo(encargoData);
      
      // Reiniciar formulario
      setNuevoEncargo({
        proveedor_id: '',
        proveedor_nombre: '',
        productos: [],
        total: 0,
        total_ves: 0,
        entrega_estimada: '',
        notas: '',
        archivos: []
      });
      setProductosSeleccionados([]);
      setArchivosPreview([]);
      setMostrarFormulario(false);
      
      alert('✅ Encargo creado exitosamente');
    } catch (error) {
      console.error('Error creando encargo:', error);
      alert('❌ Error al crear encargo');
    }
  };
  
  // Abrir modal de confirmación
  const abrirModalConfirmacion = (tipo, encargoId, titulo, mensaje) => {
    setModalConfirmacion({
      abierto: true,
      tipo,
      encargoId,
      titulo,
      mensaje
    });
  };
  
  // Confirmar acción
  const confirmarAccion = async () => {
    const { tipo, encargoId } = modalConfirmacion;
    
    try {
      switch(tipo) {
        case 'recibir':
          await updateEncargoStatus(encargoId, 'Recibido');
          
          // Actualizar stock de productos
          const encargo = encargos.find(e => e.id === encargoId);
          if (encargo && encargo.productos) {
            for (const producto of encargo.productos) {
              const productoActual = products.find(p => p.id === producto.id);
              if (productoActual) {
                await updateProduct(productoActual.id, {
                  stock: productoActual.stock + (producto.cantidad || 0)
                });
              }
            }
          }
          alert('✅ Encargo marcado como recibido y stock actualizado');
          break;
          
        case 'cancelar':
          await updateEncargoStatus(encargoId, 'Cancelado');
          alert('✅ Encargo cancelado');
          break;
          
        case 'eliminar':
          // Aquí iría la función de eliminar encargo
          console.log('Eliminar encargo:', encargoId);
          alert('✅ Encargo eliminado');
          break;
      }
    } catch (error) {
      console.error('Error en acción:', error);
      alert('❌ Error al realizar la acción');
    } finally {
      setModalConfirmacion({ abierto: false, tipo: '', encargoId: null, titulo: '', mensaje: '' });
    }
  };
  
  // Exportar a CSV
  const exportarCSV = () => {
    const headers = ['ID', 'Proveedor', 'Productos', 'Total USD', 'Total VES', 'Estado', 'Fecha Creación', 'Entrega Estimada'];
    const csvData = encargosFiltrados.map(o => [
      o.id,
      `"${o.proveedor}"`,
      `"${Array.isArray(o.productos) ? o.productos.map(p => p.nombre).join(', ') : o.productos}"`,
      o.total || 0,
      o.total_ves || convertToVES(o.total || 0),
      o.estado,
      new Date(o.fecha_creacion || o.created_at).toLocaleDateString(),
      o.entrega_estimada
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `encargos_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Obtener color según estado
  const getStatusColor = (status) => {
    switch(status) {
      case 'Pendiente': return '#ffc107';
      case 'En tránsito': return '#17a2b8';
      case 'Recibido': return '#28a745';
      case 'Cancelado': return '#dc3545';
      case 'Parcial': return '#fd7e14';
      default: return '#6c757d';
    }
  };
  
  // Calcular días restantes
  const calcularDiasRestantes = (fechaEntrega) => {
    if (!fechaEntrega) return null;
    
    const hoy = new Date();
    const entrega = new Date(fechaEntrega);
    const diffTime = entrega - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  return (
    <div className="encargos-detalle-container">
      {/* Encabezado */}
      <div className="encargos-header">
        <div className="header-content">
          <h1>
            <span className="header-icon">📦</span>
            Gestión de Encargos
          </h1>
          <p className="header-subtitle">
            Total: {encargos.length} encargos • ${estadisticas.totalPendiente.toFixed(2)} pendientes
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-primary btn-lg"
            onClick={() => setMostrarFormulario(true)}
          >
            <span>➕</span>
            Nuevo Encargo
          </button>
          <button 
            className="btn-secondary btn-lg"
            onClick={exportarCSV}
          >
            <span>📥</span>
            Exportar CSV
          </button>
        </div>
      </div>
      
      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Total Encargos</h3>
            <p className="stat-value">{estadisticas.totalEncargos}</p>
            <p className="stat-label">Histórico</p>
          </div>
        </div>
        
        <div className="stat-card pendiente">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pendientes</h3>
            <p className="stat-value">
              {encargos.filter(o => o.estado === 'Pendiente').length}
            </p>
            <p className="stat-label">
              ${estadisticas.totalPendiente.toFixed(2)} USD
            </p>
          </div>
        </div>
        
        <div className="stat-card transito">
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <h3>En Tránsito</h3>
            <p className="stat-value">
              {encargos.filter(o => o.estado === 'En tránsito').length}
            </p>
            <p className="stat-label">
              ${estadisticas.totalEnTransito.toFixed(2)} USD
            </p>
          </div>
        </div>
        
        <div className="stat-card recibido">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Recibidos</h3>
            <p className="stat-value">
              {encargos.filter(o => o.estado === 'Recibido').length}
            </p>
            <p className="stat-label">
              ${estadisticas.totalRecibido.toFixed(2)} USD
            </p>
          </div>
        </div>
        
        <div className="stat-card proximos">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Próximos</h3>
            <p className="stat-value">{estadisticas.encargosProximos}</p>
            <p className="stat-label">Esta semana</p>
          </div>
        </div>
        
        <div className="stat-card atrasados">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Atrasados</h3>
            <p className="stat-value">{estadisticas.encargosAtrasados}</p>
            <p className="stat-label">Por atender</p>
          </div>
        </div>
      </div>
      
      {/* Panel de filtros */}
      <div className="filters-panel">
        <h3>🔍 Filtros y Búsqueda</h3>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label>Buscar:</label>
            <input
              type="text"
              placeholder="Buscar por proveedor, productos, ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Estado:</label>
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En tránsito">En tránsito</option>
              <option value="Recibido">Recibido</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Parcial">Parcial</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Proveedor:</label>
            <select 
              value={filtroProveedor} 
              onChange={(e) => setFiltroProveedor(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos los proveedores</option>
              {suppliers.map(proveedor => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Ordenar por:</label>
            <select 
              value={orden} 
              onChange={(e) => setOrden(e.target.value)}
              className="filter-select"
            >
              <option value="fecha_desc">Fecha más reciente</option>
              <option value="fecha_asc">Fecha más antigua</option>
              <option value="total_desc">Total mayor primero</option>
              <option value="total_asc">Total menor primero</option>
              <option value="proveedor">Proveedor (A-Z)</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Fecha desde:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="date-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Fecha hasta:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="date-input"
            />
          </div>
        </div>
        
        <div className="filter-actions">
          <button 
            className="btn-clear-filters"
            onClick={() => {
              setFiltroEstado('todos');
              setFiltroProveedor('todos');
              setBusqueda('');
              setFechaInicio('');
              setFechaFin('');
            }}
          >
            🗑️ Limpiar Filtros
          </button>
        </div>
      </div>
      
      {/* Tabla de encargos */}
      <div className="encargos-table-container">
        <div className="table-header">
          <h3>
            <span>📋</span>
            Lista de Encargos
            <span className="badge-count">{encargosFiltrados.length}</span>
          </h3>
          <div className="table-summary">
            Mostrando {encargosFiltrados.length} de {encargos.length} encargos
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="encargos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Entrega</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {encargosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>No se encontraron encargos</p>
                    <small>Intenta cambiar los filtros o crear un nuevo encargo</small>
                  </td>
                </tr>
              ) : (
                encargosFiltrados.map(encargo => {
                  const diasRestantes = calcularDiasRestantes(encargo.entrega_estimada);
                  
                  return (
                    <tr key={encargo.id} className="encargo-row">
                      <td className="encargo-id">
                        <span className="id-badge">#{encargo.id?.substring(0, 8)}</span>
                      </td>
                      
                      <td className="encargo-fecha">
                        <div className="fecha-principal">
                          {new Date(encargo.fecha_creacion || encargo.created_at).toLocaleDateString()}
                        </div>
                        <div className="fecha-hora">
                          {new Date(encargo.fecha_creacion || encargo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      
                      <td className="encargo-proveedor">
                        <div className="proveedor-nombre">{encargo.proveedor}</div>
                        <div className="proveedor-contacto">
                          {suppliers.find(s => s.id === encargo.proveedor_id || s.nombre === encargo.proveedor)?.telefono || 'Sin contacto'}
                        </div>
                      </td>
                      
                      <td className="encargo-productos">
                        <div className="productos-count">
                          {Array.isArray(encargo.productos) 
                            ? `${encargo.productos.length} productos`
                            : 'Lista de productos'}
                        </div>
                        <div className="productos-preview">
                          {Array.isArray(encargo.productos) 
                            ? encargo.productos.slice(0, 2).map(p => p.nombre).join(', ')
                            : encargo.productos?.substring(0, 50)}
                          {Array.isArray(encargo.productos) && encargo.productos.length > 2 && '...'}
                        </div>
                      </td>
                      
                      <td className="encargo-total">
                        <div className="total-usd">${encargo.total?.toFixed(2) || '0.00'} USD</div>
                        <div className="total-ves">
                          Bs. {(encargo.total_ves || convertToVES(encargo.total || 0)).toFixed(2)} VES
                        </div>
                      </td>
                      
                      <td className="encargo-estado">
                        <span 
                          className="estado-badge"
                          style={{ 
                            backgroundColor: getStatusColor(encargo.estado),
                            color: encargo.estado === 'Pendiente' ? '#333' : 'white'
                          }}
                        >
                          {encargo.estado}
                        </span>
                        
                        {diasRestantes !== null && encargo.estado !== 'Recibido' && encargo.estado !== 'Cancelado' && (
                          <div className={`dias-restantes ${diasRestantes < 0 ? 'atrasado' : diasRestantes <= 3 ? 'urgente' : ''}`}>
                            {diasRestantes < 0 
                              ? `${Math.abs(diasRestantes)} días atrasado`
                              : `${diasRestantes} días restantes`
                            }
                          </div>
                        )}
                      </td>
                      
                      <td className="encargo-entrega">
                        {encargo.entrega_estimada ? (
                          <>
                            <div className="entrega-fecha">
                              {new Date(encargo.entrega_estimada).toLocaleDateString()}
                            </div>
                            {encargo.estado === 'Recibido' && (
                              <div className="recibido-badge">
                                ✅ Recibido
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="sin-fecha">Sin fecha</span>
                        )}
                      </td>
                      
                      <td className="encargo-acciones">
                        <div className="acciones-grid">
                          {encargo.estado !== 'Recibido' && encargo.estado !== 'Cancelado' && (
                            <button
                              className="btn-action success"
                              onClick={() => abrirModalConfirmacion(
                                'recibir',
                                encargo.id,
                                'Confirmar Recepción',
                                '¿Estás seguro de marcar este encargo como recibido? Esto actualizará el stock de los productos.'
                              )}
                              title="Marcar como recibido"
                            >
                              ✅
                            </button>
                          )}
                          
                          <button
                            className="btn-action info"
                            onClick={() => setMostrarDetalles(encargo.id)}
                            title="Ver detalles"
                          >
                            👁️
                          </button>
                          
                          {encargo.estado === 'Pendiente' && (
                            <button
                              className="btn-action warning"
                              onClick={() => abrirModalConfirmacion(
                                'cancelar',
                                encargo.id,
                                'Confirmar Cancelación',
                                '¿Estás seguro de cancelar este encargo? Esta acción no se puede deshacer.'
                              )}
                              title="Cancelar encargo"
                            >
                              ❌
                            </button>
                          )}
                          
                          {encargo.archivos && encargo.archivos.length > 0 && (
                            <button
                              className="btn-action primary"
                              onClick={() => alert('Ver archivos adjuntos')}
                              title="Ver archivos adjuntos"
                            >
                              📎
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {encargosFiltrados.length > 0 && (
          <div className="table-footer">
            <div className="pagination">
              <button className="pagination-btn">‹ Anterior</button>
              <span className="pagination-info">Página 1 de 1</span>
              <button className="pagination-btn">Siguiente ›</button>
            </div>
          </div>
        )}
      </div>
      
      {/* Formulario de nuevo encargo */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content encargo-modal">
            <div className="modal-header">
              <h2>📝 Nuevo Encargo</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setMostrarFormulario(false);
                  setProductosSeleccionados([]);
                  setArchivosPreview([]);
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-columns">
                  {/* Columna izquierda - Datos básicos */}
                  <div className="form-column">
                    <h3>📋 Información del Encargo</h3>
                    
                    <div className="form-group">
                      <label>Proveedor *</label>
                      <select
                        name="proveedor_id"
                        value={nuevoEncargo.proveedor_id}
                        onChange={handleChange}
                        required
                        className="form-select"
                      >
                        <option value="">Seleccionar proveedor...</option>
                        {suppliers.map(proveedor => (
                          <option key={proveedor.id} value={proveedor.id}>
                            {proveedor.nombre} - {proveedor.telefono || 'Sin teléfono'}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Fecha Estimada de Entrega *</label>
                      <input
                        type="date"
                        name="entrega_estimada"
                        value={nuevoEncargo.entrega_estimada}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Notas y Observaciones</label>
                      <textarea
                        name="notas"
                        value={nuevoEncargo.notas}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Instrucciones especiales, detalles de entrega, etc."
                        className="form-textarea"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Archivos Adjuntos</label>
                      <div className="file-upload-area">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="file-input"
                          id="file-upload"
                          disabled={cargandoArchivos}
                        />
                        <label htmlFor="file-upload" className="file-upload-label">
                          {cargandoArchivos ? '⏳ Subiendo...' : '📎 Subir archivos'}
                        </label>
                        
                        {archivosPreview.length > 0 && (
                          <div className="files-preview">
                            {archivosPreview.map((file, index) => (
                              <div key={index} className="file-preview">
                                <span>📄 {file.nombre}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setArchivosPreview(prev => prev.filter((_, i) => i !== index));
                                    setNuevoEncargo(prev => ({
                                      ...prev,
                                      archivos: prev.archivos.filter((_, i) => i !== index)
                                    }));
                                  }}
                                  className="file-remove"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Columna derecha - Productos */}
                  <div className="form-column">
                    <h3>🛒 Productos del Encargo</h3>
                    
                    {/* Selector de productos */}
                    <div className="productos-selector">
                      <h4>Productos con Stock Bajo:</h4>
                      <div className="productos-sugeridos">
                        {products
                          .filter(p => (p.stock || 0) < (p.stock_minimo || 10))
                          .slice(0, 6)
                          .map(product => (
                            <button
                              type="button"
                              key={product.id}
                              onClick={() => agregarProducto(product)}
                              className="producto-sugerido"
                            >
                              <span>{product.nombre}</span>
                              <small>Stock: {product.stock} | Mín: {product.stock_minimo || 10}</small>
                            </button>
                          ))}
                      </div>
                      
                      <div className="search-products">
                        <input
                          type="text"
                          placeholder="Buscar todos los productos..."
                          className="search-products-input"
                        />
                      </div>
                    </div>
                    
                    {/* Lista de productos seleccionados */}
                    <div className="productos-seleccionados">
                      <h4>Productos Seleccionados ({productosSeleccionados.length})</h4>
                      
                      {productosSeleccionados.length === 0 ? (
                        <div className="empty-productos">
                          <span>🛒</span>
                          <p>No hay productos seleccionados</p>
                          <small>Agrega productos desde la lista de sugeridos</small>
                        </div>
                      ) : (
                        <div className="productos-lista">
                          {productosSeleccionados.map(producto => (
                            <div key={producto.id} className="producto-item">
                              <div className="producto-info">
                                <div className="producto-nombre">{producto.nombre}</div>
                                <div className="producto-precio">
                                  ${producto.precio_unitario?.toFixed(2)} USD c/u
                                </div>
                              </div>
                              
                              <div className="producto-controls">
                                <div className="cantidad-control">
                                  <button
                                    type="button"
                                    onClick={() => actualizarCantidad(producto.id, producto.cantidad - 1)}
                                    className="cantidad-btn"
                                  >
                                    -
                                  </button>
                                  <span className="cantidad-value">{producto.cantidad}</span>
                                  <button
                                    type="button"
                                    onClick={() => actualizarCantidad(producto.id, producto.cantidad + 1)}
                                    className="cantidad-btn"
                                  >
                                    +
                                  </button>
                                </div>
                                
                                <div className="producto-subtotal">
                                  ${producto.subtotal?.toFixed(2)}
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => actualizarCantidad(producto.id, 0)}
                                  className="remove-producto"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Resumen total */}
                      <div className="resumen-total">
                        <div className="total-item">
                          <span>Subtotal:</span>
                          <span>${nuevoEncargo.total.toFixed(2)} USD</span>
                        </div>
                        <div className="total-item">
                          <span>Total en VES:</span>
                          <span>Bs. {nuevoEncargo.total_ves.toFixed(2)}</span>
                        </div>
                        <div className="total-item total-final">
                          <span>Total del Encargo:</span>
                          <span className="total-amount">${nuevoEncargo.total.toFixed(2)} USD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="submit" className="btn-confirmar btn-lg">
                  📨 Crear Encargo
                </button>
                <button 
                  type="button" 
                  className="btn-cancelar btn-lg"
                  onClick={() => setMostrarFormulario(false)}
                >
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación */}
      {modalConfirmacion.abierto && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <div className="confirm-icon">
              {modalConfirmacion.tipo === 'recibir' ? '✅' :
               modalConfirmacion.tipo === 'cancelar' ? '❌' : '⚠️'}
            </div>
            <h3>{modalConfirmacion.titulo}</h3>
            <p>{modalConfirmacion.mensaje}</p>
            <div className="confirm-actions">
              <button 
                className="btn-confirm"
                onClick={confirmarAccion}
              >
                Confirmar
              </button>
              <button 
                className="btn-cancel"
                onClick={() => setModalConfirmacion({ abierto: false, tipo: '', encargoId: null, titulo: '', mensaje: '' })}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncargosDetalle;