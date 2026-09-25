import { normalizeEmail, validateOrderLines, validateProduct, validateRegistration } from '../domain/entities.js';
// Fábrica de casos de uso: los puertos se inyectan desde el punto de composición.
// Esta capa solo conoce contratos, entidades y reglas del dominio.
export function createUseCases({ users, products, orders, passwords, tokens }) {
const authService = {
  async createUser(input) { validateRegistration(input); const email=normalizeEmail(input.email); if(await users.findByEmail(email))throw Object.assign(new Error('Ese correo ya está registrado.'),{status:409}); return users.create({name:input.name,email,passwordHash:await passwords.hash(input.password)}); },
  async register(input) { const user=await this.createUser(input); return {user,token:tokens.sign(user)}; },
  async login(input) { const user=await users.findByEmail(normalizeEmail(input.email)); if(!user||!await passwords.compare(String(input.password??''),user.password_hash))throw Object.assign(new Error('Correo o contraseña incorrectos.'),{status:401}); const {password_hash,...safeUser}=user; return {user:safeUser,token:tokens.sign(user)}; },
};
const userService = {
  list:()=>users.list(), get:async id=>{const u=await users.findById(id);if(!u)throw Object.assign(new Error('Usuario no encontrado.'),{status:404});return u;},
  async update(id,p){if(p.name!==undefined&&(typeof p.name!=='string'||p.name.trim().length<2||p.name.length>100))throw new Error('Nombre inválido.');if(p.email!==undefined){const email=normalizeEmail(p.email);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Correo inválido.');const existing=await users.findByEmail(email);if(existing&&String(existing.id)!==String(id))throw Object.assign(new Error('Correo ya registrado.'),{status:409});p.email=email;}if(p.role&&!['customer','admin'].includes(p.role))throw new Error('Rol no válido.');const u=await users.update(id,p);if(!u)throw Object.assign(new Error('Usuario no encontrado.'),{status:404});return u;},
  async remove(id){try{if(!await users.remove(id))throw Object.assign(new Error('Usuario no encontrado.'),{status:404});}catch(e){if(e.code==='23503')throw Object.assign(new Error('No se puede eliminar un usuario con pedidos asociados.'),{status:409});throw e;}},
};
const productService = {
  list:()=>products.list(), get:async id=>{const p=await products.findById(id);if(!p)throw Object.assign(new Error('Producto no encontrado.'),{status:404});return p;},
  create:async p=>{validateProduct(p);return products.create(p);}, update:async(id,p)=>{const current=await products.findById(id);if(!current)throw Object.assign(new Error('Producto no encontrado.'),{status:404});validateProduct({...current,...p});return products.update(id,p);},
  async remove(id){try{if(!await products.remove(id))throw Object.assign(new Error('Producto no encontrado.'),{status:404});}catch(e){if(e.code==='23503')throw Object.assign(new Error('El producto pertenece a pedidos existentes y no se puede eliminar.'),{status:409});throw e;}},
};
const orderService = {
  create:async(userId,items)=>orders.createWithStockCheck(userId,validateOrderLines(items)),
  list:(userId,isAdmin)=>orders.listForUser(userId,isAdmin),
  async get(id,userId,isAdmin){const o=await orders.findById(id);if(!o)throw Object.assign(new Error('Pedido no encontrado.'),{status:404});if(!isAdmin&&String(o.user_id)!==String(userId))throw Object.assign(new Error('No tienes acceso a este pedido.'),{status:403});return o;},
  async update(id,userId,isAdmin,{status}){const o=await this.get(id,userId,isAdmin);if(!isAdmin&&!(status==='cancelled'&&o.status==='pending'))throw Object.assign(new Error('Solo puedes cancelar tus pedidos pendientes.'),{status:403});if(!['pending','paid','shipped','cancelled'].includes(status))throw new Error('Estado no válido.');if(o.status==='cancelled')throw new Error('Un pedido cancelado no puede reactivarse.');if(status==='cancelled'){if(!['pending','paid'].includes(o.status))throw new Error('Solo pueden cancelarse pedidos pendientes o pagados.');if(!await orders.cancel(id))throw new Error('No se pudo cancelar el pedido.');return {...o,status:'cancelled'};}const next={pending:'paid',paid:'shipped'}[o.status];if(status!==next)throw new Error(`Transición no permitida: ${o.status} → ${status}.`);const updated=await orders.updateStatus(id,status);if(!updated)throw Object.assign(new Error('Pedido no encontrado.'),{status:404});return updated;},
  async remove(id,userId,isAdmin){const o=await this.get(id,userId,isAdmin);if(!isAdmin&&o.status!=='pending')throw Object.assign(new Error('Solo puedes eliminar tus pedidos pendientes.'),{status:403});if(!await orders.remove(id))throw Object.assign(new Error('Pedido no encontrado.'),{status:404});},
};
return { authService, userService, productService, orderService };
}
