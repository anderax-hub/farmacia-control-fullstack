import { useNavigate } from 'react-router-dom'
import Productos from '../componentes/Productos'

function ProductosPagina() {
  const navigate = useNavigate()

  return (
    <div className="pagina-contenedor">
      <button className="boton-volver" onClick={() => navigate('/panel')}>
        ← Volver
      </button>

      <Productos />
    </div>
  )
}

export default ProductosPagina