// src/components/Proveedores.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import './Proveedores.css';

const Proveedores = () => {
  const { suppliers, getProveedores, addProveedor, updateProveedor, deleteProveedor } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    rif: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  useEffect(() => {
    getProveedores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateProveedor(editingId, formData);
      } else {
        await addProveedor(formData);
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({
        nombre: '',
        rif: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: ''
      });
    } catch (error) {
      console.error('Error guardando proveedor:', error);
      alert('Error al guardar proveedor');
    }
  };

  const handleEdit = (proveedor) => {
    setEditingId(proveedor.id);
    setFormData({
      nombre: proveedor.nombre,
      rif: proveedor.rif || '',
      contacto: proveedor.contacto || '',
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
      direccion: proveedor.direccion || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      try {
        await deleteProveedor(id);
      } catch (error) {
        alert('Error al eliminar proveedor');
      }
    }
  };

  return (
    <div className="proveedores-container">
      <div className="header">
        <h2>🏭 Proveedores</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Nuevo Proveedor
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingId ? 'Editar' : 'Nuevo'} Proveedor</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nombre del proveedor"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="RIF (J-12345678-9)"
                value={formData.rif}
                onChange={(e) => setFormData({...formData, rif: e.target.value})}
              />
              <input
                type="text"
                placeholder="Persona de contacto"
                value={formData.contacto}
                onChange={(e) => setFormData({...formData, contacto: e.target.value})}
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <textarea
                placeholder="Dirección"
                value={formData.direccion}
                onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                rows="3"
              />
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="proveedores-grid">
        {suppliers.map(proveedor => (
          <div key={proveedor.id} className="proveedor-card">
            <h4>{proveedor.nombre}</h4>
            {proveedor.rif && <p><strong>RIF:</strong> {proveedor.rif}</p>}
            {proveedor.contacto && <p><strong>Contacto:</strong> {proveedor.contacto}</p>}
            {proveedor.telefono && <p><strong>Teléfono:</strong> {proveedor.telefono}</p>}
            {proveedor.email && <p><strong>Email:</strong> {proveedor.email}</p>}
            {proveedor.direccion && <p><strong>Dirección:</strong> {proveedor.direccion}</p>}
            
            <div className="card-actions">
              <button onClick={() => handleEdit(proveedor)} className="btn-edit">
                ✏️ Editar
              </button>
              <button onClick={() => handleDelete(proveedor.id)} className="btn-delete">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Proveedores;