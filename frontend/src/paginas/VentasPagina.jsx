import { useNavigate } from 'react-router-dom'
import Ventas from '../componentes/Ventas'

function VentasPagina() {
  const navigate = useNavigate()

  return (
    <div className="pagina-contenedor">
      <button className="boton-volver" onClick={() => navigate('/panel')}>
        Volver al panel
      </button>

      <Ventas />
    </div>
  )
}

export default VentasPagina
