import { useNavigate } from 'react-router-dom'
import Alertas from '../componentes/Alertas'

function AlertasPagina() {
  const navigate = useNavigate()

  return (
    <div className="pagina-contenedor">
      <button className="boton-volver" onClick={() => navigate('/panel')}>
        ← Volver
      </button>

      <Alertas />
    </div>
  )
}

export default AlertasPagina