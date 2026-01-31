// src/context/DataContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Crear el contexto
const DataContext = createContext();

// Hook personalizado para usar el contexto
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};

// Proveedor del contexto
export const DataProvider = ({ children }) => {
  // Estados para navegación
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [selectedView, setSelectedView] = useState('lista');
  
  // Estados para datos
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [encargos, setEncargos] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Estados para sistema
  const [exchangeRate, setExchangeRate] = useState(36.50);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // FUNCIONES PARA TASA DE CAMBIO
  // ============================================
  
  // Obtener tasa actual del BCV
  const fetchExchangeRate = async () => {
    try {
      // Primero intentar con API externa
      const response = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv');
      const data = await response.json();
      
      if (data?.monitors?.usd?.price) {
        const newRate = parseFloat(data.monitors.usd.price);
        setExchangeRate(newRate);
        
        // Guardar en base de datos para historial
        await supabase
          .from('tasa_cambio')
          .insert([{ 
            tasa_ves: newRate, 
            fuente: 'api_bcv',
            activa: true
          }]);
        
        return newRate;
      }
    } catch (error) {
      console.error('Error obteniendo tasa BCV:', error);
      
      // Si falla API, buscar última tasa en base de datos
      const { data: lastRate } = await supabase
        .from('tasa_cambio')
        .select('tasa_ves')
        .eq('activa', true)
        .order('fecha_actualizacion', { ascending: false })
        .limit(1)
        .single();
      
      if (lastRate?.tasa_ves) {
        setExchangeRate(lastRate.tasa_ves);
        return lastRate.tasa_ves;
      }
    }
    return exchangeRate;
  };
  
  // Actualizar tasa manualmente
  const refreshExchangeRate = async () => {
    const nuevaTasa = await fetchExchangeRate();
    
    // Actualizar precios VES en productos existentes
    const updatedProducts = products.map(product => ({
      ...product,
      precio_ves: (product.precio_usd || 0) * nuevaTasa
    }));
    
    setProducts(updatedProducts);
    return nuevaTasa;
  };
  
  // Actualizar tasa de cambio manualmente
  const updateExchangeRate = async (nuevaTasa, fuente = 'manual') => {
    try {
      // Desactivar todas las tasas anteriores
      await supabase
        .from('tasa_cambio')
        .update({ activa: false })
        .eq('activa', true);
      
      // Insertar nueva tasa
      const { data, error } = await supabase
        .from('tasa_cambio')
        .insert([{
          tasa_ves: nuevaTasa,
          fuente: fuente,
          activa: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setExchangeRate(nuevaTasa);
      
      // Actualizar precios en VES de productos
      await supabase.rpc('actualizar_precios_ves_por_tasa', {
        nueva_tasa: nuevaTasa
      });
      
      // Actualizar productos locales
      await fetchProducts();
      
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar tasa de cambio:', err);
      return { success: false, error: err.message };
    }
  };

  // Función para convertir USD a VES
  const convertToVES = (usdAmount) => {
    return usdAmount * exchangeRate;
  };
  
  // Función para convertir VES a USD
  const convertToUSD = (vesAmount) => {
    return vesAmount / exchangeRate;
  };

  // ============================================
  // FUNCIONES PARA PRODUCTOS
  // ============================================
  
  // Obtener todos los productos con sus categorías
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categorias (id, nombre, descripcion)
        `)
        .eq('activo', true)
        .order('nombre');
      
      if (error) throw error;
      setProducts(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error al obtener productos:', err);
      return [];
    }
  };

  // Obtener producto por ID
  const getProductById = async (id) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categorias (id, nombre, descripcion)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error obteniendo producto:', err);
      throw err;
    }
  };

  // Buscar productos
  const searchProducts = async (searchTerm) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categorias (id, nombre, descripcion)
        `)
        .or(`nombre.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%,codigo_barras.ilike.%${searchTerm}%`)
        .order('nombre');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error buscando productos:', err);
      return [];
    }
  };

  // Crear producto completo
  const createProduct = async (productData) => {
    try {
      // Calcular precio en VES
      const precio_ves = (productData.precio_usd || 0) * exchangeRate;
      
      const { data, error } = await supabase
        .from('productos')
        .insert([{
          nombre: productData.nombre,
          descripcion: productData.descripcion || '',
          precio_usd: productData.precio_usd || 0,
          precio_ves: precio_ves,
          tasa_cambio: exchangeRate,
          categoria_id: productData.categoria_id,
          stock: productData.stock || 0,
          stock_minimo: productData.stock_minimo || 10,
          stock_maximo: productData.stock_maximo || 100,
          costo_usd: productData.costo_usd || 0,
          codigo_barras: productData.codigo_barras || '',
          imagen_url: productData.imagen_url || '',
          activo: true,
          creado_en: new Date().toISOString()
        }])
        .select(`
          *,
          categorias (id, nombre, descripcion)
        `)
        .single();
      
      if (error) throw error;
      
      // Actualizar estado local
      setProducts(prev => [data, ...prev]);
      
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      console.error('Error al crear producto:', err);
      return { success: false, error: err.message };
    }
  };

  // Alias para compatibilidad
  const addProductComplete = createProduct;

  // Actualizar producto
  const updateProduct = async (id, productData) => {
    try {
      // Si se actualiza precio_usd, recalcular precio_ves
      if (productData.precio_usd !== undefined) {
        productData.precio_ves = productData.precio_usd * exchangeRate;
        productData.tasa_cambio = exchangeRate;
      }
      
      productData.actualizado_en = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('productos')
        .update(productData)
        .eq('id', id)
        .select(`
          *,
          categorias (id, nombre, descripcion)
        `)
        .single();
      
      if (error) throw error;
      
      // Actualizar estado local
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, ...data } : p
      ));
      
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar producto:', err);
      return { success: false, error: err.message };
    }
  };

  // Eliminar producto (marcar como inactivo)
  const deleteProduct = async (id) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ 
          activo: false, 
          actualizado_en: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizar estado local
      setProducts(prev => prev.filter(p => p.id !== id));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error al eliminar producto:', err);
      return { success: false, error: err.message };
    }
  };

  // Actualizar stock de producto
  const updateProductStock = async (productId, cantidad, tipo = 'ajuste') => {
    try {
      const { data: producto, error: errorProducto } = await supabase
        .from('productos')
        .select('stock')
        .eq('id', productId)
        .single();
      
      if (errorProducto) throw errorProducto;
      
      const nuevoStock = producto.stock + cantidad;
      
      const { error } = await supabase
        .from('productos')
        .update({ 
          stock: nuevoStock,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', productId);
      
      if (error) throw error;
      
      // Registrar movimiento de inventario
      await supabase
        .from('movimientos_inventario')
        .insert({
          producto_id: productId,
          cantidad: cantidad,
          tipo_movimiento: tipo,
          precio_unitario_usd: 0,
          precio_unitario_ves: 0,
          total_usd: 0,
          total_ves: 0,
          observaciones: `Ajuste manual de stock: ${cantidad > 0 ? '+' : ''}${cantidad}`
        });
      
      // Actualizar lista local
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, stock: nuevoStock } : p
      ));
      
      return { success: true, nuevoStock };
    } catch (err) {
      console.error('Error al actualizar stock:', err);
      return { success: false, error: err.message };
    }
  };

  // ============================================
  // FUNCIONES PARA PROVEEDORES
  // ============================================
  
  // Obtener proveedores
  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('activo', true)
        .order('nombre');
      
      if (error) throw error;
      setSuppliers(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error al obtener proveedores:', err);
      return [];
    }
  };

  // Crear proveedor
  const createSupplier = async (supplierData) => {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .insert([{ ...supplierData, activo: true }])
        .select()
        .single();
      
      if (error) throw error;
      
      setSuppliers(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      console.error('Error al crear proveedor:', err);
      return { success: false, error: err.message };
    }
  };

  // Alias para compatibilidad
  const addProveedor = createSupplier;

  // Actualizar proveedor
  const updateSupplier = async (id, supplierData) => {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .update(supplierData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setSuppliers(prev => prev.map(s => s.id === id ? data : s));
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar proveedor:', err);
      return { success: false, error: err.message };
    }
  };

  // Alias para compatibilidad
  const updateProveedor = updateSupplier;

  // Eliminar proveedor
  const deleteSupplier = async (id) => {
    try {
      const { error } = await supabase
        .from('proveedores')
        .update({ activo: false })
        .eq('id', id);
      
      if (error) throw error;
      
      setSuppliers(prev => prev.filter(s => s.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error al eliminar proveedor:', err);
      return { success: false, error: err.message };
    }
  };

  // Alias para compatibilidad
  const deleteProveedor = deleteSupplier;

  // ============================================
  // FUNCIONES PARA CLIENTES
  // ============================================
  
  // Obtener clientes
  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('activo', true)
        .order('nombre');
      
      if (error) throw error;
      setCustomers(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error al obtener clientes:', err);
      return [];
    }
  };

  // Crear cliente
  const createCustomer = async (customerData) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{ ...customerData, activo: true }])
        .select()
        .single();
      
      if (error) throw error;
      
      setCustomers(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      console.error('Error al crear cliente:', err);
      return { success: false, error: err.message };
    }
  };

  // Alias para compatibilidad
  const addCliente = createCustomer;

  // Actualizar cliente
  const updateCustomer = async (id, customerData) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(customerData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setCustomers(prev => prev.map(c => c.id === id ? data : c));
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar cliente:', err);
      return { success: false, error: err.message };
    }
  };

  // Eliminar cliente
  const deleteCustomer = async (id) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ activo: false })
        .eq('id', id);
      
      if (error) throw error;
      
      setCustomers(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error al eliminar cliente:', err);
      return { success: false, error: err.message };
    }
  };

  // ============================================
  // FUNCIONES PARA VENTAS
  // ============================================
  
  // Obtener ventas
  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          clientes(nombre, telefono, email),
          ventas_detalle(
            id,
            cantidad,
            precio_unitario_usd,
            precio_unitario_ves,
            subtotal_usd,
            subtotal_ves,
            productos(nombre, precio_usd)
          )
        `)
        .order('fecha', { ascending: false });
      
      if (error) throw error;
      setSales(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error al obtener ventas:', err);
      return [];
    }
  };

  // Alias para compatibilidad
  const getVentas = fetchSales;

  // Obtener venta por ID
  const getVentaById = async (id) => {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          clientes(*),
          ventas_detalle(
            *,
            productos(*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error obteniendo venta:', err);
      throw err;
    }
  };

  // Crear venta (versión simple para compatibilidad)
  const addSale = async (sale) => {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .insert([{
          producto_id: sale.producto_id,
          cantidad: sale.cantidad,
          precio_unitario_usd: sale.precio_unitario,
          total_usd: sale.total,
          total_ves: sale.total * exchangeRate,
          cliente: sale.cliente,
          vendedor: currentUser?.email || 'Sistema',
          fecha: new Date().toISOString(),
          estado: 'Completada'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Actualizar stock del producto si existe producto_id
      if (sale.producto_id) {
        const producto = products.find(p => p.id === sale.producto_id);
        if (producto) {
          await updateProductStock(sale.producto_id, -sale.cantidad, 'venta');
        }
      }
      
      // Actualizar estado local
      setSales(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      console.error('Error registrando venta:', err);
      throw err;
    }
  };

  // Crear venta completa
  const createSale = async (saleData) => {
    try {
      // Calcular totales
      const total_usd = saleData.detalle.reduce((sum, item) => 
        sum + (item.precio_unitario_usd * item.cantidad), 0);
      
      const total_ves = total_usd * exchangeRate;
      const subtotal_usd = total_usd + (saleData.descuento || 0);
      const subtotal_ves = subtotal_usd * exchangeRate;
      
      // Crear la venta
      const { data: venta, error: errorVenta } = await supabase
        .from('ventas')
        .insert([{
          cliente_id: saleData.cliente_id,
          total_usd: total_usd,
          total_ves: total_ves,
          descuento: saleData.descuento || 0,
          subtotal_usd: subtotal_usd,
          subtotal_ves: subtotal_ves,
          tasa_cambio: exchangeRate,
          estado: 'Completada',
          metodo_pago: saleData.metodo_pago || 'Efectivo',
          observaciones: saleData.observaciones,
          vendedor_id: currentUser?.id
        }])
        .select()
        .single();
      
      if (errorVenta) throw errorVenta;
      
      // Crear detalles de venta
      const detallesPromises = saleData.detalle.map(item =>
        supabase
          .from('ventas_detalle')
          .insert({
            venta_id: venta.id,
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario_usd: item.precio_unitario_usd,
            precio_unitario_ves: item.precio_unitario_usd * exchangeRate,
            subtotal_usd: item.precio_unitario_usd * item.cantidad,
            subtotal_ves: (item.precio_unitario_usd * item.cantidad) * exchangeRate
          })
      );
      
      await Promise.all(detallesPromises);
      
      // Actualizar stock de productos
      const stockPromises = saleData.detalle.map(item =>
        updateProductStock(item.producto_id, -item.cantidad, 'venta')
      );
      
      await Promise.all(stockPromises);
      
      // Actualizar lista local
      setSales(prev => [venta, ...prev]);
      
      return { success: true, data: venta };
    } catch (err) {
      setError(err.message);
      console.error('Error al crear venta:', err);
      return { success: false, error: err.message };
    }
  };

  // Alias para compatibilidad
  const addVenta = createSale;

  // Cancelar venta
  const cancelSale = async (id) => {
    try {
      const { error } = await supabase
        .from('ventas')
        .update({ estado: 'Cancelada' })
        .eq('id', id);
      
      if (error) throw error;
      
      setSales(prev => prev.map(s => 
        s.id === id ? { ...s, estado: 'Cancelada' } : s
      ));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error al cancelar venta:', err);
      return { success: false, error: err.message };
    }
  };

  // ============================================
  // FUNCIONES PARA ENCARGOS
  // ============================================
  
  // Obtener encargos
  const fetchEncargos = async () => {
    try {
      const { data, error } = await supabase
        .from('encargos')
        .select(`
          *,
          proveedores(nombre, telefono, email),
          encargos_detalle(
            id,
            cantidad,
            precio_unitario_usd,
            subtotal_usd,
            productos(nombre, precio_usd)
          )
        `)
        .order('fecha', { ascending: false });
      
      if (error) throw error;
      setEncargos(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error al obtener encargos:', err);
      return [];
    }
  };

  // Alias para compatibilidad
  const getEncargosCompletos = fetchEncargos;

  // Crear encargo (versión simple para compatibilidad)
  const addEncargo = async (encargo) => {
    try {
      const { data, error } = await supabase
        .from('encargos')
        .insert([{
          proveedor: encargo.proveedor,
          productos: encargo.productos,
          total_usd: encargo.total,
          total_ves: encargo.total * exchangeRate,
          estado: encargo.estado || 'pendiente',
          entrega_estimada: encargo.entrega_estimada,
          fecha: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Actualizar estado local
      setEncargos(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      console.error('Error creando encargo:', err);
      throw err;
    }
  };

  // Crear encargo completo
  const createEncargo = async (encargoData) => {
    try {
      // Calcular total
      const total_usd = encargoData.detalle.reduce((sum, item) => 
        sum + (item.precio_unitario_usd * item.cantidad), 0);
      
      // Crear el encargo
      const { data: encargo, error: errorEncargo } = await supabase
        .from('encargos')
        .insert([{
          proveedor_id: encargoData.proveedor_id,
          total_usd: total_usd,
          estado: 'pendiente',
          entrega_estimada: encargoData.entrega_estimada,
          prioridad: encargoData.prioridad || 'normal',
          notas: encargoData.notas,
          usuario_id: currentUser?.id
        }])
        .select()
        .single();
      
      if (errorEncargo) throw errorEncargo;
      
      // Crear detalles del encargo
      const detallesPromises = encargoData.detalle.map(item =>
        supabase
          .from('encargos_detalle')
          .insert({
            encargo_id: encargo.id,
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario_usd: item.precio_unitario_usd,
            subtotal_usd: item.precio_unitario_usd * item.cantidad
          })
      );
      
      await Promise.all(detallesPromises);
      
      // Actualizar lista local
      setEncargos(prev => [encargo, ...prev]);
      
      return { success: true, data: encargo };
    } catch (err) {
      setError(err.message);
      console.error('Error al crear encargo:', err);
      return { success: false, error: err.message };
    }
  };

  // Actualizar estado de encargo
  const updateEncargoStatus = async (id, nuevoEstado) => {
    try {
      const { data, error } = await supabase
        .from('encargos')
        .update({ 
          estado: nuevoEstado,
          actualizado_en: new Date(),
          ...(nuevoEstado === 'recibido' && { fecha_recepcion: new Date() }),
          ...(nuevoEstado === 'pagado_recibido' && { 
            fecha_pago: new Date(),
            fecha_recepcion: new Date()
          })
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setEncargos(prev => prev.map(e => e.id === id ? data : e));
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar encargo:', err);
      return { success: false, error: err.message };
    }
  };

  // ============================================
  // FUNCIONES PARA CATEGORÍAS
  // ============================================
  
  // Obtener categorías
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre');
      
      if (error) throw error;
      setCategories(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error al obtener categorías:', err);
      return [];
    }
  };

  // Alias para compatibilidad
  const loadCategories = fetchCategories;

  // Crear categoría
  const addCategory = async (category) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([{
          nombre: category.nombre,
          descripcion: category.descripcion,
          icono: category.icono || '📦'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Actualizar estado local
      setCategories(prev => [...prev, data]);
      
      return { success: true, data };
    } catch (err) {
      console.error('Error agregando categoría:', err);
      return { success: false, error: err.message };
    }
  };

  // ============================================
  // FUNCIONES DE EXPORTACIÓN
  // ============================================
  
  // Exportar productos a CSV
  const exportProductsToCSV = (filteredProducts = products) => {
    try {
      if (filteredProducts.length === 0) {
        throw new Error('No hay productos para exportar');
      }
      
      const headers = [
        'ID',
        'Nombre',
        'Descripción',
        'Categoría',
        'Precio USD',
        'Precio VES',
        'Stock',
        'Stock Mínimo',
        'Stock Máximo',
        'Código Barras',
        'Estado',
        'Creado'
      ];
      
      const csvData = filteredProducts.map(p => [
        p.id?.substring(0, 8) || '',
        `"${(p.nombre || '').replace(/"/g, '""')}"`,
        `"${(p.descripcion || '').replace(/"/g, '""')}"`,
        p.categorias?.nombre || 'Sin categoría',
        p.precio_usd?.toFixed(2) || '0.00',
        p.precio_ves?.toFixed(2) || ((p.precio_usd || 0) * exchangeRate).toFixed(2),
        p.stock || 0,
        p.stock_minimo || 10,
        p.stock_maximo || 100,
        p.codigo_barras || '',
        p.activo ? 'Activo' : 'Inactivo',
        new Date(p.creado_en).toLocaleDateString()
      ]);
      
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `productos_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      return true;
    } catch (error) {
      console.error('Error exportando a CSV:', error);
      throw error;
    }
  };
  
  // Exportar productos a Excel (requiere xlsx)
  const exportProductsToExcel = async (filteredProducts = products) => {
    try {
      // Verificar si la librería está disponible
      if (typeof window.XLSX === 'undefined') {
        console.warn('La librería XLSX no está disponible. Instala: npm install xlsx');
        // Fallback a CSV
        return exportProductsToCSV(filteredProducts);
      }
      
      const XLSX = window.XLSX;
      
      const excelData = filteredProducts.map(p => ({
        ID: p.id?.substring(0, 8) || '',
        Nombre: p.nombre || '',
        Descripción: p.descripcion || '',
        Categoría: p.categorias?.nombre || '',
        'Precio USD': p.precio_usd || 0,
        'Precio VES': p.precio_ves || (p.precio_usd || 0) * exchangeRate,
        Stock: p.stock || 0,
        'Stock Mínimo': p.stock_minimo || 10,
        'Stock Máximo': p.stock_maximo || 100,
        'Código Barras': p.codigo_barras || '',
        Estado: p.activo ? 'Activo' : 'Inactivo',
        'Fecha Creación': new Date(p.creado_en).toLocaleDateString()
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
      
      // Agregar hoja de resumen
      const summaryData = [
        ['RESUMEN DE PRODUCTOS'],
        ['Fecha de exportación', new Date().toLocaleDateString()],
        ['Total productos', filteredProducts.length],
        ['Tasa BCV utilizada', exchangeRate],
        ['Valor total inventario (USD)', filteredProducts.reduce((sum, p) => sum + ((p.precio_usd || 0) * (p.stock || 0)), 0).toFixed(2)],
        ['Productos con stock bajo', filteredProducts.filter(p => (p.stock || 0) < (p.stock_minimo || 10)).length]
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
      
      XLSX.writeFile(workbook, `productos_${new Date().toISOString().slice(0,10)}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      throw error;
    }
  };

  // ============================================
  // FUNCIONES DE IMAGENES
  // ============================================
  
  // Subir imagen a Supabase Storage
  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `productos/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);
      
      return publicUrl;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    }
  };

  // ============================================
  // FUNCIONES DE DASHBOARD
  // ============================================
  
  // Estadísticas del dashboard
  const getDashboardStats = () => {
    const totalProducts = products.length;
    const totalStockValueUSD = products.reduce((sum, p) => sum + ((p.precio_usd || 0) * (p.stock || 0)), 0);
    const totalStockValueVES = convertToVES(totalStockValueUSD);
    
    // Ventas del día
    const salesToday = sales.filter(s => {
      const saleDate = new Date(s.fecha || s.created_at);
      const today = new Date();
      return saleDate.toDateString() === today.toDateString() && s.estado === 'Completada';
    });
    
    const salesTodayTotal = salesToday.reduce((sum, s) => sum + (s.total_usd || 0), 0);
    const salesTodayTotalVES = convertToVES(salesTodayTotal);
    
    const pendingEncargos = encargos.filter(e => e.estado === 'pendiente').length;
    const lowStockProducts = products.filter(p => (p.stock || 0) < (p.stock_minimo || 10)).length;
    
    // Ventas semanales
    const weeklySales = sales.filter(s => {
      const saleDate = new Date(s.fecha || s.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return saleDate >= weekAgo && s.estado === 'Completada';
    });
    
    const weeklyTotal = weeklySales.reduce((sum, s) => sum + (s.total_usd || 0), 0);
    
    // Ventas mensuales
    const monthlySales = sales.filter(s => {
      const saleDate = new Date(s.fecha || s.created_at);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return saleDate >= monthAgo && s.estado === 'Completada';
    });
    
    const monthlyTotal = monthlySales.reduce((sum, s) => sum + (s.total_usd || 0), 0);
    
    // Top productos con bajo stock
    const lowStockProductsList = products
      .filter(p => (p.stock || 0) < (p.stock_minimo || 10))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
    
    // Encargos pendientes
    const pendingEncargosList = encargos
      .filter(e => e.estado === 'pendiente')
      .slice(0, 5);
    
    // Ventas recientes
    const todaySalesList = sales
      .filter(s => s.estado === 'Completada')
      .slice(0, 10);
    
    return {
      totalProducts,
      totalStockValueUSD,
      totalStockValueVES,
      salesToday: salesToday.length,
      salesTodayTotal,
      salesTodayTotalVES,
      pendingEncargos,
      pendingEncargosList,
      lowStockProducts,
      lowStockProductsList,
      weeklySales: weeklySales.length,
      weeklyTotal,
      monthlySales: monthlySales.length,
      monthlyTotal,
      todaySalesList,
      exchangeRate
    };
  };

  // ============================================
  // FUNCIONES DE REPORTES
  // ============================================
  
  // Reporte de ventas por período
  const getReporteVentas = async (fechaInicio, fechaFin) => {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          ventas_detalle (
            cantidad,
            productos (nombre, precio_usd)
          )
        `)
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .order('fecha', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error en reporte de ventas:', err);
      return [];
    }
  };

  // Productos más vendidos
  const getProductosMasVendidos = async (fechaInicio, fechaFin, limite = 10) => {
    try {
      const { data, error } = await supabase
        .rpc('get_productos_mas_vendidos', {
          p_fecha_inicio: fechaInicio,
          p_fecha_fin: fechaFin,
          p_limite: limite
        });
      
      if (error) {
        console.error('Error productos más vendidos:', error);
        return [];
      }
      
      return data;
    } catch (err) {
      console.error('Error productos más vendidos:', err);
      return [];
    }
  };

  // ============================================
  // FUNCIONES DE INICIALIZACIÓN
  // ============================================

  // Cargar todos los datos
  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Cargar en paralelo para mejor rendimiento
      const [productsData, categoriesData, rate] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchExchangeRate()
      ]);
      
      return {
        products: productsData,
        categories: categoriesData,
        exchangeRate: rate
      };
    } catch (error) {
      console.error('Error cargando datos:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Inicializar datos
  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchSuppliers(),
        fetchCustomers(),
        fetchSales(),
        fetchEncargos(),
        fetchCategories(),
        fetchExchangeRate()
      ]);
    } catch (err) {
      console.error('Error al inicializar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuario actual
  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('Error al cargar usuario:', err);
    }
  };

  // ============================================
  // FUNCIONES DE COMPATIBILIDAD
  // ============================================
  
  // Alias para compatibilidad
  const loadProducts = fetchProducts;
  const getProveedores = fetchSuppliers;
  const getClientes = fetchCustomers;
  const getProductosCompletos = () => products;

  // Versión simplificada de addProduct (compatibilidad)
  const addProduct = async (product) => {
    return createProduct({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio_usd: product.precio,
      categoria_id: product.categoria_id,
      stock: product.cantidad,
      imagen_url: product.imagen_url
    });
  };

  // ============================================
  // EFECTOS Y USEEFFECT
  // ============================================

  useEffect(() => {
    // Cargar usuario al iniciar
    loadCurrentUser();
    
    // Cargar datos
    initializeData();
    
    // Suscribirse a cambios en tiempo real
    const productSubscription = supabase
      .channel('productos')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'productos' },
        () => fetchProducts()
      )
      .subscribe();
    
    const saleSubscription = supabase
      .channel('ventas')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ventas' },
        () => fetchSales()
      )
      .subscribe();
    
    const encargoSubscription = supabase
      .channel('encargos')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'encargos' },
        () => fetchEncargos()
      )
      .subscribe();

    // Escuchar cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setCurrentUser(session?.user || null);
      }
    );
    
    // Limpiar suscripciones
    return () => {
      supabase.removeChannel(productSubscription);
      supabase.removeChannel(saleSubscription);
      supabase.removeChannel(encargoSubscription);
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // ============================================
  // VALORES DEL CONTEXTO
  // ============================================

  const value = {
    // Estados
    selectedSection,
    setSelectedSection,
    selectedView,
    setSelectedView,
    products,
    suppliers,
    customers,
    sales,
    encargos,
    categories,
    exchangeRate,
    currentUser,
    loading,
    error,
    
    // Setters
    setProducts,
    setSuppliers,
    setCustomers,
    setSales,
    setEncargos,
    setCategories,
    setExchangeRate,
    setCurrentUser,
    setError,
    
    // ============ FUNCIONES PRINCIPALES ============
    
    // Tasa de cambio
    fetchExchangeRate,
    refreshExchangeRate,
    updateExchangeRate,
    convertToVES,
    convertToUSD,
    
    // Carga de datos
    loadAllData,
    loadProducts,
    loadCategories,
    initializeData,
    loadCurrentUser,
    
    // CRUD Productos
    getProductById,
    searchProducts,
    createProduct,
    addProductComplete,
    updateProduct,
    deleteProduct,
    updateProductStock,
    
    // CRUD Proveedores
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getProveedores,
    addProveedor,
    updateProveedor,
    deleteProveedor,
    
    // CRUD Clientes
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getClientes,
    addCliente,
    
    // CRUD Ventas
    fetchSales,
    getVentas,
    getVentaById,
    addSale,
    createSale,
    addVenta,
    cancelSale,
    
    // CRUD Encargos
    fetchEncargos,
    getEncargosCompletos,
    addEncargo,
    createEncargo,
    updateEncargoStatus,
    
    // CRUD Categorías
    fetchCategories,
    addCategory,
    
    // Exportación
    exportProductsToCSV,
    exportProductsToExcel,
    
    // Dashboard
    getDashboardStats,
    
    // Imágenes
    uploadImage,
    
    // Reportes
    getReporteVentas,
    getProductosMasVendidos,
    
    // ============ FUNCIONES DE COMPATIBILIDAD ============
    addProduct,
    getProductosCompletos
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};


export default DataContext;