import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  API_VENTAS,
  agruparVentasPorFactura,
  descargarFactura,
  formatearFechaHora,
  formatearMoneda,
  imprimirFactura,
  obtenerCliente,
  obtenerDetallesFactura,
  obtenerNombreDetalle,
  obtenerNumeroFactura,
  obtenerTipoCliente,
  obtenerTotalFactura
} from './ventasUtils'

function VentaDetalle() {
  const { numeroFactura } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const mensajeRuta = location.state?.mensaje
  const numeroBuscado = decodeURIComponent(numeroFactura || '')
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje] = useState(mensajeRuta || '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (mensajeRuta) {
      navigate(`/ventas/facturas/${encodeURIComponent(numeroBuscado)}`, { replace: true, state: null })
    }
  }, [mensajeRuta, navigate, numeroBuscado])

  useEffect(() => {
    const controlador = new AbortController()

    axios
      .get(API_VENTAS, {
        signal: controlador.signal
      })
      .then((respuesta) => {
        setVentas(respuesta.data)
        setError('')
      })
      .catch((errorPeticion) => {
        if (errorPeticion.name !== 'CanceledError') {
          console.error('Error al cargar factura', errorPeticion)
          setError('No se pudo cargar la factura')
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      })

    return () => controlador.abort()
  }, [])

  const factura = useMemo(() => {
    return agruparVentasPorFactura(ventas).find((facturaActual) => {
      return obtenerNumeroFactura(facturaActual).toLowerCase() === numeroBuscado.toLowerCase()
    })
  }, [numeroBuscado, ventas])

  const detalles = factura ? obtenerDetallesFactura(factura) : []

  return (
    <div className="ventas-contenedor">
      <div className="encabezado-ventas">
        <div>
          <span>Detalle de factura</span>
          <h2>{numeroBuscado || 'Factura'}</h2>
        </div>

        <button type="button" className="btn-secundario-venta" onClick={() => navigate('/ventas')}>
          Volver a ventas
        </button>
      </div>

      {mensaje && <p className="mensaje-venta">{mensaje}</p>}
      {error && <p className="error-venta">{error}</p>}
      {cargando && <p className="mensaje-venta">Cargando factura...</p>}

      {!cargando && !factura && (
        <p className="error-venta">No se encontro la factura solicitada</p>
      )}

      {!cargando && factura && (
        <article className="factura-card factura-card-vista">
          <header className="factura-card-encabezado">
            <div>
              <span>Factura</span>
              <h3>{obtenerNumeroFactura(factura)}</h3>
            </div>
          </header>

          <section className="factura-datos">
            <div>
              <span>Fecha</span>
              <strong>{formatearFechaHora(factura.fecha)}</strong>
            </div>
            <div>
              <span>A nombre de</span>
              <strong>{obtenerCliente(factura)}</strong>
            </div>
            <div>
              <span>Tipo</span>
              <strong>{obtenerTipoCliente(factura)}</strong>
            </div>
          </section>

          <div className="tabla-responsive">
            <table className="factura-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle) => (
                  <tr key={detalle.id || detalle.productoId}>
                    <td>{obtenerNombreDetalle(detalle)}</td>
                    <td>{detalle.cantidad}</td>
                    <td>Q {formatearMoneda(detalle.precioUnitario)}</td>
                    <td>Q {formatearMoneda(detalle.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="factura-total">
            Total: Q {formatearMoneda(obtenerTotalFactura(factura))}
          </div>

          <div className="factura-acciones">
            <button type="button" onClick={() => imprimirFactura(factura, setError)}>
              Imprimir
            </button>
            <button type="button" onClick={() => descargarFactura(factura)}>
              Descargar
            </button>
          </div>
        </article>
      )}
    </div>
  )
}

export default VentaDetalle
