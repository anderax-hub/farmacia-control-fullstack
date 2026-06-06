export const API_PRODUCTOS = 'https://localhost:7120/api/Productos'

export const PRESENTACIONES_VENTA = [
  'Unidad',
  'Blister',
  'Caja',
  'Frasco',
  'Tubo',
  'Sobre',
  'Ampolla',
  'Bolsa'
]

export const OPCIONES_PRODUCTOS_POR_PAGINA = [5, 10, 20, 50]

export const PRODUCTO_FORMULARIO_INICIAL = {
  nombre: '',
  categoria: '',
  costo: '',
  precio: '',
  cantidad: '',
  presentacionVenta: 'Unidad',
  unidadesPorPresentacion: '1',
  proveedor: ''
}

export const obtenerEstadoStock = (stock) => {
  if (stock <= 0) return 'agotado'
  if (stock <= 5) return 'bajo'
  return 'disponible'
}

export const obtenerTextoStock = (stock) => {
  if (stock <= 0) return 'Agotado'
  if (stock <= 5) return 'Stock bajo'
  return 'Disponible'
}

export const normalizarTexto = (valor) => {
  return String(valor || '').trim().toLowerCase()
}

export const obtenerValorOrden = (producto, campo) => {
  if (campo === 'costo' || campo === 'precio' || campo === 'cantidad') {
    return Number(producto[campo])
  }

  if (campo === 'estado') {
    const ordenEstados = {
      agotado: 0,
      bajo: 1,
      disponible: 2
    }

    return ordenEstados[obtenerEstadoStock(producto.cantidad)]
  }

  return normalizarTexto(producto[campo])
}

export const crearValorCsv = (valor) => {
  return `"${String(valor ?? '').replaceAll('"', '""')}"`
}

export const formatearUnidadesPresentacion = (valor) => {
  const unidades = Number(valor) || 1
  return `${unidades} ${unidades === 1 ? 'unidad' : 'unidades'}`
}

export const formatearMoneda = (valor) => {
  return Number(valor || 0).toFixed(2)
}

export const crearProductoDesdeFormulario = (formulario) => {
  return {
    nombre: formulario.nombre.trim(),
    categoria: formulario.categoria.trim(),
    costo: Number(formulario.costo),
    precio: Number(formulario.precio),
    cantidad: Number.parseInt(formulario.cantidad, 10),
    presentacionVenta: formulario.presentacionVenta,
    unidadesPorPresentacion: Number.parseInt(formulario.unidadesPorPresentacion, 10),
    proveedor: formulario.proveedor.trim()
  }
}

export const crearFormularioDesdeProducto = (producto) => {
  return {
    nombre: producto.nombre || '',
    categoria: producto.categoria || '',
    costo: String(producto.costo ?? ''),
    precio: String(producto.precio ?? ''),
    cantidad: String(producto.cantidad ?? ''),
    presentacionVenta: producto.presentacionVenta || 'Unidad',
    unidadesPorPresentacion: String(producto.unidadesPorPresentacion || 1),
    proveedor: producto.proveedor || ''
  }
}

export const validarProductoFormulario = (producto, productos = [], productoId = null) => {
  if (!producto.nombre || !producto.categoria || !producto.presentacionVenta || !producto.proveedor) {
    return 'Nombre, categoria, presentacion y proveedor son obligatorios'
  }

  if (
    !Number.isFinite(producto.costo) ||
    !Number.isFinite(producto.precio) ||
    !Number.isInteger(producto.cantidad) ||
    !Number.isInteger(producto.unidadesPorPresentacion)
  ) {
    return 'Costo, precio, cantidad y unidades por presentacion deben ser numeros validos'
  }

  if (producto.costo < 0 || producto.precio < 0 || producto.cantidad < 0) {
    return 'Costo, precio y cantidad no pueden ser negativos'
  }

  if (producto.unidadesPorPresentacion < 1) {
    return 'Las unidades por presentacion deben ser mayores a cero'
  }

  if (producto.precio < producto.costo) {
    return 'El precio no puede ser menor que el costo'
  }

  const existeDuplicado = productos.some((productoExistente) => {
    return (
      productoExistente.id !== productoId &&
      normalizarTexto(productoExistente.nombre) === normalizarTexto(producto.nombre) &&
      normalizarTexto(productoExistente.presentacionVenta || 'Unidad') === normalizarTexto(producto.presentacionVenta) &&
      normalizarTexto(productoExistente.proveedor) === normalizarTexto(producto.proveedor)
    )
  })

  if (existeDuplicado) {
    return 'Ya existe un producto con ese nombre, presentacion y proveedor'
  }

  return ''
}
