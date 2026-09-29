const pool = require("./database/postgres");

async function probarConexion() {
    try {
        const resultado = await pool.query("SELECT NOW()");
        console.log("Conexión a PostgreSQL correcta");
        console.log(resultado.rows[0]);
    } catch (error) {
        console.error("Error de conexión:", error.message);
    } finally {
        await pool.end();
    }
}

probarConexion();
