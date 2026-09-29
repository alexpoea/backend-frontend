const bcrypt = require("bcryptjs");

class UsuarioService {

    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // ==========================================
    // GET - Obtener todos los usuarios
    // ==========================================

    async obtenerUsuarios() {

        return await this.usuarioRepository.obtenerTodos();
    }


    // ==========================================
    // POST - Registrar usuario
    // ==========================================

    async registrar(nombre, email, password) {

        if (!nombre || !email || !password) {

            const error = new Error(
                "Todos los campos son obligatorios"
            );

            error.statusCode = 400;

            throw error;
        }

        const passwordHash =
            await bcrypt.hash(password, 10);

        const usuario = {
            nombre,
            email,
            passwordHash
        };

        return await this.usuarioRepository.crear(usuario);
    }


    // ==========================================
    // PUT - Actualizar usuario
    // ==========================================

    async actualizarUsuario(id, nombre, email, password) {

        if (!nombre || !email || !password) {

            const error = new Error(
                "Todos los campos son obligatorios"
            );

            error.statusCode = 400;

            throw error;
        }

        const usuario =
            await this.usuarioRepository.buscarPorId(id);

        if (!usuario) {

            const error = new Error(
                "Usuario no encontrado"
            );

            error.statusCode = 404;

            throw error;
        }

        const passwordHash =
            await bcrypt.hash(password, 10);

        return await this.usuarioRepository.actualizar(
            id,
            nombre,
            email,
            passwordHash
        );
    }


    // ==========================================
    // DELETE - Eliminar usuario
    // ==========================================

    async eliminarUsuario(id) {

        const usuario =
            await this.usuarioRepository.buscarPorId(id);

        if (!usuario) {

            const error = new Error(
                "Usuario no encontrado"
            );

            error.statusCode = 404;

            throw error;
        }

        return await this.usuarioRepository.eliminar(id);
    }
}


// ==========================================
// EXPORTAR SERVICIO
// ==========================================

module.exports = UsuarioService;
