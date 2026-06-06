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

function ProductoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)
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

  return (
    <div className="productos-contenedor">
      <div className="encabezado-vista-inventario">
        <div>
          <span>Detalle del producto</span>
          <h2>{producto?.nombre || 'Producto'}</h2>
        </div>

        <button type="button" className="btn-secundario-inventario" onClick={() => navigate('/productos')}>
          Volver a inventario
        </button>
      </div>

      {cargando && <p className="mensaje-producto">Cargando producto...</p>}
      {error && <p className="error-producto">{error}</p>}

      {!cargando && producto && (
        <>
          <section className="detalle-producto-grid">
            <div>
              <span>Nombre</span>
              <strong>{producto.nombre}</strong>
            </div>
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
              <span>Estado</span>
              <strong className={`estado-stock ${obtenerEstadoStock(producto.cantidad)}`}>
                {obtenerTextoStock(producto.cantidad)}
              </strong>
            </div>
            <div>
              <span>Costo</span>
              <strong>Q {formatearMoneda(producto.costo)}</strong>
            </div>
            <div>
              <span>Precio</span>
              <strong>Q {formatearMoneda(producto.precio)}</strong>
            </div>
            <div>
              <span>Cantidad</span>
              <strong>{producto.cantidad}</strong>
            </div>
            <div>
              <span>Proveedor</span>
              <strong>{producto.proveedor}</strong>
            </div>
          </section>

          <div className="acciones-vista-producto">
            <button type="button" className="btn-editar" onClick={() => navigate(`/productos/${producto.id}/editar`)}>
              Editar producto
            </button>
            <button type="button" className="btn-eliminar" onClick={() => navigate(`/productos/${producto.id}/eliminar`)}>
              Eliminar producto
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ProductoDetalle
