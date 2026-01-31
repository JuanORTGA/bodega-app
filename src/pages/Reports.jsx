import React, { useState, useEffect } from 'react';
import './Reportes.css';

const Reportes = () => {
  // Datos de ejemplo para reportes
  const [datosVentas, setDatosVentas] = useState([
    { mes: 'Enero', ventas: 12000, cantidad: 800 },
    { mes: 'Febrero', ventas: 15000, cantidad: 950 },
    { mes: 'Marzo', ventas: 18000, cantidad: 1100 },
    { mes: 'Abril', ventas: 16000, cantidad: 980 },
    { mes: 'Mayo', ventas: 20000, cantidad: 1250 },
    { mes: 'Junio', ventas: 22000, cantidad: 1350 },
  ]);

  const [topProductos, setTopProductos] = useState([
    { nombre: 'Arroz 1kg', ventas: 150, monto: 2250 },
    { nombre: 'Aceite 1L', ventas: 120, monto: 3840 },
    { nombre: 'Azúcar 1kg', ventas: 100, monto: 1800 },
    { nombre: 'Frijoles 1kg', ventas: 80, monto: 2000 },
    { nombre: 'Leche 1L', ventas: 200, monto: 2400 },
  ]);

  const [categorias, setCategorias] = useState([
    { nombre: 'Granos', ventas: 35, color: '#667eea' },
    { nombre: 'Aceites', ventas: 20, color: '#764ba2' },
    { nombre: 'Endulzantes', ventas: 15, color: '#f093fb' },
    { nombre: 'Lácteos', ventas: 18, color: '#f5576c' },
    { nombre: 'Bebidas', ventas: 12, color: '#4facfe' },
  ]);

  const [reportesGenerados, setReportesGenerados] = useState([
    { id: 1, nombre: 'Reporte de Ventas - Junio 2024', fecha: '2024-06-30', tipo: 'Ventas' },
    { id: 2, nombre: 'Inventario General - Mayo 2024', fecha: '2024-05-31', tipo: 'Inventario' },
    { id: 3, nombre: 'Análisis de Proveedores - Q2 2024', fecha: '2024-06-15', tipo: 'Proveedores' },
  ]);

  // Filtros
  const [periodo, setPeriodo] = useState('6meses');
  const [tipoReporte, setTipoReporte] = useState('ventas');

  // Estadísticas calculadas
  const ventasTotales = datosVentas.reduce((sum, mes) => sum + mes.ventas, 0);
  const promedioMensual = ventasTotales / datosVentas.length;
  const crecimiento = ((datosVentas[datosVentas.length-1].ventas - datosVentas[0].ventas) / datosVentas[0].ventas) * 100;
  
  // Generar reporte
  const generarReporte = () => {
    const nuevoReporte = {
      id: reportesGenerados.length + 1,
      nombre: `Reporte de ${tipoReporte} - ${new Date().toLocaleDateString()}`,
      fecha: new Date().toISOString().split('T')[0],
      tipo: tipoReporte
    };
    
    setReportesGenerados([nuevoReporte, ...reportesGenerados]);
    alert(`📄 Reporte "${nuevoReporte.nombre}" generado exitosamente!`);
  };

  // Simular gráfico de barras con CSS
  const BarChart = ({ data }) => {
    const maxVentas = Math.max(...data.map(d => d.ventas));
    
    return (
      <div className="bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-container">
            <div 
              className="bar" 
              style={{ 
                height: `${(item.ventas / maxVentas) * 100}%`,
                backgroundColor: `hsl(${index * 60}, 70%, 60%)`
              }}
            ></div>
            <div className="bar-label">{item.mes}</div>
            <div className="bar-value">${item.ventas.toLocaleString()}</div>
          </div>
        ))}
      </div>
    );
  };

  // Simular gráfico de pastel
  const PieChart = ({ data }) => {
    return (
      <div className="pie-chart">
        {data.map((item, index) => {
          const percentage = item.ventas;
          const deg = (percentage / 100) * 360;
          
          return (
            <div 
              key={index}
              className="pie-slice"
              style={{
                backgroundColor: item.color,
                transform: `rotate(${index === 0 ? 0 : data.slice(0, index).reduce((sum, d) => sum + d.ventas, 0) * 3.6}deg)`,
                clipPath: `inset(0 0 0 50%) polygon(0 0, 100% 0, 100% 100%, 0 100%, 50% 50%)`,
                width: `${percentage}%`
              }}
            >
              <span className="slice-label">{item.nombre} ({percentage}%)</span>
            </div>
          );
        })}
        <div className="pie-center"></div>
      </div>
    );
  };

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <h2>📊 Reportes y Análisis</h2>
        <div className="periodo-selector">
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="1mes">Último mes</option>
            <option value="3meses">Últimos 3 meses</option>
            <option value="6meses">Últimos 6 meses</option>
            <option value="1ano">Último año</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-container">
        <div className="kpi-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <h3>Ventas Totales</h3>
            <p className="kpi-value">${ventasTotales.toLocaleString()}</p>
            <span className={`kpi-trend ${crecimiento > 0 ? 'positive' : 'negative'}`}>
              {crecimiento > 0 ? '📈' : '📉'} {Math.abs(crecimiento).toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon">📦</div>
          <div className="kpi-content">
            <h3>Ventas Promedio</h3>
            <p className="kpi-value">${promedioMensual.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <span className="kpi-subtext">por mes</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <h3>Transacciones</h3>
            <p className="kpi-value">{datosVentas.reduce((sum, mes) => sum + mes.cantidad, 0).toLocaleString()}</p>
            <span className="kpi-subtext">ventas registradas</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon">🎯</div>
          <div className="kpi-content">
            <h3>Ticket Promedio</h3>
            <p className="kpi-value">${(ventasTotales / datosVentas.reduce((sum, mes) => sum + mes.cantidad, 0)).toFixed(2)}</p>
            <span className="kpi-subtext">por transacción</span>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="graficos-grid">
        <div className="grafico-card">
          <h3>📈 Ventas Mensuales</h3>
          <BarChart data={datosVentas} />
          <div className="grafico-leyenda">
            <span>Enero</span>
            <span>Febrero</span>
            <span>Marzo</span>
            <span>Abril</span>
            <span>Mayo</span>
            <span>Junio</span>
          </div>
        </div>
        
        <div className="grafico-card">
          <h3>🥧 Distribución por Categoría</h3>
          <div className="pie-container">
            <PieChart data={categorias} />
            <div className="pie-leyenda">
              {categorias.map((cat, index) => (
                <div key={index} className="leyenda-item">
                  <span className="leyenda-color" style={{backgroundColor: cat.color}}></span>
                  <span>{cat.nombre}</span>
                  <span>{cat.ventas}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de productos más vendidos */}
      <div className="tabla-reporte">
        <h3>🏆 Productos Más Vendidos</h3>
        <table className="top-productos-table">
          <thead>
            <tr>
              <th>Posición</th>
              <th>Producto</th>
              <th>Cantidad Vendida</th>
              <th>Monto Total</th>
              <th>Participación</th>
            </tr>
          </thead>
          <tbody>
            {topProductos.map((producto, index) => (
              <tr key={index}>
                <td>
                  <span className={`rank rank-${index + 1}`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                </td>
                <td className="producto-cell">{producto.nombre}</td>
                <td>{producto.ventas.toLocaleString()} unidades</td>
                <td className="monto">${producto.monto.toLocaleString()}</td>
                <td>
                  <div className="participacion-bar">
                    <div 
                      className="bar-fill"
                      style={{ width: `${(producto.ventas / topProductos[0].ventas) * 100}%` }}
                    ></div>
                    <span className="porcentaje">
                      {((producto.ventas / topProductos.reduce((sum, p) => sum + p.ventas, 0)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generador de reportes */}
      <div className="generador-reportes">
        <h3>🔄 Generar Nuevo Reporte</h3>
        <div className="generador-form">
          <div className="form-group">
            <label>Tipo de Reporte:</label>
            <select value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)}>
              <option value="ventas">Reporte de Ventas</option>
              <option value="inventario">Reporte de Inventario</option>
              <option value="proveedores">Reporte de Proveedores</option>
              <option value="clientes">Reporte de Clientes</option>
              <option value="financiero">Reporte Financiero</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Formato:</label>
            <select>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
              <option value="html">HTML</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Periodo:</label>
            <select>
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
              <option value="trimestre">Este trimestre</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          
          <button onClick={generarReporte} className="btn-generar">
            🚀 Generar Reporte
          </button>
        </div>
      </div>

      {/* Reportes generados */}
      <div className="reportes-guardados">
        <h3>📁 Reportes Generados</h3>
        <div className="reportes-lista">
          {reportesGenerados.map(reporte => (
            <div key={reporte.id} className="reporte-item">
              <div className="reporte-info">
                <h4>{reporte.nombre}</h4>
                <div className="reporte-meta">
                  <span className="reporte-tipo">{reporte.tipo}</span>
                  <span className="reporte-fecha">Generado: {reporte.fecha}</span>
                </div>
              </div>
              <div className="reporte-acciones">
                <button className="btn-descargar" onClick={() => alert(`Descargando ${reporte.nombre}`)}>
                  📥 Descargar
                </button>
                <button className="btn-eliminar" onClick={() => setReportesGenerados(reportesGenerados.filter(r => r.id !== reporte.id))}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exportar datos */}
      <div className="exportar-container">
        <h3>💾 Exportar Datos</h3>
        <div className="exportar-opciones">
          <button className="btn-exportar" onClick={() => alert('Exportando a Excel...')}>
            📊 Exportar a Excel
          </button>
          <button className="btn-exportar" onClick={() => alert('Exportando a PDF...')}>
            📄 Exportar a PDF
          </button>
          <button className="btn-exportar" onClick={() => alert('Enviando por email...')}>
            📧 Enviar por Email
          </button>
          <button className="btn-exportar" onClick={() => window.print()}>
            🖨️ Imprimir Reporte
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reportes;