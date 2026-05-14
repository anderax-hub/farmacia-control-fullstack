import { useNavigate } from 'react-router-dom'
import Rentabilidad from '../componentes/Rentabilidad'

function RentabilidadPagina() {
  const navigate = useNavigate()

  return (
    <div className="pagina-contenedor">
      <button className="boton-volver" onClick={() => navigate('/panel')}>
        ← Volver
      </button>

      <Rentabilidad />
    </div>
  )
}

export default RentabilidadPagina