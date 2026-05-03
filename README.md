# Artesanías Colombianas — Tienda en Línea

Aplicación web completa para la venta de artesanías colombianas.  
**Backend:** Node.js + Express + MySQL · **Frontend:** React + Vite

---

## Estructura del proyecto

```
artesanias-colombianas/
├── backend/          ← API REST (Express + MySQL)
└── frontend/         ← SPA (React + Vite)
```

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18.x |
| npm | 9.x |
| MySQL | 8.0 |

---

## 1. Configurar la base de datos MySQL

### Crear la base de datos

```sql
CREATE DATABASE artesanias_colombianas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'artesanias'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON artesanias_colombianas.* TO 'artesanias'@'localhost';
FLUSH PRIVILEGES;
```

### Ejecutar la migración (crea todas las tablas)

```bash
cd backend
npm install
node src/models/migrate.js
```

Esto crea las siguientes tablas del modelo ER:

| Tabla | Descripción |
|---|---|
| `customers` | Clientes registrados (email, password, datos personales, rol) |
| `products` | Catálogo de productos (sku, nombre, precio, stock, imagen) |
| `categories` | Categorías de productos |
| `product_categories` | Relación N:M producto ↔ categoría |
| `options` | Opciones de producto (talla, color, etc.) |
| `product_options` | Relación N:M producto ↔ opción |
| `orders` | Órdenes de compra con estado y datos de envío |
| `order_details` | Líneas de detalle de cada orden |
| `cart_items` | Carrito de compras por cliente (sesión persistente) |

---

## 2. Configurar el backend

```bash
cd backend
cp .env.example .env
```

Edita `.env` con tus valores:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173

JWT_SECRET=cambia-esto-por-una-clave-segura-larga
JWT_EXPIRES_IN=8h

DB_HOST=localhost
DB_PORT=3306
DB_USER=artesanias
DB_PASSWORD=tu_password
DB_NAME=artesanias_colombianas

EXTERNAL_API_BASE=https://mdiapiqa.gesyco.co/api/v1
COMPANY_ID=2

PAYMENT_API_BASE=https://tu-api-de-pagos.ngrok-free.app/api/v1
```

```bash
npm run dev     # desarrollo (nodemon)
npm start       # producción
```

El servidor arranca en **http://localhost:3001**

---

## 3. Configurar el frontend

```bash
cd frontend
npm install
npm run dev
```

La app arranca en **http://localhost:5173**  
El proxy de Vite redirige `/api/*` → `http://localhost:3001` automáticamente.

---

## API — Endpoints disponibles

### Autenticación

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Registro de nuevo cliente |
| `POST` | `/api/auth/login` | No | Login · devuelve JWT |
| `GET` | `/api/auth/me` | JWT | Ver perfil propio |
| `PUT` | `/api/auth/me` | JWT | Actualizar perfil propio |

**Registro** — cuerpo:
```json
{
  "full_name": "Isabella Morales",
  "email": "isabella@ejemplo.com",
  "password": "MiPass1",
  "confirm_password": "MiPass1",
  "phone": "3107696991"
}
```

**Login** — cuerpo:
```json
{ "email": "isabella@ejemplo.com", "password": "MiPass1" }
```

**Respuesta login:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": 1, "email": "...", "name": "...", "role": "customer" }
}
```

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

---

### Productos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/products` | JWT | Listar (local + API externa) |
| `GET` | `/api/products/:id` | JWT | Ver detalle |
| `POST` | `/api/products` | JWT + Admin | Crear producto |
| `PUT` | `/api/products/:id` | JWT + Admin | Editar producto |
| `DELETE` | `/api/products/:id` | JWT + Admin | Eliminar producto |

Query params de `GET /api/products`:
- `source`: `all` \| `local` \| `external`
- `section`: `getTop` \| `getRecommended` \| `getByCompany`
- `category`: nombre de categoría
- `page` y `limit` (paginación)

**Crear producto** — cuerpo:
```json
{
  "sku": "MUE-001",
  "name": "Muñeco artesanal",
  "price": 85000,
  "stock": 15,
  "weight": 0.3,
  "description": "Muñeco tejido a mano",
  "category": "Muñecos",
  "image": "https://..."
}
```

---

### Categorías

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/categories` | JWT |
| `GET` | `/api/categories/:id` | JWT |
| `POST` | `/api/categories` | JWT + Admin |
| `PUT` | `/api/categories/:id` | JWT + Admin |
| `DELETE` | `/api/categories/:id` | JWT + Admin |

---

### Carrito

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/cart` | JWT | Ver carrito |
| `POST` | `/api/cart` | JWT | Agregar/aumentar item |
| `PUT` | `/api/cart/:itemId` | JWT | Cambiar cantidad |
| `DELETE` | `/api/cart/:itemId` | JWT | Eliminar item |
| `DELETE` | `/api/cart` | JWT | Vaciar carrito |

**Agregar item:**
```json
{
  "product_id": 5,
  "quantity": 2,
  "price": 85000,
  "product_name": "Muñecos",
  "sku": "MUE-001"
}
```

---

### Órdenes

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/orders` | JWT | Crear orden (vacía el carrito) |
| `GET` | `/api/orders` | JWT | Mis órdenes (admin: todas) |
| `GET` | `/api/orders/:id` | JWT | Detalle de orden |
| `PATCH` | `/api/orders/:id/status` | JWT + Admin | Cambiar estado |
| `DELETE` | `/api/orders/:id` | JWT | Cancelar (solo si está pendiente) |

**Crear orden:**
```json
{
  "items": [
    { "product_id": 1, "quantity": 2, "price": 85000, "sku": "MUE-001" }
  ],
  "shipping_address": "Manzana 4 casa 35",
  "barrio": "Corpomecavi",
  "city": "Puerto Gaitán - Meta",
  "payment_method": "efectivo",
  "shipping_cost": 8000,
  "shipping_company": "Barbachos"
}
```

Estados válidos: `pendiente` → `pagado` → `enviado` → `entregado` | `cancelado`

Métodos de pago válidos: `efectivo`, `tarjeta`, `telefono`, `nequi`, `daviplata`, `bancolombia`, `dale`

---

### Clientes (solo Admin)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/customers` | Listar todos |
| `GET` | `/api/customers/:id` | Ver cliente con sus órdenes |
| `PUT` | `/api/customers/:id` | Editar datos o cambiar rol |
| `DELETE` | `/api/customers/:id` | Eliminar cliente |

---

### Pago

| Método | Ruta | Auth |
|---|---|---|
| `POST` | `/api/payment` | JWT |

**Pago con tarjeta:**
```json
{
  "method": "tarjeta",
  "amount": 222000,
  "card": {
    "number": "4111111111111111",
    "holder": "ISABELLA MORALES",
    "expiry_month": "12",
    "expiry_year": "2027",
    "cvv": "456",
    "type": "VISA"
  }
}
```

**Pago efectivo / Nequi / Daviplata:**
```json
{
  "method": "efectivo",
  "amount": 222000,
  "phone_number": "3107696991"
}
```

---

## Modelo Entidad-Relación

```
customers ──< orders ──< order_details >── products
                │
                └── cart_items

categories ──< product_categories >── products

options ──< product_options >── products
```

---

## Pantallas del frontend

### Cliente
| Ruta | Pantalla |
|---|---|
| `/login` | Inicio de sesión |
| `/registro` | Registro de nuevo usuario |
| `/recuperar` | Recuperar contraseña |
| `/verificar` | Verificación por código OTP |
| `/` | Catálogo con filtros y buscador |
| `/producto/:id` | Detalle de producto + agregar al carrito |
| `/carrito` | Carrito + checkout 5 pasos |
| `/mis-pedidos` | Historial de órdenes |
| `/perfil` | Editar datos personales |

### Admin
| Ruta | Pantalla |
|---|---|
| `/admin/inventario` | CRUD de productos (crear/editar/eliminar) |
| `/admin/ventas` | Crear venta manual con búsqueda de productos |
| `/admin/clientes` | Tabla de clientes |
| `/admin/usuarios` | Gestión de usuarios con tarjetas |
| `/admin/envios` | Gestión de estados de envío |
| `/admin/reportes` | KPIs, gráficas y últimas órdenes |

---

## Estructura del backend

```
backend/
├── .env.example
├── package.json
└── src/
    ├── index.js                      ← punto de entrada, monta rutas
    ├── models/
    │   ├── db.js                     ← pool MySQL (query, run, queryOne, transaction)
    │   └── migrate.js                ← crea las tablas (npm run db:migrate)
    ├── middleware/
    │   ├── auth.js                   ← requireAuth, requireAdmin
    │   └── validate.js               ← validación de campos
    ├── validators/
    │   ├── auth.validators.js
    │   ├── product.validators.js
    │   └── order.validators.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── products.controller.js
    │   ├── categories.controller.js
    │   ├── cart.controller.js
    │   ├── orders.controller.js
    │   ├── customers.controller.js
    │   └── payment.controller.js
    └── routes/
        ├── auth.js
        ├── products.js
        ├── categories.js
        ├── cart.js
        ├── orders.js
        ├── customers.js
        └── payment.js
```

## Estructura del frontend

```
frontend/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx                       ← rutas React Router
    ├── styles/global.css             ← design tokens y utilidades
    ├── services/api.js               ← capa de llamadas HTTP
    ├── context/
    │   ├── AuthContext.jsx           ← estado global de autenticación
    │   └── CartContext.jsx           ← estado global del carrito
    ├── components/index.jsx          ← Header, Sidebar, Layout, ProductCard, etc.
    └── pages/
        ├── Login.jsx
        ├── Register.jsx
        ├── Recuperar.jsx
        ├── Verificar.jsx
        ├── Home.jsx
        ├── ProductDetail.jsx
        ├── Cart.jsx                  ← checkout 5 pasos
        ├── MisPedidos.jsx
        ├── Perfil.jsx
        └── admin/
            ├── Inventario.jsx
            ├── CrearVenta.jsx
            ├── Clientes.jsx
            ├── Usuarios.jsx
            ├── Envios.jsx
            └── Reportes.jsx
```

---

## Comandos de referencia rápida

> **Nota:** Si ya tienes la BD creada, vuelve a correr `node src/models/migrate.js` para agregar las columnas nuevas (`vendedor_id`, `nombre_cliente`, etc.) via ALTER TABLE automático.

```bash
# Instalar todo y levantar en desarrollo
cd backend  && npm install && npm run db:migrate && npm run dev
cd frontend && npm install && npm run dev

# Construir frontend para producción
cd frontend && npm run build

# Ver logs del backend
npm run dev   # nodemon con hot reload
```

---

## Usuarios base (creados automáticamente al migrar)

Al ejecutar `node src/models/migrate.js` se crean dos usuarios de prueba:

| Rol      | Email                     | Contraseña  |
|----------|---------------------------|-------------|
| Admin    | admin@artesanias.com      | Admin123    |
| Sale     | vendedor@artesanias.com   | Vendedor123 |
| Customer | cliente@artesanias.com    | Cliente123  |


### Permisos por rol

| Vista            | Admin | Sale | Customer |
|------------------|:-----:|:----:|:--------:|
| Inventario (ver) | ✅    | ✅   | ❌       |
| Inventario (CRUD)| ✅    | ❌   | ❌       |
| Crear Venta      | ✅    | ✅   | ❌       |
| Clientes (ver/editar)| ✅ | ✅  | ❌       |
| Clientes (eliminar)| ✅  | ❌   | ❌       |
| Envíos           | ✅    | ✅   | ❌       |
| Reportes         | ✅    | ✅   | ❌       |
| Usuarios         | ✅    | ❌   | ❌       |
| Catálogo/Carrito | ❌    | ❌   | ✅       |

> **⚠️ Cambia estas contraseñas en producción.**

Cuando el admin crea un usuario desde `/admin/usuarios` sin especificar contraseña, se asigna automáticamente la contraseña **`Temporal123`**. El admin debe avisarle al nuevo usuario para que la cambie desde su perfil.

---

## Logs del servidor

El backend registra todos los eventos en **`backend/logs/app.log`**:

```
[2026-05-02T04:30:00.000Z] INFO  [server] API corriendo en http://localhost:3001
[2026-05-02T04:30:05.000Z] INFO  [http]   GET /api/products → 200 (45ms)
[2026-05-02T04:30:06.000Z] ERROR [products.update] Bind parameters must not contain undefined...
```

- **INFO** — requests normales y operaciones exitosas
- **WARN** — errores 4xx (cliente) y API externa no disponible
- **ERROR** — errores 5xx con stack trace completo

Los logs se acumulan en el archivo. Para limpiarlos:
```bash
# Windows
type nul > backend\logs\app.log

# Linux / Mac
> backend/logs/app.log
```

---

## Estructura del frontend (arquitectura empresarial)

```
frontend/src/
├── assets/
│   ├── icons/          ← íconos PNG (carrito, lupa, redes, etc.)
│   └── images/         ← imágenes (logo, banner, categorías)
├── components/         ← Componentes reutilizables, cada uno con su CSS
│   ├── Navbar/
│   │   ├── Navbar.jsx
│   │   └── Navbar.css
│   ├── Sidebar/
│   │   ├── Sidebar.jsx
│   │   └── Sidebar.css
│   ├── Footer/
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   ├── FilterBar/
│   │   ├── FilterBar.jsx
│   │   └── FilterBar.css
│   ├── ProductCard/
│   │   ├── ProductCard.jsx
│   │   └── ProductCard.css
│   ├── Stars/
│   │   ├── Stars.jsx
│   │   └── Stars.css
│   ├── QtyControl/
│   │   ├── QtyControl.jsx
│   │   └── QtyControl.css
│   ├── Spinner/
│   │   ├── Spinner.jsx
│   │   └── Spinner.css
│   ├── Modal/
│   │   ├── Modal.jsx
│   │   └── Modal.css
│   ├── Toast/
│   │   ├── Toast.jsx      ← incluye useToast hook
│   │   └── Toast.css
│   └── index.js           ← barrel de exportaciones
├── config/
│   ├── constants.js    ← datos de contacto, tiendas
│   └── theme.js        ← paleta de colores
├── context/
│   ├── AuthContext.jsx ← estado global auth (login, logout, register)
│   └── CartContext.jsx ← estado global carrito
├── hooks/              ← hooks personalizados futuros
├── layouts/
│   ├── MainLayout.jsx  ← Navbar + Sidebar + FilterBar + Footer + Toast
│   └── MainLayout.css
├── pages/
│   ├── auth/           ← páginas sin layout (pantalla completa)
│   │   ├── Auth.css    ← CSS compartido de auth
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Recuperar.jsx
│   │   └── Verificar.jsx
│   ├── customer/       ← páginas del cliente (usan MainLayout)
│   │   ├── Home.jsx  + Home.css
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── MisPedidos.jsx
│   │   └── Perfil.jsx  + Perfil.css
│   └── admin/          ← páginas admin (usan MainLayout)
│       ├── Admin.css   ← CSS compartido admin
│       ├── Inventario.jsx
│       ├── CrearVenta.jsx
│       ├── Clientes.jsx
│       ├── Usuarios.jsx
│       ├── Envios.jsx
│       └── Reportes.jsx
├── services/
│   └── api.js          ← capa HTTP hacia el backend
├── styles/
│   └── global.css      ← variables CSS globales y utilidades base
├── App.jsx             ← rutas React Router
└── main.jsx            ← punto de entrada
```

### Por qué esta estructura

- **Un CSS por componente**: el scope es local, sin colisiones de clases.
- **Barrel `components/index.js`**: `import { Spinner, fmt } from '../../components'` en lugar de rutas largas.
- **Layouts separados**: `MainLayout` monta Navbar + Sidebar + Footer + Toast una sola vez; las páginas solo pasan `children`.
- **Estados individuales en formularios**: `useState` por campo (no `useState` con objeto + `.map()`) elimina el bug donde React desmonta/monta inputs al redefinir subcomponentes internos.
