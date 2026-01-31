import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabaseClient';

export default function Products() {
  const [productos, setProductos] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchTerm, productos]);

  const fetchData = async () => {
    try {
      const { data: productosData } = await supabase
        .from('productos')
        .select(`
          *,
          categorias (*)
        `)
        .order('nombre');

      const { data: categoriasData } = await supabase
        .from('categorias')
        .select('*');

      const { data: tasaData } = await supabase
        .from('tasa_cambio')
        .select('tasa_usd')
        .order('fecha_actualizacion', { ascending: false })
        .limit(1)
        .single();

      const tasa = tasaData?.tasa_usd || 36.50;

      const productosConPrecioLocal = productosData.map(producto => ({
        ...producto,
        precio_local: producto.precio_usd * tasa
      }));

      setProductos(productosConPrecioLocal);
      setFilteredProducts(productosConPrecioLocal);
      setCategorias(categoriasData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...productos];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categoria_id === parseInt(selectedCategory));
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  if (loading) {
    return <div className="text-center py-12">Cargando productos...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Todos los Productos</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Buscador */}
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Filtro por categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icono} {cat.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-blue-600">{productos.length}</p>
          <p className="text-gray-600">Productos totales</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-green-600">
            {productos.filter(p => p.stock > 0).length}
          </p>
          <p className="text-gray-600">Disponibles</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-red-600">
            {productos.filter(p => p.stock === 0).length}
          </p>
          <p className="text-gray-600">Agotados</p>
        </div>
      </div>

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-500">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(producto => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}