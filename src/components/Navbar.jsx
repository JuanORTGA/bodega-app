import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="text-2xl font-bold">Bodega App</Link>
        <div className="space-x-4">
          <Link to="/">Inicio</Link>
          <Link to="/productos">Productos</Link>
          <Link to="/agregar">Agregar Producto</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </div>
    </nav>
  )
}