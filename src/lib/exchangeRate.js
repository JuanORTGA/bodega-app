export async function fetchBCVRate() {
  try {
    // Esta es una API de ejemplo, necesitarías encontrar una fuente confiable
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return data.rates.VES || 36.50;
  } catch (error) {
    console.error('Error fetching BCV rate:', error);
    return 36.50; // Tasa por defecto
  }
}

useEffect(() => {
  const interval = setInterval(() => {
    fetchExchangeRate();
  }, 300000); // Actualizar cada 5 minutos
  
  return () => clearInterval(interval);
}, []);