import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './paginas/Login'
import Panel from './paginas/Panel'
import ProductosPagina from './paginas/ProductosPagina'
import AlertasPagina from './paginas/AlertasPagina'
import RentabilidadPagina from './paginas/RentabilidadPagina'
import VentasPagina from './paginas/VentasPagina'
import ReportesPagina from './paginas/ReportesPagina'
import Sidebar from './componentes/Sidebar'
import './App.css'

function RutaProtegida({ children }) {
  const usuario = localStorage.getItem('usuario')
  return usuario ? (
    <>
      <Sidebar />
      {children}
    </>
  ) : <Navigate to="/" />
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
            <RutaProtegida>
              <ProductosPagina />
            </RutaProtegida>
          }
        />

        <Route
          path="/alertas"
          element={
            <RutaProtegida>
              <AlertasPagina />
            </RutaProtegida>
          }
        />

        <Route
          path="/rentabilidad"
          element={
            <RutaProtegida>
              <RentabilidadPagina />
            </RutaProtegida>
          }
        />

        <Route
          path="/ventas"
          element={
            <RutaProtegida>
              <VentasPagina />
            </RutaProtegida>
          }
        />

        <Route
          path="/reportes"
          element={
            <RutaProtegida>
              <ReportesPagina />
            </RutaProtegida>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
