import { useNavigate } from 'react-router-dom'
import Usuarios from '../componentes/Usuarios'

function UsuariosPagina() {
  const navigate = useNavigate()

  return (
    <div className="pagina-contenedor">
      <button className="boton-volver" onClick={() => navigate('/panel')}>
        Volver al panel
      </button>

      <Usuarios />
    </div>
  )
}

export default UsuariosPagina
