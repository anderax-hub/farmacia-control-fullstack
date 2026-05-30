import { NavLink, useNavigate } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const esAdministrador = usuario?.rol === 'Administrador'
  const puedeInventario = esAdministrador || usuario?.rol === 'Inventario'
  const puedeVentas = esAdministrador || usuario?.rol === 'Ventas'

  const cerrarSesion = () => {
    localStorage.removeItem('usuario')
    navigate('/')
  }

  const obtenerClaseEnlace = ({ isActive }) => {
    return isActive ? 'activo' : ''
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Botica Salud</h2>
        <p>Sistema Farmaceutico</p>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/panel" className={obtenerClaseEnlace}>Panel</NavLink>
        {puedeInventario && (
          <NavLink to="/productos" className={obtenerClaseEnlace}>
            Inventario
          </NavLink>
        )}
        {puedeVentas && (
          <NavLink to="/ventas" className={obtenerClaseEnlace}>
            Ventas
          </NavLink>
        )}
        {esAdministrador && (
          <NavLink to="/usuarios" className={obtenerClaseEnlace}>
            Usuarios
          </NavLink>
        )}
        {esAdministrador && (
          <NavLink to="/reportes" className={obtenerClaseEnlace}>
            Reportes
          </NavLink>
        )}
        {puedeInventario && (
          <NavLink to="/alertas" className={obtenerClaseEnlace}>
            Alertas
          </NavLink>
        )}
        {puedeInventario && (
          <NavLink to="/rentabilidad" className={obtenerClaseEnlace}>
            Rentabilidad
          </NavLink>
        )}
      </nav>

      <button className="btn-cerrar" onClick={cerrarSesion}>
        Cerrar sesion
      </button>
    </aside>
  )
}

export default Sidebar
