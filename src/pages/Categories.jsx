import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

export default function Categories() {
  const [categorias, setCategorias] = useState([]);
  const [newCategory, setNewCategory] = useState({ nombre: '', descripcion: '', icono: '📦', color: '#3B82F6' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre');
    setCategorias(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Actualizar categoría existente
      const { error } = await supabase
        .from('categorias')
        .update(newCategory)
        .eq('id', editingId);
      
      if (!error) {
        setEditingId(null);
      }
    } else {
      // Crear nueva categoría
      const { error } = await supabase
        .from('categorias')
        .insert([newCategory]);
      
      if (error) {
        console.error('Error:', error);
        return;
      }
    }
    
    // Resetear formulario y refrescar
    setNewCategory({ nombre: '', descripcion: '', icono: '📦', color: '#3B82F6' });
    fetchCategories();
  };

  const handleEdit = (categoria) => {
    setEditingId(categoria.id);
    setNewCategory({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      icono: categoria.icono,
      color: categoria.color
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);
      
      if (!error) {
        fetchCategories();
      }
    }
  };

  const iconos = ['🍕', '🥤', '🍬', '🥓', '🍷', '🏠', '📦', '🍎', '🥫', '🥖', '🍫', '🥛'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
            <h2 className="text-xl font-bold mb-6">
              {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  value={newCategory.nombre}
                  onChange={(e) => setNewCategory({...newCategory, nombre: e.target.value})}
                  required
                  className="w-full p-2 border rounded"
                  placeholder="Ej: Comida"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={newCategory.descripcion}
                  onChange={(e) => setNewCategory({...newCategory, descripcion: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Descripción opcional"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Icono</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {iconos.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewCategory({...newCategory, icono: icon})}
                      className={`text-2xl p-2 rounded ${newCategory.icono === icon ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newCategory.icono}
                  onChange={(e) => setNewCategory({...newCategory, icono: e.target.value})}
                  className="w-full p-2 border rounded text-center text-2xl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                  className="w-full h-10"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center"
              >
                <FaPlus className="mr-2" />
                {editingId ? 'Actualizar' : 'Crear'} Categoría
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setNewCategory({ nombre: '', descripcion: '', icono: '📦', color: '#3B82F6' });
                  }}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
                >
                  Cancelar Edición
                </button>
              )}
            </form>
          </div>
        </div>
        
        {/* Lista de categorías */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Categorías Existentes</h2>
          
          {categorias.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No hay categorías aún</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorias.map(categoria => (
                <div
                  key={categoria.id}
                  className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
                  style={{ borderLeft: `5px solid ${categoria.color}` }}
                >
                  <div className="flex items-center">
                    <span className="text-3xl mr-4">{categoria.icono}</span>
                    <div>
                      <h3 className="font-semibold">{categoria.nombre}</h3>
                      {categoria.descripcion && (
                        <p className="text-sm text-gray-600">{categoria.descripcion}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(categoria)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(categoria.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}