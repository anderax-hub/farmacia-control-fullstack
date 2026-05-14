import { useEffect, useState } from 'react'
import axios from 'axios'

function Reportes() {
  const [reporte, setReporte] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controlador = new AbortController()

    axios
      .get('https://localhost:7120/api/Reportes/general', {
        signal: controlador.signal
      })
      .then((respuesta) => {
        setReporte(respuesta.data)
        setError('')
      })
      .catch((errorPeticion) => {
        if (errorPeticion.name !== 'CanceledError') {
          console.error('Error al obtener reporte general', errorPeticion)
          setError('No se pudo cargar el reporte general')
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      })

    return () => controlador.abort()
  }, [])

  const totalUsuarios = reporte?.totalUsuarios ?? reporte?.TotalUsuarios ?? 0
  const totalProductos = reporte?.totalProductos ?? reporte?.TotalProductos ?? 0
  const totalLotes = reporte?.totalLotes ?? reporte?.TotalLotes ?? 0
  const totalLotesProximosAVencer =
    reporte?.totalLotesProximosAVencer ?? reporte?.TotalLotesProximosAVencer ?? 0
  const gananciaPotencialTotal =
    reporte?.gananciaPotencialTotal ?? reporte?.GananciaPotencialTotal ?? 0

  return (
    <div className="reportes-contenedor">
      <div className="reportes-encabezado">
        <h2>Reporte general</h2>
        <p>Resumen actual del sistema de farmacia</p>
      </div>

      {cargando && <p className="mensaje-reporte">Cargando reporte...</p>}

      {error && <p className="error-reporte">{error}</p>}

      {!cargando && !error && (
        <>
          <section className="reportes-grid">
            <div className="reporte-card usuarios">
              <span>Usuarios</span>
              <strong>{totalUsuarios}</strong>
            </div>

            <div className="reporte-card productos">
              <span>Productos</span>
              <strong>{totalProductos}</strong>
            </div>

            <div className="reporte-card lotes">
              <span>Lotes</span>
              <strong>{totalLotes}</strong>
            </div>

            <div className="reporte-card alertas">
              <span>Proximos a vencer</span>
              <strong>{totalLotesProximosAVencer}</strong>
            </div>

            <div className="reporte-card ganancia">
              <span>Ganancia potencial</span>
              <strong>Q {Number(gananciaPotencialTotal).toFixed(2)}</strong>
            </div>
          </section>

          <section className="reporte-detalle">
            <h3>Detalle</h3>
            <table className="tabla-reportes">
              <tbody>
                <tr>
                  <th>Total de usuarios</th>
                  <td>{totalUsuarios}</td>
                </tr>
                <tr>
                  <th>Total de productos</th>
                  <td>{totalProductos}</td>
                </tr>
                <tr>
                  <th>Total de lotes</th>
                  <td>{totalLotes}</td>
                </tr>
                <tr>
                  <th>Lotes proximos a vencer</th>
                  <td>{totalLotesProximosAVencer}</td>
                </tr>
                <tr>
                  <th>Ganancia potencial total</th>
                  <td>Q {Number(gananciaPotencialTotal).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  )
}

export default Reportes
