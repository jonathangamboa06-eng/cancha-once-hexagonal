export const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase();
export function validateRegistration({ name, email, password }) {
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) throw new Error('El nombre debe tener entre 2 y 100 caracteres.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) throw new Error('Correo electrónico no válido.');
  if (typeof password !== 'string' || password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) throw new Error('La contraseña requiere 10 caracteres, una mayúscula, una minúscula y un número.');
}
export function validateProduct({ name, price, stock }) {
  if (typeof name !== 'string' || !name.trim() || name.length > 140) throw new Error('El producto requiere nombre (máximo 140 caracteres).');
  if (!Number.isFinite(Number(price)) || Number(price) <= 0) throw new Error('El precio debe ser mayor a cero.');
  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) throw new Error('El inventario debe ser un entero no negativo.');
}
export function validateOrderLines(items) {
  if (!Array.isArray(items) || !items.length) throw new Error('El pedido requiere al menos un producto.');
  const quantities = new Map();
  for (const item of items) {
    const id = Number(item.productId), quantity = Number(item.quantity);
    if (!Number.isSafeInteger(id) || id < 1 || !Number.isInteger(quantity) || quantity < 1) throw new Error('Cada artículo requiere producto y cantidad válida.');
    quantities.set(id, (quantities.get(id) ?? 0) + quantity);
  }
  return [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
}
