import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'

const API_REPORTES = 'https://localhost:7120/api/Reportes/general'

const obtenerValor = (objeto, camel, pascal, respaldo = 0) => {
  return objeto?.[camel] ?? objeto?.[pascal] ?? respaldo
}

const formatearMoneda = (valor) => {
  return `Q ${Number(valor || 0).toFixed(2)}`
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const crearValorCsv = (valor) => {
  return `"${String(valor ?? '').replaceAll('"', '""')}"`
}

const crearFechaInput = (fecha) => {
  return fecha.toISOString().slice(0, 10)
}

function Reportes() {
  const [reporte, setReporte] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [seccionActiva, setSeccionActiva] = useState('resumen')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  const cargarReporte = useCallback(async (signal, filtros = {}) => {
    try {
      setCargando(true)
      const parametros = new URLSearchParams()
      const inicio = filtros.fechaInicio ?? ''
      const fin = filtros.fechaFin ?? ''

      if (inicio) parametros.append('fechaInicio', inicio)
      if (fin) parametros.append('fechaFin', fin)

      const respuesta = await axios.get(API_REPORTES, {
        signal,
        params: parametros
      })

      setReporte(respuesta.data)
      setError('')
    } catch (errorPeticion) {
      if (errorPeticion.name !== 'CanceledError') {
        console.error('Error al obtener reporte general', errorPeticion)
        setError('No se pudo cargar el reporte general')
      }
    } finally {
      if (!signal?.aborted) {
        setCargando(false)
      }
    }
  }, [])

  useEffect(() => {
    const controlador = new AbortController()

    cargarReporte(controlador.signal)

    return () => controlador.abort()
  }, [cargarReporte])

  const totalUsuarios = obtenerValor(reporte, 'totalUsuarios', 'TotalUsuarios')
  const totalProductos = obtenerValor(reporte, 'totalProductos', 'TotalProductos')
  const totalLotes = obtenerValor(reporte, 'totalLotes', 'TotalLotes')
  const totalLotesProximosAVencer = obtenerValor(
    reporte,
    'totalLotesProximosAVencer',
    'TotalLotesProximosAVencer'
  )
  const gananciaPotencialTotal = obtenerValor(
    reporte,
    'gananciaPotencialTotal',
    'GananciaPotencialTotal'
  )
  const totalFacturas = obtenerValor(reporte, 'totalFacturas', 'TotalFacturas')
  const totalProductosVendidos = obtenerValor(
    reporte,
    'totalProductosVendidos',
    'TotalProductosVendidos'
  )
  const totalFacturado = obtenerValor(reporte, 'totalFacturado', 'TotalFacturado')
  const promedioPorFactura = obtenerValor(reporte, 'promedioPorFactura', 'PromedioPorFactura')
  const productosMasVendidos = obtenerValor(reporte, 'productosMasVendidos', 'ProductosMasVendidos', [])
  const clientesConMasCompras = obtenerValor(reporte, 'clientesConMasCompras', 'ClientesConMasCompras', [])
  const ventasPorDia = obtenerValor(reporte, 'ventasPorDia', 'VentasPorDia', [])

  const secciones = [
    { id: 'resumen', texto: 'Resumen' },
    { id: 'ventas', texto: 'Ventas' },
    { id: 'productos', texto: 'Productos' },
    { id: 'clientes', texto: 'Clientes' }
  ]

  const aplicarFiltro = (e) => {
    e.preventDefault()
    cargarReporte(undefined, { fechaInicio, fechaFin })
  }

  const limpiarFiltro = () => {
    setFechaInicio('')
    setFechaFin('')
    cargarReporte(undefined, { fechaInicio: '', fechaFin: '' })
  }

  const aplicarRangoRapido = (dias) => {
    const fin = new Date()
    const inicio = new Date()

    inicio.setDate(fin.getDate() - dias + 1)
    const fechaInicioRapida = crearFechaInput(inicio)
    const fechaFinRapida = crearFechaInput(fin)

    setFechaInicio(fechaInicioRapida)
    setFechaFin(fechaFinRapida)
    cargarReporte(undefined, {
      fechaInicio: fechaInicioRapida,
      fechaFin: fechaFinRapida
    })
  }

  const exportarCsv = () => {
    const filas = [
      ['Reporte general'],
      ['Fecha inicio', fechaInicio || 'Todas'],
      ['Fecha fin', fechaFin || 'Todas'],
      [],
      ['Resumen'],
      ['Usuarios', totalUsuarios],
      ['Productos', totalProductos],
      ['Lotes', totalLotes],
      ['Lotes proximos a vencer', totalLotesProximosAVencer],
      ['Ganancia potencial', formatearMoneda(gananciaPotencialTotal)],
      [],
      ['Ventas'],
      ['Facturas', totalFacturas],
      ['Productos vendidos', totalProductosVendidos],
      ['Total facturado', formatearMoneda(totalFacturado)],
      ['Promedio por factura', formatearMoneda(promedioPorFactura)],
      [],
      ['Productos mas vendidos'],
      ['Producto', 'Presentacion', 'Cantidad', 'Total'],
      ...productosMasVendidos.map((producto) => [
        producto.producto ?? producto.Producto,
        producto.presentacion ?? producto.Presentacion,
        producto.cantidadVendida ?? producto.CantidadVendida,
        formatearMoneda(producto.totalFacturado ?? producto.TotalFacturado)
      ]),
      [],
      ['Clientes con mas compras'],
      ['Cliente', 'Facturas', 'Total'],
      ...clientesConMasCompras.map((cliente) => [
        cliente.cliente ?? cliente.Cliente,
        cliente.facturas ?? cliente.Facturas,
        formatearMoneda(cliente.totalFacturado ?? cliente.TotalFacturado)
      ]),
      [],
      ['Ventas por dia'],
      ['Fecha', 'Facturas', 'Total'],
      ...ventasPorDia.map((venta) => [
        formatearFecha(venta.fecha ?? venta.Fecha),
        venta.facturas ?? venta.Facturas,
        formatearMoneda(venta.totalFacturado ?? venta.TotalFacturado)
      ])
    ]

    const csv = filas.map((fila) => fila.map(crearValorCsv).join(',')).join('\n')
    const archivo = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(archivo)
    const enlace = document.createElement('a')

    enlace.href = url
    enlace.download = 'reporte-general.csv'
    enlace.click()
    URL.revokeObjectURL(url)
  }

  const imprimirReporte = () => {
    window.print()
  }

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
          <form className="reportes-filtros" onSubmit={aplicarFiltro}>
            <div className="reportes-filtros-info">
              <span>Periodo de ventas</span>
              <strong>Filtra facturas, productos vendidos, clientes y ventas por dia.</strong>
            </div>
            <div>
              <label htmlFor="fecha-inicio-reporte">Desde</label>
              <input
                id="fecha-inicio-reporte"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="fecha-fin-reporte">Hasta</label>
              <input
                id="fecha-fin-reporte"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <button type="submit">Aplicar</button>
            <button type="button" onClick={() => aplicarRangoRapido(7)}>
              7 dias
            </button>
            <button type="button" onClick={() => aplicarRangoRapido(30)}>
              30 dias
            </button>
            <button type="button" onClick={limpiarFiltro}>
              Limpiar
            </button>
          </form>

          <div className="reportes-exportar">
            <span>
              Rango aplicado: {fechaInicio || 'Todas'} - {fechaFin || 'Todas'}
            </span>
            <div>
              <button type="button" onClick={exportarCsv}>
                Exportar CSV
              </button>
              <button type="button" onClick={imprimirReporte}>
                Imprimir / PDF
              </button>
            </div>
          </div>

          <nav className="reportes-tabs" aria-label="Secciones de reportes">
            {secciones.map((seccion) => (
              <button
                type="button"
                className={seccionActiva === seccion.id ? 'activo' : ''}
                key={seccion.id}
                onClick={() => setSeccionActiva(seccion.id)}
              >
                {seccion.texto}
              </button>
            ))}
          </nav>

          {seccionActiva === 'resumen' && (
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
                  <strong>{formatearMoneda(gananciaPotencialTotal)}</strong>
                </div>
              </section>

              <section className="reporte-detalle">
                <h3>Detalle general</h3>
                <div className="tabla-responsive">
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
                        <td>{formatearMoneda(gananciaPotencialTotal)}</td>
                      </tr>
                      <tr>
                        <th>Total facturado en ventas</th>
                        <td>{formatearMoneda(totalFacturado)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {seccionActiva === 'ventas' && (
            <>
              <section className="reportes-grid ventas">
                <div className="reporte-card facturas">
                  <span>Facturas</span>
                  <strong>{totalFacturas}</strong>
                </div>

                <div className="reporte-card vendidos">
                  <span>Productos vendidos</span>
                  <strong>{totalProductosVendidos}</strong>
                </div>

                <div className="reporte-card facturado">
                  <span>Total facturado</span>
                  <strong>{formatearMoneda(totalFacturado)}</strong>
                </div>

                <div className="reporte-card promedio">
                  <span>Promedio por factura</span>
                  <strong>{formatearMoneda(promedioPorFactura)}</strong>
                </div>
              </section>

              <section className="reporte-detalle">
                <h3>Ventas por dia</h3>
                <div className="tabla-responsive">
                  <table className="tabla-reportes">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Facturas</th>
                        <th>Total facturado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventasPorDia.length === 0 && (
                        <tr>
                          <td colSpan="3">No hay ventas registradas</td>
                        </tr>
                      )}
                      {ventasPorDia.map((venta) => (
                        <tr key={venta.fecha ?? venta.Fecha}>
                          <th>{formatearFecha(venta.fecha ?? venta.Fecha)}</th>
                          <td>{venta.facturas ?? venta.Facturas}</td>
                          <td>{formatearMoneda(venta.totalFacturado ?? venta.TotalFacturado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {seccionActiva === 'productos' && (
            <section className="reporte-detalle">
              <h3>Productos mas vendidos</h3>
              <div className="tabla-responsive">
                <table className="tabla-reportes">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosMasVendidos.length === 0 && (
                      <tr>
                        <td colSpan="3">No hay ventas registradas</td>
                      </tr>
                    )}
                    {productosMasVendidos.map((producto) => (
                      <tr key={`${producto.producto ?? producto.Producto}-${producto.presentacion ?? producto.Presentacion}`}>
                        <th>
                          {producto.producto ?? producto.Producto}
                          <small>{producto.presentacion ?? producto.Presentacion}</small>
                        </th>
                        <td>{producto.cantidadVendida ?? producto.CantidadVendida}</td>
                        <td>{formatearMoneda(producto.totalFacturado ?? producto.TotalFacturado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {seccionActiva === 'clientes' && (
            <section className="reporte-detalle">
              <h3>Clientes con mas compras</h3>
              <div className="tabla-responsive">
                <table className="tabla-reportes">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Facturas</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesConMasCompras.length === 0 && (
                      <tr>
                        <td colSpan="3">No hay clientes registrados</td>
                      </tr>
                    )}
                    {clientesConMasCompras.map((cliente) => (
                      <tr key={cliente.cliente ?? cliente.Cliente}>
                        <th>{cliente.cliente ?? cliente.Cliente}</th>
                        <td>{cliente.facturas ?? cliente.Facturas}</td>
                        <td>{formatearMoneda(cliente.totalFacturado ?? cliente.TotalFacturado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default Reportes
