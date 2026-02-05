// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Estas variables deben estar en tu archivo .env
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Si no tienes las variables de entorno, puedes usar estas de ejemplo
// pero es SOLO PARA DESARROLLO. Para producción usa .env
const fallbackConfig = {
  url: 'https://tu-proyecto-supabase.supabase.co',
  key: 'tu-clave-anon-publica'
};

// Crea y exporta el cliente de Supabase
export const supabase = createClient(
  supabaseUrl || fallbackConfig.url,
  supabaseAnonKey || fallbackConfig.key
);

// Verifica conexión (opcional)
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Estado de autenticación:', event);
  console.log('Sesión:', session);
});

// Función para verificar que la conexión funciona
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('count', { count: 'exact' });
    
    if (error) throw error;
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a Supabase:', error.message);
    return false;
  }
};