require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuración SEGURA con la clave de servicio
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function administrarBodega() {
  console.log('=== SCRIPT DE ADMINISTRACIÓN DE BODEGA ===\n');

  // FUNCIÓN 1: Ver todas las categorías
  async function verCategorias() {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre');
    
    if (error) {
      console.error('Error obteniendo categorías:', error.message);
      return [];
    }
    
    console.log('📂 CATEGORÍAS DISPONIBLES:');
    data.forEach(cat => {
      console.log(`   ID: ${cat.id} | ${cat.nombre} - ${cat.descripcion}`);
    });
    console.log('');
    return data;
  }

  // FUNCIÓN 2: Insertar un nuevo producto
  async function insertarProducto(producto) {
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select();
    
    if (error) {
      console.error('❌ Error insertando producto:', error.message);
      return null;
    }
    
    console.log(`✅ Producto insertado: ${producto.nombre} (ID: ${data[0].id})`);
    return data[0];
  }

  // FUNCIÓN 3: Actualizar stock de un producto
  async function actualizarStock(productoId, nuevoStock) {
    const { error } = await supabase
      .from('productos')
      .update({ stock: nuevoStock, updated_at: new Date().toISOString() })
      .eq('id', productoId);
    
    if (error) {
      console.error('❌ Error actualizando stock:', error.message);
      return false;
    }
    
    console.log(`✅ Stock actualizado para producto ID: ${productoId}`);
    return true;
  }

  // FUNCIÓN 4: Obtener reporte de productos bajos en stock
  async function productosBajosStock(limite = 10) {
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, stock, categorias(nombre)')
      .lt('stock', limite)
      .order('stock', { ascending: true });
    
    if (error) {
      console.error('Error obteniendo reporte:', error.message);
      return [];
    }
    
    console.log('📊 PRODUCTOS BAJOS EN STOCK:');
    data.forEach(p => {
      console.log(`   ⚠️  ${p.nombre} - Stock: ${p.stock} | Categoría: ${p.categorias?.nombre}`);
    });
    console.log('');
    return data;
  }

  // FUNCIÓN 5: Insertar múltiples productos desde un array
  async function insertarProductosMasivos(productosArray) {
    const { data, error } = await supabase
      .from('productos')
      .insert(productosArray)
      .select();
    
    if (error) {
      console.error('❌ Error en inserción masiva:', error.message);
      return null;
    }
    
    console.log(`✅ ${data.length} productos insertados exitosamente`);
    return data;
  }

  // --- EJECUCIÓN DE EJEMPLOS ---
  
  // 1. Primero vemos las categorías para obtener sus IDs
  const categorias = await verCategorias();
  
  if (categorias.length > 0) {
    // 2. Insertar un nuevo producto (ejemplo)
    const categoriaEjemplo = categorias[0]; // Toma la primera categoría
    
    const nuevoProducto = {
      nombre: "Arroz Premium 1kg",
      descripcion: "Arroz de grano largo de alta calidad",
      precio_usd: 2.99,
      imagen_url: "https://ejemplo.com/arroz.jpg",
      categoria_id: categoriaEjemplo.id,
      stock: 100,
      activo: true
    };
    
    const productoInsertado = await insertarProducto(nuevoProducto);
    
    // 3. Si se insertó, actualizamos su stock
    if (productoInsertado) {
      await actualizarStock(productoInsertado.id, 150);
    }
    
    // 4. Insertar varios productos a la vez
    const productosMasivos = [
      {
        nombre: "Leche Entera 1L",
        descripcion: "Leche pasteurizada",
        precio_usd: 1.49,
        categoria_id: categorias.find(c => c.nombre === 'Bebidas')?.id || categorias[0].id,
        stock: 80,
        activo: true
      },
      {
        nombre: "Chocolate Negro 100g",
        descripcion: "Chocolate 70% cacao",
        precio_usd: 3.25,
        categoria_id: categorias.find(c => c.nombre === 'Chucherias')?.id || categorias[0].id,
        stock: 45,
        activo: true
      }
    ];
    
    await insertarProductosMasivos(productosMasivos);
  }
  
  // 5. Ver reporte de productos bajos en stock
  await productosBajosStock(50);
  
  console.log('=== SCRIPT COMPLETADO ===');
}

// Manejo de errores global
administrarBodega().catch(error => {
  console.error('🔥 ERROR CRÍTICO EN EL SCRIPT:', error);
  process.exit(1);
});