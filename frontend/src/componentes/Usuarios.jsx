import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  API_USUARIOS,
  esAdministradorPrincipal,
  esSesionActual,
  normalizarTexto,
  obtenerUsuarioActual,
  puedeEliminarUsuario
} from './usuariosUtils'

function Usuarios() {
  const navigate = useNavigate()
  const location = useLocation()
  const mensajeRuta = location.state?.mensaje
  const usuarioActual = useMemo(() => obtenerUsuarioActual(), [])
  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [mensaje] = useState(mensajeRuta || '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (mensajeRuta) {
      navigate('/usuarios', { replace: true, state: null })
    }
  }, [mensajeRuta, navigate])

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
    const texto = normalizarTexto(busqueda)

    if (!texto) {
      return usuarios
    }

    return usuarios.filter((usuario) => {
      return [
        usuario.nombre,
        usuario.correo,
        usuario.rol
      ].some((valor) => normalizarTexto(valor).includes(texto))
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

  return (
    <div className="usuarios-contenedor">
      <div className="encabezado-usuarios">
        <div>
          <span>Usuarios</span>
          <h2>Gestion de Usuarios</h2>
        </div>

        <button type="button" className="btn-nuevo-usuario" onClick={() => navigate('/usuarios/nuevo')}>
          Nuevo usuario
        </button>
      </div>

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
                const eliminarBloqueado = !puedeEliminarUsuario(usuario, usuarioActual)

                return (
                  <tr key={usuario.id}>
                    <td className="celda-usuario">
                      <div className="celda-usuario-contenido">
                        <span>{usuario.nombre}</span>
                        {esAdministradorPrincipal(usuario) && (
                          <span className="etiqueta-usuario-protegido">Principal</span>
                        )}
                        {!esAdministradorPrincipal(usuario) && esSesionActual(usuario, usuarioActual) && (
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
                        <button type="button" className="btn-ver" onClick={() => navigate(`/usuarios/${usuario.id}`)}>
                          Ver
                        </button>
                        <button type="button" className="btn-editar" onClick={() => navigate(`/usuarios/${usuario.id}/editar`)}>
                          Editar
                        </button>
                        {eliminarBloqueado ? (
                          <button type="button" className="btn-eliminar btn-deshabilitado" disabled>
                            Protegido
                          </button>
                        ) : (
                          <button type="button" className="btn-eliminar" onClick={() => navigate(`/usuarios/${usuario.id}/eliminar`)}>
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
    </div>
  )
}

export default Usuarios
