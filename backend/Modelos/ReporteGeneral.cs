namespace FarmaciaControlAPI.Modelos
{
    public class ReporteGeneral
    {
        public int TotalUsuarios { get; set; }
        public int TotalProductos { get; set; }
        public int TotalLotes { get; set; }
        public int TotalLotesProximosAVencer { get; set; }
        public decimal GananciaPotencialTotal { get; set; }
    }
}