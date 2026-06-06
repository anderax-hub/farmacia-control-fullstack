import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  API_PRODUCTOS,
  PRESENTACIONES_VENTA,
  PRODUCTO_FORMULARIO_INICIAL,
  crearFormularioDesdeProducto,
  crearProductoDesdeFormulario,
  validarProductoFormulario
} from './inventarioUtils'

function ProductoFormulario({ modo = 'crear' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const esEdicion = modo === 'editar'
  const [productos, setProductos] = useState([])
  const [formulario, setFormulario] = useState(PRODUCTO_FORMULARIO_INICIAL)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controlador = new AbortController()

    const cargarFormulario = async () => {
      try {
        const peticiones = [axios.get(API_PRODUCTOS, { signal: controlador.signal })]

        if (esEdicion) {
          peticiones.push(axios.get(`${API_PRODUCTOS}/${id}`, { signal: controlador.signal }))
        }

        const [respuestaProductos, respuestaProducto] = await Promise.all(peticiones)

        setProductos(respuestaProductos.data)

        if (esEdicion) {
          setFormulario(crearFormularioDesdeProducto(respuestaProducto.data))
        } else {
          setFormulario(PRODUCTO_FORMULARIO_INICIAL)
        }

        setError('')
      } catch (errorPeticion) {
        if (errorPeticion.name !== 'CanceledError') {
          console.error('Error al cargar producto', errorPeticion)
          setError(esEdicion ? 'No se pudo cargar el producto' : 'No se pudieron cargar los datos')
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }

    cargarFormulario()

    return () => controlador.abort()
  }, [esEdicion, id])

  const actualizarCampo = (campo, valor) => {
    setFormulario((formularioActual) => ({
      ...formularioActual,
      [campo]: valor
    }))
  }

  const guardarProducto = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')

    const producto = crearProductoDesdeFormulario(formulario)
    const errorValidacion = validarProductoFormulario(producto, productos, esEdicion ? Number(id) : null)

    if (errorValidacion) {
      setError(errorValidacion)
      setGuardando(false)
      return
    }

    try {
      if (esEdicion) {
        await axios.put(`${API_PRODUCTOS}/${id}`, {
          id: Number(id),
          ...producto
        })

        navigate('/productos', {
          state: { mensaje: 'Producto actualizado correctamente' }
        })
      } else {
        await axios.post(API_PRODUCTOS, producto)

        navigate('/productos', {
          state: { mensaje: 'Producto guardado correctamente' }
        })
      }
    } catch (errorPeticion) {
      console.error('Error al guardar producto', errorPeticion)
      setError(String(errorPeticion.response?.data || 'No se pudo guardar el producto'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="productos-contenedor">
      <div className="encabezado-vista-inventario">
        <div>
          <span>{esEdicion ? 'Editar producto' : 'Nuevo producto'}</span>
          <h2>{esEdicion ? formulario.nombre || 'Editar producto' : 'Registrar producto'}</h2>
        </div>

        <button type="button" className="btn-secundario-inventario" onClick={() => navigate('/productos')}>
          Volver a inventario
        </button>
      </div>

      {cargando && <p className="mensaje-producto">Cargando producto...</p>}
      {error && <p className="error-producto">{error}</p>}

      {!cargando && (
        <form className="formulario-producto formulario-producto-vista" onSubmit={guardarProducto}>
          <input
            type="text"
            placeholder="Nombre"
            value={formulario.nombre}
            onChange={(e) => actualizarCampo('nombre', e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Categoria"
            value={formulario.categoria}
            onChange={(e) => actualizarCampo('categoria', e.target.value)}
            required
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Costo"
            value={formulario.costo}
            onChange={(e) => actualizarCampo('costo', e.target.value)}
            required
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Precio"
            value={formulario.precio}
            onChange={(e) => actualizarCampo('precio', e.target.value)}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Cantidad"
            value={formulario.cantidad}
            onChange={(e) => actualizarCampo('cantidad', e.target.value)}
            required
          />
          <select
            aria-label="Presentacion de venta"
            value={formulario.presentacionVenta}
            onChange={(e) => actualizarCampo('presentacionVenta', e.target.value)}
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
            value={formulario.unidadesPorPresentacion}
            onChange={(e) => actualizarCampo('unidadesPorPresentacion', e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Proveedor"
            value={formulario.proveedor}
            onChange={(e) => actualizarCampo('proveedor', e.target.value)}
            required
          />

          <div className="acciones-formulario-producto">
            <button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : esEdicion ? 'Actualizar producto' : 'Guardar producto'}
            </button>

            <button type="button" className="btn-cancelar" onClick={() => navigate('/productos')} disabled={guardando}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ProductoFormulario
