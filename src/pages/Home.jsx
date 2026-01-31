import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import ExchangeRate from '../components/ExchangeRate';
import { supabase } from '../lib/supabaseClient';
import { FaFire } from 'react-icons/fa';

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Obtener productos con sus categorías
      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select(`
          *,
          categorias (*)
        `)
        .order('fecha_creacion', { ascending: false })
        .limit(8);

      // Obtener categorías
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*');

      if (productosError) throw productosError;
      if (categoriasError) throw categoriasError;

      // Calcular precio local usando tasa de cambio
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
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <h2 className="text-3xl font-bold mb-2">Bodega Digital</h2>
          <p className="text-lg">Gestiona tu inventario al cambio actual del BCV</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar con tasa y categorías */}
          <div className="lg:col-span-1 space-y-6">
            <ExchangeRate />
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">Categorías</h3>
              <div className="space-y-2">
                {categorias.map(categoria => (
                  <div 
                    key={categoria.id}
                    className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                    style={{ borderLeft: `4px solid ${categoria.color}` }}
                  >
                    <span className="text-xl mr-3">{categoria.icono}</span>
                    <span>{categoria.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Productos principales */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <FaFire className="mr-2 text-orange-500" />
                Productos Destacados
              </h2>
              <span className="text-gray-500">{productos.length} productos</span>
            </div>

            {productos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-xl text-gray-500">No hay productos aún</p>
                <p className="text-gray-400 mt-2">¡Agrega tu primer producto!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productos.map(producto => (
                  <ProductCard key={producto.id} producto={producto} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}