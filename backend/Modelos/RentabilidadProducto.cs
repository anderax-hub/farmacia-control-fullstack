namespace FarmaciaControlAPI.Modelos
{
    public class RentabilidadProducto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Categoria { get; set; } = string.Empty;
        public decimal Costo { get; set; }
        public decimal Precio { get; set; }
        public decimal GananciaUnidad { get; set; }
        public int Cantidad { get; set; }
        public decimal GananciaPotencial { get; set; }
    }
}