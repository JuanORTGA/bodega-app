import ProductForm from '../components/ProductForm';
import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AddProduct() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Agregar Nuevo Producto</h1>
        <p className="text-gray-600">Completa el formulario para agregar un producto al inventario</p>
      </div>
      <ProductForm />
    </div>
  );
}

function AddProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('edit');
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria_id: '',
    stock: '',
    imagen: null,
    imagen_url: ''
  });

  useEffect(() => {
    loadCategories();
    
    // Si hay un ID en la URL, cargar el producto para editar
    if (editId) {
      loadProductForEdit(editId);
    }
  }, [editId]);

  const loadCategories = async () => {
    try {
      const data = await supabaseService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const loadProductForEdit = async (id) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Llenar el formulario con los datos del producto
      setFormData({
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        precio: data.precio?.toString() || '',
        categoria_id: data.categoria_id?.toString() || '',
        stock: data.stock?.toString() || '',
        imagen: null,
        imagen_url: data.imagen_url || ''
      });
      
      setIsEditing(true);
    } catch (error) {
      console.error('Error cargando producto:', error);
      alert('Error al cargar el producto para editar');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB.');
        return;
      }
      
      // Validar tipo
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Formato no válido. Usa JPG, PNG o WEBP.');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        imagen: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar objeto del producto
      const producto = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        categoria_id: parseInt(formData.categoria_id),
        stock: parseInt(formData.stock)
      };

      if (isEditing) {
        // Actualizar producto existente
        const { error } = await supabase
          .from('productos')
          .update(producto)
          .eq('id', editId);
        
        if (error) throw error;
        
        // Si hay nueva imagen, subirla
        if (formData.imagen) {
          const imageUrl = await supabaseService.uploadImage(formData.imagen, editId);
          await supabase
            .from('productos')
            .update({ imagen_url: imageUrl })
            .eq('id', editId);
        }
        
        alert('✅ Producto actualizado exitosamente!');
      } else {
        // Crear nuevo producto
        const [newProduct] = await supabaseService.addProduct(producto);

        // Si hay imagen, subirla
        if (formData.imagen && newProduct.id) {
          const imageUrl = await supabaseService.uploadImage(formData.imagen, newProduct.id);
          await supabase
            .from('productos')
            .update({ imagen_url: imageUrl })
            .eq('id', newProduct.id);
        }
        
        alert('✅ Producto agregado exitosamente!');
      }
      
      navigate('/admin/inventory');
      
    } catch (error) {
      console.error('Error:', error);
      alert(`❌ Error al ${isEditing ? 'actualizar' : 'agregar'} producto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditing ? '✏️ Editar Producto' : '➕ Agregar Nuevo Producto'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Modifica la información del producto existente' : 'Registra un nuevo producto en el inventario'}
          </p>
        </div>
        
        <button
          onClick={() => navigate('/admin/inventory')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          ← Volver al Inventario
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6">
        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Ej: Arroz, Leche, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Describe el producto, marca, características..."
            />
          </div>

          {/* Precio y stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-10 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Disponible *
              </label>
              <input
                type="number"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Cantidad disponible"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio en VES
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">Bs.</span>
                <input
                  type="text"
                  readOnly
                  value={formData.precio ? (parseFloat(formData.precio) * 35).toFixed(2) : '0.00'}
                  className="w-full border border-gray-300 rounded-lg px-10 py-3 bg-gray-50"
                  placeholder="Calculado automáticamente"
                />
                <span className="absolute right-3 top-3 text-gray-500 text-sm">VES</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Basado en tasa actual</p>
            </div>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del Producto
            </label>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="fileInput"
                  />
                  <label htmlFor="fileInput" className="cursor-pointer">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-700 font-medium">
                      {formData.imagen ? formData.imagen.name : 'Haz clic para subir una imagen'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      JPG, PNG o WEBP. Máximo 5MB.
                    </p>
                    <button
                      type="button"
                      className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                      Seleccionar Archivo
                    </button>
                  </label>
                </div>
              </div>
              
              {formData.imagen_url && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-2">Imagen actual:</p>
                  <div className="border rounded-lg p-4">
                    <img
                      src={formData.imagen_url}
                      alt="Producto actual"
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-sm text-gray-500 text-center mt-2">Imagen actual del producto</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/inventory')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Actualizando...' : 'Guardando...'}
                  </>
                ) : (
                  <>
                    <span className="mr-2">{isEditing ? '💾' : '➕'}</span>
                    {isEditing ? 'Actualizar Producto' : 'Agregar Producto'}
                  </>
                )}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de volver al inventario? Los cambios no guardados se perderán.')) {
                      navigate('/admin/inventory');
                    }
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Descartar Cambios
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

