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
        public async Task<ActionResult> ObtenerVentas()
        {
            var ventasBase = await (
                from venta in _contexto.Ventas
                join producto in _contexto.Productos on venta.ProductoId equals producto.Id into productosVenta
                from producto in productosVenta.DefaultIfEmpty()
                orderby venta.Fecha descending
                select new
                {
                    venta.Id,
                    venta.NumeroFactura,
                    venta.ProductoId,
                    venta.Cliente,
                    ProductoNombre = producto != null ? producto.Nombre : "Producto no disponible",
                    Categoria = producto != null ? producto.Categoria : "",
                    PresentacionVenta = producto != null ? producto.PresentacionVenta : "Sin presentacion",
                    UnidadesPorPresentacion = producto != null ? producto.UnidadesPorPresentacion : 1,
                    venta.Fecha,
                    venta.Cantidad,
                    venta.PrecioUnitario,
                    venta.Total
                }
            ).ToListAsync();

            var ventas = ventasBase.Select(venta => new
            {
                venta.Id,
                NumeroFactura = string.IsNullOrWhiteSpace(venta.NumeroFactura)
                    ? CrearNumeroFactura(venta.Id)
                    : venta.NumeroFactura,
                venta.ProductoId,
                Cliente = NormalizarCliente(venta.Cliente),
                TipoCliente = "Consumidor final",
                venta.ProductoNombre,
                venta.Categoria,
                venta.PresentacionVenta,
                venta.UnidadesPorPresentacion,
                venta.Fecha,
                venta.Cantidad,
                venta.PrecioUnitario,
                venta.Total
            }).ToList();

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

            if (venta.Cantidad <= 0)
            {
                return BadRequest("La cantidad debe ser mayor a cero");
            }

            if (producto.Cantidad < venta.Cantidad)
            {
                return BadRequest("No hay suficiente stock disponible");
            }

            venta.Cliente = NormalizarCliente(venta.Cliente);
            venta.Fecha = DateTime.Now;
            venta.PrecioUnitario = producto.Precio;
            venta.Total = producto.Precio * venta.Cantidad;

            producto.Cantidad -= venta.Cantidad;

            _contexto.Ventas.Add(venta);
            await _contexto.SaveChangesAsync();

            venta.NumeroFactura = CrearNumeroFactura(venta.Id);
            await _contexto.SaveChangesAsync();

            return Ok(CrearRespuestaFactura(
                venta.NumeroFactura,
                venta.Cliente,
                venta.Fecha,
                new List<DetalleFacturaRespuesta>
                {
                    CrearDetalleFactura(venta, producto)
                }));
        }

        [HttpPost("factura")]
        public async Task<ActionResult> RegistrarFactura(RegistrarFacturaRequest factura)
        {
            if (factura.Productos == null || factura.Productos.Count == 0)
            {
                return BadRequest("Agrega al menos un producto a la factura");
            }

            var items = factura.Productos
                .GroupBy(item => item.ProductoId)
                .Select(grupo => new ItemFacturaRequest
                {
                    ProductoId = grupo.Key,
                    Cantidad = grupo.Sum(item => item.Cantidad)
                })
                .ToList();

            if (items.Any(item => item.Cantidad <= 0))
            {
                return BadRequest("Todas las cantidades deben ser mayores a cero");
            }

            var productoIds = items.Select(item => item.ProductoId).ToList();
            var productos = await _contexto.Productos
                .Where(producto => productoIds.Contains(producto.Id))
                .ToDictionaryAsync(producto => producto.Id);

            if (productos.Count != productoIds.Count)
            {
                return NotFound("Uno o mas productos no fueron encontrados");
            }

            foreach (var item in items)
            {
                var producto = productos[item.ProductoId];

                if (producto.Cantidad < item.Cantidad)
                {
                    return BadRequest($"No hay suficiente stock disponible para {producto.Nombre} - {producto.PresentacionVenta}");
                }
            }

            var cliente = NormalizarCliente(factura.Cliente);
            var fecha = DateTime.Now;
            var ventasRegistradas = new List<(Venta Venta, Producto Producto)>();

            using var transaccion = await _contexto.Database.BeginTransactionAsync();

            foreach (var item in items)
            {
                var producto = productos[item.ProductoId];
                var venta = new Venta
                {
                    ProductoId = producto.Id,
                    Cliente = cliente,
                    Fecha = fecha,
                    Cantidad = item.Cantidad,
                    PrecioUnitario = producto.Precio,
                    Total = producto.Precio * item.Cantidad
                };

                producto.Cantidad -= item.Cantidad;
                _contexto.Ventas.Add(venta);
                ventasRegistradas.Add((venta, producto));
            }

            await _contexto.SaveChangesAsync();

            var numeroFactura = CrearNumeroFactura(ventasRegistradas.Min(registro => registro.Venta.Id));

            foreach (var registro in ventasRegistradas)
            {
                registro.Venta.NumeroFactura = numeroFactura;
            }

            await _contexto.SaveChangesAsync();
            await transaccion.CommitAsync();

            return Ok(CrearRespuestaFactura(
                numeroFactura,
                cliente,
                fecha,
                ventasRegistradas
                    .Select(registro => CrearDetalleFactura(registro.Venta, registro.Producto))
                    .ToList()));
        }

        private static string CrearNumeroFactura(int ventaId)
        {
            return $"FAC-{ventaId:D6}";
        }

        private static string NormalizarCliente(string? cliente)
        {
            return string.IsNullOrWhiteSpace(cliente) ? "Consumidor final" : cliente.Trim();
        }

        private static DetalleFacturaRespuesta CrearDetalleFactura(Venta venta, Producto producto)
        {
            return new DetalleFacturaRespuesta
            {
                Id = venta.Id,
                ProductoId = venta.ProductoId,
                ProductoNombre = producto.Nombre,
                Categoria = producto.Categoria,
                PresentacionVenta = producto.PresentacionVenta,
                UnidadesPorPresentacion = producto.UnidadesPorPresentacion,
                Cantidad = venta.Cantidad,
                PrecioUnitario = venta.PrecioUnitario,
                Total = venta.Total
            };
        }

        private static object CrearRespuestaFactura(
            string numeroFactura,
            string cliente,
            DateTime fecha,
            List<DetalleFacturaRespuesta> detalles)
        {
            return new
            {
                NumeroFactura = numeroFactura,
                Cliente = cliente,
                TipoCliente = "Consumidor final",
                Fecha = fecha,
                Detalles = detalles,
                Total = detalles.Sum(detalle => detalle.Total)
            };
        }
    }

    public class RegistrarFacturaRequest
    {
        public string Cliente { get; set; } = "Consumidor final";
        public List<ItemFacturaRequest> Productos { get; set; } = new();
    }

    public class ItemFacturaRequest
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
    }

    public class DetalleFacturaRespuesta
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        public string ProductoNombre { get; set; } = string.Empty;
        public string Categoria { get; set; } = string.Empty;
        public string PresentacionVenta { get; set; } = string.Empty;
        public int UnidadesPorPresentacion { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Total { get; set; }
    }
}
