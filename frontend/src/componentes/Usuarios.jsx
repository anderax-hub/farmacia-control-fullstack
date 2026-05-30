import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_USUARIOS = 'https://localhost:7120/api/Usuarios'
const ROLES = ['Administrador', 'Ventas', 'Inventario']
const ADMINISTRADOR_PRINCIPAL_ID = 1

const obtenerIdUsuario = (usuario) => Number(usuario?.id ?? usuario?.Id)

const esAdministradorPrincipal = (usuario) => {
  return obtenerIdUsuario(usuario) === ADMINISTRADOR_PRINCIPAL_ID
}

function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [rol, setRol] = useState('Ventas')
  const [busqueda, setBusqueda] = useState('')
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const usuarioActual = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || 'null')
    } catch {
      return null
    }
  }, [])

  const esSesionActual = (usuario) => {
    return obtenerIdUsuario(usuario) === obtenerIdUsuario(usuarioActual)
  }

  const puedeEliminarUsuario = (usuario) => {
    return !esAdministradorPrincipal(usuario) && !esSesionActual(usuario)
  }

  const limpiarFormulario = () => {
    setNombre('')
    setCorreo('')
    setClave('')
    setRol('Ventas')
    setUsuarioEditando(null)
  }

  const cargarUsuarios = async () => {
    try {
      const respuesta = await axios.get(API_USUARIOS)
      setUsuarios(respuesta.data)
      setError('')
    } catch (errorPeticion) {
      console.error('Error al obtener usuarios', errorPeticion)
      setError('No se pudieron cargar los usuarios')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    const controlador = new AbortController()

    axios
      .get(API_USUARIOS, {
        signal: controlador.signal
      })
      .then((respuesta) => {
        setUsuarios(respuesta.data)
        setError('')
      })
      .catch((errorPeticion) => {
        if (errorPeticion.name !== 'CanceledError') {
          console.error('Error al obtener usuarios', errorPeticion)
          setError('No se pudieron cargar los usuarios')
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      })

    return () => controlador.abort()
  }, [])

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    if (!texto) {
      return usuarios
    }

    return usuarios.filter((usuario) => {
      return [
        usuario.nombre,
        usuario.correo,
        usuario.rol
      ].some((valor) => valor?.toLowerCase().includes(texto))
    })
  }, [busqueda, usuarios])

  const resumenUsuarios = useMemo(() => {
    return usuarios.reduce((resumen, usuario) => {
      return {
        total: resumen.total + 1,
        administradores: resumen.administradores + (usuario.rol === 'Administrador' ? 1 : 0),
        ventas: resumen.ventas + (usuario.rol === 'Ventas' ? 1 : 0),
        inventario: resumen.inventario + (usuario.rol === 'Inventario' ? 1 : 0)
      }
    }, {
      total: 0,
      administradores: 0,
      ventas: 0,
      inventario: 0
    })
  }, [usuarios])

  const seleccionarUsuario = (usuario) => {
    setUsuarioEditando(usuario)
    setNombre(usuario.nombre)
    setCorreo(usuario.correo)
    setClave(usuario.clave || '')
    setRol(usuario.rol)
    setMensaje('')
    setError('')
  }

  const solicitarEliminacion = (usuario) => {
    if (!puedeEliminarUsuario(usuario)) {
      setError('Este usuario esta protegido y no se puede eliminar')
      setMensaje('')
      return
    }

    setUsuarioAEliminar(usuario)
    setMensaje('')
    setError('')
  }

  const guardarUsuario = async (e) => {
    e.preventDefault()

    if (usuarioEditando && esAdministradorPrincipal(usuarioEditando) && rol !== 'Administrador') {
      setError('El administrador principal debe conservar el rol Administrador')
      setMensaje('')
      return
    }

    setGuardando(true)
    setMensaje('')
    setError('')

    const usuario = {
      nombre: nombre.trim(),
      correo: correo.trim(),
      clave: clave.trim(),
      rol
    }

    try {
      if (usuarioEditando) {
        await axios.put(`${API_USUARIOS}/${usuarioEditando.id}`, {
          id: usuarioEditando.id,
          ...usuario
        })
        setMensaje('Usuario actualizado correctamente')
      } else {
        await axios.post(API_USUARIOS, usuario)
        setMensaje('Usuario creado correctamente')
      }

      limpiarFormulario()
      await cargarUsuarios()
    } catch (errorPeticion) {
      console.error('Error al guardar usuario', errorPeticion)
      setError(String(errorPeticion.response?.data || 'No se pudo guardar el usuario'))
    } finally {
      setGuardando(false)
    }
  }

  const confirmarEliminacion = async () => {
    if (!usuarioAEliminar) return

    if (!puedeEliminarUsuario(usuarioAEliminar)) {
      setUsuarioAEliminar(null)
      setError('Este usuario esta protegido y no se puede eliminar')
      setMensaje('')
      return
    }

    setEliminando(true)
    setMensaje('')
    setError('')

    try {
      await axios.delete(`${API_USUARIOS}/${usuarioAEliminar.id}`)
      setMensaje('Usuario eliminado correctamente')

      if (usuarioEditando?.id === usuarioAEliminar.id) {
        limpiarFormulario()
      }

      setUsuarioAEliminar(null)
      await cargarUsuarios()
    } catch (errorPeticion) {
      console.error('Error al eliminar usuario', errorPeticion)
      setError(String(errorPeticion.response?.data || 'No se pudo eliminar el usuario'))
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="usuarios-contenedor">
      <h2>Gestion de Usuarios</h2>

      <form className="formulario-usuario" onSubmit={guardarUsuario}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Clave"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          required
        />

        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          disabled={usuarioEditando && esAdministradorPrincipal(usuarioEditando)}
          required
        >
          {ROLES.map((rolDisponible) => (
            <option key={rolDisponible} value={rolDisponible}>
              {rolDisponible}
            </option>
          ))}
        </select>

        {usuarioEditando && esAdministradorPrincipal(usuarioEditando) && (
          <p className="aviso-admin-principal">
            El administrador principal no puede cambiar de rol ni eliminarse.
          </p>
        )}

        <div className="acciones-formulario-usuario">
          <button type="submit" disabled={guardando}>
            {usuarioEditando ? 'Actualizar usuario' : 'Crear usuario'}
          </button>

          {usuarioEditando && (
            <button type="button" className="btn-cancelar" onClick={limpiarFormulario}>
              Cancelar edicion
            </button>
          )}
        </div>
      </form>

      {mensaje && <p className="mensaje-usuario">{mensaje}</p>}
      {error && <p className="error-usuario">{error}</p>}

      <section className="resumen-usuarios">
        <div className="resumen-usuario-card">
          <span>Total</span>
          <strong>{resumenUsuarios.total}</strong>
        </div>
        <div className="resumen-usuario-card admin">
          <span>Administradores</span>
          <strong>{resumenUsuarios.administradores}</strong>
        </div>
        <div className="resumen-usuario-card ventas">
          <span>Ventas</span>
          <strong>{resumenUsuarios.ventas}</strong>
        </div>
        <div className="resumen-usuario-card inventario">
          <span>Inventario</span>
          <strong>{resumenUsuarios.inventario}</strong>
        </div>
      </section>

      <div className="barra-usuarios">
        <input
          type="search"
          placeholder="Buscar por nombre, correo o rol"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <span>{usuariosFiltrados.length} de {usuarios.length} usuarios</span>
      </div>

      {cargando && <p className="mensaje-usuario">Cargando usuarios...</p>}

      {!cargando && usuariosFiltrados.length === 0 && (
        <p className="mensaje-usuario">No hay usuarios para mostrar.</p>
      )}

      {!cargando && usuariosFiltrados.length > 0 && (
        <div className="tabla-usuarios-wrapper">
          <table className="tabla-usuarios">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => {
                const eliminarBloqueado = !puedeEliminarUsuario(usuario)

                return (
                  <tr key={usuario.id}>
                    <td className="celda-usuario">
                      <div className="celda-usuario-contenido">
                        <span>{usuario.nombre}</span>
                        {esAdministradorPrincipal(usuario) && (
                          <span className="etiqueta-usuario-protegido">Principal</span>
                        )}
                        {!esAdministradorPrincipal(usuario) && esSesionActual(usuario) && (
                          <span className="etiqueta-usuario-protegido sesion">Sesion actual</span>
                        )}
                      </div>
                    </td>
                  <td>{usuario.correo}</td>
                  <td>
                    <span className={`estado-rol ${usuario.rol.toLowerCase()}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td>
                    <div className="acciones-tabla-usuario">
                      <button type="button" className="btn-editar" onClick={() => seleccionarUsuario(usuario)}>
                        Editar
                      </button>
                      {eliminarBloqueado ? (
                        <button type="button" className="btn-eliminar btn-deshabilitado" disabled>
                          Protegido
                        </button>
                      ) : (
                        <button type="button" className="btn-eliminar" onClick={() => solicitarEliminacion(usuario)}>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {usuarioAEliminar && (
        <div className="modal-eliminar-producto" role="dialog" aria-modal="true">
          <div className="modal-eliminar-card">
            <h3>Eliminar usuario</h3>
            <p>
              Esta accion eliminara <strong>{usuarioAEliminar.nombre}</strong> del sistema.
            </p>
            <div className="acciones-modal-eliminar">
              <button
                type="button"
                className="btn-cancelar-eliminar"
                onClick={() => setUsuarioAEliminar(null)}
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-confirmar-eliminar"
                onClick={confirmarEliminacion}
                disabled={eliminando}
              >
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Usuarios
