import { pool, transaction } from './postgres.js';
const userColumns = 'id,name,email,role,created_at';
export const users = {
  async create({ name,email,passwordHash }) { const { rows } = await pool.query(`INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING ${userColumns}`,[name.trim(),email,passwordHash]); return rows[0]; },
  async findByEmail(email) { const { rows } = await pool.query('SELECT * FROM users WHERE email=$1',[email]); return rows[0]; },
  async findById(id) { const { rows } = await pool.query(`SELECT ${userColumns} FROM users WHERE id=$1`,[id]); return rows[0]; },
  async list() { return (await pool.query(`SELECT ${userColumns} FROM users ORDER BY id`)).rows; },
  async update(id,{name,email,role}) { const { rows }=await pool.query(`UPDATE users SET name=COALESCE($2,name),email=COALESCE($3,email),role=COALESCE($4,role) WHERE id=$1 RETURNING ${userColumns}`,[id,name?.trim()||null,email||null,role||null]);return rows[0]; },
  async remove(id) { return (await pool.query('DELETE FROM users WHERE id=$1 RETURNING id',[id])).rowCount>0; },
};
export const products = {
  async create(p) { return (await pool.query('INSERT INTO products(name,description,category,price,stock,image_url) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[p.name.trim(),p.description||'',p.category||'Accesorios',p.price,p.stock,p.imageUrl||''])).rows[0]; },
  async findById(id) { return (await pool.query('SELECT * FROM products WHERE id=$1',[id])).rows[0]; },
  async list() { return (await pool.query('SELECT * FROM products ORDER BY id')).rows; },
  async update(id,p) { return (await pool.query('UPDATE products SET name=COALESCE($2,name),description=COALESCE($3,description),category=COALESCE($4,category),price=COALESCE($5,price),stock=COALESCE($6,stock),image_url=COALESCE($7,image_url) WHERE id=$1 RETURNING *',[id,p.name?.trim()||null,p.description??null,p.category??null,p.price??null,p.stock??null,p.imageUrl??null])).rows[0]; },
  async remove(id) { return (await pool.query('DELETE FROM products WHERE id=$1 RETURNING id',[id])).rowCount>0; },
};
export const orders = {
  async createWithStockCheck(userId,items) {
    return transaction(async db => {
      let total=0; const snapshots=[];
      for (const item of items) {
        const found=await db.query('SELECT id,name,price,stock FROM products WHERE id=$1 FOR UPDATE',[item.productId]);
        const product=found.rows[0]; if(!product) throw Object.assign(new Error(`No existe el producto ${item.productId}.`),{status:404});
        if(product.stock<item.quantity) throw Object.assign(new Error(`Stock insuficiente para ${product.name}.`),{status:409});
        const price=Number(product.price); total+=price*item.quantity; snapshots.push({...item,price});
      }
      const { rows }=await db.query('INSERT INTO orders(user_id,total) VALUES($1,$2) RETURNING *',[userId,total.toFixed(2)]);
      const order=rows[0];
      for(const item of snapshots){ await db.query('UPDATE products SET stock=stock-$2 WHERE id=$1',[item.productId,item.quantity]); await db.query('INSERT INTO order_items(order_id,product_id,quantity,unit_price) VALUES($1,$2,$3,$4)',[order.id,item.productId,item.quantity,item.price]); }
      return this.findById(order.id,db);
    });
  },
  async findById(id,db=pool) { const { rows }=await db.query(`SELECT o.id,o.user_id,o.status,o.total,o.created_at,COALESCE(json_agg(json_build_object('productId',i.product_id,'name',p.name,'quantity',i.quantity,'unitPrice',i.unit_price)) FILTER (WHERE i.order_id IS NOT NULL),'[]') AS items FROM orders o LEFT JOIN order_items i ON i.order_id=o.id LEFT JOIN products p ON p.id=i.product_id WHERE o.id=$1 GROUP BY o.id`,[id]);return rows[0]; },
  async listForUser(userId,isAdmin) { const { rows }=await pool.query(`SELECT o.id,o.user_id,o.status,o.total,o.created_at,COALESCE(json_agg(json_build_object('productId',i.product_id,'name',p.name,'quantity',i.quantity,'unitPrice',i.unit_price)) FILTER (WHERE i.order_id IS NOT NULL),'[]') AS items FROM orders o LEFT JOIN order_items i ON i.order_id=o.id LEFT JOIN products p ON p.id=i.product_id ${isAdmin?'':'WHERE o.user_id=$1'} GROUP BY o.id ORDER BY o.created_at DESC`,isAdmin?[]:[userId]);return rows; },
  async updateStatus(id,status) { return (await pool.query('UPDATE orders SET status=$2 WHERE id=$1 RETURNING *',[id,status])).rows[0]; },
  async cancel(id) { return transaction(async db=>{const found=await db.query("SELECT id,status FROM orders WHERE id=$1 FOR UPDATE",[id]);if(!found.rows[0])return false;if(found.rows[0].status!=='cancelled'){const items=(await db.query('SELECT product_id,quantity FROM order_items WHERE order_id=$1',[id])).rows;for(const i of items)await db.query('UPDATE products SET stock=stock+$2 WHERE id=$1',[i.product_id, i.quantity]);await db.query("UPDATE orders SET status='cancelled' WHERE id=$1",[id]);}return true;}); },
  async remove(id) { return transaction(async db=>{const found=await db.query("SELECT id,status FROM orders WHERE id=$1 FOR UPDATE",[id]);if(!found.rows[0])return false;if(found.rows[0].status==='pending'){const items=(await db.query('SELECT product_id,quantity FROM order_items WHERE order_id=$1',[id])).rows;for(const i of items)await db.query('UPDATE products SET stock=stock+$2 WHERE id=$1',[i.product_id,i.quantity]);}await db.query('DELETE FROM orders WHERE id=$1',[id]);return true;}); },
};
