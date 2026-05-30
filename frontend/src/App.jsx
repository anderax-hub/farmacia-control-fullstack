import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './paginas/Login'
import Panel from './paginas/Panel'
import ProductosPagina from './paginas/ProductosPagina'
import AlertasPagina from './paginas/AlertasPagina'
import RentabilidadPagina from './paginas/RentabilidadPagina'
import VentasPagina from './paginas/VentasPagina'
import ReportesPagina from './paginas/ReportesPagina'
import UsuariosPagina from './paginas/UsuariosPagina'
import Sidebar from './componentes/Sidebar'
import './App.css'

const obtenerUsuario = () => {
  const usuarioGuardado = localStorage.getItem('usuario')
  return usuarioGuardado ? JSON.parse(usuarioGuardado) : null
}

const tienePermiso = (usuario, rolesPermitidos = []) => {
  if (!usuario) return false
  if (usuario.rol === 'Administrador') return true
  if (rolesPermitidos.length === 0) return true
  return rolesPermitidos.includes(usuario.rol)
}

function RutaProtegida({ children, roles = [] }) {
  const usuario = obtenerUsuario()

  if (!usuario) {
    return <Navigate to="/" />
  }

  if (!tienePermiso(usuario, roles)) {
    return <Navigate to="/panel" />
  }

  return (
    <>
      <Sidebar />
      {children}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/panel"
          element={
            <RutaProtegida>
              <Panel />
            </RutaProtegida>
          }
        />

        <Route
          path="/productos"
          element={
            <RutaProtegida roles={['Inventario']}>
              <ProductosPagina />
            </RutaProtegida>
          }
        />

        <Route
          path="/alertas"
          element={
            <RutaProtegida roles={['Inventario']}>
              <AlertasPagina />
            </RutaProtegida>
          }
        />

        <Route
          path="/rentabilidad"
          element={
            <RutaProtegida roles={['Inventario']}>
              <RentabilidadPagina />
            </RutaProtegida>
          }
        />

        <Route
          path="/ventas"
          element={
            <RutaProtegida roles={['Ventas']}>
              <VentasPagina />
            </RutaProtegida>
          }
        />

        <Route
          path="/reportes"
          element={
            <RutaProtegida roles={['Administrador']}>
              <ReportesPagina />
            </RutaProtegida>
          }
        />

        <Route
          path="/usuarios"
          element={
            <RutaProtegida roles={['Administrador']}>
              <UsuariosPagina />
            </RutaProtegida>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
