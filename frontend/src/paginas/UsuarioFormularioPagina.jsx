import UsuarioFormulario from '../componentes/UsuarioFormulario'

function UsuarioFormularioPagina({ modo }) {
  return (
    <div className="pagina-contenedor">
      <UsuarioFormulario modo={modo} />
    </div>
  )
}

export default UsuarioFormularioPagina
