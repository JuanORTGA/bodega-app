export default function ProductCard({ producto }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48">
        <img 
          src={producto.imagen_url || 'https://via.placeholder.com/300x200?text=Sin+Imagen'} 
          alt={producto.nombre}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
          {producto.categorias?.nombre}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{producto.nombre}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{producto.descripcion}</p>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              ${producto.precio_local.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              USD ${producto.precio_usd.toFixed(2)}
            </p>
          </div>
          
          <div className="text-center">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              producto.stock > 10 ? 'bg-green-100 text-green-800' : 
              producto.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              Stock: {producto.stock}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}