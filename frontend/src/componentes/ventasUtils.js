export const API_VENTAS = 'https://localhost:7120/api/Ventas'
export const API_FACTURA = 'https://localhost:7120/api/Ventas/factura'
export const API_PRODUCTOS = 'https://localhost:7120/api/Productos'
export const OPCIONES_FACTURAS_POR_PAGINA = [5, 10, 20, 50]

export const formatearMoneda = (valor) => {
  return Number(valor || 0).toFixed(2)
}

export const formatearFechaHora = (valor) => {
  return new Date(valor).toLocaleString()
}

export const normalizarTexto = (valor) => {
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

export const obtenerNumeroFactura = (factura) => {
  return factura.numeroFactura || `FAC-${String(factura.id || 0).padStart(6, '0')}`
}

export const obtenerCliente = (factura) => {
  return factura.cliente?.trim() || 'Consumidor final'
}

export const obtenerTipoCliente = () => {
  return 'Consumidor final'
}

export const obtenerPresentacion = (producto) => {
  const presentacion = producto.presentacionVenta || 'Unidad'
  const unidades = Number(producto.unidadesPorPresentacion) || 1
  return `${presentacion} x${unidades}`
}

export const obtenerNombreDetalle = (detalle) => {
  const nombre = detalle.productoNombre || `Producto ${detalle.productoId}`
  const presentacion = detalle.presentacionVenta || 'Unidad'
  const unidades = Number(detalle.unidadesPorPresentacion) || 1
  return `${nombre} - ${presentacion} x${unidades}`
}

export const obtenerDetallesFactura = (factura) => {
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

export const obtenerTotalFactura = (factura) => {
  return obtenerDetallesFactura(factura).reduce((total, detalle) => {
    return total + Number(detalle.total || 0)
  }, 0)
}

export const agruparVentasPorFactura = (ventas) => {
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

export const crearHtmlFactura = (factura) => {
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

export const imprimirFactura = (factura, setError) => {
  const ventanaFactura = window.open('', '_blank', 'width=840,height=920')

  if (!ventanaFactura) {
    setError?.('No se pudo abrir la ventana de impresion')
    return
  }

  ventanaFactura.document.write(crearHtmlFactura(factura))
  ventanaFactura.document.close()
  ventanaFactura.focus()
  setTimeout(() => ventanaFactura.print(), 250)
}

export const descargarFactura = (factura) => {
  const numeroFactura = obtenerNumeroFactura(factura)
  const archivo = new Blob([crearHtmlFactura(factura)], { type: 'text/html;charset=utf-8;' })
  const url = URL.createObjectURL(archivo)
  const enlace = document.createElement('a')

  enlace.href = url
  enlace.download = `${numeroFactura}.html`
  enlace.click()
  URL.revokeObjectURL(url)
}
