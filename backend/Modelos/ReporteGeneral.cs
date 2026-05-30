namespace FarmaciaControlAPI.Modelos
{
    public class ReporteGeneral
    {
        public int TotalUsuarios { get; set; }
        public int TotalProductos { get; set; }
        public int TotalLotes { get; set; }
        public int TotalLotesProximosAVencer { get; set; }
        public decimal GananciaPotencialTotal { get; set; }
        public int TotalFacturas { get; set; }
        public int TotalProductosVendidos { get; set; }
        public decimal TotalFacturado { get; set; }
        public decimal PromedioPorFactura { get; set; }
        public DateTime? FechaInicioVentas { get; set; }
        public DateTime? FechaFinVentas { get; set; }
        public List<ReporteProductoVendido> ProductosMasVendidos { get; set; } = new();
        public List<ReporteClienteVenta> ClientesConMasCompras { get; set; } = new();
        public List<ReporteVentaDiaria> VentasPorDia { get; set; } = new();
    }

    public class ReporteProductoVendido
    {
        public string Producto { get; set; } = string.Empty;
        public string Presentacion { get; set; } = string.Empty;
        public int CantidadVendida { get; set; }
        public decimal TotalFacturado { get; set; }
    }

    public class ReporteClienteVenta
    {
        public string Cliente { get; set; } = string.Empty;
        public int Facturas { get; set; }
        public decimal TotalFacturado { get; set; }
    }

    public class ReporteVentaDiaria
    {
        public DateTime Fecha { get; set; }
        public int Facturas { get; set; }
        public decimal TotalFacturado { get; set; }
    }
}
