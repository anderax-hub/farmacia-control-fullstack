import ProductoFormulario from '../componentes/ProductoFormulario'

function ProductoFormularioPagina({ modo }) {
  return (
    <div className="pagina-contenedor">
      <ProductoFormulario modo={modo} />
    </div>
  )
}

export default ProductoFormularioPagina
