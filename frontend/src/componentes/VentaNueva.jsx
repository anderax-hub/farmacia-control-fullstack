import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  API_FACTURA,
  API_PRODUCTOS,
  formatearMoneda,
  obtenerCliente,
  obtenerNumeroFactura,
  obtenerPresentacion,
  obtenerTipoCliente
} from './ventasUtils'

function VentaNueva() {
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [productoId, setProductoId] = useState('')
  const [cliente, setCliente] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

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
          console.error('Error al cargar productos', errorPeticion)
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

  const agregarAlCarrito = (e) => {
    e.preventDefault()
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

  const finalizarVenta = async () => {
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

      const numeroFactura = obtenerNumeroFactura(respuestaVenta.data)

      navigate(`/ventas/facturas/${encodeURIComponent(numeroFactura)}`, {
        state: { mensaje: 'Factura registrada correctamente' }
      })
    } catch (errorPeticion) {
      console.error('Error al registrar factura', errorPeticion)
      setError(String(errorPeticion.response?.data || 'No se pudo registrar la factura'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="ventas-contenedor">
      <div className="encabezado-ventas">
        <div>
          <span>Nueva venta</span>
          <h2>Registrar Factura</h2>
        </div>

        <button type="button" className="btn-secundario-venta" onClick={() => navigate('/ventas')}>
          Volver a ventas
        </button>
      </div>

      {cargando && <p className="mensaje-venta">Cargando productos...</p>}
      {error && <p className="error-venta">{error}</p>}

      {!cargando && (
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
      )}

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
    </div>
  )
}

export default VentaNueva
