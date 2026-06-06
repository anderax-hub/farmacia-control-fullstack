import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  API_PRODUCTOS,
  formatearMoneda,
  formatearUnidadesPresentacion,
  obtenerEstadoStock,
  obtenerTextoStock
} from './inventarioUtils'

function ProductoEliminar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controlador = new AbortController()

    axios
      .get(`${API_PRODUCTOS}/${id}`, {
        signal: controlador.signal
      })
      .then((respuesta) => {
        setProducto(respuesta.data)
        setError('')
      })
      .catch((errorPeticion) => {
        if (errorPeticion.name !== 'CanceledError') {
          console.error('Error al cargar producto', errorPeticion)
          setError('No se pudo cargar el producto')
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      })

    return () => controlador.abort()
  }, [id])

  const confirmarEliminacion = async () => {
    if (!producto) return

    setEliminando(true)
    setError('')

    try {
      await axios.delete(`${API_PRODUCTOS}/${producto.id}`)
      navigate('/productos', {
        state: { mensaje: 'Producto eliminado correctamente' }
      })
    } catch (errorPeticion) {
      console.error('Error al eliminar producto', errorPeticion)
      setError(String(errorPeticion.response?.data || 'No se pudo eliminar el producto'))
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="productos-contenedor">
      <div className="encabezado-vista-inventario">
        <div>
          <span>Confirmar eliminacion</span>
          <h2>{producto?.nombre || 'Eliminar producto'}</h2>
        </div>

        <button type="button" className="btn-secundario-inventario" onClick={() => navigate('/productos')}>
          Volver a inventario
        </button>
      </div>

      {cargando && <p className="mensaje-producto">Cargando producto...</p>}
      {error && <p className="error-producto">{error}</p>}

      {!cargando && producto && (
        <section className="vista-eliminar-producto">
          <h3>Eliminar producto del inventario</h3>
          <p>
            Esta accion intentara eliminar <strong>{producto.nombre}</strong>. Si el producto tiene ventas o lotes
            asociados, el sistema no permitira quitarlo.
          </p>

          <div className="producto-resumen-eliminar">
            <div>
              <span>Categoria</span>
              <strong>{producto.categoria}</strong>
            </div>
            <div>
              <span>Presentacion</span>
              <strong>{producto.presentacionVenta || 'Unidad'}</strong>
              <small>{formatearUnidadesPresentacion(producto.unidadesPorPresentacion)}</small>
            </div>
            <div>
              <span>Precio</span>
              <strong>Q {formatearMoneda(producto.precio)}</strong>
            </div>
            <div>
              <span>Stock</span>
              <strong className={`estado-stock ${obtenerEstadoStock(producto.cantidad)}`}>
                {obtenerTextoStock(producto.cantidad)}
              </strong>
            </div>
          </div>

          <div className="acciones-vista-producto">
            <button
              type="button"
              className="btn-confirmar-eliminar"
              onClick={confirmarEliminacion}
              disabled={eliminando}
            >
              {eliminando ? 'Eliminando...' : 'Confirmar eliminacion'}
            </button>
            <button type="button" className="btn-cancelar-eliminar" onClick={() => navigate('/productos')} disabled={eliminando}>
              Cancelar
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductoEliminar
