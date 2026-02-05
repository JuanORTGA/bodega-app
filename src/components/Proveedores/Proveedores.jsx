import React, { useState, useEffect } from 'react';
import './Proveedores.css';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Building,
  Download,
  Printer,
  Filter,
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Upload,
  MoreVertical
} from 'lucide-react';

const Proveedores = () => {
  // Estado inicial de proveedores
  const [proveedores, setProveedores] = useState([
    {
      id: 1,
      nombre: "Distribuidora Alimentos S.A.",
      contacto: "Juan Pérez",
      telefono: "+58 412-555-1234",
      email: "juan@distribuidora.com",
      direccion: "Av. Principal #123, Caracas",
      tipo: "Alimentos",
      calificacion: 4.5,
      estado: "Activo",
      productos: ["Arroz", "Harina", "Aceite"],
      fechaRegistro: "2024-01-15",
      comprasTotales: 12500
    },
    {
      id: 2,
      nombre: "Bebidas del Caribe C.A.",
      contacto: "María Rodríguez",
      telefono: "+58 414-555-5678",
      email: "ventas@bebidascaribe.com",
      direccion: "Calle Comercio #456, Valencia",
      tipo: "Bebidas",
      calificacion: 4.2,
      estado: "Activo",
      productos: ["Refrescos", "Jugos", "Agua"],
      fechaRegistro: "2024-02-20",
      comprasTotales: 8900
    },
    {
      id: 3,
      nombre: "Importadora de Licores",
      contacto: "Carlos Gómez",
      telefono: "+58 416-555-9012",
      email: "cgomez@importadora.com",
      direccion: "Zona Industrial, Maracay",
      tipo: "Licores",
      calificacion: 4.7,
      estado: "Inactivo",
      productos: ["Ron", "Whisky", "Vodka"],
      fechaRegistro: "2023-11-10",
      comprasTotales: 21500
    }
  ]);

  // Estado para el formulario de nuevo proveedor
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
    tipo: 'Alimentos',
    calificacion: 0,
    estado: 'Activo'
  });

  // Estados para búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState(null);

  // Tipos de proveedores disponibles
  const tiposProveedores = [
    'Alimentos',
    'Bebidas',
    'Licores',
    'Chucherias',
    'Charcuteria',
    'Necesidades basicas',
    'Limpieza',
    'Envasados',
    'Frescos',
    'Importado'
  ];

  // Filtrar proveedores según búsqueda y filtros
  const proveedoresFiltrados = proveedores.filter(proveedor => {
    const coincideBusqueda = 
      proveedor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.contacto.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.telefono.includes(busqueda);

    const coincideTipo = filtroTipo === 'Todos' || proveedor.tipo === filtroTipo;
    const coincideEstado = filtroEstado === 'Todos' || proveedor.estado === filtroEstado;

    return coincideBusqueda && coincideTipo && coincideEstado;
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (proveedorEditando) {
      setProveedorEditando({
        ...proveedorEditando,
        [name]: value
      });
    } else {
      setNuevoProveedor({
        ...nuevoProveedor,
        [name]: value
      });
    }
  };

  // Agregar nuevo proveedor
  const agregarProveedor = (e) => {
    e.preventDefault();
    if (proveedorEditando) {
      // Editar proveedor existente
      const proveedoresActualizados = proveedores.map(p =>
        p.id === proveedorEditando.id ? {
          ...proveedorEditando,
          id: proveedorEditando.id,
          fechaRegistro: proveedorEditando.fechaRegistro || new Date().toISOString().split('T')[0],
          comprasTotales: proveedorEditando.comprasTotales || 0,
          productos: proveedorEditando.productos || []
        } : p
      );
      setProveedores(proveedoresActualizados);
      setProveedorEditando(null);
    } else {
      // Agregar nuevo proveedor
      const nuevoId = Math.max(...proveedores.map(p => p.id)) + 1;
      const proveedorCompleto = {
        ...nuevoProveedor,
        id: nuevoId,
        fechaRegistro: new Date().toISOString().split('T')[0],
        comprasTotales: 0,
        productos: [],
        calificacion: parseFloat(nuevoProveedor.calificacion) || 0
      };
      
      setProveedores([...proveedores, proveedorCompleto]);
      setNuevoProveedor({
        nombre: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: '',
        tipo: 'Alimentos',
        calificacion: 0,
        estado: 'Activo'
      });
    }
    setMostrarFormulario(false);
  };

  // Eliminar proveedor
  const eliminarProveedor = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      setProveedores(proveedores.filter(p => p.id !== id));
    }
  };

  // Editar proveedor
  const editarProveedor = (proveedor) => {
    setProveedorEditando(proveedor);
    setMostrarFormulario(true);
  };

  // Cancelar edición/creación
  const cancelarFormulario = () => {
    setMostrarFormulario(false);
    setProveedorEditando(null);
    setNuevoProveedor({
      nombre: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
      tipo: 'Alimentos',
      calificacion: 0,
      estado: 'Activo'
    });
  };

  // Exportar a Excel
  const exportarAExcel = () => {
    const datosCSV = proveedores.map(p => ({
      'ID': p.id,
      'Nombre': p.nombre,
      'Contacto': p.contacto,
      'Teléfono': p.telefono,
      'Email': p.email,
      'Dirección': p.direccion,
      'Tipo': p.tipo,
      'Calificación': p.calificacion,
      'Estado': p.estado,
      'Fecha Registro': p.fechaRegistro,
      'Compras Totales': p.comprasTotales
    }));

    const csv = convertirAExcel(datosCSV);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `proveedores_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertirAExcel = (datos) => {
    const cabeceras = Object.keys(datos[0]).join(',');
    const filas = datos.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
    return [cabeceras, ...filas].join('\n');
  };

  // Imprimir lista
  const imprimirLista = () => {
    window.print();
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const total = proveedores.length;
    const activos = proveedores.filter(p => p.estado === 'Activo').length;
    const inactivos = total - activos;
    const promedioCalificacion = proveedores.length > 0 
      ? (proveedores.reduce((sum, p) => sum + p.calificacion, 0) / proveedores.length).toFixed(1)
      : 0;
    const totalCompras = proveedores.reduce((sum, p) => sum + p.comprasTotales, 0);

    return { total, activos, inactivos, promedioCalificacion, totalCompras };
  };

  const estadisticas = calcularEstadisticas();

  // Generar calificación visual
  const generarEstrellas = (calificacion) => {
    const estrellas = [];
    const estrellasLlenas = Math.floor(calificacion);
    const mediaEstrella = calificacion % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < estrellasLlenas) {
        estrellas.push(<span key={i} className="estrella llena">★</span>);
      } else if (i === estrellasLlenas && mediaEstrella) {
        estrellas.push(<span key={i} className="estrella media">★</span>);
      } else {
        estrellas.push(<span key={i} className="estrella vacia">☆</span>);
      }
    }
    return estrellas;
  };

  return (
    <div className="proveedores-container">
      {/* Header con título y botón de agregar */}
      <div className="proveedores-header">
        <div className="header-left">
          <h2><Building size={24} /> Gestión de Proveedores</h2>
          <p className="header-subtitle">Administra y controla todos tus proveedores en un solo lugar</p>
        </div>
        <div className="header-right">
          <button 
            className="btn-agregar"
            onClick={() => setMostrarFormulario(true)}
          >
            <PlusCircle size={20} /> Nuevo Proveedor
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Building size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Proveedores</h3>
            <p className="stat-number">{estadisticas.total}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Proveedores Activos</h3>
            <p className="stat-number">{estadisticas.activos}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon rating">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <h3>Calificación Promedio</h3>
            <p className="stat-number">{estadisticas.promedioCalificacion}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon sales">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Compras Totales</h3>
            <p className="stat-number">${estadisticas.totalCompras.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="search-filters-container">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar proveedores por nombre, contacto, teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters-container">
          <div className="filter-group">
            <label><Filter size={16} /> Tipo:</label>
            <select 
              value={filtroTipo} 
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="filter-select"
            >
              <option value="Todos">Todos los tipos</option>
              {tiposProveedores.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Estado:</label>
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="filter-select"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <button 
            className="btn-limpiar-filtros"
            onClick={() => {
              setBusqueda('');
              setFiltroTipo('Todos');
              setFiltroEstado('Todos');
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Formulario para agregar/editar proveedor */}
      {mostrarFormulario && (
        <div className="formulario-overlay">
          <div className="formulario-container">
            <div className="formulario-header">
              <h3>{proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
              <button onClick={cancelarFormulario} className="btn-cerrar">×</button>
            </div>
            
            <form onSubmit={agregarProveedor} className="formulario-proveedor">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre del Proveedor *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={proveedorEditando ? proveedorEditando.nombre : nuevoProveedor.nombre}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Distribuidora Alimentos S.A."
                  />
                </div>
                
                <div className="form-group">
                  <label>Persona de Contacto *</label>
                  <input
                    type="text"
                    name="contacto"
                    value={proveedorEditando ? proveedorEditando.contacto : nuevoProveedor.contacto}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                
                <div className="form-group">
                  <label>Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={proveedorEditando ? proveedorEditando.telefono : nuevoProveedor.telefono}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: +58 412-555-1234"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={proveedorEditando ? proveedorEditando.email : nuevoProveedor.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: contacto@proveedor.com"
                  />
                </div>
                
                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={proveedorEditando ? proveedorEditando.direccion : nuevoProveedor.direccion}
                    onChange={handleInputChange}
                    placeholder="Ej: Av. Principal #123, Caracas"
                  />
                </div>
                
                <div className="form-group">
                  <label>Tipo de Proveedor</label>
                  <select
                    name="tipo"
                    value={proveedorEditando ? proveedorEditando.tipo : nuevoProveedor.tipo}
                    onChange={handleInputChange}
                  >
                    {tiposProveedores.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Calificación (0-5)</label>
                  <input
                    type="range"
                    name="calificacion"
                    min="0"
                    max="5"
                    step="0.5"
                    value={proveedorEditando ? proveedorEditando.calificacion : nuevoProveedor.calificacion}
                    onChange={handleInputChange}
                  />
                  <div className="calificacion-visual">
                    <span>Calificación: </span>
                    <span className="valor-calificacion">
                      {proveedorEditando ? proveedorEditando.calificacion : nuevoProveedor.calificacion} / 5
                    </span>
                    <div className="estrellas-preview">
                      {generarEstrellas(proveedorEditando ? proveedorEditando.calificacion : nuevoProveedor.calificacion)}
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Estado</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="estado"
                        value="Activo"
                        checked={(proveedorEditando ? proveedorEditando.estado : nuevoProveedor.estado) === 'Activo'}
                        onChange={handleInputChange}
                      />
                      <span className="radio-indicator active"></span>
                      Activo
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="estado"
                        value="Inactivo"
                        checked={(proveedorEditando ? proveedorEditando.estado : nuevoProveedor.estado) === 'Inactivo'}
                        onChange={handleInputChange}
                      />
                      <span className="radio-indicator inactive"></span>
                      Inactivo
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="form-buttons">
                <button type="button" onClick={cancelarFormulario} className="btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {proveedorEditando ? 'Actualizar' : 'Guardar'} Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de proveedores */}
      <div className="proveedores-lista-container">
        <div className="lista-header">
          <h3>Lista de Proveedores ({proveedoresFiltrados.length})</h3>
          <div className="lista-info">
            <span className="info-item">
              Mostrando {proveedoresFiltrados.length} de {proveedores.length} proveedores
            </span>
          </div>
        </div>
        
        {proveedoresFiltrados.length === 0 ? (
          <div className="no-resultados">
            <p>No se encontraron proveedores con los filtros actuales.</p>
          </div>
        ) : (
          <div className="proveedores-grid">
            {proveedoresFiltrados.map(proveedor => (
              <div key={proveedor.id} className={`proveedor-card ${proveedor.estado.toLowerCase()}`}>
                <div className="proveedor-header">
                  <div className="proveedor-info">
                    <h4>{proveedor.nombre}</h4>
                    <span className={`estado-badge ${proveedor.estado.toLowerCase()}`}>
                      {proveedor.estado === 'Activo' ? '✓ Activo' : '✗ Inactivo'}
                    </span>
                  </div>
                  <div className="proveedor-actions">
                    <button 
                      className="btn-editar" 
                      onClick={() => editarProveedor(proveedor)}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-eliminar" 
                      onClick={() => eliminarProveedor(proveedor.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="proveedor-details">
                  <div className="detail-item">
                    <Phone size={16} />
                    <span>{proveedor.telefono}</span>
                  </div>
                  <div className="detail-item">
                    <Mail size={16} />
                    <span>{proveedor.email}</span>
                  </div>
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{proveedor.direccion}</span>
                  </div>
                  <div className="detail-item">
                    <Building size={16} />
                    <span className="tipo-badge">{proveedor.tipo}</span>
                  </div>
                </div>
                
                <div className="proveedor-footer">
                  <div className="calificacion">
                    <div className="estrellas">
                      {generarEstrellas(proveedor.calificacion)}
                    </div>
                    <span className="calificacion-text">{proveedor.calificacion}/5</span>
                  </div>
                  
                  <div className="info-adicional">
                    <div className="info-item">
                      <Calendar size={14} />
                      <span>Registro: {proveedor.fechaRegistro}</span>
                    </div>
                    <div className="info-item">
                      <DollarSign size={14} />
                      <span>Compras: ${proveedor.comprasTotales.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {proveedor.productos && proveedor.productos.length > 0 && (
                  <div className="productos-section">
                    <h5>Productos que provee:</h5>
                    <div className="productos-tags">
                      {proveedor.productos.map((producto, index) => (
                        <span key={index} className="producto-tag">{producto}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barra de acciones inferiores */}
      <div className="action-bar">
        <div className="action-bar-left">
          <button className="btn-action" onClick={exportarAExcel}>
            <Download size={18} /> Exportar a Excel
          </button>
          <button className="btn-action" onClick={imprimirLista}>
            <Printer size={18} /> Imprimir Lista
          </button>
          <button className="btn-action" onClick={() => alert('Función de importar próximamente')}>
            <Upload size={18} /> Importar Proveedores
          </button>
        </div>
        
        <div className="action-bar-right">
          <button 
            className="btn-action secondary"
            onClick={() => alert('Generando reporte de proveedores...')}
          >
            Generar Reporte
          </button>
          <button 
            className="btn-action primary"
            onClick={() => setMostrarFormulario(true)}
          >
            <PlusCircle size={18} /> Agregar Nuevo
          </button>
        </div>
      </div>

      {/* Información adicional */}
      <div className="informacion-util">
        <h4>📋 Información Útil</h4>
        <div className="info-cards">
          <div className="info-card">
            <h5>Tipos de Proveedores</h5>
            <ul>
              {tiposProveedores.slice(0, 5).map(tipo => (
                <li key={tipo}>{tipo}</li>
              ))}
            </ul>
          </div>
          <div className="info-card">
            <h5>Contactos Importantes</h5>
            <p>Para emergencias o problemas con proveedores, contactar al administrador del sistema.</p>
          </div>
          <div className="info-card">
            <h5>Próximas Funcionalidades</h5>
            <ul>
              <li>Evaluación automatizada</li>
              <li>Recordatorios de pago</li>
              <li>Historial completo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Proveedores;