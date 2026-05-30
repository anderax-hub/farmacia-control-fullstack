using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FarmaciaControlAPI.Modelos
{
    [Table("ventas")]
    public class Venta
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("producto_id")]
        public int ProductoId { get; set; }

        [Column("cliente")]
        public string Cliente { get; set; } = "Consumidor final";

        [Column("numero_factura")]
        public string NumeroFactura { get; set; } = string.Empty;

        [Column("fecha")]
        public DateTime Fecha { get; set; }

        [Column("cantidad")]
        public int Cantidad { get; set; }

        [Column("precio_unitario")]
        public decimal PrecioUnitario { get; set; }

        [Column("total")]
        public decimal Total { get; set; }
    }
}
