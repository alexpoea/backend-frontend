const pool = require("./postgres");

class UsuarioRepository {

    async obtenerTodos() {
        const resultado = await pool.query(
            "SELECT id, nombre, email, rol FROM usuarios ORDER BY id"
        );

        return resultado.rows;
    }

    async buscarPorId(id) {
        const resultado = await pool.query(
            "SELECT id, nombre, email, rol FROM usuarios WHERE id = $1",
            [id]
        );

        return resultado.rows[0];
    }

    async crear(nombre, email, passwordHash, rol) {
        const resultado = await pool.query(
            `INSERT INTO usuarios
            (nombre, email, password_hash, rol)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nombre, email, rol`,
            [nombre, email, passwordHash, rol]
        );

        return resultado.rows[0];
    }

    async actualizar(id, nombre, email, passwordHash, rol) {
        const resultado = await pool.query(
            `UPDATE usuarios
            SET nombre = $1,
                email = $2,
                password_hash = $3,
                rol = $4
            WHERE id = $5
            RETURNING id, nombre, email, rol`,
            [nombre, email, passwordHash, rol, id]
        );

        return resultado.rows[0];
    }

    async eliminar(id) {
        const resultado = await pool.query(
            "DELETE FROM usuarios WHERE id = $1 RETURNING id",
            [id]
        );

        return resultado.rows[0];
    }
}

module.exports = UsuarioRepository;
