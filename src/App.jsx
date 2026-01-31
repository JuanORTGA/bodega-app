// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventario from './components/Inventario';
import EncargosDetalle from './components/EncargosDetalle';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import Categories from './pages/Categories';

// Layout principal que incluye Sidebar y Header
const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-layout">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

// Componente para manejar la navegación por secciones (alternativa sin Router)
const AppContent = () => {
  const [selectedSection, setSelectedSection] = useState('dashboard');
  
  const renderSection = () => {
    switch (selectedSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventario':
        return <Inventario />;
      case 'encargos':
        return <EncargosDetalle />;
      case 'productos':
        return <Products />;
      case 'agregar':
        return <AddProduct />;
      case 'categorias':
        return <Categories />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Header />
      <div className="main-layout">
        <Sidebar 
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
        />
        <main className="main-content">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

// Versión con React Router
const AppWithRouter = () => {
  return (
    <DataProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            } />
            <Route path="/inventario" element={
              <MainLayout>
                <Inventario />
              </MainLayout>
            } />
            <Route path="/productos" element={
              <MainLayout>
                <Products />
              </MainLayout>
            } />
            <Route path="/agregar" element={
              <MainLayout>
                <AddProduct />
              </MainLayout>
            } />
            <Route path="/categorias" element={
              <MainLayout>
                <Categories />
              </MainLayout>
            } />
            <Route path="/encargos" element={
              <MainLayout>
                <EncargosDetalle />
              </MainLayout>
            } />
            <Route path="/ventas" element={
              <MainLayout>
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">Página de Ventas</h1>
                  <p>Esta sección está en desarrollo</p>
                </div>
              </MainLayout>
            } />
            <Route path="/proveedores" element={
              <MainLayout>
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">Página de Proveedores</h1>
                  <p>Esta sección está en desarrollo</p>
                </div>
              </MainLayout>
            } />
            <Route path="/reportes" element={
              <MainLayout>
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">Página de Reportes</h1>
                  <p>Esta sección está en desarrollo</p>
                </div>
              </MainLayout>
            } />
          </Routes>
        </div>
      </Router>
    </DataProvider>
  );
};

// Versión sin React Router (usando DataContext)
const AppWithoutRouter = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

// ELIGE UNA DE ESTAS DOS OPCIONES:
// Opción 1: Usando React Router (recomendado para una SPA completa)
// function App() {
//   return <AppWithRouter />;
// }

// Opción 2: Sin React Router (más simple, usando solo DataContext)
function App() {
  return <AppWithoutRouter />;
}

export default App;