import React from 'react';
import { DataProvider, useData } from './context/DataContext';
import Dashboard from './components/Dashboard';
import Inventario from './components/Inventario';
import VentasDetalle from './components/VentasDetalle';
import PedidosDetalle from './components/EncargosDetalle';
import Reportes from './components/Reportes';
import Proveedores from './components/Proveedores';
import './App.css';

const AppContent = () => {
  const { selectedSection, setSelectedSection } = useData();
  
  const renderContent = () => {
    switch(selectedSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventario':
        return <Inventario />;
      case 'ventas':
        return <VentasDetalle />;
      case 'pedidos':
        return <PedidosDetalle />;
      case 'proveedores':
        return <Proveedores />;
      case 'reportes':
        return <Reportes />;
      default:
        return <Dashboard />;
    }
  };
  
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-Center">
          <h1 className="title">🏪 Sistema de Administrador de Bodega</h1>
          <div className="subtitle">Gestión Integral de Inventario y Ventas</div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">👤 Roger Montero</span>
            <span className="user-role">Administrador</span>
          </div>
          <div className="header-date">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </header>
      
      {/* Navegación */}
      <nav className="navigation">
        <button 
          className={`nav-btn ${selectedSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => setSelectedSection('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`nav-btn ${selectedSection === 'inventario' ? 'active' : ''}`}
          onClick={() => setSelectedSection('inventario')}
        >
          📦 Inventario
        </button>
        <button 
          className={`nav-btn ${selectedSection === 'ventas' ? 'active' : ''}`}
          onClick={() => setSelectedSection('ventas')}
        >
          💰 Ventas
        </button>
        <button 
          className={`nav-btn ${selectedSection === 'pedidos' ? 'active' : ''}`}
          onClick={() => setSelectedSection('pedidos')}
        >
          📋 Encargos
        </button>
        <button 
          className={`nav-btn ${selectedSection === 'proveedores' ? 'active' : ''}`}
          onClick={() => setSelectedSection('proveedores')}
        >
          🚚 Proveedores
        </button>
        <button 
          className={`nav-btn ${selectedSection === 'reportes' ? 'active' : ''}`}
          onClick={() => setSelectedSection('reportes')}
        >
          📈 Reportes
        </button>
      </nav>
      
      {/* Contenido Principal */}
      <main className="main-content">
        {renderContent()}
      </main>
      
      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <p>© 2026 Sistema de Bodega - Versión 2.0</p>
            <div className="system-info">
              <span>Última actualización: Hoy {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <div className="footer-right">
            <div className="footer-stats">
              <span>Productos activos: 150</span>
              <span>Ventas hoy: $2,540</span>
              <span>Encargos pendientes: 12</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}


export default App;