import { Link, useNavigate } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  const navigate = useNavigate()

  const cerrarSesion = () => {
    localStorage.removeItem('usuario')
    navigate('/')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Botica Salud</h2>
        <p>Sistema Farmacéutico</p>
      </div>

      <nav className="sidebar-menu">
        <Link to="/panel">🏠 Panel</Link>
        <Link to="/productos">📦 Inventario</Link>
        <Link to="/ventas">🧾 Ventas</Link>
        <Link to="/reportes">📄 Reportes</Link>
        <Link to="/alertas">⚠️ Alertas</Link>
        <Link to="/rentabilidad">📊 Rentabilidad</Link>
      </nav>

      <button className="btn-cerrar" onClick={cerrarSesion}>
        Cerrar sesión
      </button>
    </aside>
  )
}

export default Sidebar