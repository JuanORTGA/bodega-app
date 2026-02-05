// src/services/supabaseService.js
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/supabaseService';

// ==================== PRODUCTOS ====================

export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error obteniendo producto:', error);
    throw error;
  }
  return data;
};

export const addProduct = async (product) => {
  const { data, error } = await supabase
    .from('productos')
    .insert([product])
    .select();
  
  if (error) {
    console.error('Error agregando producto:', error);
    throw error;
  }
  return data[0];
};

export const updateProduct = async (id, updates) => {
  const { data, error } = await supabase
    .from('productos')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error actualizando producto:', error);
    throw error;
  }
  return data[0];
};

export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error eliminando producto:', error);
    throw error;
  }
  return true;
};

// ==================== VENTAS ====================
export const getSales = async () => {
  const { data, error } = await supabase
    .from('ventas')
    .select('*, productos(*)')
    .order('fecha', { ascending: false });
  
  if (error) {
    console.error('Error obteniendo ventas:', error);
    throw error;
  }
  return data || [];
};

export const addSale = async (saleData) => {
  const { data, error } = await supabase
    .from('ventas')
    .insert([saleData])
    .select();
  
  if (error) {
    console.error('Error registrando venta:', error);
    throw error;
  }
  return data[0];
};

// ==================== ENCARGOS/PEDIDOS ====================
export const getOrders = async () => {
  const { data, error } = await supabase
    .from('encargos')
    .select('*, productos(*)')
    .order('fecha_creacion', { ascending: false });
  
  if (error) {
    console.error('Error obteniendo encargos:', error);
    throw error;
  }
  return data || [];
};

export const updateOrderStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('encargos')
    .update({ estado: status })
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error actualizando encargo:', error);
    throw error;
  }
  return data[0];
};

// ==================== PROVEEDORES ====================
export const getSuppliers = async () => {
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .order('nombre', { ascending: true });
  
  if (error) {
    console.error('Error obteniendo proveedores:', error);
    throw error;
  }
  return data || [];
};

// ==================== REPORTES/ESTADÍSTICAS ====================
export const getDashboardStats = async () => {
  // Obtener conteo de productos
  const { count: productCount } = await supabase
    .from('productos')
    .select('*', { count: 'exact', head: true });
  
  // Obtener ventas del día
  const today = new Date().toISOString().split('T')[0];
  const { data: todaySales } = await supabase
    .from('ventas')
    .select('total')
    .gte('fecha', today);
  
  const dailyRevenue = todaySales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;
  
  // Obtener productos bajos en inventario
  const { data: lowStock } = await supabase
    .from('productos')
    .select('*')
    .lt('stock', 10);
  
  return {
    totalProducts: productCount || 0,
    dailyRevenue,
    lowStockCount: lowStock?.length || 0,
    pendingOrders: 0 // Puedes agregar lógica para contar encargos pendientes
  };
};

// ==================== BUSQUEDA ====================
export const searchProducts = async (searchTerm) => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .or(`nombre.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`);
  
  if (error) {
    console.error('Error buscando productos:', error);
    throw error;
  }
  return data || [];
};