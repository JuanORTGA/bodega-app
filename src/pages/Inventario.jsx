import React, { useEffect, useState } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: '',
    precio: '',
    stock: '',
    categoria_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        supabaseService.getProducts(),
        supabaseService.getCategories()
      ]);
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.categoria_id === parseInt(selectedCategory)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('productos')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
      
      // Actualizar lista localmente
      setProducts(products.filter(p => p.id !== id));
      alert('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('Error al eliminar producto');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product.id);
    setEditForm({
      nombre: product.nombre,
      precio: product.precio,
      stock: product.stock,
      categoria_id: product.categoria_id
    });
  };

  const handleUpdate = async (id) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({
          nombre: editForm.nombre,
          precio: parseFloat(editForm.precio),
          stock: parseInt(editForm.stock),
          categoria_id: parseInt(editForm.categoria_id)
        })
        .eq('id', id);

      if (error) throw error;

      // Actualizar lista localmente
      const updatedProducts = products.map(p =>
        p.id === id ? { ...p, ...editForm } : p
      );
      
      setProducts(updatedProducts);
      setEditingProduct(null);
      alert('Producto actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando producto:', error);
      alert('Error al actualizar producto');
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre', 'Descripción', 'Precio USD', 'Precio VES', 'Categoría', 'Stock'];
    const csvData = filteredProducts.map(p => [
      p.id,
      `"${p.nombre}"`,
      `"${p.descripcion || ''}"`,
      p.precio,
      p.precio_ves?.toFixed(2) || '',
      p.categorias?.nombre,
      p.stock
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('inventory-table').outerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Inventario</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Inventario</h1>
          <p>Fecha: ${new Date().toLocaleDateString()}</p>
        </div>
        ${printContent}
        <div class="footer">
          <p>Total de productos: ${filteredProducts.length}</p>
          <p>Valor total inventario: $${filteredProducts.reduce((sum, p) => sum + (p.precio * p.stock), 0).toFixed(2)} USD</p>
        </div>
      </body>
      </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleExportPDF = () => {
    alert('Función de exportación a PDF en desarrollo. Por ahora usa la opción de Imprimir y selecciona "Guardar como PDF" en el diálogo de impresión.');
  };

  return (
    <div>
      {/* Encabezado con controles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
          <p className="text-gray-600">Gestión completa de productos en bodega</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/add-product"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition duration-300"
          >
            <span className="mr-2">+</span> Agregar Producto
          </Link>
          
          <button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition duration-300"
          >
            <span className="mr-2">📥</span> Exportar CSV
          </button>
          
          <button
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition duration-300"
          >
            <span className="mr-2">📄</span> Exportar PDF
          </button>
          
          <button
            onClick={handlePrint}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center transition duration-300"
          >
            <span className="mr-2">🖨️</span> Imprimir
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Buscar Producto
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🏷️ Filtrar por Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition duration-300"
            >
              🗑️ Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden" id="inventory-table">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Cargando productos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio (USD/VES)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition duration-150">
                    {editingProduct === product.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.nombre}
                            onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                            className="border border-gray-300 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editForm.categoria_id}
                            onChange={(e) => setEditForm({...editForm, categoria_id: e.target.value})}
                            className="border border-gray-300 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-blue-500"
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.precio}
                            onChange={(e) => setEditForm({...editForm, precio: e.target.value})}
                            className="border border-gray-300 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editForm.stock}
                            onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                            className="border border-gray-300 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                            Editando
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdate(product.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                            >
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {product.imagen_url ? (
                              <img
                                src={product.imagen_url}
                                alt={product.nombre}
                                className="w-12 h-12 rounded-lg object-cover mr-3 border"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                                <span className="text-gray-500 text-lg">📦</span>
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900">{product.nombre}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {product.descripcion || 'Sin descripción'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {product.categorias?.nombre}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-semibold text-gray-900">${parseFloat(product.precio).toFixed(2)} USD</div>
                            <div className="text-gray-600">
                              {product.precio_ves ? `Bs. ${parseFloat(product.precio_ves).toFixed(2)} VES` : 'Calculando...'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            product.stock > 20 
                              ? 'bg-green-100 text-green-800'
                              : product.stock > 5
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              product.stock > 20 
                                ? 'bg-green-500'
                                : product.stock > 5
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}></span>
                            {product.stock} unidades
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                            product.activo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.activo ? '🟢 Activo' : '🔴 Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                              title="Editar"
                            >
                              <span className="mr-1">✏️</span> Editar
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
                              title="Eliminar"
                            >
                              <span className="mr-1">🗑️</span> Eliminar
                            </button>
                            <Link
                              to={`/admin/add-product?edit=${product.id}`}
                              className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
                              title="Ver detalles"
                            >
                              <span className="mr-1">👁️</span> Detalles
                            </Link>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📦</div>
                <p className="text-gray-500 text-lg mb-2">No se encontraron productos</p>
                <p className="text-gray-400 mb-6">Intenta cambiar los filtros de búsqueda</p>
                <Link
                  to="/admin/add-product"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  + Agregar Primer Producto
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resumen y estadísticas */}
      {!loading && filteredProducts.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Productos mostrados</p>
                <p className="text-2xl font-bold text-gray-800">{filteredProducts.length} / {products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <span className="text-green-600 text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor total inventario</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${filteredProducts.reduce((sum, p) => sum + (p.precio * p.stock), 0).toFixed(2)} USD
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <span className="text-purple-600 text-xl">⚠️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Productos con stock bajo</p>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredProducts.filter(p => p.stock < 10).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;