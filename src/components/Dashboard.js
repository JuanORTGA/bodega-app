import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import './Dashboard.css';

const Dashboard = () => {
  const { getDashboardStats, setSelectedSection, setSelectedView, encargos, products } = useData();
  const stats = getDashboardStats();
  
  // Estado para la tasa del dólar BCV
  const [exchangeRate, setExchangeRate] = useState({
    rate: 363.66, // Valor inicial
    lastUpdated: new Date().toLocaleDateString('es-ES'),
    change: '+0.15',
    changePercent: '+0.41%'
  });
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  
  // Asegurarnos de que los arrays existan antes de usar .slice()
  const pendingOrdersList = stats.pendingOrdersList || [];
  const lowStockProductsList = stats.lowStockProductsList || [];
  const todaySalesList = stats.todaySalesList || [];
  
  // Función para obtener la tasa del dólar BCV (simulada - en producción usarías una API real)
  const fetchExchangeRate = async () => {
    setIsLoadingRate(true);
    try {
      // En un entorno real, aquí harías una petición a una API como:
      // const response = await fetch('https://api.bcv.org.ve/api/v1/tasas');
      // const data = await response.json();
      
      // Simulación de datos de la API
      setTimeout(() => {
        // Simulamos una variación aleatoria del tipo de cambio
        const baseRate = 36.50;
        const randomChange = (Math.random() * 0.3 - 0.15).toFixed(2);
        const newRate = (parseFloat(baseRate) + parseFloat(randomChange)).toFixed(2);
        
        setExchangeRate({
          rate: parseFloat(newRate),
          lastUpdated: new Date().toLocaleDateString('es-ES'),
          change: parseFloat(randomChange) >= 0 ? `+${Math.abs(randomChange).toFixed(2)}` : `-${Math.abs(randomChange).toFixed(2)}`,
          changePercent: parseFloat(randomChange) >= 0 ? `+${(Math.abs(randomChange)/baseRate*100).toFixed(2)}%` : `-${(Math.abs(randomChange)/baseRate*100).toFixed(2)}%`
        });
        setIsLoadingRate(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      setIsLoadingRate(false);
    }
  };
  
  // Efecto para cargar la tasa al montar el componente y cada hora
  useEffect(() => {
    fetchExchangeRate();
    
    // Actualizar cada hora (3600000 ms)
    const intervalId = setInterval(fetchExchangeRate, 3600000);
    
    // También actualizar a medianoche para el nuevo día
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeToMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimeout = setTimeout(() => {
      fetchExchangeRate();
      // Configurar intervalo diario después de la primera medianoche
      setInterval(fetchExchangeRate, 86400000);
    }, timeToMidnight);
    
    return () => {
      clearInterval(intervalId);
      clearTimeout(midnightTimeout);
    };
  }, []);
  
  const handleProductClick = () => {
    setSelectedSection('inventario');
    setSelectedView('inventario');
  };
  
  const handleSalesClick = () => {
    setSelectedSection('ventas');
    setSelectedView('ventas');
  };
  
  const handleOrdersClick = () => {
    setSelectedSection('encargos'); 
    setSelectedView('encargos');
  };
  
  const handleLowStockClick = () => {
    setSelectedSection('inventario');
    setSelectedView('inventario');
  };
  
  // Función para obtener productos con bajo stock (stock < 10)
  const getLowStockProducts = () => {
    return products
      .filter(p => p.stock < 10)
      .slice(0, 3)
      .map(product => ({
        id: product.id,
        name: product.nombre,
        quantity: product.stock,
        minStock: 10
      }));
  };
  
  // Función para obtener encargos pendientes
  const getPendingEncargos = () => {
    return encargos
      .filter(e => e.estado === 'Pendiente')
      .slice(0, 2)
      .map(encargo => ({
        id: encargo.id,
        supplier: encargo.proveedor, 
        total: encargo.total
      }));
  };

  // Función para obtener las ventas recientes (últimas 5)
  const getRecentSales = () => {
    return todaySalesList.slice(0, 5).map(sale => ({
      id: sale.id,
      client: sale.client || 'Cliente',
      product: sale.product || 'Producto',
      quantity: sale.quantity || 1,
      total: sale.total || 0,
      time: sale.time || 'Reciente'
    }));
  };

  // Calcular si hay datos para mostrar
  const hasLowStockProducts = getLowStockProducts().length > 0;
  const hasPendingEncargos = getPendingEncargos().length > 0;
  const hasRecentSales = todaySalesList.length > 0;
  const hasRecentActivity = getRecentSales().length > 0;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-top">
          <h1>Sistema de Administrador de Bodega</h1>
          <div className="header-right-info">
            <span className="current-date">{new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
            <span className="weather">☀️ 21°C - Mayormente soleado</span>
          </div>
        </div>
        <p className="subtitle">Gestión Integral de Inventario y Ventas</p>
      </header>
      
      <div className="welcome-section">
        <h2>¡Bienvenido al sistema de gestión de bodega!</h2>
        <p>Aquí puedes monitorear todas las actividades de tu negocio en tiempo real</p>
      </div>
      
      {/* CUADRO DE TASA BCV INTEGRADO EN ESTADÍSTICAS PRINCIPALES */}
      <div className="main-stats-section">
        <div className="stats-grid">
          <div className="stat-card" onClick={handleProductClick}>
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>PRODUCTOS EN STOCK</h3>
              <p className="stat-number">{stats.totalProducts || 0}</p>
              <p className="stat-subtext">Valor total: ${stats.totalStockValue ? stats.totalStockValue.toFixed(2) : '0.00'}</p>
            </div>
            <div className="stat-action">Ver inventario →</div>
          </div>
          
          <div className="stat-card sales-card" onClick={handleSalesClick}>
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>VENTAS HOY</h3>
              <p className="stat-number">${stats.salesTodayTotal ? stats.salesTodayTotal.toFixed(2) : '0.00'}</p>
              <p className="stat-subtext">{stats.salesToday || 0} transacciones realizadas</p>
            </div>
            <div className="stat-action">Ver ventas →</div>
          </div>
          
          <div className="stat-card orders-card" onClick={handleOrdersClick}>
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>ENCARGOS PENDIENTES</h3>
              <p className="stat-number">{stats.pendingOrders || 0}</p>
              <p className="stat-subtext">Por recibir</p>
            </div>
            <div className="stat-action">Ver encargos →</div>
          </div>
          
          {/* CUADRO DE TASA BCV COMO CUARTA TARJETA */}
          <div className="stat-card bcv-card">
            <div className="bcv-header">
              <div className="stat-icon">🇻🇪</div>
              <div className="stat-content">
                <h3>TASA BCV</h3>
                <div className="bcv-rate-display">
                  <span className="bcv-currency">USD</span>
                  <span className="bcv-rate">Bs. {exchangeRate.rate.toFixed(2)}</span>
                </div>
                <div className="bcv-change">
                  <span className={`change-indicator ${exchangeRate.change.startsWith('+') ? 'positive' : 'negative'}`}>
                    {exchangeRate.change.startsWith('+') ? '▲' : '▼'} {exchangeRate.change} ({exchangeRate.changePercent})
                  </span>
                </div>
              </div>
              <button 
                className="refresh-rate-btn" 
                onClick={fetchExchangeRate}
                disabled={isLoadingRate}
                title="Actualizar tasa"
              >
                {isLoadingRate ? '🔄' : '↻'}
              </button>
            </div>
            <div className="bcv-footer">
              <p className="stat-subtext">Actualizado: {exchangeRate.lastUpdated}</p>
              <p className="stat-action" onClick={fetchExchangeRate}>Actualizar ahora</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CONTENIDO PRINCIPAL REORGANIZADO */}
      <div className="dashboard-main-content">
        
        {/* LADO IZQUIERDO: Estadísticas secundarias y alertas */}
        <div className="dashboard-left-panel">
          
          {/* Estadísticas secundarias compactas */}
          <div className="secondary-stats-compact">
            <div className="secondary-stat" onClick={() => setSelectedSection('ventas')}>
              <div className="secondary-icon">📈</div>
              <div className="secondary-stat-content">
                <h4>Ventas Semana</h4>
                <p className="secondary-value">${stats.weeklyTotal ? stats.weeklyTotal.toFixed(2) : '0.00'}</p>
                <small>{stats.weeklySales || 0} ventas</small>
              </div>
            </div>
            
            <div className="secondary-stat" onClick={() => setSelectedSection('ventas')}>
              <div className="secondary-icon">📅</div>
              <div className="secondary-stat-content">
                <h4>Ventas Mes</h4>
                <p className="secondary-value">${stats.monthlyTotal ? stats.monthlyTotal.toFixed(2) : '0.00'}</p>
                <small>{stats.monthlySales || 0} ventas</small>
              </div>
            </div>
            
            <div className="secondary-stat warning-stat" onClick={handleLowStockClick}>
              <div className="secondary-icon warning">⚠️</div>
              <div className="secondary-stat-content">
                <h4>Bajo Stock</h4>
                <p className="secondary-value warning">{stats.lowStockProducts || 0}</p>
                <small>Necesitan reabastecimiento</small>
              </div>
            </div>
          </div>
          
          {/* Alertas importantes - Solo si hay datos */}
          {hasLowStockProducts || hasPendingEncargos || hasRecentSales ? (
            <div className="alerts-section compact">
              <h3>🔔 Alertas y Notificaciones</h3>
              <div className="alerts-grid">
                {hasLowStockProducts ? (
                  getLowStockProducts().map(product => (
                    <div key={product.id} className="alert-item">
                      <span className="alert-icon">⚠️</span>
                      <div>
                        <p className="alert-title">{product.name}</p>
                        <p className="alert-detail">Stock: {product.quantity} | Mínimo: {product.minStock}</p>
                      </div>
                    </div>
                  ))
                ) : null}
                
                {hasRecentSales ? (
                  todaySalesList.slice(0, 2).map(sale => (
                    <div key={sale.id} className="alert-item success">
                      <span className="alert-icon">💰</span>
                      <div>
                        <p className="alert-title">Venta registrada</p>
                        <p className="alert-detail">{sale.product} - ${sale.total}</p>
                      </div>
                    </div>
                  ))
                ) : null}
                
                {hasPendingEncargos ? (
                  getPendingEncargos().map(order => (
                    <div key={order.id} className="alert-item info">
                      <span className="alert-icon">📦</span>
                      <div>
                        <p className="alert-title">Encargo #{order.id}</p>
                        <p className="alert-detail">{order.supplier} - ${order.total ? order.total.toFixed(2) : '0.00'}</p>
                      </div>
                    </div>
                  ))
                ) : null}
                
                {/* Mensaje si no hay alertas */}
                {!hasLowStockProducts && !hasPendingEncargos && !hasRecentSales && (
                  <div className="alert-item neutral">
                    <span className="alert-icon">✅</span>
                    <div>
                      <p className="alert-title">Todo en orden</p>
                      <p className="alert-detail">No hay alertas pendientes</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
          
        </div>
        
        {/* LADO DERECHO: Actividad reciente */}
        <div className="dashboard-right-panel">
          <div className="recent-activity compact">
            <div className="recent-activity-header">
              <h3>🕐 Actividad Reciente</h3>
              {hasRecentActivity && (
                <span className="activity-count">{todaySalesList.length} actividades</span>
              )}
            </div>
            
            <div className="activity-list">
              {hasRecentActivity ? (
                getRecentSales().map(sale => (
                  <div key={sale.id} className="activity-item" onClick={handleSalesClick}>
                    <span className="activity-icon">💰</span>
                    <div className="activity-content">
                      <p className="activity-title">Venta registrada a {sale.client}</p>
                      <p className="activity-detail">{sale.product} x {sale.quantity} = ${sale.total}</p>
                      <p className="activity-time">{sale.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="activity-item empty">
                  <span className="activity-icon">📊</span>
                  <div className="activity-content">
                    <p className="activity-title">No hay actividad reciente</p>
                    <p className="activity-detail">Las ventas realizadas aparecerán aquí</p>
                    <button 
                      className="activity-suggest-button"
                      onClick={handleSalesClick}
                    >
                      Ver módulo de ventas
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {hasRecentActivity && todaySalesList.length > 5 && (
              <div className="activity-footer" onClick={handleSalesClick}>
                <span className="activity-more">Ver todas las actividades ({todaySalesList.length}) →</span>
              </div>
            )}
          </div>
        </div>
        
      </div>
      
      {/* RÁPIDO ACCESO A MÓDULOS */}
      <div className="quick-access">
        <h3>⚡ Acceso Rápido</h3>
        <div className="quick-access-grid">
          <div className="quick-access-item" onClick={handleProductClick}>
            <span className="quick-access-icon">📦</span>
            <div>
              <h4>Gestión de Inventario</h4>
              <p>Agregar, editar y consultar productos</p>
            </div>
          </div>
          
          <div className="quick-access-item" onClick={handleSalesClick}>
            <span className="quick-access-icon">💰</span>
            <div>
              <h4>Registrar Venta</h4>
              <p>Crear nueva factura o venta</p>
            </div>
          </div>
          
          <div className="quick-access-item" onClick={handleOrdersClick}>
            <span className="quick-access-icon">📋</span>
            <div>
              <h4>Encargos</h4>
              <p>Gestionar pedidos pendientes</p>
            </div>
          </div>
          
          <div className="quick-access-item" onClick={() => {
            setSelectedSection('inventario');
            setSelectedView('inventario');
          }}>
            <span className="quick-access-icon">📊</span>
            <div>
              <h4>Reportes</h4>
              <p>Ver estadísticas y análisis</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;