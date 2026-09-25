# ⚽ Cancha Once — tienda de fútbol

Proyecto académico de comercio electrónico con Node.js + Express, PostgreSQL, React + Vite y arquitectura hexagonal. Incluye registro e inicio de sesión, catálogo, inventario y pedidos transaccionales.

## Estructura

```text
futbol-store/
├── docs/arquitectura.md          diagrama Mermaid y endpoints
├── server/
│   ├── sql/schema.sql            tablas, restricciones, índices y catálogo inicial
│   └── src/
│       ├── domain/               entidades y reglas puras
│       ├── application/          puertos y casos de uso
│       └── infrastructure/       Express, PostgreSQL y repositorios
└── client/
    └── src/{services,ui}/        cliente HTTP y SPA React
```

## Instalar en WSL (Ubuntu 24.04)

Abre Ubuntu/WSL y ejecuta los comandos. Si este directorio está en Windows, `cd` funciona sobre `/mnt/c`, aunque es más rápido instalar dependencias sobre el sistema de archivos Linux. Desde WSL:

```bash
cd /mnt/c/Users/L14\ \ GEN1/Documents/ChatGPT/peruano/futbol-store
# O copia primero el proyecto a Linux para obtener mejor rendimiento:
cp -r . ~/futbol-store && cd ~/futbol-store

sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres psql -c "CREATE USER futbol_app WITH PASSWORD 'CambiaEstaClaveSegura1';"
sudo -u postgres psql -c "CREATE DATABASE futbol_store OWNER futbol_app;"
sudo -u postgres psql -c "GRANT ALL ON SCHEMA public TO futbol_app;"
psql 'postgresql://futbol_app:CambiaEstaClaveSegura1@localhost:5432/futbol_store' -f server/sql/schema.sql
cp server/.env.example server/.env
```

Abre `server/.env` y pon la contraseña elegida en `DATABASE_URL`. Cambia `JWT_SECRET` por un secreto aleatorio largo:

```bash
openssl rand -hex 32
```

Copia el valor resultante a `JWT_SECRET`. En una terminal WSL instala y arranca la API; en otra, el frontend:

```bash
# Terminal 1 — API, http://localhost:3000
cd ~/futbol-store
npm install
npm run dev:server
```

```bash
# Terminal 2 — Vite, http://localhost:5173
cd ~/futbol-store
npm run dev:client
```

Abre `http://localhost:5173` desde el navegador de Windows. WSL 2 reenvía `localhost` al host. Comprueba la API en `http://localhost:3000/api/health`. Para el primer administrador, registra una cuenta normal en la web y asigna `admin` desde WSL:

```bash
sudo -u postgres psql futbol_store -c "UPDATE users SET role='admin' WHERE email='tu-correo@ejemplo.com';"
```

Cierra sesión y vuelve a ingresar para recibir el rol nuevo en el token.

## Crear la base paso a paso en WSL

1. Instala e inicia PostgreSQL: `sudo apt update && sudo apt install -y postgresql postgresql-contrib && sudo service postgresql start`.
2. Crea el usuario de aplicación: `sudo -u postgres psql -c "CREATE USER futbol_app WITH PASSWORD 'CambiaEstaClaveSegura1';"`.
3. Crea la base y concede acceso: `sudo -u postgres psql -c "CREATE DATABASE futbol_store OWNER futbol_app;"` y `sudo -u postgres psql -c "GRANT ALL ON SCHEMA public TO futbol_app;"`.
4. Crea las tablas, relaciones, restricciones, índices y cinco productos: `psql 'postgresql://futbol_app:CambiaEstaClaveSegura1@localhost:5432/futbol_store' -f server/sql/schema.sql`.
5. Configura `server/.env`, instala paquetes, inicia ambos servidores y visita `http://localhost:5173`.

El esquema SQL se puede volver a ejecutar: crea tablas e índices si faltan y carga el catálogo inicial solo cuando no hay productos.

## Despliegue en AWS cuando esté activo el laboratorio

1. En AWS Academy/Learner Lab, inicia sesión en la consola y confirma qué servicios/recursos permite el laboratorio. La disponibilidad varía según el curso y la cuenta.
2. En una VPC usa una instancia EC2 Ubuntu para Express y un RDS PostgreSQL con acceso público desactivado. Permite el puerto 5432 del RDS solo desde el grupo de seguridad de EC2.
3. Restringe el acceso web de EC2 a 80/443 y SSH a tu IP. Configura `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN` y `PORT` en un `.env` seguro del servidor; no guardes secretos en el repositorio.
4. Ejecuta `server/sql/schema.sql` contra el endpoint privado del RDS con `psql`. Compila Vite (`npm run build -w client`) y sirve `client/dist` con Nginx/HTTPS o un servicio estático. Alternativamente configura Nginx para publicar el cliente y reenviar `/api` a Express.
5. Configura un dominio/certificado TLS, health checks (`/api/health`) y reinicio automático del proceso (systemd o PM2). Valida las rutas y revisa las reglas de red antes de exponer el sitio.

No se despliega nada en AWS en esta actividad hasta que esté disponible el laboratorio y se conozcan sus permisos/cuotas.

## Moneda e imágenes

El catálogo usa precios de demostración en pesos mexicanos (MXN) y la SPA los formatea con `Intl.NumberFormat`. El catálogo y la portada muestran fotografías reales alojadas en Unsplash. Para usarlas se requiere conexión a internet; también puedes reemplazar las URL por imágenes locales con permiso de uso.

Créditos de fotografía: balón por [Max Titov](https://unsplash.com/photos/a-close-up-of-a-soccer-ball-on-a-field-gYFOFUnSBF0), playera por [Nelson Ndongala](https://unsplash.com/photos/red-and-white-adidas-fly-emirates-shirt-Z4RYz52ljts), guantes por [soonita omar](https://unsplash.com/photos/goalkeeper-gloves-resting-on-grass-near-a-net-Wtx4cku85Pg) y botines de la [colección de fútbol de Unsplash](https://unsplash.com/s/photos/soccer-boots). Las imágenes están publicadas bajo la [licencia Unsplash](https://unsplash.com/license).
