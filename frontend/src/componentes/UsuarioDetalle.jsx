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

function UsuarioDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const usuarioActual = useMemo(() => obtenerUsuarioActual(), [])
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
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

  return (
    <div className="usuarios-contenedor">
      <div className="encabezado-usuarios">
        <div>
          <span>Detalle del usuario</span>
          <h2>{usuario?.nombre || 'Usuario'}</h2>
        </div>

        <button type="button" className="btn-secundario-usuario" onClick={() => navigate('/usuarios')}>
          Volver a usuarios
        </button>
      </div>

      {cargando && <p className="mensaje-usuario">Cargando usuario...</p>}
      {error && <p className="error-usuario">{error}</p>}

      {!cargando && usuario && (
        <>
          <section className="detalle-usuario-grid">
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
              <span>Estado</span>
              {esAdministradorPrincipal(usuario) && (
                <strong className="etiqueta-usuario-protegido">Administrador principal</strong>
              )}
              {!esAdministradorPrincipal(usuario) && esSesionActual(usuario, usuarioActual) && (
                <strong className="etiqueta-usuario-protegido sesion">Sesion actual</strong>
              )}
              {!esAdministradorPrincipal(usuario) && !esSesionActual(usuario, usuarioActual) && (
                <strong>Editable</strong>
              )}
            </div>
          </section>

          <div className="acciones-vista-usuario">
            <button type="button" className="btn-editar" onClick={() => navigate(`/usuarios/${usuario.id}/editar`)}>
              Editar usuario
            </button>
            {puedeEliminarUsuario(usuario, usuarioActual) && (
              <button type="button" className="btn-eliminar" onClick={() => navigate(`/usuarios/${usuario.id}/eliminar`)}>
                Eliminar usuario
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default UsuarioDetalle
