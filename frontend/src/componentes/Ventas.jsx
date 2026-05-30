import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_VENTAS = 'https://localhost:7120/api/Ventas'
const API_FACTURA = 'https://localhost:7120/api/Ventas/factura'
const API_PRODUCTOS = 'https://localhost:7120/api/Productos'

const formatearMoneda = (valor) => {
  return Number(valor || 0).toFixed(2)
}

const formatearFechaHora = (valor) => {
  return new Date(valor).toLocaleString()
}

const normalizarTexto = (valor) => {
  return String(valor || '').trim().toLowerCase()
}

const escaparHtml = (valor) => {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

const obtenerNumeroFactura = (factura) => {
  return factura.numeroFactura || `FAC-${String(factura.id || 0).padStart(6, '0')}`
}

const obtenerCliente = (factura) => {
  return factura.cliente?.trim() || 'Consumidor final'
}

const obtenerTipoCliente = () => {
  return 'Consumidor final'
}

const obtenerPresentacion = (producto) => {
  const presentacion = producto.presentacionVenta || 'Unidad'
  const unidades = Number(producto.unidadesPorPresentacion) || 1
  return `${presentacion} x${unidades}`
}

const obtenerNombreDetalle = (detalle) => {
  const nombre = detalle.productoNombre || `Producto ${detalle.productoId}`
  const presentacion = detalle.presentacionVenta || 'Unidad'
  const unidades = Number(detalle.unidadesPorPresentacion) || 1
  return `${nombre} - ${presentacion} x${unidades}`
}

const obtenerDetallesFactura = (factura) => {
  if (Array.isArray(factura.detalles)) {
    return factura.detalles
  }

  return [
    {
      id: factura.id,
      productoId: factura.productoId,
      productoNombre: factura.productoNombre,
      categoria: factura.categoria,
      presentacionVenta: factura.presentacionVenta,
      unidadesPorPresentacion: factura.unidadesPorPresentacion,
      cantidad: factura.cantidad,
      precioUnitario: factura.precioUnitario,
      total: factura.total
    }
  ]
}

const obtenerTotalFactura = (factura) => {
  return obtenerDetallesFactura(factura).reduce((total, detalle) => {
    return total + Number(detalle.total || 0)
  }, 0)
}

const agruparVentasPorFactura = (ventas) => {
  const facturas = new Map()

  ventas.forEach((venta) => {
    const numeroFactura = obtenerNumeroFactura(venta)

    if (!facturas.has(numeroFactura)) {
      facturas.set(numeroFactura, {
        id: venta.id,
        numeroFactura,
        cliente: obtenerCliente(venta),
        tipoCliente: obtenerTipoCliente(venta),
        fecha: venta.fecha,
        detalles: []
      })
    }

    const factura = facturas.get(numeroFactura)

    factura.detalles.push({
      id: venta.id,
      productoId: venta.productoId,
      productoNombre: venta.productoNombre,
      categoria: venta.categoria,
      presentacionVenta: venta.presentacionVenta,
      unidadesPorPresentacion: venta.unidadesPorPresentacion,
      cantidad: venta.cantidad,
      precioUnitario: venta.precioUnitario,
      total: venta.total
    })

    if (new Date(venta.fecha) < new Date(factura.fecha)) {
      factura.fecha = venta.fecha
    }
  })

  return [...facturas.values()].sort((facturaA, facturaB) => {
    return new Date(facturaB.fecha) - new Date(facturaA.fecha)
  })
}

const crearHtmlFactura = (factura) => {
  const numeroFactura = obtenerNumeroFactura(factura)
  const cliente = obtenerCliente(factura)
  const tipoCliente = obtenerTipoCliente(factura)
  const detalles = obtenerDetallesFactura(factura)
  const filas = detalles.map((detalle) => `
        <tr>
          <td>${escaparHtml(obtenerNombreDetalle(detalle))}</td>
          <td class="numero">${escaparHtml(detalle.cantidad)}</td>
          <td class="numero">Q ${escaparHtml(formatearMoneda(detalle.precioUnitario))}</td>
          <td class="numero">Q ${escaparHtml(formatearMoneda(detalle.total))}</td>
        </tr>`).join('')

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escaparHtml(numeroFactura)}</title>
  <style>
    * { box-sizing: border-box; }
    body { color: #111827; font-family: Arial, sans-serif; margin: 0; padding: 32px; }
    .factura { border: 1px solid #e5e7eb; margin: 0 auto; max-width: 760px; padding: 28px; }
    .encabezado { align-items: flex-start; border-bottom: 2px solid #111827; display: flex; justify-content: space-between; padding-bottom: 18px; }
    h1 { font-size: 26px; margin: 0 0 6px; }
    h2 { font-size: 18px; margin: 0; text-align: right; }
    p { margin: 4px 0; }
    .muted { color: #6b7280; }
    .datos { display: grid; gap: 12px; grid-template-columns: repeat(3, 1fr); margin: 24px 0; }
    .datos div { background: #f9fafb; border-left: 4px solid #2563eb; padding: 12px; }
    .datos span { color: #4b5563; display: block; font-size: 12px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; }
    table { border-collapse: collapse; margin-top: 18px; width: 100%; }
    th, td { border-bottom: 1px solid #e5e7eb; padding: 12px; text-align: left; }
    th { background: #f3f4f6; font-size: 12px; text-transform: uppercase; }
    .numero { text-align: right; }
    .total { border-top: 2px solid #111827; font-size: 20px; font-weight: bold; margin-left: auto; margin-top: 24px; padding-top: 14px; text-align: right; width: 260px; }
    @media print { body { padding: 0; } .factura { border: none; max-width: none; } }
  </style>
</head>
<body>
  <main class="factura">
    <header class="encabezado">
      <div>
        <h1>Farmacia Control</h1>
        <p class="muted">Comprobante de venta</p>
      </div>
      <div>
        <h2>${escaparHtml(numeroFactura)}</h2>
        <p>${escaparHtml(formatearFechaHora(factura.fecha))}</p>
      </div>
    </header>

    <section class="datos">
      <div>
        <span>A nombre de</span>
        <strong>${escaparHtml(cliente)}</strong>
      </div>
      <div>
        <span>Tipo</span>
        <strong>${escaparHtml(tipoCliente)}</strong>
      </div>
      <div>
        <span>Articulos</span>
        <strong>${escaparHtml(detalles.length)}</strong>
      </div>
    </section>

    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th class="numero">Cantidad</th>
          <th class="numero">Precio</th>
          <th class="numero">Total</th>
        </tr>
      </thead>
      <tbody>
${filas}
      </tbody>
    </table>

    <div class="total">Total: Q ${escaparHtml(formatearMoneda(obtenerTotalFactura(factura)))}</div>
  </main>
</body>
</html>`
}

function Ventas() {
  const [ventas, setVentas] = useState([])
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [productoId, setProductoId] = useState('')
  const [cliente, setCliente] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [facturaActual, setFacturaActual] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const productosOrdenados = useMemo(() => {
    return [...productos].sort((productoA, productoB) => {
      const nombreA = `${productoA.nombre} ${productoA.presentacionVenta}`
      const nombreB = `${productoB.nombre} ${productoB.presentacionVenta}`
      return nombreA.localeCompare(nombreB)
    })
  }, [productos])

  const productoSeleccionado = useMemo(() => {
    return productos.find((producto) => String(producto.id) === productoId)
  }, [productoId, productos])

  const cantidadNumerica = Number.parseInt(cantidad, 10)
  const totalEstimado = productoSeleccionado && Number.isInteger(cantidadNumerica)
    ? productoSeleccionado.precio * cantidadNumerica
    : 0

  const totalCarrito = useMemo(() => {
    return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0)
  }, [carrito])

  const cantidadCarrito = useMemo(() => {
    return carrito.reduce((total, item) => total + item.cantidad, 0)
  }, [carrito])

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

  const obtenerVentas = async () => {
    const respuesta = await axios.get(API_VENTAS)
    setVentas(respuesta.data)
  }

  const obtenerProductos = async () => {
    const respuesta = await axios.get(API_PRODUCTOS)
    setProductos(respuesta.data)
  }

  const cargarDatos = async () => {
    try {
      setCargando(true)
      const [respuestaVentas, respuestaProductos] = await Promise.all([
        axios.get(API_VENTAS),
        axios.get(API_PRODUCTOS)
      ])

      setVentas(respuestaVentas.data)
      setProductos(respuestaProductos.data)
      setError('')
    } catch (errorPeticion) {
      console.error('Error al cargar ventas', errorPeticion)
      setError('No se pudieron cargar las ventas')
    } finally {
      setCargando(false)
    }
  }

  const agregarAlCarrito = (e) => {
    e.preventDefault()
    setMensaje('')
    setError('')

    if (!productoSeleccionado) {
      setError('Selecciona un producto con su presentacion')
      return
    }

    if (!Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0) {
      setError('La cantidad debe ser mayor a cero')
      return
    }

    const itemExistente = carrito.find((item) => item.productoId === productoSeleccionado.id)
    const nuevaCantidad = (itemExistente?.cantidad || 0) + cantidadNumerica

    if (nuevaCantidad > productoSeleccionado.cantidad) {
      setError('No hay suficiente stock disponible para esa presentacion')
      return
    }

    setCarrito((carritoActual) => {
      if (itemExistente) {
        return carritoActual.map((item) => {
          if (item.productoId !== productoSeleccionado.id) return item

          return {
            ...item,
            cantidad: nuevaCantidad,
            total: nuevaCantidad * item.precio
          }
        })
      }

      return [
        ...carritoActual,
        {
          productoId: productoSeleccionado.id,
          nombre: productoSeleccionado.nombre,
          categoria: productoSeleccionado.categoria,
          presentacionVenta: productoSeleccionado.presentacionVenta || 'Unidad',
          unidadesPorPresentacion: productoSeleccionado.unidadesPorPresentacion || 1,
          precio: Number(productoSeleccionado.precio || 0),
          stock: Number(productoSeleccionado.cantidad || 0),
          cantidad: cantidadNumerica,
          total: Number(productoSeleccionado.precio || 0) * cantidadNumerica
        }
      ]
    })

    setProductoId('')
    setCantidad('')
  }

  const actualizarCantidadCarrito = (productoIdActual, nuevaCantidad) => {
    const cantidadActualizada = Number.parseInt(nuevaCantidad, 10)

    if (!Number.isInteger(cantidadActualizada) || cantidadActualizada < 1) return

    setCarrito((carritoActual) => carritoActual.map((item) => {
      if (item.productoId !== productoIdActual) return item

      const cantidadSegura = Math.min(cantidadActualizada, item.stock)

      return {
        ...item,
        cantidad: cantidadSegura,
        total: cantidadSegura * item.precio
      }
    }))
  }

  const quitarDelCarrito = (productoIdActual) => {
    setCarrito((carritoActual) => carritoActual.filter((item) => item.productoId !== productoIdActual))
  }

  const imprimirFactura = (factura) => {
    const ventanaFactura = window.open('', '_blank', 'width=840,height=920')

    if (!ventanaFactura) {
      setError('No se pudo abrir la ventana de impresion')
      return
    }

    ventanaFactura.document.write(crearHtmlFactura(factura))
    ventanaFactura.document.close()
    ventanaFactura.focus()
    setTimeout(() => ventanaFactura.print(), 250)
  }

  const descargarFactura = (factura) => {
    const numeroFactura = obtenerNumeroFactura(factura)
    const archivo = new Blob([crearHtmlFactura(factura)], { type: 'text/html;charset=utf-8;' })
    const url = URL.createObjectURL(archivo)
    const enlace = document.createElement('a')

    enlace.href = url
    enlace.download = `${numeroFactura}.html`
    enlace.click()
    URL.revokeObjectURL(url)
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setFechaInicio('')
    setFechaFin('')
  }

  const finalizarVenta = async () => {
    setMensaje('')
    setError('')

    if (carrito.length === 0) {
      setError('Agrega al menos un producto a la factura')
      return
    }

    try {
      setGuardando(true)
      const respuestaVenta = await axios.post(API_FACTURA, {
        cliente: cliente.trim() || 'Consumidor final',
        productos: carrito.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad
        }))
      })

      setCarrito([])
      setCliente('')
      setMensaje('Factura registrada correctamente')
      setFacturaActual(respuestaVenta.data)

      await Promise.all([
        obtenerVentas(),
        obtenerProductos()
      ])
    } catch (errorPeticion) {
      console.error('Error al registrar factura', errorPeticion)
      setError(String(errorPeticion.response?.data || 'No se pudo registrar la factura'))
    } finally {
      setGuardando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  return (
    <div className="ventas-contenedor">
      <h2>Gestion de Ventas</h2>

      <form className="formulario-venta" onSubmit={agregarAlCarrito}>
        <select
          value={productoId}
          onChange={(e) => setProductoId(e.target.value)}
          required
        >
          <option value="">Seleccione producto y presentacion</option>
          {productosOrdenados.map((producto) => (
            <option key={producto.id} value={producto.id} disabled={producto.cantidad <= 0}>
              {producto.nombre} - {obtenerPresentacion(producto)} | Q {formatearMoneda(producto.precio)} | Stock {producto.cantidad}
            </option>
          ))}
        </select>

        <div className="campo-cliente-venta">
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />
          <button type="button" onClick={() => setCliente('Consumidor final')}>
            Consumidor final
          </button>
        </div>

        <input
          type="number"
          min="1"
          max={productoSeleccionado?.cantidad || undefined}
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
        />

        <button type="submit">
          Agregar
        </button>
      </form>

      {productoSeleccionado && (
        <section className="detalle-venta-producto">
          <div>
            <span>Producto</span>
            <strong>{productoSeleccionado.nombre}</strong>
          </div>
          <div>
            <span>Presentacion</span>
            <strong>{obtenerPresentacion(productoSeleccionado)}</strong>
          </div>
          <div>
            <span>Precio</span>
            <strong>Q {formatearMoneda(productoSeleccionado.precio)}</strong>
          </div>
          <div>
            <span>Stock</span>
            <strong>{productoSeleccionado.cantidad}</strong>
          </div>
          <div>
            <span>Total estimado</span>
            <strong>Q {formatearMoneda(totalEstimado)}</strong>
          </div>
        </section>
      )}

      {carrito.length > 0 && (
        <section className="carrito-venta">
          <div className="carrito-venta-encabezado">
            <div>
              <span>Factura en proceso</span>
              <h3>{obtenerCliente({ cliente })}</h3>
              <small>{obtenerTipoCliente()}</small>
            </div>
            <div className="carrito-total">
              <span>Total</span>
              <strong>Q {formatearMoneda(totalCarrito)}</strong>
            </div>
          </div>

          <div className="carrito-items">
            {carrito.map((item) => (
              <article className="carrito-item" key={item.productoId}>
                <div>
                  <strong>{item.nombre}</strong>
                  <span>{item.presentacionVenta} x{item.unidadesPorPresentacion}</span>
                  <small>Q {formatearMoneda(item.precio)} c/u</small>
                </div>

                <div className="carrito-item-cantidad">
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.cantidad}
                    onChange={(e) => actualizarCantidadCarrito(item.productoId, e.target.value)}
                  />
                  <strong>Q {formatearMoneda(item.total)}</strong>
                  <button type="button" onClick={() => quitarDelCarrito(item.productoId)}>
                    Quitar
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="acciones-carrito">
            <span>{cantidadCarrito} productos en la factura</span>
            <button type="button" onClick={() => setCarrito([])} disabled={guardando}>
              Vaciar
            </button>
            <button type="button" onClick={finalizarVenta} disabled={guardando}>
              {guardando ? 'Registrando...' : 'Finalizar venta'}
            </button>
          </div>
        </section>
      )}

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
          <h3>Historial de facturas</h3>
          <span>{facturasFiltradas.length} de {facturas.length} facturas</span>
        </div>

        <div className="filtros-ventas">
          <input
            type="search"
            placeholder="Buscar factura, cliente, producto o presentacion"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
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
              {facturasFiltradas.map((factura) => {
                const detalles = obtenerDetallesFactura(factura)

                return (
                  <tr key={obtenerNumeroFactura(factura)}>
                    <td className="celda-factura">{obtenerNumeroFactura(factura)}</td>
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
                        <button type="button" onClick={() => setFacturaActual(factura)}>
                          Ver
                        </button>
                        <button type="button" onClick={() => imprimirFactura(factura)}>
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
      )}

      {facturaActual && (
        <div className="modal-factura" role="dialog" aria-modal="true">
          <article className="factura-card">
            <header className="factura-card-encabezado">
              <div>
                <span>Factura</span>
                <h3>{obtenerNumeroFactura(facturaActual)}</h3>
              </div>
              <button type="button" onClick={() => setFacturaActual(null)}>
                Cerrar
              </button>
            </header>

            <section className="factura-datos">
              <div>
                <span>Fecha</span>
                <strong>{formatearFechaHora(facturaActual.fecha)}</strong>
              </div>
              <div>
                <span>A nombre de</span>
                <strong>{obtenerCliente(facturaActual)}</strong>
              </div>
              <div>
                <span>Tipo</span>
                <strong>{obtenerTipoCliente(facturaActual)}</strong>
              </div>
            </section>

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
                {obtenerDetallesFactura(facturaActual).map((detalle) => (
                  <tr key={detalle.id || detalle.productoId}>
                    <td>{obtenerNombreDetalle(detalle)}</td>
                    <td>{detalle.cantidad}</td>
                    <td>Q {formatearMoneda(detalle.precioUnitario)}</td>
                    <td>Q {formatearMoneda(detalle.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="factura-total">
              Total: Q {formatearMoneda(obtenerTotalFactura(facturaActual))}
            </div>

            <div className="factura-acciones">
              <button type="button" onClick={() => imprimirFactura(facturaActual)}>
                Imprimir
              </button>
              <button type="button" onClick={() => descargarFactura(facturaActual)}>
                Descargar
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  )
}

export default Ventas
