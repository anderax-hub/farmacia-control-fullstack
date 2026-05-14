import { useNavigate } from 'react-router-dom'
import Reportes from '../componentes/Reportes'

function ReportesPagina() {
  const navigate = useNavigate()

  return (
    <div className="pagina-contenedor">
      <button className="boton-volver" onClick={() => navigate('/panel')}>
        ← Volver
      </button>

      <Reportes />
    </div>
  )
}

export default ReportesPagina
