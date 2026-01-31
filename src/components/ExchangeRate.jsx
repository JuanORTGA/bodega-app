import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FaSyncAlt } from 'react-icons/fa';

export default function ExchangeRate() {
  const [tasa, setTasa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      const { data, error } = await supabase
        .from('tasa_cambio')
        .select('*')
        .order('fecha_actualizacion', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setTasa(data);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateExchangeRate = async (newRate) => {
    try {
      const { error } = await supabase
        .from('tasa_cambio')
        .insert([{ tasa_usd: newRate }]);

      if (error) throw error;
      fetchExchangeRate();
    } catch (error) {
      console.error('Error updating exchange rate:', error);
    }
  };

  if (loading) return <div>Cargando tasa...</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Tasa de Cambio</h3>
        <button 
          onClick={fetchExchangeRate}
          className="text-blue-600 hover:text-blue-800"
        >
          <FaSyncAlt />
        </button>
      </div>
      
      <div className="text-center">
        <p className="text-3xl font-bold text-green-600">
          1 USD = {tasa?.tasa_usd} VES
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Actualizado: {new Date(tasa?.fecha_actualizacion).toLocaleDateString()}
        </p>
      </div>

      <div className="mt-4">
        <input
          type="number"
          step="0.01"
          placeholder="Nueva tasa USD → VES"
          className="w-full p-2 border rounded"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              updateExchangeRate(parseFloat(e.target.value));
              e.target.value = '';
            }
          }}
        />
        <p className="text-xs text-gray-500 mt-1">Presiona Enter para actualizar</p>
      </div>
    </div>
  );
}