import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_PRODUCTOS = 'https://localhost:7120/api/Productos'

const PRESENTACIONES_VENTA = [
  'Unidad',
  'Blister',
  'Caja',
  'Frasco',
  'Tubo',
  'Sobre',
  'Ampolla',
  'Bolsa'
]

const obtenerEstadoStock = (stock) => {
  if (stock <= 0) return 'agotado'
  if (stock <= 5) return 'bajo'
  return 'disponible'
}

const obtenerTextoStock = (stock) => {
  if (stock <= 0) return 'Agotado'
  if (stock <= 5) return 'Stock bajo'
  return 'Disponible'
}

const normalizarTexto = (valor) => {
  return String(valor || '').trim().toLowerCase()
}

const obtenerValorOrden = (producto, campo) => {
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

const crearValorCsv = (valor) => {
  return `"${String(valor ?? '').replaceAll('"', '""')}"`
}

const formatearUnidadesPresentacion = (valor) => {
  const unidades = Number(valor) || 1
  return `${unidades} ${unidades === 1 ? 'unidad' : 'unidades'}`
}

function Productos() {
  const [productos, setProductos] = useState([])
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('')
  const [costo, setCosto] = useState('')
  const [precio, setPrecio] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [presentacionVenta, setPresentacionVenta] = useState('Unidad')
  const [unidadesPorPresentacion, setUnidadesPorPresentacion] = useState('1')
  const [proveedor, setProveedor] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [orden, setOrden] = useState({ campo: 'nombre', direccion: 'asc' })
  const [productoEditando, setProductoEditando] = useState(null)
  const [productoAEliminar, setProductoAEliminar] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const limpiarFormulario = () => {
    setNombre('')
    setCategoria('')
    setCosto('')
    setPrecio('')
    setCantidad('')
    setPresentacionVenta('Unidad')
    setUnidadesPorPresentacion('1')
    setProveedor('')
    setProductoEditando(null)
  }

  const cargarProductos = async () => {
    try {
      const respuesta = await axios.get(API_PRODUCTOS)
      setProductos(respuesta.data)
    } catch (errorPeticion) {
      console.error('Error al obtener productos', errorPeticion)
      setError('No se pudieron cargar los productos')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    const controlador = new AbortController()

    axios
      .get(API_PRODUCTOS, {
        signal: controlador.signal
      })
      .then((respuesta) => {
        setProductos(respuesta.data)
        setError('')
      })
      .catch((errorPeticion) => {
        if (errorPeticion.name !== 'CanceledError') {
          console.error('Error al obtener productos', errorPeticion)
          setError('No se pudieron cargar los productos')
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      })

    return () => controlador.abort()
  }, [])

  const resumenInventario = useMemo(() => {
    return productos.reduce((resumen, producto) => {
      const estado = obtenerEstadoStock(producto.cantidad)

      return {
        total: resumen.total + 1,
        disponibles: resumen.disponibles + (estado === 'disponible' ? 1 : 0),
        bajos: resumen.bajos + (estado === 'bajo' ? 1 : 0),
        agotados: resumen.agotados + (estado === 'agotado' ? 1 : 0)
      }
    }, {
      total: 0,
      disponibles: 0,
      bajos: 0,
      agotados: 0
    })
  }, [productos])

  const categorias = useMemo(() => {
    return [...new Set(productos.map((producto) => producto.categoria).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
  }, [productos])

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    const resultado = productos.filter((producto) => {
      const coincideTexto = !texto || [
        producto.nombre,
        producto.categoria,
        producto.presentacionVenta,
        producto.proveedor
      ].some((valor) => valor?.toLowerCase().includes(texto))

      const coincideEstado =
        filtroEstado === 'todos' || obtenerEstadoStock(producto.cantidad) === filtroEstado

      const coincideCategoria =
        filtroCategoria === 'todas' || normalizarTexto(producto.categoria) === normalizarTexto(filtroCategoria)

      return coincideTexto && coincideEstado && coincideCategoria
    })

    return resultado.sort((productoA, productoB) => {
      const valorA = obtenerValorOrden(productoA, orden.campo)
      const valorB = obtenerValorOrden(productoB, orden.campo)

      if (valorA < valorB) return orden.direccion === 'asc' ? -1 : 1
      if (valorA > valorB) return orden.direccion === 'asc' ? 1 : -1
      return 0
    })
  }, [busqueda, filtroCategoria, filtroEstado, orden, productos])

  const seleccionarProducto = (producto) => {
    setProductoEditando(producto)
    setNombre(producto.nombre)
    setCategoria(producto.categoria)
    setCosto(String(producto.costo))
    setPrecio(String(producto.precio))
    setCantidad(String(producto.cantidad))
    setPresentacionVenta(producto.presentacionVenta || 'Unidad')
    setUnidadesPorPresentacion(String(producto.unidadesPorPresentacion || 1))
    setProveedor(producto.proveedor)
    setMensaje('')
    setError('')
  }

  const validarProducto = (producto) => {
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
        productoExistente.id !== productoEditando?.id &&
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

  const ordenarPor = (campo) => {
    setOrden((ordenActual) => {
      if (ordenActual.campo === campo) {
        return {
          campo,
          direccion: ordenActual.direccion === 'asc' ? 'desc' : 'asc'
        }
      }

      return {
        campo,
        direccion: 'asc'
      }
    })
  }

  const obtenerIndicadorOrden = (campo) => {
    if (orden.campo !== campo) return ''
    return orden.direccion === 'asc' ? ' ASC' : ' DESC'
  }

  const exportarInventario = () => {
    if (productosFiltrados.length === 0) {
      setError('No hay productos para exportar')
      setMensaje('')
      return
    }

    const encabezados = [
      'Nombre',
      'Categoria',
      'Costo',
      'Precio',
      'Cantidad',
      'Presentacion',
      'Unidades por presentacion',
      'Estado',
      'Proveedor'
    ]

    const filas = productosFiltrados.map((producto) => [
      producto.nombre,
      producto.categoria,
      Number(producto.costo).toFixed(2),
      Number(producto.precio).toFixed(2),
      producto.cantidad,
      producto.presentacionVenta || 'Unidad',
      producto.unidadesPorPresentacion || 1,
      obtenerTextoStock(producto.cantidad),
      producto.proveedor
    ])

    const csv = [
      encabezados.map(crearValorCsv).join(','),
      ...filas.map((fila) => fila.map(crearValorCsv).join(','))
    ].join('\n')

    const archivo = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(archivo)
    const enlace = document.createElement('a')

    enlace.href = url
    enlace.download = 'inventario.csv'
    enlace.click()
    URL.revokeObjectURL(url)

    setMensaje('Inventario exportado correctamente')
    setError('')
  }

  const guardarProducto = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setMensaje('')
    setError('')

    const producto = {
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      costo: Number(costo),
      precio: Number(precio),
      cantidad: Number.parseInt(cantidad, 10),
      presentacionVenta,
      unidadesPorPresentacion: Number.parseInt(unidadesPorPresentacion, 10),
      proveedor: proveedor.trim()
    }

    const errorValidacion = validarProducto(producto)

    if (errorValidacion) {
      setError(errorValidacion)
      setGuardando(false)
      return
    }

    try {
      if (productoEditando) {
        await axios.put(`${API_PRODUCTOS}/${productoEditando.id}`, {
          id: productoEditando.id,
          ...producto
        })
        setMensaje('Producto actualizado correctamente')
      } else {
        await axios.post(API_PRODUCTOS, producto)
        setMensaje('Producto guardado correctamente')
      }

      limpiarFormulario()
      await cargarProductos()
    } catch (errorPeticion) {
      console.error('Error al guardar producto', errorPeticion)
      setError(String(errorPeticion.response?.data || 'No se pudo guardar el producto'))
    } finally {
      setGuardando(false)
    }
  }

  const confirmarEliminacion = async () => {
    if (!productoAEliminar) return

    setEliminando(true)
    setMensaje('')
    setError('')

    try {
      await axios.delete(`${API_PRODUCTOS}/${productoAEliminar.id}`)
      setMensaje('Producto eliminado correctamente')

      if (productoEditando?.id === productoAEliminar.id) {
        limpiarFormulario()
      }

      setProductoAEliminar(null)
      await cargarProductos()
    } catch (errorPeticion) {
      console.error('Error al eliminar producto', errorPeticion)
      setError(String(errorPeticion.response?.data || 'No se pudo eliminar el producto'))
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="productos-contenedor">
      <h2>Gestion de Productos</h2>

      <form className="formulario-producto" onSubmit={guardarProducto}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Costo"
          value={costo}
          onChange={(e) => setCosto(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
        />
        <input
          type="number"
          min="0"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
        />
        <select
          aria-label="Presentacion de venta"
          value={presentacionVenta}
          onChange={(e) => setPresentacionVenta(e.target.value)}
          required
        >
          {PRESENTACIONES_VENTA.map((presentacion) => (
            <option key={presentacion} value={presentacion}>
              {presentacion}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          placeholder="Unidades por presentacion"
          value={unidadesPorPresentacion}
          onChange={(e) => setUnidadesPorPresentacion(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Proveedor"
          value={proveedor}
          onChange={(e) => setProveedor(e.target.value)}
          required
        />

        <div className="acciones-formulario-producto">
          <button type="submit" disabled={guardando}>
            {productoEditando ? 'Actualizar producto' : 'Guardar producto'}
          </button>

          {productoEditando && (
            <button type="button" className="btn-cancelar" onClick={limpiarFormulario}>
              Cancelar edicion
            </button>
          )}
        </div>
      </form>

      {mensaje && <p className="mensaje-producto">{mensaje}</p>}
      {error && <p className="error-producto">{error}</p>}

      <section className="resumen-inventario">
        <div className="resumen-inventario-card total">
          <span>Total</span>
          <strong>{resumenInventario.total}</strong>
        </div>

        <div className="resumen-inventario-card disponible">
          <span>Disponibles</span>
          <strong>{resumenInventario.disponibles}</strong>
        </div>

        <div className="resumen-inventario-card bajo">
          <span>Stock bajo</span>
          <strong>{resumenInventario.bajos}</strong>
        </div>

        <div className="resumen-inventario-card agotado">
          <span>Agotados</span>
          <strong>{resumenInventario.agotados}</strong>
        </div>
      </section>

      <div className="barra-inventario">
        <input
          type="search"
          placeholder="Buscar por nombre, categoria, presentacion o proveedor"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select
          className="filtro-categoria"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="todas">Todas las categorias</option>
          {categorias.map((categoriaDisponible) => (
            <option key={categoriaDisponible} value={categoriaDisponible}>
              {categoriaDisponible}
            </option>
          ))}
        </select>

        <div className="filtros-stock" aria-label="Filtrar por estado de stock">
          <button
            type="button"
            className={filtroEstado === 'todos' ? 'activo' : ''}
            onClick={() => setFiltroEstado('todos')}
          >
            Todos
          </button>
          <button
            type="button"
            className={filtroEstado === 'disponible' ? 'activo' : ''}
            onClick={() => setFiltroEstado('disponible')}
          >
            Disponibles
          </button>
          <button
            type="button"
            className={filtroEstado === 'bajo' ? 'activo' : ''}
            onClick={() => setFiltroEstado('bajo')}
          >
            Stock bajo
          </button>
          <button
            type="button"
            className={filtroEstado === 'agotado' ? 'activo' : ''}
            onClick={() => setFiltroEstado('agotado')}
          >
            Agotados
          </button>
        </div>

        <span>
          {productosFiltrados.length} de {productos.length} productos
        </span>

        <button type="button" className="btn-exportar-inventario" onClick={exportarInventario}>
          Exportar CSV
        </button>
      </div>

      {cargando && <p className="mensaje-producto">Cargando productos...</p>}

      {!cargando && productosFiltrados.length === 0 && (
        <p className="mensaje-producto">No hay productos para mostrar.</p>
      )}

      {!cargando && productosFiltrados.length > 0 && (
        <div className="tabla-productos-wrapper">
          <table className="tabla-productos">
            <thead>
              <tr>
                <th>
                  <button type="button" className="btn-ordenar" onClick={() => ordenarPor('nombre')}>
                    Nombre{obtenerIndicadorOrden('nombre')}
                  </button>
                </th>
                <th>
                  <button type="button" className="btn-ordenar" onClick={() => ordenarPor('categoria')}>
                    Categoria{obtenerIndicadorOrden('categoria')}
                  </button>
                </th>
                <th>
                  <button type="button" className="btn-ordenar" onClick={() => ordenarPor('costo')}>
                    Costo{obtenerIndicadorOrden('costo')}
                  </button>
                </th>
                <th>
                  <button type="button" className="btn-ordenar" onClick={() => ordenarPor('precio')}>
                    Precio{obtenerIndicadorOrden('precio')}
                  </button>
                </th>
                <th>
                  <button type="button" className="btn-ordenar" onClick={() => ordenarPor('cantidad')}>
                    Cantidad{obtenerIndicadorOrden('cantidad')}
                  </button>
                </th>
                <th>
                  <button type="button" className="btn-ordenar" onClick={() => ordenarPor('presentacionVenta')}>
                    Presentacion{obtenerIndicadorOrden('presentacionVenta')}
                  </button>
                </th>
                <th>
                  <button type="button" className="btn-ordenar" onClick={() => ordenarPor('estado')}>
                    Estado{obtenerIndicadorOrden('estado')}
                  </button>
                </th>
                <th>
                  <button type="button" className="btn-ordenar" onClick={() => ordenarPor('proveedor')}>
                    Proveedor{obtenerIndicadorOrden('proveedor')}
                  </button>
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto) => (
                <tr key={producto.id}>
                  <td className="celda-producto">{producto.nombre}</td>
                  <td>{producto.categoria}</td>
                  <td className="celda-monto">Q {Number(producto.costo).toFixed(2)}</td>
                  <td className="celda-monto">Q {Number(producto.precio).toFixed(2)}</td>
                  <td className="celda-cantidad">{producto.cantidad}</td>
                  <td>
                    <span className="etiqueta-presentacion">
                      {producto.presentacionVenta || 'Unidad'}
                    </span>
                    <small className="detalle-presentacion">
                      {formatearUnidadesPresentacion(producto.unidadesPorPresentacion)}
                    </small>
                  </td>
                  <td>
                    <span className={`estado-stock ${obtenerEstadoStock(producto.cantidad)}`}>
                      {obtenerTextoStock(producto.cantidad)}
                    </span>
                  </td>
                  <td>{producto.proveedor}</td>
                  <td>
                    <div className="acciones-tabla-producto">
                      <button type="button" className="btn-editar" onClick={() => seleccionarProducto(producto)}>
                        Editar
                      </button>
                      <button type="button" className="btn-eliminar" onClick={() => setProductoAEliminar(producto)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {productoAEliminar && (
        <div className="modal-eliminar-producto" role="dialog" aria-modal="true">
          <div className="modal-eliminar-card">
            <h3>Eliminar producto</h3>
            <p>
              Esta accion eliminara <strong>{productoAEliminar.nombre}</strong> del inventario.
            </p>
            <div className="acciones-modal-eliminar">
              <button
                type="button"
                className="btn-cancelar-eliminar"
                onClick={() => setProductoAEliminar(null)}
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-confirmar-eliminar"
                onClick={confirmarEliminacion}
                disabled={eliminando}
              >
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Productos
