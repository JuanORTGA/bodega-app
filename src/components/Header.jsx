import { Link } from 'react-router-dom';
import { FaShoppingCart, FaBoxOpen, FaPlusCircle } from 'react-icons/fa';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <FaBoxOpen className="text-2xl" />
            <h1 className="text-2xl font-bold">Bodega Digital</h1>
          </Link>
          
          <nav className="flex space-x-6">
            <Link to="/" className="hover:text-blue-200 flex items-center space-x-1">
              <FaBoxOpen />
              <span>Inicio</span>
            </Link>
            <Link to="/productos" className="hover:text-blue-200 flex items-center space-x-1">
              <FaBoxOpen />
              <span>Productos</span>
            </Link>
            <Link to="/agregar" className="hover:text-blue-200 flex items-center space-x-1">
              <FaPlusCircle />
              <span>Agregar</span>
            </Link>
            <Link to="/categorias" className="hover:text-blue-200 flex items-center space-x-1">
              <FaShoppingCart />
              <span>Categorías</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}