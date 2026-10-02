// Puertos de salida: contratos que los adaptadores concretos deben implementar.
export class UserRepository { create() { throw new Error('Not implemented'); } findByEmail() { throw new Error('Not implemented'); } findById() { throw new Error('Not implemented'); } list() { throw new Error('Not implemented'); } update() { throw new Error('Not implemented'); } remove() { throw new Error('Not implemented'); } }
export class ProductRepository { create() { throw new Error('Not implemented'); } findById() { throw new Error('Not implemented'); } list() { throw new Error('Not implemented'); } update() { throw new Error('Not implemented'); } remove() { throw new Error('Not implemented'); } }
export class OrderRepository { createWithStockCheck() { throw new Error('Not implemented'); } findById() { throw new Error('Not implemented'); } listForUser() { throw new Error('Not implemented'); } updateStatus() { throw new Error('Not implemented'); } remove() { throw new Error('Not implemented'); } }
export class PasswordHasher { hash() { throw new Error('Not implemented'); } compare() { throw new Error('Not implemented'); } }
// Puerto de salida: el caso de uso solicita notificaciones sin conocer el proveedor SMTP.
export class EmailServicePort { sendNewOrderNotifications() { throw new Error('Not implemented'); } }
