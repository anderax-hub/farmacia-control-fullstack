import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './Panel.css'

const API_REPORTES = 'https://localhost:7120/api/Reportes/general'

const formatearMoneda = (valor) => {
  return `Q ${Number(valor || 0).toFixed(2)}`
}

const obtenerIniciales = (nombre = '') => {
  const partes = nombre.trim().split(' ').filter(Boolean)

  if (partes.length === 0) return 'BS'

  return partes
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
}

function Panel() {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const [reporte, setReporte] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const esAdministrador = usuario?.rol === 'Administrador'
  const puedeInventario = esAdministrador || usuario?.rol === 'Inventario'
  const puedeVentas = esAdministrador || usuario?.rol === 'Ventas'

  useEffect(() => {
    const controlador = new AbortController()

    axios
      .get(API_REPORTES, {
        signal: controlador.signal
      })
      .then((respuesta) => {
        setReporte(respuesta.data)
        setError('')
      })
      .catch((errorPeticion) => {
        if (errorPeticion.name !== 'CanceledError') {
          console.error('Error al cargar panel', errorPeticion)
          setError('No se pudo cargar el resumen del sistema')
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      })

    return () => controlador.abort()
  }, [])

  const metricas = useMemo(() => {
    const totalUsuarios = reporte?.totalUsuarios ?? reporte?.TotalUsuarios ?? 0
    const totalProductos = reporte?.totalProductos ?? reporte?.TotalProductos ?? 0
    const totalLotes = reporte?.totalLotes ?? reporte?.TotalLotes ?? 0
    const totalAlertas =
      reporte?.totalLotesProximosAVencer ?? reporte?.TotalLotesProximosAVencer ?? 0
    const gananciaPotencial =
      reporte?.gananciaPotencialTotal ?? reporte?.GananciaPotencialTotal ?? 0

    return [
      {
        etiqueta: 'Productos registrados',
        valor: totalProductos,
        detalle: 'Inventario disponible para consulta',
        tipo: 'productos'
      },
      {
        etiqueta: 'Lotes activos',
        valor: totalLotes,
        detalle: 'Seguimiento de vencimientos',
        tipo: 'lotes'
      },
      {
        etiqueta: 'Alertas por revisar',
        valor: totalAlertas,
        detalle: 'Productos proximos a vencer',
        tipo: 'alertas'
      },
      {
        etiqueta: 'Ganancia potencial',
        valor: formatearMoneda(gananciaPotencial),
        detalle: 'Margen estimado del inventario',
        tipo: 'ganancia'
      },
      {
        etiqueta: 'Usuarios del sistema',
        valor: totalUsuarios,
        detalle: 'Cuentas con acceso configurado',
        tipo: 'usuarios'
      }
    ]
  }, [reporte])

  const modulos = [
    {
      titulo: 'Inventario',
      descripcion: 'Productos, presentaciones, precios y existencias.',
      ruta: '/productos',
      visible: puedeInventario,
      estado: 'Gestion operativa'
    },
    {
      titulo: 'Ventas',
      descripcion: 'Registro de ventas, factura e historial.',
      ruta: '/ventas',
      visible: puedeVentas,
      estado: 'Caja activa'
    },
    {
      titulo: 'Usuarios',
      descripcion: 'Administracion de cuentas y roles.',
      ruta: '/usuarios',
      visible: esAdministrador,
      estado: 'Control administrativo'
    },
    {
      titulo: 'Reportes',
      descripcion: 'Resumen general del desempeno del sistema.',
      ruta: '/reportes',
      visible: esAdministrador,
      estado: 'Analisis'
    },
    {
      titulo: 'Alertas',
      descripcion: 'Revision de productos proximos a vencer.',
      ruta: '/alertas',
      visible: puedeInventario,
      estado: 'Revision pendiente'
    },
    {
      titulo: 'Rentabilidad',
      descripcion: 'Ganancia por producto y potencial del inventario.',
      ruta: '/rentabilidad',
      visible: puedeInventario,
      estado: 'Margenes'
    }
  ].filter((modulo) => modulo.visible)

  return (
    <main className="panel">
      <section className="panel-encabezado">
        <div>
          <span className="panel-eyebrow">Botica Salud</span>
          <h1>Centro de control</h1>
          <p>
            Vista operativa para consultar inventario, ventas, alertas y actividad general.
          </p>
        </div>

        <aside className="panel-usuario">
          <div className="usuario-avatar">{obtenerIniciales(usuario?.nombre)}</div>
          <div>
            <span>Sesion actual</span>
            <strong>{usuario?.nombre || 'Administrador'}</strong>
            <small>{usuario?.rol || 'Administrador'}</small>
          </div>
        </aside>
      </section>

      {error && <p className="panel-alerta">{error}</p>}

      <section className="panel-metricas" aria-label="Resumen del sistema">
        {metricas.map((metrica) => (
          <article className={`panel-metrica ${metrica.tipo}`} key={metrica.etiqueta}>
            <span>{metrica.etiqueta}</span>
            <strong>{cargando ? '...' : metrica.valor}</strong>
            <p>{metrica.detalle}</p>
          </article>
        ))}
      </section>

      <section className="panel-contenido">
        <div className="panel-modulos">
          <div className="panel-seccion-titulo">
            <div>
              <span>Modulos disponibles</span>
              <h2>Accesos principales</h2>
            </div>
          </div>

          <div className="panel-modulos-grid">
            {modulos.map((modulo) => (
              <Link className="panel-modulo" to={modulo.ruta} key={modulo.titulo}>
                <div>
                  <span>{modulo.estado}</span>
                  <h3>{modulo.titulo}</h3>
                  <p>{modulo.descripcion}</p>
                </div>
                <strong>Entrar</strong>
              </Link>
            ))}
          </div>
        </div>

        <aside className="panel-estado">
          <span>Estado operativo</span>
          <h2>{cargando ? 'Sincronizando datos' : 'Sistema listo'}</h2>
          <p>
            Los datos del panel se actualizan desde el resumen general del backend.
          </p>

          <div className="estado-lista">
            <div>
              <span className="estado-punto activo" />
              <strong>Inventario conectado</strong>
            </div>
            <div>
              <span className="estado-punto activo" />
              <strong>Ventas disponibles</strong>
            </div>
            <div>
              <span className={`estado-punto ${error ? 'alerta' : 'activo'}`} />
              <strong>{error ? 'Resumen pendiente' : 'Reportes sincronizados'}</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default Panel
