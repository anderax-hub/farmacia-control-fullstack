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
        public async Task<ActionResult<ReporteGeneral>> ObtenerReporteGeneral(
            [FromQuery] DateTime? fechaInicio = null,
            [FromQuery] DateTime? fechaFin = null)
        {
            var fechaLimite = DateTime.Today.AddDays(30);
            var inicioVentas = fechaInicio?.Date;
            var finVentas = fechaFin?.Date.AddDays(1).AddTicks(-1);

            var totalUsuarios = await _contexto.Usuarios.CountAsync();
            var totalProductos = await _contexto.Productos.CountAsync();
            var totalLotes = await _contexto.Lotes.CountAsync();
            var totalLotesProximosAVencer = await _contexto.Lotes
                .CountAsync(l => l.FechaVencimiento <= fechaLimite);

            var productos = await _contexto.Productos.ToListAsync();
            var ventasConsulta = _contexto.Ventas.AsQueryable();

            if (inicioVentas.HasValue)
            {
                ventasConsulta = ventasConsulta.Where(v => v.Fecha >= inicioVentas.Value);
            }

            if (finVentas.HasValue)
            {
                ventasConsulta = ventasConsulta.Where(v => v.Fecha <= finVentas.Value);
            }

            var ventas = await ventasConsulta.ToListAsync();

            var gananciaPotencialTotal = productos.Sum(p => (p.Precio - p.Costo) * p.Cantidad);
            var totalFacturas = ventas
                .Select(v => string.IsNullOrWhiteSpace(v.NumeroFactura) ? $"FAC-{v.Id:D6}" : v.NumeroFactura)
                .Distinct()
                .Count();
            var totalProductosVendidos = ventas.Sum(v => v.Cantidad);
            var totalFacturado = ventas.Sum(v => v.Total);
            var promedioPorFactura = totalFacturas > 0 ? totalFacturado / totalFacturas : 0;
            var productosPorId = productos.ToDictionary(p => p.Id);

            var productosMasVendidos = ventas
                .GroupBy(v => v.ProductoId)
                .Select(grupo =>
                {
                    productosPorId.TryGetValue(grupo.Key, out var producto);

                    return new ReporteProductoVendido
                    {
                        Producto = producto?.Nombre ?? $"Producto {grupo.Key}",
                        Presentacion = producto != null
                            ? $"{producto.PresentacionVenta} x{producto.UnidadesPorPresentacion}"
                            : "Sin presentacion",
                        CantidadVendida = grupo.Sum(v => v.Cantidad),
                        TotalFacturado = grupo.Sum(v => v.Total)
                    };
                })
                .OrderByDescending(producto => producto.CantidadVendida)
                .Take(5)
                .ToList();

            var clientesConMasCompras = ventas
                .GroupBy(v => string.IsNullOrWhiteSpace(v.Cliente) ? "Consumidor final" : v.Cliente)
                .Select(grupo => new ReporteClienteVenta
                {
                    Cliente = grupo.Key,
                    Facturas = grupo
                        .Select(v => string.IsNullOrWhiteSpace(v.NumeroFactura) ? $"FAC-{v.Id:D6}" : v.NumeroFactura)
                        .Distinct()
                        .Count(),
                    TotalFacturado = grupo.Sum(v => v.Total)
                })
                .OrderByDescending(cliente => cliente.TotalFacturado)
                .Take(5)
                .ToList();

            var ventasPorDia = ventas
                .GroupBy(v => v.Fecha.Date)
                .Select(grupo => new ReporteVentaDiaria
                {
                    Fecha = grupo.Key,
                    Facturas = grupo
                        .Select(v => string.IsNullOrWhiteSpace(v.NumeroFactura) ? $"FAC-{v.Id:D6}" : v.NumeroFactura)
                        .Distinct()
                        .Count(),
                    TotalFacturado = grupo.Sum(v => v.Total)
                })
                .OrderByDescending(venta => venta.Fecha)
                .Take(7)
                .ToList();

            var reporte = new ReporteGeneral
            {
                TotalUsuarios = totalUsuarios,
                TotalProductos = totalProductos,
                TotalLotes = totalLotes,
                TotalLotesProximosAVencer = totalLotesProximosAVencer,
                GananciaPotencialTotal = gananciaPotencialTotal,
                TotalFacturas = totalFacturas,
                TotalProductosVendidos = totalProductosVendidos,
                TotalFacturado = totalFacturado,
                PromedioPorFactura = promedioPorFactura,
                FechaInicioVentas = inicioVentas,
                FechaFinVentas = fechaFin?.Date,
                ProductosMasVendidos = productosMasVendidos,
                ClientesConMasCompras = clientesConMasCompras,
                VentasPorDia = ventasPorDia
            };

            return Ok(reporte);
        }
    }
}
