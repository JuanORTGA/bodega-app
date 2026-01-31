import React, { useState, useEffect } from 'react';
import './Reportes.css';

const Reportes = () => {
  // Estados para los datos de reportes
  const [periodo, setPeriodo] = useState('mes');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mostrarGraficos, setMostrarGraficos] = useState(true);
  
  // Datos de ejemplo para reportes
  const [datosReporte, setDatosReporte] = useState({
    gananciasTotales: 0,
    ventasTotales: 0,
    productosVendidos: 0,
    productosStock: 0,
    clientesAtendidos: 0,
    promedioTicket: 0,
    productosPopulares: [],
    ventasPorCategoria: [],
    tendenciasVentas: [],
    movimientosRecientes: [],
    productosBajoStock: []
  });

  // Datos de ejemplo
  const productosPopularesEjemplo = [
    { nombre: 'Arroz 1kg', cantidad: 245, porcentaje: 15 },
    { nombre: 'Aceite 1L', cantidad: 189, porcentaje: 12 },
    { nombre: 'Harina PAN', cantidad: 167, porcentaje: 10 },
    { nombre: 'Leche en polvo', cantidad: 134, porcentaje: 8 },
    { nombre: 'Café 500g', cantidad: 98, porcentaje: 6 },
  ];

  const ventasPorCategoriaEjemplo = [
    { categoria: 'Alimentos', ventas: 12500, porcentaje: 35 },
    { categoria: 'Bebidas', ventas: 8900, porcentaje: 25 },
    { categoria: 'Limpieza', ventas: 6700, porcentaje: 19 },
    { categoria: 'Chucherias', ventas: 4500, porcentaje: 13 },
    { categoria: 'Otros', ventas: 2400, porcentaje: 8 },
  ];

  const tendenciasVentasEjemplo = [
    { dia: 'Lun', ventas: 1200 },
    { dia: 'Mar', ventas: 1800 },
    { dia: 'Mié', ventas: 1500 },
    { dia: 'Jue', ventas: 2200 },
    { dia: 'Vie', ventas: 2800 },
    { dia: 'Sáb', ventas: 3200 },
    { dia: 'Dom', ventas: 2500 },
  ];

  const movimientosRecientesEjemplo = [
    { id: 1, tipo: 'Venta', descripcion: 'Arroz, Aceite, Harina', monto: 45.50, fecha: '2024-01-15 10:30', usuario: 'Carlos' },
    { id: 2, tipo: 'Compra', descripcion: 'Ingreso de productos', monto: 1200.00, fecha: '2024-01-14 16:15', usuario: 'Admin' },
    { id: 3, tipo: 'Venta', descripcion: 'Productos de limpieza', monto: 89.75, fecha: '2024-01-14 14:20', usuario: 'María' },
    { id: 4, tipo: 'Ajuste', descripcion: 'Ajuste de inventario', monto: -15.00, fecha: '2024-01-13 09:45', usuario: 'Admin' },
    { id: 5, tipo: 'Venta', descripcion: 'Productos varios', monto: 156.30, fecha: '2024-01-12 11:10', usuario: 'Juan' },
  ];

  const productosBajoStockEjemplo = [
    { nombre: 'Azúcar 1kg', stock: 8, minimo: 20, categoria: 'Alimentos' },
    { nombre: 'Detergente', stock: 12, minimo: 25, categoria: 'Limpieza' },
    { nombre: 'Papel Higiénico', stock: 15, minimo: 30, categoria: 'Hogar' },
    { nombre: 'Atún enlatado', stock: 10, minimo: 25, categoria: 'Enlatados' },
    { nombre: 'Jabón de baño', stock: 18, minimo: 35, categoria: 'Aseo' },
  ];

  // Calcular datos del reporte
  useEffect(() => {
    // Aquí normalmente harías una llamada API para obtener datos reales
    // Por ahora usamos datos de ejemplo
    
    const gananciasTotales = 35800;
    const ventasTotales = 256;
    const productosVendidos = 1245;
    const productosStock = 345;
    const clientesAtendidos = 189;
    const promedioTicket = 139.84;

    setDatosReporte({
      gananciasTotales,
      ventasTotales,
      productosVendidos,
      productosStock,
      clientesAtendidos,
      promedioTicket,
      productosPopulares: productosPopularesEjemplo,
      ventasPorCategoria: ventasPorCategoriaEjemplo,
      tendenciasVentas: tendenciasVentasEjemplo,
      movimientosRecientes: movimientosRecientesEjemplo,
      productosBajoStock: productosBajoStockEjemplo
    });
  }, [periodo, fechaInicio, fechaFin]);

  // Generar reporte en PDF (simulado)
  const generarPDF = () => {
    alert('Generando reporte en PDF... Esta funcionalidad se integraría con una librería como jsPDF');
  };

  // Exportar a Excel (simulado)
  const exportarExcel = () => {
    alert('Exportando a Excel... Esta funcionalidad se integraría con una librería como xlsx');
  };

  // Enviar por correo (simulado)
  const enviarCorreo = () => {
    const email = prompt('Ingrese el correo electrónico para enviar el reporte:');
    if (email) {
      alert(`Reporte enviado a ${email}`);
    }
  };

  // Formatear moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2
    }).format(valor);
  };

  // Calcular el máximo para las barras
  const maxVentas = Math.max(...tendenciasVentasEjemplo.map(item => item.ventas));

  return (
    <div className="reportes-container">
      {/* Header del módulo */}
      <div className="reportes-header">
        <div className="header-left">
          <h1>📊 Dashboard de Reportes</h1>
          <p className="subtitle">Análisis completo y estadísticas de tu bodega</p>
        </div>
        <div className="header-right">
          <div className="filtros-container">
            <select 
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="filtro-select"
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
              <option value="trimestre">Este trimestre</option>
              <option value="anio">Este año</option>
              <option value="personalizado">Personalizado</option>
            </select>
            
            {periodo === 'personalizado' && (
              <div className="fechas-personalizadas">
                <input 
                  type="date" 
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="fecha-input"
                />
                <span>al</span>
                <input 
                  type="date" 
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="fecha-input"
                />
              </div>
            )}
            
            <button 
              className="btn-refrescar"
              onClick={() => alert('Datos actualizados')}
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="metricas-grid">
        <div className="metrica-card ganancias">
          <div className="metrica-icon">💰</div>
          <div className="metrica-content">
            <h3>Ganancias Totales</h3>
            <p className="metrica-valor">{formatearMoneda(datosReporte.gananciasTotales)}</p>
            <p className="metrica-tendencia">↑ 12% vs período anterior</p>
          </div>
        </div>
        
        <div className="metrica-card ventas">
          <div className="metrica-icon">📈</div>
          <div className="metrica-content">
            <h3>Ventas Totales</h3>
            <p className="metrica-valor">{datosReporte.ventasTotales}</p>
            <p className="metrica-tendencia">↑ 8% vs período anterior</p>
          </div>
        </div>
        
        <div className="metrica-card productos">
          <div className="metrica-icon">📦</div>
          <div className="metrica-content">
            <h3>Productos Vendidos</h3>
            <p className="metrica-valor">{datosReporte.productosVendidos}</p>
            <p className="metrica-tendencia">↑ 15% vs período anterior</p>
          </div>
        </div>
        
        <div className="metrica-card ticket">
          <div className="metrica-icon">🧾</div>
          <div className="metrica-content">
            <h3>Ticket Promedio</h3>
            <p className="metrica-valor">{formatearMoneda(datosReporte.promedioTicket)}</p>
            <p className="metrica-tendencia">↑ 5% vs período anterior</p>
          </div>
        </div>
      </div>

      {/* Controles de visualización */}
      <div className="controles-visualizacion">
        <button 
          className={`btn-visualizacion ${mostrarGraficos ? 'activo' : ''}`}
          onClick={() => setMostrarGraficos(true)}
        >
          📊 Ver Gráficos
        </button>
        <button 
          className={`btn-visualizacion ${!mostrarGraficos ? 'activo' : ''}`}
          onClick={() => setMostrarGraficos(false)}
        >
          📋 Ver Tablas
        </button>
      </div>

      {/* Sección de gráficos */}
      {mostrarGraficos && (
        <div className="graficos-section">
          <div className="grafico-principal">
            <div className="grafico-header">
              <h3>Tendencia de Ventas</h3>
              <span className="grafico-periodo">Últimos 7 días</span>
            </div>
            <div className="grafico-barras">
              {datosReporte.tendenciasVentas.map((item, index) => (
                <div key={index} className="barra-container">
                  <div className="barra-wrapper">
                    <div 
                      className="barra" 
                      style={{ 
                        height: `${(item.ventas / maxVentas) * 100}%`,
                        backgroundColor: item.ventas > 2000 ? '#4CAF50' : '#2196F3'
                      }}
                    >
                      <span className="barra-valor">{formatearMoneda(item.ventas)}</span>
                    </div>
                  </div>
                  <div className="barra-label">{item.dia}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="graficos-secundarios">
            <div className="grafico-secundario">
              <h4>Ventas por Categoría</h4>
              <div className="grafico-tarta">
                {datosReporte.ventasPorCategoria.map((cat, index) => (
                  <div 
                    key={index} 
                    className="sector-tarta"
                    style={{
                      backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2'][index],
                      transform: `rotate(${cat.porcentaje * 3.6}deg)`
                    }}
                    title={`${cat.categoria}: ${cat.porcentaje}%`}
                  >
                    <div className="sector-info">
                      <span className="sector-nombre">{cat.categoria}</span>
                      <span className="sector-porcentaje">{cat.porcentaje}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grafico-secundario">
              <h4>Productos Más Vendidos</h4>
              <div className="ranking-productos">
                {datosReporte.productosPopulares.map((producto, index) => (
                  <div key={index} className="ranking-item">
                    <div className="ranking-posicion">#{index + 1}</div>
                    <div className="ranking-info">
                      <div className="ranking-nombre">{producto.nombre}</div>
                      <div className="ranking-barra-container">
                        <div 
                          className="ranking-barra"
                          style={{ width: `${producto.porcentaje * 5}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ranking-cantidad">{producto.cantidad} unidades</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección de tablas */}
      {!mostrarGraficos && (
        <div className="tablas-section">
          <div className="tabla-container">
            <div className="tabla-header">
              <h3>📋 Movimientos Recientes</h3>
              <button className="btn-ver-todos">Ver todos →</button>
            </div>
            <table className="tabla-movimientos">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {datosReporte.movimientosRecientes.map(movimiento => (
                  <tr key={movimiento.id} className={`tipo-${movimiento.tipo.toLowerCase()}`}>
                    <td>
                      <span className={`badge-tipo ${movimiento.tipo.toLowerCase()}`}>
                        {movimiento.tipo}
                      </span>
                    </td>
                    <td>{movimiento.descripcion}</td>
                    <td className={`monto ${movimiento.monto > 0 ? 'positivo' : 'negativo'}`}>
                      {formatearMoneda(Math.abs(movimiento.monto))}
                    </td>
                    <td>{movimiento.fecha}</td>
                    <td>{movimiento.usuario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="tabla-container">
            <div className="tabla-header">
              <h3>⚠️ Productos Bajo Stock</h3>
              <span className="alerta-stock">{datosReporte.productosBajoStock.length} productos</span>
            </div>
            <table className="tabla-stock">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {datosReporte.productosBajoStock.map((producto, index) => (
                  <tr key={index}>
                    <td>{producto.nombre}</td>
                    <td>
                      <div className="barra-stock">
                        <div 
                          className="stock-actual"
                          style={{ width: `${(producto.stock / producto.minimo) * 100}%` }}
                        ></div>
                        <span className="stock-numero">{producto.stock}</span>
                      </div>
                    </td>
                    <td>{producto.minimo}</td>
                    <td>{producto.categoria}</td>
                    <td>
                      <span className={`estado-stock ${producto.stock < producto.minimo * 0.5 ? 'critico' : 'bajo'}`}>
                        {producto.stock < producto.minimo * 0.5 ? 'CRÍTICO' : 'BAJO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estadísticas adicionales */}
      <div className="estadisticas-adicionales">
        <div className="estadistica-card">
          <h4>📊 Resumen del Período</h4>
          <div className="estadistica-content">
            <div className="estadistica-item">
              <span className="estadistica-label">Productos en Stock:</span>
              <span className="estadistica-valor">{datosReporte.productosStock}</span>
            </div>
            <div className="estadistica-item">
              <span className="estadistica-label">Clientes Atendidos:</span>
              <span className="estadistica-valor">{datosReporte.clientesAtendidos}</span>
            </div>
            <div className="estadistica-item">
              <span className="estadistica-label">Venta Promedio por Día:</span>
              <span className="estadistica-valor">{formatearMoneda(datosReporte.gananciasTotales / 30)}</span>
            </div>
            <div className="estadistica-item">
              <span className="estadistica-label">Productividad:</span>
              <span className="estadistica-valor">{(datosReporte.productosVendidos / datosReporte.ventasTotales).toFixed(1)} uds/venta</span>
            </div>
          </div>
        </div>
        
        <div className="estadistica-card">
          <h4>🎯 Objetivos</h4>
          <div className="estadistica-content">
            <div className="objetivo-item">
              <div className="objetivo-info">
                <span className="objetivo-label">Meta de Ventas</span>
                <span className="objetivo-progreso">75% completado</span>
              </div>
              <div className="progreso-bar">
                <div className="progreso-fill" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="objetivo-item">
              <div className="objetivo-info">
                <span className="objetivo-label">Rotación de Stock</span>
                <span className="objetivo-progreso">60% completado</span>
              </div>
              <div className="progreso-bar">
                <div className="progreso-fill" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="objetivo-item">
              <div className="objetivo-info">
                <span className="objetivo-label">Crecimiento Mensual</span>
                <span className="objetivo-progreso">85% completado</span>
              </div>
              <div className="progreso-bar">
                <div className="progreso-fill" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="acciones-reporte">
        <div className="acciones-info">
          <span className="info-exportacion">
            Última actualización: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </span>
        </div>
        <div className="acciones-botones">
          <button className="btn-accion secundario" onClick={generarPDF}>
            📄 Generar PDF
          </button>
          <button className="btn-accion secundario" onClick={exportarExcel}>
            📊 Exportar Excel
          </button>
          <button className="btn-accion secundario" onClick={enviarCorreo}>
            📧 Enviar por Correo
          </button>
          <button 
            className="btn-accion primario"
            onClick={() => alert('Programando reporte automático...')}
          >
            ⚙️ Programar Reporte
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reportes;