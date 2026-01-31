import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import './VentasDetalle.css';

const VentasDetalle = () => {
  const { 
    sales, 
    addSale, 
    products, 
    customers,
    exchangeRate,
    convertToVES,
    convertToUSD,
    updateProductStock,
    exportProductsToCSV,
    uploadImage,
    getDashboardStats
  } = useData();
  
  // Estados principales
  const [filtroPeriodo, setFiltroPeriodo] = useState('hoy');
  const [filtroVendedor, setFiltroVendedor] = useState('todos');
  const [filtroProducto, setFiltroProducto] = useState('todos');
  const [filtroCliente, setFiltroCliente] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(null);
  const [productosCarrito, setProductosCarrito] = useState([]);
  const [clienteActual, setClienteActual] = useState({
    id: '',
    nombre: '',
    telefono: '',
    email: '',
    direccion: ''
  });
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [notaVenta, setNotaVenta] = useState('');
  const [orden, setOrden] = useState('fecha_desc');
  
  // Estados para modal de confirmación
  const [modalConfirmacion, setModalConfirmacion] = useState({
    abierto: false,
    tipo: '',
    ventaId: null,
    titulo: '',
    mensaje: ''
  });
  
  // Estados para carga
  const [cargando, setCargando] = useState(false);
  
  // Vendedores disponibles
  const vendedores = [
    { id: 'maria', nombre: 'María Gómez', email: 'maria@bodega.com' },
    { id: 'pedro', nombre: 'Pedro Martínez', email: 'pedro@bodega.com' },
    { id: 'ana', nombre: 'Ana López', email: 'ana@bodega.com' },
    { id: 'carlos', nombre: 'Carlos Ramírez', email: 'carlos@bodega.com' }
  ];
  
  // Métodos de pago disponibles
  const metodosPago = [
    { id: 'efectivo', nombre: 'Efectivo', icono: '💰' },
    { id: 'tarjeta', nombre: 'Tarjeta de Crédito/Débito', icono: '💳' },
    { id: 'transferencia', nombre: 'Transferencia', icono: '🏦' },
    { id: 'pago_movil', nombre: 'Pago Móvil', icono: '📱' },
    { id: 'divisas', nombre: 'Divisas (USD)', icono: '💵' },
    { id: 'credito', nombre: 'Crédito', icono: '📝' }
  ];
  
  // Cargar ventas del día por defecto
  useEffect(() => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    setFiltroPeriodo('hoy');
  }, []);
  
  // Filtrar ventas
  const ventasFiltradas = useMemo(() => {
    let filtradas = [...sales];
    const hoy = new Date();
    
    // Filtrar por período
    switch(filtroPeriodo) {
      case 'hoy':
        const hoyStr = hoy.toISOString().split('T')[0];
        filtradas = filtradas.filter(v => {
          const fechaVenta = new Date(v.fecha_venta || v.created_at);
          return fechaVenta.toISOString().split('T')[0] === hoyStr;
        });
        break;
        
      case 'semana':
        const semanaAtras = new Date();
        semanaAtras.setDate(semanaAtras.getDate() - 7);
        filtradas = filtradas.filter(v => {
          const fechaVenta = new Date(v.fecha_venta || v.created_at);
          return fechaVenta >= semanaAtras;
        });
        break;
        
      case 'mes':
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        filtradas = filtradas.filter(v => {
          const fechaVenta = new Date(v.fecha_venta || v.created_at);
          return fechaVenta >= inicioMes;
        });
        break;
        
      case 'ayer':
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        const ayerStr = ayer.toISOString().split('T')[0];
        filtradas = filtradas.filter(v => {
          const fechaVenta = new Date(v.fecha_venta || v.created_at);
          return fechaVenta.toISOString().split('T')[0] === ayerStr;
        });
        break;
    }
    
    // Filtrar por vendedor
    if (filtroVendedor !== 'todos') {
      filtradas = filtradas.filter(v => v.vendedor === filtroVendedor);
    }
    
    // Filtrar por producto (si la venta tiene productos)
    if (filtroProducto !== 'todos') {
      filtradas = filtradas.filter(v => {
        if (Array.isArray(v.productos)) {
          return v.productos.some(p => p.producto_id === filtroProducto || p.nombre === filtroProducto);
        }
        return v.producto === filtroProducto;
      });
    }
    
    // Filtrar por cliente
    if (filtroCliente !== 'todos') {
      filtradas = filtradas.filter(v => v.cliente === filtroCliente);
    }
    
    // Filtrar por búsqueda
    if (busqueda) {
      const termino = busqueda.toLowerCase();
      filtradas = filtradas.filter(v => 
        v.cliente?.toLowerCase().includes(termino) ||
        v.vendedor?.toLowerCase().includes(termino) ||
        (Array.isArray(v.productos) 
          ? v.productos.some(p => p.nombre?.toLowerCase().includes(termino))
          : v.producto?.toLowerCase().includes(termino)) ||
        v.id?.toString().includes(termino)
      );
    }
    
    // Ordenar
    filtradas.sort((a, b) => {
      const fechaA = new Date(a.fecha_venta || a.created_at);
      const fechaB = new Date(b.fecha_venta || b.created_at);
      
      switch(orden) {
        case 'fecha_asc':
          return fechaA - fechaB;
        case 'total_desc':
          return (b.total || 0) - (a.total || 0);
        case 'total_asc':
          return (a.total || 0) - (b.total || 0);
        case 'cliente':
          return (a.cliente || '').localeCompare(b.cliente || '');
        case 'vendedor':
          return (a.vendedor || '').localeCompare(b.vendedor || '');
        default: // fecha_desc
          return fechaB - fechaA;
      }
    });
    
    return filtradas;
  }, [sales, filtroPeriodo, filtroVendedor, filtroProducto, filtroCliente, busqueda, orden]);
  
  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    const ventasDelDia = ventasFiltradas.filter(v => {
      const hoy = new Date();
      const fechaVenta = new Date(v.fecha_venta || v.created_at);
      return fechaVenta.toDateString() === hoy.toDateString();
    });
    
    const ventasUltimaSemana = ventasFiltradas.filter(v => {
      const semanaAtras = new Date();
      semanaAtras.setDate(semanaAtras.getDate() - 7);
      const fechaVenta = new Date(v.fecha_venta || v.created_at);
      return fechaVenta >= semanaAtras;
    });
    
    const productosVendidos = ventasFiltradas.reduce((total, venta) => {
      if (Array.isArray(venta.productos)) {
        return total + venta.productos.reduce((sum, p) => sum + (p.cantidad || 0), 0);
      }
      return total + (venta.cantidad || 0);
    }, 0);
    
    const totalVentasUSD = ventasFiltradas.reduce((sum, v) => sum + (v.total || 0), 0);
    const totalVentasVES = convertToVES(totalVentasUSD);
    
    const promedioVentaUSD = ventasFiltradas.length > 0 ? totalVentasUSD / ventasFiltradas.length : 0;
    
    const ventasPorMetodo = ventasFiltradas.reduce((acc, v) => {
      const metodo = v.metodo_pago || 'efectivo';
      acc[metodo] = (acc[metodo] || 0) + (v.total || 0);
      return acc;
    }, {});
    
    const clientesUnicos = [...new Set(ventasFiltradas.map(v => v.cliente).filter(Boolean))];
    
    return {
      totalVentas: ventasFiltradas.length,
      totalVendidoUSD: totalVentasUSD,
      totalVendidoVES: totalVentasVES,
      productosVendidos,
      promedioVentaUSD,
      ventasHoy: ventasDelDia.length,
      totalHoyUSD: ventasDelDia.reduce((sum, v) => sum + (v.total || 0), 0),
      ventasSemana: ventasUltimaSemana.length,
      clientesUnicos: clientesUnicos.length,
      ventasPorMetodo,
      metodoMasUsado: Object.keys(ventasPorMetodo).length > 0 
        ? Object.entries(ventasPorMetodo).sort((a, b) => b[1] - a[1])[0][0]
        : 'efectivo'
    };
  }, [ventasFiltradas, convertToVES]);
  
  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    const productoExistente = productosCarrito.find(p => p.id === producto.id);
    
    if (productoExistente) {
      if (productoExistente.cantidad < (producto.stock || 0)) {
        setProductosCarrito(prev =>
          prev.map(p =>
            p.id === producto.id
              ? { ...p, cantidad: p.cantidad + 1 }
              : p
          )
        );
      } else {
        alert(`No hay suficiente stock de ${producto.nombre}. Stock disponible: ${producto.stock}`);
      }
    } else {
      if (producto.stock > 0) {
        setProductosCarrito(prev => [
          ...prev,
          {
            ...producto,
            cantidad: 1,
            precio_unitario: producto.precio_usd || 0,
            subtotal: producto.precio_usd || 0
          }
        ]);
      } else {
        alert(`El producto ${producto.nombre} no tiene stock disponible`);
      }
    }
  };
  
  // Actualizar cantidad en carrito
  const actualizarCantidadCarrito = (productoId, nuevaCantidad) => {
    const producto = products.find(p => p.id === productoId);
    
    if (nuevaCantidad < 1) {
      setProductosCarrito(prev => prev.filter(p => p.id !== productoId));
    } else if (nuevaCantidad <= (producto?.stock || 0)) {
      setProductosCarrito(prev =>
        prev.map(p =>
          p.id === productoId
            ? {
                ...p,
                cantidad: nuevaCantidad,
                subtotal: (p.precio_unitario || 0) * nuevaCantidad
              }
            : p
        )
      );
    } else {
      alert(`No hay suficiente stock. Stock disponible: ${producto?.stock || 0}`);
    }
  };
  
  // Eliminar producto del carrito
  const eliminarDelCarrito = (productoId) => {
    setProductosCarrito(prev => prev.filter(p => p.id !== productoId));
  };
  
  // Calcular total del carrito
  const calcularTotalCarrito = () => {
    return productosCarrito.reduce((total, producto) => total + (producto.subtotal || 0), 0);
  };
  
  // Calcular impuesto (ejemplo: 16% IVA)
  const calcularImpuesto = () => {
    return calcularTotalCarrito() * 0.16;
  };
  
  // Calcular total general
  const calcularTotalGeneral = () => {
    return calcularTotalCarrito() + calcularImpuesto();
  };
  
  // Registrar nueva venta
  const registrarVenta = async () => {
    if (productosCarrito.length === 0) {
      alert('Debe agregar al menos un producto al carrito');
      return;
    }
    
    if (!clienteActual.nombre.trim()) {
      alert('Debe ingresar el nombre del cliente');
      return;
    }
    
    try {
      setCargando(true);
      
      const ventaData = {
        cliente: clienteActual.nombre,
        cliente_telefono: clienteActual.telefono,
        cliente_email: clienteActual.email,
        cliente_direccion: clienteActual.direccion,
        productos: productosCarrito.map(p => ({
          producto_id: p.id,
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio_unitario: p.precio_unitario,
          subtotal: p.subtotal
        })),
        subtotal: calcularTotalCarrito(),
        impuesto: calcularImpuesto(),
        total: calcularTotalGeneral(),
        total_ves: convertToVES(calcularTotalGeneral()),
        metodo_pago: metodoPago,
        vendedor: vendedores[0].nombre, // Por defecto el primer vendedor
        notas: notaVenta,
        tasa_cambio: exchangeRate
      };
      
      // Registrar la venta
      await addSale(ventaData);
      
      // Actualizar stock de productos
      for (const producto of productosCarrito) {
        const productoActual = products.find(p => p.id === producto.id);
        if (productoActual) {
          await updateProductStock(producto.id, productoActual.stock - producto.cantidad);
        }
      }
      
      // Limpiar formulario
      setProductosCarrito([]);
      setClienteActual({
        id: '',
        nombre: '',
        telefono: '',
        email: '',
        direccion: ''
      });
      setMetodoPago('efectivo');
      setNotaVenta('');
      setMostrarFormulario(false);
      
      alert('✅ Venta registrada exitosamente');
    } catch (error) {
      console.error('Error registrando venta:', error);
      alert('❌ Error al registrar la venta');
    } finally {
      setCargando(false);
    }
  };
  
  // Generar factura
  const generarFactura = (venta) => {
    const ventanaFactura = window.open('', '_blank');
    
    const contenidoFactura = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura #${venta.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .factura-container { max-width: 800px; margin: 0 auto; border: 2px solid #333; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info-factura { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .datos-cliente { background: #f5f5f5; padding: 20px; border-radius: 10px; }
          .tabla-productos { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .tabla-productos th, .tabla-productos td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .tabla-productos th { background: #f8f9fa; }
          .totales { text-align: right; margin-top: 30px; }
          .total-final { font-size: 24px; font-weight: bold; color: #2ecc71; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          @media print {
            .no-print { display: none; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="factura-container">
          <div class="header">
            <h1>BODEGA APP</h1>
            <p>Sistema de Gestión de Ventas</p>
            <h2>FACTURA DE VENTA</h2>
          </div>
          
          <div class="info-factura">
            <div>
              <p><strong>Factura N°:</strong> ${venta.id}</p>
              <p><strong>Fecha:</strong> ${new Date(venta.fecha_venta || venta.created_at).toLocaleDateString()}</p>
              <p><strong>Hora:</strong> ${new Date(venta.fecha_venta || venta.created_at).toLocaleTimeString()}</p>
            </div>
            <div>
              <p><strong>Vendedor:</strong> ${venta.vendedor}</p>
              <p><strong>Método de Pago:</strong> ${venta.metodo_pago || 'Efectivo'}</p>
            </div>
          </div>
          
          <div class="datos-cliente">
            <h3>DATOS DEL CLIENTE</h3>
            <p><strong>Nombre:</strong> ${venta.cliente || 'Cliente general'}</p>
            ${venta.cliente_telefono ? `<p><strong>Teléfono:</strong> ${venta.cliente_telefono}</p>` : ''}
            ${venta.cliente_email ? `<p><strong>Email:</strong> ${venta.cliente_email}</p>` : ''}
          </div>
          
          <table class="tabla-productos">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario (USD)</th>
                <th>Subtotal (USD)</th>
              </tr>
            </thead>
            <tbody>
              ${Array.isArray(venta.productos) 
                ? venta.productos.map(p => `
                  <tr>
                    <td>${p.nombre}</td>
                    <td>${p.cantidad}</td>
                    <td>$${p.precio_unitario?.toFixed(2) || '0.00'}</td>
                    <td>$${p.subtotal?.toFixed(2) || '0.00'}</td>
                  </tr>
                `).join('')
                : `<tr>
                    <td>${venta.producto || 'Producto'}</td>
                    <td>${venta.cantidad || 1}</td>
                    <td>$${venta.precio_unitario?.toFixed(2) || venta.price?.toFixed(2) || '0.00'}</td>
                    <td>$${venta.total?.toFixed(2) || '0.00'}</td>
                  </tr>`
              }
            </tbody>
          </table>
          
          <div class="totales">
            <p><strong>Subtotal:</strong> $${(venta.subtotal || venta.total || 0).toFixed(2)} USD</p>
            <p><strong>Impuesto (16%):</strong> $${(venta.impuesto || 0).toFixed(2)} USD</p>
            <p class="total-final">TOTAL: $${venta.total?.toFixed(2) || '0.00'} USD</p>
            <p><strong>Total en VES:</strong> Bs. ${(venta.total_ves || convertToVES(venta.total || 0)).toFixed(2)}</p>
            <p><small>Tasa BCV: ${exchangeRate} Bs/USD</small></p>
          </div>
          
          <div class="footer">
            <p>¡Gracias por su compra!</p>
            <p>Este documento es válido como factura de venta</p>
            <p>Bodega App - Sistema de Gestión</p>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #4361ee; color: white; border: none; border-radius: 5px; cursor: pointer;">
              🖨️ Imprimir Factura
            </button>
          </div>
        </div>
      </body>
      </html>
    `;
    
    ventanaFactura.document.write(contenidoFactura);
    ventanaFactura.document.close();
  };
  
  // Exportar ventas a CSV
  const exportarVentasCSV = () => {
    const headers = ['ID', 'Fecha', 'Cliente', 'Productos', 'Cantidad Total', 'Subtotal USD', 'Impuesto', 'Total USD', 'Total VES', 'Método Pago', 'Vendedor'];
    
    const csvData = ventasFiltradas.map(v => {
      const productos = Array.isArray(v.productos) 
        ? v.productos.map(p => p.nombre).join(', ')
        : v.producto || 'Producto';
      
      const cantidadTotal = Array.isArray(v.productos)
        ? v.productos.reduce((sum, p) => sum + (p.cantidad || 0), 0)
        : v.cantidad || 1;
      
      return [
        v.id,
        new Date(v.fecha_venta || v.created_at).toLocaleDateString(),
        `"${v.cliente || 'Cliente general'}"`,
        `"${productos}"`,
        cantidadTotal,
        v.subtotal?.toFixed(2) || '0.00',
        v.impuesto?.toFixed(2) || '0.00',
        v.total?.toFixed(2) || '0.00',
        v.total_ves?.toFixed(2) || convertToVES(v.total || 0).toFixed(2),
        v.metodo_pago || 'efectivo',
        v.vendedor || 'Sistema'
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `ventas_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Obtener color para método de pago
  const getMetodoPagoColor = (metodo) => {
    switch(metodo) {
      case 'efectivo': return '#2ecc71';
      case 'tarjeta': return '#3498db';
      case 'transferencia': return '#9b59b6';
      case 'pago_movil': return '#1abc9c';
      case 'divisas': return '#f39c12';
      case 'credito': return '#e74c3c';
      default: return '#95a5a6';
    }
  };
  
  // Obtener icono para método de pago
  const getMetodoPagoIcono = (metodo) => {
    const metodoObj = metodosPago.find(m => m.id === metodo);
    return metodoObj ? metodoObj.icono : '💰';
  };
  
  // Obtener nombre de método de pago
  const getMetodoPagoNombre = (metodo) => {
    const metodoObj = metodosPago.find(m => m.id === metodo);
    return metodoObj ? metodoObj.nombre : 'Efectivo';
  };
  
  return (
    <div className="ventas-detalle-container">
      {/* Encabezado */}
      <div className="ventas-header">
        <div className="header-content">
          <h1>
            <span className="header-icon">💰</span>
            Gestión de Ventas
          </h1>
          <p className="header-subtitle">
            Total del día: ${estadisticas.totalHoyUSD.toFixed(2)} USD • {estadisticas.ventasHoy} ventas
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-primary btn-lg"
            onClick={() => setMostrarFormulario(true)}
          >
            <span>➕</span>
            Nueva Venta
          </button>
          <button 
            className="btn-secondary btn-lg"
            onClick={exportarVentasCSV}
          >
            <span>📥</span>
            Exportar CSV
          </button>
        </div>
      </div>
      
      {/* Grid de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Ventas</h3>
            <p className="stat-value">{estadisticas.totalVentas}</p>
            <p className="stat-label">Período actual</p>
          </div>
        </div>
        
        <div className="stat-card ingresos">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <h3>Ingresos Totales</h3>
            <p className="stat-value">${estadisticas.totalVendidoUSD.toFixed(2)}</p>
            <p className="stat-label">USD • Bs. {estadisticas.totalVendidoVES.toFixed(2)} VES</p>
          </div>
        </div>
        
        <div className="stat-card productos">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Productos Vendidos</h3>
            <p className="stat-value">{estadisticas.productosVendidos}</p>
            <p className="stat-label">Unidades totales</p>
          </div>
        </div>
        
        <div className="stat-card promedio">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Venta Promedio</h3>
            <p className="stat-value">${estadisticas.promedioVentaUSD.toFixed(2)}</p>
            <p className="stat-label">Por transacción</p>
          </div>
        </div>
        
        <div className="stat-card clientes">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Clientes Únicos</h3>
            <p className="stat-value">{estadisticas.clientesUnicos}</p>
            <p className="stat-label">Este período</p>
          </div>
        </div>
        
        <div className="stat-card metodo">
          <div className="stat-icon">{getMetodoPagoIcono(estadisticas.metodoMasUsado)}</div>
          <div className="stat-content">
            <h3>Método Más Usado</h3>
            <p className="stat-value">{getMetodoPagoNombre(estadisticas.metodoMasUsado)}</p>
            <p className="stat-label">Forma de pago principal</p>
          </div>
        </div>
      </div>
      
      {/* Panel de filtros */}
      <div className="filters-panel">
        <h3>🔍 Filtros y Búsqueda</h3>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label>Período:</label>
            <select 
              value={filtroPeriodo} 
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="filter-select"
            >
              <option value="hoy">Hoy</option>
              <option value="ayer">Ayer</option>
              <option value="semana">Última semana</option>
              <option value="mes">Este mes</option>
              <option value="todos">Todo el historial</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Vendedor:</label>
            <select 
              value={filtroVendedor} 
              onChange={(e) => setFiltroVendedor(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos los vendedores</option>
              {vendedores.map(v => (
                <option key={v.id} value={v.nombre}>{v.nombre}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Producto:</label>
            <select 
              value={filtroProducto} 
              onChange={(e) => setFiltroProducto(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos los productos</option>
              {products.slice(0, 20).map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Cliente:</label>
            <select 
              value={filtroCliente} 
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos los clientes</option>
              {[...new Set(sales.map(v => v.cliente).filter(Boolean))].slice(0, 20).map(cliente => (
                <option key={cliente} value={cliente}>{cliente}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Buscar:</label>
            <input
              type="text"
              placeholder="Buscar por cliente, producto, ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Ordenar por:</label>
            <select 
              value={orden} 
              onChange={(e) => setOrden(e.target.value)}
              className="filter-select"
            >
              <option value="fecha_desc">Fecha más reciente</option>
              <option value="fecha_asc">Fecha más antigua</option>
              <option value="total_desc">Total mayor primero</option>
              <option value="total_asc">Total menor primero</option>
              <option value="cliente">Cliente (A-Z)</option>
              <option value="vendedor">Vendedor (A-Z)</option>
            </select>
          </div>
        </div>
        
        <div className="filter-actions">
          <button 
            className="btn-clear-filters"
            onClick={() => {
              setFiltroPeriodo('hoy');
              setFiltroVendedor('todos');
              setFiltroProducto('todos');
              setFiltroCliente('todos');
              setBusqueda('');
              setOrden('fecha_desc');
            }}
          >
            🗑️ Limpiar Filtros
          </button>
        </div>
      </div>
      
      {/* Tabla de ventas */}
      <div className="ventas-table-container">
        <div className="table-header">
          <h3>
            <span>📋</span>
            Historial de Ventas
            <span className="badge-count">{ventasFiltradas.length}</span>
          </h3>
          <div className="table-summary">
            Mostrando {ventasFiltradas.length} de {sales.length} ventas
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="ventas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha/Hora</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Método Pago</th>
                <th>Vendedor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>No se encontraron ventas</p>
                    <small>Intenta cambiar los filtros o registrar una nueva venta</small>
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map(venta => {
                  const productos = Array.isArray(venta.productos) 
                    ? venta.productos 
                    : [{ nombre: venta.producto || 'Producto', cantidad: venta.cantidad || 1 }];
                  
                  return (
                    <tr key={venta.id} className="venta-row">
                      <td className="venta-id">
                        <span className="id-badge">#{venta.id?.substring(0, 8)}</span>
                      </td>
                      
                      <td className="venta-fecha">
                        <div className="fecha-principal">
                          {new Date(venta.fecha_venta || venta.created_at).toLocaleDateString()}
                        </div>
                        <div className="fecha-hora">
                          {new Date(venta.fecha_venta || venta.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      
                      <td className="venta-cliente">
                        <div className="cliente-nombre">{venta.cliente || 'Cliente general'}</div>
                        {venta.cliente_telefono && (
                          <div className="cliente-telefono">
                            📱 {venta.cliente_telefono}
                          </div>
                        )}
                      </td>
                      
                      <td className="venta-productos">
                        <div className="productos-count">
                          {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
                        </div>
                        <div className="productos-preview">
                          {productos.slice(0, 2).map(p => p.nombre).join(', ')}
                          {productos.length > 2 && '...'}
                        </div>
                      </td>
                      
                      <td className="venta-total">
                        <div className="total-usd">${venta.total?.toFixed(2) || '0.00'} USD</div>
                        <div className="total-ves">
                          Bs. {(venta.total_ves || convertToVES(venta.total || 0)).toFixed(2)} VES
                        </div>
                      </td>
                      
                      <td className="venta-metodo">
                        <span 
                          className="metodo-badge"
                          style={{ 
                            backgroundColor: getMetodoPagoColor(venta.metodo_pago || 'efectivo')
                          }}
                        >
                          {getMetodoPagoIcono(venta.metodo_pago || 'efectivo')}
                          {getMetodoPagoNombre(venta.metodo_pago || 'efectivo')}
                        </span>
                      </td>
                      
                      <td className="venta-vendedor">
                        <div className="vendedor-nombre">{venta.vendedor || 'Sistema'}</div>
                      </td>
                      
                      <td className="venta-acciones">
                        <div className="acciones-grid">
                          <button
                            className="btn-action primary"
                            onClick={() => generarFactura(venta)}
                            title="Generar factura"
                          >
                            🧾
                          </button>
                          
                          <button
                            className="btn-action info"
                            onClick={() => setMostrarDetalles(venta.id)}
                            title="Ver detalles"
                          >
                            👁️
                          </button>
                          
                          <button
                            className="btn-action success"
                            onClick={() => alert('Reembolsar venta')}
                            title="Reembolsar"
                          >
                            ↩️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {ventasFiltradas.length > 0 && (
          <div className="table-footer">
            <div className="pagination">
              <button className="pagination-btn">‹ Anterior</button>
              <span className="pagination-info">Página 1 de 1</span>
              <button className="pagination-btn">Siguiente ›</button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de nueva venta */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content venta-modal">
            <div className="modal-header">
              <h2>🛒 Nueva Venta</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setMostrarFormulario(false);
                  setProductosCarrito([]);
                  setClienteActual({
                    id: '',
                    nombre: '',
                    telefono: '',
                    email: '',
                    direccion: ''
                  });
                  setMetodoPago('efectivo');
                  setNotaVenta('');
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="venta-columns">
                {/* Columna izquierda - Selección de productos */}
                <div className="venta-column">
                  <h3>🛍️ Seleccionar Productos</h3>
                  
                  {/* Productos con stock bajo */}
                  <div className="productos-rapidos">
                    <h4>Productos con Stock Bajo:</h4>
                    <div className="productos-grid">
                      {products
                        .filter(p => (p.stock || 0) < 10)
                        .slice(0, 8)
                        .map(producto => (
                          <button
                            type="button"
                            key={producto.id}
                            onClick={() => agregarAlCarrito(producto)}
                            className="producto-rapido"
                            disabled={(producto.stock || 0) <= 0}
                          >
                            <div className="producto-rapido-nombre">{producto.nombre}</div>
                            <div className="producto-rapido-info">
                              <span>Stock: {producto.stock || 0}</span>
                              <span>${producto.precio_usd?.toFixed(2) || '0.00'}</span>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                  
                  {/* Buscar productos */}
                  <div className="buscar-productos">
                    <input
                      type="text"
                      placeholder="🔍 Buscar productos por nombre..."
                      className="buscar-input"
                      onChange={(e) => {
                        // Aquí iría la lógica de búsqueda
                      }}
                    />
                  </div>
                  
                  {/* Lista de todos los productos */}
                  <div className="productos-disponibles">
                    <h4>Todos los Productos</h4>
                    <div className="productos-lista">
                      {products
                        .filter(p => (p.stock || 0) > 0)
                        .slice(0, 15)
                        .map(producto => (
                          <div key={producto.id} className="producto-disponible">
                            <div className="producto-info">
                              <div className="producto-nombre">{producto.nombre}</div>
                              <div className="producto-detalles">
                                <span>Stock: {producto.stock}</span>
                                <span className="producto-precio">
                                  ${producto.precio_usd?.toFixed(2)} USD
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => agregarAlCarrito(producto)}
                              className="btn-agregar-carrito"
                              disabled={(producto.stock || 0) <= 0}
                            >
                              ➕ Agregar
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                
                {/* Columna derecha - Carrito y datos de venta */}
                <div className="venta-column">
                  <h3>🛒 Carrito de Compras</h3>
                  
                  {/* Carrito */}
                  <div className="carrito-container">
                    {productosCarrito.length === 0 ? (
                      <div className="carrito-vacio">
                        <div className="carrito-icono">🛒</div>
                        <p>El carrito está vacío</p>
                        <small>Agrega productos desde la lista de la izquierda</small>
                      </div>
                    ) : (
                      <div className="carrito-productos">
                        {productosCarrito.map(producto => (
                          <div key={producto.id} className="producto-carrito">
                            <div className="producto-carrito-info">
                              <div className="producto-carrito-nombre">
                                {producto.nombre}
                              </div>
                              <div className="producto-carrito-precio">
                                ${producto.precio_unitario?.toFixed(2)} c/u
                              </div>
                            </div>
                            
                            <div className="producto-carrito-controls">
                              <div className="cantidad-control">
                                <button
                                  type="button"
                                  onClick={() => actualizarCantidadCarrito(producto.id, producto.cantidad - 1)}
                                  className="cantidad-btn"
                                >
                                  -
                                </button>
                                <span className="cantidad-value">{producto.cantidad}</span>
                                <button
                                  type="button"
                                  onClick={() => actualizarCantidadCarrito(producto.id, producto.cantidad + 1)}
                                  className="cantidad-btn"
                                  disabled={producto.cantidad >= (producto.stock || 0)}
                                >
                                  +
                                </button>
                              </div>
                              
                              <div className="producto-carrito-subtotal">
                                ${producto.subtotal?.toFixed(2)}
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => eliminarDelCarrito(producto.id)}
                                className="btn-eliminar-carrito"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Totales del carrito */}
                    {productosCarrito.length > 0 && (
                      <div className="carrito-totales">
                        <div className="total-item">
                          <span>Subtotal:</span>
                          <span>${calcularTotalCarrito().toFixed(2)} USD</span>
                        </div>
                        <div className="total-item">
                          <span>Impuesto (16%):</span>
                          <span>${calcularImpuesto().toFixed(2)} USD</span>
                        </div>
                        <div className="total-item total-final">
                          <span>Total:</span>
                          <span className="total-amount">${calcularTotalGeneral().toFixed(2)} USD</span>
                        </div>
                        <div className="total-item">
                          <span>Total en VES:</span>
                          <span className="total-ves">
                            Bs. {convertToVES(calcularTotalGeneral()).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Datos del cliente */}
                  <div className="datos-cliente">
                    <h4>👤 Datos del Cliente</h4>
                    <div className="form-cliente">
                      <div className="form-group">
                        <label>Nombre del Cliente *</label>
                        <input
                          type="text"
                          value={clienteActual.nombre}
                          onChange={(e) => setClienteActual(prev => ({
                            ...prev,
                            nombre: e.target.value
                          }))}
                          placeholder="Nombre completo del cliente"
                          className="form-input"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Teléfono</label>
                        <input
                          type="tel"
                          value={clienteActual.telefono}
                          onChange={(e) => setClienteActual(prev => ({
                            ...prev,
                            telefono: e.target.value
                          }))}
                          placeholder="Número de teléfono"
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={clienteActual.email}
                          onChange={(e) => setClienteActual(prev => ({
                            ...prev,
                            email: e.target.value
                          }))}
                          placeholder="Correo electrónico"
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Dirección</label>
                        <textarea
                          value={clienteActual.direccion}
                          onChange={(e) => setClienteActual(prev => ({
                            ...prev,
                            direccion: e.target.value
                          }))}
                          placeholder="Dirección de entrega (opcional)"
                          className="form-textarea"
                          rows="2"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Método de pago y notas */}
                  <div className="pago-notas">
                    <div className="metodo-pago">
                      <h4>💳 Método de Pago</h4>
                      <div className="metodos-grid">
                        {metodosPago.map(metodo => (
                          <button
                            type="button"
                            key={metodo.id}
                            className={`metodo-btn ${metodoPago === metodo.id ? 'selected' : ''}`}
                            onClick={() => setMetodoPago(metodo.id)}
                          >
                            <span className="metodo-icono">{metodo.icono}</span>
                            <span className="metodo-nombre">{metodo.nombre}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="notas-venta">
                      <h4>📝 Notas de la Venta</h4>
                      <textarea
                        value={notaVenta}
                        onChange={(e) => setNotaVenta(e.target.value)}
                        placeholder="Observaciones especiales, detalles de entrega, etc."
                        className="notas-textarea"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-confirmar btn-lg"
                onClick={registrarVenta}
                disabled={productosCarrito.length === 0 || cargando}
              >
                {cargando ? '⏳ Procesando...' : '💳 Confirmar Venta'}
              </button>
              <button 
                type="button" 
                className="btn-cancelar btn-lg"
                onClick={() => setMostrarFormulario(false)}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de detalles de venta */}
      {mostrarDetalles && (
        <div className="modal-overlay">
          <div className="modal-content detalles-modal">
            <div className="modal-header">
              <h2>📋 Detalles de la Venta</h2>
              <button 
                className="modal-close"
                onClick={() => setMostrarDetalles(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detalles-venta">
                <div className="detalles-header">
                  <div className="detalles-id">
                    <h3>Venta #{mostrarDetalles.substring(0, 8)}</h3>
                  </div>
                  <div className="detalles-fecha">
                    {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="detalles-info">
                  <div className="info-cliente">
                    <h4>👤 Cliente</h4>
                    <p>Nombre: Cliente Ejemplo</p>
                    <p>Teléfono: 0412-1234567</p>
                  </div>
                  
                  <div className="info-vendedor">
                    <h4>👔 Vendedor</h4>
                    <p>María Gómez</p>
                  </div>
                  
                  <div className="info-pago">
                    <h4>💳 Método de Pago</h4>
                    <p>Efectivo</p>
                  </div>
                </div>
                
                <div className="detalles-productos">
                  <h4>🛍️ Productos</h4>
                  <table className="productos-detalle">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Producto Ejemplo 1</td>
                        <td>2</td>
                        <td>$10.00</td>
                        <td>$20.00</td>
                      </tr>
                      <tr>
                        <td>Producto Ejemplo 2</td>
                        <td>1</td>
                        <td>$15.00</td>
                        <td>$15.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="detalles-totales">
                  <div className="total-item">
                    <span>Subtotal:</span>
                    <span>$35.00 USD</span>
                  </div>
                  <div className="total-item">
                    <span>Impuesto (16%):</span>
                    <span>$5.60 USD</span>
                  </div>
                  <div className="total-item total-final">
                    <span>Total:</span>
                    <span className="total-amount">$40.60 USD</span>
                  </div>
                  <div className="total-item">
                    <span>Total en VES:</span>
                    <span className="total-ves">Bs. 1,421.00 VES</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-primary"
                onClick={() => generarFactura({ id: mostrarDetalles })}
              >
                🧾 Generar Factura
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setMostrarDetalles(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentasDetalle;