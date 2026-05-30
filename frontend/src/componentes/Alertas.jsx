import { useEffect, useState } from 'react'
import axios from 'axios'

function Alertas() {
  const [lotes, setLotes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controlador = new AbortController()

    axios
      .get('https://localhost:7120/api/Lotes/proximos-a-vencer', {
        signal: controlador.signal
      })
      .then((respuesta) => {
        setLotes(respuesta.data)
        setError('')
      })
      .catch((errorPeticion) => {
        if (errorPeticion.name !== 'CanceledError') {
          console.error('Error al obtener alertas', errorPeticion)
          setError('No se pudieron cargar las alertas')
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      })

    return () => controlador.abort()
  }, [])

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const obtenerTextoDias = (dias) => {
    if (dias < 0) {
      return `Vencido hace ${Math.abs(dias)} dias`
    }

    if (dias === 0) {
      return 'Vence hoy'
    }

    return `${dias} dias`
  }

  const obtenerClaseDias = (dias) => {
    if (dias < 0) return 'vencido'
    if (dias <= 7) return 'urgente'
    return 'proximo'
  }

  return (
    <div className="alertas-contenedor">
      <h2>Alertas de vencimiento</h2>

      {cargando && <p className="mensaje-alerta">Cargando alertas...</p>}

      {error && <p className="error-alerta">{error}</p>}

      {!cargando && !error && lotes.length === 0 && (
        <p className="mensaje-alerta">No hay productos proximos a vencer.</p>
      )}

      {!cargando && !error && lotes.length > 0 && (
        <div className="tabla-responsive">
          <table className="tabla-alertas">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Fecha de vencimiento</th>
                <th>Cantidad</th>
                <th>Dias restantes</th>
              </tr>
            </thead>
            <tbody>
              {lotes.map((lote) => (
                <tr key={lote.id}>
                  <td>{lote.productoNombre || `Producto ${lote.productoId}`}</td>
                  <td>{formatearFecha(lote.fechaVencimiento)}</td>
                  <td>{lote.cantidad}</td>
                  <td>
                    <span className={`estado-vencimiento ${obtenerClaseDias(lote.diasRestantes)}`}>
                      {obtenerTextoDias(lote.diasRestantes)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Alertas
