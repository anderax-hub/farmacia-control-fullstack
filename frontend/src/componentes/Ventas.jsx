import { useEffect, useState } from 'react'
import axios from 'axios'

function Ventas() {
  const [ventas, setVentas] = useState([])
  const [productos, setProductos] = useState([])
  const [productoId, setProductoId] = useState('')
  const [cantidad, setCantidad] = useState('')

  const obtenerVentas = async () => {
    try {
      const respuesta = await axios.get('https://localhost:7120/api/Ventas')
      setVentas(respuesta.data)
    } catch (error) {
      console.error('Error al obtener ventas', error)
    }
  }

  const obtenerProductos = async () => {
    try {
      const respuesta = await axios.get('https://localhost:7120/api/Productos')
      setProductos(respuesta.data)
    } catch (error) {
      console.error('Error al obtener productos', error)
    }
  }

  const guardarVenta = async (e) => {
    e.preventDefault()

    try {
      await axios.post('https://localhost:7120/api/Ventas', {
        productoId: parseInt(productoId),
        cantidad: parseInt(cantidad)
      })

      setProductoId('')
      setCantidad('')

      obtenerVentas()
      obtenerProductos()
    } catch (error) {
      console.error('Error al registrar venta', error)
      alert('No se pudo registrar la venta')
    }
  }

  useEffect(() => {
    obtenerVentas()
    obtenerProductos()
  }, [])

  return (
    <div className="ventas-contenedor">
      <h2>Gestión de Ventas</h2>

      <form className="formulario-venta" onSubmit={guardarVenta}>
        <select
          value={productoId}
          onChange={(e) => setProductoId(e.target.value)}
          required
        >
          <option value="">Seleccione un producto</option>
          {productos.map((producto) => (
            <option key={producto.id} value={producto.id}>
              {producto.nombre}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
        />

        <button type="submit">Registrar venta</button>
      </form>

      <table className="tabla-ventas">
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto ID</th>
            <th>Fecha</th>
            <th>Cantidad</th>
            <th>Precio unitario</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id}>
              <td>{venta.id}</td>
              <td>{venta.productoId}</td>
              <td>{new Date(venta.fecha).toLocaleString()}</td>
              <td>{venta.cantidad}</td>
              <td>Q {venta.precioUnitario}</td>
              <td>Q {venta.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Ventas