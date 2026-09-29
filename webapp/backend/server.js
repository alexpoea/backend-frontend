require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const pool = require("./database/postgres");

const app = express();

const upload = multer({
    storage: multer.memoryStorage()
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;


/* =====================================================
   INICIO
===================================================== */

app.get("/", (req, res) => {
    res.json({
        mensaje: "API del Sistema de Ventas funciona correctamente"
    });
});


/* =====================================================
   CONEXIÓN
===================================================== */

app.get("/conexion", async (req, res) => {

    try {

        const resultado = await pool.query(
            "SELECT NOW()"
        );

        res.json({
            mensaje: "Conexión a PostgreSQL correcta",
            fecha: resultado.rows[0].now
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error de conexión",
            error: error.message
        });
    }
});


/* =====================================================
   USUARIOS - GET
===================================================== */

app.get("/usuarios", async (req, res) => {

    try {

        const resultado = await pool.query(
            `SELECT
                id,
                nombre,
                email,
                rol
             FROM usuarios
             ORDER BY id`
        );

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener usuarios",
            error: error.message
        });
    }
});


/* =====================================================
   USUARIO POR ID
===================================================== */

app.get("/usuarios/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const resultado = await pool.query(
            `SELECT
                id,
                nombre,
                email,
                rol
             FROM usuarios
             WHERE id = $1`,
            [id]
        );

        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener usuario",
            error: error.message
        });
    }
});


/* =====================================================
   CREAR USUARIO
===================================================== */

app.post("/usuarios", async (req, res) => {

    try {

        const {
            nombre,
            email,
            password,
            rol
        } = req.body;

        if (!nombre || !email || !password) {

            return res.status(400).json({
                mensaje:
                    "Nombre, email y contraseña son obligatorios"
            });
        }

        const rolFinal =
            rol || "consulta";

        const existente = await pool.query(
            `SELECT id
             FROM usuarios
             WHERE email = $1`,
            [email]
        );

        if (existente.rows.length > 0) {

            return res.status(400).json({
                mensaje:
                    "El correo ya está registrado"
            });
        }

        const passwordHash =
            await bcrypt.hash(password, 10);

        const resultado = await pool.query(
            `INSERT INTO usuarios
            (
                nombre,
                email,
                password_hash,
                rol
            )
            VALUES
            ($1, $2, $3, $4)
            RETURNING
                id,
                nombre,
                email,
                rol`,
            [
                nombre,
                email,
                passwordHash,
                rolFinal
            ]
        );

        res.status(201).json(
            resultado.rows[0]
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error al crear usuario",
            error: error.message
        });
    }
});


/* =====================================================
   ACTUALIZAR USUARIO
===================================================== */

app.put("/usuarios/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nombre,
            email,
            password,
            rol
        } = req.body;

        if (!nombre || !email || !rol) {

            return res.status(400).json({
                mensaje:
                    "Nombre, email y rol son obligatorios"
            });
        }

        let resultado;

        if (
            password &&
            password.trim() !== ""
        ) {

            const passwordHash =
                await bcrypt.hash(
                    password,
                    10
                );

            resultado = await pool.query(
                `UPDATE usuarios
                 SET
                    nombre = $1,
                    email = $2,
                    password_hash = $3,
                    rol = $4
                 WHERE id = $5
                 RETURNING
                    id,
                    nombre,
                    email,
                    rol`,
                [
                    nombre,
                    email,
                    passwordHash,
                    rol,
                    id
                ]
            );

        } else {

            resultado = await pool.query(
                `UPDATE usuarios
                 SET
                    nombre = $1,
                    email = $2,
                    rol = $3
                 WHERE id = $4
                 RETURNING
                    id,
                    nombre,
                    email,
                    rol`,
                [
                    nombre,
                    email,
                    rol,
                    id
                ]
            );
        }

        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensaje:
                    "Usuario no encontrado"
            });
        }

        res.json(
            resultado.rows[0]
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al actualizar usuario",
            error: error.message
        });
    }
});


/* =====================================================
   ELIMINAR USUARIO
===================================================== */

app.delete("/usuarios/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM usuarios
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensaje:
                    "Usuario no encontrado"
            });
        }

        res.json({
            mensaje:
                "Usuario eliminado correctamente"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al eliminar usuario",
            error: error.message
        });
    }
});


/* =====================================================
   LOGIN
===================================================== */

app.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                mensaje:
                    "Email y contraseña son obligatorios"
            });
        }

        const resultado = await pool.query(
            `SELECT
                id,
                nombre,
                email,
                password_hash,
                rol
             FROM usuarios
             WHERE email = $1`,
            [email]
        );

        if (resultado.rows.length === 0) {

            return res.status(401).json({
                mensaje:
                    "Email o contraseña incorrectos"
            });
        }

        const usuario =
            resultado.rows[0];

        const passwordCorrecta =
            await bcrypt.compare(
                password,
                usuario.password_hash
            );

        if (!passwordCorrecta) {

            return res.status(401).json({
                mensaje:
                    "Email o contraseña incorrectos"
            });
        }

        res.json({

            mensaje:
                "Inicio de sesión correcto",

            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al iniciar sesión",
            error: error.message
        });
    }
});


/* =====================================================
   PRODUCTOS - GET
   IMAGEN LOCAL O URL
===================================================== */

app.get("/productos", async (req, res) => {

    try {

        const resultado = await pool.query(
            `SELECT
                id,
                nombre,
                descripcion,
                precio,
                stock,
                estado,
                creado_por,

                CASE

                    WHEN imagen IS NOT NULL
                         AND octet_length(imagen) > 0
                    THEN
                        'data:image/jpeg;base64,' ||
                        encode(imagen, 'base64')

                    WHEN imagen_url IS NOT NULL
                         AND TRIM(imagen_url) <> ''
                    THEN
                        imagen_url

                    ELSE
                        NULL

                END AS imagen

             FROM productos

             ORDER BY id`
        );

        res.json(
            resultado.rows
        );

    } catch (error) {

        console.error(
            "ERROR AL OBTENER PRODUCTOS:",
            error
        );

        res.status(500).json({
            mensaje:
                "Error al obtener productos",
            error: error.message
        });
    }
});


/* =====================================================
   PRODUCTO POR ID
===================================================== */

app.get("/productos/:id", async (req, res) => {

    try {

        const { id } =
            req.params;

        const resultado =
            await pool.query(
                `SELECT
                    id,
                    nombre,
                    descripcion,
                    precio,
                    stock,
                    estado,
                    creado_por,

                    CASE

                        WHEN imagen IS NOT NULL
                             AND octet_length(imagen) > 0
                        THEN
                            'data:image/jpeg;base64,' ||
                            encode(imagen, 'base64')

                        WHEN imagen_url IS NOT NULL
                             AND TRIM(imagen_url) <> ''
                        THEN
                            imagen_url

                        ELSE
                            NULL

                    END AS imagen

                 FROM productos

                 WHERE id = $1`,
                [id]
            );

        if (
            resultado.rows.length === 0
        ) {

            return res.status(404).json({
                mensaje:
                    "Producto no encontrado"
            });
        }

        res.json(
            resultado.rows[0]
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al obtener producto",
            error: error.message
        });
    }
});


/* =====================================================
   CREAR PRODUCTO
   LOCAL / URL / SIN IMAGEN
===================================================== */

app.post(
    "/productos",
    upload.single("imagen"),
    async (req, res) => {

        try {

            console.log(
                "\n========== CREAR PRODUCTO =========="
            );

            console.log(
                "BODY:",
                req.body
            );

            console.log(
                "ARCHIVO:",
                req.file
                    ? req.file.originalname
                    : "SIN ARCHIVO"
            );

            const {
                nombre,
                descripcion,
                precio,
                stock,
                creadoPor
            } = req.body;

            /*
             * IMPORTANTE:
             * multer coloca los campos enviados
             * con FormData dentro de req.body.
             */

            const imagenUrl =
                req.body.imagenUrl
                    ? req.body.imagenUrl.trim()
                    : "";

            console.log(
                "URL RECIBIDA:",
                imagenUrl
            );

            if (
                !nombre ||
                !precio ||
                !creadoPor
            ) {

                return res.status(400).json({
                    mensaje:
                        "Nombre, precio y creador son obligatorios"
                });
            }

            /* ==========================================
               BUSCAR USUARIO
            ========================================== */

            const usuario =
                await pool.query(
                    `SELECT rol
                     FROM usuarios
                     WHERE id = $1`,
                    [creadoPor]
                );

            if (
                usuario.rows.length === 0
            ) {

                return res.status(404).json({
                    mensaje:
                        "Usuario creador no encontrado"
                });
            }

            /* ==========================================
               ESTADO DEL PRODUCTO
            ========================================== */

            let estado =
                "pendiente";

            if (
                usuario.rows[0].rol ===
                "admin"
            ) {

                estado =
                    "aceptado";
            }

            let resultado;

            /* ==========================================
               IMAGEN LOCAL
            ========================================== */

            if (req.file) {

                console.log(
                    "GUARDANDO IMAGEN LOCAL"
                );

                resultado =
                    await pool.query(
                        `INSERT INTO productos
                        (
                            nombre,
                            descripcion,
                            precio,
                            stock,
                            estado,
                            imagen,
                            imagen_url,
                            creado_por
                        )
                        VALUES
                        (
                            $1,
                            $2,
                            $3,
                            $4,
                            $5,
                            $6,
                            NULL,
                            $7
                        )
                        RETURNING
                            id,
                            nombre,
                            descripcion,
                            precio,
                            stock,
                            estado,
                            creado_por,
                            imagen_url`,
                        [
                            nombre,
                            descripcion || "",
                            precio,
                            stock || 0,
                            estado,
                            req.file.buffer,
                            creadoPor
                        ]
                    );
            }

            /* ==========================================
               IMAGEN POR URL
            ========================================== */

            else if (
                imagenUrl !== ""
            ) {

                console.log(
                    "GUARDANDO IMAGEN POR URL:"
                );

                console.log(
                    imagenUrl
                );

                resultado =
                    await pool.query(
                        `INSERT INTO productos
                        (
                            nombre,
                            descripcion,
                            precio,
                            stock,
                            estado,
                            imagen,
                            imagen_url,
                            creado_por
                        )
                        VALUES
                        (
                            $1,
                            $2,
                            $3,
                            $4,
                            $5,
                            NULL,
                            $6,
                            $7
                        )
                        RETURNING
                            id,
                            nombre,
                            descripcion,
                            precio,
                            stock,
                            estado,
                            creado_por,
                            imagen_url`,
                        [
                            nombre,
                            descripcion || "",
                            precio,
                            stock || 0,
                            estado,
                            imagenUrl,
                            creadoPor
                        ]
                    );
            }

            /* ==========================================
               SIN IMAGEN
            ========================================== */

            else {

                console.log(
                    "PRODUCTO SIN IMAGEN"
                );

                resultado =
                    await pool.query(
                        `INSERT INTO productos
                        (
                            nombre,
                            descripcion,
                            precio,
                            stock,
                            estado,
                            imagen,
                            imagen_url,
                            creado_por
                        )
                        VALUES
                        (
                            $1,
                            $2,
                            $3,
                            $4,
                            $5,
                            NULL,
                            NULL,
                            $6
                        )
                        RETURNING
                            id,
                            nombre,
                            descripcion,
                            precio,
                            stock,
                            estado,
                            creado_por,
                            imagen_url`,
                        [
                            nombre,
                            descripcion || "",
                            precio,
                            stock || 0,
                            estado,
                            creadoPor
                        ]
                    );
            }

            console.log(
                "PRODUCTO GUARDADO:",
                resultado.rows[0]
            );

            res.status(201).json({

                mensaje:
                    "Producto creado correctamente",

                producto:
                    resultado.rows[0]

            });

        } catch (error) {

            console.error(
                "ERROR AL CREAR PRODUCTO:",
                error
            );

            res.status(500).json({
                mensaje:
                    "Error al crear producto",
                error: error.message
            });
        }
    }
);


/* =====================================================
   ACTUALIZAR PRODUCTO
===================================================== */

app.put(
    "/productos/:id",
    upload.single("imagen"),
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const {
                nombre,
                descripcion,
                precio,
                stock
            } = req.body;

            const imagenUrl =
                req.body.imagenUrl
                    ? req.body.imagenUrl.trim()
                    : "";

            if (
                !nombre ||
                precio === undefined ||
                stock === undefined
            ) {

                return res.status(400).json({
                    mensaje:
                        "Nombre, precio y stock son obligatorios"
                });
            }

            let resultado;

            /* ==========================================
               NUEVA IMAGEN LOCAL
            ========================================== */

            if (req.file) {

                resultado =
                    await pool.query(
                        `UPDATE productos

                         SET
                            nombre = $1,
                            descripcion = $2,
                            precio = $3,
                            stock = $4,
                            imagen = $5,
                            imagen_url = NULL

                         WHERE id = $6

                         RETURNING
                            id,
                            nombre,
                            descripcion,
                            precio,
                            stock,
                            estado,
                            creado_por,
                            imagen_url`,
                        [
                            nombre,
                            descripcion || "",
                            precio,
                            stock,
                            req.file.buffer,
                            id
                        ]
                    );
            }

            /* ==========================================
               NUEVA IMAGEN URL
            ========================================== */

            else if (
                imagenUrl !== ""
            ) {

                resultado =
                    await pool.query(
                        `UPDATE productos

                         SET
                            nombre = $1,
                            descripcion = $2,
                            precio = $3,
                            stock = $4,
                            imagen = NULL,
                            imagen_url = $5

                         WHERE id = $6

                         RETURNING
                            id,
                            nombre,
                            descripcion,
                            precio,
                            stock,
                            estado,
                            creado_por,
                            imagen_url`,
                        [
                            nombre,
                            descripcion || "",
                            precio,
                            stock,
                            imagenUrl,
                            id
                        ]
                    );
            }

            /* ==========================================
               CONSERVAR IMAGEN
            ========================================== */

            else {

                resultado =
                    await pool.query(
                        `UPDATE productos

                         SET
                            nombre = $1,
                            descripcion = $2,
                            precio = $3,
                            stock = $4

                         WHERE id = $5

                         RETURNING
                            id,
                            nombre,
                            descripcion,
                            precio,
                            stock,
                            estado,
                            creado_por,
                            imagen_url`,
                        [
                            nombre,
                            descripcion || "",
                            precio,
                            stock,
                            id
                        ]
                    );
            }

            if (
                resultado.rows.length === 0
            ) {

                return res.status(404).json({
                    mensaje:
                        "Producto no encontrado"
                });
            }

            res.json({

                mensaje:
                    "Producto actualizado correctamente",

                producto:
                    resultado.rows[0]

            });

        } catch (error) {

            console.error(
                "ERROR AL ACTUALIZAR PRODUCTO:",
                error
            );

            res.status(500).json({
                mensaje:
                    "Error al actualizar producto",
                error: error.message
            });
        }
    }
);


/* =====================================================
   ACEPTAR PRODUCTO
===================================================== */

app.put(
    "/productos/:id/aceptar",
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const resultado =
                await pool.query(
                    `UPDATE productos

                     SET estado = 'aceptado'

                     WHERE id = $1

                     RETURNING
                        id,
                        nombre,
                        descripcion,
                        precio,
                        stock,
                        estado,
                        creado_por,
                        imagen_url`,
                    [id]
                );

            if (
                resultado.rows.length === 0
            ) {

                return res.status(404).json({
                    mensaje:
                        "Producto no encontrado"
                });
            }

            console.log(
                "PRODUCTO ACEPTADO:",
                resultado.rows[0]
            );

            res.json({

                mensaje:
                    "Producto aceptado y publicado correctamente",

                producto:
                    resultado.rows[0]

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                mensaje:
                    "Error al aceptar producto",
                error: error.message
            });
        }
    }
);


/* =====================================================
   RECHAZAR PRODUCTO
===================================================== */

app.put(
    "/productos/:id/rechazar",
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const resultado =
                await pool.query(
                    `UPDATE productos

                     SET estado = 'rechazado'

                     WHERE id = $1

                     RETURNING
                        id,
                        nombre,
                        descripcion,
                        precio,
                        stock,
                        estado,
                        creado_por,
                        imagen_url`,
                    [id]
                );

            if (
                resultado.rows.length === 0
            ) {

                return res.status(404).json({
                    mensaje:
                        "Producto no encontrado"
                });
            }

            console.log(
                "PRODUCTO RECHAZADO:",
                resultado.rows[0]
            );

            res.json({

                mensaje:
                    "Producto rechazado correctamente",

                producto:
                    resultado.rows[0]

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                mensaje:
                    "Error al rechazar producto",
                error: error.message
            });
        }
    }
);


/* =====================================================
   ELIMINAR PRODUCTO
===================================================== */

app.delete(
    "/productos/:id",
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const resultado =
                await pool.query(
                    `DELETE FROM productos
                     WHERE id = $1
                     RETURNING id`,
                    [id]
                );

            if (
                resultado.rows.length === 0
            ) {

                return res.status(404).json({
                    mensaje:
                        "Producto no encontrado"
                });
            }

            res.json({
                mensaje:
                    "Producto eliminado correctamente"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                mensaje:
                    "Error al eliminar producto",
                error: error.message
            });
        }
    }
);


/* =====================================================
   PEDIDOS - GET
===================================================== */

app.get("/pedidos", async (req, res) => {

    try {

        const pedidos =
            await pool.query(
                `SELECT
                    p.id,
                    p.usuario_id,
                    u.nombre AS usuario,
                    p.fecha,
                    p.total,
                    p.estado

                 FROM pedidos p

                 INNER JOIN usuarios u
                 ON p.usuario_id = u.id

                 ORDER BY p.id`
            );

        const resultadoFinal = [];

        for (
            const pedido
            of pedidos.rows
        ) {

            const productos =
                await pool.query(
                    `SELECT
                        pp.producto_id,
                        pr.nombre,
                        pp.cantidad,
                        pp.precio

                     FROM pedido_productos pp

                     INNER JOIN productos pr
                     ON pp.producto_id = pr.id

                     WHERE pp.pedido_id = $1`,
                    [pedido.id]
                );

            resultadoFinal.push({

                ...pedido,

                productos:
                    productos.rows

            });
        }

        res.json(
            resultadoFinal
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al obtener pedidos",
            error: error.message
        });
    }
});


/* =====================================================
   PEDIDO POR ID
===================================================== */

app.get("/pedidos/:id", async (req, res) => {

    try {

        const { id } =
            req.params;

        const pedido =
            await pool.query(
                `SELECT
                    p.id,
                    p.usuario_id,
                    u.nombre AS usuario,
                    u.email,
                    p.fecha,
                    p.total,
                    p.estado

                 FROM pedidos p

                 INNER JOIN usuarios u
                 ON p.usuario_id = u.id

                 WHERE p.id = $1`,
                [id]
            );

        if (
            pedido.rows.length === 0
        ) {

            return res.status(404).json({
                mensaje:
                    "Pedido no encontrado"
            });
        }

        const productos =
            await pool.query(
                `SELECT
                    pp.producto_id,
                    pr.nombre,
                    pp.cantidad,
                    pp.precio

                 FROM pedido_productos pp

                 INNER JOIN productos pr
                 ON pp.producto_id = pr.id

                 WHERE pp.pedido_id = $1`,
                [id]
            );

        res.json({

            ...pedido.rows[0],

            productos:
                productos.rows

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al obtener pedido",
            error: error.message
        });
    }
});


/* =====================================================
   CREAR PEDIDO
===================================================== */

app.post("/pedidos", async (req, res) => {

    const cliente =
        await pool.connect();

    try {

        const {
            usuario_id,
            productos
        } = req.body;

        if (
            !usuario_id ||
            !Array.isArray(productos) ||
            productos.length === 0
        ) {

            return res.status(400).json({
                mensaje:
                    "El usuario y los productos son obligatorios"
            });
        }

        await cliente.query(
            "BEGIN"
        );

        const usuario =
            await cliente.query(
                `SELECT id
                 FROM usuarios
                 WHERE id = $1`,
                [usuario_id]
            );

        if (
            usuario.rows.length === 0
        ) {

            await cliente.query(
                "ROLLBACK"
            );

            return res.status(404).json({
                mensaje:
                    "Usuario no encontrado"
            });
        }

        let total = 0;

        const productosProcesados = [];

        for (
            const item
            of productos
        ) {

            const producto =
                await cliente.query(
                    `SELECT
                        id,
                        nombre,
                        precio,
                        stock

                     FROM productos

                     WHERE id = $1

                     FOR UPDATE`,
                    [item.producto_id]
                );

            if (
                producto.rows.length === 0
            ) {

                throw new Error(
                    `Producto ${item.producto_id} no encontrado`
                );
            }

            const datosProducto =
                producto.rows[0];

            if (
                datosProducto.stock <
                item.cantidad
            ) {

                throw new Error(
                    `Stock insuficiente para ${datosProducto.nombre}`
                );
            }

            total +=
                Number(
                    datosProducto.precio
                ) *
                Number(
                    item.cantidad
                );

            productosProcesados.push({

                ...datosProducto,

                cantidad:
                    item.cantidad

            });
        }

        const pedido =
            await cliente.query(
                `INSERT INTO pedidos
                (
                    usuario_id,
                    total
                )
                VALUES
                ($1, $2)
                RETURNING
                    id,
                    usuario_id,
                    fecha,
                    total,
                    estado`,
                [
                    usuario_id,
                    total
                ]
            );

        const pedidoCreado =
            pedido.rows[0];

        for (
            const producto
            of productosProcesados
        ) {

            await cliente.query(
                `INSERT INTO pedido_productos
                (
                    pedido_id,
                    producto_id,
                    cantidad,
                    precio
                )
                VALUES
                ($1, $2, $3, $4)`,
                [
                    pedidoCreado.id,
                    producto.id,
                    producto.cantidad,
                    producto.precio
                ]
            );

            await cliente.query(
                `UPDATE productos

                 SET stock =
                     stock - $1

                 WHERE id = $2`,
                [
                    producto.cantidad,
                    producto.id
                ]
            );
        }

        await cliente.query(
            "COMMIT"
        );

        res.status(201).json({

            mensaje:
                "Pedido creado correctamente",

            pedido:
                pedidoCreado

        });

    } catch (error) {

        await cliente.query(
            "ROLLBACK"
        );

        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al crear pedido",
            error: error.message
        });

    } finally {

        cliente.release();
    }
});


/* =====================================================
   ACTUALIZAR PEDIDO
===================================================== */

app.put(
    "/pedidos/:id",
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const { estado } =
                req.body;

            if (!estado) {

                return res.status(400).json({
                    mensaje:
                        "El estado es obligatorio"
                });
            }

            const resultado =
                await pool.query(
                    `UPDATE pedidos

                     SET estado = $1

                     WHERE id = $2

                     RETURNING
                        id,
                        usuario_id,
                        fecha,
                        total,
                        estado`,
                    [
                        estado,
                        id
                    ]
                );

            if (
                resultado.rows.length === 0
            ) {

                return res.status(404).json({
                    mensaje:
                        "Pedido no encontrado"
                });
            }

            res.json({

                mensaje:
                    "Pedido actualizado correctamente",

                pedido:
                    resultado.rows[0]

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                mensaje:
                    "Error al actualizar pedido",
                error: error.message
            });
        }
    }
);


/* =====================================================
   ELIMINAR PEDIDO
===================================================== */

app.delete(
    "/pedidos/:id",
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const resultado =
                await pool.query(
                    `DELETE FROM pedidos
                     WHERE id = $1
                     RETURNING id`,
                    [id]
                );

            if (
                resultado.rows.length === 0
            ) {

                return res.status(404).json({
                    mensaje:
                        "Pedido no encontrado"
                });
            }

            res.json({
                mensaje:
                    "Pedido eliminado correctamente"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                mensaje:
                    "Error al eliminar pedido",
                error: error.message
            });
        }
    }
);


/* =====================================================
   SERVIDOR
===================================================== */

app.listen(
    PORT,
    () => {

        console.log(
            `Servidor ejecutandose en http://localhost:${PORT}`
        );

    }
);