using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FarmaciaControlAPI.Datos;
using FarmaciaControlAPI.Modelos;

namespace FarmaciaControlAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportesController : ControllerBase
    {
        private readonly ContextoBD _contexto;

        public ReportesController(ContextoBD contexto)
        {
            _contexto = contexto;
        }

        [HttpGet("general")]
        public async Task<ActionResult<ReporteGeneral>> ObtenerReporteGeneral()
        {
            var fechaLimite = DateTime.Today.AddDays(30);

            var totalUsuarios = await _contexto.Usuarios.CountAsync();
            var totalProductos = await _contexto.Productos.CountAsync();
            var totalLotes = await _contexto.Lotes.CountAsync();
            var totalLotesProximosAVencer = await _contexto.Lotes
                .CountAsync(l => l.FechaVencimiento <= fechaLimite);

            var productos = await _contexto.Productos.ToListAsync();

            var gananciaPotencialTotal = productos.Sum(p => (p.Precio - p.Costo) * p.Cantidad);

            var reporte = new ReporteGeneral
            {
                TotalUsuarios = totalUsuarios,
                TotalProductos = totalProductos,
                TotalLotes = totalLotes,
                TotalLotesProximosAVencer = totalLotesProximosAVencer,
                GananciaPotencialTotal = gananciaPotencialTotal
            };

            return Ok(reporte);
        }
    }
}