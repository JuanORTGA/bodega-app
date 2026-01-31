import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FaUpload, FaSave } from 'react-icons/fa';

export default function ProductForm({ onSuccess }) {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_usd: '',
    categoria_id: '',
    stock: ''
  });

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    const { data } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre');
    setCategorias(data || []);
    
    // Seleccionar primera categoría por defecto
    if (data && data.length > 0) {
      setFormData(prev => ({ ...prev, categoria_id: data[0].id }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `productos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imagen_url = '';
      
      // Subir imagen si existe
      if (imageFile) {
        imagen_url = await uploadImage();
      }

      // Insertar producto
      const { error } = await supabase
        .from('productos')
        .insert([{
          ...formData,
          precio_usd: parseFloat(formData.precio_usd),
          stock: parseInt(formData.stock),
          imagen_url
        }]);

      if (error) throw error;

      // Limpiar formulario
      setFormData({
        nombre: '',
        descripcion: '',
        precio_usd: '',
        categoria_id: categorias[0]?.id || '',
        stock: ''
      });
      setImageFile(null);
      setPreviewUrl('');

      if (onSuccess) onSuccess();
      
      alert('Producto agregado exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Agregar Nuevo Producto</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo de imagen */}
        <div>
          <label className="block text-sm font-medium mb-2">Imagen del Producto</label>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 text-center">
                  <FaUpload className="mx-auto text-2xl mb-2" />
                  <span className="text-xs">Subir imagen</span>
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF hasta 5MB</p>
            </div>
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium mb-2">Nombre del Producto</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Arroz Mary"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe el producto..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Precio USD */}
          <div>
            <label className="block text-sm font-medium mb-2">Precio (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-3">$</span>
              <input
                type="number"
                name="precio_usd"
                value={formData.precio_usd}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full pl-8 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium mb-2">Stock Disponible</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium mb-2">Categoría</label>
          <select
            name="categoria_id"
            value={formData.categoria_id}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.icono} {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Botón de enviar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            'Guardando...'
          ) : (
            <>
              <FaSave className="mr-2" />
              Guardar Producto
            </>
          )}
        </button>
      </form>
    </div>
  );
}