using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FarmaciaControlAPI.Datos;
using FarmaciaControlAPI.Modelos;
using System.Linq;

namespace FarmaciaControlAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LotesController : ControllerBase
    {
        private readonly ContextoBD _contexto;

        public LotesController(ContextoBD contexto)
        {
            _contexto = contexto;
        }

        [HttpGet]
        public async Task<ActionResult<List<Lote>>> ObtenerLotes()
        {
            var lotes = await _contexto.Lotes.ToListAsync();
            return Ok(lotes);
        }
        [HttpGet("proximos-a-vencer")]
        public async Task<ActionResult> ObtenerLotesProximosAVencer()
        {
            var fechaActual = DateTime.Today;
            var fechaLimite = DateTime.Today.AddDays(30);

            var lotes = await (
                from lote in _contexto.Lotes
                join producto in _contexto.Productos on lote.ProductoId equals producto.Id
                where lote.FechaVencimiento <= fechaLimite
                orderby lote.FechaVencimiento
                select new
                {
                    lote.Id,
                    lote.ProductoId,
                    ProductoNombre = producto.Nombre,
                    lote.FechaVencimiento,
                    lote.Cantidad
                }
            ).ToListAsync();

            var resultado = lotes.Select(lote => new
            {
                lote.Id,
                lote.ProductoId,
                lote.ProductoNombre,
                lote.FechaVencimiento,
                lote.Cantidad,
                DiasRestantes = (lote.FechaVencimiento.Date - fechaActual).Days
            }).ToList();

            return Ok(resultado);
        }

        [HttpPost]
        public async Task<ActionResult<Lote>> CrearLote(Lote lote)
        {
            _contexto.Lotes.Add(lote);
            await _contexto.SaveChangesAsync();

            return Ok(lote);
        }
    }
}
