import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  API_VENTAS,
  OPCIONES_FACTURAS_POR_PAGINA,
  agruparVentasPorFactura,
  descargarFactura,
  formatearFechaHora,
  formatearMoneda,
  imprimirFactura,
  normalizarTexto,
  obtenerCliente,
  obtenerDetallesFactura,
  obtenerNombreDetalle,
  obtenerNumeroFactura,
  obtenerTipoCliente,
  obtenerTotalFactura
} from './ventasUtils'

function Ventas() {
  const navigate = useNavigate()
  const location = useLocation()
  const mensajeRuta = location.state?.mensaje
  const [ventas, setVentas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [paginaFacturas, setPaginaFacturas] = useState(1)
  const [facturasPorPagina, setFacturasPorPagina] = useState(10)
  const [cargando, setCargando] = useState(true)
  const [mensaje] = useState(mensajeRuta || '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (mensajeRuta) {
      navigate('/ventas', { replace: true, state: null })
    }
  }, [mensajeRuta, navigate])

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
          console.error('Error al cargar ventas', errorPeticion)
          setError('No se pudieron cargar las ventas')
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      })

    return () => controlador.abort()
  }, [])

  const facturas = useMemo(() => agruparVentasPorFactura(ventas), [ventas])

  const facturasFiltradas = useMemo(() => {
    const texto = normalizarTexto(busqueda)
    const fechaDesde = fechaInicio ? new Date(`${fechaInicio}T00:00:00`) : null
    const fechaHasta = fechaFin ? new Date(`${fechaFin}T23:59:59`) : null

    return facturas.filter((factura) => {
      const fechaFactura = new Date(factura.fecha)
      const detalles = obtenerDetallesFactura(factura)
      const coincideTexto = !texto || [
        obtenerNumeroFactura(factura),
        obtenerCliente(factura),
        obtenerTipoCliente(factura),
        ...detalles.flatMap((detalle) => [
          detalle.productoNombre,
          detalle.categoria,
          detalle.presentacionVenta
        ])
      ].some((valor) => normalizarTexto(valor).includes(texto))

      const coincideDesde = !fechaDesde || fechaFactura >= fechaDesde
      const coincideHasta = !fechaHasta || fechaFactura <= fechaHasta

      return coincideTexto && coincideDesde && coincideHasta
    })
  }, [busqueda, facturas, fechaFin, fechaInicio])

  const resumenVentas = useMemo(() => {
    return facturasFiltradas.reduce((resumen, factura) => {
      const detalles = obtenerDetallesFactura(factura)

      return {
        totalVentas: resumen.totalVentas + 1,
        totalUnidades: resumen.totalUnidades + detalles.reduce((total, detalle) => {
          return total + Number(detalle.cantidad || 0)
        }, 0),
        totalFacturado: resumen.totalFacturado + obtenerTotalFactura(factura)
      }
    }, {
      totalVentas: 0,
      totalUnidades: 0,
      totalFacturado: 0
    })
  }, [facturasFiltradas])

  const totalPaginasFacturas = Math.max(1, Math.ceil(facturasFiltradas.length / facturasPorPagina))
  const paginaFacturasMostrada = Math.min(paginaFacturas, totalPaginasFacturas)
  const indiceInicialFacturas = (paginaFacturasMostrada - 1) * facturasPorPagina
  const indiceFinalFacturas = indiceInicialFacturas + facturasPorPagina
  const primeraFacturaPagina = facturasFiltradas.length === 0 ? 0 : indiceInicialFacturas + 1
  const ultimaFacturaPagina = Math.min(indiceFinalFacturas, facturasFiltradas.length)

  const facturasPaginadas = useMemo(() => {
    return facturasFiltradas.slice(indiceInicialFacturas, indiceFinalFacturas)
  }, [facturasFiltradas, indiceFinalFacturas, indiceInicialFacturas])

  const limpiarFiltros = () => {
    setBusqueda('')
    setFechaInicio('')
    setFechaFin('')
    setPaginaFacturas(1)
  }

  const irAPaginaAnteriorFacturas = () => {
    setPaginaFacturas((pagina) => Math.max(1, pagina - 1))
  }

  const irAPaginaSiguienteFacturas = () => {
    setPaginaFacturas((pagina) => Math.min(totalPaginasFacturas, pagina + 1))
  }

  return (
    <div className="ventas-contenedor">
      <div className="encabezado-ventas">
        <div>
          <span>Ventas</span>
          <h2>Historial de Facturas</h2>
        </div>

        <button type="button" className="btn-nueva-venta" onClick={() => navigate('/ventas/nueva')}>
          Nueva venta
        </button>
      </div>

      {mensaje && <p className="mensaje-venta">{mensaje}</p>}
      {error && <p className="error-venta">{error}</p>}
      {cargando && <p className="mensaje-venta">Cargando ventas...</p>}

      <section className="resumen-ventas">
        <div>
          <span>Facturas</span>
          <strong>{resumenVentas.totalVentas}</strong>
        </div>
        <div>
          <span>Productos vendidos</span>
          <strong>{resumenVentas.totalUnidades}</strong>
        </div>
        <div>
          <span>Total facturado</span>
          <strong>Q {formatearMoneda(resumenVentas.totalFacturado)}</strong>
        </div>
      </section>

      <section className="historial-ventas">
        <div className="historial-ventas-encabezado">
          <h3>Facturas registradas</h3>
          <span>{facturasFiltradas.length} de {facturas.length} facturas</span>
        </div>

        <div className="filtros-ventas">
          <input
            type="search"
            placeholder="Buscar factura, cliente, producto o presentacion"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setPaginaFacturas(1)
            }}
          />
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => {
              setFechaInicio(e.target.value)
              setPaginaFacturas(1)
            }}
          />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => {
              setFechaFin(e.target.value)
              setPaginaFacturas(1)
            }}
          />
          <button type="button" onClick={limpiarFiltros}>
            Limpiar
          </button>
        </div>
      </section>

      {!cargando && facturasFiltradas.length === 0 && (
        <p className="mensaje-venta">No hay facturas para mostrar.</p>
      )}

      {!cargando && facturasFiltradas.length > 0 && (
        <>
          <div className="tabla-ventas-wrapper">
            <table className="tabla-ventas">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>A nombre de</th>
                  <th>Tipo</th>
                  <th>Productos</th>
                  <th>Fecha</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturasPaginadas.map((factura) => {
                  const detalles = obtenerDetallesFactura(factura)
                  const numeroFactura = obtenerNumeroFactura(factura)

                  return (
                    <tr key={numeroFactura}>
                      <td className="celda-factura">{numeroFactura}</td>
                      <td className="celda-cliente">{obtenerCliente(factura)}</td>
                      <td className="tipo-cliente">{obtenerTipoCliente(factura)}</td>
                      <td className="celda-venta-producto">
                        <div className="productos-factura-resumen">
                          {detalles.map((detalle) => (
                            <span key={detalle.id || detalle.productoId}>
                              {obtenerNombreDetalle(detalle)} ({detalle.cantidad})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{formatearFechaHora(factura.fecha)}</td>
                      <td>{detalles.reduce((total, detalle) => total + Number(detalle.cantidad || 0), 0)}</td>
                      <td>Q {formatearMoneda(obtenerTotalFactura(factura))}</td>
                      <td>
                        <div className="acciones-factura">
                          <button type="button" onClick={() => navigate(`/ventas/facturas/${encodeURIComponent(numeroFactura)}`)}>
                            Ver
                          </button>
                          <button type="button" onClick={() => imprimirFactura(factura, setError)}>
                            Imprimir
                          </button>
                          <button type="button" onClick={() => descargarFactura(factura)}>
                            Descargar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="paginacion-ventas">
            <span>
              Mostrando {primeraFacturaPagina}-{ultimaFacturaPagina} de {facturasFiltradas.length}
            </span>

            <div className="paginacion-controles">
              <button
                type="button"
                onClick={irAPaginaAnteriorFacturas}
                disabled={paginaFacturasMostrada === 1}
              >
                Anterior
              </button>

              <strong>
                Pagina {paginaFacturasMostrada} de {totalPaginasFacturas}
              </strong>

              <button
                type="button"
                onClick={irAPaginaSiguienteFacturas}
                disabled={paginaFacturasMostrada === totalPaginasFacturas}
              >
                Siguiente
              </button>
            </div>

            <label>
              Por pagina
              <select
                value={facturasPorPagina}
                onChange={(e) => {
                  setFacturasPorPagina(Number(e.target.value))
                  setPaginaFacturas(1)
                }}
              >
                {OPCIONES_FACTURAS_POR_PAGINA.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </>
      )}
    </div>
  )
}

export default Ventas
