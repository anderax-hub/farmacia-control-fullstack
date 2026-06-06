import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  API_USUARIOS,
  esAdministradorPrincipal,
  esSesionActual,
  obtenerUsuarioActual,
  puedeEliminarUsuario
} from './usuariosUtils'

function UsuarioEliminar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const usuarioActual = useMemo(() => obtenerUsuarioActual(), [])
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controlador = new AbortController()

    axios
      .get(`${API_USUARIOS}/${id}`, {
        signal: controlador.signal
      })
      .then((respuesta) => {
        setUsuario(respuesta.data)
        setError('')
      })
      .catch((errorPeticion) => {
        if (errorPeticion.name !== 'CanceledError') {
          console.error('Error al cargar usuario', errorPeticion)
          setError('No se pudo cargar el usuario')
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      })

    return () => controlador.abort()
  }, [id])

  const confirmarEliminacion = async () => {
    if (!usuario) return

    if (!puedeEliminarUsuario(usuario, usuarioActual)) {
      setError('Este usuario esta protegido y no se puede eliminar')
      return
    }

    setEliminando(true)
    setError('')

    try {
      await axios.delete(`${API_USUARIOS}/${usuario.id}`)
      navigate('/usuarios', {
        state: { mensaje: 'Usuario eliminado correctamente' }
      })
    } catch (errorPeticion) {
      console.error('Error al eliminar usuario', errorPeticion)
      setError(String(errorPeticion.response?.data || 'No se pudo eliminar el usuario'))
    } finally {
      setEliminando(false)
    }
  }

  const usuarioProtegido = usuario && !puedeEliminarUsuario(usuario, usuarioActual)

  return (
    <div className="usuarios-contenedor">
      <div className="encabezado-usuarios">
        <div>
          <span>Confirmar eliminacion</span>
          <h2>{usuario?.nombre || 'Eliminar usuario'}</h2>
        </div>

        <button type="button" className="btn-secundario-usuario" onClick={() => navigate('/usuarios')}>
          Volver a usuarios
        </button>
      </div>

      {cargando && <p className="mensaje-usuario">Cargando usuario...</p>}
      {error && <p className="error-usuario">{error}</p>}

      {!cargando && usuario && (
        <section className="vista-eliminar-usuario">
          <h3>{usuarioProtegido ? 'Usuario protegido' : 'Eliminar usuario del sistema'}</h3>
          <p>
            {usuarioProtegido
              ? 'Este usuario no puede eliminarse porque es el administrador principal o corresponde a la sesion actual.'
              : 'Esta accion eliminara el usuario seleccionado del sistema.'}
          </p>

          <div className="usuario-resumen-eliminar">
            <div>
              <span>Nombre</span>
              <strong>{usuario.nombre}</strong>
            </div>
            <div>
              <span>Correo</span>
              <strong>{usuario.correo}</strong>
            </div>
            <div>
              <span>Rol</span>
              <strong className={`estado-rol ${usuario.rol.toLowerCase()}`}>
                {usuario.rol}
              </strong>
            </div>
            <div>
              <span>Proteccion</span>
              {esAdministradorPrincipal(usuario) && (
                <strong className="etiqueta-usuario-protegido">Principal</strong>
              )}
              {!esAdministradorPrincipal(usuario) && esSesionActual(usuario, usuarioActual) && (
                <strong className="etiqueta-usuario-protegido sesion">Sesion actual</strong>
              )}
              {!usuarioProtegido && <strong>Puede eliminarse</strong>}
            </div>
          </div>

          <div className="acciones-vista-usuario">
            {!usuarioProtegido && (
              <button
                type="button"
                className="btn-confirmar-eliminar"
                onClick={confirmarEliminacion}
                disabled={eliminando}
              >
                {eliminando ? 'Eliminando...' : 'Confirmar eliminacion'}
              </button>
            )}
            <button type="button" className="btn-cancelar-eliminar" onClick={() => navigate('/usuarios')} disabled={eliminando}>
              Cancelar
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default UsuarioEliminar
