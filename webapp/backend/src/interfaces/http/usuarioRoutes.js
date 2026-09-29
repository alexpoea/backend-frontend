const express = require("express");

function crearUsuarioRoutes(usuarioService){ 
    const router = express.Router();


    // ==========================================
    // GET - Consultar todos los usuarios
    // ==========================================

    router.get("/usuarios", async (req, res) => {

        try {

            const usuarios =
                await usuarioService.obtenerUsuarios();

            res.status(200).json(usuarios);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                mensaje: "Error al consultar usuarios"
            });
        }
    });


    // ==========================================
    // POST - Registrar usuario
    // Body:
    // {
    //   "nombre": "...",
    //   "email": "...",
    //   "password": "..."
    // }
    // ==========================================

    router.post("/usuarios", async (req, res) => {

        try {

            const { nombre, email, password } = req.body;

            await usuarioService.registrar(
                nombre,
                email,
                password
            );

            res.status(201).json({
                mensaje: "Usuario registrado correctamente"
            });

        } catch (error) {

            console.error(error);

            if (error.code === "ER_DUP_ENTRY") {

                return res.status(409).json({
                    mensaje: "El correo electronico ya existe"
                });
            }

            res.status(
                error.statusCode || 500
            ).json({
                mensaje: error.message || "Error del servidor"
            });
        }
    });


    // ==========================================
    // DELETE - Eliminar usuario por ID
    // Ejemplo:
    // DELETE /usuarios/4
    // ==========================================

    router.delete("/usuarios/:id", async (req, res) => {

        try {

            const { id } = req.params;

            await usuarioService.eliminarUsuario(id);

            res.status(200).json({
                mensaje: "Usuario eliminado correctamente"
            });

        } catch (error) {

            console.error(error);

            res.status(
                error.statusCode || 500
            ).json({
                mensaje: error.message || "Error del servidor"
            });
        }
    });
	// ==========================================
// PUT - Actualizar usuario
// ==========================================

router.put("/usuarios/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nombre,
            email,
            password
        } = req.body;

        await usuarioService.actualizarUsuario(
            id,
            nombre,
            email,
            password
        );

        res.status(200).json({
            mensaje: "Usuario actualizado correctamente"
        });

    } catch (error) {

        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({
                mensaje: "El correo electronico ya existe"
            });
        }

        res.status(
            error.statusCode || 500
        ).json({
            mensaje: error.message || "Error del servidor"
        });
    }
});

    return router;
}

module.exports = crearUsuarioRoutes;
