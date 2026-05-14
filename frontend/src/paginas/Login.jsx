import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Login.css'

function Login() {
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const navigate = useNavigate()

  const iniciarSesion = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const respuesta = await axios.post('https://localhost:7120/api/Usuarios/login', {
        correo: correo.trim(),
        clave
      })

      const usuario = respuesta.data

      localStorage.setItem('usuario', JSON.stringify({
        id: usuario.id ?? usuario.Id,
        nombre: usuario.nombre ?? usuario.Nombre,
        correo: usuario.correo ?? usuario.Correo,
        rol: usuario.rol ?? usuario.Rol
      }))

      navigate('/panel')
    } catch (errorPeticion) {
      console.error('Error al iniciar sesion', errorPeticion)

      if (errorPeticion.response?.status === 401) {
        setError('Correo o contrasena incorrectos')
      } else {
        setError('No se pudo conectar con el servidor')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Botica Salud</h1>
          <p>Sistema de Inventario y Ventas</p>
        </div>

        <form className="login-body" onSubmit={iniciarSesion}>
          <input
            type="email"
            placeholder="Ingrese su correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            disabled={cargando}
            required
          />

          <input
            type="password"
            placeholder="Ingrese su contrasena"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            disabled={cargando}
            required
          />

          <button
            type="submit"
            className="btn-login"
            disabled={cargando}
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>

          {error && (
            <p className="error-login">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default Login
