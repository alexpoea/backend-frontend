const pool = require("../database/mysql");

class UsuarioRepository {

    // Crear usuario
    async crear(usuario) {
        const [resultado] = await pool.query(
            `INSERT INTO usuarios
            (nombre, email, password_hash)
            VALUES (?, ?, ?)`,
            [
                usuario.nombre,
                usuario.email,
                usuario.passwordHash
            ]
        );

        return resultado;
    }


    // Obtener todos los usuarios
    async obtenerTodos() {
        const [usuarios] = await pool.query(
            "SELECT id, nombre, email FROM usuarios"
        );

        return usuarios;
    }


    // Buscar usuario por ID
    async buscarPorId(id) {
        const [usuarios] = await pool.query(
            "SELECT id, nombre, email FROM usuarios WHERE id = ?",
            [id]
        );

        return usuarios[0];
    }


    // Eliminar usuario
    async eliminar(id) {
        const [resultado] = await pool.query(
            "DELETE FROM usuarios WHERE id = ?",
            [id]
        );

        return resultado;
    }
// Actualizar usuario
async actualizar(id, nombre, email, passwordHash) {
    const [resultado] = await pool.query(
        `UPDATE usuarios
         SET nombre = ?, email = ?, password_hash = ?
         WHERE id = ?`,
        [
            nombre,
            email,
            passwordHash,
            id
        ]
    );

    return resultado;
}
}

module.exports = UsuarioRepository;
