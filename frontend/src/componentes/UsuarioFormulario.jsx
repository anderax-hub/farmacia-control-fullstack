import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  API_USUARIOS,
  ROLES_USUARIO,
  USUARIO_FORMULARIO_INICIAL,
  crearFormularioDesdeUsuario,
  crearUsuarioDesdeFormulario,
  esAdministradorPrincipal,
  validarUsuarioFormulario
} from './usuariosUtils'

function UsuarioFormulario({ modo = 'crear' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const esEdicion = modo === 'editar'
  const [usuarios, setUsuarios] = useState([])
  const [usuarioOriginal, setUsuarioOriginal] = useState(null)
  const [formulario, setFormulario] = useState(USUARIO_FORMULARIO_INICIAL)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controlador = new AbortController()

    const cargarFormulario = async () => {
      try {
        const peticiones = [axios.get(API_USUARIOS, { signal: controlador.signal })]

        if (esEdicion) {
          peticiones.push(axios.get(`${API_USUARIOS}/${id}`, { signal: controlador.signal }))
        }

        const [respuestaUsuarios, respuestaUsuario] = await Promise.all(peticiones)

        setUsuarios(respuestaUsuarios.data)

        if (esEdicion) {
          setUsuarioOriginal(respuestaUsuario.data)
          setFormulario(crearFormularioDesdeUsuario(respuestaUsuario.data))
        } else {
          setFormulario(USUARIO_FORMULARIO_INICIAL)
        }

        setError('')
      } catch (errorPeticion) {
        if (errorPeticion.name !== 'CanceledError') {
          console.error('Error al cargar usuario', errorPeticion)
          setError(esEdicion ? 'No se pudo cargar el usuario' : 'No se pudieron cargar los datos')
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }

    cargarFormulario()

    return () => controlador.abort()
  }, [esEdicion, id])

  const actualizarCampo = (campo, valor) => {
    setFormulario((formularioActual) => ({
      ...formularioActual,
      [campo]: valor
    }))
  }

  const guardarUsuario = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')

    const usuario = crearUsuarioDesdeFormulario(formulario)

    if (usuarioOriginal && esAdministradorPrincipal(usuarioOriginal) && usuario.rol !== 'Administrador') {
      setError('El administrador principal debe conservar el rol Administrador')
      setGuardando(false)
      return
    }

    const errorValidacion = validarUsuarioFormulario(usuario, usuarios, esEdicion ? Number(id) : null)

    if (errorValidacion) {
      setError(errorValidacion)
      setGuardando(false)
      return
    }

    try {
      if (esEdicion) {
        await axios.put(`${API_USUARIOS}/${id}`, {
          id: Number(id),
          ...usuario
        })

        navigate('/usuarios', {
          state: { mensaje: 'Usuario actualizado correctamente' }
        })
      } else {
        await axios.post(API_USUARIOS, usuario)

        navigate('/usuarios', {
          state: { mensaje: 'Usuario creado correctamente' }
        })
      }
    } catch (errorPeticion) {
      console.error('Error al guardar usuario', errorPeticion)
      setError(String(errorPeticion.response?.data || 'No se pudo guardar el usuario'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="usuarios-contenedor">
      <div className="encabezado-usuarios">
        <div>
          <span>{esEdicion ? 'Editar usuario' : 'Nuevo usuario'}</span>
          <h2>{esEdicion ? formulario.nombre || 'Editar usuario' : 'Registrar Usuario'}</h2>
        </div>

        <button type="button" className="btn-secundario-usuario" onClick={() => navigate('/usuarios')}>
          Volver a usuarios
        </button>
      </div>

      {cargando && <p className="mensaje-usuario">Cargando usuario...</p>}
      {error && <p className="error-usuario">{error}</p>}

      {!cargando && (
        <form className="formulario-usuario formulario-usuario-vista" onSubmit={guardarUsuario}>
          <input
            type="text"
            placeholder="Nombre"
            value={formulario.nombre}
            onChange={(e) => actualizarCampo('nombre', e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Correo"
            value={formulario.correo}
            onChange={(e) => actualizarCampo('correo', e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Clave"
            value={formulario.clave}
            onChange={(e) => actualizarCampo('clave', e.target.value)}
            required
          />

          <select
            value={formulario.rol}
            onChange={(e) => actualizarCampo('rol', e.target.value)}
            disabled={usuarioOriginal && esAdministradorPrincipal(usuarioOriginal)}
            required
          >
            {ROLES_USUARIO.map((rolDisponible) => (
              <option key={rolDisponible} value={rolDisponible}>
                {rolDisponible}
              </option>
            ))}
          </select>

          {usuarioOriginal && esAdministradorPrincipal(usuarioOriginal) && (
            <p className="aviso-admin-principal">
              El administrador principal no puede cambiar de rol ni eliminarse.
            </p>
          )}

          <div className="acciones-formulario-usuario">
            <button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : esEdicion ? 'Actualizar usuario' : 'Crear usuario'}
            </button>

            <button type="button" className="btn-cancelar" onClick={() => navigate('/usuarios')} disabled={guardando}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default UsuarioFormulario
