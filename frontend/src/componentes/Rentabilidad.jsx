import { useEffect, useState } from 'react'
import axios from 'axios'

function Rentabilidad() {
  const [productos, setProductos] = useState([])

  const obtenerRentabilidad = async () => {
    try {
      const respuesta = await axios.get('https://localhost:7120/api/Productos/rentabilidad')
      setProductos(respuesta.data)
    } catch (error) {
      console.error('Error al obtener rentabilidad', error)
    }
  }

  useEffect(() => {
    obtenerRentabilidad()
  }, [])

  return (
    <div className="rentabilidad-contenedor">
      <h2>Rentabilidad de Productos</h2>

      <div className="tabla-responsive">
        <table className="tabla-rentabilidad">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Costo</th>
            <th>Precio</th>
            <th>Ganancia por unidad</th>
            <th>Cantidad</th>
            <th>Ganancia potencial</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.nombre}</td>
              <td>{producto.categoria}</td>
              <td>Q {producto.costo}</td>
              <td>Q {producto.precio}</td>
              <td>Q {producto.gananciaUnidad}</td>
              <td>{producto.cantidad}</td>
              <td>Q {producto.gananciaPotencial}</td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  )
}

export default Rentabilidad
