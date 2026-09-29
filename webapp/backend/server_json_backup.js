const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());

// Permitir acceder a las imágenes
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

const PORT = 3000;


// ==========================================
// CONFIGURACIÓN PARA SUBIR IMÁGENES
// ==========================================

const almacenamiento = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(
            null,
            path.join(__dirname, "uploads/productos")
        );
    },

    filename: (req, file, cb) => {
        const nombre =
            Date.now() + "-" + file.originalname;

        cb(null, nombre);
    }
});

const subirImagen = multer({
    storage: almacenamiento
});


// ==========================================
// RUTAS DE ARCHIVOS JSON
// ==========================================

const usuariosPath = path.join(
    __dirname,
    "data",
    "usuarios.json"
);

const productosPath = path.join(
    __dirname,
    "data",
    "productos.json"
);

const pedidosPath = path.join(
    __dirname,
    "data",
    "pedidos.json"
);


// ==========================================
// FUNCIONES PARA USUARIOS
// ==========================================

function leerUsuarios() {
    return JSON.parse(
        fs.readFileSync(usuariosPath, "utf8")
    );
}

function guardarUsuarios(usuarios) {
    fs.writeFileSync(
        usuariosPath,
        JSON.stringify(usuarios, null, 2)
    );
}


// ==========================================
// FUNCIONES PARA PRODUCTOS
// ==========================================

function leerProductos() {
    return JSON.parse(
        fs.readFileSync(productosPath, "utf8")
    );
}

function guardarProductos(productos) {
    fs.writeFileSync(
        productosPath,
        JSON.stringify(productos, null, 2)
    );
}


// ==========================================
// FUNCIONES PARA PEDIDOS
// ==========================================

function leerPedidos() {
    return JSON.parse(
        fs.readFileSync(pedidosPath, "utf8")
    );
}

function guardarPedidos(pedidos) {
    fs.writeFileSync(
        pedidosPath,
        JSON.stringify(pedidos, null, 2)
    );
}


// ==========================================
// INICIO
// ==========================================

app.get("/", (req, res) => {
    res.json({
        mensaje: "API del Sistema de Ventas funcionando"
    });
});


// ==========================================
// USUARIOS
// ==========================================

// GET - Obtener usuarios
app.get("/usuarios", (req, res) => {
    const usuarios = leerUsuarios();

    res.json(usuarios);
});


// POST - Crear usuario
app.post("/usuarios", (req, res) => {
    const {
        nombre,
        email,
        password,
        rol
    } = req.body;

    if (!nombre || !email || !password || !rol) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    const usuarios = leerUsuarios();

    const nuevoUsuario = {
        id: usuarios.length + 1,
        nombre,
        email,
        password,
        rol
    };

    usuarios.push(nuevoUsuario);

    guardarUsuarios(usuarios);

    res.status(201).json({
        mensaje: "Usuario creado correctamente",
        usuario: nuevoUsuario
    });
});


// PUT - Editar usuario
app.put("/usuarios/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const {
        nombre,
        email,
        password,
        rol
    } = req.body;

    const usuarios = leerUsuarios();

    const indice = usuarios.findIndex(
        usuario => usuario.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensaje: "Usuario no encontrado"
        });
    }

    usuarios[indice] = {
        ...usuarios[indice],
        nombre,
        email,
        password,
        rol
    };

    guardarUsuarios(usuarios);

    res.json({
        mensaje: "Usuario actualizado correctamente",
        usuario: usuarios[indice]
    });
});


// DELETE - Eliminar usuario
app.delete("/usuarios/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const usuarios = leerUsuarios();

    const nuevosUsuarios = usuarios.filter(
        usuario => usuario.id !== id
    );

    if (usuarios.length === nuevosUsuarios.length) {
        return res.status(404).json({
            mensaje: "Usuario no encontrado"
        });
    }

    guardarUsuarios(nuevosUsuarios);

    res.json({
        mensaje: "Usuario eliminado correctamente"
    });
});


// ==========================================
// IMÁGENES DE PRODUCTOS
// ==========================================

// POST - Subir imagen
app.post(
    "/productos/imagen",
    subirImagen.single("imagen"),
    (req, res) => {

        if (!req.file) {
            return res.status(400).json({
                mensaje: "No se seleccionó ninguna imagen"
            });
        }

        const urlImagen =
            `http://localhost:3000/uploads/productos/${req.file.filename}`;

        res.json({
            mensaje: "Imagen subida correctamente",
            imagen: urlImagen
        });
    }
);


// ==========================================
// PRODUCTOS
// ==========================================

// GET - Obtener productos
app.get("/productos", (req, res) => {
    const productos = leerProductos();

    res.json(productos);
});


// POST - Crear producto
app.post("/productos", (req, res) => {

    const {
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        creadoPor,
        rolCreador
    } = req.body;

    if (
        !nombre ||
        !descripcion ||
        precio === undefined ||
        stock === undefined
    ) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    const productos = leerProductos();

    // Si lo crea el admin:
    // se acepta automáticamente.
    //
    // Si lo crea el cliente:
    // queda pendiente.

    let estado = "pendiente";

    if (rolCreador === "admin") {
        estado = "aceptado";
    }

    const nuevoProducto = {
        id: productos.length + 1,
        nombre,
        descripcion,
        precio: Number(precio),
        stock: Number(stock),
        imagen: imagen || "",
        creadoPor: creadoPor || null,
        rolCreador: rolCreador || "cliente",
        estado: estado
    };

    productos.push(nuevoProducto);

    guardarProductos(productos);

    res.status(201).json({
        mensaje: "Producto creado correctamente",
        producto: nuevoProducto
    });
});


// ==========================================
// EDITAR PRODUCTO
// ==========================================

app.put("/productos/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const {
        nombre,
        descripcion,
        precio,
        stock,
        imagen
    } = req.body;

    const productos = leerProductos();

    const indice = productos.findIndex(
        producto => producto.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    productos[indice] = {
        ...productos[indice],
        nombre,
        descripcion,
        precio: Number(precio),
        stock: Number(stock),
        imagen: imagen || ""
    };

    guardarProductos(productos);

    res.json({
        mensaje: "Producto actualizado correctamente",
        producto: productos[indice]
    });
});


// ==========================================
// ACEPTAR PRODUCTO
// ==========================================

app.put("/productos/:id/aceptar", (req, res) => {

    const id = parseInt(req.params.id);

    const productos = leerProductos();

    const indice = productos.findIndex(
        producto => producto.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    productos[indice].estado = "aceptado";

    guardarProductos(productos);

    res.json({
        mensaje: "Producto aceptado correctamente",
        producto: productos[indice]
    });
});


// ==========================================
// RECHAZAR PRODUCTO
// ==========================================

app.put("/productos/:id/rechazar", (req, res) => {

    const id = parseInt(req.params.id);

    const productos = leerProductos();

    const indice = productos.findIndex(
        producto => producto.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    productos[indice].estado = "rechazado";

    guardarProductos(productos);

    res.json({
        mensaje: "Producto rechazado correctamente",
        producto: productos[indice]
    });
});


// ==========================================
// ELIMINAR PRODUCTO
// ==========================================

app.delete("/productos/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const productos = leerProductos();

    const nuevosProductos = productos.filter(
        producto => producto.id !== id
    );

    if (productos.length === nuevosProductos.length) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    guardarProductos(nuevosProductos);

    res.json({
        mensaje: "Producto eliminado correctamente"
    });
});


// ==========================================
// PEDIDOS
// ==========================================

app.get("/pedidos", (req, res) => {

    const pedidos = leerPedidos();

    res.json(pedidos);
});


// ==========================================
// SERVIDOR
// ==========================================

app.listen(PORT, () => {

    console.log(
        `Servidor ejecutandose en http://localhost:${PORT}`
    );

});