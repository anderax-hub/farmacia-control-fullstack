using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FarmaciaControlAPI.Datos;
using FarmaciaControlAPI.Modelos;

namespace FarmaciaControlAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VentasController : ControllerBase
    {
        private readonly ContextoBD _contexto;

        public VentasController(ContextoBD contexto)    
        {
            _contexto = contexto;
        }

        [HttpGet]
        public async Task<ActionResult<List<Venta>>> ObtenerVentas()
        {
            var ventas = await _contexto.Ventas.ToListAsync();
            return Ok(ventas);
        }

        [HttpPost]
        public async Task<ActionResult> RegistrarVenta(Venta venta)
        {
            var producto = await _contexto.Productos.FindAsync(venta.ProductoId);

            if (producto == null)
            {
                return NotFound("Producto no encontrado");
            }

            if (producto.Cantidad < venta.Cantidad)
            {
                return BadRequest("No hay suficiente stock disponible");
            }

            venta.Fecha = DateTime.Now;
            venta.PrecioUnitario = producto.Precio;
            venta.Total = producto.Precio * venta.Cantidad;

            producto.Cantidad -= venta.Cantidad;

            _contexto.Ventas.Add(venta);
            await _contexto.SaveChangesAsync();

            return Ok(venta);
        }
    }
}