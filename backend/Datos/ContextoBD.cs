using Microsoft.EntityFrameworkCore;
using FarmaciaControlAPI.Modelos;

namespace FarmaciaControlAPI.Datos
{
    public class ContextoBD : DbContext
    {
        public ContextoBD(DbContextOptions<ContextoBD> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Lote> Lotes { get; set; }
        public DbSet<Venta> Ventas { get; set; }
    }
}