using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FarmaciaControlAPI.Modelos
{
    [Table("productos")]
    public class Producto
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Column("categoria")]
        public string Categoria { get; set; } = string.Empty;

        [Column("costo")]
        public decimal Costo { get; set; }

        [Column("precio")]
        public decimal Precio { get; set; }

        [Column("cantidad")]
        public int Cantidad { get; set; }

        [Column("presentacion_venta")]
        public string PresentacionVenta { get; set; } = "Unidad";

        [Column("unidades_por_presentacion")]
        public int UnidadesPorPresentacion { get; set; } = 1;

        [Column("proveedor")]
        public string Proveedor { get; set; } = string.Empty;
    }
}
