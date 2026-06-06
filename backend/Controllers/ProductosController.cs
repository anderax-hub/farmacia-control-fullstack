using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FarmaciaControlAPI.Datos;
using FarmaciaControlAPI.Modelos;
using System.Linq;

namespace FarmaciaControlAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductosController : ControllerBase
    {
        private static readonly string[] PresentacionesPermitidas =
        {
            "Unidad",
            "Blister",
            "Caja",
            "Frasco",
            "Tubo",
            "Sobre",
            "Ampolla",
            "Bolsa"
        };

        private readonly ContextoBD _contexto;

        public ProductosController(ContextoBD contexto)
        {
            _contexto = contexto;
        }

        [HttpGet]
        public async Task<ActionResult<List<Producto>>> ObtenerProductos()
        {
            var productos = await _contexto.Productos.ToListAsync();
            return Ok(productos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Producto>> ObtenerProducto(int id)
        {
            var producto = await _contexto.Productos.FindAsync(id);

            if (producto == null)
            {
                return NotFound("Producto no encontrado");
            }

            return Ok(producto);
        }

        [HttpPost]
        public async Task<ActionResult<Producto>> CrearProducto(Producto producto)
        {
            var errorValidacion = await ValidarProducto(producto);

            if (errorValidacion != null)
            {
                return BadRequest(errorValidacion);
            }

            _contexto.Productos.Add(producto);
            await _contexto.SaveChangesAsync();

            return Ok(producto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Producto>> ActualizarProducto(int id, Producto productoActualizado)
        {
            var producto = await _contexto.Productos.FindAsync(id);

            if (producto == null)
            {
                return NotFound("Producto no encontrado");
            }

            var errorValidacion = await ValidarProducto(productoActualizado, id);

            if (errorValidacion != null)
            {
                return BadRequest(errorValidacion);
            }

            producto.Nombre = productoActualizado.Nombre;
            producto.Categoria = productoActualizado.Categoria;
            producto.Costo = productoActualizado.Costo;
            producto.Precio = productoActualizado.Precio;
            producto.Cantidad = productoActualizado.Cantidad;
            producto.PresentacionVenta = productoActualizado.PresentacionVenta;
            producto.UnidadesPorPresentacion = productoActualizado.UnidadesPorPresentacion;
            producto.Proveedor = productoActualizado.Proveedor;

            await _contexto.SaveChangesAsync();

            return Ok(producto);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> EliminarProducto(int id)
        {
            var producto = await _contexto.Productos.FindAsync(id);

            if (producto == null)
            {
                return NotFound("Producto no encontrado");
            }

            _contexto.Productos.Remove(producto);

            try
            {
                await _contexto.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return BadRequest("No se puede eliminar un producto con ventas o lotes asociados");
            }

            return NoContent();
        }

        [HttpGet("rentabilidad")]
        public async Task<ActionResult<List<RentabilidadProducto>>> ObtenerRentabilidad()
        {
            var productos = await _contexto.Productos.ToListAsync();

            var resultado = productos.Select(p => new RentabilidadProducto
            {
                Id = p.Id,
                Nombre = p.Nombre,
                Categoria = p.Categoria,
                Costo = p.Costo,
                Precio = p.Precio,
                GananciaUnidad = p.Precio - p.Costo,
                Cantidad = p.Cantidad,
                GananciaPotencial = (p.Precio - p.Costo) * p.Cantidad
            }).ToList();

            return Ok(resultado);
        }

        private async Task<string?> ValidarProducto(Producto producto, int? productoId = null)
        {
            producto.Nombre = producto.Nombre.Trim();
            producto.Categoria = producto.Categoria.Trim();
            producto.PresentacionVenta = NormalizarPresentacion(producto.PresentacionVenta);
            producto.Proveedor = producto.Proveedor.Trim();

            if (string.IsNullOrWhiteSpace(producto.Nombre) ||
                string.IsNullOrWhiteSpace(producto.Categoria) ||
                string.IsNullOrWhiteSpace(producto.PresentacionVenta) ||
                string.IsNullOrWhiteSpace(producto.Proveedor))
            {
                return "Nombre, categoria, presentacion y proveedor son obligatorios";
            }

            if (producto.Costo < 0 || producto.Precio < 0 || producto.Cantidad < 0)
            {
                return "Costo, precio y cantidad no pueden ser negativos";
            }

            if (producto.UnidadesPorPresentacion < 1)
            {
                return "Las unidades por presentacion deben ser mayores a cero";
            }

            if (!PresentacionesPermitidas.Contains(producto.PresentacionVenta))
            {
                return $"Presentacion de venta invalida. Usa: {string.Join(", ", PresentacionesPermitidas)}";
            }

            if (producto.Precio < producto.Costo)
            {
                return "El precio no puede ser menor que el costo";
            }

            var existeDuplicado = await _contexto.Productos.AnyAsync(p =>
                p.Id != productoId &&
                p.Nombre.ToLower() == producto.Nombre.ToLower() &&
                p.PresentacionVenta.ToLower() == producto.PresentacionVenta.ToLower() &&
                p.Proveedor.ToLower() == producto.Proveedor.ToLower());

            if (existeDuplicado)
            {
                return "Ya existe un producto con ese nombre, presentacion y proveedor";
            }

            return null;
        }

        private static string NormalizarPresentacion(string presentacion)
        {
            var valor = presentacion?.Trim();

            if (string.IsNullOrWhiteSpace(valor))
            {
                return "Unidad";
            }

            return PresentacionesPermitidas.FirstOrDefault(p =>
                p.Equals(valor, StringComparison.OrdinalIgnoreCase)) ?? valor;
        }

    }
}
