export const initialProducts = [
  { id: 1, name: 'Arroz 1kg', category: 'Granos', quantity: 50, price: 1.50, minStock: 10, supplier: 'Distribuidora Alimenticia', lastUpdated: '2024-01-22' },
  { id: 2, name: 'Aceite 1L', category: 'Aceites', quantity: 30, price: 3.20, minStock: 5, supplier: 'Aceitera Nacional', lastUpdated: '2024-01-22' },
  { id: 3, name: 'Azúcar 1kg', category: 'Endulzantes', quantity: 45, price: 1.80, minStock: 15, supplier: 'Importadora Dulce', lastUpdated: '2024-01-22' },
  { id: 4, name: 'Frijoles 1kg', category: 'Granos', quantity: 25, price: 2.50, minStock: 8, supplier: 'Distribuidora Alimenticia', lastUpdated: '2024-01-21' },
  { id: 5, name: 'Leche 1L', category: 'Lácteos', quantity: 8, price: 1.20, minStock: 10, supplier: 'Lácteos Frescos', lastUpdated: '2024-01-21' },
  { id: 6, name: 'Café 500g', category: 'Bebidas', quantity: 18, price: 4.50, minStock: 5, supplier: 'Café Selecto', lastUpdated: '2024-01-20' },
  { id: 7, name: 'Atún en lata', category: 'Enlatados', quantity: 35, price: 2.80, minStock: 12, supplier: 'Pesquera del Sur', lastUpdated: '2024-01-20' },
  { id: 8, name: 'Harina Pan 1kg', category: 'Granos', quantity: 22, price: 1.90, minStock: 10, supplier: 'Molino Central', lastUpdated: '2024-01-19' },
  { id: 9, name: 'Huevos 30u', category: 'Lácteos', quantity: 15, price: 4.20, minStock: 8, supplier: 'Granja Avícola', lastUpdated: '2024-01-19' },
  { id: 10, name: 'Pasta 500g', category: 'Granos', quantity: 40, price: 1.30, minStock: 15, supplier: 'Pastas Italianas', lastUpdated: '2024-01-18' },
];

export const initialSales = [
  { id: 1, date: '2024-01-22', time: '09:15', product: 'Arroz 1kg', quantity: 5, price: 1.50, total: 7.50, client: 'Juan Pérez', seller: 'María Gómez' },
  { id: 2, date: '2024-01-22', time: '10:30', product: 'Aceite 1L', quantity: 2, price: 3.20, total: 6.40, client: 'Carlos López', seller: 'María Gómez' },
  { id: 3, date: '2024-01-22', time: '11:45', product: 'Azúcar 1kg', quantity: 3, price: 1.80, total: 5.40, client: 'Ana Rodríguez', seller: 'Pedro Martínez' },
  { id: 4, date: '2024-01-22', time: '12:20', product: 'Leche 1L', quantity: 10, price: 1.20, total: 12.00, client: 'Restaurante La Casa', seller: 'María Gómez' },
  { id: 5, date: '2024-01-22', time: '14:15', product: 'Café 500g', quantity: 2, price: 4.50, total: 9.00, client: 'Luis Fernández', seller: 'Pedro Martínez' },
  { id: 6, date: '2024-01-21', product: 'Frijoles 1kg', quantity: 8, price: 2.50, total: 20.00, client: 'Supermercado El Ahorro', seller: 'María Gómez' },
  { id: 7, date: '2024-01-21', product: 'Harina 1kg', quantity: 12, price: 1.90, total: 22.80, client: 'Panadería La Esperanza', seller: 'Pedro Martínez' },
  { id: 8, date: '2024-01-20', product: 'Atún en lata', quantity: 15, price: 2.80, total: 42.00, client: 'Comedor Popular', seller: 'María Gómez' },
  { id: 9, date: '2024-01-20', product: 'Huevos 30u', quantity: 5, price: 4.20, total: 21.00, client: 'Hotel Central', seller: 'Pedro Martínez' },
  { id: 10, date: '2024-01-19', product: 'Pasta 500g', quantity: 20, price: 1.30, total: 26.00, client: 'Escuela Primaria', seller: 'María Gómez' },
];

export const initialOrders = [
  { id: 1, date: '2024-01-22', supplier: 'Distribuidora Alimenticia', products: 'Arroz, Frijoles', total: 450.00, status: 'Pendiente', estimatedDelivery: '2024-01-25' },
  { id: 2, date: '2024-01-21', supplier: 'Aceitera Nacional', products: 'Aceite vegetal', total: 320.50, status: 'En tránsito', estimatedDelivery: '2024-01-23' },
  { id: 3, date: '2024-01-20', supplier: 'Lácteos Frescos', products: 'Leche, Queso', total: 280.75, status: 'Recibido', estimatedDelivery: '2024-01-22' },
  { id: 4, date: '2024-01-19', supplier: 'Café Selecto', products: 'Café 500g', total: 225.00, status: 'Pendiente', estimatedDelivery: '2024-01-26' },
  { id: 5, date: '2024-01-18', supplier: 'Importadora Dulce', products: 'Azúcar, Chocolate', total: 380.25, status: 'En tránsito', estimatedDelivery: '2024-01-24' },
  { id: 6, date: '2024-01-17', supplier: 'Pastas Italianas', products: 'Pasta 500g', total: 195.80, status: 'Recibido', estimatedDelivery: '2024-01-20' },
  { id: 7, date: '2024-01-16', supplier: 'Molino Central', products: 'Harina 1kg', total: 310.40, status: 'Pendiente', estimatedDelivery: '2024-01-27' },
  { id: 8, date: '2024-01-15', supplier: 'Granja Avícola', products: 'Huevos 30u', total: 420.00, status: 'En tránsito', estimatedDelivery: '2024-01-23' },
];