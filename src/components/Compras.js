import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import './Compras.css';

const Compras = () => {
  const { 
    products, 
    suppliers, 
    loading, 
    addCompra,
    convertToVES 
  } = useData();
  
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [detallesCompra, setDetallesCompra] = useState([]);
  const [nuevoDetalle, setNuevoDetalle] = useState({
    producto_id: '',
    cantidad: 1,
    precio_unitario: 0
  });
  const [factura, setFactura] = useState('');
  
  // Agregar producto a la compra
  const agregarDetalle = () => {
    if (!nuevoDetalle.producto_id || nuevoDetalle.cantidad <= 0) {
      alert('Seleccione un producto y cantidad válida');
      return;
    }
    
    const producto = products.find(p => p.id === nuevoDetalle.producto_id);
    const subtotal = nuevoDetalle.cantidad * nuevoDetalle.precio_unitario;
    
    setDetallesCompra([
      ...detallesCompra,
      {
        ...nuevoDetalle,
        producto_nombre: producto.nombre,
        subtotal: subtotal
      }
    ]);
    
    setNuevoDetalle({
      producto_id: '',
      cantidad: 1,
      precio_unitario: 0
    });
  };
  
  // Eliminar detalle
  const eliminarDetalle = (index) => {
    const nuevosDetalles = [...detallesCompra];
    nuevosDetalles.splice(index, 1);
    setDetallesCompra(nuevosDetalles);
  };
  
  // Calcular total
  const totalCompra = detallesCompra.reduce((sum, detalle) => sum + detalle.subtotal, 0);
  const totalCompraVES = convertToVES(totalCompra);
  
  // Registrar compra
  const registrarCompra = async () => {
    if (!selectedSupplier) {
      alert('Seleccione un proveedor');
      return;
    }
    
    if (detallesCompra.length === 0) {
      alert('Agregue productos a la compra');
      return;
    }
    
    try {
      const compraData = {
        proveedor_id: selectedSupplier,
        proveedor_nombre: suppliers.find(s => s.id === selectedSupplier)?.nombre || '',
        total: totalCompra,
        factura: factura
      };
      
      const detalles = detallesCompra.map(detalle => ({
        producto_id: detalle.producto_id,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario,
        subtotal: detalle.subtotal
      }));
      
      await addCompra(compraData, detalles);
      
      // Limpiar formulario
      setDetallesCompra([]);
      setSelectedSupplier('');
      setFactura('');
      
      alert('✅ Compra registrada exitosamente. Stock actualizado.');
      
    } catch (error) {
      alert('Error registrando compra: ' + error.message);
    }
  };
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  return (
    <div className="compras-container">
      <h2>🛒 Compras a Proveedores</h2>
      
      <div className="compras-form">
        {/* Selección de proveedor */}
        <div className="form-section">
          <h3>1. Seleccionar Proveedor</h3>
          <select 
            value={selectedSupplier} 
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="supplier-select"
          >
            <option value="">Seleccionar proveedor</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.nombre} - {supplier.contacto}
              </option>
            ))}
          </select>
          
          <div className="factura-input">
            <label>Número de Factura:</label>
            <input
              type="text"
              value={factura}
              onChange={(e) => setFactura(e.target.value)}
              placeholder="Número de factura"
            />
          </div>
        </div>
        
        {/* Agregar productos */}
        <div className="form-section">
          <h3>2. Agregar Productos</h3>
          <div className="detalle-form">
            <select
              value={nuevoDetalle.producto_id}
              onChange={(e) => {
                const productoId = e.target.value;
                const producto = products.find(p => p.id === productoId);
                setNuevoDetalle({
                  ...nuevoDetalle,
                  producto_id: productoId,
                  precio_unitario: producto ? producto.precio_usd : 0
                });
              }}
              className="product-select"
            >
              <option value="">Seleccionar producto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.nombre} (Stock: {product.stock})
                </option>
              ))}
            </select>
            
            <input
              type="number"
              value={nuevoDetalle.cantidad}
              onChange={(e) => setNuevoDetalle({
                ...nuevoDetalle,
                cantidad: parseInt(e.target.value) || 0
              })}
              placeholder="Cantidad"
              min="1"
            />
            
            <input
              type="number"
              value={nuevoDetalle.precio_unitario}
              onChange={(e) => setNuevoDetalle({
                ...nuevoDetalle,
                precio_unitario: parseFloat(e.target.value) || 0
              })}
              placeholder="Precio unitario (USD)"
              step="0.01"
              min="0"
            />
            
            <button onClick={agregarDetalle} className="btn-agregar">
              ➕ Agregar
            </button>
          </div>
        </div>
        
        {/* Resumen de compra */}
        <div className="form-section">
          <h3>3. Resumen de Compra</h3>
          {detallesCompra.length === 0 ? (
            <p className="no-items">No hay productos agregados</p>
          ) : (
            <div className="detalles-table">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal (USD)</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {detallesCompra.map((detalle, index) => (
                    <tr key={index}>
                      <td>{detalle.producto_nombre}</td>
                      <td>{detalle.cantidad}</td>
                      <td>${detalle.precio_unitario.toFixed(2)}</td>
                      <td>${detalle.subtotal.toFixed(2)}</td>
                      <td>
                        <button 
                          onClick={() => eliminarDetalle(index)}
                          className="btn-eliminar"
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3"><strong>Total:</strong></td>
                    <td><strong>${totalCompra.toFixed(2)} USD</strong></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan="3"><strong>Total en VES:</strong></td>
                    <td><strong>Bs. {totalCompraVES.toFixed(2)}</strong></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
        
        {/* Botón de registrar */}
        <div className="form-actions">
          <button 
            onClick={registrarCompra}
            disabled={!selectedSupplier || detallesCompra.length === 0}
            className="btn-registrar"
          >
            💰 Registrar Compra
          </button>
        </div>
      </div>
    </div>
  );
};

export default Compras;