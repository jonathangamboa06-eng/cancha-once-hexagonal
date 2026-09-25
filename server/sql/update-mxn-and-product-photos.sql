-- Migra el catálogo de demostración de USD a MXN y agrega fotos reales.
-- No modifica los totales históricos almacenados en pedidos.
UPDATE products SET price=1249.00,
  image_url='https://images.unsplash.com/photo-1721257001239-60fe6a768dbb?auto=format&fit=crop&w=900&q=85'
WHERE name='Balón Match Pro';
UPDATE products SET name='Playera Juego en Rojo',description='Playera ligera estilo clásico para animar desde la tribuna.',price=1699.00,
  image_url='https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=900&q=85'
WHERE name IN ('Camiseta Albiceleste 10','Playera Juego en Rojo');
UPDATE products SET category='Playeras' WHERE name='Playera Juego en Rojo';
UPDATE products SET name='Tenis Campo Control',description='Tenis para cancha con suela de tracción y ajuste firme.',price=2299.00,
  image_url='https://images.unsplash.com/photo-1612387049695-637b743f80ad?auto=format&fit=crop&w=900&q=85'
WHERE name IN ('Botines Cancha Firme','Tenis Campo Control');
UPDATE products SET category='Tenis' WHERE name='Tenis Campo Control';
UPDATE products SET price=849.00,
  image_url='https://images.unsplash.com/photo-1760177379284-b68471fdd217?auto=format&fit=crop&w=900&q=85'
WHERE name='Guantes Arquero Muro';
UPDATE products SET price=349.00 WHERE name='Espinilleras Defensor';
