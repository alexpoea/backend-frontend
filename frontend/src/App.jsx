import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:3000";

function App() {

  /* =========================
     LOGIN
  ========================= */

  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [usuarioLogin, setUsuarioLogin] = useState(null);
  const [mensajeLogin, setMensajeLogin] = useState("");

  /* =========================
     CAPTCHA
  ========================= */

  const [captcha, setCaptcha] = useState("");
  const [captchaUsuario, setCaptchaUsuario] = useState("");

  const generarCaptcha = () => {
    const caracteres =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    let nuevoCaptcha = "";

    for (let i = 0; i < 5; i++) {
      const posicion = Math.floor(
        Math.random() * caracteres.length
      );

      nuevoCaptcha += caracteres[posicion];
    }

    setCaptcha(nuevoCaptcha);
    setCaptchaUsuario("");
  };

  useEffect(() => {
    generarCaptcha();
  }, []);

  /* =========================
     USUARIOS
  ========================= */

  const [usuarios, setUsuarios] = useState([]);
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("cliente");
  const [editandoId, setEditandoId] = useState(null);

  /* =========================
     PRODUCTOS
  ========================= */

  const [productos, setProductos] = useState([]);

  const [mostrarProductos, setMostrarProductos] =
    useState(false);

  const [mostrarPublicados, setMostrarPublicados] =
    useState(false);

  const [mostrarPendientes, setMostrarPendientes] =
    useState(false);

  const [mostrarRechazados, setMostrarRechazados] =
    useState(false);

  const [mostrarMisProductos, setMostrarMisProductos] =
    useState(false);

  const [nombreProducto, setNombreProducto] =
    useState("");

  const [descripcion, setDescripcion] =
    useState("");

  const [precio, setPrecio] =
    useState("");

  const [stock, setStock] =
    useState("");

  /* =========================
     IMAGEN
  ========================= */

  const [imagen, setImagen] =
    useState(null);

  const [imagenUrl, setImagenUrl] =
    useState("");

  const [tipoImagen, setTipoImagen] =
    useState("local");

  const [editandoProductoId, setEditandoProductoId] =
    useState(null);

  const [productoSeleccionado, setProductoSeleccionado] =
    useState(null);

  /* =========================
     ROLES
  ========================= */

  const esAdmin =
    usuarioLogin?.rol === "admin";

  const esProveedor =
    usuarioLogin?.rol === "proveedor";

  const esCliente =
    usuarioLogin?.rol === "cliente";

  /* =========================
     CARGAR USUARIOS
  ========================= */

  const cargarUsuarios = async () => {
    try {
      const respuesta = await fetch(
        `${API}/usuarios`
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
          "Error al cargar usuarios"
        );
      }

      setUsuarios(datos);

    } catch (error) {
      console.error(error);
      alert("Error al cargar usuarios");
    }
  };

  /* =========================
     CARGAR PRODUCTOS
  ========================= */

  const cargarProductos = async () => {
    try {
      const respuesta = await fetch(
        `${API}/productos`
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
          "Error al cargar productos"
        );
      }

      console.log(
        "PRODUCTOS RECIBIDOS:",
        datos
      );

      setProductos(datos);

    } catch (error) {
      console.error(error);
      alert("Error al cargar productos");
    }
  };

  /* =========================
     LOGIN
  ========================= */

  const iniciarSesion = async (e) => {
    e.preventDefault();

    setMensajeLogin("");

    if (captchaUsuario.trim() !== captcha) {
      setMensajeLogin(
        "CAPTCHA incorrecto"
      );

      generarCaptcha();
      return;
    }

    try {
      const respuesta = await fetch(
        `${API}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: emailLogin,
            password: passwordLogin
          })
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensajeLogin(
          datos.mensaje ||
          "Correo o contraseña incorrectos"
        );

        generarCaptcha();
        return;
      }

      setUsuarioLogin(
        datos.usuario
      );

      setEmailLogin("");
      setPasswordLogin("");
      setCaptchaUsuario("");

      if (datos.usuario.rol === "admin") {
        cargarUsuarios();
      }

    } catch (error) {
      console.error(error);

      setMensajeLogin(
        "Error al conectar con el servidor"
      );
    }
  };

  /* =========================
     CERRAR SESIÓN
  ========================= */

  const cerrarSesion = () => {
    setUsuarioLogin(null);

    setMostrarUsuarios(false);
    setMostrarProductos(false);
    setMostrarPublicados(false);
    setMostrarPendientes(false);
    setMostrarRechazados(false);
    setMostrarMisProductos(false);

    limpiarUsuario();
    limpiarProducto();

    generarCaptcha();
  };

  /* =========================
     GUARDAR USUARIO
     SOLO ADMIN
  ========================= */

  const guardarUsuario = async (e) => {
    e.preventDefault();

    if (!esAdmin) {
      alert(
        "No tienes permisos para gestionar usuarios"
      );
      return;
    }

    if (!nombre || !email) {
      alert(
        "Completa el nombre y correo"
      );
      return;
    }

    if (!editandoId && !password) {
      alert(
        "La contraseña es obligatoria"
      );
      return;
    }

    try {

      const datosUsuario = {
        nombre,
        email,
        rol
      };

      if (password.trim() !== "") {
        datosUsuario.password =
          password;
      }

      let respuesta;

      if (editandoId) {

        respuesta = await fetch(
          `${API}/usuarios/${editandoId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify(
              datosUsuario
            )
          }
        );

      } else {

        respuesta = await fetch(
          `${API}/usuarios`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify(
              datosUsuario
            )
          }
        );
      }

      const datos =
        await respuesta.json();

      if (!respuesta.ok) {
        alert(
          datos.mensaje ||
          "Error al guardar usuario"
        );
        return;
      }

      alert(
        editandoId
          ? "Usuario actualizado correctamente"
          : "Usuario registrado correctamente"
      );

      limpiarUsuario();
      cargarUsuarios();

    } catch (error) {
      console.error(error);

      alert(
        "Error al guardar usuario"
      );
    }
  };

  /* =========================
     EDITAR USUARIO
  ========================= */

  const editarUsuario = (usuario) => {

    if (!esAdmin) {
      alert(
        "No tienes permisos para editar usuarios"
      );
      return;
    }

    setNombre(
      usuario.nombre
    );

    setEmail(
      usuario.email
    );

    setPassword("");

    setRol(
      usuario.rol
    );

    setEditandoId(
      usuario.id
    );
  };

  /* =========================
     ELIMINAR USUARIO
  ========================= */

  const eliminarUsuario = async (id) => {

    if (!esAdmin) {
      alert(
        "No tienes permisos para eliminar usuarios"
      );
      return;
    }

    const confirmar =
      window.confirm(
        "¿Seguro que deseas eliminar este usuario?"
      );

    if (!confirmar) {
      return;
    }

    try {

      const respuesta =
        await fetch(
          `${API}/usuarios/${id}`,
          {
            method: "DELETE"
          }
        );

      const datos =
        await respuesta.json();

      if (!respuesta.ok) {
        alert(
          datos.mensaje ||
          "Error al eliminar usuario"
        );
        return;
      }

      alert(
        "Usuario eliminado correctamente"
      );

      cargarUsuarios();

    } catch (error) {
      console.error(error);

      alert(
        "Error al eliminar usuario"
      );
    }
  };

  /* =========================
     LIMPIAR USUARIO
  ========================= */

  const limpiarUsuario = () => {

    setNombre("");
    setEmail("");
    setPassword("");
    setRol("cliente");
    setEditandoId(null);
  };

  /* =========================
     GUARDAR PRODUCTO
     ADMIN + PROVEEDOR
  ========================= */

  const guardarProducto = async (e) => {

    e.preventDefault();

    if (!esAdmin && !esProveedor) {
      alert(
        "Los clientes no pueden subir productos"
      );
      return;
    }

    if (
      !nombreProducto.trim() ||
      !precio ||
      !usuarioLogin
    ) {
      alert(
        "Completa los datos obligatorios"
      );
      return;
    }

    const formData =
      new FormData();

    formData.append(
      "nombre",
      nombreProducto.trim()
    );

    formData.append(
      "descripcion",
      descripcion
    );

    formData.append(
      "precio",
      precio
    );

    formData.append(
      "stock",
      stock || "0"
    );

    formData.append(
      "creadoPor",
      usuarioLogin.id
    );

    /* =========================
       IMAGEN LOCAL
    ========================= */

    if (
      tipoImagen === "local" &&
      imagen
    ) {

      console.log(
        "ENVIANDO IMAGEN LOCAL:",
        imagen.name
      );

      formData.append(
        "imagen",
        imagen
      );
    }

    /* =========================
       IMAGEN URL
    ========================= */

    if (
      tipoImagen === "url" &&
      imagenUrl.trim() !== ""
    ) {

      console.log(
        "ENVIANDO URL:",
        imagenUrl.trim()
      );

      formData.append(
        "imagenUrl",
        imagenUrl.trim()
      );
    }

    console.log(
      "========== GUARDAR PRODUCTO =========="
    );

    for (
      const [clave, valor]
      of formData.entries()
    ) {
      console.log(
        "FORMDATA:",
        clave,
        valor
      );
    }

    try {

      let respuesta;

      /* =========================
         EDITAR
      ========================= */

      if (editandoProductoId) {

        if (!esAdmin) {
          alert(
            "Solo el administrador puede editar productos"
          );
          return;
        }

        respuesta =
          await fetch(
            `${API}/productos/${editandoProductoId}`,
            {
              method: "PUT",
              body: formData
            }
          );

      }

      /* =========================
         CREAR
      ========================= */

      else {

        respuesta =
          await fetch(
            `${API}/productos`,
            {
              method: "POST",
              body: formData
            }
          );
      }

      const datos =
        await respuesta.json();

      console.log(
        "RESPUESTA DEL SERVIDOR:",
        datos
      );

      if (!respuesta.ok) {

        alert(
          datos.mensaje ||
          "Error al guardar producto"
        );

        return;
      }

      if (editandoProductoId) {

        alert(
          "Producto actualizado correctamente"
        );

      } else if (esAdmin) {

        alert(
          "Producto creado y publicado correctamente"
        );

      } else {

        alert(
          "Producto creado y enviado al administrador para revisión"
        );
      }

      limpiarProducto();

      await cargarProductos();

    } catch (error) {

      console.error(
        "ERROR AL GUARDAR PRODUCTO:",
        error
      );

      alert(
        "Error al guardar producto"
      );
    }
  };

  /* =========================
     EDITAR PRODUCTO
     SOLO ADMIN
  ========================= */

  const editarProducto = (producto) => {

    if (!esAdmin) {
      alert(
        "Solo el administrador puede editar productos"
      );
      return;
    }

    setNombreProducto(
      producto.nombre || ""
    );

    setDescripcion(
      producto.descripcion || ""
    );

    setPrecio(
      producto.precio || ""
    );

    setStock(
      producto.stock || ""
    );

    setImagen(null);
    setImagenUrl("");

    if (
      producto.imagen &&
      producto.imagen.startsWith(
        "data:"
      )
    ) {

      setTipoImagen(
        "local"
      );

    } else if (
      producto.imagen &&
      (
        producto.imagen.startsWith(
          "http://"
        ) ||
        producto.imagen.startsWith(
          "https://"
        )
      )
    ) {

      setTipoImagen(
        "url"
      );

      setImagenUrl(
        producto.imagen
      );

    } else {

      setTipoImagen(
        "local"
      );
    }

    setEditandoProductoId(
      producto.id
    );

    setMostrarProductos(true);
    setMostrarUsuarios(false);
    setMostrarPublicados(false);
    setMostrarPendientes(false);
    setMostrarRechazados(false);
    setMostrarMisProductos(false);
  };

  /* =========================
     ELIMINAR PRODUCTO
     SOLO ADMIN
  ========================= */

  const eliminarProducto = async (id) => {

    if (!esAdmin) {
      alert(
        "Solo el administrador puede eliminar productos"
      );
      return;
    }

    const confirmar =
      window.confirm(
        "¿Seguro que deseas eliminar este producto?"
      );

    if (!confirmar) {
      return;
    }

    try {

      const respuesta =
        await fetch(
          `${API}/productos/${id}`,
          {
            method: "DELETE"
          }
        );

      const datos =
        await respuesta.json();

      if (!respuesta.ok) {

        alert(
          datos.mensaje ||
          "Error al eliminar producto"
        );

        return;
      }

      alert(
        "Producto eliminado correctamente"
      );

      cargarProductos();

    } catch (error) {

      console.error(error);

      alert(
        "Error al eliminar producto"
      );
    }
  };

  /* =========================
     ACEPTAR PRODUCTO
     SOLO ADMIN
  ========================= */

  const aceptarProducto = async (id) => {

    if (!esAdmin) {
      alert(
        "Solo el administrador puede aceptar productos"
      );
      return;
    }

    try {

      const respuesta =
        await fetch(
          `${API}/productos/${id}/aceptar`,
          {
            method: "PUT"
          }
        );

      const datos =
        await respuesta.json();

      if (!respuesta.ok) {

        alert(
          datos.mensaje ||
          "Error al aceptar producto"
        );

        return;
      }

      alert(
        "Producto aceptado y publicado"
      );

      cargarProductos();

    } catch (error) {

      console.error(error);

      alert(
        "Error al aceptar producto"
      );
    }
  };

  /* =========================
     RECHAZAR PRODUCTO
     SOLO ADMIN
  ========================= */

  const rechazarProducto = async (id) => {

    if (!esAdmin) {
      alert(
        "Solo el administrador puede rechazar productos"
      );
      return;
    }

    try {

      const respuesta =
        await fetch(
          `${API}/productos/${id}/rechazar`,
          {
            method: "PUT"
          }
        );

      const datos =
        await respuesta.json();

      if (!respuesta.ok) {

        alert(
          datos.mensaje ||
          "Error al rechazar producto"
        );

        return;
      }

      alert(
        "Producto rechazado"
      );

      cargarProductos();

    } catch (error) {

      console.error(error);

      alert(
        "Error al rechazar producto"
      );
    }
  };

  /* =========================
     LIMPIAR PRODUCTO
  ========================= */

  const limpiarProducto = () => {

    setNombreProducto("");
    setDescripcion("");
    setPrecio("");
    setStock("");

    setImagen(null);
    setImagenUrl("");

    setTipoImagen("local");

    setEditandoProductoId(null);
  };

  /* =========================
     CARGAR PRODUCTOS AL LOGIN
  ========================= */

  useEffect(() => {

    if (usuarioLogin) {
      cargarProductos();
    }

  }, [usuarioLogin]);

  /* =========================
     FILTROS
  ========================= */

  const productosAceptados =
    productos.filter(
      (producto) =>
        producto.estado ===
        "aceptado"
    );

  const productosPendientes =
    productos.filter(
      (producto) =>
        producto.estado ===
        "pendiente"
    );

  const productosRechazados =
    productos.filter(
      (producto) =>
        producto.estado ===
        "rechazado"
    );

  /* =========================
     MIS PRODUCTOS
     SOLO PROVEEDOR
  ========================= */

  const misProductos =
    productos.filter(
      (producto) =>
        Number(
          producto.creado_por
        ) ===
        Number(
          usuarioLogin?.id
        )
    );

  /* =========================
     LOGIN
  ========================= */

  if (!usuarioLogin) {

    return (

      <div className="login-container">

        <div className="login-box">

          <h1>
            Sistema de Ventas
          </h1>

          <h2>
            Iniciar sesión
          </h2>

          <form
            onSubmit={
              iniciarSesion
            }
          >

            <input
              type="email"
              placeholder="Correo"
              value={
                emailLogin
              }
              onChange={(e) =>
                setEmailLogin(
                  e.target.value
                )
              }
              className="input"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={
                passwordLogin
              }
              onChange={(e) =>
                setPasswordLogin(
                  e.target.value
                )
              }
              className="input"
            />

            {/* CAPTCHA */}

            <div className="captcha">

              <div className="captcha-titulo">

                <span className="captcha-icono">
                  ✓
                </span>

                <div>

                  <strong>
                    Verificación de seguridad
                  </strong>

                  <small className="captcha-subtitulo">
                    Escribe el código que aparece
                  </small>

                </div>

              </div>

              <div className="captcha-contenido">

                <div className="codigo-captcha">

                  <div className="linea-captcha-1" />

                  <div className="linea-captcha-2" />

                  <div className="puntos-captcha">
                    • • • • • • • •
                  </div>

                  {captcha
                    .split("")
                    .map(
                      (
                        caracter,
                        index
                      ) => (

                        <span
                          key={
                            index
                          }
                          className={
                            `letra-captcha ${
                              index % 2 === 0
                                ? "captcha-letra-izquierda"
                                : "captcha-letra-derecha"
                            }`
                          }
                        >
                          {caracter}
                        </span>

                      )
                    )}

                </div>

                <button
                  type="button"
                  onClick={
                    generarCaptcha
                  }
                  className="boton-captcha"
                >
                  ↻
                </button>

              </div>

              <input
                type="text"
                placeholder="Escribe el código tal como aparece"
                value={
                  captchaUsuario
                }
                maxLength={5}
                autoComplete="off"
                onChange={(e) =>
                  setCaptchaUsuario(
                    e.target.value
                  )
                }
                className="input-captcha"
              />

            </div>

            {mensajeLogin && (

              <p className="error">
                {mensajeLogin}
              </p>

            )}

            <button
              type="submit"
              className="boton-login"
            >
              Iniciar sesión
            </button>

          </form>

        </div>

      </div>
    );
  }

  /* =========================
     SISTEMA
  ========================= */

  return (

    <div className="contenedor">

      {/* =========================
          INFORMACIÓN USUARIO
      ========================= */}

      <div className="usuario-info">

        <h2>
          Sistema de Ventas
        </h2>

        <p>
          <strong>
            Usuario:
          </strong>{" "}
          {usuarioLogin.nombre}
        </p>

        <p>
          <strong>
            Correo:
          </strong>{" "}
          {usuarioLogin.email}
        </p>

        <p>
          <strong>
            Rol:
          </strong>{" "}
          {usuarioLogin.rol === "admin"
            ? "Administrador"
            : usuarioLogin.rol === "proveedor"
              ? "Proveedor"
              : "Cliente"}
        </p>

      </div>

      {/* =========================
          MENÚ SEGÚN ROL
      ========================= */}

      <div className="menu">

        {/* =========================
            USUARIOS
            SOLO ADMIN
        ========================= */}

        {esAdmin && (

          <button
            className="boton"
            onClick={() => {

              setMostrarUsuarios(
                !mostrarUsuarios
              );

              setMostrarProductos(false);
              setMostrarPublicados(false);
              setMostrarPendientes(false);
              setMostrarRechazados(false);
              setMostrarMisProductos(false);

              limpiarProducto();

              cargarUsuarios();

            }}
          >
            Usuarios
          </button>

        )}

        {/* =========================
            PRODUCTOS
            ADMIN + PROVEEDOR
        ========================= */}

        {(esAdmin || esProveedor) && (

          <button
            className="boton"
            onClick={() => {

              setMostrarProductos(
                !mostrarProductos
              );

              setMostrarUsuarios(false);
              setMostrarPublicados(false);
              setMostrarPendientes(false);
              setMostrarRechazados(false);
              setMostrarMisProductos(false);

              limpiarUsuario();

              cargarProductos();

            }}
          >
            Productos
          </button>

        )}

        {/* =========================
            PRODUCTOS PUBLICADOS
            TODOS
        ========================= */}

        <button
          className="boton"
          onClick={() => {

            setMostrarPublicados(
              !mostrarPublicados
            );

            setMostrarUsuarios(false);
            setMostrarProductos(false);
            setMostrarPendientes(false);
            setMostrarRechazados(false);
            setMostrarMisProductos(false);

            limpiarProducto();

            cargarProductos();

          }}
        >
          Productos publicados
        </button>

        {/* =========================
            PENDIENTES
            SOLO ADMIN
        ========================= */}

        {esAdmin && (

          <button
            className="boton"
            onClick={() => {

              setMostrarPendientes(
                !mostrarPendientes
              );

              setMostrarUsuarios(false);
              setMostrarProductos(false);
              setMostrarPublicados(false);
              setMostrarRechazados(false);
              setMostrarMisProductos(false);

              limpiarProducto();

              cargarProductos();

            }}
          >
            Productos pendientes
          </button>

        )}

        {/* =========================
            RECHAZADOS
            SOLO ADMIN
        ========================= */}

        {esAdmin && (

          <button
            className="boton"
            onClick={() => {

              setMostrarRechazados(
                !mostrarRechazados
              );

              setMostrarUsuarios(false);
              setMostrarProductos(false);
              setMostrarPublicados(false);
              setMostrarPendientes(false);
              setMostrarMisProductos(false);

              limpiarProducto();

              cargarProductos();

            }}
          >
            Productos rechazados
          </button>

        )}

        {/* =========================
            MIS PRODUCTOS
            SOLO PROVEEDOR
        ========================= */}

        {esProveedor && (

          <button
            className="boton"
            onClick={() => {

              setMostrarMisProductos(
                !mostrarMisProductos
              );

              setMostrarUsuarios(false);
              setMostrarProductos(false);
              setMostrarPublicados(false);
              setMostrarPendientes(false);
              setMostrarRechazados(false);

              limpiarProducto();

              cargarProductos();

            }}
          >
            Mis productos
          </button>

        )}

        {/* =========================
            CARRITO
        ========================= */}

        <button
          className="boton"
          onClick={() =>
            alert(
              "Módulo de carrito próximamente"
            )
          }
        >
          Carrito
        </button>

        {/* =========================
            PEDIDOS
        ========================= */}

        <button
          className="boton"
          onClick={() =>
            alert(
              "Módulo de pedidos próximamente"
            )
          }
        >
          Mis pedidos
        </button>

        {/* =========================
            CERRAR SESIÓN
        ========================= */}

        <button
          className="boton-salir"
          onClick={
            cerrarSesion
          }
        >
          Cerrar sesión
        </button>

      </div>

      {/* =========================
          USUARIOS
          SOLO ADMIN
      ========================= */}

      {esAdmin &&
        mostrarUsuarios && (

          <div className="seccion">

            <h2>
              Gestión de usuarios
            </h2>

            <p>
              El administrador puede registrar usuarios
              y asignarles un rol.
            </p>

            <form
              onSubmit={
                guardarUsuario
              }
            >

              <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) =>
                  setNombre(
                    e.target.value
                  )
                }
                className="input"
              />

              <input
                type="email"
                placeholder="Correo"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="input"
              />

              <input
                type="password"
                placeholder={
                  editandoId
                    ? "Nueva contraseña (opcional)"
                    : "Contraseña"
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="input"
              />

              <select
                value={rol}
                onChange={(e) =>
                  setRol(
                    e.target.value
                  )
                }
                className="input"
              >

                <option value="cliente">
                  Cliente
                </option>

                <option value="proveedor">
                  Proveedor
                </option>

                <option value="admin">
                  Administrador
                </option>

              </select>

              <button
                type="submit"
                className="boton"
              >
                {editandoId
                  ? "Actualizar usuario"
                  : "Registrar usuario"}
              </button>

              {editandoId && (

                <button
                  type="button"
                  className="boton-cancelar"
                  onClick={
                    limpiarUsuario
                  }
                >
                  Cancelar
                </button>

              )}

            </form>

            <table className="tabla">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>

              </thead>

              <tbody>

                {usuarios.map(
                  (usuario) => (

                    <tr
                      key={
                        usuario.id
                      }
                    >

                      <td>
                        {usuario.id}
                      </td>

                      <td>
                        {usuario.nombre}
                      </td>

                      <td>
                        {usuario.email}
                      </td>

                      <td>
                        {usuario.rol === "admin"
                          ? "Administrador"
                          : usuario.rol === "proveedor"
                            ? "Proveedor"
                            : "Cliente"}
                      </td>

                      <td>

                        <button
                          className="boton-editar"
                          onClick={() =>
                            editarUsuario(
                              usuario
                            )
                          }
                        >
                          Editar
                        </button>

                        <button
                          className="boton-eliminar"
                          onClick={() =>
                            eliminarUsuario(
                              usuario.id
                            )
                          }
                        >
                          Eliminar
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      {/* =========================
          CREAR / EDITAR PRODUCTO
          ADMIN + PROVEEDOR
      ========================= */}

      {(esAdmin || esProveedor) &&
        mostrarProductos && (

          <div className="seccion">

            <h2>
              {editandoProductoId
                ? "Editar producto"
                : "Crear producto"}
            </h2>

            <p>
              {esAdmin
                ? "Los productos creados por el administrador se publican directamente."
                : "Los productos creados por el proveedor quedan pendientes hasta que el administrador los revise."
              }
            </p>

            <form
              onSubmit={
                guardarProducto
              }
            >

              <input
                type="text"
                placeholder="Nombre del producto"
                value={
                  nombreProducto
                }
                onChange={(e) =>
                  setNombreProducto(
                    e.target.value
                  )
                }
                className="input"
              />

              <textarea
                placeholder="Descripción"
                value={
                  descripcion
                }
                onChange={(e) =>
                  setDescripcion(
                    e.target.value
                  )
                }
                className="textarea"
              />

              <input
                type="number"
                placeholder="Precio"
                min="0"
                step="0.01"
                value={
                  precio
                }
                onChange={(e) =>
                  setPrecio(
                    e.target.value
                  )
                }
                className="input"
              />

              <input
                type="number"
                placeholder="Stock"
                min="0"
                value={
                  stock
                }
                onChange={(e) =>
                  setStock(
                    e.target.value
                  )
                }
                className="input"
              />

              {/* IMAGEN */}

              <label className="input">
                Imagen del producto
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  marginBottom: "15px",
                  marginTop: "10px",
                  flexWrap: "wrap"
                }}
              >

                <label>

                  <input
                    type="radio"
                    name="tipoImagen"
                    value="local"
                    checked={
                      tipoImagen === "local"
                    }
                    onChange={() => {

                      setTipoImagen(
                        "local"
                      );

                      setImagenUrl("");

                    }}
                  />

                  {" "}
                  Subir imagen desde mi computadora

                </label>

                <label>

                  <input
                    type="radio"
                    name="tipoImagen"
                    value="url"
                    checked={
                      tipoImagen === "url"
                    }
                    onChange={() => {

                      setTipoImagen(
                        "url"
                      );

                      setImagen(null);

                    }}
                  />

                  {" "}
                  Usar imagen por URL

                </label>

              </div>

              {/* IMAGEN LOCAL */}

              {tipoImagen === "local" && (

                <div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {

                      const archivo =
                        e.target.files[0];

                      if (archivo) {
                        setImagen(
                          archivo
                        );
                      }

                    }}
                    className="input"
                  />

                  {imagen && (

                    <div
                      style={{
                        marginTop: "10px",
                        marginBottom: "10px"
                      }}
                    >

                      <p>
                        Vista previa:
                      </p>

                      <img
                        src={
                          URL.createObjectURL(
                            imagen
                          )
                        }
                        alt="Vista previa"
                        style={{
                          width: "200px",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "10px"
                        }}
                      />

                    </div>

                  )}

                </div>

              )}

              {/* IMAGEN POR URL */}

              {tipoImagen === "url" && (

                <div>

                  <input
                    type="url"
                    placeholder="Pega aquí la URL directa de la imagen"
                    value={
                      imagenUrl
                    }
                    onChange={(e) =>
                      setImagenUrl(
                        e.target.value
                      )
                    }
                    className="input"
                  />

                  {imagenUrl.trim() !== "" && (

                    <div
                      style={{
                        marginTop: "10px",
                        marginBottom: "10px"
                      }}
                    >

                      <p>
                        Vista previa:
                      </p>

                      <img
                        src={
                          imagenUrl
                        }
                        alt="Vista previa"
                        style={{
                          width: "200px",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "10px"
                        }}
                        onError={(e) => {
                          e.target.style.display =
                            "none";
                        }}
                      />

                    </div>

                  )}

                </div>

              )}

              <button
                type="submit"
                className="boton"
              >
                {editandoProductoId
                  ? "Actualizar producto"
                  : "Crear producto"}
              </button>

              {editandoProductoId && (

                <button
                  type="button"
                  className="boton-cancelar"
                  onClick={
                    limpiarProducto
                  }
                >
                  Cancelar
                </button>

              )}

            </form>

          </div>

        )}

      {/* =========================
          PRODUCTOS PUBLICADOS
          TODOS LOS ROLES
      ========================= */}

      {mostrarPublicados && (

        <div className="seccion">

          <h2>
            Productos publicados
          </h2>

          <p>
            Aquí se muestran únicamente los
            productos aceptados por el administrador.
          </p>

          {productosAceptados.length === 0 ? (

            <div className="mensaje-vacio">

              <p>
                No hay productos publicados.
              </p>

            </div>

          ) : (

            <div className="productos">

              {productosAceptados.map(
                (producto) => (

                  <div
                    key={
                      producto.id
                    }
                    className="producto"
                  >

                    {producto.imagen ? (

                      <img
                        src={
                          producto.imagen
                        }
                        alt={
                          producto.nombre
                        }
                        className="imagen-producto"
                        onClick={() =>
                          setProductoSeleccionado(
                            producto
                          )
                        }
                      />

                    ) : (

                      <div
                        className="sin-imagen"
                        onClick={() =>
                          setProductoSeleccionado(
                            producto
                          )
                        }
                      >
                        Sin imagen
                      </div>

                    )}

                    <h3>
                      {
                        producto.nombre
                      }
                    </h3>

                    <p>
                      {
                        producto.descripcion
                      }
                    </p>

                    <p>
                      <strong>
                        Precio:
                      </strong>{" "}
                      $
                      {
                        producto.precio
                      }
                    </p>

                    <p>
                      <strong>
                        Stock:
                      </strong>{" "}
                      {
                        producto.stock
                      }
                    </p>

                    <p>
                      <strong>
                        Estado:
                      </strong>{" "}
                      Aceptado
                    </p>

                    {/* SOLO ADMIN */}

                    {esAdmin && (

                      <div>

                        <button
                          className="boton-editar"
                          onClick={() =>
                            editarProducto(
                              producto
                            )
                          }
                        >
                          Editar
                        </button>

                        <button
                          className="boton-eliminar"
                          onClick={() =>
                            eliminarProducto(
                              producto.id
                            )
                          }
                        >
                          Eliminar
                        </button>

                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          )}

        </div>

      )}

      {/* =========================
          PRODUCTOS PENDIENTES
          SOLO ADMIN
      ========================= */}

      {esAdmin &&
        mostrarPendientes && (

          <div className="seccion">

            <h2>
              Productos pendientes
            </h2>

            <p>
              Productos enviados por los proveedores
              que esperan revisión.
            </p>

            {productosPendientes.length === 0 ? (

              <div className="mensaje-vacio">

                <p>
                  No hay productos pendientes.
                </p>

              </div>

            ) : (

              <div className="productos">

                {productosPendientes.map(
                  (producto) => (

                    <div
                      key={
                        producto.id
                      }
                      className="producto"
                    >

                      {producto.imagen ? (

                        <img
                          src={
                            producto.imagen
                          }
                          alt={
                            producto.nombre
                          }
                          className="imagen-producto"
                          onClick={() =>
                            setProductoSeleccionado(
                              producto
                            )
                          }
                        />

                      ) : (

                        <div
                          className="sin-imagen"
                          onClick={() =>
                            setProductoSeleccionado(
                              producto
                            )
                          }
                        >
                          Sin imagen
                        </div>

                      )}

                      <h3>
                        {
                          producto.nombre
                        }
                      </h3>

                      <p>
                        {
                          producto.descripcion
                        }
                      </p>

                      <p>
                        <strong>
                          Precio:
                        </strong>{" "}
                        $
                        {
                          producto.precio
                        }
                      </p>

                      <p>
                        <strong>
                          Stock:
                        </strong>{" "}
                        {
                          producto.stock
                        }
                      </p>

                      <p>
                        <strong>
                          Estado:
                        </strong>{" "}
                        Pendiente
                      </p>

                      <button
                        className="boton-aceptar"
                        onClick={() =>
                          aceptarProducto(
                            producto.id
                          )
                        }
                      >
                        Aceptar
                      </button>

                      <button
                        className="boton-eliminar"
                        onClick={() =>
                          rechazarProducto(
                            producto.id
                          )
                        }
                      >
                        Rechazar
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        )}

      {/* =========================
          PRODUCTOS RECHAZADOS
          SOLO ADMIN
      ========================= */}

      {esAdmin &&
        mostrarRechazados && (

          <div className="seccion">

            <h2>
              Productos rechazados
            </h2>

            <p>
              Productos que fueron rechazados.
              El administrador puede volver a publicarlos.
            </p>

            {productosRechazados.length === 0 ? (

              <div className="mensaje-vacio">

                <p>
                  No hay productos rechazados.
                </p>

              </div>

            ) : (

              <div className="productos">

                {productosRechazados.map(
                  (producto) => (

                    <div
                      key={
                        producto.id
                      }
                      className="producto"
                    >

                      {producto.imagen ? (

                        <img
                          src={
                            producto.imagen
                          }
                          alt={
                            producto.nombre
                          }
                          className="imagen-producto"
                          onClick={() =>
                            setProductoSeleccionado(
                              producto
                            )
                          }
                        />

                      ) : (

                        <div
                          className="sin-imagen"
                          onClick={() =>
                            setProductoSeleccionado(
                              producto
                            )
                          }
                        >
                          Sin imagen
                        </div>

                      )}

                      <h3>
                        {
                          producto.nombre
                        }
                      </h3>

                      <p>
                        {
                          producto.descripcion
                        }
                      </p>

                      <p>
                        <strong>
                          Precio:
                        </strong>{" "}
                        $
                        {
                          producto.precio
                        }
                      </p>

                      <p>
                        <strong>
                          Stock:
                        </strong>{" "}
                        {
                          producto.stock
                        }
                      </p>

                      <p>
                        <strong>
                          Estado:
                        </strong>{" "}
                        Rechazado
                      </p>

                      <button
                        className="boton-aceptar"
                        onClick={() =>
                          aceptarProducto(
                            producto.id
                          )
                        }
                      >
                        Aceptar y publicar
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        )}

      {/* =========================
          MIS PRODUCTOS
          SOLO PROVEEDOR
      ========================= */}

      {esProveedor &&
        mostrarMisProductos && (

          <div className="seccion">

            <h2>
              Mis productos
            </h2>

            <p>
              Aquí puedes consultar los productos
              que has enviado y su estado.
            </p>

            {misProductos.length === 0 ? (

              <div className="mensaje-vacio">

                <p>
                  No has creado productos todavía.
                </p>

              </div>

            ) : (

              <div className="productos">

                {misProductos.map(
                  (producto) => (

                    <div
                      key={
                        producto.id
                      }
                      className="producto"
                    >

                      {producto.imagen ? (

                        <img
                          src={
                            producto.imagen
                          }
                          alt={
                            producto.nombre
                          }
                          className="imagen-producto"
                          onClick={() =>
                            setProductoSeleccionado(
                              producto
                            )
                          }
                        />

                      ) : (

                        <div
                          className="sin-imagen"
                          onClick={() =>
                            setProductoSeleccionado(
                              producto
                            )
                          }
                        >
                          Sin imagen
                        </div>

                      )}

                      <h3>
                        {
                          producto.nombre
                        }
                      </h3>

                      <p>
                        {
                          producto.descripcion
                        }
                      </p>

                      <p>
                        <strong>
                          Precio:
                        </strong>{" "}
                        $
                        {
                          producto.precio
                        }
                      </p>

                      <p>
                        <strong>
                          Stock:
                        </strong>{" "}
                        {
                          producto.stock
                        }
                      </p>

                      <p>
                        <strong>
                          Estado:
                        </strong>{" "}
                        {producto.estado === "aceptado"
                          ? "Aceptado"
                          : producto.estado === "pendiente"
                            ? "Pendiente"
                            : "Rechazado"}
                      </p>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        )}

      {/* =========================
          DETALLE PRODUCTO
      ========================= */}

      {productoSeleccionado && (

        <div
          className="modal-fondo"
          onClick={() =>
            setProductoSeleccionado(
              null
            )
          }
        >

          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="cerrar"
              onClick={() =>
                setProductoSeleccionado(
                  null
                )
              }
            >
              ×
            </button>

            {productoSeleccionado.imagen ? (

              <img
                src={
                  productoSeleccionado.imagen
                }
                alt={
                  productoSeleccionado.nombre
                }
                style={{
                  width: "100%",
                  maxHeight: "350px",
                  objectFit: "contain",
                  borderRadius: "10px",
                  marginBottom: "15px"
                }}
              />

            ) : (

              <div className="sin-imagen">
                Sin imagen
              </div>

            )}

            <h2>
              {
                productoSeleccionado.nombre
              }
            </h2>

            <p>
              <strong>
                Descripción:
              </strong>{" "}
              {
                productoSeleccionado.descripcion
              }
            </p>

            <p>
              <strong>
                Precio:
              </strong>{" "}
              $
              {
                productoSeleccionado.precio
              }
            </p>

            <p>
              <strong>
                Stock:
              </strong>{" "}
              {
                productoSeleccionado.stock
              }
            </p>

            <p>
              <strong>
                Estado:
              </strong>{" "}
              {
                productoSeleccionado.estado === "aceptado"
                  ? "Aceptado"
                  : productoSeleccionado.estado === "pendiente"
                    ? "Pendiente"
                    : "Rechazado"
              }
            </p>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;
