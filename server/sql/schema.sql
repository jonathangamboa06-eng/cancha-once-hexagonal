BEGIN;
CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category VARCHAR(60) NOT NULL DEFAULT 'Accesorios',
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','shipped','cancelled')),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS order_items (
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price > 0),
  PRIMARY KEY (order_id, product_id)
);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items(product_id);
INSERT INTO products (name,description,category,price,stock,image_url)
SELECT * FROM (VALUES
 ('Balón Match Pro','Balón de entrenamiento y partido, talla 5.','Balones',1249.00,18,'https://images.unsplash.com/photo-1721257001239-60fe6a768dbb?auto=format&fit=crop&w=900&q=85'),
 ('Playera Juego en Rojo','Playera ligera estilo clásico para animar desde la tribuna.','Playeras',1699.00,12,'https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=900&q=85'),
 ('Tenis Campo Control','Tenis para cancha con suela de tracción y ajuste firme.','Tenis',2299.00,8,'https://images.unsplash.com/photo-1612387049695-637b743f80ad?auto=format&fit=crop&w=900&q=85'),
 ('Guantes Arquero Muro','Agarre de látex y muñequera ajustable.','Accesorios',849.00,15,'https://images.unsplash.com/photo-1760177379284-b68471fdd217?auto=format&fit=crop&w=900&q=85'),
 ('Espinilleras Defensor','Protección liviana para tus partidos.','Accesorios',349.00,24,'')
) AS seed(name,description,category,price,stock,image_url)
WHERE NOT EXISTS (SELECT 1 FROM products);
COMMIT;
