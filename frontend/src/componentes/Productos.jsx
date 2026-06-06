import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  API_PRODUCTOS,
  OPCIONES_PRODUCTOS_POR_PAGINA,
  crearValorCsv,
  formatearMoneda,
  formatearUnidadesPresentacion,
  normalizarTexto,
  obtenerEstadoStock,
  obtenerTextoStock,
  obtenerValorOrden
} from './inventarioUtils'

function Productos() {
  const navigate = useNavigate()
  const location = useLocation()
  const mensajeRuta = location.state?.mensaje
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [orden, setOrden] = useState({ campo: 'nombre', direccion: 'asc' })
  const [paginaActual, setPaginaActual] = useState(1)
  const [productosPorPagina, setProductosPorPagina] = useState(10)
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState(mensajeRuta || '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (mensajeRuta) {
      navigate('/productos', { replace: true, state: null })
    }
  }, [mensajeRuta, navigate])

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

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / productosPorPagina))
  const paginaMostrada = Math.min(paginaActual, totalPaginas)
  const indiceInicialPagina = (paginaMostrada - 1) * productosPorPagina
  const indiceFinalPagina = indiceInicialPagina + productosPorPagina
  const primerProductoPagina = productosFiltrados.length === 0 ? 0 : indiceInicialPagina + 1
  const ultimoProductoPagina = Math.min(indiceFinalPagina, productosFiltrados.length)

  const productosPaginados = useMemo(() => {
    return productosFiltrados.slice(indiceInicialPagina, indiceFinalPagina)
  }, [indiceFinalPagina, indiceInicialPagina, productosFiltrados])

  const ordenarPor = (campo) => {
    setPaginaActual(1)
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

  const irAPaginaAnterior = () => {
    setPaginaActual((pagina) => Math.max(1, pagina - 1))
  }

  const irAPaginaSiguiente = () => {
    setPaginaActual((pagina) => Math.min(totalPaginas, pagina + 1))
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
      formatearMoneda(producto.costo),
      formatearMoneda(producto.precio),
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

  return (
    <div className="productos-contenedor">
      <div className="encabezado-inventario">
        <div>
          <span>Inventario</span>
          <h2>Gestion de Productos</h2>
        </div>

        <button type="button" className="btn-nuevo-producto" onClick={() => navigate('/productos/nuevo')}>
          Nuevo producto
        </button>
      </div>

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
          onChange={(e) => {
            setBusqueda(e.target.value)
            setPaginaActual(1)
          }}
        />

        <select
          className="filtro-categoria"
          value={filtroCategoria}
          onChange={(e) => {
            setFiltroCategoria(e.target.value)
            setPaginaActual(1)
          }}
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
            onClick={() => {
              setFiltroEstado('todos')
              setPaginaActual(1)
            }}
          >
            Todos
          </button>
          <button
            type="button"
            className={filtroEstado === 'disponible' ? 'activo' : ''}
            onClick={() => {
              setFiltroEstado('disponible')
              setPaginaActual(1)
            }}
          >
            Disponibles
          </button>
          <button
            type="button"
            className={filtroEstado === 'bajo' ? 'activo' : ''}
            onClick={() => {
              setFiltroEstado('bajo')
              setPaginaActual(1)
            }}
          >
            Stock bajo
          </button>
          <button
            type="button"
            className={filtroEstado === 'agotado' ? 'activo' : ''}
            onClick={() => {
              setFiltroEstado('agotado')
              setPaginaActual(1)
            }}
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
        <>
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
                {productosPaginados.map((producto) => (
                  <tr key={producto.id}>
                    <td className="celda-producto">{producto.nombre}</td>
                    <td>{producto.categoria}</td>
                    <td className="celda-monto">Q {formatearMoneda(producto.costo)}</td>
                    <td className="celda-monto">Q {formatearMoneda(producto.precio)}</td>
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
                        <button type="button" className="btn-ver" onClick={() => navigate(`/productos/${producto.id}`)}>
                          Ver
                        </button>
                        <button type="button" className="btn-editar" onClick={() => navigate(`/productos/${producto.id}/editar`)}>
                          Editar
                        </button>
                        <button type="button" className="btn-eliminar" onClick={() => navigate(`/productos/${producto.id}/eliminar`)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="paginacion-inventario">
            <span>
              Mostrando {primerProductoPagina}-{ultimoProductoPagina} de {productosFiltrados.length}
            </span>

            <div className="paginacion-controles">
              <button
                type="button"
                onClick={irAPaginaAnterior}
                disabled={paginaMostrada === 1}
              >
                Anterior
              </button>

              <strong>
                Pagina {paginaMostrada} de {totalPaginas}
              </strong>

              <button
                type="button"
                onClick={irAPaginaSiguiente}
                disabled={paginaMostrada === totalPaginas}
              >
                Siguiente
              </button>
            </div>

            <label>
              Por pagina
              <select
                value={productosPorPagina}
                onChange={(e) => {
                  setProductosPorPagina(Number(e.target.value))
                  setPaginaActual(1)
                }}
              >
                {OPCIONES_PRODUCTOS_POR_PAGINA.map((opcion) => (
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

export default Productos
