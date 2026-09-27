# Taller 3 - Sistema de Ventas

Sistema web desarrollado como proyecto de Taller 3 utilizando React + Vite en el frontend y Node.js + Express + PostgreSQL en el backend.

El sistema permite administrar usuarios, productos y pedidos mediante una API REST y una interfaz web.

## Tecnologías utilizadas

* React
* Vite
* JavaScript
* CSS
* Node.js
* Express
* PostgreSQL
* REST API
* Git y GitHub

## Requisitos

Antes de ejecutar el proyecto se debe tener instalado:

* Node.js
* PostgreSQL
* Git
* Visual Studio Code (recomendado)

Se recomienda utilizar una versión reciente de Node.js.

## Estructura del proyecto

```text
taller3/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── webapp/
│   └── backend/
│       ├── database/
│       ├── server.js
│       ├── package.json
│       └── .env
│
└── README.md
```

## Base de datos

El proyecto utiliza PostgreSQL.

La base de datos utilizada es:

```text
sistema_ventas
```

Las principales tablas son:

* `usuarios`
* `productos`
* `pedidos`
* `pedido_productos`

La tabla `pedido_productos` relaciona los pedidos con los productos.

### Configuración de PostgreSQL

Se debe tener PostgreSQL instalado y crear la base de datos `sistema_ventas`.

El backend utiliza variables de entorno para conectarse a PostgreSQL.

Ejemplo de configuración:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA
DB_NAME=sistema_ventas
DB_PORT=5432
PORT=3000
```

> No se debe subir el archivo `.env` a GitHub. Cada usuario debe crear su propio archivo `.env` con sus datos de PostgreSQL.

## Instalación del backend

Abrir una terminal y entrar a la carpeta del backend:

```bash
cd webapp/backend
```

Instalar las dependencias:

```bash
npm install
```

Después configurar el archivo `.env` con los datos de PostgreSQL.

Para iniciar el servidor:

```bash
node server.js
```

Si todo funciona correctamente, aparecerá un mensaje similar a:

```text
Servidor ejecutandose en http://localhost:3000
```

El backend utiliza el puerto:

```text
3000
```

## Instalación del frontend

Abrir una segunda terminal.

Desde la carpeta principal del proyecto:

```bash
cd frontend
```

Instalar las dependencias:

```bash
npm install
```

Después iniciar React con Vite:

```bash
npm run dev
```

Vite mostrará una dirección similar a:

```text
http://localhost:5173
```

Abrir esa dirección en el navegador.

## ¿Cómo funciona el sistema?

El sistema está dividido en frontend y backend.

### Frontend

El frontend está desarrollado con React + Vite.

Desde la interfaz se pueden realizar las operaciones del sistema dependiendo del rol del usuario.

### Backend

El backend está desarrollado con Node.js y Express.

Su función es recibir las solicitudes del frontend, procesar la información y comunicarse con PostgreSQL.

La API utiliza diferentes rutas para usuarios, productos y pedidos.

## Roles del sistema

El sistema cuenta con tres roles:

### Administrador

El administrador puede:

* Gestionar usuarios.
* Crear productos.
* Editar productos.
* Eliminar productos.
* Consultar productos.
* Revisar productos registrados por proveedores.
* Aceptar productos.
* Rechazar productos.

### Proveedor

El proveedor puede:

* Registrar productos.
* Consultar sus productos.
* Consultar el estado de sus productos.
* Ver productos publicados.

Los productos registrados por un proveedor quedan inicialmente en estado:

```text
pendiente
```

Después el administrador puede aceptarlos o rechazarlos.

### Cliente

El cliente puede:

* Consultar los productos publicados.
* Visualizar información de los productos.

El cliente no puede administrar usuarios ni productos.

## Estados de los productos

Los productos pueden tener diferentes estados:

```text
pendiente
aceptado
rechazado
```

### Producto pendiente

Es un producto registrado por un proveedor que todavía no ha sido revisado por el administrador.

### Producto aceptado

El administrador aprobó el producto y puede aparecer como producto publicado.

### Producto rechazado

El administrador decidió rechazar el producto. El registro permanece en la base de datos.

## Flujo principal

```text
Proveedor
    ↓
Registra producto
    ↓
Producto pendiente
    ↓
Administrador revisa
    ↓
 ┌───────────────┐
 ↓               ↓
Aceptar       Rechazar
 ↓               ↓
Publicado      Rechazado
```

Los productos creados directamente por el administrador pueden quedar publicados.

## API

El backend proporciona una API REST para trabajar con los datos.

### Usuarios

```text
GET    /usuarios
POST   /usuarios
PUT    /usuarios/:id
DELETE /usuarios/:id
POST   /login
```

### Productos

```text
GET    /productos
GET    /productos/:id
POST   /productos
PUT    /productos/:id
DELETE /productos/:id
PUT    /productos/:id/aceptar
PUT    /productos/:id/rechazar
```

### Pedidos

```text
GET    /pedidos
GET    /pedidos/:id
POST   /pedidos
PUT    /pedidos/:id
DELETE /pedidos/:id
```

## Inicio completo del proyecto

Para utilizar el sistema se deben tener ejecutándose dos procesos.

### Terminal 1 - Backend

```bash
cd webapp/backend
npm install
node server.js
```

### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm run dev
```

Después abrir en el navegador la dirección proporcionada por Vite, normalmente:

```text
http://localhost:5173
```

## Seguridad

Las contraseñas de los usuarios no se almacenan directamente. El backend utiliza `bcryptjs` para generar un hash antes de guardar la contraseña en PostgreSQL.

El archivo `.env` contiene información de conexión y debe mantenerse fuera del repositorio.

## GitHub

El código fuente del proyecto se encuentra almacenado en GitHub.

Para obtener el proyecto:

```bash
git clone https://github.com/alexpoea/backend-frontend.git
```

Después entrar a la carpeta:

```bash
cd backend-frontend
```

Instalar las dependencias del backend:

```bash
cd webapp/backend
npm install
```

Y las dependencias del frontend:

```bash
cd ../../frontend
npm install
```

Finalmente se debe configurar PostgreSQL y crear el archivo `.env` del backend antes de iniciar el servidor.
